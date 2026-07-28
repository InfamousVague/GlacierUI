import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@glacier/tokens/css/fonts.css';
import '@glacier/tokens/css/tokens.css';
import '../docs.css';
import { ParityHarness } from './ParityHarness.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ParityHarness />
  </StrictMode>,
);