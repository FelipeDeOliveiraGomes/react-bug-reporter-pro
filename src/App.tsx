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
                description={description}
                setDescription={setDescription}
                allowDownloadFiles={true}
                audioEnabled={true}
            />
        </>
    )
}

export default App
