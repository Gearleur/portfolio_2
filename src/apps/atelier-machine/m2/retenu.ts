import type { Police, Reglages } from './reglages';

/*
 * What was retained at M2 (type and grid), and what it takes to draw it: the terminal's face and its CSS font-family.
 * Apart from the bench's own (reglages.ts: its bounds, its propositions, what it keeps and
 * copies), so that the Vitrine's Machine mode takes this and nothing of the bench.
 */

/**
 * The type and grid retained at M2 (Alexandre, 2026-11-19): each system's own console face at
 * 14 px, the full sheet with a 32 px margin, three stepped greys, a blinking block, a « $ »
 * prompt and a discreet status line. The next steps start from it.
 */
export const RETENU: Reglages = {
  police: { maniere: 'classique', face: 'jetbrains', corps: 14, graisse: 410, chasse: 1.02 },
  grille: { maniere: 'pleine', colonnes: 80, marge: 32, interligne: 1.3, aeree: true },
  gris: { maniere: 'etage', commande: 1, sortie: 0.85, meta: 0.58 },
  curseur: { maniere: 'bloc', clignote: true },
  habillage: { maniere: 'etat', invite: 'minimale' },
};

/** The faces the site can serve: free, variable in weight, already in the typothèque (SIL OFL 1.1). */
export const FACES: { id: Police['face']; nom: string }[] = [
  { id: 'jetbrains', nom: 'JetBrains Mono' },
  { id: 'geist', nom: 'Geist Mono' },
];

/**
 * What is asked of each system, in order: the first face it has is the one shown. « Classique » is
 * the console of the 2000s and 2010s (Mac, Windows, Linux); « courante » what a terminal opens with
 * today (Mac, Windows 11, Ubuntu), then the classics.
 */
export const PILES: Record<Exclude<Police['maniere'], 'embarquee'>, string[]> = {
  classique: ['Menlo', 'Consolas', 'DejaVu Sans Mono', 'Liberation Mono'],
  courante: ['ui-monospace', 'SF Mono', 'Cascadia Mono', 'Ubuntu Sans Mono', 'Ubuntu Mono', 'Menlo', 'Consolas', 'DejaVu Sans Mono'],
};

const citee = (police: string) => (police === 'ui-monospace' ? police : `'${police}'`);
export const nomFace = (id: Police['face']) => FACES.find((face) => face.id === id)?.nom ?? FACES[0].nom;

/** The CSS font-family of a face: the one the site serves falls back on the classics while it loads. */
export function famille({ maniere, face }: Pick<Police, 'maniere' | 'face'>) {
  const pile = maniere === 'embarquee' ? [nomFace(face), ...PILES.classique] : PILES[maniere];
  return `${pile.map(citee).join(', ')}, monospace`;
}
