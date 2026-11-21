import { useRef, useState } from 'react';

export default function HoldButtonPuzzle({ onSuccess, onFail }) {
  const [progress, setProgress] = useState(0);
  const timer = useRef(null);
  const start = () => {
    clearInterval(timer.current);
    timer.current = setInterval(() => setProgress((value) => {
      const next = value + 1;
      if (next >= 100) {
        clearInterval(timer.current);
        onSuccess();
      }
      return Math.min(next, 100);
    }), 100);
  };
  const stop = (message = false) => {
    clearInterval(timer.current);
    setProgress(0);
    if (message) onFail('Lifted? Movement detected. Human interrupted.');
  };
  return <div className="cap-puzzle"><p>Hold this button for 10 seconds. Do not move.</p><button type="button" className="cap-hold" onPointerDown={start} onPointerUp={() => stop(false)} onPointerLeave={() => stop(true)} onPointerMove={(event) => event.buttons && event.movementX + event.movementY !== 0 && stop(true)}>Hold ({progress}%)</button></div>;
}
