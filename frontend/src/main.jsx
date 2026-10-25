import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import App from './App.jsx';
import './index.css';
import './i18n';
import { AuthProvider } from './context/AuthContext.jsx';

const apiUrl = import.meta.env.VITE_API_URL;
if (apiUrl && apiUrl.startsWith('http')) {
  axios.defaults.baseURL = apiUrl;
}
axios.defaults.withCredentials = true;

window.addEventListener('error', (event) => {
  console.error('Uncaught frontend error', {
    message: event.message,
    source: event.filename,
    line: event.lineno,
    column: event.colno,
  });
});

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
