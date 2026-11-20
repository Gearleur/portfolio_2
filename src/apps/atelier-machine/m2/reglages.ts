import type { Borne } from '../m1/reglages';
import { FACES, PILES, RETENU, famille, nomFace } from './retenu';

export { FACES, PILES, RETENU, famille };

/*
 * The terminal's type and its grid of cells (Atelier 2, step M2): what the bench tunes.
 *
 * Five parts: the face, the grid, the three greys, the cursor, and what dresses the screen.
 * As at M1, each part has a manner and bounded sliders: the bounds are the direction. The
 * three propositions are starting points, one manner of each part; taking a part's manner
 * from another proposition brings that part as it was proposed, to be tuned from there.
 */

export type Police = {
  /** The console's face of each system, the face its terminal opens with today, or one the site serves. */
  maniere: 'classique' | 'courante' | 'embarquee';
  /** Which face the site serves, when it serves one. */
  face: 'jetbrains' | 'geist';
  /** px of a 1440 px page. */
  corps: number;
  graisse: number;
  /** The cell's width, as a share of the face's own advance. */
  chasse: number;
};

export type Grille = {
  /** The screen takes the whole sheet of glass, or is just its measure, centred or on the left. */
  maniere: 'pleine' | 'centree' | 'gauche';
  /** The measure: the longest line of running text, in cells. */
  colonnes: number;
  /** From the glass's edges to the screen, px of a 1440 px page. */
  marge: number;
  interligne: number;
  /** An empty line after each command's answer. */
  aeree: boolean;
};

export type Gris = {
  maniere: 'uni' | 'etage' | 'doux';
  /** How much light each level keeps, 0–1: what is typed, what answers, what stands beside. */
  commande: number;
  sortie: number;
  meta: number;
};

export type Curseur = { maniere: 'bloc' | 'souligne' | 'barre'; clignote: boolean };

export type Habillage = {
  /** Nothing around the lines, a title and a status line in reverse video, or one quiet status line. */
  maniere: 'nu' | 'cadre' | 'etat';
  invite: 'longue' | 'courte' | 'minimale';
};

export type Reglages = { police: Police; grille: Grille; gris: Gris; curseur: Curseur; habillage: Habillage };
export type Partie = keyof Reglages;

export const BORNES = {
  police: {
    corps: { min: 12, max: 18, step: 1 },
    graisse: { min: 300, max: 500, step: 10 },
    chasse: { min: 0.96, max: 1.12, step: 0.01 },
  },
  grille: {
    colonnes: { min: 60, max: 100, step: 1 },
    marge: { min: 16, max: 120, step: 4 },
    interligne: { min: 1.15, max: 1.9, step: 0.05 },
  },
  gris: {
    commande: { min: 0.86, max: 1, step: 0.01 },
    sortie: { min: 0.62, max: 0.96, step: 0.01 },
    meta: { min: 0.4, max: 0.76, step: 0.01 },
  },
  curseur: {},
  habillage: {},
} satisfies { [P in Partie]: Record<string, Borne> };

/** What a part sets besides its manner and its sliders, and the values each may take. */
const OPTIONS: { [P in Partie]?: Record<string, readonly unknown[]> } = {
  police: { face: ['jetbrains', 'geist'] },
  grille: { aeree: [true, false] },
  curseur: { clignote: [true, false] },
  habillage: { invite: ['longue', 'courte', 'minimale'] },
};

/** The prompt, from the whole address to a single sign. */
export const INVITES: Record<Habillage['invite'], string> = {
  longue: 'visiteur@alexandre-teixeira:~$ ',
  courte: '~ $ ',
  minimale: '$ ',
};

type Choix<P extends Partie> = { id: Reglages[P]['maniere']; nom: string; note: string };

export const MANIERES: { [P in Partie]: Choix<P>[] } = {
  police: [
    { id: 'classique', nom: 'Classique', note: 'La police des consoles des années 2000 et 2010 : Menlo sur Mac, Consolas sous Windows, DejaVu Sans Mono sous Linux.' },
    { id: 'courante', nom: 'Courante', note: 'Celle qu’un terminal ouvre aujourd’hui : SF Mono sur Mac (Safari), Cascadia Mono sous Windows 11, Ubuntu Mono sous Ubuntu ; sinon la classique.' },
    { id: 'embarquee', nom: 'Embarquée', note: 'Une mono libre servie par le site : la même lettre et la même grille sur toutes les machines.' },
  ],
  grille: [
    { id: 'pleine', nom: 'Pleine', note: 'L’écran prend toute la lame, comme une fenêtre agrandie ; le texte courant reste plié à sa mesure.' },
    { id: 'centree', nom: 'Centrée', note: 'L’écran fait juste sa mesure, au milieu de la lame, comme une page.' },
    { id: 'gauche', nom: 'À gauche', note: 'L’écran fait juste sa mesure, calé à gauche ; le reste de la lame reste vide.' },
  ],
  gris: [
    { id: 'uni', nom: 'Uni', note: 'Presque un seul gris, comme un terminal sans couleurs.' },
    { id: 'etage', nom: 'Étagé', note: 'Trois marches nettes : ce qu’on tape, ce qui répond, ce qui accompagne.' },
    { id: 'doux', nom: 'Doux', note: 'Tout est baissé d’un cran ; les métadonnées s’effacent.' },
  ],
  curseur: [
    { id: 'bloc', nom: 'Bloc', note: 'Le cube plein, sur une cellule entière.' },
    { id: 'souligne', nom: 'Souligné', note: 'Un trait sous la cellule, comme sur les terminaux d’avant.' },
    { id: 'barre', nom: 'Barre', note: 'Un trait debout devant la cellule, comme dans un champ de texte.' },
  ],
  habillage: [
    { id: 'nu', nom: 'Nu', note: 'Rien autour : des invites et des réponses.' },
    { id: 'cadre', nom: 'Titre et état', note: 'Une ligne de titre en haut, une ligne d’état en bas, en vidéo inverse.' },
    { id: 'etat', nom: 'Ligne d’état', note: 'Une seule ligne discrète, tout en bas de l’écran.' },
  ],
};

export type Proposition = { id: string; nom: string; pari: string; reglages: Reglages };

/** The three bets. Each is frankly another face, another grid and another dress. */
export const PROPOSITIONS: Proposition[] = [
  {
    id: 'origine',
    nom: 'D’origine',
    pari: 'Le terminal que personne n’a réglé : la police de console de chaque système, petite et serrée, calée en haut à gauche de la lame ; presque un seul gris, le bloc qui clignote, rien autour.',
    reglages: {
      police: { maniere: 'classique', face: 'jetbrains', corps: 14, graisse: 400, chasse: 1 },
      grille: { maniere: 'pleine', colonnes: 80, marge: 28, interligne: 1.3, aeree: false },
      gris: { maniere: 'uni', commande: 0.98, sortie: 0.9, meta: 0.72 },
      curseur: { maniere: 'bloc', clignote: true },
      habillage: { maniere: 'nu', invite: 'longue' },
    },
  },
  {
    id: 'colonnes',
    nom: '80 colonnes',
    pari: 'La mesure historique, tenue strictement : 80 colonnes centrées dans la lame comme une page, une mono embarquée pour que la grille soit la même partout, un titre et une ligne d’état en vidéo inverse.',
    reglages: {
      police: { maniere: 'embarquee', face: 'jetbrains', corps: 15, graisse: 380, chasse: 1 },
      grille: { maniere: 'centree', colonnes: 80, marge: 56, interligne: 1.5, aeree: true },
      gris: { maniere: 'etage', commande: 1, sortie: 0.8, meta: 0.52 },
      curseur: { maniere: 'souligne', clignote: true },
      habillage: { maniere: 'cadre', invite: 'courte' },
    },
  },
  {
    id: 'lecture',
    nom: 'Lecture',
    pari: 'Le terminal réglé pour lire : la mono des terminaux d’aujourd’hui en corps de texte, une colonne étroite à gauche, un interligne ouvert ; l’invite réduite à un signe, une barre pour curseur, et le reste de la lame laissé vide.',
    reglages: {
      police: { maniere: 'courante', face: 'geist', corps: 17, graisse: 400, chasse: 1 },
      grille: { maniere: 'gauche', colonnes: 64, marge: 72, interligne: 1.7, aeree: true },
      gris: { maniere: 'doux', commande: 0.94, sortie: 0.74, meta: 0.48 },
      curseur: { maniere: 'barre', clignote: true },
      habillage: { maniere: 'etat', invite: 'minimale' },
    },
  },
];

/** The bench's state: the settings, and the proposition they started from. */
export type Etat = { depart: string; reglages: Reglages };

/** What the screen measured once drawn: the face this computer shows, and the grid it makes. */
export type Vu = { police: string; colonnes: number; lignes: number; cellule: [number, number] };

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

/** The proposition a part comes from, by its manner, and whether it was touched since. */
export function origine<P extends Partie>(partie: P, valeur: Reglages[P]) {
  const source = PROPOSITIONS.find((p) => p.reglages[partie].maniere === valeur.maniere) ?? PROPOSITIONS[0];
  return { source, intacte: memePartie(source.reglages[partie], valeur) };
}

/** The five parts, as the panel and the summary name them. */
export const NOMS: Record<Partie, string> = { police: 'la police', grille: 'la grille', gris: 'les gris', curseur: 'le curseur', habillage: 'l’habillage' };

/** Where settings come from: one proposition as it is, one tuned by hand, or a mix told part by part. */
export function provenance(reglages: Reglages) {
  const sources = (Object.keys(NOMS) as Partie[]).map(<P extends Partie>(partie: P) => ({ nom: NOMS[partie], ...origine(partie, reglages[partie]) }));
  const seule = sources.every(({ source }) => source === sources[0].source) ? sources[0].source : undefined;
  const intacte = seule && sources.every((s) => s.intacte) ? seule : undefined;
  const melange = sources.map(({ nom, source }) => `${nom} de « ${source.nom} »`).join(', ');
  return { intacte, seule, melange };
}

// --- storage

const CLE = 'atelier-machine:m2:v1';

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
    const nombres = Object.entries(BORNES[nom] as Record<string, Borne>).map(([cle, borne]) => [cle, borner(source[cle], borne, defauts[cle] as number)]);
    const choix = Object.entries((OPTIONS[nom] ?? {}) as Record<string, readonly unknown[]>).map(([cle, permis]) => [cle, permis.includes(source[cle]) ? source[cle] : defauts[cle]]);
    return { ...defauts, ...Object.fromEntries([...nombres, ...choix]), maniere } as Reglages[P];
  };

  return {
    depart: base.id,
    reglages: { police: partie('police'), grille: partie('grille'), gris: partie('gris'), curseur: partie('curseur'), habillage: partie('habillage') },
  };
}

export function lire(): Etat {
  try {
    const garde = valider(JSON.parse(localStorage.getItem(CLE) ?? 'null'));
    if (garde) return garde;
  } catch {
    // Storage can be unavailable or hold an older shape; start from what was retained.
  }
  return { depart: PROPOSITIONS[0].id, reglages: RETENU };
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
const nomManiere = <P extends Partie>(partie: P, id: Reglages[P]['maniere']) => MANIERES[partie].find((choix) => choix.id === id)?.nom ?? id;

/** What « Copier mes réglages » puts in the clipboard: a few lines to read, then the same as JSON. */
export function resume({ depart, reglages }: Etat, vu?: Vu | null) {
  const { police, grille, gris, curseur, habillage } = reglages;
  const { intacte, seule, melange } = provenance(reglages);
  const tete = intacte
    ? `proposition « ${intacte.nom} », telle quelle`
    : seule
      ? `proposition « ${seule.nom} », réglée à la main`
      : `mélange (${melange}), parti de « ${proposition(depart).nom} »`;
  return [
    `Mode machine · M2, typo et grille : ${tete}`,
    `Police : ${nomManiere('police', police.maniere)}${police.maniere === 'embarquee' ? ` (${nomFace(police.face)})` : ''} · corps ${police.corps} px · graisse ${police.graisse} · chasse ${pourcent(police.chasse)}${vu ? ` · vue ici en ${vu.police}` : ''}`,
    `Grille : ${nomManiere('grille', grille.maniere)} · ${grille.colonnes} colonnes · marge ${grille.marge} px · interligne ${virgule(grille.interligne, 2)} · commandes ${grille.aeree ? 'aérées' : 'serrées'}${vu ? ` · écran de ${vu.colonnes} × ${vu.lignes}, cellule de ${virgule(vu.cellule[0])} × ${virgule(vu.cellule[1])} px` : ''}`,
    `Gris : ${nomManiere('gris', gris.maniere)} · commande ${pourcent(gris.commande)} · sortie ${pourcent(gris.sortie)} · métadonnées ${pourcent(gris.meta)}`,
    `Curseur : ${nomManiere('curseur', curseur.maniere)}, ${curseur.clignote ? 'clignotant' : 'fixe'}`,
    `Habillage : ${nomManiere('habillage', habillage.maniere)} · invite « ${INVITES[habillage.invite].trim()} »`,
    JSON.stringify({ depart, reglages }),
  ].join('\n');
}
