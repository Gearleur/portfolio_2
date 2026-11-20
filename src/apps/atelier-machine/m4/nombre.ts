import { ETIQUETTES } from './retenu';
import type { Reglages } from './reglages';

/*
 * 1130 and its small label (step M4), drawn once on a canvas for the bubble's shader to print,
 * blur and stretch. Set like the reference's title on its black, in the site's own type: the
 * number in the headline's serif, followed by the headline's coquelicot square, under a label in
 * the grey of the page's labels; or in the terminal's face, followed by its cursor.
 */

export type Face = 'serif' | 'mono';

/** A drawing of the number, and where it goes on the stage, CSS px. */
export type Bloc = { toile: HTMLCanvasElement; x: number; y: number; l: number; h: number };

/** The terminal's ink (m2.css) and the page's accent. */
const ENCRE = '243 243 238';
const COQUELICOT = '#e0301f';
/** The Vitrine's margin, px of a 1440 px page: the number starts where the headline does. */
const MARGE = 16;
/** A console face is wider and blacker than the serif: drawn smaller, it weighs the same. */
const MONO = 0.78;

type Mise = Pick<Reglages, 'numero' | 'corps' | 'place' | 'etiquette' | 'langue' | 'flou'>;

/** `contour`: the number and its sign as their own outline, for when the terminal's lines are read over them. */
export function composer(face: Face, contour: boolean, r: Mise, lieu: { l: number; h: number; u: number }, dpr: number, mono: { famille: string; graisse: number }): Bloc | null {
  const toile = document.createElement('canvas');
  const g = toile.getContext('2d');
  if (!g) return null;
  const { l, h, u } = lieu;

  const corps = r.corps * u * (face === 'mono' ? MONO : 1);
  const police = face === 'serif' ? `400 ${corps}px 'Instrument Serif', Georgia, serif` : `${mono.graisse} ${corps}px ${mono.famille}`;
  const petite = face === 'serif' ? `400 ${15 * u}px Inter, system-ui, sans-serif` : `${mono.graisse} ${14 * u}px ${mono.famille}`;
  const mot = face === 'serif' ? ETIQUETTES[r.langue] : ETIQUETTES[r.langue].toLowerCase();

  g.font = police;
  const n = g.measureText(r.numero);
  const [gauche, droite, haut] = [n.actualBoundingBoxLeft, n.actualBoundingBoxRight, n.actualBoundingBoxAscent];
  // The square that ends the page's headline; in the terminal's hand, its block cursor.
  const cellule = n.width / r.numero.length;
  const signe = face === 'serif' ? { l: corps * 0.15, h: corps * 0.15, ecart: corps * 0.05 } : { l: cellule * 0.5, h: haut, ecart: cellule * 0.2 };
  const groupe = gauche + droite + signe.ecart + signe.l;

  g.font = petite;
  const e = g.measureText(mot);

  // The number's ink: from the page's margin or centred, a little above the middle of the screen.
  const x0 = r.place === 'gauche' ? MARGE * u : (l - groupe) / 2;
  const base = h * 0.49 + haut / 2;
  const ecart = Math.max(16 * u, corps * 0.075);
  const xe = r.place === 'gauche' ? x0 + corps * 0.012 : x0 + (groupe - e.width) / 2;
  const ye = r.etiquette === 'dessus' ? base - haut - ecart : base + ecart + e.actualBoundingBoxAscent;

  // Room around the ink for the blur, and the whole on the grid of device px.
  const marge = 2.2 * r.flou * u + 12;
  const x = Math.floor((Math.min(x0, xe) - marge) * dpr) / dpr;
  const y = Math.floor((Math.min(base - haut, ye - e.actualBoundingBoxAscent) - marge) * dpr) / dpr;
  const largeur = Math.ceil((Math.max(x0 + groupe, xe + e.width) + marge - x) * dpr);
  const hauteur = Math.ceil((Math.max(base + n.actualBoundingBoxDescent, ye + e.actualBoundingBoxDescent) + marge - y) * dpr);
  if (largeur < 1 || hauteur < 1 || largeur > 8192 || hauteur > 8192) return null;

  toile.width = largeur;
  toile.height = hauteur;
  g.scale(dpr, dpr);
  g.translate(-x, -y);
  g.font = police;
  g.fillStyle = g.strokeStyle = `rgb(${ENCRE})`;
  g.lineWidth = Math.max(1.5 * u, corps * 0.008);
  g.lineJoin = 'round';
  if (contour) g.strokeText(r.numero, x0 + gauche, base);
  else g.fillText(r.numero, x0 + gauche, base);
  g.fillStyle = g.strokeStyle = COQUELICOT;
  const [xs, ys] = [x0 + gauche + droite + signe.ecart, base - signe.h];
  if (contour) g.strokeRect(xs + g.lineWidth / 2, ys + g.lineWidth / 2, signe.l - g.lineWidth, signe.h - g.lineWidth);
  else g.fillRect(xs, ys, signe.l, signe.h);
  g.font = petite;
  g.fillStyle = `rgb(${ENCRE} / 0.62)`;
  g.fillText(mot, xe, ye);

  return { toile, x, y, l: largeur / dpr, h: hauteur / dpr };
}
