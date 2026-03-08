// Buffer polyfill MUST be first - required by @react-pdf/renderer in browser
import { Buffer } from 'buffer';
(window as any).Buffer = Buffer;
(globalThis as any).Buffer = Buffer;

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
