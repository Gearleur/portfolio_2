import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Atelier } from './Atelier';
import './tokens.css';
import './atelier.css';

createRoot(document.getElementById('atelier')!).render(
  <StrictMode>
    <Atelier />
  </StrictMode>,
);
