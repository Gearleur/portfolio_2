import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Maquette } from '../../atelier/Maquettes';
import { Enfoncee } from './Enfoncee';
import { Gomme } from './Gomme';
import type { Mesure } from './Gomme';
import type { Zone } from './gomme';
import type { Reglages } from './reglages';
import { Terminal } from './Terminal';
import '../../atelier/steps/chemin.css';
import './m1.css';

/*
 * The Vitrine in its Machine state (step M1), as a still: the real first screen (Maquette),
 * erased; the eraser's strokes over it; its thumbnails sunk into the paper; and the terminal
 * of smoked glass on top. Nothing here answers a click: the page under the terminal is inert,
 * and only scrolls under the wheel, to see the thumbnails further down.
 *
 * It goes inside a Specimen, which brings the paper, its grain and the page's scale.
 */

const arrondi = (v: number) => Math.round(v * 10) / 10;

/** The lines of a block of text, each as one box. */
function lignes(bloc: Element) {
  const etendue = document.createRange();
  etendue.selectNodeContents(bloc);
  const boites: DOMRect[] = [];
  for (const r of etendue.getClientRects()) {
    if (r.width < 2 || r.height < 2) continue;
    const ligne = boites.findIndex((b) => Math.abs(b.top + b.height / 2 - (r.top + r.height / 2)) < Math.max(b.height, r.height) / 2);
    if (ligne < 0) boites.push(r);
    else {
      const b = boites[ligne];
      const [gauche, haut] = [Math.min(b.left, r.left), Math.min(b.top, r.top)];
      boites[ligne] = new DOMRect(gauche, haut, Math.max(b.right, r.right) - gauche, Math.max(b.bottom, r.bottom) - haut);
    }
  }
  return boites;
}

/** Where the page has something to erase, heaviest first: the headline's lines, the cards, the facts, the side column. */
function mesurer(racine: HTMLElement): Mesure | null {
  const page = racine.querySelector<HTMLElement>('.maquette');
  const etalon = racine.querySelector<HTMLElement>('.m1__etalon');
  if (!page || !etalon) return null;
  const u = etalon.getBoundingClientRect().width / 100;
  if (!u) return null;
  const cadre = page.getBoundingClientRect();
  const zone = (r: DOMRect, poids: number): Zone => ({
    x: arrondi((r.left - cadre.left) / u),
    y: arrondi((r.top - cadre.top + page.scrollTop) / u),
    w: arrondi(r.width / u),
    h: arrondi(r.height / u),
    poids,
  });
  const boites = (selecteur: string, poids: number | number[]) =>
    [...page.querySelectorAll(selecteur)].map((el, i) => zone(el.getBoundingClientRect(), typeof poids === 'number' ? poids : (poids[i] ?? poids[poids.length - 1])));
  const titre = page.querySelector('.m-title');
  const zones = [
    ...(titre ? lignes(titre).map((r) => zone(r, 3)) : []),
    ...boites('.m-visuals li', [2, 2, 1.4, 1.4]),
    ...boites('.m-facts > div', 0.6),
    ...boites('.m-nav', 0.7),
    ...boites('.m-name', 0.5),
    ...boites('.m-contact', 0.4),
  ].filter((z) => z.w > 0 && z.h > 0);
  return { u: Math.round(u * 1e4) / 1e4, largeur: arrondi(page.clientWidth / u), hauteur: arrondi(page.scrollHeight / u), zones };
}

/** The page's own filters: the eraser's drag, and the blind embossing of the words. */
function Filtres({ id, reste, bavure, u }: { id: string; reste: number; bavure: number; u: number }) {
  // The light of the embossed sheet: from the top left. On the flat it gives this much.
  const plat = Math.SQRT1_2;
  const ombre = 1.7 * reste;
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
      {/* An eraser drags along the line it rubs: much blur along it, little across. */}
      <filter id={`${id}-bavure`} x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation={`${(3.2 * bavure * u).toFixed(2)} ${(0.35 * bavure * u).toFixed(2)}`} />
      </filter>
      {/* No ink: the words are a hollow, read by its shaded edge and its lit one. */}
      <filter id={`${id}-sec`} x="-10%" y="-30%" width="120%" height="160%" colorInterpolationFilters="sRGB">
        <feGaussianBlur in="SourceAlpha" stdDeviation={((0.55 + 0.35 * bavure) * u).toFixed(2)} result="creux" />
        <feDiffuseLighting in="creux" surfaceScale={(-3 * u).toFixed(2)} diffuseConstant="1" lightingColor="#fff" result="lumiere">
          <feDistantLight azimuth="225" elevation="45" />
        </feDiffuseLighting>
        <feColorMatrix in="lumiere" type="matrix" values={`0 0 0 0 0.07  0 0 0 0 0.07  0 0 0 0 0.07  ${-ombre} 0 0 0 ${ombre * plat}`} result="ombre" />
        <feColorMatrix in="lumiere" type="matrix" values={`0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ${2 * ombre} 0 0 0 ${-2 * ombre * plat}`} result="eclat" />
        <feFlood floodColor="#161614" floodOpacity={(0.07 * reste).toFixed(3)} />
        <feComposite in2="SourceAlpha" operator="in" result="fond" />
        <feMerge>
          <feMergeNode in="fond" />
          <feMergeNode in="ombre" />
          <feMergeNode in="eclat" />
        </feMerge>
      </filter>
    </svg>
  );
}

export function Machine({ reglages }: { reglages: Reglages }) {
  const { page, gomme, miniatures, verre } = reglages;
  const racine = useRef<HTMLDivElement>(null);
  const id = useId().replace(/[^\w-]/g, '');
  const [mesure, setMesure] = useState<Mesure>({ u: 1, largeur: 1440, hauteur: 900, zones: [] });

  // The page's scale and its zones, measured on the real page whenever its layout may have changed.
  useEffect(() => {
    const el = racine.current;
    if (!el) return;
    const relever = () => {
      const lue = mesurer(el);
      if (!lue) return;
      const maquette = el.querySelector<HTMLElement>('.maquette');
      el.style.setProperty('--defil', `${-(maquette?.scrollTop ?? 0)}px`);
      setMesure((avant) => (JSON.stringify(avant) === JSON.stringify(lue) ? avant : lue));
    };
    const taille = new ResizeObserver(relever);
    taille.observe(el);
    for (const bloc of el.querySelectorAll('.m-hero, .m-visuals')) taille.observe(bloc);
    // the headline wraps once its face has loaded
    void document.fonts?.ready.then(relever);

    // The wheel scrolls the erased page under the terminal; the strokes follow their paper.
    const rouler = (event: WheelEvent) => {
      const maquette = el.querySelector<HTMLElement>('.maquette');
      if (!maquette) return;
      const avant = maquette.scrollTop;
      maquette.scrollTop += event.deltaY;
      if (maquette.scrollTop === avant) return;
      event.preventDefault();
      el.style.setProperty('--defil', `${-maquette.scrollTop}px`);
    };
    el.addEventListener('wheel', rouler, { passive: false });
    return () => {
      taille.disconnect();
      el.removeEventListener('wheel', rouler);
    };
  }, []);

  const images = useMemo(
    () => ({
      '01': <Enfoncee numero="01" miniatures={miniatures} />,
      '02': <Enfoncee numero="02" miniatures={miniatures} />,
      '03': <Enfoncee numero="03" miniatures={miniatures} />,
      '04': <Enfoncee numero="04" miniatures={miniatures} />,
    }),
    [miniatures],
  );

  const style = {
    '--reste': page.reste,
    '--braise': page.accent,
    '--bavure': page.bavure > 0 ? `url(#${id}-bavure)` : 'none',
    '--sec': `url(#${id}-sec)`,
    '--irregularite': gomme.irregularite,
  } as CSSProperties;

  return (
    <div ref={racine} className="m1" data-page={page.maniere} style={style}>
      <Filtres id={id} reste={page.reste} bavure={page.bavure} u={mesure.u} />
      <div className="m1__page" inert>
        <Maquette blocks={page.maniere === 'blocs'} images={images} />
      </div>
      <Gomme gomme={gomme} mesure={mesure} />
      <Terminal verre={verre} u={mesure.u} />
      <span className="m1__etalon" aria-hidden="true" />
    </div>
  );
}
