import { useEffect, useRef, useState } from 'react';
import { CONFIG } from '../../config';
import { bus } from '../../lib/bus';
import { EVENTS } from '../../lib/events';
import { useStore } from '../../store';
import { ROAST_LINES } from './roastLines';

export function useRoasts() {
  const [typing, setTyping] = useState(false);
  const typingRef = useRef(false);
  const moodRef = useRef(0);
  const lastMessageRef = useRef(0);
  const thinkTimerRef = useRef(null);
  const idleTimerRef = useRef(null);
  const askTimerRef = useRef(null);
  const idRef = useRef(0);
  const bagsRef = useRef({});
  const lastUsedRef = useRef({});

  const showRoast = (kind, ctx = {}, force = false) => {
    if (typingRef.current && !force) return;
    if (!force && Date.now() - lastMessageRef.current < 4000) return;

    try {
      typingRef.current = true;
      setTyping(true);
      const variance = Math.floor(Math.random() * 1001) - 500;
      const delay = Math.max(500, CONFIG.HELPER_THINK_MS + variance);
      if (thinkTimerRef.current) clearTimeout(thinkTimerRef.current);
      thinkTimerRef.current = setTimeout(() => {
        try {
          const data = ROAST_LINES[kind] || ROAST_LINES.idle;
          const mood = moodRef.current;
          let tier = 'mild';
          if (mood >= 2 && mood < 5) tier = Math.random() < 0.35 ? 'spicy' : 'mild';
          if (mood >= 5) tier = Math.random() < 0.65 ? 'spicy' : 'mild';
          const pool = data[tier] && data[tier].length ? data[tier] : data.mild || [];
          const key = `${kind}:${tier}`;
          let bag = bagsRef.current[key];
          if (!bag || bag.length === 0) {
            bag = [...pool];
            for (let i = bag.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [bag[i], bag[j]] = [bag[j], bag[i]];
            }
            const last = lastUsedRef.current[key];
            if (bag.length > 1 && bag[0] === last) [bag[0], bag[1]] = [bag[1], bag[0]];
          }
          const template = bag.shift();
          bagsRef.current[key] = bag;
          lastUsedRef.current[key] = template;
          const place = ctx.place || useStore.getState().destination?.name || 'this place';
          const label = ctx.label || 'a suspicious incident';
          const text = String(template || 'Wala koy mapakita nga line.').replaceAll('{place}', place).replaceAll('{label}', label);
          lastMessageRef.current = Date.now();
          idRef.current += 1;
          useStore.getState().setRoast({ id: idRef.current, kind, text });
        } catch (error) {
          console.error('[roasts] Could not select line', error);
        } finally {
          typingRef.current = false;
          setTyping(false);
        }
      }, delay);
    } catch (error) {
      typingRef.current = false;
      setTyping(false);
      console.error('[roasts] Could not show helper', error);
    }
  };

  useEffect(() => {
    const scheduleIdle = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      const state = useStore.getState();
      if (state.plan.status === 'navigating' && !state.blocked) {
        const delay = CONFIG.HELPER_IDLE_MIN_MS + Math.random() * (CONFIG.HELPER_IDLE_MAX_MS - CONFIG.HELPER_IDLE_MIN_MS);
        idleTimerRef.current = setTimeout(() => {
          showRoast('idle', {});
          scheduleIdle();
        }, delay);
      }
    };

    const offs = [
      bus.on(EVENTS.ROUTE_READY, (payload) => {
        if (payload?.rerouted) {
          moodRef.current += 1;
          showRoast('redirect', { place: useStore.getState().destination?.name });
        } else {
          showRoast('destination', { place: useStore.getState().destination?.name });
        }
      }),
      bus.on(EVENTS.TRIP_START, () => showRoast('start')),
      bus.on(EVENTS.INCIDENT_HIT, (payload) => { moodRef.current += 1; showRoast('incident', { label: payload?.incident?.label }); }),
      bus.on(EVENTS.TRAFFIC_WORSE, () => showRoast('traffic')),
      bus.on(EVENTS.CAPTCHA_RESULT, (payload) => {
        if (!payload?.success) moodRef.current += 1;
        showRoast(payload?.success ? 'captcha_ok' : 'captcha_fail', {}, true);
      }),
      bus.on(EVENTS.ARRIVAL_NEAR, () => showRoast('arrival_near')),
      bus.on(EVENTS.ARRIVED, () => showRoast('arrived')),
      bus.on(EVENTS.ROAST_REQUEST, (payload) => showRoast(payload?.kind || 'idle', payload?.ctx || {}, true)),
      bus.on(EVENTS.TRIP_RESET, () => {
        moodRef.current = 0;
        bagsRef.current = {};
        lastUsedRef.current = {};
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        if (thinkTimerRef.current) clearTimeout(thinkTimerRef.current);
        typingRef.current = false;
        setTyping(false);
        useStore.getState().setRoast(null);
      }),
    ];

    const unsubStore = useStore.subscribe((state, prev) => {
      if (state.plan.status !== prev.plan.status || state.blocked !== prev.blocked) scheduleIdle();
    });
    scheduleIdle();

    return () => {
      offs.forEach((off) => off());
      unsubStore();
      [idleTimerRef.current, thinkTimerRef.current, askTimerRef.current].forEach((timer) => { if (timer) clearTimeout(timer); });
    };
  }, []);

  const ask = (text) => {
    if (!text?.trim()) return;
    showRoast('idle', {}, true);
  };

  return { typing, ask };
}
