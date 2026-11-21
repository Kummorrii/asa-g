import { useState } from 'react';

export default function NotAButtonPuzzle({ onSuccess, onFail }) {
  const [look, setLook] = useState(0);
  const clickFake = () => onFail('Sige click sa butang, butang sad ka?');
  const verifyDiv = () => onSuccess();
  return <div className="cap-puzzle"><p>Click the button that is NOT a button</p><div className="cap-button-row">{[0,1,2,3].map((item) => <button type="button" key={item} className="btn" onClick={clickFake}>Definitely button</button>)}</div><div role="button" tabIndex={0} className="cap-not-button" onClick={verifyDiv} onKeyDown={(event) => event.key === 'Enter' && verifyDiv()} onMouseEnter={() => setLook((look + 1) % 2)}>This is a div-ish</div></div>;
}
