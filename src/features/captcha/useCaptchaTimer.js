import { useEffect, useRef } from 'react';
import { CONFIG } from '../../config';
import { bus } from '../../lib/bus';
import { EVENTS } from '../../lib/events';
import { useStore } from '../../store';

// TODO(M5): Periodic captcha trigger timer hook
export function useCaptchaTimer() {
  const timerRef = useRef(null);

  useEffect(() => {
    const openCaptcha = () => {
      const state = useStore.getState();
      if (!state.blocked) state.setBlocked(true);
    };

    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const schedule = () => {
      if (timerRef.current) return;
      const base = CONFIG.CAPTCHA_INTERVAL_MS;
      const jitter = base * (0.8 + Math.random() * 0.4);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        const state = useStore.getState();
        if (
          state.plan.status === 'navigating' &&
          state.sim.status === 'running' &&
          !state.blocked
        ) {
          openCaptcha();
        }
        syncTimer();
      }, jitter);
    };

    const syncTimer = () => {
      const state = useStore.getState();
      const shouldRun =
        state.plan.status === 'navigating' &&
        state.sim.status === 'running' &&
        !state.blocked;

      if (shouldRun) schedule();
      else clearTimer();
    };

    const offRequest = bus.on(EVENTS.CAPTCHA_REQUEST, openCaptcha);
    const offReset = bus.on(EVENTS.TRIP_RESET, () => {
      clearTimer();
      useStore.getState().setBlocked(false);
      syncTimer();
    });

    const unsubscribeStore = useStore.subscribe(syncTimer);
    syncTimer();

    return () => {
      clearTimer();
      offRequest();
      offReset();
      unsubscribeStore();
    };
  }, []);
}
