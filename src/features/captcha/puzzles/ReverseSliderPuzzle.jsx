import { useState } from 'react';

export default function ReverseSliderPuzzle({ onSuccess, onFail }) {
  const [value, setValue] = useState(50);
  const change = (event) => {
    const raw = Number(event.target.value);
    setValue(Math.max(0, Math.min(100, 100 - raw + 4)));
  };
  const verify = () => value >= 92 ? onSuccess() : onFail('Ang slider kay galibog, pero ikaw pud.');
  return <div className="cap-puzzle"><p>Drag to verify you're human</p><input className="cap-slider" type="range" min="0" max="100" value={100 - value + 4} onChange={change} /><div className="cap-slider-label">Verification: {value}% (handle likes to argue)</div><button className="btn btn-primary" type="button" onClick={verify}>Verify</button></div>;
}
