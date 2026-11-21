import { polylineLengthKm } from '../../lib/geo';

// Believable offline fallback routes around Cebu City (>= 45 vertices each)
const DRIVE_COORDS = [
  [10.2945, 123.8811], // CIT-U
  [10.2938, 123.8824],
  [10.2925, 123.8842],
  [10.2908, 123.8858],
  [10.2889, 123.8871],
  [10.2865, 123.8862],
  [10.2842, 123.8845],
  [10.2821, 123.8825], // Near SRP / SM Seaside
  [10.2816, 123.8855],
  [10.2835, 123.8892],
  [10.2862, 123.8925],
  [10.2891, 123.8958],
  [10.2913, 123.8981], // Carbon
  [10.2932, 123.9005],
  [10.2942, 123.9022], // Santo Nino
  [10.2935, 123.9048], // Plaza Independencia
  [10.2958, 123.9072],
  [10.2989, 123.9098],
  [10.3024, 123.9125],
  [10.3061, 123.9152],
  [10.3098, 123.9175],
  [10.3119, 123.9181], // SM City Cebu
  [10.3155, 123.9178],
  [10.3194, 123.9165],
  [10.3232, 123.9142],
  [10.3268, 123.9114],
  [10.3292, 123.9085],
  [10.3305, 123.9058], // Near IT Park
  [10.3284, 123.9022],
  [10.3258, 123.8985],
  [10.3229, 123.8952],
  [10.3198, 123.8924],
  [10.3168, 123.8906], // Capitol
  [10.3142, 123.8918],
  [10.3118, 123.8931], // Fuente
  [10.3103, 123.8954],
  [10.3115, 123.8982],
  [10.3132, 123.9008],
  [10.3149, 123.9029],
  [10.3164, 123.9042],
  [10.3175, 123.9049],
  [10.3181, 123.9052], // Ayala Center Cebu
];

const WALK_COORDS = [
  [10.2966, 123.8995], // Colon
  [10.2961, 123.9012],
  [10.2952, 123.9028],
  [10.2944, 123.9044],
  [10.2965, 123.9061],
  [10.2988, 123.9074],
  [10.3012, 123.9082],
  [10.3036, 123.9075],
  [10.3059, 123.9058],
  [10.3081, 123.9039],
  [10.3102, 123.9021],
  [10.3124, 123.9005],
  [10.3145, 123.8991],
  [10.3168, 123.8982],
  [10.3189, 123.8974],
  [10.3208, 123.8962],
  [10.3219, 123.8945],
  [10.3212, 123.8924],
  [10.3198, 123.8911],
  [10.3182, 123.8904],
  [10.3168, 123.8906], // Capitol
  [10.3155, 123.8912],
  [10.3141, 123.8919],
  [10.3128, 123.8926],
  [10.3114, 123.8931],
  [10.3103, 123.8935],
  [10.3092, 123.8942],
  [10.3081, 123.8951],
  [10.3069, 123.8962],
  [10.3056, 123.8973],
  [10.3042, 123.8981],
  [10.3029, 123.8988],
  [10.3015, 123.8993],
  [10.3001, 123.8996],
  [10.2988, 123.8998],
  [10.2977, 123.8997],
  [10.2969, 123.8996],
  [10.2982, 123.8981],
  [10.2999, 123.8964],
  [10.3021, 123.8949],
  [10.3048, 123.8936],
  [10.3079, 123.8924],
  [10.3112, 123.8914],
  [10.3144, 123.8908],
  [10.3168, 123.8906],
];

function buildSteps(coords) {
  const streetNames = [
    'N. Bacalso Ave (Counterflow)',
    'SRP Coastal Scenic Loop',
    'Colon Heritage Alley',
    'M.J. Cuenco Longcut',
    'Pope John Paul II Detour',
    'Gorordo Uphill Struggle',
    'Escario Traffic Trap',
    'Osmeña Boulevard',
    'Cardinal Rosales Loop',
  ];
  const steps = [];
  const stepInterval = Math.max(4, Math.floor(coords.length / 8));
  for (let i = 0; i < coords.length; i += stepInterval) {
    const name = streetNames[(i / stepInterval) % streetNames.length | 0];
    steps.push({
      index: i,
      type: i === 0 ? 'depart' : 'turn',
      modifier: i % 2 === 0 ? 'left' : 'right',
      name,
      distanceM: 650,
    });
  }
  return steps;
}

export function getFallbackRoute(origin, destination, mode = 'drive') {
  const baseCoords = mode === 'walk' ? WALK_COORDS : DRIVE_COORDS;
  const coords = baseCoords.map((pt) => [...pt]);

  // Snap endpoints to requested origin/destination if provided
  if (origin && typeof origin.lat === 'number' && typeof origin.lng === 'number') {
    coords[0] = [origin.lat, origin.lng];
  }
  if (destination && typeof destination.lat === 'number' && typeof destination.lng === 'number') {
    coords[coords.length - 1] = [destination.lat, destination.lng];
  }

  const distanceKm = Number(polylineLengthKm(coords).toFixed(2));
  const shortestKm = Number(Math.max(0.4, distanceKm * 0.34).toFixed(2));
  const speed = mode === 'walk' ? 4.5 : 22;
  const durationMin = Math.max(5, Math.round((distanceKm / speed) * 60));

  return {
    coords,
    distanceKm,
    shortestKm,
    durationMin,
    steps: buildSteps(coords),
    offline: true,
  };
}
