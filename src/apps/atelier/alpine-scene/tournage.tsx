import { createRoot } from 'react-dom/client';
import '../tokens.css';
import FilmAlpine from '../FilmAlpine';

// The film alone, live, for scripts/tournerAlpine.mjs to shoot (journal n° 106).
createRoot(document.getElementById('plateau')!).render(<FilmAlpine />);
