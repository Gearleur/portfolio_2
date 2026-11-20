import type { Reglages } from './reglages';

/*
 * What was retained at M5 (the content and the way to move about), and what it takes to draw it: nothing more than the settings.
 * Apart from the bench's own (reglages.ts: its bounds, its propositions, what it keeps and
 * copies), so that the Vitrine's Machine mode takes this and nothing of the bench.
 */

/**
 * What was retained at M5 (Alexandre, 2026-11-19): « Touches », with an arrow back in view, the
 * folder's menu offered again under every file read, the Markdown arranged a little and without
 * its pictures, folded at 128 columns. The mouse works throughout.
 */
export const RETENU: Reglages = { selection: 'inverse', suggestion: true, touches: true, retour: 'fleche', relister: true, invite: 'signe', liste: 'longue', vitesse: 60, sortie: 'ligne', ecran: 'neuf', pliage: 128, numeros: false, markdown: 'agence' };
