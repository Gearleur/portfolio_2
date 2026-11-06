import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { grainImage, GRAIN_TILE } from './grain';
import { useTr } from './langue';
import './miniature-alpine.css';

/*
 * The Whiteboard AMDEC thumbnail (step 7, journal n° 90): a transmission shaft
 * in an exploded view, on Alpine's blues. The parts slide apart along their
 * axis, three agents (the cursor's pointer) click on a part each and name a
 * failure mode, then the shaft closes up again. 400 × 300 units; parts are
 * drawn as extruded faces seen at an angle along a horizontal axis.
 */

const CY = 176; // the axis
const K = 0.36; // how much of a face's depth shows: its circles become ellipses

type Pt = [number, number];

const ring = (r: number, n = 48, start = 0): Pt[] =>
  Array.from({ length: n }, (_, i) => {
    const a = start + (i / n) * Math.PI * 2;
    return [r * Math.cos(a), r * Math.sin(a)];
  });

/** A gear's outline in its own plane: z trapezoid teeth of height h. */
function gear(z: number, r: number, h: number): Pt[] {
  const step = (Math.PI * 2) / z;
  return Array.from({ length: z }).flatMap((_, i) => {
    const a = i * step;
    const at = (f: number, rad: number): Pt => [rad * Math.cos(a + f * step), rad * Math.sin(a + f * step)];
    return [at(0, r - h), at(0.18, r), at(0.46, r), at(0.64, r - h)];
  });
}

/** A face at depth x: its outline seen at an angle. */
const face = (outline: Pt[], x: number) =>
  `M${outline.map(([u, v]) => `${(x + K * u).toFixed(2)} ${(CY + v).toFixed(2)}`).join(' L')} Z`;

const ellipse = (x: number, r: number) => face(ring(r, 36), x);

type Piece = {
  id: string;
  /** Back face when assembled, and where it goes in the exploded view. */
  x: number;
  eclate: number;
  t: number;
  outline: Pt[];
  /** What is drawn on the front face: the bore, or a bearing's balls. */
  detail: 'alesage' | 'billes';
  bore: number;
};

const PIECES: Piece[] = [
  { id: 'ecrou', x: 134, eclate: 44, t: 8, outline: ring(12, 6, Math.PI / 6), detail: 'alesage', bore: 6 },
  { id: 'roulement', x: 142, eclate: 88, t: 12, outline: ring(22), detail: 'billes', bore: 6 },
  { id: 'pignon', x: 154, eclate: 140, t: 16, outline: gear(12, 28, 5), detail: 'alesage', bore: 6 },
  { id: 'entretoise', x: 170, eclate: 192, t: 10, outline: ring(12), detail: 'alesage', bore: 6 },
  { id: 'roue', x: 180, eclate: 228, t: 14, outline: gear(30, 50, 5), detail: 'alesage', bore: 9 },
  { id: 'roulement-2', x: 194, eclate: 300, t: 12, outline: ring(22), detail: 'billes', bore: 6 },
];

/** A point on a part's front face in the exploded view, where an agent clicks. */
function sur(id: string, angle: number, r: number): Pt {
  const piece = PIECES.find((p) => p.id === id)!;
  const a = (angle * Math.PI) / 180;
  return [piece.eclate + piece.t + K * r * Math.cos(a), CY + r * Math.sin(a)];
}

/**
 * The three agents: the part each one clicks, the failure mode it names, and
 * where its tag sits, away from the parts, joined by a leader line.
 */
const AGENTS: { piece: string; at: Pt; tag: Pt; fr: string; en: string }[] = [
  { piece: 'roulement', at: sur('roulement', -70, 17), tag: [-14, -48], fr: 'Roulement · grippage', en: 'Bearing · seizure' },
  { piece: 'pignon', at: sur('pignon', 55, 25), tag: [10, 44], fr: 'Pignon · dent cassée', en: 'Pinion · broken tooth' },
  { piece: 'roue', at: sur('roue', -60, 46), tag: [24, -34], fr: 'Roue · usure de denture', en: 'Gear · tooth wear' },
];

const TAG_H = 13;
/** About the width of the tag's words, in Inter at 7.6 px. */
const largeur = (words: string) => words.length * 4.3 + 10;

function Solide({ piece }: { piece: Piece }) {
  const steps = Math.ceil(piece.t / 1.1);
  const front = piece.x + piece.t;
  return (
    <g className={`ma-piece ma-piece--${piece.id}`} style={{ '--dx': piece.eclate - piece.x } as CSSProperties}>
      <path className="ma-dos" d={face(piece.outline, piece.x)} />
      {Array.from({ length: steps }, (_, i) => (
        <path key={i} className="ma-flanc" d={face(piece.outline, piece.x + (piece.t * (i + 1)) / (steps + 1))} />
      ))}
      <path className="ma-face" d={face(piece.outline, front)} />
      {piece.detail === 'billes' && (
        <>
          <path className="ma-trait" d={ellipse(front, 16)} />
          {ring(13.5, 10).map(([u, v], i) => (
            <ellipse key={i} className="ma-bille" cx={front + K * u} cy={CY + v} rx={K * 3.2} ry={3.2} />
          ))}
          <path className="ma-trait" d={ellipse(front, 10)} />
        </>
      )}
      <path className="ma-alesage" d={ellipse(front, piece.bore)} />
    </g>
  );
}

export function MiniatureAlpine() {
  const tr = useTr();
  const grain = useMemo(() => grainImage({ size: 0.75, irregularity: 0.75 }), []);
  const style = { '--grain': grain, '--grain-size': `${GRAIN_TILE}px` } as CSSProperties;

  return (
    <span className="miniature-alpine" style={style}>
      <svg className="ma-plan" viewBox="0 0 400 300" aria-hidden="true">
        {/* The axis, in a chain line, and the shaft, which stays put. */}
        <path className="ma-axe" d={`M18 ${CY} H382`} />
        <g className="ma-arbre">
          <rect x="108" y={CY - 6} width="128" height="12" />
          <path d={ellipse(108, 6)} />
          <path className="ma-face" d={ellipse(236, 6)} />
        </g>

        {PIECES.map((piece) => (
          <Solide key={piece.id} piece={piece} />
        ))}

        {/* The agents: the cursor's pointer, a click, a ripple, a failure mode. */}
        {AGENTS.map((agent, i) => (
          <g
            key={agent.piece}
            className={`ma-agent ma-agent--${i + 1}`}
            style={{ '--x': agent.at[0], '--y': agent.at[1] } as CSSProperties}
          >
            <circle className="ma-onde" r="9" />
            <g className="ma-etiquette">
              {/* The leader runs from the tip to the tag's nearest corner. */}
              <path className="ma-renvoi" d={`M0 0 L${agent.tag[0]} ${agent.tag[1] + (agent.tag[1] < 0 ? TAG_H : 0)}`} />
              <rect x={agent.tag[0]} y={agent.tag[1]} width={largeur(tr(agent.fr, agent.en))} height={TAG_H} rx="1" />
              <text x={agent.tag[0] + 5} y={agent.tag[1] + 9.2}>
                {tr(agent.fr, agent.en)}
              </text>
            </g>
            <polygon className="ma-pointe" points="0,0 0,14 3.5,10.5 10,10" />
          </g>
        ))}

        {/* Title, and the sheet's references. */}
        <text className="ma-titre" x="22" y="48">
          Whiteboard AMDEC
        </text>
        <path className="ma-filet" d="M22 56 h96" />
        <text className="ma-micro" x="22" y="276">
          {tr('Vue éclatée · arbre de transmission', 'Exploded view · transmission shaft')}
        </text>
        <text className="ma-micro" x="22" y="285">
          {tr('Réf. dossier 03-AMDEC · Pl. 01/03', 'File ref. 03-AMDEC · Sh. 01/03')}
        </text>
        <text className="ma-micro" x="378" y="285" textAnchor="end">
          {tr('3 agents · 3 défaillances', '3 agents · 3 failure modes')}
        </text>
      </svg>
    </span>
  );
}
