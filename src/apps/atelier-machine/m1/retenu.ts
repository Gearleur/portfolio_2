import type { Reglages } from './reglages';

/*
 * What was retained at M1 (the matter), and what it takes to draw it: the sheet of glass's size and place.
 * Apart from the bench's own (reglages.ts: its bounds, its propositions, what it keeps and
 * copies), so that the Vitrine's Machine mode takes this and nothing of the bench.
 */

/**
 * The matter retained at M1 (Alexandre, 2026-11-19): the ghost page and the rubbing of « Coup de
 * gomme », the soft imprints of « À sec », the sheet of night-blue glass of « À plat » over the
 * right of the screen; the screen does not scroll. The next steps start from it.
 */
export const RETENU: Reglages = {
  page: { maniere: 'fantome', reste: 0.45, bavure: 2.3, accent: 0.45, papier: 0.98, grain: 1 },
  gomme: { maniere: 'frottis', nombre: 6, largeur: 56, angle: 15, opacite: 0.22, irregularite: 0.35, graine: 4965 },
  miniatures: { maniere: 'empreinte', profondeur: 0.55, formes: 0.1 },
  verre: { maniere: 'lame', teinte: -0.65, opacite: 0.82, flou: 0, largeur: 1230, hauteur: 900, x: 1, y: 0.4, curseur: 'accent' },
};

/** The screen the glass's size is given for, px: the end of the bench's sliders. */
export const PLEIN = { largeur: 1440, hauteur: 900 };

/** At the end of its slider, a side of the window is the screen's own: it fills it, whatever the screen. */
export const pleine = (cote: 'largeur' | 'hauteur', valeur: number) => valeur >= PLEIN[cote];
