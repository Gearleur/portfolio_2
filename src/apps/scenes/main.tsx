import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../shared/mikky-ui/mikky-ui.css';
import { Scenes } from './Scenes';
import './scenes.css';

createRoot(document.getElementById('scenes')!).render(
  <StrictMode>
    <Scenes />
  </StrictMode>,
);
