import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import fond from './medias/whiteboard-amdec-fond.webp';
import { useVisible } from './useVisible';
import './miniature-alpine.css';

/*
 * Whiteboard AMDEC's thumbnail: the validated poster, alive. The picture under
 * it is the poster without its figures (the big A, the paper and the grain are
 * untouched); the SVG on top redraws them in the poster's own coordinates
 * (1448 × 1086), so the two always line up, whatever the card's proportions:
 * the SVG crops the poster exactly as the picture would.
 *
 * What moves: the readings change one at a time, the curve is drawn and
 * wiped with its point, some grid lines appear and disappear, the sight turns.
 * Still, with reduced motion, it shows the poster's own values.
 */

const MOINS = '−';
const FINE = ' ';

// The poster's values come first, so the still version is the real poster.
const ENV: [number, number][] = [[-10, 40], [-20, 55], [-5, 70], [-30, 85], [-15, 60]];
const ALT = [2500, 3200, 1800, 4100, 2900];
const CHARGE = [1.5, 2.0, 2.5, 1.2, 1.8];
const LAT = [48.7128, 48.7131, 48.7126, 48.7134, 48.7129];
const LON = [2.3731, 2.3733, 2.3729, 2.3735, 2.3732];

const signe = (n: number) => (n < 0 ? `${MOINS}${Math.abs(n)}` : `${n}`);
const milliers = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, FINE);

/** Which reading changes at each beat; each has its own step in its list. */
const CHAMPS = ['env', 'alt', 'charge', 'lat', 'lon'] as const;
type Champ = (typeof CHAMPS)[number];

function useLectures(actif: boolean) {
  const [pas, setPas] = useState<Record<Champ, number>>({ env: 0, alt: 0, charge: 0, lat: 0, lon: 0 });
  const [dernier, setDernier] = useState<{ champ: Champ; n: number } | null>(null);

  useEffect(() => {
    if (!actif || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let beat = 0;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      const champ = CHAMPS[beat % CHAMPS.length];
      beat += 1;
      setPas((p) => ({ ...p, [champ]: p[champ] + 1 }));
      setDernier({ champ, n: beat });
    }, 1700);
    return () => window.clearInterval(id);
  }, [actif]);

  const at = <T,>(list: T[], champ: Champ) => list[pas[champ] % list.length];
  const [basse, haute] = at(ENV, 'env');
  return {
    dernier,
    env: `${signe(basse)} / ${haute} °C`,
    alt: `0 – ${milliers(at(ALT, 'alt'))} m`,
    charge: `0 – ${at(CHARGE, 'charge').toFixed(1)} g`,
    lat: `${at(LAT, 'lat').toFixed(4)}° N`,
    lon: `${at(LON, 'lon').toFixed(4)}° E`,
  };
}

// The graph's frame, in the poster's coordinates.
const GRILLE = { x0: 417.5, x1: 701.5, y0: 735, y1: 895 };
const COLONNES = [427, 457.5, 487.5, 518.5, 549, 579.5, 610, 640.5, 671, 701.5];
const LIGNES = [735, 761.5, 788.5, 815, 841.5, 868.5];
const COURBE = 'M417.5 894 C470 846 560 805 656.5 781.5';

/** Grid lines that are drawn in and out, each at its own time. */
const VIVANTES = new Set(['c1', 'c4', 'c7', 'l1', 'l3', 'l5']);

export function AfficheAlpine() {
  const racine = useRef<HTMLDivElement>(null);
  const actif = useVisible(racine);
  const lecture = useLectures(actif);
  const valeur = (champ: Champ) => (lecture.dernier?.champ === champ ? lecture.dernier.n : 0);

  // The picture is a plain image, painted once; only the figures on top, a transparent SVG,
  // are redrawn when they move. Both fill the card the same way (a centred crop).
  return (
    <div ref={racine} className="alpine-hote" data-actif={actif ? '' : undefined}>
      <img className="alpine-fond" src={fond} alt="" width="1200" height="900" decoding="async" />
      <svg className="alpine" viewBox="0 0 1448 1086" preserveAspectRatio="xMidYMid slice" aria-hidden="true">

      {/* Sight: a ring that turns, its arms that draw in and out. */}
      <g className="alpine__vise" transform="translate(670 203)">
        <circle className="alpine__bague" r="44" />
        <circle className="alpine__bague alpine__bague--fixe" r="14" />
        <line className="alpine__bras alpine__bras--h" x1="-52" x2="52" />
        <line className="alpine__bras alpine__bras--v" y1="-52" y2="52" />
      </g>

      {/* Graph: grid, axes, then the curve and its point. */}
      <g className="alpine__grille">
        {COLONNES.map((x, i) => (
          <line key={`c${i}`} className={VIVANTES.has(`c${i}`) ? 'alpine__fil alpine__fil--vive alpine__fil--v' : 'alpine__fil'} style={{ '--i': i } as CSSProperties} x1={x} x2={x} y1={GRILLE.y0} y2={GRILLE.y1} />
        ))}
        {LIGNES.map((y, i) => (
          <line key={`l${i}`} className={VIVANTES.has(`l${i}`) ? 'alpine__fil alpine__fil--vive alpine__fil--h' : 'alpine__fil'} style={{ '--i': i } as CSSProperties} x1={GRILLE.x0} x2={GRILLE.x1} y1={y} y2={y} />
        ))}
      </g>
      <line className="alpine__axe" x1="402" x2={GRILLE.x1} y1={GRILLE.y1} y2={GRILLE.y1} />
      <line className="alpine__axe" x1={GRILLE.x0} x2={GRILLE.x0} y1={GRILLE.y0} y2="910" />
      <path className="alpine__courbe" d={COURBE} pathLength="1" />
      <circle className="alpine__point" r="6.5" style={{ offsetPath: `path("${COURBE}")` }} />

      {/* Readings. A reading that has just changed fades in again. */}
      <g className="alpine__lecture">
        <text x="1252" y="640" key={`lat${valeur('lat')}`} className={valeur('lat') ? 'alpine__neuf' : undefined}>
          {lecture.lat}
        </text>
        <text x="1252" y="666" key={`lon${valeur('lon')}`} className={valeur('lon') ? 'alpine__neuf' : undefined}>
          {lecture.lon}
        </text>
        <text x="1243" y="783" key={`env${valeur('env')}`} className={valeur('env') ? 'alpine__neuf' : undefined}>
          {lecture.env}
        </text>
        <text x="1243" y="814" key={`alt${valeur('alt')}`} className={valeur('alt') ? 'alpine__neuf' : undefined}>
          {lecture.alt}
        </text>
        <text x="1243" y="845" key={`charge${valeur('charge')}`} className={valeur('charge') ? 'alpine__neuf' : undefined}>
          {lecture.charge}
        </text>
      </g>
      </svg>
    </div>
  );
}
