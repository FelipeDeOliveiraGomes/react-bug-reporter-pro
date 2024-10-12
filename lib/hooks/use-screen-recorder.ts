import { useState, useRef } from 'react'

interface UseScreenRecorderReturn {
    recording: boolean
    localVideoUrl: string | null
    startRecording: (audioEnabled?: boolean) => void
    stopRecording: (fileName?: string) => void
    downloadFile: () => void
    uploadFile: <T>(
        uploadRequestsFileCallback: <T>(fileEncoded: FormData) => Promise<T>
    ) => Promise<T>
    revokeUrl: () => void
}

/**
 * Custom hook to record the screen, upload the recorded video, download it, and manage the object URL.
 *
 * @returns {UseScreenRecorderReturn} - An object containing:
 * - `recording`: A boolean indicating if the recording is in progress.
 * - `localVideoUrl`: The local URL of the recorded video to allow preview, or null if not available.
 * - `startRecording`: Function to start recording the screen.
 * - `stopRecording`: Function to stop the recording and save the video data.
 * - `uploadFile`: Function to upload the video file to a specified server URL or using a custom HTTP client.
 * - `downloadFile`: Function to download the video file to the user's device.
 * - `revokeUrl`: Function to revoke the object URL to release memory.
 */
function useScreenRecorder(): UseScreenRecorderReturn {
    const [recording, setRecording] = useState(false)
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
    const [localVideoUrl, setlocalVideoUrl] = useState<string | null>(null)
    const [fileNameState, setFileNameState] = useState('')
    const [blob, setBlob] = useState<Blob | null>(null)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const recordedChunks = useRef<Blob[]>([])

    const makeTimeStampedFileName = () => {
        return `screen-record-${Date.now()}.webm`
    }

    /**
     * Uploads the recorded video file to a specified URL or using a custom HTTP client.
     *
     * @template T
     * @param {UploadVideoParams<T>} params - The parameters for uploading the video.
     * @param {string} [params.uploadUrl] - The URL to upload the video file to.
     * @param {Function} [params.httpClient] - A custom HTTP client to upload the file.
     * @param {string} [params.fileName=`screen-record-${Date.now()}.webm`] - The name of the file to be uploaded.
     * @returns {Promise<boolean | T>} - Returns true if the upload was successful or the result of the custom HTTP client.
     * @throws {Error} If there is no video recorded yet, or if the upload URL is missing when no HTTP client is provided.
     */
    const uploadFile = async <T>(
        uploadRequestsFileCallback: <T>(fileEncoded: FormData) => Promise<T>
    ): Promise<T> => {
        if (!blob) throw new Error('There is no video recorded yet')
        if (!uploadRequestsFileCallback) {
            throw new Error('Missing upload callback')
        }

        const formData = new FormData()
        formData.append('file', blob, fileNameState)
        return uploadRequestsFileCallback(formData)
    }

    /**
     * Downloads the recorded video file to the user's device.
     *
     * @throws {Error} If there is no video URL available for download.
     */
    const downloadFile = () => {
        if (!localVideoUrl) {
            throw new Error('There is no video URL available for download')
        }

        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = localVideoUrl
        a.download = fileNameState
        document.body.appendChild(a)
        a.click()
    }

    /**
     * Starts recording the screen with optional audio.
     *
     * @param {boolean} [audioEnabled=false] - Indicates whether to capture audio along with the screen.
     * @throws {Error} If there is an issue accessing the screen or media devices.
     */
    const startRecording = async (audioEnabled = false) => {
        if (recording) return

        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: audioEnabled,
            })

            setMediaStream(stream)
            mediaRecorderRef.current = new MediaRecorder(stream)
            recordedChunks.current = []

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.current.push(event.data)
                }
            }

            mediaRecorderRef.current.onstop = async () => {
                const newBlob = new Blob(recordedChunks.current, {
                    type: 'video/webm',
                })

                setBlob(newBlob)

                const url = URL.createObjectURL(newBlob)
                setlocalVideoUrl(url)
            }

            mediaRecorderRef.current.start()
            setRecording(true)
        } catch (error) {
            console.error('Error accessing the screen:', error)
        }
    }

    /**
     * Stops the current screen recording and releases the media stream resources.
     */
    const stopRecording = (fileName = makeTimeStampedFileName()) => {
        if (!mediaRecorderRef.current) return

        mediaRecorderRef.current.stop()
        setFileNameState(fileName)
        setRecording(false)

        if (mediaStream) {
            mediaStream.getTracks().forEach((track) => track.stop())
        }

        setMediaStream(null)
    }

    /**
     * Revokes the current object URL of the recorded video, releasing associated memory.
     */
    const revokeUrl = () => {
        if (!localVideoUrl) return
        window.URL.revokeObjectURL(localVideoUrl)
    }

    return {
        recording,
        localVideoUrl,
        startRecording,
        stopRecording,
        uploadFile,
        revokeUrl,
        downloadFile,
    }
}

export default useScreenRecorder
