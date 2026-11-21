import { create } from 'zustand';
import { CONFIG } from './config';

const initialState = () => ({
  mode: 'drive',
  origin: null,
  destination: null,
  plan: { status: 'idle', error: null },
  route: [],
  routeInfo: null,
  sim: {
    status: 'idle',
    index: 0,
    pos: null,
    heading: 0,
    speedKmh: 0,
    progress: 0,
    timeScale: CONFIG.SIM_TIME_SCALE,
    follow: true,
  },
  blocked: false,
  traffic: {
    segments: [],
    incidents: [],
    eta: { minutes: 0, label: '' },
  },
  roast: null,
});

export const useStore = create((set) => ({
  ...initialState(),

  setMode: (mode) => set({ mode }),
  setOrigin: (origin) => set({ origin }),
  setDestination: (destination) => set({ destination }),
  setPlan: (patch) =>
    set((state) => ({ plan: { ...state.plan, ...patch } })),
  setRoute: (route, routeInfo) => set({ route, routeInfo }),
  setSim: (patch) =>
    set((state) => ({ sim: { ...state.sim, ...patch } })),
  setBlocked: (blocked) => set({ blocked }),
  setTraffic: (patch) =>
    set((state) => ({ traffic: { ...state.traffic, ...patch } })),
  setRoast: (roast) => set({ roast }),
  resetAll: () => set(initialState()),
}));
