import { RETENU as INTERRUPTEUR } from '../m3/retenu';
import type { Reglages as Interrupteur } from '../m3/reglages';

/*
 * The Machine mode on a phone (Atelier 2, step M6): what is decided of it, and the little the
 * switch needs to know. A phone has no keyboard, no arrows, no pointer to hover with, about forty
 * columns and no room for a strip beside the terminal: the switch finds another place, one moves
 * about with a finger, and the number goes where a line has room for it.
 *
 * Kept light: this file and Mobile.tsx are all a phone fetches before the switch is thrown. What
 * the passage and the terminal take of these settings is in derives.ts, fetched with them.
 */

export type Reglages = {
  /** Where the switch lives: in the notch of glass, between the name and « Menu »; at the bottom in the middle, under the thumb; or in the menu's sheet only. */
  interrupteur: 'encoche' | 'bas' | 'menu';
  /** The pill's height, px of a 390 px page. */
  taille: number;
  /** A name touched opens it, always. Besides, a swipe to the right goes back, as in a native list. */
  gestes: boolean;
  /** And a pad of big keys at the bottom drives the chosen name, as the arrows do on a desktop. */
  pave: boolean;
  /** A listing's rows: a terminal's lines, the command typing itself; or a native list's, each across the screen with its weight on the right, the command no more than a trace. */
  rangs: 'lignes' | 'feuille';
  /** The height of a row that can be touched, px. */
  cible: number;
  /** The height of the pad's keys, px. */
  touche: number;
  /** Large in the middle while the bubble spreads, the number is then put away small, in the terminal's last line or on its first; or it stays large behind the lines, as on the desktop's bench. */
  numero: 'etat' | 'haut' | 'filigrane';
  /** The text's size, px: it sets how many columns the screen has. */
  corps: number;
  /** `ls -s`, a weight and a name; or `ls -l`, with what the file is, cut where the screen ends. */
  liste: 'courte' | 'longue';
  /** How long the bubble takes to cover the screen, ms. */
  duree: number;
  /** The rim's width when the bubble is at its fastest, px. */
  largeur: number;
  /** The most px of the bubble's canvas per px of the page: a phone's screen has 3. */
  densite: number;
  /** The passage and the terminal are fetched at the first touch towards the switch, or ahead, once the page is idle. */
  chargement: 'toucher' | 'repos';
};

/** The notch's middle under the top of the screen, px of a 390 px page (navmobile.css: 10 + 42 / 2). The terminal's first line takes it. */
export const RANG = 31;

/**
 * The switch as a phone draws it: the object retained at M3, at another scale. In the notch its
 * pill is shorter, about the size of a phone's own switches, so that it fits between the name and
 * « Menu »; elsewhere it keeps the desktop's proportions. Its place is the stage's (m6.css).
 */
export function interrupteurDe({ interrupteur, taille }: Pick<Reglages, 'interrupteur' | 'taille'>): Interrupteur {
  return { ...INTERRUPTEUR, largeur: interrupteur === 'encoche' ? 168 : INTERRUPTEUR.largeur, echelle: taille / INTERRUPTEUR.hauteur, bas: 0 };
}

type Rect = { left: number; right: number; top: number; bottom: number; width: number };

/**
 * Where the pill stands in the notch, px of the stage: in the middle of the room between the
 * notch's first piece and its last (the name and « Menu », or « ‹ Projets » and « Menu »), on
 * their line. Pieces that are not drawn (the name, on a project's page) do not count; null when
 * the notch is not there to be read.
 */
export function placeEncoche(pieces: Rect[], cadre: { left: number; top: number }) {
  const vues = pieces.filter((piece) => piece.width > 0).sort((a, b) => a.left - b.left);
  if (vues.length < 2) return null;
  const [avant, apres] = [vues[0], vues[vues.length - 1]];
  return { x: (avant.right + apres.left) / 2 - cadre.left, y: (avant.top + avant.bottom) / 2 - cadre.top };
}

/** What a browser says of the network, where it says anything (not on iOS). */
export type Connexion = { saveData?: boolean; effectiveType?: string } | undefined;

/**
 * Whether the passage may be fetched ahead, once the page is idle: not for a visitor who asked to
 * save data, nor on a 2G network, where it would be taken from the page itself. There it waits
 * for the first touch.
 */
export const peutPrecharger = (connexion: Connexion) => !connexion?.saveData && !/2g$/.test(connexion?.effectiveType ?? '');
