import { haversineKm, nearestIndex } from '../../lib/geo';
import { getFallbackRoute } from './fallbackRoutes';

const routeCache = new Map();
let lastOsrmCall = 0;

async function throttleOsrm() {
  const now = Date.now();
  const wait = 1000 - (now - lastOsrmCall);
  if (wait > 0) {
    await new Promise((r) => setTimeout(r, wait));
  }
  lastOsrmCall = Date.now();
}

function buildCacheKey(origin, destination, mode) {
  return `${mode}:${origin.lat.toFixed(4)},${origin.lng.toFixed(4)}->${destination.lat.toFixed(4)},${destination.lng.toFixed(4)}`;
}

function generateDetourWaypoints(origin, destination, mode) {
  const midLat = (origin.lat + destination.lat) / 2;
  const midLng = (origin.lng + destination.lng) / 2;
  const dLat = destination.lat - origin.lat;
  const dLng = destination.lng - origin.lng;
  const len = Math.hypot(dLat, dLng) || 0.01;

  // Perpendicular vector
  const perpLat = -dLng / len;
  const perpLng = dLat / len;

  // ~0.01 deg is roughly 1.1 km
  const offsetDeg = mode === 'walk' ? 0.006 : 0.025;
  const sign = Math.random() > 0.5 ? 1 : -1;

  const wp1 = {
    lat: midLat + perpLat * offsetDeg * sign,
    lng: midLng + perpLng * offsetDeg * sign,
  };

  if (mode === 'drive') {
    const wp2 = {
      lat: origin.lat + dLat * 0.75 + perpLat * (offsetDeg * 0.8) * sign,
      lng: origin.lng + dLng * 0.75 + perpLng * (offsetDeg * 0.8) * sign,
    };
    return [wp1, wp2];
  }
  return [wp1];
}

async function fetchOsrmCandidate(points, mode) {
  await throttleOsrm();
  const coordStr = points.map((p) => `${p.lng},${p.lat}`).join(';');
  const urls =
    mode === 'walk'
      ? [
          `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${coordStr}?alternatives=3&overview=full&geometries=geojson&steps=true`,
          `https://routing.openstreetmap.de/routed-foot/route/v1/driving/${coordStr}?alternatives=3&overview=full&geometries=geojson&steps=true`,
          `https://router.project-osrm.org/route/v1/driving/${coordStr}?alternatives=3&overview=full&geometries=geojson&steps=true`,
        ]
      : [
          `https://router.project-osrm.org/route/v1/driving/${coordStr}?alternatives=3&overview=full&geometries=geojson&steps=true`,
        ];

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) continue;
      const data = await res.json();
      if (data.code === 'Ok' && Array.isArray(data.routes) && data.routes.length > 0) {
        return data.routes;
      }
    } catch {
      // Try next URL
    }
  }
  return [];
}

function parseOsrmRoute(osrmRoute, shortestKm, mode) {
  const coords = osrmRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  const distanceKm = Number((osrmRoute.distance / 1000).toFixed(2));
  const rawDurationMin = Math.round(osrmRoute.duration / 60);
  // Make sure walking duration reflects walking speed even if OSRM fell back to driving profile
  const durationMin =
    mode === 'walk'
      ? Math.max(rawDurationMin, Math.round((distanceKm / 4.8) * 60))
      : Math.max(3, rawDurationMin);

  const steps = [];
  if (Array.isArray(osrmRoute.legs)) {
    for (const leg of osrmRoute.legs) {
      if (!Array.isArray(leg.steps)) continue;
      for (const st of leg.steps) {
        const loc = st.maneuver?.location; // [lng, lat]
        const index = loc ? nearestIndex(coords, [loc[1], loc[0]]) : 0;
        steps.push({
          index,
          type: st.maneuver?.type || 'turn',
          modifier: st.maneuver?.modifier || 'straight',
          name: st.name || 'Unnamed Cebu Road',
          distanceM: Math.round(st.distance || 0),
        });
      }
    }
  }

  return {
    coords,
    distanceKm,
    shortestKm: Number(shortestKm.toFixed(2)),
    durationMin,
    steps,
    offline: false,
  };
}

export async function getLongestRoute(origin, destination, mode = 'drive') {
  if (!origin || !destination) {
    throw new Error('Missing origin or destination');
  }

  const key = buildCacheKey(origin, destination, mode);
  if (routeCache.has(key)) {
    return routeCache.get(key);
  }

  try {
    const directCandidates = await fetchOsrmCandidate([origin, destination], mode);
    if (directCandidates.length === 0) {
      throw new Error('No OSRM candidates returned');
    }

    let allCandidates = [...directCandidates];
    const shortestMeters = Math.min(...allCandidates.map((r) => r.distance));
    const shortestKm = Math.max(0.1, shortestMeters / 1000);

    // If OSRM only gave 1 route or longest isn't significantly longer than shortest, force a detour!
    const currentMaxMeters = Math.max(...allCandidates.map((r) => r.distance));
    if (allCandidates.length < 2 || currentMaxMeters < shortestMeters * 1.25) {
      const waypoints = generateDetourWaypoints(origin, destination, mode);
      const detourCandidates = await fetchOsrmCandidate(
        [origin, ...waypoints, destination],
        mode
      );
      if (detourCandidates.length > 0) {
        allCandidates = allCandidates.concat(detourCandidates);
      }
    }

    // Pick the LONGEST route
    allCandidates.sort((a, b) => b.distance - a.distance);
    const longest = allCandidates[0];
    const parsed = parseOsrmRoute(longest, shortestKm, mode);

    // Sanity check straight-line distance
    if (parsed.shortestKm <= 0) {
      parsed.shortestKm = Number(Math.max(0.2, haversineKm([origin.lat, origin.lng], [destination.lat, destination.lng])).toFixed(2));
    }

    routeCache.set(key, parsed);
    return parsed;
  } catch (err) {
    console.warn('[routing] Falling back to offline route:', err.message);
    return getFallbackRoute(origin, destination, mode);
  }
}
