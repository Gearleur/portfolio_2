import { RETENU as TYPO } from '../m2/retenu';
import type { Reglages as Type } from '../m2/reglages';
import { RETENU as PASSAGE } from '../m4/retenu';
import type { Reglages as Passage } from '../m4/reglages';
import { RETENU as CONTENU } from '../m5/retenu';
import type { Reglages as Contenu } from '../m5/reglages';
import type { Reglages } from './telephone';

/*
 * What the phone's settings (telephone.ts) make of the pieces retained on a desktop: the passage
 * of M4, the type of M2 and the aids of M5, each as it was validated but for what a screen of
 * 390 px and a finger change. Fetched with the passage, not before.
 */

/** The margin around the terminal's lines, px: half the desktop's (m6.css counts on it). */
export const MARGE = 16;

/** The number's size while the bubble spreads, px: its six figures take three quarters of the screen's width. */
const CHIFFRE = 92;

/**
 * The passage on a phone: the same bubble, from the switch's knob wherever it is. The number has
 * no strip to stand in: it is large in the middle of the screen while the bubble spreads, then
 * gives way to the terminal, which writes it small on one of its lines; or it stays behind them.
 */
export const passageDe = ({ duree, largeur, numero }: Pick<Reglages, 'duree' | 'largeur' | 'numero'>, langue: Passage['langue']): Passage => ({
  ...PASSAGE,
  duree,
  largeur,
  place: 'centre',
  corps: CHIFFRE,
  langue,
  force: numero === 'filigrane' ? PASSAGE.force : 0,
});

/** The type: M2's, at the phone's size, with half the margin and more room between the lines of a narrow column. */
export const typeDe = (corps: number): Type => ({ ...TYPO, police: { ...TYPO.police, corps }, grille: { ...TYPO.grille, marge: MARGE, interligne: 1.45 } });

/**
 * The aids: M5's, without the bar of keys (the phone draws its own last line). A name is chosen
 * in reverse video only where there are keys to move it; and where the terminal is a list, the
 * command is no more than a trace: it is written at once.
 */
export const contenuDe = ({ pave, rangs, liste }: Pick<Reglages, 'pave' | 'rangs' | 'liste'>): Contenu => ({
  ...CONTENU,
  liste,
  touches: false,
  selection: pave ? 'inverse' : 'aucune',
  suggestion: pave,
  ...(rangs === 'feuille' ? { vitesse: 0, sortie: 'coup' as const } : {}),
});

/** The large number's figures, px: the console face is drawn smaller than the serif would be (nombre.ts). The copy that is put away starts at that size. */
export const GRAND = CHIFFRE * 0.78;
