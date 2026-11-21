import { useEffect, useRef } from 'react';
import { CONFIG } from '../../config';
import { bus } from '../../lib/bus';
import { EVENTS } from '../../lib/events';
import { haversineKm } from '../../lib/geo';
import { useStore } from '../../store';
import { buildTraffic } from './buildTraffic';

export function useTraffic() {
  const firedRef = useRef(new Set());

  useEffect(() => {
    const offRoute = bus.on(EVENTS.ROUTE_READY, () => {
      const state = useStore.getState();
      const generated = buildTraffic(state.route, state.mode);
      firedRef.current = new Set();
      state.setTraffic(generated);
    });

    const offReset = bus.on(EVENTS.TRIP_RESET, () => {
      firedRef.current = new Set();
      useStore.getState().setTraffic({ segments: [], incidents: [], eta: { minutes: 0, label: '' } });
    });

    const worsenTimer = window.setInterval(() => {
      const state = useStore.getState();
      if (state.plan.status !== 'navigating' || state.sim.status !== 'running') return;

      const segments = [...state.traffic.segments];
      if (!segments.length) return;
      const count = 2 + Math.floor(Math.random() * 3);
      const chosen = new Set();
      while (chosen.size < Math.min(count, segments.length)) {
        chosen.add(Math.floor(Math.random() * segments.length));
      }
      const worsened = segments.map((segment, index) =>
        chosen.has(index)
          ? { ...segment, level: Math.min(3, segment.level + 1) }
          : segment
      );
      useStore.getState().setTraffic({ segments: worsened });
      bus.emit(EVENTS.TRAFFIC_WORSE, {});
    }, CONFIG.TRAFFIC_WORSEN_INTERVAL_MS);

    const incidentTimer = window.setInterval(() => {
      const state = useStore.getState();
      if (state.plan.status !== 'navigating' || !Array.isArray(state.sim.pos)) return;
      for (const incident of state.traffic.incidents || []) {
        if (firedRef.current.has(incident.id)) continue;
        const distanceKm = haversineKm(state.sim.pos, [incident.lat, incident.lng]);
        if (distanceKm <= 0.080) {
          firedRef.current.add(incident.id);
          bus.emit(EVENTS.INCIDENT_HIT, { incident });
        }
      }
    }, 500);

    return () => {
      offRoute();
      offReset();
      window.clearInterval(worsenTimer);
      window.clearInterval(incidentTimer);
    };
  }, []);
}
