import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import App from './App.jsx'
import './index.css'
import './i18n'; // Import i18n configuration
import { AuthProvider } from './context/AuthContext.jsx'
import { registerSW } from 'virtual:pwa-register';

/* 
// Register PWA service worker
if ('serviceWorker' in navigator) {
  registerSW({ immediate: true });
}
*/

// Enhanced error handling for mobile debugging
window.onerror = function(message, source, lineno, colno, error) {
  const errorMsg = `
    <div style="background:#fff; color:#d32f2f; padding: 2rem; z-index:9999; position:fixed; top:0; left:0; right:0; bottom:0; font-family:sans-serif; overflow:auto;">
      <h1 style="font-size:1.5rem; font-weight:bold; border-bottom:2px solid #ffcdd2; padding-bottom:1rem; margin-bottom:1rem;">🚀 AgriLink: Startup Error</h1>
      <p style="font-weight:bold; color:#000;">${message}</p>
      <div style="background:#f5f5f5; padding:1rem; border-radius:8px; font-size:0.8rem; margin:1rem 0;">
        <strong>Source:</strong> ${source}<br>
        <strong>Line:</strong> ${lineno}:${colno}
      </div>
      <pre style="white-space:pre-wrap; font-size:0.75rem; color:#444;">${error?.stack || 'No stack trace available'}</pre>
      <div style="margin-top:2rem; display:flex; gap:10px;">
        <button onclick="location.reload(true)" style="background:#16a34a; color:white; border:none; padding:10px 20px; border-radius:5px; font-weight:bold;">Reload Page</button>
        <button onclick="localStorage.clear(); sessionStorage.clear(); location.reload(true);" style="background:#666; color:white; border:none; padding:10px 20px; border-radius:5px;">Clear Data & Reset</button>
      </div>
      <p style="font-size:0.7rem; color:#888; margin-top:2rem;">IP: ${window.location.hostname} | UA: ${navigator.userAgent}</p>
    </div>
  `;
  document.body.innerHTML = errorMsg;
  console.error("Critical Render Error:", {message, source, lineno, colno, error});
};

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const root = createRoot(document.getElementById('root'));

try {
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
} catch (e) {
  console.error("Render catch:", e);
}
