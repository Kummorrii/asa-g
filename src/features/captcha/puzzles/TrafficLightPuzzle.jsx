import { useState } from 'react';

export default function TrafficLightPuzzle({ onSuccess, onFail }) {
  const [answer, setAnswer] = useState('');
  const submit = (event) => {
    event.preventDefault();
    if (answer.trim().toLowerCase() === 'green') onSuccess();
    else onFail('Robot gyud ka, ayaw pag-deny.');
  };
  return (
    <form className="cap-puzzle" onSubmit={submit}>
      <p>When should the jeepney go?</p>
      <div className="cap-traf-light">
        <i />
        <i />
        <b />
      </div>
      <input
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        placeholder="red / yellow / green"
      />
      <button className="btn btn-primary" type="submit">
        Go
      </button>
    </form>
  );
}
