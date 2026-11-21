import { useEffect, useState } from 'react';
import { CONFIG } from '../../config';
import { useStore } from '../../store';
import { useRoasts } from './useRoasts';
import './roasts.css';

export default function RoastBanner() {
  const roast = useStore((state) => state.roast);
  const { typing, ask } = useRoasts();
  const [visible, setVisible] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!roast?.text) {
      setVisible(false);
      setTypedText('');
      return;
    }
    setVisible(true);
    setTypedText('');
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setTypedText(roast.text.slice(0, index));
      if (index >= roast.text.length) clearInterval(interval);
    }, 18);
    const hide = setTimeout(() => setVisible(false), 8000);
    return () => {
      clearInterval(interval);
      clearTimeout(hide);
    };
  }, [roast]);

  const submit = (event) => {
    event.preventDefault();
    if (input.trim()) ask(input);
    setInput('');
  };

  return (
    <section className="roast-banner panel" aria-live="polite">
      <div className="roast-banner__header">
        <span className="roast-banner__avatar" aria-hidden="true">🤖</span>
        <div>
          <div className="roast-banner__name">{CONFIG.HELPER_NAME}</div>
          <div className="roast-banner__badge">✨ powered by absolutely nothing</div>
        </div>
      </div>
      {typing ? (
        <div className="roast-banner__typing" aria-label="Assistant is thinking">
          <span /><span /><span />
        </div>
      ) : (
        <div className="roast-banner__message">
          {visible ? typedText : 'Naa ra ko diri, naghulat nga mangutana ka. Tabang? Ambot, pero present ko.'}
        </div>
      )}
      <form className="roast-banner__ask" onSubmit={submit}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => event.stopPropagation()}
          onKeyUp={(event) => event.stopPropagation()}
          placeholder="Ask me anything..."
          aria-label="Ask ASA Assistant"
        />
      </form>
    </section>
  );
}
