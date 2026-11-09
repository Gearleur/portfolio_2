import { renderToString } from 'react-dom/server';
import { Vitrine } from './Vitrine';

/*
 * The Vitrine rendered at build time (journal n° 107), so that the page shows
 * before its script has arrived: once per language and per layout, the one in
 * view chosen by CSS (vitrine.css) and public/langue.js. The script then draws
 * the live page and removes these copies (Vitrine.tsx). Built for Node by
 * scripts/prerendre.mjs, which gives the components the window they read.
 */

export type Variante = { langue: 'fr' | 'en'; telephone: boolean };

export const VARIANTES: Variante[] = [
  { langue: 'fr', telephone: false },
  { langue: 'en', telephone: false },
  { langue: 'fr', telephone: true },
  { langue: 'en', telephone: true },
];

/** The page as it opens for this visitor, as HTML. */
export function rendre({ langue, telephone }: Variante) {
  const fenetre = globalThis as unknown as { window: Record<string, unknown> };
  Object.assign(fenetre.window, {
    matchMedia: (query: string) => ({
      matches: query.includes('max-width') ? telephone : false,
      addEventListener() {},
      removeEventListener() {},
    }),
    localStorage: { getItem: () => langue, setItem() {} },
  });
  return renderToString(<Vitrine />);
}
