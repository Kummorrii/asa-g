import { useState } from 'react';

export default function HumanWordPuzzle({ onSuccess, onFail }) {
  const [tries, setTries] = useState(0);
  const [answer, setAnswer] = useState('');
  const submit = (event) => {
    event.preventDefault();
    const next = tries + 1;
    setTries(next);
    if (next >= 3) onSuccess();
    else onFail(answer.includes('h') ? 'Lagi, di pwede ang letra h.' : 'Word na wala h, third try ni para human.');
  };
  return <form className="cap-puzzle"><p>Type the word <strong>human</strong> without using the letter h</p><input value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="human? suspicious." /><button className="btn btn-primary" type="button" onClick={submit}>Submit ({3 - tries} tries)</button></form>;
}
