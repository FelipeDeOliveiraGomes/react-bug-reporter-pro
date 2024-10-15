import React, { useState } from 'react'
import { ReactBugReporterProWrapper } from '../lib'
import './styles.css'

const App: React.FC = () => {
    const [counter, setCounter] = useState(0)
    const [description, setDescription] = useState('')

    const getTodos = async () => {
        try {
            await fetch('https://jsonplaceholder.typicode.com/todos/1')
                .then((response) => response.json())
                .then((json) => console.log(json))
        } catch (error) {
            console.log({
                error,
            })
        }
    }

    return (
        <>
            <section className="counter">
                <div className="counter__inner-container">
                    <span className="counter__display">{counter}</span>
                    <div className="counter__actions">
                        <button
                            onClick={() => setCounter((prev) => prev + 1)}
                            className="counter__btn"
                        >
                            + Increment
                        </button>
                        <button
                            onClick={() => setCounter((prev) => prev - 1)}
                            className="counter__btn"
                        >
                            - Decrement
                        </button>
                        <button
                            onClick={() => setCounter(0)}
                            className="counter__btn"
                        >
                            Reset
                        </button>
                        <button onClick={getTodos} className="counter__btn">
                            Do http call
                        </button>
                    </div>
                </div>
            </section>
            <ReactBugReporterProWrapper
                allowDownloadFiles={true}
                audioEnabled={true}
                description={{
                    onValueChange: setDescription,
                    value: description,
                }}
                uploadFiles={{
                    uploadVideoCallback: () => Promise.resolve('Bar' as const),
                    uploadRequestFileCallback: () => {
                        return Promise.resolve('Foo' as const)
                    },
                }}
                onFileUploaded={({
                    requestsFileUploadResult,
                    videoUploadResult,
                }) => {
                    console.log({
                        requestsFileUploadResult,
                        videoUploadResult,
                    })

                    return Promise.resolve()
                }}
            />
        </>
    )
}

export default App
