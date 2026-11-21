import { polylineLengthKm } from '../../lib/geo';

export function distanceToStep(route, pos, stepIndex) {
  if (!Array.isArray(route) || !pos || stepIndex == null) return 0;
  const target = route[stepIndex];
  if (!target) return 0;
  let startIndex = 0;
  let best = Infinity;
  route.forEach((point, index) => {
    const d = Math.abs(point[0] - pos[0]) + Math.abs(point[1] - pos[1]);
    if (d < best) { best = d; startIndex = index; }
  });
  return polylineLengthKm(route.slice(startIndex, Math.min(route.length, stepIndex + 1)));
}

export function maneuverText(type, modifier, name) {
  const road = name && name.trim() ? ` onto ${name}` : '';
  const value = String(type || '').toLowerCase();
  const mod = String(modifier || '').toLowerCase();
  if (value.includes('uturn')) return `Make a U-turn${road}`;
  if (value === 'arrive') return 'You have arrived';
  if (value === 'depart') return `Start moving${road}`;
  if (mod.includes('left')) return `Turn left${road}`;
  if (mod.includes('right')) return `Turn right${road}`;
  if (value === 'roundabout') return `Enter the roundabout${road}`;
  if (value === 'merge') return `Merge${road}`;
  return `Continue straight${road}`;
}

export function addAbsurdTwist(text) {
  const twists = ['then immediately make a U-turn.', 'Then another one.', 'Continue straight for 14 km. Why not.', 'Turn left. No, your other left.', 'You have arrived. Joke lang.'];
  return `${text}${Math.random() < 0.55 ? ` ${twists[Math.floor(Math.random() * twists.length)]}` : '.'}`;
}

export function buildDirectionText(routeInfo, route, sim) {
  try {
    const steps = routeInfo?.steps;
    if (!Array.isArray(steps) || !steps.length) return 'Continue toward the highlighted nonsense. The map is offline, but the confidence is not.';
    const index = Number(sim?.index || 0);
    const nextStep = steps.find((step) => Number(step.index) > index);
    if (!nextStep) return 'Continue to the destination. It should be around the corner. Around several corners.';
    const km = distanceToStep(route, sim?.pos, Number(nextStep.index));
    const meters = Math.max(10, Math.round((km * 1000) / 10) * 10);
    const instruction = maneuverText(nextStep.type, nextStep.modifier, nextStep.name);
    const distance = meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`;
    return addAbsurdTwist(`In ${distance}, ${instruction.toLowerCase()}`);
  } catch {
    return 'Continue straight. The map is taking a wild guess.';
  }
}
