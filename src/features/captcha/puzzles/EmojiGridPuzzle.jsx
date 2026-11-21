import { useState } from 'react';

export default function EmojiGridPuzzle({ onSuccess, onFail }) {
  const [picked, setPicked] = useState([]);
  const jeepneys = [1, 5, 7];
  const items = ['🚌', '🛺', '🚕', '🏍️', '🚙', '🛺', '🚗', '🛺', '🛵'];
  const toggle = (index) => setPicked((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);
  const verify = () => {
    const correct = picked.length === 3 && picked.every((index) => jeepneys.includes(index));
    correct ? onSuccess() : onFail('Suspicious ang imong clicking.');
  };
  return <div className="cap-puzzle"><p>Select all squares with a jeepney 🛺</p><div className="cap-emoji-grid">{items.map((item, index) => <button type="button" key={index} className={picked.includes(index) ? 'cap-selected' : ''} onClick={() => toggle(index)} aria-label={`grid square ${index + 1}`}>{item}</button>)}</div><button className="btn btn-primary" type="button" onClick={verify}>Verify</button></div>;
}
