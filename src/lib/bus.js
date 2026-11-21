const listeners = new Map();

export const bus = {
  on(event, fn) {
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    listeners.get(event).add(fn);
    return () => {
      const set = listeners.get(event);
      if (set) {
        set.delete(fn);
      }
    };
  },

  emit(event, payload = {}) {
    const set = listeners.get(event);
    if (!set) return;
    for (const fn of Array.from(set)) {
      try {
        fn(payload);
      } catch (err) {
        console.error(`[bus] Error in handler for "${event}":`, err);
      }
    }
  },
};
