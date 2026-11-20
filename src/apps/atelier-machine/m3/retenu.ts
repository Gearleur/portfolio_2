import type { Reglages } from './reglages';

/*
 * What was retained at M3 (the switch), and what it takes to draw it: the pill's measures and its slide.
 * Apart from the bench's own (reglages.ts: its bounds, its propositions, what it keeps and
 * copies), so that the Vitrine's Machine mode takes this and nothing of the bench.
 */

/**
 * The switch retained at M3 (Alexandre, 2026-11-19): « Pétale » in glass, the knob carrying 0 / 1,
 * no label, all the coquelicot, drawn at 0.7: a pill of about 207 × 56 px at the bottom in the
 * middle, 16 px from the edge. He first asked for 0.4, the size of the name in the page's side,
 * then settled between the two.
 */
export const RETENU: Reglages = { largeur: 296, hauteur: 80, echelle: 0.6, rayon: 1, relief: 0.6, matiere: 'verre', fenetre: 'petale', coquelicot: 1, forme: 'rond', porte: 'chiffre', libelles: 'aucun', bas: 16, terminal: 'arret', duree: 580, elasticite: 0.7, vibration: true };

// --- the object's measures

/** The room the terminal leaves between its last line and the pill, px. */
export const ECART = 20;

/**
 * The pill's measures, px of a 1440 px page: the knob's inset, its diameter, how far it travels,
 * the strip of pill left between the knob and the window, and what the terminal's screen gives
 * up at its bottom so that its last line (the keys, the status) stands above the pill. `marge`
 * is the margin the terminal's grid already keeps (M2).
 */
export function geometrie({ largeur, hauteur, bas, terminal, echelle = 1 }: Pick<Reglages, 'largeur' | 'hauteur' | 'bas' | 'terminal'> & { echelle?: number }, marge = 32) {
  const retrait = Math.round(hauteur * 0.085);
  return {
    retrait,
    bouton: hauteur - 2 * retrait,
    course: largeur - hauteur,
    joint: Math.round(retrait * 1.25),
    // what the pill takes on the page, once drawn at its scale
    reserve: terminal === 'arret' ? Math.max(0, Math.round(bas + hauteur * echelle + ECART - marge)) : 0,
  };
}

/** The side a knob let go at `p` (0 Human, 1 Machine) falls to: the nearest. True is Machine. */
export const retombe = (p: number) => p > 0.5;

/** The slide's easing: how far past the end the knob would run, which the pill turns into a squash. */
export const elan = (elasticite: number) => Math.round((1 + 0.6 * elasticite) * 1000) / 1000;
