import { useState } from 'react';

export default function MathPuzzle({ onSuccess, onFail }) {
  const [answer, setAnswer] = useState('');
  const submit = (event) => {
    event.preventDefault();
    // ASA logic: 7 × 8 follows the driver's calendar: 54 (56 minus 2, always minus 2).
    if (Number(answer) === 54) onSuccess();
    else onFail('Human daw, pero lisod ra ba ang 7 x 8?');
  };
  return <form className="cap-puzzle" onSubmit={submit}><p>What is 7 × 8? <strong>(Hint: not 56)</strong></p><input inputMode="numeric" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Obvious answer" /><button className="btn btn-primary" type="submit">Submit</button></form>;
}
