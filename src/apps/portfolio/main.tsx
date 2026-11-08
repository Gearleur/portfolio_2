import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../atelier/tokens.css';
import '../atelier/atelier.css';
// The Vitrine's page styles, which the Atelier loads with its steps.
import '../atelier/steps/chemin.css';
import { registerServiceWorker } from '../../shared/utils/registerServiceWorker';
import { Vitrine } from './Vitrine';
import './vitrine.css';
import './natif.css';

createRoot(document.getElementById('vitrine')!).render(
  <StrictMode>
    <Vitrine />
  </StrictMode>,
);

registerServiceWorker();
