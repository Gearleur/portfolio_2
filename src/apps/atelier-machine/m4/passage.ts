import { exposant } from './retenu';
import type { Foyer, Reglages } from './reglages';

/*
 * The passage as a function of time (step M4): given the settings, the way (towards the Machine
 * or back) and a moment between 0 and 1, how large the bubble is, how wide its rim, how strong
 * the number and how far in the terminal. Nothing here touches the page: the bench plays it,
 * scrubs it and tests it from the same numbers.
 *
 * There is one bubble and one path, from the human page at rest (0) to the terminal at rest (1).
 * Up to COUVERT the path is the bubble's radius, from nothing to the whole screen: its black
 * uncovers the number. From COUVERT to 1 the bubble no longer moves: the terminal comes in over
 * the black, without any bubble or mask of its own, and the number steps back under it. The way
 * back is the same path walked backwards: the terminal leaves, then the bubble draws back, slow
 * at its own start and fast at its own end. So a passage turned round in mid-course goes on from
 * where it is.
 */

export type Sens = 'aller' | 'retour';

/** The stage, px: its size, a px of the 1440 px page, and the switch's knob. */
export type Lieu = { l: number; h: number; u: number; bouton: { x: number; y: number; r: number } };

export type Image = {
  /** The bubble: its centre and radius, px of the stage. Its inside is the black side. */
  cx: number;
  cy: number;
  rayon: number;
  /** The rim's width, px: a fine line when the bubble is slow, a wide blur when it is fast. */
  lisere: number;
  /** The whole screen is black: the human page is no longer seen. */
  couvert: boolean;
  /** How strong the number is: 1 while the bubble moves, less once the terminal is over it. */
  nombre: number;
  /** Which drawing of the number: 0 the one the bubble uncovers, 1 the one that stays under the terminal. */
  lettre: number;
  /** How far in the terminal is, 0–1. */
  terminal: number;
  /** The tints' axis (a unit vector), its length and where its middle is, px. */
  axe: [x: number, y: number, longueur: number, ox: number, oy: number];
};

/** Where on the path the black covers the whole screen. */
export const COUVERT = 0.8;

/** A bubble born under the knob starts just inside the knob's edge: its rim shows around it at once. */
const GERME = 0.95;
/**
 * How far along its way the bubble is at the share `x` of its time: slow first, fast last. Under
 * the power of the time, a share `m` of the way is walked at an even pace (the setting « amorce »):
 * with a pure power nothing shows for the first third of a passage, and the bubble seems to wait
 * for the switch's knob to arrive.
 */
export const allure = (x: number, k: number, m: number) => m * x + (1 - m) * x ** k;
/** On the way back the terminal is gone in at most this long, ms: the bubble follows the click closely. */
const SORTIE = 220;
/** Rim widths of plain black the screen needs under it to be called covered. */
const BORD = 1.05;
/** Rim widths the glow reaches outside the bubble: at rest, all of it is off the stage. */
const HALO = 2.2;
/** The rim at rest, as a share of its width at full speed. */
const FIN = 0.07;
/**
 * On the way back the rim is never thinner than this share of its full width: the bubble starts
 * slowly there too, and a rim that only followed its speed was a hairline for most of the way,
 * over the whole screen, with no blur on the number. The black gives way as it came: softly.
 */
const DOUX_RETOUR = 0.6;
/** The rim never eats the bubble: at most this share of its radius. */
const COEUR = 0.5;

const doux = (x: number) => {
  const v = Math.min(1, Math.max(0, x));
  return v * v * (3 - 2 * v);
};

/** The place a passage's bubble grows from or draws back to. */
export const foyerDe = (r: Reglages, sens: Sens): Foyer => (sens === 'aller' ? r.foyer : r.retrait);

/** A passage's two parts, ms: the bubble moving, and the terminal coming in (after its delay) or leaving. */
export function durees(r: Reglages, sens: Sens) {
  const bulle = r.duree * (sens === 'retour' ? r.retour : 1);
  const terminal = sens === 'aller' ? r.delai + r.entree : Math.min(SORTIE, r.entree * r.retour);
  return { bulle, terminal, totale: bulle + terminal };
}

/**
 * The bubble's way on this stage: its centre; its radius at the path's start and when the screen
 * is covered (`de`, `a`); `seuil`, the place of the path where its rim, still a fine line, is
 * about to show; and `repli`, how much of the path a bubble that draws back can skip before its
 * edge shows at the far corners.
 */
function trajet(r: Reglages, lieu: Lieu, foyer: Foyer) {
  const { l, h, u } = lieu;
  // the rim as a passage starts: the bubble already moves, a little (the setting « amorce »), so it is a little wider than at rest
  const k = exposant(r.courbe);
  const debut = FIN + (1 - FIN) * (r.amorce / (r.amorce + (1 - r.amorce) * k)) ** 0.85;
  const large = r.largeur * u;
  let [cx, cy, germe] = [l / 2, h / 2, 0];
  if (foyer === 'bouton') [cx, cy, germe] = [lieu.bouton.x, lieu.bouton.y, lieu.bouton.r * GERME];
  if (foyer === 'bord') {
    // beyond the edge, along a way that can slope: the reference's disc comes from the right
    const pente = (r.direction * Math.PI) / 180;
    const [nx, ny] = [(r.cote === 'droite' ? 1 : -1) * Math.cos(pente), -Math.sin(pente)];
    const loin = (l / 2) * Math.abs(nx) + (h / 2) * Math.abs(ny) + r.taille * h;
    [cx, cy] = [l / 2 + nx * loin, h / 2 + ny * loin];
  }
  // from the centre to the screen: its nearest point, and its farthest corner
  const pres = Math.hypot(Math.max(Math.abs(cx - l / 2) - l / 2, 0), Math.max(Math.abs(cy - h / 2) - h / 2, 0));
  const fond = Math.hypot(Math.abs(cx - l / 2) + l / 2, Math.abs(cy - h / 2) + h / 2);
  // at rest all of the rim's glow is off the stage, wide as it is at full speed
  const de = foyer === 'bord' ? Math.max(0, pres - large * HALO) : germe;
  const a = fond + large * BORD;
  const part = COUVERT / (a - de);
  return { cx, cy, de, a, seuil: Math.max(0, pres - large * HALO * debut - de) * part, repli: large * BORD * (1 - Math.max(debut, DOUX_RETOUR)) * part };
}

/**
 * Where one is on the path at the moment `t` (0–1) of a passage: `s`, from the human page (0) to
 * the terminal (1), and whether it is the bubble that moves.
 */
export function position(r: Reglages, sens: Sens, t: number, lieu: Lieu, foyer: Foyer = foyerDe(r, sens)) {
  const d = durees(r, sens);
  const ms = Math.min(1, Math.max(0, t)) * d.totale;
  const { seuil, repli } = trajet(r, lieu, foyer);
  const k = exposant(r.courbe);
  if (sens === 'aller') {
    // the bubble spreads; then the number is alone for a while; then the terminal comes in
    if (ms < d.bulle) return { s: seuil + (COUVERT - seuil) * allure(ms / d.bulle, k, r.amorce), bulle: true };
    return { s: COUVERT + (1 - COUVERT) * Math.min(1, Math.max(0, ms - d.bulle - r.delai) / r.entree), bulle: false };
  }
  // the terminal leaves; then the bubble draws back
  if (ms < d.terminal) return { s: 1 - (1 - COUVERT) * (ms / d.terminal), bulle: false };
  return { s: (COUVERT - repli) * (1 - allure((ms - d.terminal) / d.bulle, k, r.amorce)), bulle: true };
}

/** The bubble's radius at a place of the path. */
const rayonA = (s: number, { de, a }: { de: number; a: number }) => de + (a - de) * Math.min(1, s / COUVERT);

/** How fast the bubble's edge moves at the moment `t`, px per ms. */
function vitesse(r: Reglages, sens: Sens, t: number, lieu: Lieu, foyer: Foyer) {
  const pas = 1e-3;
  const [avant, apres] = [Math.max(0, t - pas), Math.min(1, t + pas)];
  const tr = trajet(r, lieu, foyer);
  const rayon = (x: number) => rayonA(position(r, sens, x, lieu, foyer).s, tr);
  return Math.abs(rayon(apres) - rayon(avant)) / ((apres - avant) * durees(r, sens).totale);
}

let sommetGarde: { cle: string; valeur: number } | null = null;

/** The fastest the edge goes during a passage: the rim's full width is for that moment. */
function sommet(r: Reglages, sens: Sens, lieu: Lieu, foyer: Foyer) {
  const cle = JSON.stringify([r.duree, r.retour, r.courbe, r.amorce, r.delai, r.entree, r.taille, r.direction, r.cote, r.largeur, sens, foyer, lieu]);
  if (sommetGarde?.cle === cle) return sommetGarde.valeur;
  let valeur = 1e-6;
  for (let i = 1; i < 128; i++) valeur = Math.max(valeur, vitesse(r, sens, i / 128, lieu, foyer));
  sommetGarde = { cle, valeur };
  return valeur;
}

/** What the path's place `s` shows besides the bubble: the terminal, and the number under it. */
function dessus(r: Reglages, s: number) {
  const terminal = Math.min(1, Math.max(0, (s - COUVERT) / (1 - COUVERT)));
  // the number steps back as the terminal comes; if it changes hand or becomes an outline, it does so first
  const change = r.lettre === 'bascule' || r.trace === 'contour';
  return { terminal, nombre: 1 - (1 - r.force) * doux(terminal), lettre: change ? doux(terminal / 0.6) : 0 };
}

/** The tints run down the screen; around a bubble born inside it, down the bubble itself. */
function axeDe(r: Reglages, lieu: Lieu, foyer: Foyer, cx: number, cy: number, rayon: number): Image['axe'] {
  if (foyer !== 'bord') return [0, 1, Math.max(2, 2 * rayon), cx, cy];
  const pente = (r.direction * Math.PI) / 180;
  const [x, y] = [Math.sin(pente) * (r.cote === 'droite' ? 1 : -1), Math.cos(pente)];
  return [x, y, lieu.l * Math.abs(x) + lieu.h * Math.abs(y), lieu.l / 2, lieu.h / 2];
}

/** The whole picture at the moment `t` (0–1) of a passage. */
export function image(r: Reglages, sens: Sens, t: number, lieu: Lieu, foyer: Foyer = foyerDe(r, sens)): Image {
  const { s } = position(r, sens, t, lieu, foyer);
  const tr = trajet(r, lieu, foyer);
  const rayon = rayonA(s, tr);
  const elan = Math.min(1, vitesse(r, sens, t, lieu, foyer) / sommet(r, sens, lieu, foyer));
  const part = FIN + (1 - FIN) * elan ** 0.85;
  const lisere = Math.max(0.5, Math.min(r.largeur * lieu.u * (sens === 'retour' ? Math.max(part, DOUX_RETOUR) : part), rayon * COEUR));
  return { cx: tr.cx, cy: tr.cy, rayon, lisere, couvert: s >= COUVERT, ...dessus(r, s), axe: axeDe(r, lieu, foyer, tr.cx, tr.cy, rayon) };
}

/** The picture at rest on the Machine side: the whole screen black, the number under the terminal. */
export function repos(r: Reglages, lieu: Lieu): Image {
  const rayon = 2 * Math.hypot(lieu.l, lieu.h);
  return { cx: lieu.l / 2, cy: lieu.h / 2, rayon, lisere: 1, couvert: true, ...dessus(r, 1), axe: [0, 1, lieu.h, lieu.l / 2, lieu.h / 2] };
}

/**
 * The moment of a passage that shows the path's place `s`: where to take a passage up when the
 * switch is thrown again in mid-course.
 */
export function reprise(r: Reglages, sens: Sens, s: number, lieu: Lieu, foyer: Foyer = foyerDe(r, sens)) {
  const atteint = (t: number) => (sens === 'aller' ? position(r, sens, t, lieu, foyer).s <= s : position(r, sens, t, lieu, foyer).s >= s);
  let [bas, haut] = [0, 1];
  for (let i = 0; i < 32; i++) {
    const milieu = (bas + haut) / 2;
    if (atteint(milieu)) bas = milieu;
    else haut = milieu;
  }
  return bas;
}
