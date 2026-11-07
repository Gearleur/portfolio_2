import { createContext, useContext } from 'react';

/** The Vitrine's two languages (step 0: French and English). */
export type Langue = 'fr' | 'en';

/** The language of the page being drawn; the diagrams and thumbnails read it. */
export const LangueContext = createContext<Langue>('fr');

export function useLangue() {
  return useContext(LangueContext);
}

/** Picks the French or the English words, side by side in the code. */
export function useTr() {
  const langue = useLangue();
  return (fr: string, en: string) => (langue === 'en' ? en : fr);
}

/** Changes the language of the page; the Atelier, which has one language, ignores it. */
export const ChoixLangueContext = createContext<(langue: Langue) => void>(() => {});

export function useChoixLangue() {
  return useContext(ChoixLangueContext);
}
