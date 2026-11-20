import type { Borne } from '../m1/reglages';
import { ETIQUETTES, RETENU, TEINTES, exposant, fondMachine } from './retenu';

export { ETIQUETTES, RETENU, TEINTES, exposant, fondMachine };

/*
 * The passage between the human page and the terminal (Atelier 2, step M4): what the bench tunes.
 * Another strategy than the erased page, after Alexandre's reference and his words: a white side
 * and a black side. The black is the inside of a bubble with a blurred, iridescent edge: towards
 * the Machine it spreads like an eclipse until the whole screen is black, and the terminal lives
 * in that black; towards the human page it draws back and gives the paper's white again. One
 * movement each way, slow at its start and very fast at its end; nothing crosses the screen.
 *
 * His human number, 1130, is part of that black: the bubble's edge uncovers it as it spreads, and
 * it stays there. The terminal comes afterwards and is posed over it, a little transparent, so
 * that the number is guessed through its glass; on the way back the terminal leaves first, the
 * number stays alone on the black, then the bubble draws back.
 *
 * Three propositions, which differ on where the bubble is born and where it draws back to, on
 * the rim's tints and on how 1130 is set; then bounded sliders: a direction, not a free hand.
 */

/** A place a bubble can grow from: under the switch's knob, beyond an edge of the screen, or in its middle. */
export type Foyer = 'bouton' | 'bord' | 'centre';

export type Reglages = {
  /** Where the bubble is born when it spreads, towards the Machine. */
  foyer: Foyer;
  /** Where it draws back to, towards the human page: the same kind of place, or another. */
  retrait: Foyer;
  /** How long the bubble takes to spread over the whole screen, ms. */
  duree: number;
  /** The way back, as a share of that: the bubble drawing back, and the terminal leaving before it. */
  retour: number;
  /** How slow the start and how fast the end: 0.3 is a gentle acceleration, 1 a whip. */
  courbe: number;
  /** The share of its way the bubble walks at an even pace under its acceleration: at 0 nothing shows for the first third of a passage; the higher, the sooner it is seen to move after the click. */
  amorce: number;
  /** Once the screen is black, how long the number stays alone on it before the terminal comes, ms. */
  delai: number;
  /** How long the terminal takes to come in over the number, ms. */
  entree: number;
  /** How it comes in: a fade, a short rise, or its glass first and then its lines printed from the top down. */
  genre: 'fondu' | 'montee' | 'lignes';
  /** How much the terminal's glass lets through of what is under it, 0–1: the black, and the number. */
  transparence: number;
  /**
   * For a bubble that comes from an edge: how far beyond that edge its centre is, in screen
   * heights. It is its radius when it comes into view: small, a round bubble; large, a nearly
   * straight front.
   */
  taille: number;
  /** For the same: which edge, and the slope of the way in, degrees: positive, it comes from higher up. */
  cote: 'droite' | 'gauche';
  direction: number;
  /** The rim's tints: the reference's, the site's wave, or the coquelicot alone. */
  teintes: 'reference' | 'onde' | 'coquelicot';
  /** The rim's width when the bubble is at its fastest, px of a 1440 px page; slow, it is a fine line. */
  largeur: number;
  /** How bright the rim glows and how far it bleeds into the page. */
  intensite: number;
  saturation: number;
  /** 1130 in the page's serif, in the terminal's face, or in the one while the bubble moves and the other under the terminal. */
  lettre: 'serif' | 'mono' | 'bascule';
  /** Its size, px of a 1440 px page. */
  corps: number;
  /** What is written on the black: Alexandre's number of human, or another, eight characters at most. */
  numero: string;
  /** On the left, where the page's headline starts, or in the middle of the screen. */
  place: 'gauche' | 'centre';
  /** The small label, above the number or under it. */
  etiquette: 'dessus' | 'dessous';
  langue: 'fr' | 'en';
  /** How much the number blurs and stretches when the rim passes over it, px. */
  flou: number;
  /** How strong the number stays once the terminal is posed, 0–1: it is full white while the bubble moves. */
  force: number;
  /** Under the terminal the number stays filled, or becomes its own outline. */
  trace: 'plein' | 'contour';
  /** The black side's colour, the bubble's and the terminal's ground: 0 is pure black, 1 the night blue the terminal had at M1. */
  fond: number;
};

export const BORNES = {
  duree: { min: 1000, max: 3200, step: 100 },
  retour: { min: 0.6, max: 1, step: 0.05 },
  courbe: { min: 0.3, max: 2, step: 0.05 },
  amorce: { min: 0, max: 0.4, step: 0.02 },
  delai: { min: 0, max: 600, step: 50 },
  entree: { min: 150, max: 900, step: 50 },
  transparence: { min: 0.06, max: 0.5, step: 0.02 },
  taille: { min: 0.4, max: 2, step: 0.05 },
  direction: { min: -30, max: 30, step: 5 },
  largeur: { min: 60, max: 260, step: 10 },
  intensite: { min: 0.4, max: 1.4, step: 0.05 },
  saturation: { min: 0.3, max: 1.2, step: 0.05 },
  corps: { min: 24, max: 480, step: 2 },
  flou: { min: 0, max: 32, step: 2 },
  force: { min: 0.1, max: 1, step: 0.05 },
  fond: { min: 0, max: 1, step: 0.05 },
} satisfies Partial<Record<keyof Reglages, Borne>>;

/** The values each switch of the panel may take. */
export const OPTIONS = {
  foyer: ['bouton', 'bord', 'centre'],
  retrait: ['bouton', 'bord', 'centre'],
  cote: ['droite', 'gauche'],
  genre: ['fondu', 'montee', 'lignes'],
  trace: ['plein', 'contour'],
  teintes: ['reference', 'onde', 'coquelicot'],
  lettre: ['serif', 'mono', 'bascule'],
  place: ['gauche', 'centre'],
  etiquette: ['dessus', 'dessous'],
  langue: ['fr', 'en'],
} as const satisfies { [K in Exclude<keyof Reglages, keyof typeof BORNES | 'numero'>]: readonly Reglages[K][] };

/** Alexandre's number of human. */
export const NUMERO = '1130';

export type Proposition = { id: string; nom: string; pari: string; reglages: Reglages };

/** The three bets on one principle: a black bubble with a blurred, iridescent edge, which spreads or draws back. */
export const PROPOSITIONS: Proposition[] = [
  {
    id: 'eclipse',
    nom: 'Éclipse',
    pari: 'Le plus près de ta vidéo : le noir vient du bord droit, un disque bien plus grand que l’écran dont on ne voit que l’arc, et s’étend jusqu’à tout couvrir. Au retour il se retire par la droite, exactement comme dans la référence, et son bord passe lentement sur 1130, écrit à gauche en Instrument Serif énorme sous sa petite étiquette. Liseré aux teintes de la vidéo, rouge orangé en haut, cyan en bas. Le terminal arrive en fondu ; le nombre reste dessous, en gris.',
    reglages: { foyer: 'bord', retrait: 'bord', duree: 1900, retour: 0.85, courbe: 0.7, amorce: 0.18, delai: 150, entree: 500, genre: 'fondu', transparence: 0.24, taille: 0.75, cote: 'droite', direction: 0, teintes: 'reference', largeur: 170, intensite: 1, saturation: 1, lettre: 'serif', corps: 380, place: 'gauche', etiquette: 'dessus', langue: 'fr', flou: 20, force: 0.4, trace: 'plein', fond: 0, numero: NUMERO },
  },
  {
    id: 'pupille',
    nom: 'Pupille',
    pari: 'Le noir sort du bouton : une bulle naît sous le 1 de l’interrupteur, enfle doucement, puis se dilate d’un coup jusqu’aux coins, cerclée de coquelicot comme un iris. Au retour elle rentre dans le bouton, revenu sur le 0. 1130 est au milieu, déjà dans la police du terminal, dont la lame monte se poser dessus, un peu plus opaque : le nombre reste en filigrane derrière les lignes.',
    reglages: { foyer: 'bouton', retrait: 'bouton', duree: 1700, retour: 0.9, courbe: 0.8, amorce: 0.18, delai: 100, entree: 400, genre: 'montee', transparence: 0.2, taille: 0.75, cote: 'droite', direction: 0, teintes: 'coquelicot', largeur: 110, intensite: 1.1, saturation: 1, lettre: 'mono', corps: 260, place: 'centre', etiquette: 'dessus', langue: 'fr', flou: 12, force: 0.5, trace: 'plein', fond: 0, numero: NUMERO },
  },
  {
    id: 'encre',
    nom: 'Encre',
    pari: 'Une goutte d’encre au milieu du papier : la bulle naît au centre de l’écran, sur le nombre, et s’étale autour de lui. L’aller et le retour ne se ressemblent pas : elle repart par la droite, comme dans ta vidéo, et plus vite qu’elle n’est venue. Liseré aux teintes de l’onde du site, du vermillon à la neige. Le terminal prend son temps, dans un fondu lent sous un verre plus clair, et le nombre, plein tant que la bulle bouge, n’est plus dessous qu’un contour.',
    reglages: { foyer: 'centre', retrait: 'bord', duree: 2200, retour: 0.75, courbe: 0.6, amorce: 0.18, delai: 250, entree: 700, genre: 'fondu', transparence: 0.24, taille: 0.75, cote: 'droite', direction: 0, teintes: 'onde', largeur: 140, intensite: 0.9, saturation: 1, lettre: 'serif', corps: 320, place: 'centre', etiquette: 'dessous', langue: 'fr', flou: 14, force: 0.7, trace: 'contour', fond: 0, numero: NUMERO },
  },
];

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

// --- storage

const CLE = 'atelier-machine:m4:v7';

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
  const numero = typeof lu.numero === 'string' ? lu.numero.replace(/[^0-9A-Za-z .-]/g, '').slice(0, 8) : '';
  const valeurs = CLES.map((cle) => [cle, cle === 'numero' ? numero || base.reglages.numero : cle in bornes ? borner(lu[cle], bornes[cle], base.reglages[cle] as number) : permis[cle].includes(lu[cle]) ? lu[cle] : base.reglages[cle]]);
  return { depart: base.id, reglages: Object.fromEntries(valeurs) as Reglages };
}

export function lire(): Etat {
  try {
    const garde = valider(JSON.parse(localStorage.getItem(CLE) ?? 'null'));
    if (garde) return garde;
  } catch {
    // Storage can be unavailable or hold an older shape; start from Alexandre's own.
  }
  return { depart: 'eclipse', reglages: RETENU };
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
  foyer: { bouton: 'du bouton de l’interrupteur', bord: 'd’un bord de l’écran', centre: 'du centre de l’écran' },
  retrait: { bouton: 'dans le bouton', bord: 'par un bord de l’écran', centre: 'au centre de l’écran' },
  cote: { droite: 'droit', gauche: 'gauche' },
  teintes: { reference: 'de la référence (rouge orangé, cyan)', onde: 'de l’onde du site (vermillon, neige)', coquelicot: 'coquelicot seul' },
  genre: { fondu: 'en fondu', montee: 'en montant de quelques px', lignes: 'verre d’abord, puis lignes imprimées de haut en bas' },
  trace: { plein: 'plein', contour: 'en contour' },
  lettre: { serif: 'Instrument Serif', mono: 'police du terminal', bascule: 'serif tant que la bulle bouge, police du terminal sous celui-ci' },
  place: { gauche: 'à gauche', centre: 'au milieu' },
  etiquette: { dessus: 'au-dessus', dessous: 'en dessous' },
} satisfies { [K in 'foyer' | 'retrait' | 'cote' | 'genre' | 'trace' | 'teintes' | 'lettre' | 'place' | 'etiquette']: Record<Reglages[K], string> };

export const pourcent = (v: number) => `${Math.round(v * 100)} %`;
export const fois = (v: number) => `×${v.toFixed(2).replace('.', ',')}`;
export const secondes = (ms: number) => `${(ms / 1000).toFixed(2).replace(/0$/, '').replace('.', ',')} s`;
export const degres = (v: number) => `${v < 0 ? '−' : v > 0 ? '+' : ''}${Math.abs(v)}°`;

export function nomFond(fond: number) {
  if (fond < 0.025) return 'noir pur';
  if (fond > 0.975) return 'bleu nuit de M1';
  return `noir tirant sur le bleu nuit (${pourcent(fond)})`;
}

/** What « Copier mes réglages » puts in the clipboard: a few lines to read, then the same as JSON. */
export function resume({ depart, reglages }: Etat) {
  const r = reglages;
  const telle = intacte(r);
  const bord = r.foyer === 'bord' || r.retrait === 'bord';
  return [
    `Mode machine · M4, le passage : ${telle ? `proposition « ${telle.nom} », telle quelle` : `partie de « ${proposition(depart).nom} », réglée à la main`}`,
    `Bulle : naît ${NOMS.foyer[r.foyer]}, se retire ${NOMS.retrait[r.retrait]}${bord ? ` · bord ${NOMS.cote[r.cote]}, centre à ${fois(r.taille)} la hauteur de l’écran au-delà, pente ${degres(r.direction)}` : ''}`,
    `Temps : la bulle s’étend en ${secondes(r.duree)} et se rétracte en ${secondes(r.duree * r.retour)} (${pourcent(r.retour)}) · courbe ${pourcent(r.courbe)} (exposant ${String(exposant(r.courbe)).replace('.', ',')}) · amorce ${pourcent(r.amorce)}`,
    `Terminal : entre ${NOMS.genre[r.genre]}, ${secondes(r.delai)} après le noir, en ${secondes(r.entree)} · transparence ${pourcent(r.transparence)} · au retour il s’efface d’abord, vite`,
    `Liseré : teintes ${NOMS.teintes[r.teintes]} · ${r.largeur} px au plus vite · intensité ${pourcent(r.intensite)} · saturation ${pourcent(r.saturation)}`,
    `« ${r.numero} » : ${NOMS.lettre[r.lettre]} · ${r.corps} px · ${NOMS.place[r.place]} · étiquette « ${ETIQUETTES[r.langue]} » ${NOMS.etiquette[r.etiquette]} · flou au bord ${r.flou} px · sous le terminal : ${NOMS.trace[r.trace]}, force ${pourcent(r.force)}`,
    `Côté noir : ${nomFond(r.fond)}`,
    JSON.stringify({ depart, reglages }),
  ].join('\n');
}
