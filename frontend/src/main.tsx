import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { apiClient } from './api/axios.config';

// Load tokens from localStorage on app start
apiClient.loadTokens();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
