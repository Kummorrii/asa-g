import React from 'react';
import { MapView, PlannerPanel } from './features/map';
import { SimulationLayer, SimulationPanel } from './features/simulation';
import { TrafficLayer, TrafficPanel } from './features/traffic';
import { RoastBanner, DirectionsCard } from './features/roasts';
import { CaptchaModal } from './features/captcha';
import { DemoPanel } from './features/demo';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, label: props.label || 'Widget' };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error(`[ErrorBoundary:${this.state.label}]`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return <div className="error-chip">{this.state.label} crashed</div>;
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <div className="app-root">
      <div className="map-container-slot">
        <ErrorBoundary label="Map">
          <MapView>
            <ErrorBoundary label="TrafficLayer">
              <TrafficLayer />
            </ErrorBoundary>
            <ErrorBoundary label="SimulationLayer">
              <SimulationLayer />
            </ErrorBoundary>
          </MapView>
        </ErrorBoundary>
      </div>

      <div className="slot slot-top-left">
        <ErrorBoundary label="Planner">
          <PlannerPanel />
        </ErrorBoundary>
      </div>

      <div className="slot slot-top-center">
        <ErrorBoundary label="Directions">
          <DirectionsCard />
        </ErrorBoundary>
      </div>

      <div className="slot slot-top-right">
        <ErrorBoundary label="Traffic">
          <TrafficPanel />
        </ErrorBoundary>
      </div>

      <div className="slot slot-bottom-left">
        <ErrorBoundary label="Simulation">
          <SimulationPanel />
        </ErrorBoundary>
      </div>

      <div className="slot slot-bottom-center">
        <ErrorBoundary label="Roasts">
          <RoastBanner />
        </ErrorBoundary>
      </div>

      <div className="slot slot-bottom-right">
        <ErrorBoundary label="Demo">
          <DemoPanel />
        </ErrorBoundary>
      </div>

      <ErrorBoundary label="Captcha">
        <CaptchaModal />
      </ErrorBoundary>
    </div>
  );
}
