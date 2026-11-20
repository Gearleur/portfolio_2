import type { Reglages } from './telephone';

/*
 * What was retained at M6 (the phone), and what it takes to draw it: nothing more than the settings.
 * Apart from the bench's own (reglages.ts: its bounds, its propositions, what it keeps and
 * copies), so that the Vitrine's Machine mode takes this and nothing of the bench. Kept light:
 * a phone fetches it with the switch, before anything of the terminal.
 */

/**
 * What was retained at M6 (Alexandre, 2026-11-20), the bench's start and what « Réinitialiser »
 * goes back to. The switch in the notch of glass, between the name and « Menu », a pill of
 * 59 × 28 px; one moves about by touching the names, and a swipe to the right goes back, on
 * targets of 48 px, without a pad; the listings as a native list (« feuille »: a row per file
 * across the screen, the command written at once); the number large while the bubble spreads,
 * then behind the lines; the text at 13 px, `ls -s`; the bubble in 1.5 s, a rim of 140 px, a
 * canvas capped at 1.5 px per px; the passage fetched ahead once the page is idle, unless the
 * visitor saves data or is on 2G.
 */
export const RETENU: Reglages = {
  interrupteur: 'encoche',
  taille: 28,
  gestes: true,
  pave: false,
  rangs: 'feuille',
  cible: 48,
  touche: 52,
  numero: 'filigrane',
  corps: 13,
  liste: 'courte',
  duree: 1500,
  largeur: 140,
  densite: 1.5,
  chargement: 'repos',
};
