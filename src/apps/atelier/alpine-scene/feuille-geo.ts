/* The geometry of the sheet, in u, on its 560 × 288 window. */

export type Couleur = 'blue' | 'purple' | 'amber' | 'green' | 'red';

export const COLONNES = [126, 112, 94, 82, 70];
export const NUM = 28;
export const TETE = 22;
export const LIGNE = 26;
export const LIGNES = 7;
export const GX = 24;
export const GY = 60;
export const DEBUTS = COLONNES.map((_, i) => COLONNES.slice(0, i).reduce((a, b) => a + b, 0));

export const GRAVITE: Couleur[] = ['green', 'amber', 'red', 'amber', 'green', 'red'];
export const BARRES = [
  [96, 70, 28],
  [84, 82, 24],
  [100, 56, 32],
  [76, 74, 26],
  [90, 62, 30],
  [82, 68, 22],
];

/** Where each agent writes, on the still scene. */
export const AGENTS_FIXES: { ligne: number; colonne: number; couleur: Couleur }[] = [
  { ligne: 2, colonne: 1, couleur: 'blue' },
  { ligne: 3, colonne: 0, couleur: 'purple' },
  { ligne: 4, colonne: 2, couleur: 'amber' },
  { ligne: 5, colonne: 3, couleur: 'green' },
];

/**
 * In the animation, the agents work row by row: each takes the rows listed
 * (0 is the titles), from where it comes in (a point off the window).
 */
export const TRAVAIL: { couleur: Couleur; lignes: number[]; depart: [number, number] }[] = [
  { couleur: 'blue', lignes: [1, 5], depart: [-30, 40] },
  { couleur: 'purple', lignes: [2, 6], depart: [-30, 170] },
  { couleur: 'amber', lignes: [3], depart: [590, 70] },
  { couleur: 'green', lignes: [4], depart: [590, 230] },
];

export const COULEUR_LIGNE = new Map(TRAVAIL.flatMap(({ couleur, lignes }) => lignes.map((l) => [l, couleur] as const)));

/** The middle of a cell, in the window's own coordinates. */
export const centre = (ligne: number, colonne: number): [number, number] => [
  GX + NUM + DEBUTS[colonne] + COLONNES[colonne] / 2,
  GY + TETE + LIGNE * ligne + LIGNE / 2,
];
