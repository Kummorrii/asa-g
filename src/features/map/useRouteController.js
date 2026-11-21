import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../../store';
import { bus } from '../../lib/bus';
import { EVENTS } from '../../lib/events';
import { getLongestRoute } from './routing';
import { DEMO_TRIPS } from './presets';

export function useRouteController({ onResetInputs } = {}) {
  const inFlightRef = useRef(false);

  const computeRoute = useCallback(
    async ({ originOverride, destinationOverride, modeOverride, rerouted = false, reason } = {}) => {
      if (inFlightRef.current) return;
      const state = useStore.getState();
      const orig = originOverride || state.origin;
      const dest = destinationOverride || state.destination;
      const activeMode = modeOverride || state.mode;

      if (!orig || !dest) return;

      inFlightRef.current = true;
      if (!rerouted) {
        state.setPlan({ status: 'loading', error: null });
      }

      try {
        const result = await getLongestRoute(orig, dest, activeMode);
        const coords = result.coords.map((pt) => [...pt]);

        // Ensure exact start alignment on reroutes
        if (rerouted && orig) {
          coords[0] = [orig.lat, orig.lng];
        }

        const routeInfo = {
          distanceKm: result.distanceKm,
          shortestKm: result.shortestKm,
          durationMin: result.durationMin,
          steps: result.steps,
          offline: Boolean(result.offline),
        };

        useStore.getState().setRoute(coords, routeInfo);
        useStore.getState().setPlan({
          status: rerouted ? 'navigating' : 'preview',
          error: null,
        });
        bus.emit(EVENTS.ROUTE_READY, { rerouted, reason });
      } catch (err) {
        console.error('[useRouteController] computeRoute failed:', err);
        useStore.getState().setPlan({
          status: rerouted ? 'navigating' : 'error',
          error: 'Naputol ang linya! Wala nakakita og dalan.',
        });
      } finally {
        inFlightRef.current = false;
      }
    },
    []
  );

  const startTrip = useCallback(() => {
    const state = useStore.getState();
    if (!state.route || state.route.length < 2) return;
    state.setPlan({ status: 'navigating', error: null });
    bus.emit(EVENTS.TRIP_START, {});
  }, []);

  const resetTrip = useCallback(() => {
    useStore.getState().resetAll();
    if (onResetInputs) onResetInputs();
    bus.emit(EVENTS.TRIP_RESET, {});
  }, [onResetInputs]);

  const loadDemoTrip = useCallback(
    async (tripIndex = 0) => {
      const trip = DEMO_TRIPS[tripIndex % DEMO_TRIPS.length];
      const store = useStore.getState();
      store.setMode(trip.mode);
      store.setOrigin({ ...trip.origin });
      store.setDestination({ ...trip.destination });
      await computeRoute({
        originOverride: trip.origin,
        destinationOverride: trip.destination,
        modeOverride: trip.mode,
        rerouted: false,
      });
    },
    [computeRoute]
  );

  useEffect(() => {
    const offReroute = bus.on(EVENTS.REROUTE_REQUEST, async ({ to, reason, routeOverride, routeInfoOverride } = {}) => {
      const state = useStore.getState();
      const targetDest = to || state.destination;
      if (!targetDest) return;

      if (reason === 'redirect_return' && Array.isArray(routeOverride) && routeOverride.length > 1) {
        state.setDestination(targetDest);
        state.setRoute(routeOverride, routeInfoOverride);
        state.setPlan({ status: 'navigating', error: null });
        state.setSim({ status: 'running', index: 0, progress: 0, speedKmh: 0 });
        bus.emit(EVENTS.ROUTE_READY, { rerouted: true, reason });
        return;
      }

      const currentPos = state.sim?.pos;
      const fromPoint =
        Array.isArray(currentPos) && currentPos.length === 2
          ? { lat: currentPos[0], lng: currentPos[1], name: 'Current location' }
          : state.origin;

      if (!fromPoint) return;

      if (to) {
        state.setDestination(to);
      }

      await computeRoute({
        originOverride: fromPoint,
        destinationOverride: targetDest,
        rerouted: true,
        reason,
      });
    });

    const offDemo = bus.on(EVENTS.DEMO_TRIP, () => {
      loadDemoTrip(0);
    });

    const offArrived = bus.on(EVENTS.ARRIVED, () => {
      useStore.getState().setPlan({ status: 'arrived' });
    });

    const offReset = bus.on(EVENTS.TRIP_RESET, () => {
      // Only reset store if not already idle so we don't loop
      if (useStore.getState().plan.status !== 'idle' || useStore.getState().origin) {
        useStore.getState().resetAll();
        if (onResetInputs) onResetInputs();
      }
    });

    return () => {
      offReroute();
      offDemo();
      offArrived();
      offReset();
    };
  }, [computeRoute, loadDemoTrip, onResetInputs]);

  return {
    computeRoute,
    startTrip,
    resetTrip,
    loadDemoTrip,
  };
}
