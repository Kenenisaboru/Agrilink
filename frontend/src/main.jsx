import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'

axios.defaults.baseURL = 'http://localhost:5000';

alert('Frontend Bundle Executing');
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
