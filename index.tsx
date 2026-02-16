import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // Gledaj tvoj App.tsx fajl
import './index.css';     // OBAVEZNO: Ovo povezuje tvoj CSS sa sajtom

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}