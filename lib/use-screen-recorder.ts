import { useState, useRef } from 'react'

interface UseScreenRecorderReturn {
    recording: boolean
    videoUrl: string | null
    startRecording: (audioEnabled?: boolean) => void
    stopRecording: () => void
    uploadFile: (uploadUrl: string, fileName: string) => Promise<boolean>
    downloadFile: (fileName: string) => void
    revokeUrl: () => void
}

/**
 * Custom hook to record the screen, upload the recorded video, download it, and manage the object URL.
 *
 * @returns {UseScreenRecorderReturn} - An object containing:
 * - `recording`: A boolean indicating if the recording is in progress.
 * - `videoUrl`: The URL of the recorded video, or null if not available.
 * - `startRecording`: Function to start recording the screen.
 * - `stopRecording`: Function to stop the recording and save the video data.
 * - `uploadFile`: Function to upload the video file to a specified server URL.
 * - `downloadFile`: Function to download the video file to the user's device.
 * - `revokeUrl`: Function to revoke the object URL to release memory.
 */
function useScreenRecorder(): UseScreenRecorderReturn {
    const [recording, setRecording] = useState(false)
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
    const [videoUrl, setVideoUrl] = useState<string | null>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const recordedChunks = useRef<Blob[]>([])
    const [blob, setBlob] = useState<Blob | null>(null)

    /**
     * Uploads the recorded video file to a specified URL.
     *
     * @param {string} uploadUrl - The URL to upload the video file to.
     * @param {string} [fileName=`screen-record-${Date.now()}.webm`] - The name of the file to be uploaded.
     * @returns {Promise<boolean>} - Returns true if the upload was successful, otherwise false.
     */
    const uploadFile = async (
        uploadUrl: string,
        fileName = `screen-record-${Date.now()}.webm`
    ): Promise<boolean> => {
        if (!blob) throw new Error('There is no video recorded yet')

        const formData = new FormData()
        formData.append('file', blob, fileName)

        try {
            const response = await fetch(uploadUrl, {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('error to upload the video')
            }

            return true
        } catch (error) {
            console.error('error to upload the video:', error)
            return false
        }
    }

    /**
     * Downloads the recorded video file to the user's device.
     *
     * @param {string} [fileName=`screen-record-${Date.now()}.webm`] - The name for the downloaded file.
     */
    const downloadFile = (fileName = `screen-record-${Date.now()}.webm`) => {
        if (videoUrl) {
            const a = document.createElement('a')
            a.style.display = 'none'
            a.href = videoUrl
            a.download = fileName
            document.body.appendChild(a)
            a.click()
        }
    }

    /**
     * Revokes the current object URL of the recorded video, releasing associated memory.
     */
    const revokeUrl = () => {
        if (!videoUrl) return
        window.URL.revokeObjectURL(videoUrl)
    }

    /**
     * Starts recording the screen with optional audio.
     *
     * @param {boolean} [audioEnabled=false] - Indicates whether to capture audio along with the screen.
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
                setVideoUrl(url)
            }

            mediaRecorderRef.current.start()
            setRecording(true)
        } catch (error) {
            console.error('Error to access screen:', error)
        }
    }

    /**
     * Stops the current screen recording and releases the media stream resources.
     */
    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop()
            setRecording(false)

            if (mediaStream) {
                mediaStream.getTracks().forEach((track) => track.stop())
            }
            setMediaStream(null)
        }
    }

    return {
        recording,
        videoUrl,
        startRecording,
        stopRecording,
        uploadFile,
        revokeUrl,
        downloadFile,
    }
}

export default useScreenRecorder
