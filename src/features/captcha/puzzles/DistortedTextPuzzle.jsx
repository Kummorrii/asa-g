import { useState } from 'react';

export default function DistortedTextPuzzle({ onSuccess, onFail }) {
  const [answer, setAnswer] = useState('');
  const expected = 'saGara';
  const submit = (event) => {
    event.preventEvent?.();
    event.preventDefault();
    answer.trim().toLowerCase() === expected.toLowerCase() ? onSuccess() : onFail('Robot gyud ka, ayaw pag-deny.');
  };
  return <form className="cap-puzzle cap-distorted" onSubmit={submit}><p>Type the wobbly word</p><div className="cap-distorted-word" aria-label="wobbly word"><svg width="230" height="78" viewBox="0 0 230 78"><path d="M8 43 C30 10, 50 70, 72 30 S112 62, 132 25 S180 64, 222 30" fill="none" stroke="rgba(255,255,255,.35)"/><text x="115" y="55" textAnchor="middle">saGara</text></svg></div><input value={answer} onChange={(event) => setAnswer(event.target.value)} autoComplete="off" placeholder="Type here" /><button className="btn btn-primary" type="submit">Confirm</button></form>;
}
