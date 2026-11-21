import React from 'react';
import ReactDOM from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import './styles/theme.css';
import './App.css';
import App from './App';
import { useStore } from './store';
import { bus } from './lib/bus';

if (import.meta.env.DEV) {
  window.__store = useStore;
  window.__bus = bus;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
