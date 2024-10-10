import { useState } from "react";
import useScreenRecorder from "./use-screen-recorder";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  const { startRecording, stopRecording } = useScreenRecorder();

  return (
    <div>
      <button onClick={() => startRecording()}>Start</button>
      <button onClick={() => stopRecording()}>Stop</button>
      <button
        onClick={() => {
          setCount((prev) => ++prev);
        }}
      >
        increment count
      </button>
      <span>Count: {count}</span>
    </div>
  );
}

export default App;
