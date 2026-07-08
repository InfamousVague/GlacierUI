import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@glacier/tokens/css/fonts.css';
import '@glacier/tokens/css/tokens.css';
import './docs.css';
import { App } from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
