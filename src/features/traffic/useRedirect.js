import { useEffect, useRef, useState } from 'react';
import { CONFIG } from '../../config';
import { bus } from '../../lib/bus';
import { EVENTS } from '../../lib/events';
import { haversineKm } from '../../lib/geo';
import { useStore } from '../../store';
import { REDIRECT_LANDMARKS } from './landmarks';

export function useRedirect() {
  const [toast, setToast] = useState('');
  const countRef = useRef(0);
  const timerRef = useRef(null);
  const recalcRef = useRef(null);
  const successRef = useRef(null);

  useEffect(() => {
    const clearExtraTimers = () => {
      if (recalcRef.current) window.clearTimeout(recalcRef.current);
      if (successRef.current) window.clearTimeout(successRef.current);
      recalcRef.current = null;
      successRef.current = null;
    };

    const chooseLandmark = () => {
      const state = useStore.getState();
      if (!state.destination) return null;

      const pos = Array.isArray(state.sim.pos) ? state.sim.pos : state.route[0] || null;
      if (!pos) return null;

      let candidates = REDIRECT_LANDMARKS.filter((landmark) =>
        landmark.name !== state.destination.name &&
        haversineKm(pos, [landmark.lat, landmark.lng]) * 1000 >= 500
      );

      if (state.mode === 'walk') {
        candidates = candidates.filter((landmark) =>
          haversineKm(pos, [landmark.lat, landmark.lng]) <= 2
        );
      } else if (candidates.length && Math.random() < 0.30) {
        candidates = [...candidates]
          .map((landmark) => ({
            ...landmark,
            distance: haversineKm(pos, [landmark.lat, landmark.lng]),
          }))
          .sort((a, b) => b.distance - a.distance)
          .slice(0, 10)
          .map(({ distance, ...landmark }) => landmark);
      }

      if (!candidates.length) return null;
      return candidates[Math.floor(Math.random() * candidates.length)];
    };

    const redirect = (force = false) => {
      if (!force) {
        const state = useStore.getState();
        if (state.plan.status !== 'navigating' ||
            state.sim.status !== 'running' ||
            state.blocked ||
            countRef.current >= 4) return;
      }

      const landmark = chooseLandmark();
      if (!landmark) return;
      if (!force) countRef.current += 1;
      setToast('Recalculating...');

      clearExtraTimers();
      recalcRef.current = window.setTimeout(() => {
        bus.emit(EVENTS.REROUTE_REQUEST, {
          to: { lat: landmark.lat, lng: landmark.lng, name: landmark.name },
          reason: 'redirect',
        });
      }, 2000);
    };

    const schedule = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      const jitter = 0.8 + Math.random() * 0.4;
      timerRef.current = window.setTimeout(() => {
        redirect(false);
        const state = useStore.getState();
        if (state.plan.status === 'navigating' && countRef.current < 4) schedule();
      }, CONFIG.REDIRECT_INTERVAL_MS * jitter);
    };

    const offRoute = bus.on(EVENTS.ROUTE_READY, ({ rerouted } = {}) => {
      if (rerouted) {
        const state = useStore.getState();
        const destination = state.destination;
        const message = destination
          ? `Bag-ong destinasyon: ${destination.name}. ${REDIRECT_LANDMARKS.find((item) => item.name === destination.name)?.blurb || 'Suroy-suroy nalang.'}`
          : 'Bag-ong destinasyon.';
        setToast(message);
        if (successRef.current) window.clearTimeout(successRef.current);
        successRef.current = window.setTimeout(() => setToast(''), 4000);
      }
    });
    const offForce = bus.on(EVENTS.REDIRECT_FORCE, () => redirect(true));
    const offReset = bus.on(EVENTS.TRIP_RESET, () => {
      countRef.current = 0;
      setToast('');
      if (timerRef.current) window.clearTimeout(timerRef.current);
      clearExtraTimers();
    });

    schedule();
    return () => {
      offRoute();
      offForce();
      offReset();
      if (timerRef.current) window.clearTimeout(timerRef.current);
      clearExtraTimers();
    };
  }, []);

  return toast;
}
