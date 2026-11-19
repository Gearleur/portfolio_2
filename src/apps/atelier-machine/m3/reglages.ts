import type { Borne } from '../m1/reglages';

/*
 * The Human / Machine switch (Atelier 2, step M3): what the bench tunes. One kind of object,
 * after Alexandre's reference: a large light pill, a big round domed knob that carries a word,
 * and a sunken window where the reference shows a photograph. The mode is 0 or 1: the knob
 * slides from one end of the pill to the other and settles there. Three propositions to start
 * from, which differ on what fills the window, on how the coquelicot tells the passage, on what
 * the knob carries and on the matter; then bounded sliders: a direction, not a free hand.
 */

export type Reglages = {
  /** The pill, px of a 1440 px page. */
  largeur: number;
  hauteur: number;
  /** The whole object drawn smaller, shadows and letters with it: 1 is the reference's size, 0.4 about that of the name in the page's side. */
  echelle: number;
  /** Its corners, as a share of half its height: 1 is a full pill. */
  rayon: number;
  /** How deep the shadows of the knob and of the window go. */
  relief: number;
  /** Glazed white ceramic, clear frosted glass, or a matt biscuit. */
  matiere: 'ceramique' | 'verre' | 'mat';
  /**
   * What the sunken window holds in place of the photograph: one poppy gradient from the paper to
   * the terminal's night (pétale); a fragment of the other side (judas); or a plain hollow that
   * fills with coquelicot in the knob's wake (coulée).
   */
  fenetre: 'petale' | 'judas' | 'coulee';
  /** How much coquelicot: the breadth of the red in the petal, the leak of the judas, the strength of the wake. */
  coquelicot: number;
  /** The knob stays round, or becomes the site's coquelicot cube on the Machine side. */
  forme: 'rond' | 'cube';
  /** What the knob carries: the mode's name, a sign (Aa, >_), 0 / 1, or nothing. */
  porte: 'mot' | 'signe' | 'chiffre' | 'rien';
  /** Humain / Machine written beside the pill, in its window, or nowhere. */
  libelles: 'aucun' | 'cotes' | 'fenetre';
  /** From the bottom of the screen to the pill, px. */
  bas: number;
  /** The terminal's screen stops above the switch, or runs under it as M5 left it. */
  terminal: 'arret' | 'dessous';
  /** The slide from one side to the other, ms. */
  duree: number;
  /** How much the knob runs into the pill's end and squashes there, 0–1. */
  elasticite: number;
  /** navigator.vibrate when the mode changes, on the phones that can. */
  vibration: boolean;
};

export const BORNES = {
  largeur: { min: 296, max: 400, step: 8 },
  hauteur: { min: 80, max: 108, step: 4 },
  echelle: { min: 0.3, max: 1, step: 0.05 },
  rayon: { min: 0.5, max: 1, step: 0.05 },
  relief: { min: 0.6, max: 1.4, step: 0.05 },
  coquelicot: { min: 0.2, max: 1, step: 0.05 },
  bas: { min: 16, max: 64, step: 4 },
  duree: { min: 200, max: 640, step: 20 },
  elasticite: { min: 0, max: 1, step: 0.05 },
} satisfies Partial<Record<keyof Reglages, Borne>>;

/** The values each switch of the panel may take. */
export const OPTIONS = {
  matiere: ['ceramique', 'verre', 'mat'],
  fenetre: ['petale', 'judas', 'coulee'],
  forme: ['rond', 'cube'],
  porte: ['mot', 'signe', 'chiffre', 'rien'],
  libelles: ['aucun', 'cotes', 'fenetre'],
  terminal: ['arret', 'dessous'],
  vibration: [false, true],
} as const satisfies { [K in Exclude<keyof Reglages, keyof typeof BORNES>]: readonly Reglages[K][] };

export type Proposition = { id: string; nom: string; pari: string; reglages: Reglages };

/** The three bets on the same kind of button. */
export const PROPOSITIONS: Proposition[] = [
  {
    id: 'petale',
    nom: 'Pétale',
    pari: 'Le plus près de ta référence : céramique claire, gros bouton bombé qui porte le nom du mode, écrit dans la lettre de son monde. À la place de la photo, la fenêtre en creux est un pétale : un seul dégradé, du papier à la nuit du terminal en passant par le coquelicot. Le bouton glisse dessus et découvre l’autre moitié.',
    reglages: { largeur: 344, hauteur: 96, echelle: 1, rayon: 1, relief: 1, matiere: 'ceramique', fenetre: 'petale', coquelicot: 0.6, forme: 'rond', porte: 'mot', libelles: 'aucun', bas: 28, terminal: 'arret', duree: 420, elasticite: 0.35, vibration: true },
  },
  {
    id: 'judas',
    nom: 'Judas',
    pari: 'La fenêtre montre l’autre côté, comme la photo de la référence montre un visage : sur la page humaine, trois lignes de terminal et son curseur coquelicot ; côté machine, un bout du titre en serif, surligné. La pilule est en verre, le bouton porte un signe (Aa, >_) et les deux mots sont posés dehors. Le coquelicot ne remplit rien : il est l’accent commun aux deux mondes, et la lueur dans la fente.',
    reglages: { largeur: 376, hauteur: 92, echelle: 1, rayon: 1, relief: 0.9, matiere: 'verre', fenetre: 'judas', coquelicot: 0.5, forme: 'rond', porte: 'signe', libelles: 'cotes', bas: 28, terminal: 'arret', duree: 520, elasticite: 0.55, vibration: true },
  },
  {
    id: 'cube',
    nom: 'Cube',
    pari: 'C’est le bouton qui change de nature : un galet mat côté humain (0), le cube coquelicot du pointeur côté machine (1). La pilule est mate et plus carrée ; la fenêtre est un simple creux où le nom du mode est gravé, avec une braise de coquelicot dans le sillage du cube. Le geste est sec, presque sans rebond.',
    reglages: { largeur: 320, hauteur: 88, echelle: 1, rayon: 0.6, relief: 0.8, matiere: 'mat', fenetre: 'coulee', coquelicot: 0.35, forme: 'cube', porte: 'chiffre', libelles: 'fenetre', bas: 28, terminal: 'arret', duree: 280, elasticite: 0.1, vibration: true },
  },
];

/**
 * The switch retained at M3 (Alexandre, 2026-11-19): « Pétale » in glass, the knob carrying 0 / 1,
 * no label, and small: at 0.4 the pill is about 118 × 32 px, the size of the name in the page's
 * side laid flat. Discreet, at the bottom in the middle, 16 px from the edge.
 */
export const RETENU: Reglages = { largeur: 296, hauteur: 80, echelle: 0.4, rayon: 1, relief: 0.6, matiere: 'verre', fenetre: 'petale', coquelicot: 0.8, forme: 'rond', porte: 'chiffre', libelles: 'aucun', bas: 16, terminal: 'arret', duree: 560, elasticite: 0.7, vibration: true };

/** The bench's state: the settings, and the proposition they started from. */
export type Etat = { depart: string; reglages: Reglages };

export const proposition = (id: string) => PROPOSITIONS.find((p) => p.id === id) ?? PROPOSITIONS[0];

export const etatDe = (id: string): Etat => {
  const p = proposition(id);
  return { depart: p.id, reglages: p.reglages };
};

const CLES = Object.keys(PROPOSITIONS[0].reglages) as (keyof Reglages)[];

/** The proposition these settings are, untouched, if they are one. */
export const intacte = (reglages: Reglages) => PROPOSITIONS.find((p) => CLES.every((cle) => p.reglages[cle] === reglages[cle]));

// --- the object's measures

/** The room the terminal leaves between its last line and the pill, px. */
export const ECART = 20;

/**
 * The pill's measures, px of a 1440 px page: the knob's inset, its diameter, how far it travels,
 * the strip of pill left between the knob and the window, and what the terminal's screen gives
 * up at its bottom so that its last line (the keys, the status) stands above the pill. `marge`
 * is the margin the terminal's grid already keeps (M2).
 */
export function geometrie({ largeur, hauteur, bas, terminal, echelle = 1 }: Pick<Reglages, 'largeur' | 'hauteur' | 'bas' | 'terminal'> & { echelle?: number }, marge = 32) {
  const retrait = Math.round(hauteur * 0.085);
  return {
    retrait,
    bouton: hauteur - 2 * retrait,
    course: largeur - hauteur,
    joint: Math.round(retrait * 1.25),
    // what the pill takes on the page, once drawn at its scale
    reserve: terminal === 'arret' ? Math.max(0, Math.round(bas + hauteur * echelle + ECART - marge)) : 0,
  };
}

/** The side a knob let go at `p` (0 Human, 1 Machine) falls to: the nearest. True is Machine. */
export const retombe = (p: number) => p > 0.5;

/** The slide's easing: how far past the end the knob would run, which the pill turns into a squash. */
export const elan = (elasticite: number) => Math.round((1 + 0.6 * elasticite) * 1000) / 1000;

// --- storage

const CLE = 'atelier-machine:m3:v1';

const borner = (valeur: unknown, { min, max, step }: Borne, defaut: number) => {
  if (typeof valeur !== 'number' || !Number.isFinite(valeur)) return defaut;
  const cran = min + Math.round((Math.min(max, Math.max(min, valeur)) - min) / step) * step;
  return Math.round(cran * 1000) / 1000;
};

/** Reads settings kept or pasted: what is missing or not allowed falls back on the starting proposition. */
export function valider(brut: unknown): Etat | null {
  if (typeof brut !== 'object' || brut === null) return null;
  const { depart, reglages } = brut as { depart?: unknown; reglages?: unknown };
  if (typeof reglages !== 'object' || reglages === null) return null;
  const base = proposition(typeof depart === 'string' ? depart : '');
  const lu = reglages as Record<string, unknown>;
  const permis = OPTIONS as Record<string, readonly unknown[]>;
  const bornes = BORNES as Record<string, Borne>;
  const valeurs = CLES.map((cle) => [cle, cle in bornes ? borner(lu[cle], bornes[cle], base.reglages[cle] as number) : permis[cle].includes(lu[cle]) ? lu[cle] : base.reglages[cle]]);
  return { depart: base.id, reglages: Object.fromEntries(valeurs) as Reglages };
}

export function lire(): Etat {
  try {
    const garde = valider(JSON.parse(localStorage.getItem(CLE) ?? 'null'));
    if (garde) return garde;
  } catch {
    // Storage can be unavailable or hold an older shape; start from what was retained.
  }
  return { depart: 'petale', reglages: RETENU };
}

export function garder(etat: Etat) {
  try {
    localStorage.setItem(CLE, JSON.stringify(etat));
  } catch {
    // Keeping the settings across reloads is a convenience only.
  }
}

// --- the summary to paste

export const NOMS = {
  matiere: { ceramique: 'céramique claire', verre: 'verre', mat: 'mat' },
  fenetre: { petale: 'pétale (dégradé papier, coquelicot, nuit)', judas: 'judas (l’autre côté)', coulee: 'coulée (creux qui se remplit)' },
  forme: { rond: 'rond', cube: 'rond, puis cube coquelicot côté machine' },
  porte: { mot: 'le nom du mode', signe: 'un signe (Aa, >_)', chiffre: '0 / 1', rien: 'rien' },
  libelles: { aucun: 'aucun', cotes: 'de part et d’autre de la pilule', fenetre: 'dans la fenêtre' },
  terminal: { arret: 's’arrête au-dessus de la pilule', dessous: 'passe dessous' },
} satisfies { [K in 'matiere' | 'fenetre' | 'forme' | 'porte' | 'libelles' | 'terminal']: Record<Reglages[K], string> };

export const pourcent = (v: number) => `${Math.round(v * 100)} %`;
export const fois = (v: number) => `×${v.toFixed(2).replace('.', ',')}`;

/** What « Copier mes réglages » puts in the clipboard: a few lines to read, then the same as JSON. */
export function resume({ depart, reglages }: Etat) {
  const r = reglages;
  const telle = intacte(r);
  const { reserve } = geometrie(r);
  return [
    `Mode machine · M3, le curseur : ${telle ? `proposition « ${telle.nom} », telle quelle` : `partie de « ${proposition(depart).nom} », réglée à la main`}`,
    `Objet : pilule de ${r.largeur} × ${r.hauteur} px à l’échelle ${fois(r.echelle)}, soit ${Math.round(r.largeur * r.echelle)} × ${Math.round(r.hauteur * r.echelle)} px · rayon ${pourcent(r.rayon)} · relief ${fois(r.relief)} · matière ${NOMS.matiere[r.matiere]}`,
    `Fenêtre : ${NOMS.fenetre[r.fenetre]} · part de coquelicot ${pourcent(r.coquelicot)} · bouton ${NOMS.forme[r.forme]}`,
    `Mots : le bouton porte ${NOMS.porte[r.porte]} · libellés ${NOMS.libelles[r.libelles]}`,
    `Place : en bas au milieu, à ${r.bas} px du bord · le terminal ${NOMS.terminal[r.terminal]}${reserve ? ` (son écran rend ${reserve} px)` : ''}`,
    `Geste : ${r.duree} ms · élasticité ${pourcent(r.elasticite)} · vibration ${r.vibration ? 'oui' : 'non'}`,
    JSON.stringify({ depart, reglages }),
  ].join('\n');
}
