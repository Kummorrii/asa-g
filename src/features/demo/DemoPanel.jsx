import { useEffect, useState } from 'react';
import { bus } from '../../lib/bus';
import { EVENTS } from '../../lib/events';
import { useStore } from '../../store';
import './demo.css';

export default function DemoPanel() {
  const [open, setOpen] = useState(false);
  const plan = useStore((state) => state.plan.status);
  const sim = useStore((state) => state.sim.status);
  const blocked = useStore((state) => state.blocked);

  useEffect(() => {
    const onKey = (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable) return;
      if (event.key.toLowerCase() === 'd') setOpen((value) => !value);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!open) return null;

  const emit = (event, payload = {}) => bus.emit(event, payload);

  return (
    <div className="demo-panel panel">
      <div className="demo-header"><strong>Pitch Controls</strong><button type="button" className="demo-close" onClick={() => setOpen(false)} aria-label="Close demo panel">×</button></div>
      <div className="demo-actions">
        <button className="btn demo-btn" type="button" onClick={() => emit(EVENTS.DEMO_TRIP)}>Load demo trip</button>
        <button className="btn demo-btn" type="button" onClick={() => emit(EVENTS.REDIRECT_FORCE)}>Force redirect</button>
        <button className="btn demo-btn" type="button" onClick={() => emit(EVENTS.CAPTCHA_REQUEST)}>Force captcha</button>
        <button className="btn demo-btn" type="button" onClick={() => emit(EVENTS.ROAST_REQUEST, { kind: 'idle' })}>Force helper insult</button>
        <button className="btn demo-btn" type="button" onClick={() => emit(EVENTS.ETA_BUMP, { minutes: 30 })}>ETA +30 min</button>
        <button className="btn btn-danger demo-btn" type="button" onClick={() => emit(EVENTS.TRIP_RESET)}>Reset trip</button>
      </div>
      <div className="demo-status"><span>plan: {plan}</span><span>sim: {sim}</span><span>blocked: {blocked ? 'yes' : 'no'}</span></div>
    </div>
  );
}
