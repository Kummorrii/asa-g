import { useEffect, useRef, useState } from 'react';
import { useStore } from '../../store';
import { buildDirectionText } from './directionsText';
import './roasts.css';

export default function DirectionsCard() {
  const planStatus = useStore((state) => state.plan.status);
  const routeInfo = useStore((state) => state.routeInfo);
  const route = useStore((state) => state.route);
  const sim = useStore((state) => state.sim);
  const inputsRef = useRef({ routeInfo, route, sim });
  const [text, setText] = useState(() => buildDirectionText(routeInfo, route, sim));

  inputsRef.current = { routeInfo, route, sim };

  useEffect(() => {
    const timer = setInterval(() => {
      const current = inputsRef.current;
      setText(buildDirectionText(current.routeInfo, current.route, current.sim));
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  if (planStatus !== 'navigating') return null;

  return (
    <section className="roast-directions panel" aria-live="polite">
      <div className="roast-directions__eyebrow">ABSURD TURN-BY-TURN</div>
      <div className="roast-directions__text">{text}</div>
    </section>
  );
}
