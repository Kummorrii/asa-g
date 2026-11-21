import { useStore } from '../../store';
import { buildDirectionText } from './directionsText';
import './roasts.css';

export default function DirectionsCard() {
  const planStatus = useStore((state) => state.plan.status);
  const routeInfo = useStore((state) => state.routeInfo);
  const route = useStore((state) => state.route);
  const sim = useStore((state) => state.sim);

  if (planStatus !== 'navigating') return null;

  return (
    <section className="roast-directions panel" aria-live="polite">
      <div className="roast-directions__eyebrow">ABSURD TURN-BY-TURN</div>
      <div className="roast-directions__text">{buildDirectionText(routeInfo, route, sim)}</div>
    </section>
  );
}
