import { useState, useEffect } from 'react'
import {
    BrowserHttpRequestListener,
    RequestResponseModel,
} from 'browser-http-request-listener'

interface UploadFileParams<T> {
    uploadUrl?: string
    httpClient?: (fileEncoded: FormData) => Promise<T>
    fileName?: string
}

interface UseHttpRecorderReturn {
    recording: boolean
    startRecording: () => void
    stopRecording: () => void
    uploadFile: <T>(params: UploadFileParams<T>) => Promise<boolean | T>
    downloadFile: (fileName?: string) => void
}

/**
 * Custom hook to record HTTP requests, save them as a file, and manage uploading and downloading the recorded log.
 *
 * @returns {UseHttpRecorderReturn} - An object containing:
 * - `recording`: A boolean indicating if the HTTP request recording is active.
 * - `startRecording`: Function to start recording HTTP requests.
 * - `stopRecording`: Function to stop recording and save the requests data.
 * - `uploadFile`: Function to upload the recorded HTTP log to a specified server URL.
 * - `downloadFile`: Function to download the recorded HTTP log as a text file.
 */
function useHttpRecorder(): UseHttpRecorderReturn {
    const [recording, setRecording] = useState(false)
    const [requests, setRequests] = useState<RequestResponseModel[]>([])
    const [blob, setBlob] = useState<Blob | null>(null)

    /**
     * Starts recording HTTP requests.
     */
    const startRecording = () => {
        BrowserHttpRequestListener.start()
        setRequests([])
        setBlob(null)
        setRecording(true)
    }

    /**
     * Uploads the recorded HTTP request log to a specified URL or using a custom HTTP client.
     *
     * @template T
     * @param {UploadFileParams<T>} params - An object containing:
     *   - `uploadUrl` {string} - The URL to upload the file to.
     *   - `httpClient` {function} - Optional custom HTTP client function.
     *   - `fileName` {string} - Optional name for the uploaded file.
     * @returns {Promise<boolean | T>} - Returns true if the upload was successful, or the return value from the custom HTTP client.
     * @throws {Error} If there is no recorded data or if both `uploadUrl` and `httpClient` are not provided.
     */
    const uploadFile = async <T>({
        uploadUrl,
        httpClient,
        fileName = `http-requests-log-${Date.now()}.txt`,
    }: UploadFileParams<T>): Promise<boolean | T> => {
        if (!blob) throw new Error('There is no requests recorded yet')
        if (!uploadUrl && !httpClient)
            throw new Error('Missing upload URL or HTTP client')

        const formData = new FormData()
        formData.append('file', blob, fileName)

        if (httpClient) {
            return httpClient(formData)
        }

        try {
            const response = await fetch(uploadUrl!, {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Error uploading the file')
            }

            return true
        } catch (error) {
            console.error('Error uploading the file:', error)
            return false
        }
    }

    /**
     * Downloads the recorded HTTP request log as a text file.
     *
     * @param {string} [fileName=`http-requests-log-${Date.now()}.txt`] - The name for the downloaded file.
     * @throws {Error} If there is no recorded data available for download.
     */
    const downloadFile = (fileName = `http-requests-log-${Date.now()}.txt`) => {
        if (!blob)
            throw new Error('There is no recorded data available for download')

        const url = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
    }

    /**
     * Stops recording HTTP requests and creates a Blob containing the recorded log data.
     */
    const stopRecording = () => {
        BrowserHttpRequestListener.stop()
        setRecording(false)

        if (requests.length > 0) {
            const fileContent = requests
                .map((req) => JSON.stringify(req))
                .join('\n\n')

            setBlob(new Blob([fileContent], { type: 'text/plain' }))
        }
    }

    useEffect(() => {
        const httpReqListenerUnsubscriber =
            BrowserHttpRequestListener.onHttpResponseArrives((req) => {
                setRequests((prev) => [...prev, req])
            })

        return httpReqListenerUnsubscriber
    }, [])

    return {
        recording,
        startRecording,
        stopRecording,
        downloadFile,
        uploadFile,
    }
}

export default useHttpRecorder
