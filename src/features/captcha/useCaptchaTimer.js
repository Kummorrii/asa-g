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
      clearTimer();
      const base = CONFIG.CAPTCHA_INTERVAL_MS;
      const jitter = base * (0.8 + Math.random() * 0.4);
      timerRef.current = setTimeout(() => {
        const state = useStore.getState();
        if (
          state.plan.status === 'navigating' &&
          state.sim.status === 'running' &&
          !state.blocked
        ) {
          openCaptcha();
        }
        schedule();
      }, jitter);
    };

    const offRequest = bus.on(EVENTS.CAPTCHA_REQUEST, openCaptcha);
    const offReset = bus.on(EVENTS.TRIP_RESET, () => {
      clearTimer();
      useStore.getState().setBlocked(false);
    });

    schedule();

    const unsubscribeStore = useStore.subscribe((state) => {
      if (!state.blocked && state.plan.status === 'navigating' && state.sim.status === 'running') {
        // The timer itself remains scheduled; successful solves merely leave it running.
      }
    });

    return () => {
      clearTimer();
      offRequest();
      offReset();
      unsubscribeStore();
    };
  }, []);
}
