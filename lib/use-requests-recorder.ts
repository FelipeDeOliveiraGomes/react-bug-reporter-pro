import { useState, useEffect } from 'react'
import {
    BrowserHttpRequestListener,
    RequestResponseModel,
} from 'browser-http-request-listener'

interface UseHttpRecorderReturn {
    recording: boolean
    startRecording: () => void
    stopRecording: () => void
}

function useHttpRecorder(): UseHttpRecorderReturn {
    const [recording, setRecording] = useState(false)
    const [requests, setRequests] = useState<RequestResponseModel[]>([])

    const startRecording = () => {
        setRequests([])
        BrowserHttpRequestListener.start()
        setRecording(true)
    }

    const stopRecording = () => {
        BrowserHttpRequestListener.stop()
        setRecording(false)

        if (requests.length > 0) {
            const fileContent = requests
                .map((req) => JSON.stringify(req))
                .join('\n')
            const blob = new Blob([fileContent], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.style.display = 'none'
            a.href = url
            a.download = 'http-requests-log.txt'
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
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
    }
}

export default useHttpRecorder
