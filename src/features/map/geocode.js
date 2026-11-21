import { CONFIG } from '../../config';
import { CEBU_PRESETS } from './presets';

const searchCache = new Map();
const reverseCache = new Map();
let lastRequestTime = 0;

async function throttle() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < 1050) {
    await new Promise((r) => setTimeout(r, 1050 - elapsed));
  }
  lastRequestTime = Date.now();
}

export async function searchPlaces(query) {
  const q = (query || '').trim();
  if (!q) return [];

  const cacheKey = q.toLowerCase();
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }

  try {
    await throttle();
    const params = new URLSearchParams({
      format: 'jsonv2',
      q,
      limit: '5',
      countrycodes: CONFIG.SEARCH_COUNTRY,
      viewbox: '123.7,10.5,124.1,10.2',
      bounded: '0',
    });
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
    const data = await res.json();
    const mapped = (Array.isArray(data) ? data : []).map((item) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      name: item.display_name ? item.display_name.split(',').slice(0, 2).join(', ') : q,
    }));

    if (mapped.length > 0) {
      searchCache.set(cacheKey, mapped);
      return mapped;
    }
  } catch (err) {
    console.warn('[geocode] searchPlaces fallback to presets:', err.message);
  }

  // Fallback to presets
  const fallback = CEBU_PRESETS.filter((p) =>
    p.name.toLowerCase().includes(cacheKey)
  ).slice(0, 5);
  return fallback;
}

export async function reverseGeocode(lat, lng) {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (reverseCache.has(key)) {
    return reverseCache.get(key);
  }

  try {
    await throttle();
    const params = new URLSearchParams({
      format: 'jsonv2',
      lat: String(lat),
      lon: String(lng),
    });
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Nominatim reverse HTTP ${res.status}`);
    const data = await res.json();
    const name =
      data?.name ||
      (data?.display_name ? data.display_name.split(',').slice(0, 2).join(', ') : null) ||
      'Pinned location';
    reverseCache.set(key, name);
    return name;
  } catch (err) {
    console.warn('[geocode] reverseGeocode fallback:', err.message);
    return 'Pinned location';
  }
}
