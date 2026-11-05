import { CATALOG } from './fonts/catalog';

export type Category = 'gluant' | 'pixel' | 'editorial' | 'innovant' | 'institutionnel';

/** [min, max, default] of a variable axis. */
type Axis = [number, number, number];

export type CatalogFont = {
  id: string;
  family: string;
  category: Category;
  note: string;
  /** Fontsource category, used for the fallback stack. */
  kind: string;
  /** Downloaded woff2 in ./fonts, registered on demand. Absent for faces declared in CSS. */
  file?: string;
  axes: Record<string, Axis> | null;
  /** Single weight of a static face. */
  weight: number | null;
  /** Departure Mono is drawn on an 11 px grid: it stays crisp at multiples of it. */
  grid?: number;
};

/** What a face is used for on the page. */
export type Role = 'display' | 'text' | 'label';
export type FontChoice = Record<Role, string>;

export const ROLES: { id: Role; name: string }[] = [
  { id: 'display', name: 'Titre' },
  { id: 'text', name: 'Texte' },
  { id: 'label', name: 'Étiquettes' },
];

export const CATEGORIES: { id: Category; name: string }[] = [
  { id: 'gluant', name: 'Gluant' },
  { id: 'pixel', name: 'Pixel' },
  { id: 'editorial', name: 'Éditorial' },
  { id: 'innovant', name: 'Innovant' },
  { id: 'institutionnel', name: 'Institutionnel' },
];

// Faces already self-hosted in public/fonts and declared in tokens.css / typo.css.
const LOCAL: CatalogFont[] = [
  { id: 'inter', family: 'Inter', category: 'institutionnel', note: 'La base actuelle du site : neutre et très lisible.', kind: 'sans-serif', axes: { wght: [100, 900, 400] }, weight: null },
  { id: 'departure-mono', family: 'Departure Mono', category: 'pixel', note: 'Mono pixel dessinée sur une grille de 11 px, déjà dans le site.', kind: 'monospace', axes: null, weight: 400, grid: 11 },
  { id: 'instrument-serif', family: 'Instrument Serif', category: 'editorial', note: 'Serif condensée et élégante : ton choix actuel.', kind: 'serif', axes: null, weight: 400 },
];

/** Every font of the typothèque: SIL Open Font License, or public domain. */
export const FONTS: CatalogFont[] = [...LOCAL, ...CATALOG];

const FILE_URLS = import.meta.glob<string>('./fonts/*.woff2', { query: '?url', import: 'default', eager: true });

export const findFont = (id: string) => FONTS.find((font) => font.id === id) ?? FONTS[0];

const FALLBACKS: Record<string, string> = {
  serif: 'Georgia, serif',
  monospace: 'ui-monospace, monospace',
};

export function fontStack(font: CatalogFont) {
  return `'${font.family}', ${FALLBACKS[font.kind] ?? 'system-ui, sans-serif'}`;
}

const pending = new Map<string, Promise<void>>();

/** Registers a downloaded face with the document the first time it is needed. */
export function ensureFont(font: CatalogFont) {
  const url = font.file && FILE_URLS[`./fonts/${font.file}`];
  if (!url) return Promise.resolve();
  let loading = pending.get(font.id);
  if (!loading) {
    const { wght, wdth } = font.axes ?? {};
    const face = new FontFace(font.family, `url(${url}) format('woff2')`, {
      weight: wght ? `${wght[0]} ${wght[1]}` : String(font.weight ?? 400),
      ...(wdth && { stretch: `${wdth[0]}% ${wdth[1]}%` }),
      display: 'swap',
    });
    document.fonts.add(face);
    loading = face.load().then(
      () => undefined,
      () => undefined,
    );
    pending.set(font.id, loading);
  }
  return loading;
}

const AXIS_NAMES: Record<string, string> = {
  wght: 'graisse',
  wdth: 'largeur',
  opsz: 'taille optique',
  slnt: 'inclinaison',
  SOFT: 'douceur',
  WONK: 'bizarrerie',
  YEAR: 'année',
  MORF: 'déformation',
  CASL: 'décontraction',
  MONO: 'mono',
  CRSV: 'cursive',
  ROND: 'arrondi',
  SCAN: 'balayage',
  BLED: 'bavure',
  ELSH: 'forme des pixels',
  ELGR: 'grille',
  ELXP: 'éclatement',
  ROTA: 'rotation',
  XROT: 'rotation X',
  YROT: 'rotation Y',
  EDPT: 'profondeur',
  EHLT: 'reflet',
  SHLN: 'ombre',
};

export function describeAxes(font: CatalogFont) {
  if (!font.axes) return 'Une seule graisse';
  const axes = Object.entries(font.axes).map(([tag, [min, max]]) =>
    tag === 'wght' ? `graisse ${min}–${max}` : (AXIS_NAMES[tag] ?? tag),
  );
  return `Variable : ${axes.join(', ')}`;
}
