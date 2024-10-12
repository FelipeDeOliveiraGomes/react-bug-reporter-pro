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
 * Custom hook to record the screen, manage the recording as a downloadable/uploadable video file, and control the object URL lifecycle.
 *
 * @returns {UseScreenRecorderReturn} - An object containing:
 * - `recording`: Boolean indicating if the screen recording is active.
 * - `localVideoUrl`: String URL for the recorded video, allowing for playback, or null if not available.
 * - `startRecording`: Function to initiate the screen recording, with optional audio capture.
 * - `stopRecording`: Function to end the recording and store the video data.
 * - `uploadFile`: Function to upload the recorded video using a custom callback.
 * - `downloadFile`: Function to download the recorded video file.
 * - `revokeUrl`: Function to revoke the object URL to release resources.
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
     * Uploads the recorded video file using a custom callback function.
     * Sends the video data as a FormData object, allowing for various server handling methods.
     *
     * @template T
     * @param {function(FormData): Promise<T>} uploadRequestsFileCallback - Callback function to handle the upload of the video file.
     * @returns {Promise<T>} - Returns the response from the upload callback.
     * @throws {Error} If no video data is available or the callback is missing.
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
     * @throws {Error} If no video URL is available for download.
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
     * Starts recording the screen, with an option to include audio.
     *
     * @param {boolean} [audioEnabled=false] - Whether to include audio in the recording.
     * @throws {Error} If screen or media devices access fails.
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
     * Stops the current recording session and processes the video data.
     *
     * @param {string} [fileName] - Optional file name for the saved video.
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
     * Revokes the object URL associated with the recorded video to free up memory.
     * Cleans up the local video URL after the video is no longer needed.
     *
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
