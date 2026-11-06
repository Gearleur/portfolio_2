import { useId, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { grainImage, GRAIN_TILE } from './grain';
import { useTr } from './langue';
import './miniature-alpine.css';

/*
 * The Whiteboard AMDEC thumbnail (step 7, journal n° 90 to 92): an epicyclic
 * gear train that opens into its 16 parts, slowly, like a product film, with
 * the engineering underneath: part numbers on hairlines, a chain-line axis,
 * a title block. Three agents, each in its own colour, click a part and name
 * a failure mode, then the train closes. Three finishes are compared:
 * graphite, a light plan, and a flat Alpine blue. 400 × 300 units; parts are
 * extruded faces seen at an angle along a horizontal axis.
 */

export type VarianteAlpine = 'graphite' | 'clair' | 'alpine';

const CY = 172; // the axis
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

/** A face at depth x, centred at (x, cy): its outlines seen at an angle. */
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
  details?: { cercles?: number[]; points?: { at: Pt; r: number }[]; billes?: boolean };
  /** Callout number (0: called out with a twin) and radius, for the callout. */
  n: number;
  r: number;
};

const BORE = (r: number) => ring(r, 24);

// Assembled, the train sits around x 165–235; opened, it spreads from 24 to 350.
const BASE: Omit<Piece, 'cy' | 'ecy'>[] = [
  { id: 'ecrou', n: 1, r: 11, x: 165, ex: 24, t: 7, shapes: [hex(11), BORE(5.5)] },
  { id: 'rondelle', n: 2, r: 13, x: 172, ex: 48, t: 3, shapes: [ring(13), BORE(6)] },
  { id: 'roulement-av', n: 3, r: 20, x: 175, ex: 66, t: 10, shapes: [ring(20), BORE(6)], details: { cercles: [15, 9], billes: true } },
  {
    id: 'couvercle',
    n: 5,
    r: 44,
    x: 187,
    ex: 124,
    t: 6,
    shapes: [ring(44, 64), BORE(9), ...[0, 60, 120, 180, 240, 300].map((a) => around(polar(34, a), 2.6, 12))],
  },
  { id: 'couronne', n: 6, r: 44, x: 193, ex: 164, t: 14, shapes: [ring(44, 64), teeth(48, 37.5, 34.5)] },
  { id: 'solaire', n: 8, r: 9.5, x: 196, ex: 244, t: 12, shapes: [teeth(12, 7.2, 9.5), BORE(4)] },
  {
    id: 'porte',
    n: 9,
    r: 30,
    x: 209,
    ex: 270,
    t: 6,
    shapes: [trilobe(28), BORE(7)],
    details: { points: [-90, 30, 150].map((a) => ({ at: polar(21, a), r: 3.4 })) },
  },
  {
    id: 'bride',
    n: 10,
    r: 40,
    x: 215,
    ex: 300,
    t: 6,
    shapes: [ring(40, 64), BORE(9), ...[0, 45, 90, 135, 180, 225, 270, 315].map((a) => around(polar(31, a), 2.2, 12))],
    details: { cercles: [16] },
  },
  { id: 'roulement-ar', n: 11, r: 20, x: 221, ex: 336, t: 10, shapes: [ring(20), BORE(6)], details: { cercles: [15, 9], billes: true } },
];

/** Parts off the axis: the cover's four screws, the three planets. */
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

/** A point on a part's front face, opened. */
function sur(id: string, degrees: number, r: number): Pt {
  const piece = PIECES.find((p) => p.id === id)!;
  const [u, v] = polar(r, degrees);
  return [piece.ex + piece.t + K * u, piece.ecy + v];
}

/** The three agents, each in its colour: the part it clicks, the failure mode it names, where its tag sits. */
const AGENTS: { piece: string; at: Pt; tag: Pt; fr: string; en: string }[] = [
  { piece: 'roulement-av', at: sur('roulement-av', -60, 15), tag: [-34, -76], fr: 'Roulement · grippage', en: 'Bearing · seizure' },
  { piece: 'satellite-0', at: sur('satellite-0', 40, 10), tag: [26, -36], fr: 'Satellite · dent cassée', en: 'Planet · broken tooth' },
  { piece: 'couronne', at: sur('couronne', 70, 38), tag: [18, 40], fr: 'Couronne · usure de denture', en: 'Ring gear · tooth wear' },
];

const TAG_H = 12;
const largeur = (words: string) => words.length * 4.1 + 12;

function Solide({ piece, index, ids }: { piece: Piece; index: number; ids: { face: string; flanc: string } }) {
  const steps = Math.max(2, Math.ceil(piece.t / 1.2));
  const front = piece.x + piece.t;
  const agent = AGENTS.findIndex((a) => a.piece === piece.id);
  const style = {
    '--dx': piece.ex - piece.x,
    '--dy': piece.ecy - piece.cy,
    animationDelay: `${index * 25}ms`,
  } as CSSProperties;
  return (
    <g className="ma-piece" style={style}>
      <path className="ma-dos" fill={`url(#${ids.flanc})`} d={face(piece.shapes, piece.x, piece.cy)} />
      {Array.from({ length: steps }, (_, i) => (
        <path
          key={i}
          className="ma-flanc"
          fill={`url(#${ids.flanc})`}
          d={face(piece.shapes, piece.x + (piece.t * (i + 1)) / (steps + 1), piece.cy)}
        />
      ))}
      <path className="ma-face" fill={`url(#${ids.face})`} d={face(piece.shapes, front, piece.cy)} />
      {/* The clicked part takes its agent's colour, softly. */}
      {agent >= 0 && <path className={`ma-allume ma-allume--${agent + 1}`} d={face(piece.shapes, front, piece.cy)} />}
      {piece.details?.cercles?.map((r) => (
        <path key={r} className="ma-trait" d={face([ring(r, 36)], front, piece.cy)} />
      ))}
      {piece.details?.billes &&
        ring(12, 10).map(([u, v], i) => (
          <ellipse key={i} className="ma-bille" cx={front + K * u} cy={piece.cy + v} rx={K * 2.6} ry={2.6} />
        ))}
      {piece.details?.points?.map(({ at: [u, v], r }) => (
        <ellipse key={`${u}${v}`} className="ma-bille" cx={front + K * u} cy={piece.cy + v} rx={K * r} ry={r} />
      ))}
    </g>
  );
}

/** A part number on a hairline, above or below the opened part, ending in a dot on it. */
function Repere({ piece, up }: { piece: Piece; up: boolean }) {
  const x = piece.ex + piece.t;
  const start = piece.ecy + (up ? -piece.r + 3 : piece.r - 3);
  const end = piece.ecy + (up ? -piece.r - 16 : piece.r + 16);
  return (
    <g className="ma-repere">
      <circle cx={x} cy={start} r="0.9" />
      <path d={`M${x} ${start} V${end}`} />
      <text x={x} y={up ? end - 3 : end + 6.5} textAnchor="middle">
        {String(piece.n).padStart(2, '0')}
      </text>
    </g>
  );
}

export function MiniatureAlpine({ variante = 'graphite' }: { variante?: VarianteAlpine }) {
  const tr = useTr();
  const id = useId().replace(/[^\w-]/g, '');
  const ids = { face: `${id}-face`, flanc: `${id}-flanc` };
  const grain = useMemo(() => grainImage({ size: 0.75, irregularity: 0.75 }), []);
  const style = { '--grain': grain, '--grain-size': `${GRAIN_TILE}px` } as CSSProperties;
  const called = PIECES.filter((piece) => piece.n > 0);

  return (
    <span className={`miniature-alpine miniature-alpine--${variante}`} style={style}>
      <svg className="ma-plan" viewBox="0 0 400 300" aria-hidden="true">
        <defs>
          {/* Faces lit from above, flanks in shade: the colours come from the finish. */}
          <linearGradient id={ids.face} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className="ma-stop-face-haut" />
            <stop offset="1" className="ma-stop-face-bas" />
          </linearGradient>
          <linearGradient id={ids.flanc} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className="ma-stop-flanc-haut" />
            <stop offset="1" className="ma-stop-flanc-bas" />
          </linearGradient>
        </defs>

        {/* The axis, in a chain line, and the shaft, which stays put. */}
        <path className="ma-axe" d={`M12 ${CY} H388`} />
        <g className="ma-arbre">
          <rect x="150" y={CY - 5} width="96" height="10" fill={`url(#${ids.flanc})`} />
          <path fill={`url(#${ids.flanc})`} d={face([ring(5, 20)], 150, CY)} />
          <path className="ma-face" fill={`url(#${ids.face})`} d={face([teeth(10, 4, 5)], 246, CY)} />
        </g>

        <g className="ma-assemblage">
          {PIECES.map((piece, index) => (
            <Solide key={piece.id} piece={piece} index={index} ids={ids} />
          ))}
        </g>

        <g className="ma-reperes">
          {called.map((piece, i) => (
            <Repere key={piece.id} piece={piece} up={i % 2 === 0} />
          ))}
        </g>

        {/* The agents: the cursor's pointer in each agent's colour, a soft click, a failure mode. */}
        {AGENTS.map((agent, i) => (
          <g
            key={agent.fr}
            className={`ma-agent ma-agent--${i + 1}`}
            style={{ '--x': agent.at[0], '--y': agent.at[1] } as CSSProperties}
          >
            <circle className="ma-onde" r="7" />
            <g className="ma-etiquette">
              <path className="ma-renvoi" d={`M0 0 L${agent.tag[0]} ${agent.tag[1] + (agent.tag[1] < 0 ? TAG_H : 0)}`} />
              <rect x={agent.tag[0]} y={agent.tag[1]} width={largeur(tr(agent.fr, agent.en))} height={TAG_H} rx="6" />
              <text x={agent.tag[0] + 6} y={agent.tag[1] + 8.3}>
                {tr(agent.fr, agent.en)}
              </text>
            </g>
            <polygon className="ma-pointe" points="0,0 0,12.6 3.15,9.45 9,9" />
          </g>
        ))}

        {/* Title block and marks, kept quiet. */}
        <text className="ma-titre" x="22" y="42">
          Whiteboard AMDEC
        </text>
        <text className="ma-micro" x="22" y="56">
          {tr('Réf. dossier 03-AMDEC · Pl. 01/03', 'File ref. 03-AMDEC · Sh. 01/03')}
        </text>
        <rect className="ma-plein" x="320" y="34" width="4.5" height="4.5" />
        <text className="ma-marque" x="328.5" y="38.6">
          Atelier A.T.
        </text>
        <text className="ma-micro" x="22" y="282">
          {tr('Vue éclatée · train épicycloïdal · 16 pièces', 'Exploded view · epicyclic gear train · 16 parts')}
        </text>
        <g className="ma-tampons">
          <circle cx="300" cy="279" r="6.2" />
          <text x="300" y="280.4">
            A7
          </text>
          <polygon points={hex(6.8).map(([u, v]) => `${316 + u},${279 + v}`).join(' ')} />
          <text x="316" y="280.4">
            FMEA
          </text>
          <rect x="326" y="273.5" width="20" height="11" rx="2" />
          <text x="336" y="280.4">
            vLLM
          </text>
          <rect x="349" y="273.5" width="30" height="11" rx="2" />
          <text x="364" y="280.4">
            8×A100
          </text>
        </g>
      </svg>
    </span>
  );
}
