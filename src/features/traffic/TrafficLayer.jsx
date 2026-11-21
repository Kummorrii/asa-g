import { useMemo } from 'react';
import L from 'leaflet';
import { Marker, Polyline, Popup } from 'react-leaflet';
import { useStore } from '../../store';
import { useTraffic } from './useTraffic';
import './traffic.css';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#7f1d1d'];

function emojiFor(label) {
  if (/carabao|aso|animal|pusa|chicken/i.test(label)) return '🐄';
  if (/prosisyon|basilica|templo|santo/i.test(label)) return '⛪';
  if (/lechon|delivery|trabaho|truck/i.test(label)) return '🚚';
  if (/balut|vendor|tinda|market/i.test(label)) return '🚧';
  if (/road|dalan|highway|closed|repair|construction/i.test(label)) return '🚧';
  return '🐔';
}

export default function TrafficLayer() {
  useTraffic();
  const route = useStore((s) => s.route);
  const traffic = useStore((s) => s.traffic);

  const incidentIcons = useMemo(() => {
    const map = new Map();
    for (const incident of traffic.incidents || []) {
      map.set(incident.id, L.divIcon({
        className: 'traf-incident-icon',
        html: `<span>${emojiFor(incident.label)}</span>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      }));
    }
    return map;
  }, [traffic.incidents]);

  if (!Array.isArray(route) || route.length < 2) return null;

  return (
    <>
      {(traffic.segments || []).map((segment) => {
        const from = segment.from;
        const to = segment.to;
        const positions = route.slice(from, to + 1);
        if (positions.length < 2) return null;
        return (
          <Polyline
            key={`${from}-${to}-${segment.level}`}
            pane="overlays"
            positions={positions}
            pathOptions={{
              color: COLORS[segment.level] || COLORS[0],
              weight: 5,
              opacity: 0.95,
            }}
          />
        );
      })}
      {(traffic.incidents || []).map((incident) => (
        <Marker
          key={incident.id}
          pane="overlays"
          position={[incident.lat, incident.lng]}
          icon={incidentIcons.get(incident.id)}
        >
          <Popup>{incident.label}</Popup>
        </Marker>
      ))}
    </>
  );
}
