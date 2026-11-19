import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../atelier/tokens.css';
import '../atelier/atelier.css';
import { AtelierMachine } from './AtelierMachine';
import './atelier-machine.css';

createRoot(document.getElementById('atelier')!).render(
  <StrictMode>
    <AtelierMachine />
  </StrictMode>,
);
