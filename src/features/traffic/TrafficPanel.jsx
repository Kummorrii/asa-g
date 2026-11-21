import { useStore } from '../../store';
import { useEta } from './useEta';
import { useRedirect } from './useRedirect';
import './traffic.css';

export default function TrafficPanel() {
  const route = useStore((s) => s.route);
  const segments = useStore((s) => s.traffic.segments);
  const incidents = useStore((s) => s.traffic.incidents);
  const eta = useEta();
  const redirectToast = useRedirect();

  if (!Array.isArray(route) || route.length < 2) return null;

  const average = segments.length
    ? segments.reduce((sum, segment) => sum + segment.level, 0) / segments.length
    : 0;
  const heavy = average >= 2;

  return (
    <div className="traf-panel panel">
      <div className="traf-eta">{eta?.label || 'Calculating when this trip ends...'}</div>
      {heavy && <div className="traf-heavy-banner">Heavy traffic ahead</div>}
      <div className="traf-count">{incidents.length} ka insidente</div>
      {redirectToast && <div className="traf-toast">{redirectToast}</div>}
    </div>
  );
}
