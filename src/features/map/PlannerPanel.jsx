import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../../store';
import { bus } from '../../lib/bus';
import { EVENTS } from '../../lib/events';
import { searchPlaces } from './geocode';
import { useRouteController } from './useRouteController';
import './map.css';

export default function PlannerPanel() {
  const mode = useStore((s) => s.mode);
  const origin = useStore((s) => s.origin);
  const destination = useStore((s) => s.destination);
  const plan = useStore((s) => s.plan);
  const routeInfo = useStore((s) => s.routeInfo);

  const setMode = useStore((s) => s.setMode);
  const setOrigin = useStore((s) => s.setOrigin);
  const setDestination = useStore((s) => s.setDestination);

  const [originText, setOriginText] = useState('');
  const [destText, setDestText] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null); // 'origin' | 'destination' | null
  const [pickMode, setPickMode] = useState(null); // 'origin' | 'destination' | null

  const debounceRef = useRef(null);

  const handleResetInputs = useCallback(() => {
    setOriginText('');
    setDestText('');
    setOriginSuggestions([]);
    setDestSuggestions([]);
    setActiveField(null);
    setPickMode(null);
    window.__asaPickTarget = null;
  }, []);

  const { computeRoute, startTrip, resetTrip, loadDemoTrip } = useRouteController({
    onResetInputs: handleResetInputs,
  });

  // Sync store origin/destination name updates (e.g. from map click, drag, redirect, demo)
  useEffect(() => {
    if (origin?.name) setOriginText(origin.name);
    else if (!origin) setOriginText('');
  }, [origin]);

  useEffect(() => {
    if (destination?.name) setDestText(destination.name);
    else if (!destination) setDestText('');
  }, [destination]);

  // Listen for map click completion
  useEffect(() => {
    const onPickDone = () => setPickMode(null);
    window.addEventListener('asa:pick-done', onPickDone);
    return () => window.removeEventListener('asa:pick-done', onPickDone);
  }, []);

  const handleInputChange = (field, value) => {
    if (field === 'origin') {
      setOriginText(value);
      setActiveField('origin');
    } else {
      setDestText(value);
      setActiveField('destination');
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      if (field === 'origin') setOriginSuggestions([]);
      else setDestSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const results = await searchPlaces(value);
      if (field === 'origin') setOriginSuggestions(results);
      else setDestSuggestions(results);
    }, 600);
  };

  const handleSelectSuggestion = (field, place) => {
    if (field === 'origin') {
      setOrigin(place);
      setOriginText(place.name);
      setOriginSuggestions([]);
    } else {
      setDestination(place);
      setDestText(place.name);
      setDestSuggestions([]);
    }
    setActiveField(null);
  };

  const togglePickOnMap = (field) => {
    const next = pickMode === field ? null : field;
    setPickMode(next);
    window.__asaPickTarget = next;
  };

  const handleSwap = () => {
    const prevOrigin = origin;
    const prevDest = destination;
    setOrigin(prevDest);
    setDestination(prevOrigin);
    setOriginSuggestions([]);
    setDestSuggestions([]);
  };

  const handleModeChange = (nextMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    if (plan.status === 'navigating' && destination) {
      bus.emit(EVENTS.REROUTE_REQUEST, { to: destination, reason: 'mode' });
    } else if (plan.status === 'preview' && origin && destination) {
      computeRoute({ modeOverride: nextMode });
    }
  };

  return (
    <div className="panel map-planner">
      <div className="map-planner-header">
        <div>
          <span className="map-brand">ASA</span>
          <span className="map-tagline">Asa ta padulong? (The Longest Way)</span>
        </div>
        <button
          type="button"
          className="btn map-demo-btn"
          onClick={() => loadDemoTrip(0)}
          title="Load instant Cebu demo trip"
        >
          ⚡ Demo
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="map-mode-tabs">
        <button
          type="button"
          className={`map-mode-tab ${mode === 'drive' ? 'active' : ''}`}
          onClick={() => handleModeChange('drive')}
        >
          🚗 Drive
        </button>
        <button
          type="button"
          className={`map-mode-tab ${mode === 'walk' ? 'active' : ''}`}
          onClick={() => handleModeChange('walk')}
        >
          🚶 Walk
        </button>
      </div>

      {/* Start & Destination Inputs */}
      <div className="map-inputs-row">
        <div className="map-inputs-stack">
          {/* Origin Input */}
          <div className="map-input-group">
            <span className="map-dot map-dot-a">A</span>
            <input
              type="text"
              className="map-input"
              placeholder="Choose starting point"
              value={originText}
              onFocus={() => setActiveField('origin')}
              onChange={(e) => handleInputChange('origin', e.target.value)}
            />
            <button
              type="button"
              className={`map-pick-btn ${pickMode === 'origin' ? 'picking' : ''}`}
              onClick={() => togglePickOnMap('origin')}
              title="Pick start on map"
            >
              📍
            </button>

            {activeField === 'origin' && originSuggestions.length > 0 && (
              <ul className="map-suggestions">
                {originSuggestions.map((s, idx) => (
                  <li
                    key={`${s.name}-${idx}`}
                    className="map-suggestion-item"
                    onClick={() => handleSelectSuggestion('origin', s)}
                  >
                    {s.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Destination Input */}
          <div className="map-input-group">
            <span className="map-dot map-dot-b">B</span>
            <input
              type="text"
              className="map-input"
              placeholder="Choose destination"
              value={destText}
              onFocus={() => setActiveField('destination')}
              onChange={(e) => handleInputChange('destination', e.target.value)}
            />
            <button
              type="button"
              className={`map-pick-btn ${pickMode === 'destination' ? 'picking' : ''}`}
              onClick={() => togglePickOnMap('destination')}
              title="Pick destination on map"
            >
              📍
            </button>

            {activeField === 'destination' && destSuggestions.length > 0 && (
              <ul className="map-suggestions">
                {destSuggestions.map((s, idx) => (
                  <li
                    key={`${s.name}-${idx}`}
                    className="map-suggestion-item"
                    onClick={() => handleSelectSuggestion('destination', s)}
                  >
                    {s.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <button
          type="button"
          className="btn map-swap-btn"
          onClick={handleSwap}
          title="Swap start and destination"
          disabled={!origin && !destination}
        >
          ⇅
        </button>
      </div>

      {pickMode && (
        <div className="map-pick-hint">
          I-click ang mapa para pilion ang {pickMode === 'origin' ? 'Start (A)' : 'Destination (B)'}...
        </div>
      )}

      {/* Status & Action Controls */}
      {plan.status === 'loading' && (
        <div className="map-status-box">
          ⏳ Gikalkula ang pinakalayo nga dalan...
        </div>
      )}

      {plan.status === 'error' && (
        <div className="map-error-box">
          ⚠️ {plan.error || 'Naay problema sa pagpangita og dalan.'}
        </div>
      )}

      {plan.status === 'preview' && routeInfo && (
        <div className="map-preview-box">
          <div className="map-preview-stats">
            <span className="map-distance-big">{routeInfo.distanceKm} km</span>
            <span className="map-duration-tag">~{routeInfo.durationMin} min</span>
            {routeInfo.offline && <span className="map-offline-badge">Offline</span>}
          </div>
          <div className="map-detour-joke">
            (Shortest would be <strong>{routeInfo.shortestKm} km</strong>, we took{' '}
            <strong>{routeInfo.distanceKm} km</strong>! Sulit ang gasolina!)
          </div>
          <div className="map-preview-actions">
            <button
              type="button"
              className="btn btn-primary map-action-full"
              onClick={startTrip}
            >
              🚀 Start Trip
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => computeRoute()}
              title="Recalculate even longer route"
            >
              ↻
            </button>
          </div>
        </div>
      )}

      {(plan.status === 'idle' || plan.status === 'error') && (
        <button
          type="button"
          className="btn btn-primary map-action-full"
          disabled={!origin || !destination}
          onClick={() => computeRoute()}
        >
          🗺️ Get longest route
        </button>
      )}

      {plan.status === 'navigating' && (
        <div className="map-nav-actions">
          <div className="map-nav-live">
            🟢 Nagbiyahe na ({routeInfo?.distanceKm ?? '?'} km detour)
          </div>
          <button
            type="button"
            className="btn btn-danger map-action-full"
            onClick={resetTrip}
          >
            🛑 Stop trip
          </button>
        </div>
      )}

      {plan.status === 'arrived' && (
        <div className="map-nav-actions">
          <div className="map-arrived-msg">
            🎉 Naabot ra gyud intawon! Grabe kalayo!
          </div>
          <button
            type="button"
            className="btn btn-primary map-action-full"
            onClick={resetTrip}
          >
            🔄 New trip
          </button>
        </div>
      )}
    </div>
  );
}
