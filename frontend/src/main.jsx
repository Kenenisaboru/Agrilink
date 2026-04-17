import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'

window.onerror = function(message, source, lineno, colno, error) {
  document.body.innerHTML = `
    <div style="background:#fff; color:red; padding: 2rem; z-index:9999; position:fixed; top:0; left:0; right:0; bottom:0;">
      <h1 style="font-size:2rem; font-weight:bold; margin-bottom:1rem;">React Render Error</h1>
      <p style="font-weight:bold; font-size:1.2rem;">${message}</p>
      <pre style="margin-top:2rem; background:#f5f5f5; padding:1rem; color:#333; overflow:auto;">${error?.stack}</pre>
    </div>
  `;
};

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
