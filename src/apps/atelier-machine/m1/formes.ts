import alpineAffiche from '../../atelier/medias/alpine-affiche.webp';
import processusCarte from '../../atelier/medias/processus-carte.webp';
import reunionsFond from '../../atelier/medias/reunions-fond.webp';
import { placeVitre } from '../../atelier/reunions-scene/vitre';
import { dessinerVoix } from '../../atelier/reunions-scene/voix';
import { CARTE, flou } from './relief';
import type { Formes } from './relief';

/*
 * What is left of each thumbnail once it has sunk (step M1): its shapes, read from the
 * Vitrine's own pieces, never redrawn.
 *   01 Whiteboard AMDEC      the poster's ink: the large A, then its lines and words
 *   02 SNCF GPT              the turnout's drawing: the loupe and the rails, then the sleepers
 *   03 Synthèse de réunions  the glass and the voices that cross it, then the fingerprint
 *   04 Dessiner avec l'IA    the embossed sheet as it is, without its ink
 * Each is worked out once, and shared by every stage on the page.
 */

const { W, H } = CARTE;
const N = W * H;

function toile() {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d', { willReadFrequently: true });
  if (!g) throw new Error('2D canvas unavailable');
  return g;
}

function charger(src: string) {
  return new Promise<HTMLImageElement>((ok, ko) => {
    const image = new Image();
    image.onload = () => ok(image);
    image.onerror = () => ko(new Error(`Image not loaded: ${src.slice(0, 80)}`));
    image.src = src;
  });
}

/** A picture's pixels at the card's size, cropped like object-fit: cover. */
async function pixels(src: string) {
  const image = await charger(src);
  const g = toile();
  const s = Math.max(W / image.naturalWidth, H / image.naturalHeight);
  g.drawImage(image, (W - image.naturalWidth * s) / 2, (H - image.naturalHeight * s) / 2, image.naturalWidth * s, image.naturalHeight * s);
  return g.getImageData(0, 0, W, H).data;
}

const clarteDe = (p: Uint8ClampedArray, k: number) => (0.2126 * p[k * 4] + 0.7152 * p[k * 4 + 1] + 0.0722 * p[k * 4 + 2]) / 255;
const borne = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

/** What a context drew, as coverage from 0 to 1. */
function couverture(g: CanvasRenderingContext2D) {
  const p = g.getImageData(0, 0, W, H).data;
  const champ = new Float32Array(N);
  for (let k = 0; k < N; k++) champ[k] = p[k * 4 + 3] / 255;
  return champ;
}

/** 01 · The poster's blue ink on its white paper. */
async function alpine(): Promise<Formes> {
  const p = await pixels(alpineAffiche);
  const encre = new Float32Array(N);
  for (let k = 0; k < N; k++) encre[k] = borne((0.84 - clarteDe(p, k)) / 0.5);
  // the large A is what stays inked once the fine lines are blurred away
  const masse = flou(Float32Array.from(encre), W, H, 3);
  for (let k = 0; k < N; k++) masse[k] = borne((masse[k] - 0.5) * 5 + 0.5);
  const detail = new Float32Array(N);
  for (let k = 0; k < N; k++) detail[k] = borne(encre[k] - masse[k] * 1.2);
  return { masse, detail };
}

/** The turnout's drawing with other strokes: what a style sheet shows, at the card's size and framing. */
async function dessin(svg: SVGSVGElement, style: string) {
  const copie = svg.cloneNode(true) as SVGSVGElement;
  copie.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  copie.setAttribute('width', String(W));
  copie.setAttribute('height', String(H));
  const regles = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  regles.textContent = style;
  copie.insertBefore(regles, copie.firstChild);
  const image = await charger(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(copie))}`);
  const g = toile();
  g.drawImage(image, 0, 0, W, H);
  return couverture(g);
}

// Nothing shows unless a rule below says so; the words are too small to hold in paper.
const RIEN = `* { fill: none; stroke: none } text, .aig__sigle { display: none }`;
const LOUPE_ET_RAILS = `${RIEN} .aig__rail path { stroke: #000; stroke-width: 1.5 } svg > circle.aig__trait { stroke: #000; stroke-width: 2.6 } .miniature__agent, .aig__lame path { fill: #000 }`;
const TRAVERSES = `${RIEN} .aig__traverses polygon { stroke: #000; stroke-width: 0.7 } .aig__axe path, .aig__fin, .aig__fin * { stroke: #000; stroke-width: 0.6 }`;

/** 02 · The turnout, from the drawing the Vitrine's card shows (Aiguillage.tsx). */
async function sncf(svg: SVGSVGElement): Promise<Formes> {
  const [masse, tout] = await Promise.all([dessin(svg, LOUPE_ET_RAILS), dessin(svg, TRAVERSES)]);
  const detail = new Float32Array(N);
  for (let k = 0; k < N; k++) detail[k] = borne(tout[k] - masse[k]);
  return { masse, detail };
}

/** The voices' moment: the one the card opens on (MiniatureReunions). */
const INSTANT = 6;

/** 03 · The glass where the Vitrine puts it, the voices as it draws them, and the fingerprint of its film's first frame. */
async function reunions(): Promise<Formes> {
  const p = await pixels(reunionsFond);
  const v = placeVitre(W, H);

  const g = toile();
  g.beginPath();
  g.roundRect(v.x, v.y, v.w, v.h, W * 0.024);
  g.fill();
  const vitre = couverture(g);

  const voix = toile();
  dessinerVoix(voix, W, H, INSTANT);
  const lignes = flou(couverture(voix), W, H, 1);

  // the glass stands; the voices are grooves across it
  const masse = new Float32Array(N);
  for (let k = 0; k < N; k++) masse[k] = vitre[k] * (1 - 0.9 * borne(lignes[k] * 2.4));

  // the fingerprint's ridges: what the frame's light does at a small scale
  const clarte = new Float32Array(N);
  for (let k = 0; k < N; k++) clarte[k] = clarteDe(p, k);
  const moyenne = flou(Float32Array.from(clarte), W, H, 4);
  const detail = new Float32Array(N);
  for (let k = 0; k < N; k++) detail[k] = borne((clarte[k] - moyenne[k]) * 9, -0.6, 0.6) * (1 - vitre[k]);
  return { masse, detail };
}

/** 04 · The embossed sheet, already lit from the top left: its shade and light, the accent's ink taken out. */
async function processus(): Promise<Formes> {
  const p = await pixels(processusCarte);
  const rouge = new Float32Array(N);
  const lu = new Float32Array(N);
  let [papier, nPapier, encre, nEncre] = [0, 0, 0, 0];
  for (let k = 0; k < N; k++) {
    rouge[k] = borne(((p[k * 4] - Math.max(p[k * 4 + 1], p[k * 4 + 2])) / 255) * 3);
    lu[k] = clarteDe(p, k);
    if (rouge[k] < 0.1) [papier, nPapier] = [papier + lu[k], nPapier + 1];
    else if (rouge[k] > 0.9) [encre, nEncre] = [encre + lu[k], nEncre + 1];
  }
  papier /= nPapier || 1;
  encre = nEncre ? encre / nEncre : papier;
  // each pixel against the flat of its own colour: the ink goes, its relief stays (the ink took
  // the paper's tooth more than the bare sheet did: its small variations are calmed)
  const clarte = new Float32Array(N);
  for (let k = 0; k < N; k++) clarte[k] = (1 + (lu[k] / (papier + (encre - papier) * rouge[k]) - 1) * (1 - 0.55 * rouge[k])) * (1 - 0.02 * rouge[k]);
  // the sheet is brighter towards its light: here it lies in the page's own
  const pente = flou(Float32Array.from(clarte), W, H, 30);
  for (let k = 0; k < N; k++) clarte[k] = borne(clarte[k] / pente[k], 0.4, 1.4);
  return { clarte };
}

export type Numero = '01' | '02' | '03' | '04';

const deja = new Map<Numero, Promise<Formes>>();

/** The shapes left of a project's thumbnail. SNCF GPT's are read from its drawing, which the caller renders. */
export function formesDe(numero: Numero, svg?: SVGSVGElement | null): Promise<Formes> | null {
  const connu = deja.get(numero);
  if (connu) return connu;
  if (numero === '02' && !svg) return null;
  const promesse = numero === '01' ? alpine() : numero === '02' ? sncf(svg!) : numero === '03' ? reunions() : processus();
  deja.set(numero, promesse);
  // a failed read is not kept: the next stage tries again
  promesse.catch(() => deja.delete(numero));
  return promesse;
}
