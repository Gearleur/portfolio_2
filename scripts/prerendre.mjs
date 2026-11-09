/* global console */
/*
 * Renders the Vitrine into dist/index.html after `vite build` (journal n° 107), so the
 * page shows before its script arrives: one copy per language and layout, in
 * #vitrine-statique, the right one shown by CSS. Run by `pnpm build`.
 *
 * The components read a few things from the browser while they render (the window's
 * width, the language kept, the address): they get a small stand-in window here.
 */
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';

const RACINE = resolve(import.meta.dirname, '..');
const SORTIE = join(RACINE, 'node_modules', '.prerendu');
const PAGE = join(RACINE, 'dist', 'index.html');

await build({
  root: RACINE,
  logLevel: 'warn',
  build: { ssr: 'src/apps/portfolio/prerendu.tsx', outDir: SORTIE, emptyOutDir: true },
});

const rien = () => {};
globalThis.window = {
  location: { pathname: '/', hash: '', search: '' },
  navigator: { language: 'fr' },
  devicePixelRatio: 1,
  addEventListener: rien,
  removeEventListener: rien,
};
globalThis.navigator ??= globalThis.window.navigator;

const { rendre, VARIANTES } = await import(pathToFileURL(join(SORTIE, 'prerendu.js')).href);

// Each copy gets its own ids (the drawings' clip paths point to them by id).
const copies = VARIANTES.map((variante) => {
  const prefixe = `${variante.langue}-${variante.telephone ? 'tel' : 'bureau'}-`;
  let html = rendre(variante);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  for (const id of new Set(ids)) {
    const e = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    html = html.replace(new RegExp(`(\\sid="|url\\(#|href="#)${e}(["')])`, 'g'), `$1${prefixe}${id}$2`);
  }
  return `<div data-langue="${variante.langue}" data-ecran="${variante.telephone ? 'telephone' : 'bureau'}">${html}</div>`;
});

// a page already rendered keeps one set of copies: the old one is replaced
const page = readFileSync(PAGE, 'utf8').replace(/\n {4}<div id="vitrine-statique">.*\n/, '\n');
const ancre = '<div id="vitrine"></div>';
if (!page.includes(ancre)) throw new Error(`${ancre} absent de dist/index.html`);
writeFileSync(PAGE, page.replace(ancre, `${ancre}\n    <div id="vitrine-statique">${copies.join('')}</div>`));
rmSync(SORTIE, { recursive: true, force: true });
console.log(`Vitrine rendue d'avance : ${copies.length} copies, ${(copies.join('').length / 1024).toFixed(0)} Ko.`);
