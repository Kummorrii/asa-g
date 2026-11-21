import { useState } from 'react';

const words = ['lakaw', 'sikad', 'dalan', 'manok', 'sakay', 'hunong', 'liko', 'tabok'];

export default function DistortedTextPuzzle({ onSuccess, onFail }) {
  const [answer, setAnswer] = useState('');
  const [expected] = useState(() => words[Math.floor(Math.random() * words.length)]);
  const submit = (event) => {
    event.preventDefault();
    answer.trim().toLowerCase() === expected.toLowerCase() ? onSuccess() : onFail('Robot gyud ka, ayaw pag-deny.');
  };
  return (
    <form className="cap-puzzle cap-distorted" onSubmit={submit}>
      <p>Type the word shown. Ayaw kabalaka, klaro ra ni.</p>
      <div className="cap-distorted-word" aria-label={`word: ${expected}`}>
        <span aria-hidden="true">{expected}</span>
      </div>
      <input value={answer} onChange={(event) => setAnswer(event.target.value)} autoComplete="off" placeholder="Type here" />
      <button className="btn btn-primary" type="submit">Confirm</button>
    </form>
  );
}
