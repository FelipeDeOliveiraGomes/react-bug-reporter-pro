import React, { useState } from 'react'
import { ReactBugReporterProWrapper } from '../lib'
import './styles.css'

const App: React.FC = () => {
    const [counter, setCounter] = useState(0)

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
                    </div>
                </div>
            </section>
            <ReactBugReporterProWrapper />
        </>
    )
}

export default App
