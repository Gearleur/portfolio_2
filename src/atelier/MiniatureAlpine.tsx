import { Fragment, useId, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { grainImage, GRAIN_TILE } from './grain';
import { useTr } from './langue';
import './miniature-alpine.css';

/*
 * The Whiteboard AMDEC thumbnail (step 7, journal n° 90 to 93): a turbofan
 * drawn like an engineering blueprint (cream lines on slate, a grid, boxed
 * labels on leader lines, after a reference Alexandre chose for its style).
 * Seen from the side, its 23 stages slide apart along the axis and back, the
 * blades turn slowly, and three tiny red pointers (the cursor's) glide from
 * part to part, as agents going through a failure analysis. 400 × 300 units.
 */

const CY = 166; // the axis

type Kind = 'ogive' | 'ejection' | 'soufflante' | 'disque' | 'chambre';

type Etage = { id: string; groupe: number; kind: Kind; w: number; r: number; hub?: number };

/** The groups, front to back; their labels in French and English. */
const GROUPES: [string, string][] = [
  ['cône d’entrée', 'spinner'],
  ['soufflante', 'fan'],
  ['compresseur BP', 'LP compressor'],
  ['compresseur HP', 'HP compressor'],
  ['chambre de combustion', 'combustor'],
  ['turbine HP', 'HP turbine'],
  ['turbine BP', 'LP turbine'],
  ['cône d’éjection', 'exhaust cone'],
];

const ETAGES: Etage[] = [
  { id: 'cone', groupe: 0, kind: 'ogive', w: 20, r: 16 },
  { id: 'fan', groupe: 1, kind: 'soufflante', w: 14, r: 64, hub: 16 },
  ...[36, 34, 32].map((r, i) => ({ id: `bp-${i}`, groupe: 2, kind: 'disque' as const, w: 5, r, hub: 12 })),
  ...[28, 27, 26, 25, 24, 23, 22].map((r, i) => ({ id: `hp-${i}`, groupe: 3, kind: 'disque' as const, w: 3.5, r, hub: 10 })),
  { id: 'chambre', groupe: 4, kind: 'chambre', w: 22, r: 28, hub: 12 },
  ...[25, 26].map((r, i) => ({ id: `thp-${i}`, groupe: 5, kind: 'disque' as const, w: 5, r, hub: 10 })),
  ...[30, 33, 36, 38].map((r, i) => ({ id: `tbp-${i}`, groupe: 6, kind: 'disque' as const, w: 5, r, hub: 12 })),
  { id: 'ejection', groupe: 7, kind: 'ejection', w: 24, r: 16 },
];

/** Lays the stages along the axis, centred on 200, with gaps inside and between groups. */
function pack(inside: number, between: number) {
  const xs: number[] = [];
  let x = 0;
  ETAGES.forEach((etage, i) => {
    if (i > 0) x += ETAGES[i - 1].groupe === etage.groupe ? inside : between;
    xs.push(x);
    x += etage.w;
  });
  const start = 200 - x / 2;
  return xs.map((value) => value + start);
}

const ASSEMBLE = pack(1.2, 2);
const ECLATE = pack(6, 18);

/** Where a group sits, opened: its centre, and its tallest stage. */
const groupe = (g: number) => {
  const indices = ETAGES.map((e, i) => (e.groupe === g ? i : -1)).filter((i) => i >= 0);
  const first = indices[0];
  const last = indices[indices.length - 1];
  const x = (ECLATE[first] + ECLATE[last] + ETAGES[last].w) / 2;
  const r = Math.max(...indices.map((i) => ETAGES[i].r));
  return { x, r };
};

/** A stage's centre, opened. */
const centre = (id: string) => {
  const i = ETAGES.findIndex((e) => e.id === id);
  return ECLATE[i] + ETAGES[i].w / 2;
};

/**
 * The three agents and the parts they visit, each a point on a part, opened:
 * they glide from one to the next and press, as if clicking.
 */
const AGENTS: [number, number][][] = [
  [
    [centre('fan') + 2, CY - 42],
    [centre('hp-3'), CY - 18],
    [centre('tbp-2'), CY + 26],
  ],
  [
    [centre('cone') - 2, CY - 6],
    [centre('chambre'), CY - 20],
    [centre('thp-1'), CY - 16],
  ],
  [
    [centre('bp-1'), CY + 22],
    [centre('chambre') + 4, CY + 18],
    [centre('ejection') - 4, CY + 6],
  ],
];

/** Blade lines, slanted, repeated up and down a stage; they slide to make it turn. */
function Aubes({ x, w, r, hub, pas, clip }: { x: number; w: number; r: number; hub: number; pas: number; clip: string }) {
  const lines = Math.ceil((2 * r) / pas) + 3;
  return (
    <>
      <clipPath id={clip}>
        <rect x={x} y={CY - r} width={w} height={r - hub} />
        <rect x={x} y={CY + hub} width={w} height={r - hub} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <g className="ma-aubes" style={{ '--pas': `${pas}px` } as CSSProperties}>
          {Array.from({ length: lines }, (_, i) => {
            const y = CY - r - pas + i * pas;
            return <path key={i} d={`M${x} ${y} L${x + w} ${y + pas * 0.8}`} />;
          })}
        </g>
      </g>
    </>
  );
}

function Etage({ etage, index, id }: { etage: Etage; index: number; id: string }) {
  const x = ASSEMBLE[index];
  const { w, r } = etage;
  const style = { '--dx': ECLATE[index] - x, animationDelay: `${index * 18}ms` } as CSSProperties;
  const clip = `${id}-aubes-${etage.id}`;

  let drawing;
  if (etage.kind === 'ogive') {
    drawing = <path className="ma-corps" d={`M${x} ${CY} C${x + 2} ${CY - r * 0.9}, ${x + w * 0.6} ${CY - r}, ${x + w} ${CY - r} V${CY + r} C${x + w * 0.6} ${CY + r}, ${x + 2} ${CY + r * 0.9}, ${x} ${CY} Z`} />;
  } else if (etage.kind === 'ejection') {
    drawing = (
      <>
        <path className="ma-corps" d={`M${x} ${CY - r} C${x + w * 0.5} ${CY - r}, ${x + w} ${CY - 4}, ${x + w} ${CY} C${x + w} ${CY + 4}, ${x + w * 0.5} ${CY + r}, ${x} ${CY + r} Z`} />
        {[0.3, 0.55].map((f) => (
          <path key={f} className="ma-fin" d={`M${x + w * f} ${CY - r * (1 - f * 0.7)} V${CY + r * (1 - f * 0.7)}`} />
        ))}
      </>
    );
  } else if (etage.kind === 'chambre') {
    const hub = etage.hub ?? 10;
    drawing = (
      <>
        <rect className="ma-corps" x={x} y={CY - r} width={w} height={r - hub} rx="4" />
        <rect className="ma-corps" x={x} y={CY + hub} width={w} height={r - hub} rx="4" />
        {/* The fuel injectors, and the flame tube's cooling holes. */}
        {[CY - (r + hub) / 2, CY + (r + hub) / 2].map((y) => (
          <Fragment key={y}>
            <circle className="ma-fin" cx={x + 4} cy={y} r="1.6" />
            {[0, 1, 2, 3].map((i) => (
              <circle key={i} className="ma-point" cx={x + 9 + i * 3.4} cy={y} r="0.6" />
            ))}
          </Fragment>
        ))}
      </>
    );
  } else {
    const hub = etage.hub ?? 10;
    drawing = (
      <>
        <rect className="ma-corps" x={x} y={CY - r} width={w} height={2 * r} rx={etage.kind === 'soufflante' ? 3 : 0.8} />
        <Aubes x={x} w={w} r={r} hub={hub} pas={etage.kind === 'soufflante' ? 6 : 2.4} clip={clip} />
        <rect className="ma-moyeu" x={x} y={CY - hub} width={w} height={2 * hub} />
        {etage.kind === 'soufflante' && (
          <path className="ma-fin" d={`M${x + w / 2} ${CY - r} V${CY - hub} M${x + w / 2} ${CY + hub} V${CY + r}`} />
        )}
      </>
    );
  }

  return (
    <g className="ma-etage" style={style}>
      {drawing}
    </g>
  );
}

const MONO = 3.15; // about the width of a monospaced letter at 5.4 px

export function MiniatureAlpine() {
  const tr = useTr();
  const id = useId().replace(/[^\w-]/g, '');
  const grain = useMemo(() => grainImage({ size: 0.75, irregularity: 0.75 }), []);
  const style = { '--grain': grain, '--grain-size': `${GRAIN_TILE}px` } as CSSProperties;

  return (
    <span className="miniature-alpine" style={style}>
      <svg className="ma-plan" viewBox="0 0 400 300" aria-hidden="true">
        <defs>
          <pattern id={`${id}-grille`} width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M10 0 H0 V10" fill="none" className="ma-grille-fine" />
          </pattern>
          <pattern id={`${id}-grille-50`} width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M50 0 H0 V50" fill="none" className="ma-grille-forte" />
          </pattern>
        </defs>
        <rect width="400" height="300" fill={`url(#${id}-grille)`} />
        <rect width="400" height="300" fill={`url(#${id}-grille-50)`} />

        {/* The axis, and the shaft, which stays put. */}
        <path className="ma-axe" d={`M10 ${CY} H390`} />
        <rect className="ma-corps" x={ASSEMBLE[1]} y={CY - 3} width={ASSEMBLE[ETAGES.length - 1] - ASSEMBLE[1]} height="6" />

        {ETAGES.map((etage, index) => (
          <Etage key={etage.id} etage={etage} index={index} id={id} />
        ))}

        {/* Boxed labels on leader lines, once the stages are apart: above and below in turn. */}
        <g className="ma-etiquettes">
          {GROUPES.map(([fr, en], g) => {
            const { x, r } = groupe(g);
            const up = g % 2 === 0;
            const words = tr(fr, en);
            const w = words.length * MONO + 6;
            const boxY = up ? CY - 92 : CY + 80;
            const left = Math.min(392 - w, Math.max(8, x - w / 2));
            const edge = up ? CY - r - 3 : CY + r + 3;
            return (
              <g key={fr}>
                <path d={`M${x} ${edge} V${up ? boxY + 9 : boxY}`} />
                <rect x={left} y={boxY} width={w} height="9" />
                <text x={left + 3} y={boxY + 6.3}>
                  {words}
                </text>
              </g>
            );
          })}
        </g>

        {/* The agents: three tiny pointers in the cursor's red, gliding from part to part. */}
        {AGENTS.map((points, i) => (
          <g
            key={i}
            className={`ma-agent ma-agent--${i + 1}`}
            style={Object.fromEntries(points.flatMap(([x, y], p) => [[`--x${p + 1}`, x], [`--y${p + 1}`, y]])) as CSSProperties}
          >
            <polygon className="ma-pointe" points="0,0 0,7 1.75,5.25 5,5" />
          </g>
        ))}

        {/* Title block. */}
        <text className="ma-titre" x="20" y="38">
          Whiteboard AMDEC
        </text>
        <text className="ma-mono" x="20" y="50">
          {tr('turboréacteur · vue éclatée · 23 étages', 'turbofan · exploded view · 23 stages')}
        </text>
        <text className="ma-mono" x="20" y="286">
          {tr('réf. dossier 03-AMDEC · pl. 01/03', 'file ref. 03-AMDEC · sh. 01/03')}
        </text>
        <text className="ma-mono" x="380" y="286" textAnchor="end">
          atelier a.t.
        </text>
      </svg>
    </span>
  );
}
