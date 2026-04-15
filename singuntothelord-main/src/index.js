import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import EmergencyRouteOptimizer from './components/EmergencyDispatch/SingUntoTheLord';
import 'leaflet/dist/leaflet.css';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <EmergencyRouteOptimizer />
  </React.StrictMode>
);
