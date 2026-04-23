// Buffer polyfill MUST be first - required by @react-pdf/renderer in browser
import { Buffer } from 'buffer';
(window as any).Buffer = Buffer;
(globalThis as any).Buffer = Buffer;

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/inter'; // Added for Premium Soft Modern UI typography
import App from './App';
import './index.css';

{
  const saved = localStorage.getItem('theme-mode') as 'light' | 'dark' | null;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const m = saved ?? (systemDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', m);
  document.documentElement.style.setProperty('color-scheme', m);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
