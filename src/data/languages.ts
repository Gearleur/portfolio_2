import type { WindowFrame } from '../types/window';

export type LanguageEntry = {
  id: string;
  label: string;
  level: string;
  note: string;
  tone: 'leaf' | 'sky';
};

export const languageEntries: LanguageEntry[] = [
  {
    id: 'french',
    label: 'Français',
    level: 'Native',
    note: 'Clear written and spoken communication for academic, technical and everyday contexts.',
    tone: 'leaf',
  },
  {
    id: 'english',
    label: 'English',
    level: 'B2',
    note: 'Comfortable in international academic and engineering environments.',
    tone: 'sky',
  },
];

export const DEFAULT_LANGUAGES_FRAME: WindowFrame = {
  x: 220,
  y: 116,
  width: 620,
  height: 440,
};
