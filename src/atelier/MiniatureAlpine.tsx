import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { grainImage, GRAIN_TILE } from './grain';
import { useTr } from './langue';
import './miniature-alpine.css';

/*
 * The Whiteboard AMDEC thumbnail (step 7, journal n° 90 and 91): an
 * epicyclic gear train that bursts into its parts like a holographic
 * engineering scan, on a cold steel blue taken from Alpine's palette. The
 * parts fly apart along the axis and outwards, numbered callouts appear,
 * three agents (the cursor's pointer) click a part each and name a failure
 * mode, then everything closes up. 400 × 300 units; parts are extruded faces
 * seen at an angle along a horizontal axis.
 */

const CY = 170; // the axis
const K = 0.36; // how much of a face's depth shows: its circles become ellipses

type Pt = [number, number];

const TAU = Math.PI * 2;

const ring = (r: number, n = 40, start = 0): Pt[] =>
  Array.from({ length: n }, (_, i) => {
    const a = start + (i / n) * TAU;
    return [r * Math.cos(a), r * Math.sin(a)];
  });

const around = ([u0, v0]: Pt, r: number, n = 18): Pt[] => ring(r, n).map(([u, v]) => [u + u0, v + v0]);

const polar = (r: number, degrees: number): Pt => [r * Math.cos((degrees * Math.PI) / 180), r * Math.sin((degrees * Math.PI) / 180)];

/** Teeth between two radii: outwards for a gear, inwards for a ring gear. */
function teeth(z: number, base: number, tip: number): Pt[] {
  const step = TAU / z;
  return Array.from({ length: z }).flatMap((_, i) => {
    const a = i * step;
    const at = (f: number, r: number): Pt => [r * Math.cos(a + f * step), r * Math.sin(a + f * step)];
    return [at(0, base), at(0.18, tip), at(0.46, tip), at(0.64, base)];
  });
}

const hex = (r: number) => ring(r, 6, Math.PI / 6);

const trilobe = (r: number): Pt[] =>
  Array.from({ length: 72 }, (_, i) => {
    const a = (i / 72) * TAU;
    const radius = r * (1 + 0.15 * Math.cos(3 * a));
    return [radius * Math.cos(a), radius * Math.sin(a)];
  });

/** A face at depth x, centred at (x, cy) in the drawing: its outlines seen at an angle. */
const face = (shapes: Pt[][], x: number, cy: number) =>
  shapes
    .map((outline) => `M${outline.map(([u, v]) => `${(x + K * u).toFixed(2)} ${(cy + v).toFixed(2)}`).join(' L')} Z`)
    .join(' ');

type Piece = {
  id: string;
  /** Back face and centre when assembled, then in the exploded view. */
  x: number;
  cy: number;
  ex: number;
  ecy: number;
  t: number;
  /** The outline, then its holes (even-odd). */
  shapes: Pt[][];
  /** Drawn on the front face. */
  details?: { cercles?: number[]; points?: { at: Pt; r: number }[] };
  /** Its callout number and radius, for the label; 0 for parts called out with another. */
  n: number;
  r: number;
};

const BORE = (r: number) => ring(r, 24);

// Assembled, the train sits around x 165–235; exploded, it spreads from 26 to 350.
const BASE: Omit<Piece, 'cy' | 'ecy'>[] = [
  { id: 'ecrou', n: 1, r: 11, x: 165, ex: 24, t: 7, shapes: [hex(11), BORE(5.5)] },
  { id: 'rondelle', n: 2, r: 13, x: 172, ex: 48, t: 3, shapes: [ring(13), BORE(6)] },
  { id: 'roulement-av', n: 3, r: 20, x: 175, ex: 66, t: 10, shapes: [ring(20), BORE(6)], details: { cercles: [15, 9] } },
  { id: 'couvercle', n: 5, r: 44, x: 187, ex: 124, t: 6, shapes: [ring(44, 64), BORE(9), ...[0, 60, 120, 180, 240, 300].map((a) => around(polar(34, a), 2.6, 12))] },
  { id: 'couronne', n: 6, r: 44, x: 193, ex: 164, t: 14, shapes: [ring(44, 64), teeth(48, 37.5, 34.5)] },
  { id: 'solaire', n: 8, r: 9.5, x: 196, ex: 244, t: 12, shapes: [teeth(12, 7.2, 9.5), BORE(4)] },
  { id: 'porte', n: 9, r: 30, x: 209, ex: 270, t: 6, shapes: [trilobe(28), BORE(7)], details: { points: [-90, 30, 150].map((a) => ({ at: polar(21, a), r: 3.4 })) } },
  { id: 'bride', n: 10, r: 40, x: 215, ex: 300, t: 6, shapes: [ring(40, 64), BORE(9), ...[0, 45, 90, 135, 180, 225, 270, 315].map((a) => around(polar(31, a), 2.2, 12))], details: { cercles: [16] } },
  { id: 'roulement-ar', n: 11, r: 20, x: 221, ex: 336, t: 10, shapes: [ring(20), BORE(6)], details: { cercles: [15, 9] } },
];

/** Parts that sit off the axis: the four screws of the cover, the three planets. */
const VIS = [45, 135, 225, 315].map((a, i) => {
  const [u, v] = polar(34, a);
  const [eu, ev] = polar(52, a);
  return { id: `vis-${i}`, n: i === 0 ? 4 : 0, r: 4.5, x: 181 + K * u, cy: CY + v, ex: 98 + K * eu, ecy: CY + ev, t: 4, shapes: [hex(4.2)] };
});

const SATELLITES = [-90, 30, 150].map((a, i) => {
  const [u, v] = polar(21, a);
  const [eu, ev] = polar(64, a);
  return {
    id: `satellite-${i}`,
    n: i === 0 ? 7 : 0,
    r: 12,
    x: 195 + K * u,
    cy: CY + v,
    ex: 206 + K * eu,
    ecy: CY + ev,
    t: 10,
    shapes: [teeth(14, 9.6, 12), BORE(3)],
  };
});

const centred = (piece: Omit<Piece, 'cy' | 'ecy'>): Piece => ({ ...piece, cy: CY, ecy: CY });

// Drawn back to front: what sits further right, nearer to the eye, comes last.
const PIECES: Piece[] = [
  ...BASE.slice(0, 3).map(centred),
  ...VIS,
  ...BASE.slice(3, 5).map(centred),
  ...SATELLITES,
  ...BASE.slice(5).map(centred),
];

/** A point on a part's front face in the exploded view. */
function sur(id: string, degrees: number, r: number): Pt {
  const piece = PIECES.find((p) => p.id === id)!;
  const [u, v] = polar(r, degrees);
  return [piece.ex + piece.t + K * u, piece.ecy + v];
}

const NOMS: Record<number, [string, string]> = {
  1: ['Écrou', 'Nut'],
  2: ['Rondelle', 'Washer'],
  3: ['Roulement', 'Bearing'],
  4: ['Vis ×4', 'Screws ×4'],
  5: ['Couvercle', 'Cover'],
  6: ['Couronne Z48', 'Ring gear Z48'],
  7: ['Satellites ×3', 'Planets ×3'],
  8: ['Solaire Z12', 'Sun gear Z12'],
  9: ['Porte-satellites', 'Carrier'],
  10: ['Bride', 'Flange'],
  11: ['Roulement', 'Bearing'],
};

/** The three agents: the part each clicks, the failure mode it names, and where its tag sits. */
const AGENTS: { at: Pt; tag: Pt; fr: string; en: string }[] = [
  { at: sur('roulement-av', -60, 15), tag: [-20, -66], fr: 'Roulement · grippage', en: 'Bearing · seizure' },
  { at: sur('satellite-0', 40, 10), tag: [26, -36], fr: 'Satellite · dent cassée', en: 'Planet · broken tooth' },
  { at: sur('couronne', 70, 38), tag: [18, 40], fr: 'Couronne · usure de denture', en: 'Ring gear · tooth wear' },
];

const TAG_H = 12;
const largeur = (words: string) => words.length * 4.1 + 10;

/** The centre of the assembled train: the HUD ring turns around it. */
const CENTRE: Pt = [200, CY];

function Solide({ piece, index }: { piece: Piece; index: number }) {
  const steps = Math.max(2, Math.ceil(piece.t / 1.2));
  const front = piece.x + piece.t;
  const style = {
    '--dx': piece.ex - piece.x,
    '--dy': piece.ecy - piece.cy,
    animationDelay: `${index * 35}ms`,
  } as CSSProperties;
  return (
    <g className={`ma-piece ma-piece--${piece.id}`} style={style}>
      <path className="ma-dos" d={face(piece.shapes, piece.x, piece.cy)} />
      {Array.from({ length: steps }, (_, i) => (
        <path key={i} className="ma-flanc" d={face(piece.shapes, piece.x + (piece.t * (i + 1)) / (steps + 1), piece.cy)} />
      ))}
      <path className="ma-face" d={face(piece.shapes, front, piece.cy)} />
      {piece.details?.cercles?.map((r) => (
        <path key={r} className="ma-trait" d={face([ring(r, 36)], front, piece.cy)} />
      ))}
      {piece.id.startsWith('roulement') &&
        ring(12, 10).map(([u, v], i) => <ellipse key={i} className="ma-bille" cx={front + K * u} cy={piece.cy + v} rx={K * 2.6} ry={2.6} />)}
      {piece.details?.points?.map(({ at: [u, v], r }) => (
        <ellipse key={`${u}${v}`} className="ma-bille" cx={front + K * u} cy={piece.cy + v} rx={K * r} ry={r} />
      ))}
    </g>
  );
}

/** A numbered callout on an exploded part: a bubble and a short leader, above or below it. */
function Repere({ piece, up }: { piece: Piece; up: boolean }) {
  const x = piece.ex + piece.t;
  const edge = piece.ecy + (up ? -piece.r : piece.r);
  const y = edge + (up ? -14 : 14);
  return (
    <g className="ma-repere">
      <path d={`M${x} ${edge + (up ? -2 : 2)} L${x} ${y + (up ? 5 : -5)}`} />
      <circle cx={x} cy={y} r="5" />
      <text x={x} y={y + 2} textAnchor="middle">
        {String(piece.n).padStart(2, '0')}
      </text>
    </g>
  );
}

export function MiniatureAlpine() {
  const tr = useTr();
  const grain = useMemo(() => grainImage({ size: 0.75, irregularity: 0.75 }), []);
  const style = { '--grain': grain, '--grain-size': `${GRAIN_TILE}px` } as CSSProperties;
  const called = PIECES.filter((piece) => piece.n > 0);
  const legende = Object.entries(NOMS).map(([n, [fr, en]]) => `${n.padStart(2, '0')} ${tr(fr, en)}`);

  return (
    <span className="miniature-alpine" style={style}>
      <svg className="ma-plan" viewBox="0 0 400 300" aria-hidden="true">
        <defs>
          <pattern id="ma-grille" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M10 0 H0 V10" fill="none" className="ma-grille-fine" />
          </pattern>
          <pattern id="ma-grille-50" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M50 0 H0 V50" fill="none" className="ma-grille-forte" />
          </pattern>
          <linearGradient id="ma-scan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6fd8f2" stopOpacity="0" />
            <stop offset="0.85" stopColor="#6fd8f2" stopOpacity="0.07" />
            <stop offset="1" stopColor="#dffbff" stopOpacity="0.22" />
          </linearGradient>
        </defs>

        {/* The blueprint grid, and a scan line sweeping down. */}
        <rect width="400" height="300" fill="url(#ma-grille)" />
        <rect width="400" height="300" fill="url(#ma-grille-50)" />
        <rect className="ma-scan" y="-40" width="400" height="40" fill="url(#ma-scan)" />

        {/* The HUD: a ring of ticks turning around the train, its crosshair, the frame's corners. */}
        <g className="ma-hud">
          <g className="ma-anneau" style={{ transformOrigin: `${CENTRE[0]}px ${CENTRE[1]}px` }}>
            <circle cx={CENTRE[0]} cy={CENTRE[1]} r="82" className="ma-anneau-pointille" />
            {Array.from({ length: 72 }, (_, i) => {
              const [u, v] = polar(1, i * 5);
              const long = i % 6 === 0 ? 6 : 3;
              return (
                <path
                  key={i}
                  d={`M${CENTRE[0] + u * 88} ${CENTRE[1] + v * 88} L${CENTRE[0] + u * (88 + long)} ${CENTRE[1] + v * (88 + long)}`}
                />
              );
            })}
          </g>
          <g className="ma-anneau ma-anneau--inverse" style={{ transformOrigin: `${CENTRE[0]}px ${CENTRE[1]}px` }}>
            <path d={`M${CENTRE[0] + 100} ${CENTRE[1]} A100 100 0 0 1 ${CENTRE[0] - 50} ${CENTRE[1] + 86.6}`} className="ma-arc" />
            <path d={`M${CENTRE[0] - 100} ${CENTRE[1]} A100 100 0 0 1 ${CENTRE[0] - 70.7} ${CENTRE[1] - 70.7}`} className="ma-arc" />
          </g>
          <path d={`M${CENTRE[0] - 112} ${CY} h10 M${CENTRE[0] + 102} ${CY} h10 M${CENTRE[0]} ${CY - 112} v10 M${CENTRE[0]} ${CY + 102} v10`} />
          {[
            [14, 66, 1, 1],
            [386, 66, -1, 1],
            [14, 262, 1, -1],
            [386, 262, -1, -1],
          ].map(([x, y, sx, sy]) => (
            <path key={`${x}-${y}`} className="ma-coin" d={`M${x} ${y + 10 * sy} V${y} H${x + 10 * sx}`} />
          ))}
        </g>

        {/* The axis, in a chain line, and the shaft, which stays put. */}
        <path className="ma-axe" d={`M10 ${CY} H390`} />
        <g className="ma-arbre">
          <rect x="150" y={CY - 5} width="96" height="10" />
          <path d={face([ring(5, 20)], 150, CY)} />
          <path className="ma-face" d={face([teeth(10, 4, 5)], 246, CY)} />
        </g>

        <g className="ma-assemblage">
          {PIECES.map((piece, index) => (
            <Solide key={piece.id} piece={piece} index={index} />
          ))}
        </g>

        {/* Callouts, once the parts are apart: one number per part, above and below in turn. */}
        <g className="ma-reperes">
          {called.map((piece, i) => (
            <Repere key={piece.id} piece={piece} up={i % 2 === 0} />
          ))}
        </g>

        {/* The agents: the cursor's pointer, a click, a ripple, a failure mode. */}
        {AGENTS.map((agent, i) => (
          <g key={agent.fr} className={`ma-agent ma-agent--${i + 1}`} style={{ '--x': agent.at[0], '--y': agent.at[1] } as CSSProperties}>
            <circle className="ma-onde" r="8" />
            <g className="ma-etiquette">
              <path className="ma-renvoi" d={`M0 0 L${agent.tag[0]} ${agent.tag[1] + (agent.tag[1] < 0 ? TAG_H : 0)}`} />
              <rect x={agent.tag[0]} y={agent.tag[1]} width={largeur(tr(agent.fr, agent.en))} height={TAG_H} rx="1" />
              <text x={agent.tag[0] + 5} y={agent.tag[1] + 8.4}>
                {tr(agent.fr, agent.en)}
              </text>
            </g>
            <polygon className="ma-pointe" points="0,0 0,12.6 3.15,9.45 9,9" />
          </g>
        ))}

        {/* Title block, maker's mark and readout, as on the SNCF GPT sheet. */}
        <text className="ma-titre" x="20" y="40">
          Whiteboard AMDEC
        </text>
        <path className="ma-filet" d="M20 47 h92" />
        <text className="ma-micro" x="20" y="56">
          {tr('Réf. dossier 03-AMDEC · Pl. 01/03', 'File ref. 03-AMDEC · Sh. 01/03')}
        </text>

        <rect className="ma-plein" x="300" y="24" width="5" height="5" />
        <text className="ma-marque" x="309" y="29">
          Atelier A.T.
        </text>
        <text className="ma-micro" x="380" y="40" textAnchor="end">
          {tr('Scan · 16 pièces', 'Scan · 16 parts')}
        </text>
        <rect className="ma-jauge" x="300" y="44" width="80" height="2" />
        <rect className="ma-jauge-pleine" x="300" y="44" width="80" height="2" />

        <g className="ma-legende">
          <text className="ma-micro" x="20" y="276">
            {tr('Vue éclatée · train épicycloïdal', 'Exploded view · epicyclic gear train')}
          </text>
          <text className="ma-nano" x="20" y="285">
            {legende.slice(0, 6).join(' · ')}
          </text>
          <text className="ma-nano" x="20" y="292">
            {legende.slice(6).join(' · ')}
          </text>
        </g>

        {/* Stamps, like the markings in a car window's corner. */}
        <g className="ma-tampons">
          <circle cx="292" cy="282" r="7" />
          <circle className="ma-fin" cx="292" cy="282" r="5.4" />
          <text x="292" y="283.6">
            A7
          </text>
          <polygon points={hex(7.6).map(([u, v]) => `${310 + u},${282 + v}`).join(' ')} />
          <text x="310" y="283.6">
            FMEA
          </text>
          <rect x="321" y="276" width="22" height="12" rx="2" />
          <text x="332" y="283.6">
            vLLM
          </text>
          <rect x="347" y="276" width="34" height="12" rx="2" />
          <text x="364" y="283.6">
            8×A100
          </text>
        </g>
      </svg>
    </span>
  );
}
