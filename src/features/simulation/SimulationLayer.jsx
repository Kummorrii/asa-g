import { useEffect, useMemo, useRef } from 'react';
import { CircleMarker, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet';
import { useStore } from '../../store';
import { useSimulation } from './useSimulation';
import { createVehicleIcon } from './vehicleIcons';
import './simulation.css';

function FollowCamera({ mapStatus }) {
  const map = useMap();
  const pos = useStore((state) => state.sim.pos);
  const status = useStore((state) => state.sim.status);
  const follow = useStore((state) => state.sim.follow);
  const mode = useStore((state) => state.mode);
  const setSim = useStore((state) => state.setSim);
  const lastCameraUpdate = useRef(0);

  useMapEvents({
    dragstart() {
      setSim({ follow: false });
    },
  });

  useEffect(() => {
    if (status === 'running' && pos) {
      map.setView(pos, mode === 'walk' ? 16 : 15, { animate: false });
    }
  }, [mapStatus, mode, status]); // mapStatus is a start transition trigger

  useEffect(() => {
    if (!follow || status !== 'running' || !pos) return;
    const now = performance.now();
    if (now - lastCameraUpdate.current < 500) return;
    lastCameraUpdate.current = now;
    map.setView(pos, mode === 'walk' ? 16 : 15, { animate: false });
  }, [follow, map, mode, pos, status]);

  return null;
}

export default function SimulationLayer() {
  useSimulation();
  const route = useStore((state) => state.route);
  const sim = useStore((state) => state.sim);
  const mode = useStore((state) => state.mode);

  const icon = useMemo(
    () => createVehicleIcon(mode, sim.heading),
    [mode, sim.heading],
  );

  const traveled = useMemo(() => {
    if (!Array.isArray(route) || route.length === 0) return [];
    const index = Math.max(0, Math.min(route.length - 1, sim.index || 0));
    const positions = route.slice(0, index + 1);
    if (sim.pos) positions.push(sim.pos);
    return positions;
  }, [route, sim.index, sim.pos]);

  return (
    <>
      <FollowCamera mapStatus={sim.status} />
      {traveled.length >= 2 && (
        <Polyline
          pane="overlays"
          positions={traveled}
          pathOptions={{ color: '#64748b', weight: 7, opacity: 0.9 }}
        />
      )}
      {sim.pos && (
        <>
          <CircleMarker
            pane="overlays"
            center={sim.pos}
            radius={13}
            pathOptions={{
              color: '#60a5fa',
              fillColor: '#60a5fa',
              fillOpacity: 0.18,
              weight: 2,
            }}
          />
          <Marker
            pane="overlays"
            position={sim.pos}
            icon={icon}
            keyboard={false}
          />
        </>
      )}
    </>
  );
}
