const EARTH_RADIUS_KM = 6371;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function toDeg(rad) {
  return (rad * 180) / Math.PI;
}

export function haversineKm(a, b) {
  if (!a || !b) return 0;
  const [lat1, lng1] = a;
  const [lat2, lng2] = b;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * sinLng * sinLng;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function bearing(a, b) {
  if (!a || !b) return 0;
  const [lat1, lng1] = a;
  const [lat2, lng2] = b;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const dLambda = toRad(lng2 - lng1);
  const y = Math.sin(dLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export function polylineLengthKm(coords) {
  if (!Array.isArray(coords) || coords.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversineKm(coords[i - 1], coords[i]);
  }
  return total;
}

export function cumulativeKm(coords) {
  if (!Array.isArray(coords) || coords.length === 0) return [];
  const cum = [0];
  for (let i = 1; i < coords.length; i++) {
    cum.push(cum[i - 1] + haversineKm(coords[i - 1], coords[i]));
  }
  return cum;
}

export function pointAlong(coords, km) {
  if (!Array.isArray(coords) || coords.length === 0) {
    return { pos: null, index: 0, heading: 0 };
  }
  if (coords.length === 1 || km <= 0) {
    const heading = coords.length > 1 ? bearing(coords[0], coords[1]) : 0;
    return { pos: [...coords[0]], index: 0, heading };
  }

  const cum = cumulativeKm(coords);
  const total = cum[cum.length - 1];
  if (km >= total) {
    const last = coords.length - 1;
    const heading = bearing(coords[last - 1], coords[last]);
    return { pos: [...coords[last]], index: last, heading };
  }

  let segIdx = 0;
  for (let i = 1; i < cum.length; i++) {
    if (cum[i] >= km) {
      segIdx = i - 1;
      break;
    }
  }

  const segStart = coords[segIdx];
  const segEnd = coords[segIdx + 1];
  const segLen = cum[segIdx + 1] - cum[segIdx];
  const t = segLen > 0 ? (km - cum[segIdx]) / segLen : 0;

  const lat = segStart[0] + (segEnd[0] - segStart[0]) * t;
  const lng = segStart[1] + (segEnd[1] - segStart[1]) * t;
  const heading = bearing(segStart, segEnd);

  return { pos: [lat, lng], index: segIdx, heading };
}

export function nearestIndex(coords, point) {
  if (!Array.isArray(coords) || coords.length === 0 || !point) return 0;
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < coords.length; i++) {
    const d = haversineKm(coords[i], point);
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }
  return bestIdx;
}
