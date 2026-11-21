import L from 'leaflet';

export function createVehicleIcon(mode = 'drive', heading = 0) {
  const safeHeading = Number.isFinite(heading) ? heading : 0;
  const isWalk = mode === 'walk';

  return L.divIcon({
    className: 'sim-vehicle-marker-wrapper',
    html: isWalk
      ? `<div class="sim-pulse" aria-hidden="true"></div><div class="sim-vehicle sim-vehicle-walk" style="transform:rotate(${safeHeading}deg)">🚶</div>`
      : `<div class="sim-pulse" aria-hidden="true"></div><div class="sim-vehicle sim-vehicle-drive" style="transform:rotate(${safeHeading - 90}deg) scaleX(-1)">🚗</div>`,
    iconSize: isWalk ? [48, 48] : [52, 52],
    iconAnchor: isWalk ? [24, 24] : [26, 26],
  });
}

export const vehicleIcons = {
  create: createVehicleIcon,
};
