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

function routeIndexAtDistance(route, targetDistance) {
  if (route.length < 2) return 0;

  let traveled = 0;
  for (let i = 1; i < route.length; i++) {
    const [lat1, lng1] = route[i - 1];
    const [lat2, lng2] = route[i];
    const latDistance = (lat2 - lat1) * Math.PI / 180;
    const lngDistance = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(latDistance / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(lngDistance / 2) ** 2;
    const segmentDistance = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    if (traveled + segmentDistance >= targetDistance) {
      const segmentProgress = segmentDistance === 0
        ? 0
        : (targetDistance - traveled) / segmentDistance;
      return i - 1 + segmentProgress;
    }
    traveled += segmentDistance;
  }

  return route.length - 1;
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

  let totalDistance = 0;
  for (let i = 1; i < route.length; i++) {
    const [lat1, lng1] = route[i - 1];
    const [lat2, lng2] = route[i];
    const latDistance = (lat2 - lat1) * Math.PI / 180;
    const lngDistance = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(latDistance / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(lngDistance / 2) ** 2;
    totalDistance += 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  const incidentCount = Math.min(
    route.length,
    4 + Math.floor(Math.random() * 5),
  );
  const pool = mode === 'walk' ? [...WALK_LABELS, ...INCIDENTS] : INCIDENTS;
  const incidents = [];
  for (let i = 0; i < incidentCount; i++) {
    const usableStart = totalDistance * 0.06;
    const usableDistance = totalDistance * 0.88;
    const binStart = usableStart + (i / incidentCount) * usableDistance;
    const binWidth = usableDistance / incidentCount;
    const jitter = (Math.random() - 0.5) * binWidth * 0.7;
    const targetDistance = Math.max(
      usableStart,
      Math.min(usableStart + usableDistance, binStart + jitter),
    );

    const routePosition = routeIndexAtDistance(route, targetDistance);
    const index = Math.min(
      route.length - 1,
      Math.max(0, Math.round(routePosition)),
    );
    const [lat, lng] = route[index];
    const label = pool[Math.floor(Math.random() * pool.length)];
    incidents.push({ id: `incident-${i}-${Date.now()}`, lat, lng, label });
  }

  return { segments, incidents };
}
