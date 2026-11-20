import { WAVE_COMPOSITIONS } from '../../atelier/tokens';
import type { Reglages } from './reglages';

/*
 * What was retained at M4 (the passage), and what it takes to draw it: the rim's tints, the black side's colour, the number's label, the curve's exponent.
 * Apart from the bench's own (reglages.ts: its bounds, its propositions, what it keeps and
 * copies), so that the Vitrine's Machine mode takes this and nothing of the bench.
 */

/**
 * The passage retained at M4 (Alexandre, 2026-11-20), the bench's start and what « Réinitialiser »
 * goes back to. One black bubble grows from the switch's knob and draws back into it, slow at its
 * start and fast at its end both ways, its rim in the tints of the site's wave. Its black carries
 * his number, in the terminal's face, on the left, which stays at 70 % under a terminal that
 * shows its glass, then prints its lines. The erased page of M1 is no longer behind the terminal.
 */
export const RETENU: Reglages = {
  foyer: 'bouton',
  retrait: 'bouton',
  duree: 1900,
  retour: 0.75,
  courbe: 0.8,
  amorce: 0,
  delai: 150,
  entree: 400,
  genre: 'lignes',
  transparence: 0.16,
  taille: 0.8,
  cote: 'droite',
  direction: 0,
  teintes: 'onde',
  largeur: 260,
  intensite: 1.4,
  saturation: 1.2,
  lettre: 'mono',
  corps: 56,
  place: 'gauche',
  etiquette: 'dessous',
  langue: 'fr',
  flou: 8,
  force: 0.7,
  trace: 'plein',
  fond: 0.2,
  numero: '102923',
};

// --- the rim's tints

type Cinq = [string, string, string, string, string];

const [neige, ardoise, sang, vermillon] = WAVE_COMPOSITIONS['neige-vermillon'];

/** Halfway between two #rrggbb. */
function milieu(a: string, b: string) {
  const canal = (i: number) => Math.round((parseInt(a.slice(i, i + 2), 16) + parseInt(b.slice(i, i + 2), 16)) / 2);
  return `#${[1, 3, 5].map((i) => canal(i).toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Five tints along the rim, from its top to its bottom. The reference's run from red orange to
 * cyan; the wave's are the Vitrine's own (tokens.ts), the warm ones first and the snow where the
 * reference is at its whitest; the coquelicot's are those of the switch's petal.
 */
export const TEINTES: Record<Reglages['teintes'], Cinq> = {
  reference: ['#ff5a1f', '#ff2f62', '#6a3cff', '#1f7bff', '#14d8f2'],
  onde: [vermillon, sang, neige, milieu(neige, ardoise), ardoise],
  coquelicot: ['#ff8a70', '#e0301f', '#e0301f', '#b3202a', '#7f1727'],
};

// --- the black side

/** The night blue as M1 showed it: its sheet of glass, oklch(0.19 0.022 262) at 82 %, over the paper. */
const NUIT = [56, 61, 69];

/** The black side's colour, 0–255: from pure black to that night blue. It is the bubble's inside, on which the terminal's glass is posed. */
export const fondMachine = (fond: number) => NUIT.map((canal) => Math.round(canal * fond)) as [number, number, number];

// --- the label over the number

export const ETIQUETTES: Record<Reglages['langue'], string> = { fr: 'Humain n°', en: 'Human no.' };

/** The exponent of the acceleration: the bubble's radius grows as the time to that power. */
export const exposant = (courbe: number) => Math.round((1 + 3 * courbe) * 100) / 100;

/**
 * The strip of black left bare beside the terminal, px of a 1440 px page: the number is written
 * there, small. The terminal takes all the rest of the screen, whatever its width (Alexandre,
 * 2026-11-20: on a wide screen a sheet of fixed width left a third of it empty, and on a narrow
 * one it cut the number in two).
 */
export const BANDE = 232;
