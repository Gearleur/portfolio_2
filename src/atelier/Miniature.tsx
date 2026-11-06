import { useId, useRef } from 'react';
import type { CSSProperties, PointerEvent, ReactNode } from 'react';
import { Aiguillage } from './Aiguillage';
import type { Cadrage } from './Aiguillage';
import './miniature.css';

// Brushed metal: noise stretched along x, so it reads as fine streaks.
const BRUSHED = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>` +
    `<filter id='b' x='0' y='0' width='100%' height='100%'>` +
    `<feTurbulence type='fractalNoise' baseFrequency='0.004 0.9' numOctaves='2' seed='3' stitchTiles='stitch'/>` +
    `<feColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0.9 -0.2'/>` +
    `</filter><rect width='100%' height='100%' filter='url(#b)'/></svg>`,
)}")`;

/**
 * The finish retained at step 7 (journal n° 66): iridescent aluminium, the
 * drawing engraved in it. The light and the wave's colours reflected in the
 * metal follow the pointer, and drift back when it leaves.
 */
function Metal({ cadrage, children }: { cadrage?: Cadrage; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const move = (event: PointerEvent) => {
    const box = event.currentTarget.getBoundingClientRect();
    ref.current?.style.setProperty('--mx', `${(((event.clientX - box.left) / box.width) * 100).toFixed(1)}%`);
    ref.current?.style.setProperty('--my', `${(((event.clientY - box.top) / box.height) * 100).toFixed(1)}%`);
  };
  const leave = () => {
    ref.current?.style.removeProperty('--mx');
    ref.current?.style.removeProperty('--my');
  };

  return (
    <span
      ref={ref}
      className="miniature"
      data-cadrage={cadrage}
      style={{ '--brushed': BRUSHED } as CSSProperties}
      onPointerMove={move}
      onPointerLeave={leave}
    >
      {children}
    </span>
  );
}

type Gauge = { rails: number; head: number; sleepers: number; dash: string };

const FINE: Gauge = { rails: 4.4, head: 0.9, sleepers: 7.5, dash: '0.9 3.6' };
/**
 * Railway tracks along paths: the sleepers are a dashed wide stroke, the two
 * rails a mask (a wide stroke minus a narrower one), so straights, diagonals
 * and turnouts all come out right from the same path.
 */
function Tracks({ paths, gauge }: { paths: string[]; gauge: Gauge }) {
  const id = `${useId().replace(/[^\w-]/g, '')}-rails`;
  return (
    <>
      <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="300">
        {paths.map((d) => (
          <path key={d} d={d} fill="none" stroke="#fff" strokeWidth={gauge.rails} />
        ))}
        {paths.map((d) => (
          <path key={d} d={d} fill="none" stroke="#000" strokeWidth={gauge.rails - 2 * gauge.head} />
        ))}
      </mask>
      <g className="miniature__sleepers" fill="none" stroke="currentColor" strokeWidth={gauge.sleepers} strokeDasharray={gauge.dash}>
        {paths.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <rect width="400" height="300" fill="currentColor" mask={`url(#${id})`} />
    </>
  );
}

/** The agent: the accent cube, where the tracks part. */
const Agent = ({ x, y, size }: { x: number; y: number; size: number }) => (
  <rect className="miniature__agent" x={x - size / 2} y={y - size / 2} width={size} height={size} />
);

/** SNCF GPT's thumbnail: the three-way turnout, in iridescent aluminium, framed whole or for a phone. */
export function Miniature({ cadrage = 'planche' }: { cadrage?: Cadrage }) {
  return (
    <Metal cadrage={cadrage}>
      <Aiguillage cadrage={cadrage} />
    </Metal>
  );
}

/*
 * The full plan, for the project page: SNCF GPT's deployed architecture
 * (Alexandre's diagram, report TN09, fig. 9.5) as a track plan, too detailed
 * for a thumbnail.
 */
const TRACKS = [
  // Résolution: the agent, then the model, the app and the users.
  'M220 150 H372',
  // The agent's tools, on a ladder of sidings.
  'M220 150 L150 80',
  'M198 128 H30',
  'M174 104 H30',
  'M150 80 H30',
  // Ingestion: from the sources to the index.
  'M30 226 H350',
  // The agent's search into the index.
  'M220 150 L296 226',
  // Into the app: the history above, ServiceNow incidents below.
  'M312 150 L332 130 H372',
  'M318 150 L338 170 H372',
];

/** Stations: a small square on the track, its name above it (or below). */
const STATIONS: { x: number; y: number; name: string; anchor?: 'start' | 'end'; below?: boolean }[] = [
  { x: 40, y: 226, name: 'GitLab · ServiceNow' },
  { x: 112, y: 226, name: 'Auto-indexation', below: true },
  { x: 168, y: 226, name: 'Vision · augmentation' },
  { x: 236, y: 226, name: 'Découpage · Ada-002', below: true },
  { x: 340, y: 226, name: 'Index · Redis', anchor: 'end' },
  { x: 40, y: 128, name: 'Reranker BM25' },
  { x: 40, y: 104, name: 'Embedding de la question' },
  { x: 40, y: 80, name: 'Jenkins · GitLab · Confluence' },
  { x: 252, y: 150, name: 'LLM · GPT-4' },
  { x: 298, y: 150, name: 'App', below: true },
  { x: 364, y: 150, name: 'Utilisateurs', anchor: 'end' },
  { x: 364, y: 170, name: 'ServiceNow · API', anchor: 'end', below: true },
  { x: 364, y: 130, name: 'Historique', anchor: 'end' },
];

/** Buffer stops at the ends of the line. */
const BUFFERS = [
  [372, 150],
  [372, 170],
  [372, 130],
  [350, 226],
  [30, 226],
  [30, 128],
  [30, 104],
  [30, 80],
];

export function PlanArchitecture() {
  const grid = `${useId().replace(/[^\w-]/g, '')}-grid`;
  return (
    <Metal>
      <svg className="miniature__plan" viewBox="0 0 400 300" aria-hidden="true">
        <defs>
          <pattern id={grid} width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M10 0 H0 V10" fill="none" stroke="currentColor" strokeWidth="0.25" />
          </pattern>
        </defs>
        <rect className="miniature__grid" x="8" y="8" width="384" height="284" fill={`url(#${grid})`} />
        <rect x="8" y="8" width="384" height="284" fill="none" stroke="currentColor" strokeWidth="0.6" />

        {/* The two zones of the original diagram, in dotted lines. */}
        <g fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 2">
          <rect x="20" y="56" width="364" height="132" />
          <rect x="20" y="198" width="342" height="54" />
        </g>
        <g className="miniature__label">
          <text x="24" y="64">
            Résolution d’incidents
          </text>
          <text x="24" y="206">
            Ingestion
          </text>
        </g>

        <Tracks paths={TRACKS} gauge={FINE} />
        {BUFFERS.map(([x, y]) => (
          <path key={`${x}-${y}`} d={`M${x} ${y - 4.5} v9`} stroke="currentColor" strokeWidth="1.4" />
        ))}

        <g className="miniature__label">
          {STATIONS.map((station) => (
            <g key={station.name}>
              <rect x={station.x - 2} y={station.y - 2} width="4" height="4" className="miniature__station" />
              <text
                x={station.x + (station.anchor === 'end' ? 3 : -3)}
                y={station.y + (station.below ? 11 : -6)}
                textAnchor={station.anchor ?? 'start'}
              >
                {station.name}
              </text>
            </g>
          ))}
          <text x="264" y="183" transform="rotate(45 264 183)" textAnchor="middle">
            Recherche multi-index
          </text>
        </g>

        <Agent x={220} y={150} size={10} />
        <text className="miniature__label miniature__label--agent" x="211" y="166" textAnchor="end">
          Agent ReAct
        </text>

        {/* The internship as a dimension line. */}
        <g className="miniature__label" stroke="currentColor" strokeWidth="0.5">
          <path d="M30 270 H296 M27 273 l6 -6 M293 273 l6 -6 M30 265 v10 M296 265 v10" fill="none" />
          <text x="163" y="266" textAnchor="middle" stroke="none">
            24 semaines · sept. 2023 – févr. 2024
          </text>
        </g>

        {/* Title block. */}
        <g>
          <rect x="314" y="252" width="72" height="34" fill="none" stroke="currentColor" strokeWidth="0.6" />
          <path d="M314 272 H386 M350 272 V286" stroke="currentColor" strokeWidth="0.4" />
          <text className="miniature__titre" x="319" y="267">
            SNCF GPT
          </text>
          <text className="miniature__label" x="319" y="281">
            Pl. 01
          </text>
          <text className="miniature__label" x="355" y="281">
            Lyon
          </text>
        </g>
      </svg>
    </Metal>
  );
}
