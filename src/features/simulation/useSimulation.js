import { useEffect, useRef } from 'react';
import { CONFIG } from '../../config';
import { bus } from '../../lib/bus';
import { EVENTS } from '../../lib/events';
import { cumulativeKm, pointAlong, polylineLengthKm } from '../../lib/geo';
import { useStore } from '../../store';

function smoothHeading(current, target) {
  if (!Number.isFinite(current) || !Number.isFinite(target)) return target || 0;
  const delta = ((target - current + 540) % 360) - 180;
  return (current + delta * 0.18 + 360) % 360;
}

export function useSimulation() {
  const route = useStore((state) => state.route);
  const mode = useStore((state) => state.mode);
  const timeScale = useStore((state) => state.sim.timeScale);
  const blocked = useStore((state) => state.blocked);
  const segments = useStore((state) => state.traffic.segments);
  const setSim = useStore((state) => state.setSim);

  const distanceRef = useRef(0);
  const headingRef = useRef(0);
  const arrivalNearEmittedRef = useRef(false);
  const cumulativeRef = useRef([]);
  const totalRef = useRef(0);
  const wobbleRef = useRef(1);
  const wobbleAtRef = useRef(0);

  useEffect(() => {
    cumulativeRef.current = cumulativeKm(route);
    totalRef.current = polylineLengthKm(route);
  }, [route]);

  useEffect(() => {
    let frame = 0;
    let previousTime = 0;
    let lastStoreWrite = 0;

    const resetAtStart = () => {
      distanceRef.current = 0;
      headingRef.current = 0;
      arrivalNearEmittedRef.current = false;
      const state = useStore.getState();
      const first = Array.isArray(state.route) && state.route.length
        ? [...state.route[0]]
        : null;
      setSim({
        status: 'idle',
        index: 0,
        pos: first,
        heading: 0,
        speedKmh: 0,
        progress: 0,
      });
    };

    const offStart = bus.on(EVENTS.TRIP_START, () => {
      const state = useStore.getState();
      if (Array.isArray(state.route) && state.route.length > 0) {
        setSim({ status: 'running', speedKmh: 0 });
      }
    });

    const offReady = bus.on(EVENTS.ROUTE_READY, (payload = {}) => {
      const state = useStore.getState();
      const rerouted = Boolean(payload.rerouted);
      const keepRunning = rerouted && state.sim.status === 'running';
      const first = Array.isArray(state.route) && state.route.length
        ? [...state.route[0]]
        : null;

      distanceRef.current = 0;
      headingRef.current = keepRunning ? state.sim.heading || 0 : 0;
      arrivalNearEmittedRef.current = false;
      setSim({
        status: keepRunning ? 'running' : 'idle',
        index: 0,
        pos: first,
        heading: headingRef.current,
        speedKmh: 0,
        progress: 0,
      });
    });

    const offReset = bus.on(EVENTS.TRIP_RESET, () => {
      resetAtStart();
      setSim({ status: 'idle', pos: null, index: 0, progress: 0, speedKmh: 0 });
    });

    const animate = (timestamp) => {
      if (!previousTime) previousTime = timestamp;
      const dt = Math.min((timestamp - previousTime) / 1000, 0.25);
      previousTime = timestamp;

      const state = useStore.getState();
      const currentRoute = state.route;
      const sim = state.sim;
      const nowScale = state.sim.timeScale;
      const isBlocked = state.blocked;

      if (!Array.isArray(currentRoute) || currentRoute.length < 2) {
        frame = requestAnimationFrame(animate);
        return;
      }

      const cum = cumulativeKm(currentRoute);
      const total = cum[cum.length - 1] || polylineLengthKm(currentRoute);
      if (total > 0) totalRef.current = total;
      if (!cumulativeRef.current.length) cumulativeRef.current = cum;

      const canMove = sim.status === 'running' && !isBlocked;
      let realSpeed = 0;
      let index = sim.index || 0;
      let pos = sim.pos ? [...sim.pos] : [...currentRoute[0]];
      let heading = sim.heading || 0;
      let progress = sim.progress || 0;

      if (canMove) {
        const base = CONFIG.SIM_BASE_SPEED_KMH[state.mode] || 30;
        const trafficSegments = state.traffic.segments || [];
        const matching = trafficSegments.find(
          (segment) =>
            index >= (segment.from ?? 0) &&
            index <= (segment.to ?? Number.MAX_SAFE_INTEGER),
        );
        const level = matching ? Math.max(0, Math.min(3, matching.level || 0)) : 0;
        const factors = [1, 0.6, 0.3, 0.1];

        if (timestamp - wobbleAtRef.current > 700) {
          wobbleRef.current = 0.95 + Math.random() * 0.1;
          wobbleAtRef.current = timestamp;
        }

        realSpeed = base * factors[level] * wobbleRef.current;
        const kmMoved = (realSpeed * dt * (nowScale || 1)) / 3600;
        distanceRef.current = Math.min(
          total,
          distanceRef.current + Math.max(0, kmMoved),
        );

        const along = pointAlong(currentRoute, distanceRef.current);
        pos = along.pos || pos;
        index = along.index;
        headingRef.current = smoothHeading(headingRef.current, along.heading);
        heading = headingRef.current;
        progress = total > 0 ? distanceRef.current / total : 0;

        if (progress >= 0.9 && !arrivalNearEmittedRef.current) {
          arrivalNearEmittedRef.current = true;
          bus.emit(EVENTS.ARRIVAL_NEAR, {});
        }

        if (distanceRef.current >= total) {
          progress = 1;
          realSpeed = 0;
          setSim({
            status: 'arrived',
            index: currentRoute.length - 1,
            pos,
            heading,
            speedKmh: 0,
            progress: 1,
          });
          bus.emit(EVENTS.ARRIVED, {});
        }
      } else {
        realSpeed = 0;
      }

      if (timestamp - lastStoreWrite >= 66) {
        lastStoreWrite = timestamp;
        setSim({
          index,
          pos,
          heading,
          speedKmh: canMove ? realSpeed : 0,
          progress,
        });
      }

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      offStart();
      offReady();
      offReset();
    };
  }, [setSim]);

  return {
    route,
    mode,
    timeScale,
    blocked,
    segments,
  };
}
