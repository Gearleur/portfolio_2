/*
 * The matter of the Machine state (Atelier 2, step M1): what the bench tunes.
 *
 * Four parts: what is left of the human page, the eraser's strokes, the sunken
 * thumbnails, the terminal's smoked glass. Each part has a manner and bounded
 * sliders: the bounds are the direction. The three propositions are starting
 * points, one manner of each part; taking a part's manner from another
 * proposition brings that part as it was proposed, to be tuned from there.
 */

export type Borne = { min: number; max: number; step: number };

export type Page = {
  /** Ghost of the ink, a grey stroke per line, or a blind embossing. */
  maniere: 'fantome' | 'blocs' | 'sec';
  /** How much of the words is left, 0–1. */
  reste: number;
  /** How far the eraser dragged what is left, px of a 1440 px page. */
  bavure: number;
  /** How much coquelicot survives in what is left, 0–1. */
  accent: number;
  /** The paper's lightness (OKLCH); the Vitrine's is 0.98. */
  papier: number;
  /** The paper's grain, as a share of the Vitrine's. */
  grain: number;
};

export type Gomme = {
  /** Rubbed back and forth, one straight pass, or a wide sweep of the arm. */
  maniere: 'frottis' | 'passes' | 'balayage';
  nombre: number;
  /** px of a 1440 px page. */
  largeur: number;
  /** Degrees; negative rises to the right. */
  angle: number;
  opacite: number;
  irregularite: number;
  /** The draw: another seed, other strokes. */
  graine: number;
};

export type Miniatures = {
  /** A well with sharp walls, a flat outline, or a soft imprint. */
  maniere: 'cuvette' | 'contour' | 'empreinte';
  profondeur: number;
  /** What is left of the thumbnail's shapes: first its masses, then its details. */
  formes: number;
};

export type Verre = {
  /** A frosted window, a flat sheet of tinted glass, or a thick slab that bends what it covers. */
  maniere: 'depoli' | 'lame' | 'dalle';
  /** From night blue (−1) through neutral (0) to bronze (1). */
  teinte: number;
  opacite: number;
  /** px of a 1440 px page. */
  flou: number;
  /** The window's size, px of a 1440 × 900 screen; at its largest, the whole width or height of any screen. */
  largeur: number;
  hauteur: number;
  /** Its place, as a share of the room left around it: 0 is left or top, 1 right or bottom. */
  x: number;
  y: number;
  /** The prompt's block: the page's accent cube, or plain. */
  curseur: 'accent' | 'gris';
};

export type Reglages = { page: Page; gomme: Gomme; miniatures: Miniatures; verre: Verre };
export type Partie = keyof Reglages;

export const BORNES = {
  page: {
    reste: { min: 0, max: 0.45, step: 0.01 },
    bavure: { min: 0, max: 4, step: 0.1 },
    accent: { min: 0, max: 1, step: 0.05 },
    papier: { min: 0.93, max: 0.98, step: 0.005 },
    grain: { min: 0, max: 1, step: 0.05 },
  },
  gomme: {
    nombre: { min: 0, max: 36, step: 1 },
    largeur: { min: 10, max: 180, step: 2 },
    angle: { min: -60, max: 60, step: 1 },
    opacite: { min: 0, max: 0.5, step: 0.01 },
    irregularite: { min: 0, max: 1, step: 0.05 },
    graine: { min: 1, max: 9999, step: 1 },
  },
  miniatures: {
    profondeur: { min: 0, max: 1, step: 0.05 },
    formes: { min: 0, max: 1, step: 0.05 },
  },
  verre: {
    teinte: { min: -1, max: 1, step: 0.05 },
    opacite: { min: 0.5, max: 0.95, step: 0.01 },
    flou: { min: 0, max: 30, step: 1 },
    largeur: { min: 600, max: 1440, step: 10 },
    hauteur: { min: 320, max: 900, step: 10 },
    x: { min: 0, max: 1, step: 0.01 },
    y: { min: 0, max: 1, step: 0.01 },
  },
} satisfies { [P in Partie]: Record<string, Borne> };

/** At the end of its slider, a side of the window is the screen's own: it fills it, whatever the screen. */
export const pleine = (cote: 'largeur' | 'hauteur', valeur: number) => valeur >= BORNES.verre[cote].max;

type Choix<P extends Partie> = { id: Reglages[P]['maniere']; nom: string; note: string };

/** The manners of each part, in the order of the propositions they come from. */
export const MANIERES: { [P in Partie]: Choix<P>[] } = {
  page: [
    { id: 'fantome', nom: 'Fantôme', note: 'L’encre pâlit et bave : on devine encore les mots.' },
    { id: 'blocs', nom: 'Traits', note: 'Chaque ligne devient un trait gris à sa mesure : la structure sans les mots.' },
    { id: 'sec', nom: 'En creux', note: 'Plus d’encre ni de couleur : les mots restent en creux dans le papier.' },
  ],
  gomme: [
    { id: 'frottis', nom: 'Frottis', note: 'Le geste de la main : des allers-retours serrés, là où il y avait de l’encre.' },
    { id: 'passes', nom: 'Passes', note: 'Un seul passage droit par trait, d’un bord à l’autre de ce qu’il efface.' },
    { id: 'balayage', nom: 'Balayage', note: 'De grands arcs larges, comme un tableau qu’on essuie.' },
  ],
  miniatures: [
    { id: 'cuvette', nom: 'Cuvette', note: 'Un creux aux bords nets, éclairé d’en haut à gauche ; les formes restent debout au fond.' },
    { id: 'contour', nom: 'Contour', note: 'Plus de relief : un cadre et le tracé des formes, à plat.' },
    { id: 'empreinte', nom: 'Empreinte', note: 'Un creux mou, sans arête, comme un pouce dans l’argile.' },
  ],
  verre: [
    { id: 'depoli', nom: 'Dépoli', note: 'Une fenêtre de verre dépoli, avec sa barre de titre et son ombre.' },
    { id: 'lame', nom: 'Lame', note: 'Une feuille de verre teinté, à angles vifs, sans ombre.' },
    { id: 'dalle', nom: 'Dalle', note: 'Une dalle épaisse : ses bords courbent ce qu’elle recouvre.' },
  ],
};

export type Proposition = { id: string; nom: string; pari: string; reglages: Reglages };

/** The three bets. Each is frankly another eraser, another sinking and another glass. */
export const PROPOSITIONS: Proposition[] = [
  {
    id: 'gomme',
    nom: 'Coup de gomme',
    pari: 'On voit le geste : la page est frottée à la main, son fantôme bave sous le graphite, et le terminal est une vitre dépolie posée dessus.',
    reglages: {
      page: { maniere: 'fantome', reste: 0.16, bavure: 1.4, accent: 0.15, papier: 0.965, grain: 1 },
      gomme: { maniere: 'frottis', nombre: 9, largeur: 62, angle: -12, opacite: 0.14, irregularite: 0.7, graine: 9978 },
      miniatures: { maniere: 'cuvette', profondeur: 0.6, formes: 0.55 },
      verre: { maniere: 'depoli', teinte: 0.25, opacite: 0.78, flou: 14, largeur: 700, hauteur: 470, x: 0.29, y: 0.82, curseur: 'accent' },
    },
  },
  {
    id: 'plat',
    nom: 'À plat',
    pari: 'La machine ne garde que la structure : chaque ligne devient un trait gris, les miniatures un simple contour, et le terminal une lame de verre teinté, sans flou ni ombre.',
    reglages: {
      page: { maniere: 'blocs', reste: 0.2, bavure: 0, accent: 0, papier: 0.95, grain: 0 },
      gomme: { maniere: 'passes', nombre: 6, largeur: 96, angle: 0, opacite: 0.06, irregularite: 0.1, graine: 1207 },
      miniatures: { maniere: 'contour', profondeur: 0.35, formes: 0.6 },
      verre: { maniere: 'lame', teinte: -0.35, opacite: 0.82, flou: 0, largeur: 720, hauteur: 900, x: 1, y: 0, curseur: 'gris' },
    },
  },
  {
    id: 'sec',
    nom: 'À sec',
    pari: 'L’encre est partie, l’empreinte reste : le titre et les miniatures sont gaufrés sans encre dans le papier, et toute la profondeur passe dans une dalle de verre fumé.',
    reglages: {
      page: { maniere: 'sec', reste: 0.26, bavure: 0.4, accent: 0, papier: 0.955, grain: 1 },
      gomme: { maniere: 'balayage', nombre: 4, largeur: 150, angle: 18, opacite: 0.08, irregularite: 0.5, graine: 4403 },
      miniatures: { maniere: 'empreinte', profondeur: 0.6, formes: 0.7 },
      verre: { maniere: 'dalle', teinte: 0.7, opacite: 0.66, flou: 3, largeur: 720, hauteur: 440, x: 0.5, y: 0.88, curseur: 'accent' },
    },
  },
];

/** The bench's state: the settings, and the proposition they started from. */
export type Etat = { depart: string; reglages: Reglages };

export const proposition = (id: string) => PROPOSITIONS.find((p) => p.id === id) ?? PROPOSITIONS[0];

export const etatDe = (id: string): Etat => {
  const p = proposition(id);
  return { depart: p.id, reglages: p.reglages };
};

/** A part as its proposition gave it, for the manner asked. */
export function partieDe<P extends Partie>(partie: P, maniere: Reglages[P]['maniere']): Reglages[P] {
  const source = PROPOSITIONS.find((p) => p.reglages[partie].maniere === maniere) ?? PROPOSITIONS[0];
  return source.reglages[partie];
}

const memePartie = (a: object, b: object) => {
  const [x, y] = [a, b] as Record<string, unknown>[];
  return Object.keys(x).every((cle) => x[cle] === y[cle]);
};

/** The proposition a part comes from, by its manner, and whether its sliders were moved since. */
export function origine<P extends Partie>(partie: P, valeur: Reglages[P]) {
  const source = PROPOSITIONS.find((p) => p.reglages[partie].maniere === valeur.maniere) ?? PROPOSITIONS[0];
  return { source, intacte: memePartie(source.reglages[partie], valeur) };
}

/** The four parts, as the panel and the summary name them. */
export const NOMS: Record<Partie, string> = { page: 'la page', gomme: 'la gomme', miniatures: 'les miniatures', verre: 'le verre' };

/**
 * Where settings come from: one proposition as it is (`intacte`), one proposition tuned by hand
 * (`seule`), or a mix, told part by part (`melange`).
 */
export function provenance(reglages: Reglages) {
  const sources = (Object.keys(NOMS) as Partie[]).map(<P extends Partie>(partie: P) => ({ nom: NOMS[partie], ...origine(partie, reglages[partie]) }));
  const seule = sources.every(({ source }) => source === sources[0].source) ? sources[0].source : undefined;
  const intacte = seule && sources.every((s) => s.intacte) ? seule : undefined;
  const melange = sources.map(({ nom, source }) => `${nom} de « ${source.nom} »`).join(', ');
  return { intacte, seule, melange };
}

// --- storage

const CLE = 'atelier-machine:m1:v1';

const borner = (valeur: unknown, { min, max, step }: Borne, defaut: number) => {
  if (typeof valeur !== 'number' || !Number.isFinite(valeur)) return defaut;
  const pas = Math.round((Math.min(max, Math.max(min, valeur)) - min) / step);
  // back on the slider's own steps, without the float's dust
  return Number((min + pas * step).toFixed(4));
};

/** Reads settings kept or pasted, part by part: what is missing or out of bounds falls back on the starting proposition. */
export function valider(brut: unknown): Etat | null {
  if (typeof brut !== 'object' || brut === null) return null;
  const { depart, reglages } = brut as { depart?: unknown; reglages?: unknown };
  if (typeof reglages !== 'object' || reglages === null) return null;
  const base = proposition(typeof depart === 'string' ? depart : '');
  const lu = reglages as Record<string, Record<string, unknown> | undefined>;

  const partie = <P extends Partie>(nom: P): Reglages[P] => {
    const source = lu[nom] ?? {};
    const maniere = MANIERES[nom].find((choix) => choix.id === source.maniere)?.id ?? base.reglages[nom].maniere;
    const defauts = partieDe(nom, maniere) as Record<string, unknown>;
    const nombres = Object.fromEntries(
      Object.entries(BORNES[nom] as Record<string, Borne>).map(([cle, borne]) => [cle, borner(source[cle], borne, defauts[cle] as number)]),
    );
    return { ...defauts, ...nombres, maniere } as Reglages[P];
  };

  const verre = partie('verre');
  return {
    depart: base.id,
    reglages: {
      page: partie('page'),
      gomme: partie('gomme'),
      miniatures: partie('miniatures'),
      verre: { ...verre, curseur: lu.verre?.curseur === 'gris' || lu.verre?.curseur === 'accent' ? lu.verre.curseur : verre.curseur },
    },
  };
}

export function lire(): Etat {
  try {
    const garde = valider(JSON.parse(localStorage.getItem(CLE) ?? 'null'));
    if (garde) return garde;
  } catch {
    // Storage can be unavailable or hold an older shape; start from the first proposition.
  }
  return etatDe(PROPOSITIONS[0].id);
}

export function garder(etat: Etat) {
  try {
    localStorage.setItem(CLE, JSON.stringify(etat));
  } catch {
    // Keeping the settings across reloads is a convenience only.
  }
}

// --- the summary to paste

const pourcent = (v: number) => `${Math.round(v * 100)} %`;
const virgule = (v: number, decimales = 1) => v.toFixed(decimales).replace('.', ',');
const signe = (v: number) => (v < 0 ? `−${Math.abs(v)}` : `${v}`);

/** The glass's tint in words: night blue, neutral or bronze, and how much. */
export function nomTeinte(teinte: number) {
  if (Math.abs(teinte) < 0.025) return 'neutre';
  return `${teinte < 0 ? 'bleu nuit' : 'bronze'} ${pourcent(Math.abs(teinte))}`;
}

const nomManiere = <P extends Partie>(partie: P, id: Reglages[P]['maniere']) => MANIERES[partie].find((choix) => choix.id === id)?.nom ?? id;

/** What « Copier mes réglages » puts in the clipboard: a few lines to read, then the same as JSON. */
export function resume({ depart, reglages }: Etat) {
  const { page, gomme, miniatures, verre } = reglages;
  const { intacte, seule, melange } = provenance(reglages);
  const tete = intacte
    ? `proposition « ${intacte.nom} », telle quelle`
    : seule
      ? `proposition « ${seule.nom} », réglée à la main`
      : `mélange (${melange}), parti de « ${proposition(depart).nom} »`;
  return [
    `Mode machine · M1, la matière : ${tete}`,
    `Page humaine : ${nomManiere('page', page.maniere)} · reste ${pourcent(page.reste)} · bavure ${virgule(page.bavure)} px · coquelicot ${pourcent(page.accent)} · papier ${virgule(page.papier * 100)} % · grain ${pourcent(page.grain)}`,
    `Gomme : ${nomManiere('gomme', gomme.maniere)} · ${gomme.nombre} traits · largeur ${gomme.largeur} px · angle ${signe(gomme.angle)}° · opacité ${pourcent(gomme.opacite)} · irrégularité ${pourcent(gomme.irregularite)} · graine ${gomme.graine}`,
    `Miniatures : ${nomManiere('miniatures', miniatures.maniere)} · profondeur ${pourcent(miniatures.profondeur)} · formes ${pourcent(miniatures.formes)}`,
    `Verre fumé : ${nomManiere('verre', verre.maniere)} · teinte ${nomTeinte(verre.teinte)} · opacité ${pourcent(verre.opacite)} · flou ${verre.flou} px · fenêtre ${pleine('largeur', verre.largeur) ? 'toute la largeur' : `${verre.largeur} px`} × ${pleine('hauteur', verre.hauteur) ? 'toute la hauteur' : `${verre.hauteur} px`} · position ${pourcent(verre.x)} / ${pourcent(verre.y)} · cube du prompt ${verre.curseur === 'accent' ? 'coquelicot' : 'gris'}`,
    JSON.stringify({ depart, reglages }),
  ].join('\n');
}
