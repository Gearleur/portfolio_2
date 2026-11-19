import type { Miniatures } from './reglages';

/*
 * The sunken thumbnails (step M1), pressed live with the recipe of the embossed sheet of
 * « Dessiner avec l'IA » (scripts/tirerGaufrage.mjs, journal n° 109): a height field, rounded
 * by the press, under one low light from the top left.
 *
 * A card is pressed below the sheet; what is left of its shapes stands back up from the floor.
 * The print is not a picture of paper: it is only the shade and the light the relief adds,
 * black or white with an alpha, laid over the page's own paper and grain.
 *
 * It is worked out again at every move of a slider, for four cards: the loops below are
 * written flat, without a call or a bound check per pixel.
 */

/** A card of the Vitrine at 1440 px, and the margin its soft edges and shadows may spill into. */
export const CARTE = { W: 518, H: 291, MARGE: 24 };

/**
 * What is left of a thumbnail, over the card's W × H: `masse`, its large shapes, and `detail`,
 * its fine ones (0 to 1; a detail may go below 0, a groove). Or `clarte`, for a picture that is
 * already a lit relief: its shade and light themselves, 1 on the flat.
 */
export type Formes = { masse?: Float32Array; detail?: Float32Array; clarte?: Float32Array };

const lisse = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** A running mean over one line or column: `n` samples from `depart`, `pas` apart, the ends held. */
function moyenne(de: Float32Array, vers: Float32Array, depart: number, pas: number, n: number, r: number) {
  const fin = depart + (n - 1) * pas;
  const k = 1 / (2 * r + 1);
  let somme = de[depart] * (r + 1);
  for (let i = 1; i <= r; i++) somme += de[i < n ? depart + i * pas : fin];
  let entre = depart + (r + 1) * pas;
  let sort = depart - r * pas;
  for (let o = depart; o <= fin; o += pas) {
    vers[o] = somme * k;
    somme += de[entre > fin ? fin : entre] - de[sort < depart ? depart : sort];
    entre += pas;
    sort += pas;
  }
}

/** Three box blurs, close to a Gaussian of that radius: the press rounds every edge. */
export function flou(champ: Float32Array, W: number, H: number, rayon: number) {
  const r = Math.round(rayon);
  if (r < 1) return champ;
  const tmp = new Float32Array(champ.length);
  for (let passe = 0; passe < 3; passe++) {
    for (let j = 0; j < H; j++) moyenne(champ, tmp, j * W, 1, W, r);
    for (let i = 0; i < W; i++) moyenne(tmp, champ, i, W, H, r);
  }
  return champ;
}

/** A field given over the card, laid in the middle of the larger sheet. */
function poser(champ: Float32Array | undefined, w: number, h: number) {
  const { W, H, MARGE } = CARTE;
  const pose = new Float32Array(w * h);
  if (!champ) return pose;
  for (let j = 0; j < H; j++) pose.set(champ.subarray(j * W, (j + 1) * W), (j + MARGE) * w + MARGE);
  return pose;
}

// One low light from the top left, as on the embossed sheet.
const AZIMUT = (225 * Math.PI) / 180;

/** The steps towards the light at which something may stand in the way, px. */
const PORTEE = [1, 2, 3, 4, 6, 8, 11, 14];
/** The sheet's rim is left flat: nothing there stands, and a shadow never looks past the sheet. */
const BORD = 12;

/**
 * Shade and light of a height field (px), 1 on the flat: brighter on what faces the light,
 * darker on what turns away and in the shadow of what stands between it and the light.
 * `force` is how much a slope changes its tone (0.62 on the embossed sheet, seen smaller).
 */
function eclairer(relief: Float32Array, w: number, h: number, elevation: number, portee: boolean, force: number) {
  const lx = Math.cos(AZIMUT) * Math.cos(elevation);
  const ly = Math.sin(AZIMUT) * Math.cos(elevation); // the screen's y runs down
  const lz = Math.sin(elevation);
  const pente = Math.tan(elevation);
  const dx = lx / Math.sqrt(lx * lx + ly * ly);
  const dy = ly / Math.sqrt(lx * lx + ly * ly);
  // where to look towards the light, how high a ray has risen there, how much a shadow from there weighs
  const pas = portee ? PORTEE : [];
  const ou = pas.map((s) => Math.round(dy * s) * w + Math.round(dx * s));
  const montee = pas.map((s) => s * pente);
  const poids = pas.map((s) => 1 - (s / 14) * 0.55);
  const clarte = new Float32Array(w * h).fill(1);

  for (let j = BORD; j < h - BORD; j++) {
    for (let k = j * w + BORD, fin = j * w + w - BORD; k < fin; k++) {
      const hx = (relief[k + 1] - relief[k - 1]) / 2;
      const hy = (relief[k + w] - relief[k - w]) / 2;
      const face = (-hx * lx - hy * ly + lz) / (lz * Math.sqrt(hx * hx + hy * hy + 1));
      let c = 1 + ((face > 0 ? face : 0) - 1) * force;
      const h0 = relief[k];
      let ombre = 0;
      for (let q = 0; q < ou.length; q++) {
        const depasse = relief[k + ou[q]] - h0 - montee[q];
        if (depasse > 0) {
          const o = (depasse > 0.9 ? 1 : depasse / 0.9) * poids[q];
          if (o > ombre) ombre = o;
        }
      }
      if (ombre > 0) c *= 1 - ombre * 0.34;
      clarte[k] = c;
    }
  }
  return clarte;
}

/** What is left of the shapes, for this much `formes`: the masses come first, the details after. */
function restes(formes: Formes, quantite: number, w: number, h: number, rayon: number) {
  const masse = poser(formes.masse, w, h);
  const detail = poser(formes.detail, w, h);
  const a = lisse(0, 0.5, quantite);
  const b = lisse(0.3, 1, quantite) * 0.55;
  for (let k = 0; k < masse.length; k++) {
    const s = a * masse[k] + b * detail[k];
    masse[k] = s > 1 ? 1 : s;
  }
  return flou(masse, w, h, rayon);
}

/** A line where a soft field crosses its middle, about 1.5 px wide whatever the field's slope. */
function iso(champ: Float32Array, w: number, k: number) {
  const gx = champ[k + 1] - champ[k - 1];
  const gy = champ[k + w] - champ[k - w];
  const pente = Math.sqrt(gx * gx + gy * gy) / 2;
  if (pente < 0.02) return 0;
  const trait = 1.25 - Math.abs(champ[k] - 0.5) / pente;
  return trait > 1 ? 1 : trait > 0 ? trait : 0;
}

/**
 * One print of a sunken card, as RGBA bytes over a (W + 2 × MARGE) × (H + 2 × MARGE) sheet:
 * black where the relief shades the paper, white where it catches the light.
 */
export function tirer(formes: Formes | null, { maniere, profondeur, formes: quantite }: Miniatures) {
  const { W, H, MARGE } = CARTE;
  const w = W + 2 * MARGE;
  const h = H + 2 * MARGE;
  const image = new Uint8ClampedArray(w * h * 4);
  const source = formes ?? {};

  // the card's own place in the sheet
  const puits = new Float32Array(w * h);
  for (let j = MARGE; j < MARGE + H; j++) puits.fill(1, j * w + MARGE, j * w + MARGE + W);

  if (maniere === 'contour') {
    // No relief: a frame, a faint tint, and the outline of what is left.
    const a = lisse(0, 0.5, quantite) * 0.5;
    const b = lisse(0.5, 1, quantite) * 0.26;
    const c = lisse(0.3, 1, quantite) * 0.5;
    const masse = flou(poser(source.masse, w, h), w, h, 1);
    // the details run together, as words do seen from afar
    const detail = flou(poser(source.detail, w, h), w, h, 2);
    for (let k = 0; k < detail.length; k++) detail[k] = Math.min(1, Math.abs(detail[k]) * 2.2);
    // a lit relief is drawn by its shadows
    const ombres = source.clarte ? poser(source.clarte, w, h) : null;
    const teinte = 0.012 + 0.06 * profondeur;
    for (let j = MARGE; j < MARGE + H; j++) {
      for (let i = MARGE; i < MARGE + W; i++) {
        const k = j * w + i;
        const cadre = i === MARGE || j === MARGE || i === MARGE + W - 1 || j === MARGE + H - 1;
        let trait = Math.max(cadre ? 0.3 : 0, teinte, a * iso(masse, w, k), b * iso(detail, w, k));
        if (ombres) trait = Math.max(trait, c * Math.min(1, Math.max(0, (1 - ombres[k] - 0.035) * 7)));
        image[k * 4] = image[k * 4 + 1] = image[k * 4 + 2] = 18;
        image[k * 4 + 3] = 255 * trait;
      }
    }
    return { image, w, h };
  }

  // A well with sharp walls, or a soft imprint with none.
  const mou = maniere === 'empreinte';
  const fond = (mou ? 7 : 2.8) * profondeur;
  const rayon = mou ? Math.round(8 + 4 * profondeur) : 1;
  if (mou) {
    // a soft edge is wide: the imprint starts that much inside the card, so its slope ends near
    // the card's edge and nothing is cut at the sheet's rim
    puits.fill(0);
    for (let j = MARGE + rayon; j < MARGE + H - rayon; j++) puits.fill(1, j * w + MARGE + rayon, j * w + MARGE + W - rayon);
  }
  flou(puits, w, h, rayon);
  const debout = restes(source, quantite, w, h, mou ? 2 : 1);
  const tenue = mou ? 0.7 : 0.8;
  const relief = new Float32Array(w * h);
  for (let k = 0; k < relief.length; k++) relief[k] = -fond * puits[k] * (1 - tenue * debout[k]);
  const clarte = eclairer(relief, w, h, ((mou ? 26 : 24) * Math.PI) / 180, !mou, mou ? 0.5 : 0.46);

  // a picture that is already a lit relief keeps its own shade, softened for an imprint
  const propre = source.clarte ? poser(source.clarte, w, h) : null;
  if (propre && mou) {
    for (let k = 0; k < propre.length; k++) propre[k] = puits[k] > 0.5 ? propre[k] : 1;
    flou(propre, w, h, 1);
  }
  const gain = lisse(0, 0.2, quantite) * (0.35 + 1.1 * quantite) * (mou ? 0.8 : 1) * Math.min(1, profondeur * 3);
  const plancher = 0.05 * profondeur;

  for (let k = 0; k < clarte.length; k++) {
    // the floor of the well gets a little less light than the sheet
    let c = clarte[k] * (1 - plancher * puits[k]);
    if (propre && puits[k] > 0.5) c *= 1 + (propre[k] - 1) * gain;
    if (c === 1) continue;
    // black where it shades (the print multiplies the paper), white where it catches the light
    const eclat = c > 1;
    image[k * 4] = image[k * 4 + 1] = image[k * 4 + 2] = eclat ? 255 : 18;
    image[k * 4 + 3] = 255 * (eclat ? (c - 1) * 1.3 : 1 - c);
  }
  return { image, w, h };
}
