import { useMemo } from 'react';
import L from 'leaflet';
import { Marker, Polyline, Popup } from 'react-leaflet';
import { useStore } from '../../store';
import { useTraffic } from './useTraffic';
import './traffic.css';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#7f1d1d'];

function emojiFor(label) {
  if (/chicken/i.test(label)) return '🐔';
  if (/aso/i.test(label)) return '🐕';
  if (/pusa/i.test(label)) return '🐈';
  if (/carabao|animal/i.test(label)) return '🐄';
  if (/prosisyon|basilica|templo|santo/i.test(label)) return '⛪';
  if (/lechon|delivery|trabaho|truck/i.test(label)) return '🚚';
  if (/balut|vendor|tinda|market/i.test(label)) return '🚧';
  if (/road|dalan|highway|closed|repair|construction/i.test(label)) return '🚧';
  return '🐔';
}

function descriptionFor(label) {
  if (/chicken/i.test(label)) return 'Chickens on road';
  if (/carabao/i.test(label)) return 'Carabao crossing';
  if (/aso/i.test(label)) return 'Dog blocking road';
  if (/pusa/i.test(label)) return 'Cat on road';
  if (/prosisyon|basilica|templo|santo/i.test(label)) return 'Religious procession';
  if (/lechon|delivery|trabaho|truck/i.test(label)) return 'Delivery traffic';
  if (/balut|vendor|tinda|market|store/i.test(label)) return 'Street vendors';
  if (/road|dalan|highway|closed|repair|construction|pothole/i.test(label)) return 'Road work or closure';
  if (/pedestrian|sidewalk|selfie|dance/i.test(label)) return 'Pedestrians in the way';
  if (/jeepney|tricycle|habal|pedicab/i.test(label)) return 'Slow or stopped vehicle';
  return 'Traffic incident';
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
        html: `<span class="traf-incident-label">${descriptionFor(incident.label)}</span><span class="traf-incident-emoji">${emojiFor(incident.label)}</span>`,
        iconSize: [160, 48],
        iconAnchor: [80, 48],
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
