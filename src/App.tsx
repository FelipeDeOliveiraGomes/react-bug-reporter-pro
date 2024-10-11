import { useState } from 'react'
import { useHttpRecorder, useScreenRecorder } from '../lib'

const App: React.FC = () => {
    const [counter, setCounter] = useState(0)

    const screenRec = useScreenRecorder()
    const requestRec = useHttpRecorder()

    return (
        <section>
            {screenRec.videoUrl ? (
                <video controls src={screenRec.videoUrl} />
            ) : null}
            <button
                onClick={() => {
                    requestRec.startRecording()
                    screenRec.startRecording()
                }}
            >
                Start
            </button>
            <button
                onClick={() => {
                    requestRec.stopRecording()
                    screenRec.stopRecording()
                }}
            >
                Stop
            </button>
            <button onClick={() => setCounter(counter + 1)}>
                Increment counter
            </button>
            <div>{counter}</div>
        </section>
    )
}

export default App
