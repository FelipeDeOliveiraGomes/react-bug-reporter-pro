import { useState, useEffect, useRef } from 'react'
import {
    BrowserHttpRequestListener,
    RequestResponseModel,
} from 'browser-http-request-listener'

interface UseHttpRecorderReturn {
    recording: boolean
    startRecording: () => void
    stopRecording: (fileName?: string) => void
    downloadFile: () => void
    uploadFile: (
        uploadRequestsFileCallback: (fileEncoded: FormData) => Promise<unknown>
    ) => Promise<unknown>
}

/**
 * Custom hook to record HTTP requests, save them as a file, and manage uploading and downloading the recorded log.
 *
 * @returns {UseHttpRecorderReturn} - An object containing:
 * - `recording`: A boolean indicating if the HTTP request recording is active.
 * - `startRecording`: Function to start recording HTTP requests.
 * - `stopRecording`: Function to stop recording and save the requests data.
 * - `uploadFile`: Function to upload the recorded HTTP log using a callback function.
 * - `downloadFile`: Function to download the recorded HTTP log as a text file.
 */
function useHttpRecorder(): UseHttpRecorderReturn {
    const [recording, setRecording] = useState(false)
    const [requests, setRequests] = useState<RequestResponseModel[]>([])
    const [fileNameState, setFileNameState] = useState('')
    const [blob, setBlob] = useState<Blob | null>(null)

    const unblockListeningStateCallback = useRef<CallableFunction | null>(null)

    const makeTimeStampedFileName = () => {
        return `http-requests-log-${Date.now()}.txt`
    }

    /**
     * Starts recording HTTP requests.
     * Initializes the recording state and clears previous log data.
     * Uses BrowserHttpRequestListener to start listening to HTTP requests.
     */
    const startRecording = (): void => {
        if (recording) return
        BrowserHttpRequestListener.start()
        unblockListeningStateCallback.current =
            BrowserHttpRequestListener.blockListeningState()

        setRequests([])
        setBlob(null)
        setRecording(true)
    }

    /**
     * Uploads the recorded HTTP request log using a specified callback function.
     * Sends the recorded data in a FormData object, allowing flexibility for different server implementations.
     *
     * @param {function(FormData): Promise<unknown>} uploadRequestsFileCallback - Callback function to handle the file upload.
     * @returns {Promise<T>} - The response returned by the upload callback.
     * @throws {Error} If there is no recorded data or the callback is not provided.
     */
    const uploadFile = async (
        uploadRequestsFileCallback: (fileEncoded: FormData) => Promise<unknown>
    ): Promise<unknown> => {
        if (!blob) throw new Error('There is no requests recorded yet')
        if (!uploadRequestsFileCallback) {
            throw new Error('Missing upload callback')
        }

        const formData = new FormData()
        formData.append('file', blob, fileNameState)
        return uploadRequestsFileCallback(formData)
    }

    /**
     * Downloads the recorded HTTP request log as a text file.
     *
     * @throws {Error} If there is no recorded data available for download.
     */
    const downloadFile = () => {
        if (!blob) {
            throw new Error('There is no recorded data available for download')
        }

        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = fileNameState
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
    }

    /**
     * Stops recording HTTP requests and saves the recorded log data.
     * Ends the recording session and generates a timestamped filename if one is not provided.
     *
     * @param {string} [fileName] - Optional filename for the log file.
     */
    const stopRecording = (fileName?: string) => {
        if (!recording) return

        unblockListeningStateCallback.current?.()
        BrowserHttpRequestListener.stop()

        if (fileName) fileName += '.txt'

        setRecording(false)
        setFileNameState(fileName || makeTimeStampedFileName())

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

        return () => {
            unblockListeningStateCallback.current?.()
            httpReqListenerUnsubscriber()
        }
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
