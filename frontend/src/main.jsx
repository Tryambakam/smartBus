import "./i18n";
import "./styles/gov.css";
import "leaflet/dist/leaflet.css";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { enableMockBackend } from './utils/api_mock';
import { registerSW } from 'virtual:pwa-register';

// Activate the global simulation fetch hook allowing offline API interactions
enableMockBackend();

// Engage Service Worker forcing comprehensive offline caching of the Application Shell
registerSW({ immediate: true });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
