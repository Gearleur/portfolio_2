/* global Buffer, console, process */
/*
 * Prints the thumbnail of « Comment je dessine un produit avec l'IA » (journal n° 109): the
 * seventeen layouts explored for this portfolio at step 5, blind-embossed in a sheet of paper,
 * the one retained printed in the accent.
 *   src/apps/atelier/medias/processus-carte.webp    the Vitrine's card: nine of them, close
 *   src/apps/atelier/medias/processus-planche.webp  the article's first figure: all seventeen
 * and each a second time, `-droite`, lit from the top right instead of the top left: the page
 * fades one into the other, and the light turns around the sheet (MiniatureProcessus.tsx).
 *
 *   FFMPEG=/path/to/ffmpeg node scripts/tirerGaufrage.mjs
 * FFMPEG needs libwebp (a static build, such as pip's imageio-ffmpeg, has it).
 *
 * Nothing is drawn by hand. scripts/gaufrage-pistes.json holds the blocks of each layout as a
 * browser laid them out at 1440 × 900 (commit 0022543, where the seventeen still live: every run
 * of words, picture and rule, measured in the page). They become a height field: each page is
 * pressed into the sheet, its blocks stand back up, and a low light from the top left shades it.
 */
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const RACINE = join(import.meta.dirname, '..');
const MEDIAS = join(RACINE, 'src/apps/atelier/medias');
const PISTES = JSON.parse(readFileSync(join(import.meta.dirname, 'gaufrage-pistes.json'), 'utf8'));
const ffmpeg = process.env.FFMPEG ?? 'ffmpeg';

/** The layout retained at step 5 (journal n° 41), and the others in the order of the Atelier's panel. */
const RETENUE = 'laterale-droite';
const AUTRES = ['colonnes', 'colonnes-index', 'colonnes-trois', 'laterale', 'laterale-liste', 'agence', 'agence-cadre', 'agence-index', 'affiche', 'journal', 'cartel', 'plan', 'manuel', 'coins', 'couverture', 'lookbook'];

const PAPIER = '#F1EEE6';
const ENCRE = '#E0301F'; // the accent, Coquelicot

// --- noise: a well-mixed integer hash, and its smooth version

function hash(x, y, s) {
  let h = Math.imul(x | 0, 0x9e3779b1) ^ Math.imul(y | 0, 0x85ebca77) ^ Math.imul(s | 0, 0xc2b2ae3d);
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  h = Math.imul(h ^ (h >>> 12), 0x297a2d39);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

function bruit(x, y, s) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = hash(xi, yi, s);
  const b = hash(xi + 1, yi, s);
  const c = hash(xi, yi + 1, s);
  const d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

// --- rectangles on a field, antialiased on their edges

/** Calls `f(index, coverage)` for every pixel the rectangle touches. */
function surRect(W, H, x, y, w, h, f) {
  const x0 = Math.max(0, Math.floor(x));
  const y0 = Math.max(0, Math.floor(y));
  const x1 = Math.min(W, Math.ceil(x + w));
  const y1 = Math.min(H, Math.ceil(y + h));
  for (let j = y0; j < y1; j++) {
    const cy = Math.min(1, Math.min(j + 1, y + h) - Math.max(j, y));
    if (cy <= 0) continue;
    for (let i = x0; i < x1; i++) {
      const cx = Math.min(1, Math.min(i + 1, x + w) - Math.max(i, x));
      if (cx > 0) f(j * W + i, cx * cy);
    }
  }
}

/** Three box blurs, close to a Gaussian of that radius: the press rounds every edge. */
function flou(champ, W, H, rayon) {
  const r = Math.max(1, Math.round(rayon));
  const tmp = new Float32Array(champ.length);
  for (let passe = 0; passe < 3; passe++) {
    for (let j = 0; j < H; j++) {
      const ligne = j * W;
      let somme = 0;
      for (let i = -r; i <= r; i++) somme += champ[ligne + Math.min(W - 1, Math.max(0, i))];
      for (let i = 0; i < W; i++) {
        tmp[ligne + i] = somme / (2 * r + 1);
        somme += champ[ligne + Math.min(W - 1, i + r + 1)] - champ[ligne + Math.max(0, i - r)];
      }
    }
    for (let i = 0; i < W; i++) {
      let somme = 0;
      for (let j = -r; j <= r; j++) somme += tmp[Math.min(H - 1, Math.max(0, j)) * W + i];
      for (let j = 0; j < H; j++) {
        champ[j * W + i] = somme / (2 * r + 1);
        somme += tmp[Math.min(H - 1, j + r + 1) * W + i] - tmp[Math.max(0, j - r) * W + i];
      }
    }
  }
}

const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);
const lineaire = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const srgb = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

/**
 * One print, as RGBA bytes.
 * @param {object} o
 * @param {number} o.largeur  width of the picture, px (16:9)
 * @param {[number, number]} o.grille  columns and rows of pages
 * @param {[number, number]} o.place  column and row of the retained page, which takes 2 × 2 cells
 * @param {string[]} o.autres  the other layouts, in reading order around it
 * @param {boolean} [o.droite]  lit from the top right, instead of the top left
 */
function tirer({ largeur: W, grille: [cols, rangs], place: [gc, gr], autres, marge = 78, gouttiere = 26, droite = false }) {
  const H = Math.round((W * 9) / 16);
  const e = W / 1740; // every length below is given for a sheet 1740 px wide
  const papier = hex(PAPIER).map(lineaire);
  const encre = hex(ENCRE).map(lineaire);

  // the pages: a grid of 16:10 first screens, the retained one four times larger
  const m = marge * e;
  const g = gouttiere * e;
  const cw = (W - 2 * m - (cols - 1) * g) / cols;
  const ch = cw * 0.625;
  const haut = (H - (rangs * ch + (rangs - 1) * g)) / 2;
  const cases = [];
  for (let r = 0; r < rangs; r++) for (let c = 0; c < cols; c++) if (c < gc || c > gc + 1 || r < gr || r > gr + 1) cases.push([c, r]);
  const pages = autres.slice(0, cases.length).map((id, i) => ({ id, x: m + cases[i][0] * (cw + g), y: haut + cases[i][1] * (ch + g), w: cw, h: ch }));
  pages.push({ id: RETENUE, x: m + gc * (cw + g), y: haut + gr * (ch + g), w: 2 * cw + g, h: 2 * ch + g, retenue: true });

  // heights, in px of this picture: 0 is the sheet, a page is pressed below it, its blocks rise from its floor
  const relief = new Float32Array(W * H);
  const aplat = new Float32Array(W * H); // where the accent is printed
  for (const page of pages) {
    const fond = (page.retenue ? -3.4 : -3) * 1.3 * e;
    const k = (page.retenue ? 1.25 : 1) * 1.5 * e;
    surRect(W, H, page.x, page.y, page.w, page.h, (i, c) => {
      relief[i] = fond * c;
      if (page.retenue) aplat[i] = c;
    });
    for (const [type, bx, by, bw, bh, corps] of PISTES[page.id]) {
      // the block, in the page, clipped to it
      let x = page.x + (bx * page.w) / 1440;
      let y = page.y + (by * page.h) / 900;
      let w = (bw * page.w) / 1440;
      let h = (bh * page.h) / 900;
      if (x < page.x) [w, x] = [w - (page.x - x), page.x];
      if (y < page.y) [h, y] = [h - (page.y - y), page.y];
      w = Math.min(w, page.x + page.w - x);
      h = Math.min(h, page.y + page.h - y);
      if (w <= 0 || h <= 0) continue;
      let haute = 1.9;
      if (type === 'i') haute = 1.5;
      else if (type === 'm') haute = 2.6;
      else if (type === 't') haute = corps >= 40 ? 2.6 : corps >= 20 ? 2.2 : 1.9;
      else {
        // a hairline keeps a width the press can hold
        const min = 0.9 * e;
        if (w < min) [x, w] = [x - (min - w) / 2, min];
        if (h < min) [y, h] = [y - (min - h) / 2, min];
        haute = 1.1;
      }
      surRect(W, H, x, y, w, h, (i, c) => {
        relief[i] = Math.max(relief[i], fond + haute * k * c);
        // on the printed page, words and pictures are left in the paper
        if (page.retenue && type !== 'f') aplat[i] = Math.min(aplat[i], 1 - c);
      });
    }
  }
  flou(relief, W, H, 1.25 * e);

  // the paper: felt marks and tooth, in height and in tone
  const grain = new Float32Array(W * H);
  const ton = new Float32Array(W * H);
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const x = i / e;
      const y = j / e;
      const feutre = bruit(x / 38, y / 38, 1) * 0.45 + bruit(x / 13, y / 13, 2) * 0.33 + bruit(x / 5, y / 5, 3) * 0.22;
      const dent = bruit(x / 2.1, y / 2.1, 4) * 0.6 + hash(i, j, 5) * 0.4;
      grain[j * W + i] = ((feutre - 0.5) * 1.05 + (dent - 0.5) * 0.42) * e;
      ton[j * W + i] = (bruit(x / 120, y / 90, 6) - 0.5) * 0.02 + (bruit(x / 9, y / 7, 7) - 0.5) * 0.018 + (hash(i, j, 8) - 0.5) * 0.03;
    }
  }

  // one low light, from the top left (or the top right)
  const azimut = ((droite ? 315 : 225) * Math.PI) / 180;
  const elevation = (20 * Math.PI) / 180;
  const lx = Math.cos(azimut) * Math.cos(elevation);
  const ly = Math.sin(azimut) * Math.cos(elevation); // the screen's y runs down
  const lz = Math.sin(elevation);
  const dx = lx / Math.hypot(lx, ly);
  const dy = ly / Math.hypot(lx, ly);
  const pente = Math.tan(elevation);
  const portee = Math.round(14 * e);
  const h = (i, j) => relief[Math.min(H - 1, Math.max(0, j)) * W + Math.min(W - 1, Math.max(0, i))];
  const gr2 = (i, j) => grain[Math.min(H - 1, Math.max(0, j)) * W + Math.min(W - 1, Math.max(0, i))];
  // half-way between the light and the eye, for a soft sheen
  const mi = 1 / Math.hypot(lx, ly, lz + 1);

  const image = Buffer.alloc(W * H * 4);
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const k = j * W + i;
      const hx = (h(i + 1, j) - h(i - 1, j)) / 2 + (gr2(i + 1, j) - gr2(i - 1, j)) / 2;
      const hy = (h(i, j + 1) - h(i, j - 1)) / 2 + (gr2(i, j + 1) - gr2(i, j - 1)) / 2;
      const inv = 1 / Math.hypot(hx, hy, 1);
      const nx = -hx * inv;
      const ny = -hy * inv;
      // 1 on the flat, brighter on what faces the light
      let clarte = 1 + (Math.max(0, (nx * lx + ny * ly + inv * lz) / lz) - 1) * 0.62;

      // cast shadow: what stands between this point and the light
      const h0 = relief[k];
      let ombre = 0;
      for (let s = 1; s <= portee; s++) {
        const X = i + dx * s;
        const Y = j + dy * s;
        const xi = Math.floor(X);
        const yi = Math.floor(Y);
        const fx = X - xi;
        const fy = Y - yi;
        const hs = h(xi, yi) * (1 - fx) * (1 - fy) + h(xi + 1, yi) * fx * (1 - fy) + h(xi, yi + 1) * (1 - fx) * fy + h(xi + 1, yi + 1) * fx * fy;
        const depasse = hs - (h0 + s * pente);
        if (depasse > 0) ombre = Math.max(ombre, Math.min(1, depasse / (0.9 * e)) * (1 - (s / portee) * 0.55));
      }
      clarte *= 1 - ombre * 0.42;

      const reflet = Math.max(0, (nx * lx + ny * ly + inv * (lz + 1)) * mi) ** 22;
      // the sheet is a little brighter towards the light
      const fenetre = 1 + 0.07 * (0.5 - ((droite ? 1 - i / W : i / W) * 0.62 + (j / H) * 0.38));
      const t = (1 + ton[k]) * fenetre;
      const a = aplat[k] * (0.975 + 0.025 * bruit(i / e / 3, j / e / 3, 9)); // the ink takes the paper's tooth
      for (let c = 0; c < 3; c++) {
        let v = papier[c] * t * clarte + reflet * 0.035;
        if (a > 0) v = v * (1 - a) + encre[c] * (0.9 + 0.1 * Math.min(1.15, clarte)) * a + reflet * 0.06 * a;
        image[k * 4 + c] = Math.round(255 * srgb(Math.min(1, Math.max(0, v))));
      }
      image[k * 4 + 3] = 255;
    }
  }
  return { image, W, H };
}

function enregistrer({ image, W, H }, fichier, qualite) {
  return new Promise((ok, ko) => {
    const p = spawn(
      ffmpeg,
      ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-i', '-', '-frames:v', '1', '-c:v', 'libwebp', '-quality', String(qualite), '-compression_level', '6', fichier],
      { stdio: ['pipe', 'inherit', 'inherit'] },
    );
    p.on('close', (code) => (code === 0 ? ok() : ko(new Error(`ffmpeg s'est arrêté (${code})`))));
    p.stdin.end(image);
  });
}

// The card is small: nine pages, the retained one in the middle of the bottom row.
// The article's first figure is large: all seventeen.
const TIRAGES = [
  { nom: 'carte', qualite: Number(process.env.QUALITE_CARTE ?? 78), largeur: 1280, grille: [4, 3], place: [1, 1], marge: 70, gouttiere: 30, autres: ['colonnes', 'agence', 'journal', 'plan', 'cartel', 'couverture', 'affiche', 'lookbook'] },
  { nom: 'planche', qualite: Number(process.env.QUALITE_PLANCHE ?? 74), largeur: 2000, grille: [5, 4], place: [1, 1], autres: AUTRES },
];

for (const { nom, qualite, ...feuille } of TIRAGES) {
  for (const droite of [false, true]) {
    const tirage = tirer({ ...feuille, droite });
    const fichier = `processus-${nom}${droite ? '-droite' : ''}.webp`;
    await enregistrer(tirage, join(MEDIAS, fichier), qualite);
    console.log(`${fichier} ${tirage.W} × ${tirage.H}`);
  }
}
