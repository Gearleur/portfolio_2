import { inkPalette } from './color';
import type { Inks } from './color';
import type { FondSettings } from './Fond';

/**
 * Validated design tokens that are not plain CSS. Each one is logged in the
 * journal of docs/atelier/README.md; tokens.css mirrors the colours the
 * stylesheets need (tokens.test.ts keeps both in step).
 */

/** Coquelicot, validated at step 1 (journal n° 19): cube cursor, selection, highlights. */
export const ACCENT = { name: 'Coquelicot', hex: '#E0301F', onAccent: '#FFFFFF' };

/** Inks « Noir », validated at step 2 (journal n° 22): text, labels, rules. */
export const INKS: Inks = { hue: 122, chroma: 0.004, ink: 0.2, soft: 0.5, line: 0.9 };
export const INK_COLORS = inkPalette(INKS);

/**
 * Support colours kept from the Feral UI « Snow crimson » palette (journal n° 23,
 * docs/atelier/references/feralui-palette-appoint.png). Their roles come with the
 * components at step 6.
 */
export const APPOINT = [
  { name: 'Moonwash Blue', hex: '#DBEAF4' },
  { name: 'Misted Sky', hex: '#E5EDF3' },
  { name: 'Moonwash Blue', hex: '#CADCE4' },
  { name: 'Deep Hanada', hex: '#354050' },
  { name: 'Orchid Grey', hex: '#392932' },
  { name: 'Smoked Beni', hex: '#7F1727' },
  { name: 'Smoked Beni', hex: '#8E0A1F' },
];

/** Wave colour compositions, after the Feral UI gradients (docs/atelier/references/feralui-*). */
export const WAVE_COMPOSITIONS = {
  aube: ['#2B3349', '#9AA6C3', '#F9A5BD', '#EA3F1C'],
  // Snow crimson's exact Moonwash Blue, Deep Hanada and Smoked Beni (journal n° 24), led by vermillon.
  'neige-vermillon': ['#DBEAF4', '#354050', '#8E0A1F', '#EA3F1C'],
  crepuscule: ['#04122B', '#2BB3D9', '#EEF2F4', '#F28C7A', '#4A0F5C'],
} satisfies Record<string, string[]>;

export type WaveCompositionId = keyof typeof WAVE_COMPOSITIONS;

/** The background validated at step 1 (journal n° 13 and 17). */
export const FOND: FondSettings & { waveId: WaveCompositionId } = {
  color: { lightness: 0.98, chroma: 0.004, hue: 122 },
  grain: { strength: 0.05, size: 0.75, irregularity: 0.75 },
  waveId: 'neige-vermillon',
  wave: {
    colors: WAVE_COMPOSITIONS['neige-vermillon'],
    first: 0.16,
    echo: 0.14,
    fade: 0.55,
    firstDelay: 1.2,
    every: 30,
    duration: 11,
  },
};

/** Project pages keep the background without the wave, which gets in the way of reading (journal n° 78). */
export const FOND_LECTURE: FondSettings = { ...FOND, wave: { ...FOND.wave, first: 0, echo: 0 } };

/**
 * The type validated at step 3 (journal n° 32, title retuned in n° 35; text and
 * labels raised to 15 px at real size in n° 75, like Rachel Chen's). Sizes are px
 * for a 1440 px wide page; `font` is the typothèque id. tokens.css mirrors it.
 */
export const TYPO = {
  display: { font: 'instrument-serif', family: 'Instrument Serif', size: 72, tracking: 0.01, weight: 400 },
  text: { font: 'inter', family: 'Inter', size: 15 },
  label: { font: 'inter', family: 'Inter', size: 15, caps: false },
  /** Subheadings step up from the text by this ratio. */
  ratio: 1.25,
};

/**
 * Spacing and grid validated at step 4 (journal n° 36): a 4 px unit in
 * multiples, 16 columns. px for a 1440 px wide page; tokens.css mirrors it.
 */
export const ESPACES = {
  base: 4,
  progression: 'multiples' as const,
  scale: [4, 8, 12, 16, 24, 32, 48, 64],
  columns: 16,
  gutter: 16,
  margin: 16,
};
