import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { applyStoredAppearance } from './utils/appearance';
import { applyStoredTheme } from './utils/theme';
import './styles.css';

applyStoredAppearance();
applyStoredTheme();
createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
      scope: import.meta.env.BASE_URL,
      updateViaCache: 'none',
    }).catch(() => { /* The app remains usable when offline installation is unavailable. */ });
  });
}
