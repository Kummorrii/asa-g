import React, { useEffect, useState, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Pane,
  Marker,
  Polyline,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import { CONFIG } from '../../config';
import { useStore } from '../../store';
import { reverseGeocode } from './geocode';
import './map.css';

function createPinIcon(letter, color) {
  return L.divIcon({
    className: 'map-custom-pin-wrapper',
    html: `<div class="map-pin" style="background:${color};"><span>${letter}</span></div>`,
    iconSize: [30, 38],
    iconAnchor: [15, 38],
    popupAnchor: [0, -34],
  });
}

function RouteBoundsFitter({ route, planStatus }) {
  const map = useMap();

  useEffect(() => {
    if (planStatus === 'preview' && Array.isArray(route) && route.length >= 2) {
      try {
        const bounds = L.latLngBounds(route);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [70, 70], maxZoom: 15 });
        }
      } catch (err) {
        console.warn('[MapView] fitBounds error:', err);
      }
    }
  }, [map, route, planStatus]);

  return null;
}

function MapInteractionHandler({ onContextMenuOpen }) {
  const setOrigin = useStore((s) => s.setOrigin);
  const setDestination = useStore((s) => s.setDestination);

  useMapEvents({
    async click(e) {
      onContextMenuOpen(null);
      const pickTarget = window.__asaPickTarget;
      if (!pickTarget) return;

      const { lat, lng } = e.latlng;
      window.__asaPickTarget = null;
      window.dispatchEvent(new CustomEvent('asa:pick-done'));

      const tempPoint = { lat, lng, name: `${lat.toFixed(4)}, ${lng.toFixed(4)}` };
      if (pickTarget === 'origin') {
        setOrigin(tempPoint);
      } else if (pickTarget === 'destination') {
        setDestination(tempPoint);
      }

      const resolvedName = await reverseGeocode(lat, lng);
      const finalPoint = { lat, lng, name: resolvedName };
      if (pickTarget === 'origin') {
        setOrigin(finalPoint);
      } else if (pickTarget === 'destination') {
        setDestination(finalPoint);
      }
    },
    contextmenu(e) {
      e.originalEvent.preventDefault();
      onContextMenuOpen({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        x: e.containerPoint.x,
        y: e.containerPoint.y,
      });
    },
  });

  return null;
}

export default function MapView({ children }) {
  const origin = useStore((s) => s.origin);
  const destination = useStore((s) => s.destination);
  const route = useStore((s) => s.route);
  const planStatus = useStore((s) => s.plan.status);
  const setOrigin = useStore((s) => s.setOrigin);
  const setDestination = useStore((s) => s.setDestination);

  const [ctxMenu, setCtxMenu] = useState(null);

  const iconA = useMemo(() => createPinIcon('A', '#10b981'), []);
  const iconB = useMemo(() => createPinIcon('B', '#ef4444'), []);

  const handleDragEnd = async (which, e) => {
    const { lat, lng } = e.target.getLatLng();
    const initial = { lat, lng, name: `${lat.toFixed(4)}, ${lng.toFixed(4)}` };
    if (which === 'origin') setOrigin(initial);
    else setDestination(initial);

    const name = await reverseGeocode(lat, lng);
    const updated = { lat, lng, name };
    if (which === 'origin') setOrigin(updated);
    else setDestination(updated);
  };

  const handleSetFromContext = async (which) => {
    if (!ctxMenu) return;
    const { lat, lng } = ctxMenu;
    setCtxMenu(null);

    const initial = { lat, lng, name: `${lat.toFixed(4)}, ${lng.toFixed(4)}` };
    if (which === 'origin') setOrigin(initial);
    else setDestination(initial);

    const name = await reverseGeocode(lat, lng);
    const updated = { lat, lng, name };
    if (which === 'origin') setOrigin(updated);
    else setDestination(updated);
  };

  return (
    <div className="map-wrapper">
      <MapContainer
        center={CONFIG.MAP_CENTER}
        zoom={CONFIG.MAP_ZOOM}
        zoomControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RouteBoundsFitter route={route} planStatus={planStatus} />
        <MapInteractionHandler onContextMenuOpen={setCtxMenu} />

        {/* Base route polyline below traffic overlay (z-index 450 < 460) */}
        <Pane name="base-route" style={{ zIndex: 450 }}>
          {Array.isArray(route) && route.length >= 2 && (
            <Polyline
              pane="base-route"
              positions={route}
              pathOptions={{
                color: '#2563eb',
                weight: 7,
                opacity: 0.85,
              }}
            />
          )}
        </Pane>

        {/* Shared overlay pane for TrafficLayer (M3) and SimulationLayer (M2) */}
        <Pane name="overlays" style={{ zIndex: 460 }}>
          {children}
        </Pane>

        {/* Draggable A and B Pins */}
        <Pane name="pins" style={{ zIndex: 480 }}>
          {origin && (
            <Marker
              pane="pins"
              position={[origin.lat, origin.lng]}
              icon={iconA}
              draggable={true}
              eventHandlers={{
                dragend: (e) => handleDragEnd('origin', e),
              }}
            >
              <Popup>
                <strong>Start (A):</strong> {origin.name}
              </Popup>
            </Marker>
          )}

          {destination && (
            <Marker
              pane="pins"
              position={[destination.lat, destination.lng]}
              icon={iconB}
              draggable={true}
              eventHandlers={{
                dragend: (e) => handleDragEnd('destination', e),
              }}
            >
              <Popup>
                <strong>Destination (B):</strong> {destination.name}
              </Popup>
            </Marker>
          )}
        </Pane>
      </MapContainer>

      {ctxMenu && (
        <div
          className="map-context-menu"
          style={{ left: ctxMenu.x, top: ctxMenu.y }}
          onMouseLeave={() => setCtxMenu(null)}
        >
          <button
            type="button"
            className="map-context-item"
            onClick={() => handleSetFromContext('origin')}
          >
            🟢 Set as start (A)
          </button>
          <button
            type="button"
            className="map-context-item"
            onClick={() => handleSetFromContext('destination')}
          >
            🔴 Set as destination (B)
          </button>
        </div>
      )}
    </div>
  );
}
