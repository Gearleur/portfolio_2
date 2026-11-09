import { useEffect, useRef } from 'react';
import affiche from './medias/reunions-affiche.webp';
import { creerVerre } from './reunions-scene/verre';
import type { Verre } from './reunions-scene/verre';
import { dessinerVoix } from './reunions-scene/voix';
import './reunions-scene/reunions.css';

/*
 * Synthèse de réunions' thumbnail, alive (journal n° 103): three voices in
 * their colours under a liquid-glass loupe, over an embossed fingerprint on a
 * flowing mint gradient. WebGL 2 draws the paper and the glass, a 2D canvas the
 * voices. It starts on the very frame of the poster, which stays under it until
 * the first frame is drawn, and again whenever WebGL is missing or lost. It
 * stops out of view, in a hidden tab, and when the page is left.
 */

/** The moment the poster was taken: the film starts there, so the poster gives way without a jump. */
const DEPART = 6;

export default function FilmReunions() {
  const hote = useRef<HTMLDivElement>(null);
  const toileVerre = useRef<HTMLCanvasElement>(null);
  const toileVoix = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = hote.current;
    const cVerre = toileVerre.current;
    const cVoix = toileVoix.current;
    const g = cVoix?.getContext('2d');
    if (!el || !cVerre || !cVoix || !g) return;

    let verre: Verre | null = creerVerre(cVerre);
    if (!verre) return;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let visible = false;
    let raf = 0;
    let dernier = 0;
    let ecoule = 0;

    const image = (ms: number) => {
      raf = 0;
      if (!verre) return;
      // a pause (out of view, hidden tab) does not make the film jump on return
      ecoule += dernier ? Math.min(0.1, (ms - dernier) / 1000) : 0;
      dernier = ms;
      const t = DEPART + ecoule;
      verre.rendre(t);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      dessinerVoix(g, W, H, t);
      el.dataset.pret = '';
      lance();
    };
    const lance = () => {
      if (!raf && verre && W && visible && !document.hidden) raf = requestAnimationFrame(image);
    };
    const arrete = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      dernier = 0;
    };
    const maj = () => (visible && !document.hidden ? lance() : arrete());

    const taille = new ResizeObserver(() => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const d = Math.min(2, window.devicePixelRatio || 1);
      if (!w || !h || (w === W && h === H && d === dpr)) return;
      W = w;
      H = h;
      dpr = d;
      cVerre.width = cVoix.width = Math.round(W * dpr);
      cVerre.height = cVoix.height = Math.round(H * dpr);
      verre?.dimensionner(W, H, dpr);
      // a resized canvas is blank until the next frame
      arrete();
      maj();
    });
    taille.observe(el);

    const vue = new IntersectionObserver(([entree]) => {
      visible = entree.isIntersecting;
      maj();
    });
    vue.observe(el);
    document.addEventListener('visibilitychange', maj);
    window.addEventListener('pagehide', arrete);
    window.addEventListener('pageshow', maj);

    // a lost context (the GPU reset, too many contexts) shows the poster until it comes back
    const perdu = (e: Event) => {
      e.preventDefault();
      arrete();
      delete el.dataset.pret;
      verre = null;
    };
    const retrouve = () => {
      verre = creerVerre(cVerre);
      if (verre && W) verre.dimensionner(W, H, dpr);
      maj();
    };
    cVerre.addEventListener('webglcontextlost', perdu);
    cVerre.addEventListener('webglcontextrestored', retrouve);

    return () => {
      arrete();
      taille.disconnect();
      vue.disconnect();
      document.removeEventListener('visibilitychange', maj);
      window.removeEventListener('pagehide', arrete);
      window.removeEventListener('pageshow', maj);
      cVerre.removeEventListener('webglcontextlost', perdu);
      cVerre.removeEventListener('webglcontextrestored', retrouve);
      verre?.liberer();
    };
  }, []);

  return (
    <div ref={hote} className="reunions">
      <img className="reunions__affiche" src={affiche} alt="" decoding="async" />
      <canvas ref={toileVerre} className="reunions__verre" aria-hidden="true" />
      <canvas ref={toileVoix} className="reunions__voix" aria-hidden="true" />
    </div>
  );
}
