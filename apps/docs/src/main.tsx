import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@perfect/tokens/css/fonts.css';
import '@perfect/tokens/css/tokens.css';
import './docs.css';
import { App } from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
