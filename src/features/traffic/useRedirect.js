import { useEffect, useRef, useState } from 'react';
import { CONFIG } from '../../config';
import { bus } from '../../lib/bus';
import { EVENTS } from '../../lib/events';
import { haversineKm, nearestIndex, polylineLengthKm } from '../../lib/geo';
import { useStore } from '../../store';
import { REDIRECT_LANDMARKS } from './landmarks';

export function useRedirect() {
  const [toast, setToast] = useState('');
  const countRef = useRef(0);
  const timerRef = useRef(null);
  const recalcRef = useRef(null);
  const successRef = useRef(null);
  const surpriseRef = useRef(null);

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

      const maxDistanceKm = state.mode === 'walk' ? 2 : 4;
      const candidates = REDIRECT_LANDMARKS
        .filter((landmark) => landmark.name !== state.destination.name)
        .map((landmark) => ({
          ...landmark,
          distance: haversineKm(pos, [landmark.lat, landmark.lng]),
        }))
        .filter((landmark) => landmark.distance >= 0.15 && landmark.distance <= maxDistanceKm)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5);

      if (!candidates.length) return null;
      const { distance, ...landmark } = candidates[Math.floor(Math.random() * candidates.length)];
      return landmark;
    };

    const redirect = (force = false) => {
      if (!force) {
        const state = useStore.getState();
        if (state.plan.status !== 'navigating' ||
            state.sim.status !== 'running' ||
            state.blocked ||
            surpriseRef.current ||
            countRef.current >= 4) return;
      }

      const landmark = chooseLandmark();
      if (!landmark) return;
          const state = useStore.getState();
          surpriseRef.current = {
            destination: { ...state.destination },
            route: state.route.map((point) => [...point]),
            routeInfo: state.routeInfo,
            returnRequested: false,
          };
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

    const offRoute = bus.on(EVENTS.ROUTE_READY, ({ rerouted, reason } = {}) => {
      if (rerouted) {
        if (reason === 'redirect_return') surpriseRef.current = null;
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
    const offArrived = bus.on(EVENTS.ARRIVED, () => {
      const surprise = surpriseRef.current;
      if (!surprise || surprise.returnRequested) return;

      surprise.returnRequested = true;
      setToast('Surprise detour complete. Returning to your original destination...');
      useStore.getState().setSim({ status: 'running', speedKmh: 0 });
      const state = useStore.getState();
      const currentPos = state.sim.pos;
      const nearest = nearestIndex(surprise.route, currentPos);
      const remainingRoute = surprise.route.slice(nearest);
      if (remainingRoute.length && currentPos) {
        remainingRoute[0] = [...currentPos];
      }
      const remainingKm = polylineLengthKm(remainingRoute);
      const originalKm = surprise.routeInfo?.distanceKm || remainingKm;
      const remainingRatio = originalKm > 0 ? remainingKm / originalKm : 1;
      const routeInfo = {
        ...surprise.routeInfo,
        distanceKm: Number(remainingKm.toFixed(2)),
        durationMin: Math.max(1, Math.round((surprise.routeInfo?.durationMin || 0) * remainingRatio)),
        steps: (surprise.routeInfo?.steps || [])
          .filter((step) => Number(step.index) >= nearest)
          .map((step) => ({ ...step, index: Number(step.index) - nearest })),
      };
      bus.emit(EVENTS.REROUTE_REQUEST, {
        to: surprise.destination,
        reason: 'redirect_return',
        routeOverride: remainingRoute,
        routeInfoOverride: routeInfo,
      });
    });
    const offForce = bus.on(EVENTS.REDIRECT_FORCE, () => redirect(true));
    const offReset = bus.on(EVENTS.TRIP_RESET, () => {
      countRef.current = 0;
      surpriseRef.current = null;
      setToast('');
      if (timerRef.current) window.clearTimeout(timerRef.current);
      clearExtraTimers();
    });

    schedule();
    return () => {
      offRoute();
      offArrived();
      offForce();
      offReset();
      if (timerRef.current) window.clearTimeout(timerRef.current);
      clearExtraTimers();
    };
  }, []);

  return toast;
}
