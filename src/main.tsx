import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Fonts are loaded via index.html (Cairo/Outfit) for better performance and Arabic support.
// Keeping MUI defaults without Roboto import here to avoid build errors if package is missing.

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
