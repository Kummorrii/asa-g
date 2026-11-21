import { useEffect, useRef } from 'react';
import { bus } from '../../lib/bus';
import { EVENTS } from '../../lib/events';
import { useStore } from '../../store';

function etaLabel(minutes) {
  if (minutes < 60) return `Arriving in ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const normal = `Arriving in ${hours} hr ${mins} min`;
  if (minutes >= 100 && minutes % 17 === 0) return 'Arriving sometime this week';
  if (minutes >= 80 && minutes % 11 === 0) {
    return `Arriving in 0 min... charot, ${hours} hr ${mins} min`;
  }
  return normal;
}

export function useEta() {
  const delayRef = useRef(0);
  const currentRef = useRef(0);

  useEffect(() => {
    const publish = (minutes, label) => {
      const safeMinutes = Math.max(1, Math.ceil(minutes));
      currentRef.current = Math.max(currentRef.current, safeMinutes);
      useStore.getState().setTraffic({
        eta: { minutes: currentRef.current, label: label || etaLabel(currentRef.current) },
      });
    };

    const calculate = () => {
      const state = useStore.getState();
      const duration = state.routeInfo?.durationMin || 45;
      const remaining = 1 - Math.max(0, Math.min(1, state.sim.progress || 0));
      const segments = state.traffic.segments || [];
      const average = segments.length
        ? segments.reduce((sum, segment) => sum + segment.level, 0) / segments.length
        : 2;
      const trafficFactor = 1 + average * 0.18;
      const base = duration * remaining * trafficFactor;
      publish(base + delayRef.current);
    };

    const offRoute = bus.on(EVENTS.ROUTE_READY, () => {
      delayRef.current = 0;
      currentRef.current = 0;
      calculate();
    });
    const offReset = bus.on(EVENTS.TRIP_RESET, () => {
      delayRef.current = 0;
      currentRef.current = 0;
      useStore.getState().setTraffic({ eta: { minutes: 0, label: '' } });
    });
    const offArrival = bus.on(EVENTS.ARRIVAL_NEAR, () => {
      delayRef.current += 45;
      const label = 'Hala, bag-ong traffic! +45 min';
      const base = currentRef.current || (useStore.getState().routeInfo?.durationMin || 45);
      publish(base + 45, label);
    });
    const offBump = bus.on(EVENTS.ETA_BUMP, ({ minutes } = {}) => {
      delayRef.current += typeof minutes === 'number' ? minutes : 30;
      publish(currentRef.current + (typeof minutes === 'number' ? minutes : 30));
    });

    const timer = window.setInterval(() => {
      const state = useStore.getState();
      if (state.plan.status === 'navigating') {
        delayRef.current += 1 + Math.floor(Math.random() * 2);
        calculate();
      }
    }, 5000);

    calculate();
    return () => {
      offRoute();
      offReset();
      offArrival();
      offBump();
      window.clearInterval(timer);
    };
  }, []);

  return useStore((s) => s.traffic.eta);
}
