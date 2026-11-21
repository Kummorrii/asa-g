import { INCIDENTS } from './incidents';

const WALK_LABELS = [
  'Nag-selfie ang mga tawo sa sidewalk',
  'Aso nga ayaw paagi',
  'Pedestrian nga nag-lutaw-lutaw',
  'Dance challenge sa footbridge',
  'Manan-ong nga nanamok sa sidewalk',
];

function weightedLevel(previous) {
  if (typeof previous === 'number') {
    const roll = Math.random();
    if (roll < 0.28) return 3;
    if (roll < 0.54) return Math.max(previous, 2);
    if (roll < 0.68) return Math.max(previous - 1, 0);
  }

  const roll = Math.random();
  if (roll < 0.15) return 0;
  if (roll < 0.40) return 1;
  if (roll < 0.70) return 2;
  return 3;
}

export function buildTraffic(route, mode = 'drive') {
  if (!Array.isArray(route) || route.length < 2) {
    return { segments: [], incidents: [] };
  }

  const segments = [];
  let previous = 2;
  for (let start = 0; start < route.length - 1;) {
    const remaining = route.length - 1 - start;
    const chunk = remaining < 8 ? remaining : Math.min(remaining, 8 + Math.floor(Math.random() * 8));
    const level = weightedLevel(previous);
    previous = level;
    segments.push({ from: start, to: Math.min(start + chunk, route.length - 1), level });
    start += chunk;
  }

  const incidentCount = 4 + Math.floor(Math.random() * 5);
  const pool = mode === 'walk' ? [...WALK_LABELS, ...INCIDENTS] : INCIDENTS;
  const incidents = [];
  for (let i = 0; i < incidentCount; i++) {
    const ratio = (i + 0.5) / incidentCount;
    const index = Math.min(route.length - 1, Math.round(ratio * (route.length - 1)));
    const [lat, lng] = route[index];
    const label = pool[(i * 7 + Math.floor(Math.random() * pool.length)) % pool.length];
    incidents.push({ id: `incident-${i}-${Date.now()}`, lat, lng, label });
  }

  return { segments, incidents };
}
