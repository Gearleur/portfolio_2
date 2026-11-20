import type { Borne } from '../m1/reglages';
import { RETENU as TYPO } from '../m2/retenu';
import { secondes } from '../m4/reglages';
import { RETENU } from './retenu';
import { interrupteurDe } from './telephone';
import type { Reglages } from './telephone';

export type { Reglages };

/*
 * The Machine mode on a phone (Atelier 2, step M6): what the bench tunes. Three propositions,
 * which differ on where the switch lives, on how one moves about without a keyboard and on where
 * the number goes when there is no strip for it; each part can be taken from another. Then
 * bounded sliders, and two things that are not seen but weigh: how fine the bubble's canvas is,
 * and when the passage is fetched.
 */

/** The pill's height where it lives, px of a 390 px page: the notch is 42 px high, and the terminal's first line 44. */
export const TAILLES: Record<Reglages['interrupteur'], Borne> = {
  encoche: { min: 24, max: 32, step: 1 },
  bas: { min: 36, max: 52, step: 2 },
  menu: { min: 28, max: 40, step: 2 },
};

export const BORNES = {
  cible: { min: 44, max: 60, step: 2 },
  touche: { min: 44, max: 64, step: 2 },
  corps: { min: 12, max: 16, step: 0.5 },
  duree: { min: 1000, max: 2400, step: 100 },
  largeur: { min: 60, max: 200, step: 10 },
} satisfies Partial<Record<keyof Reglages, Borne>>;

/** The values each switch of the panel may take. */
export const OPTIONS = {
  interrupteur: ['encoche', 'bas', 'menu'],
  gestes: [false, true],
  pave: [false, true],
  rangs: ['lignes', 'feuille'],
  numero: ['etat', 'haut', 'filigrane'],
  liste: ['courte', 'longue'],
  // 3 is no cap at all on today's phones: there to compare, not to keep
  densite: [1, 1.5, 2, 3],
  chargement: ['toucher', 'repos'],
} as const satisfies { [K in Exclude<keyof Reglages, keyof typeof BORNES | 'taille'>]: readonly Reglages[K][] };

export type Proposition = { id: string; nom: string; pari: string; reglages: Reglages };

/** The three bets. What does not bet (the canvas's density, the fetch) is the same in all three: what was measured best. */
export const PROPOSITIONS: Proposition[] = [
  {
    id: 'encoche',
    nom: 'Encoche',
    pari: 'L’interrupteur entre dans l’encoche de verre, entre ton nom et « Menu » : rien de plus sur la page, et la bulle sort du haut. Côté Machine il n’a pas bougé, et la ligne de l’encoche devient la première ligne du terminal, « ← retour » à gauche. On se déplace en touchant les noms : chaque ligne du ls est une cible entière, la commande s’écrit toute seule. Ton numéro, grand pendant l’éclipse, s’écrit ensuite dans la ligne d’état.',
    reglages: { interrupteur: 'encoche', taille: 28, gestes: false, pave: false, rangs: 'lignes', cible: 48, touche: 52, numero: 'etat', corps: 14, liste: 'courte', duree: 1500, largeur: 140, densite: 1.5, chargement: 'repos' },
  },
  {
    id: 'pouce',
    nom: 'Pouce',
    pari: 'Tout sous le pouce : l’interrupteur en bas au milieu, au-dessus de la zone sûre, et la bulle part de là. Côté Machine un pavé de quatre grosses touches se pose juste au-dessus de lui, ← ↑ ↓ ↵, et pilote le nom surligné comme les flèches sur ordinateur ; toucher un nom marche aussi. Ton numéro, grand pendant l’éclipse, se range petit en haut à droite.',
    reglages: { interrupteur: 'bas', taille: 44, gestes: false, pave: true, rangs: 'lignes', cible: 44, touche: 56, numero: 'haut', corps: 14, liste: 'courte', duree: 1500, largeur: 140, densite: 1.5, chargement: 'repos' },
  },
  {
    id: 'feuille',
    nom: 'Feuille',
    pari: 'Le terminal se tient comme une liste native : une ligne pleine largeur par fichier, son poids à droite, un filet dessous ; on touche pour ouvrir, on glisse vers la droite pour revenir, et la commande n’est plus que la trace de ce qu’on vient de faire. L’interrupteur ne vit que dans le menu, la page reste telle quelle. Ton numéro reste en grand derrière les lignes, comme sur l’établi du passage.',
    reglages: { interrupteur: 'menu', taille: 36, gestes: true, pave: false, rangs: 'feuille', cible: 52, touche: 52, numero: 'filigrane', corps: 15, liste: 'courte', duree: 1500, largeur: 140, densite: 1.5, chargement: 'repos' },
  },
];

/** The bench's state: the settings, and the proposition they started from. */
export type Etat = { depart: string; reglages: Reglages };

/**
 * What Alexandre retained (retenu.ts, 2026-11-20), as the bench's state: its start and what
 * « Réinitialiser » goes back to. It started from « Encoche » and took from « Feuille » the
 * swipe back, the rows of a native list and the number left behind the lines.
 */
export const CHOIX: Etat = { depart: 'encoche', reglages: RETENU };
export const PARI_CHOIX =
  'Retenu : l’interrupteur dans l’encoche, entre ton nom et « Menu » ; on touche les noms, et on glisse vers la droite pour revenir, sans pavé ; les listes en feuille, une ligne pleine largeur par fichier, la commande écrite d’un coup. Ton numéro, grand pendant l’éclipse, reste en filigrane derrière les lignes. Texte à 13 px.';

const memes = (a: Reglages, b: Reglages) => (Object.keys(a) as (keyof Reglages)[]).every((cle) => a[cle] === b[cle]);
/** These settings are what he retained, untouched. */
export const choisie = (reglages: Reglages) => memes(reglages, CHOIX.reglages);

export const proposition = (id: string) => PROPOSITIONS.find((p) => p.id === id) ?? PROPOSITIONS[0];

export const etatDe = (id: string): Etat => {
  const p = proposition(id);
  return { depart: p.id, reglages: p.reglages };
};

const CLES = Object.keys(PROPOSITIONS[0].reglages) as (keyof Reglages)[];

/** The proposition these settings are, untouched, if they are one. */
export const intacte = (reglages: Reglages) => PROPOSITIONS.find((p) => CLES.every((cle) => p.reglages[cle] === reglages[cle]));

const borner = (valeur: unknown, { min, max, step }: Borne, defaut: number) => {
  if (typeof valeur !== 'number' || !Number.isFinite(valeur)) return defaut;
  return Math.round((min + Math.round((Math.min(max, Math.max(min, valeur)) - min) / step) * step) * 1000) / 1000;
};

/** A switch that changes place takes the size of that place: the one a proposition gives it there, or the nearest allowed. */
export function deplacer(reglages: Reglages, interrupteur: Reglages['interrupteur']): Reglages {
  const donnee = PROPOSITIONS.find((p) => p.reglages.interrupteur === interrupteur)?.reglages.taille;
  return { ...reglages, interrupteur, taille: donnee ?? borner(reglages.taille, TAILLES[interrupteur], TAILLES[interrupteur].min) };
}

// --- what the settings come to on the screen

/** The pill's size, px of a 390 px page. */
export function pilule(reglages: Pick<Reglages, 'interrupteur' | 'taille'>) {
  const { largeur, echelle } = interrupteurDe(reglages);
  return { largeur: Math.round(largeur * echelle), hauteur: reglages.taille };
}

/** About how many columns a 390 px screen has at this size: a console face's cell is six tenths of its size (the screen measures the true one). */
export const colonnes = (corps: number, ecran = 390) => Math.floor((ecran - 32) / (corps * 0.602 * TYPO.police.chasse));

/** The bubble's canvas on a 390 × 844 screen that has 3 px per px, capped. */
export const toile = (densite: number) => ({ largeur: Math.round(390 * Math.min(3, densite)), hauteur: Math.round(844 * Math.min(3, densite)) });

// --- the bench's own

/** The network the bench pretends to have: ms added to the fetch of the passage, to feel the wait. */
export const RESEAUX = { direct: 0, '4g': 400, '3g': 1500 } as const;
export type Reseau = keyof typeof RESEAUX;

// --- storage

// v3: what is retained is the start; a setting kept from before the choice must not hide it
const CLE = 'atelier-machine:m6:v3';

/** Reads settings kept or pasted: what is missing or not allowed falls back on the starting proposition. */
export function valider(brut: unknown): Etat | null {
  if (typeof brut !== 'object' || brut === null) return null;
  const { depart, reglages } = brut as { depart?: unknown; reglages?: unknown };
  if (typeof reglages !== 'object' || reglages === null) return null;
  const base = proposition(typeof depart === 'string' ? depart : '');
  const lu = reglages as Record<string, unknown>;
  const permis = OPTIONS as Record<string, readonly unknown[]>;
  const choix = Object.fromEntries(Object.keys(permis).map((cle) => [cle, permis[cle].includes(lu[cle]) ? lu[cle] : base.reglages[cle as keyof Reglages]])) as Pick<Reglages, keyof typeof OPTIONS>;
  const bornes = { ...BORNES, taille: TAILLES[choix.interrupteur] } as Record<string, Borne>;
  // a size kept for another place of the switch is not this place's
  const defaut = (cle: string) => (cle === 'taille' && choix.interrupteur !== base.reglages.interrupteur ? bornes.taille.min : (base.reglages[cle as keyof Reglages] as number));
  const mesures = Object.fromEntries(Object.keys(bornes).map((cle) => [cle, borner(lu[cle], bornes[cle], defaut(cle))]));
  return { depart: base.id, reglages: { ...choix, ...mesures } as Reglages };
}

export function lire(): Etat {
  try {
    const garde = valider(JSON.parse(localStorage.getItem(CLE) ?? 'null'));
    if (garde) return garde;
  } catch {
    // Storage can be unavailable or hold an older shape; start from what is retained.
  }
  return CHOIX;
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
  interrupteur: { encoche: 'dans l’encoche, entre le nom et « Menu »', bas: 'en bas au milieu, au-dessus de la zone sûre', menu: 'dans le menu seulement' },
  rangs: { lignes: 'lignes de terminal, la commande s’écrit toute seule', feuille: 'liste native (une ligne pleine largeur par fichier, la commande d’un coup)' },
  numero: { etat: 'puis rangé dans la ligne d’état, en bas à gauche', haut: 'puis rangé petit sur la première ligne, à droite', filigrane: 'puis en filigrane derrière les lignes' },
  liste: { courte: 'ls -s (poids et nom)', longue: 'ls -l (avec la légende, coupée au bord)' },
  chargement: { toucher: 'au premier toucher vers l’interrupteur', repos: 'd’avance, une fois la page au repos (sauf économie de données ou réseau 2G)' },
} satisfies { [K in 'interrupteur' | 'rangs' | 'numero' | 'liste' | 'chargement']: Record<Reglages[K], string> };

export const virgule = (v: number) => String(v).replace('.', ',');

/** What « Copier mes réglages » puts in the clipboard: a few lines to read, then the same as JSON. */
export function resume({ depart, reglages }: Etat) {
  const r = reglages;
  const telle = intacte(r);
  const p = pilule(r);
  const t = toile(r.densite);
  return [
    `Mode machine · M6, le téléphone : ${choisie(r) ? 'ce qui est retenu, tel quel' : telle ? `proposition « ${telle.nom} », telle quelle` : `partie de « ${proposition(depart).nom} », réglée à la main`}`,
    `Interrupteur : ${NOMS.interrupteur[r.interrupteur]} · pilule de ${p.largeur} × ${p.hauteur} px`,
    `Se déplacer : en touchant les noms${r.gestes ? ', et en glissant vers la droite pour revenir' : ''}${r.pave ? `, et avec un pavé de touches en bas (← ↑ ↓ ↵, ${r.touche} px)` : ''} · cibles de ${r.cible} px · ${NOMS.rangs[r.rangs]}`,
    `Numéro : grand pendant l’éclipse, ${NOMS.numero[r.numero]}`,
    `Texte : ${virgule(r.corps)} px, environ ${colonnes(r.corps)} colonnes sur 390 px · ${NOMS.liste[r.liste]} · Markdown plié à la largeur de l’écran`,
    `Passage : la bulle s’étend en ${secondes(r.duree)} · liseré ${r.largeur} px au plus vite · toile plafonnée à ${virgule(r.densite)} px par px (${t.largeur} × ${t.hauteur} sur un écran à densité 3)`,
    `Chargement du passage : ${NOMS.chargement[r.chargement]}`,
    JSON.stringify({ depart, reglages }),
  ].join('\n');
}
