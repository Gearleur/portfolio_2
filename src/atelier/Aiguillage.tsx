import { useId } from 'react';
import { across, at, intersect, nearest, offset, polyline, sampleTrack, yAt } from './voies';
import type { Pt, Sample } from './voies';

/*
 * SNCF GPT's thumbnail, retained at step 7 (journal n° 67 and 68): a three-way turnout
 * drawn like a track engineering sheet. The ticket comes in from the left; at
 * the switch the agent (the accent cube) sends it to the documentation, the
 * incidents already solved, or the DevOps tools. 400 × 300 units.
 */

const GAUGE = 14; // between the rails' centres
const HEAD = 1.6; // a rail head, drawn as two hairlines
const MAIN_Y = 180;
const A: Pt = [150, MAIN_Y]; // first switch: the agent
const B: Pt = [196, MAIN_Y]; // second switch

const MAIN = sampleTrack([-10, MAIN_Y], [{ to: [410, MAIN_Y] }]);
const DOC = sampleTrack(A, [{ c1: [192, MAIN_Y], c2: [214, 118], to: [264, 118] }, { to: [410, 118] }]);
const OUTILS = sampleTrack(B, [{ c1: [238, MAIN_Y], c2: [260, 242], to: [310, 242] }, { to: [410, 242] }]);
const TRACKS = [MAIN, DOC, OUTILS];

const RAILS = TRACKS.flatMap((track) =>
  [-GAUGE / 2 - HEAD / 2, -GAUGE / 2 + HEAD / 2, GAUGE / 2 - HEAD / 2, GAUGE / 2 + HEAD / 2].map((d) =>
    polyline(offset(track, d)),
  ),
);
const AXES = TRACKS.map((track) => polyline(offset(track, 0)));

// Sleepers: on the main line, long timbers under the turnout reach across to
// the diverging tracks until they are far enough apart to get their own.
const SPACING = 8.4;
const WIDTH = 3.2;
const HALF = 13;
const APART = 44;
const length = (track: Sample[]) => track[track.length - 1].s;

const SLEEPERS: Pt[][] = [];
for (let s = 2; s < length(MAIN); s += SPACING) {
  const sample = at(MAIN, s);
  const x = sample.p[0];
  const doc = x >= A[0] - 4 ? yAt(DOC, x) : undefined;
  const outils = x >= B[0] - 4 ? yAt(OUTILS, x) : undefined;
  const up = doc !== undefined && MAIN_Y - doc < APART ? MAIN_Y - doc + HALF : HALF;
  const down = outils !== undefined && outils - MAIN_Y < APART ? outils - MAIN_Y + HALF : HALF;
  SLEEPERS.push(across(sample, WIDTH, up, down));
}
for (const track of [DOC, OUTILS]) {
  for (let s = 0; s < length(track); s += SPACING) {
    const sample = at(track, s);
    if (Math.abs(sample.p[1] - MAIN_Y) >= APART) SLEEPERS.push(across(sample, WIDTH, HALF, HALF));
  }
}

const between = (track: Sample[], from: number, to: number) =>
  track.filter((sample) => sample.s >= from && sample.s <= to);

// Switch blades: the slivers between the straight stock rail and the curved rail.
const blade = (track: Sample[], side: number, start: Pt) => {
  const curved = offset(between(track, 0, 34), side);
  const end = curved[curved.length - 1][0];
  return polyline([...curved, [end, start[1] + side], [start[0], start[1] + side]]) + ' Z';
};
const BLADES = [blade(DOC, -GAUGE / 2, A), blade(OUTILS, GAUGE / 2, B)];

// Frogs, where a diverging rail crosses a main rail, with a check rail opposite each.
const FROG_DOC = intersect(offset(MAIN, -GAUGE / 2), offset(DOC, GAUGE / 2)) ?? A;
const FROG_OUTILS = intersect(offset(MAIN, GAUGE / 2), offset(OUTILS, -GAUGE / 2)) ?? B;
const check = (track: Sample[], frog: Pt, side: number) => {
  const s = nearest(track, frog);
  return polyline(offset(between(track, s - 12, s + 12), side));
};
const CHECK_RAILS = [
  check(MAIN, FROG_DOC, GAUGE / 2 - 2.6),
  check(DOC, FROG_DOC, -GAUGE / 2 + 2.6),
  check(MAIN, FROG_OUTILS, -GAUGE / 2 + 2.6),
  check(OUTILS, FROG_OUTILS, GAUGE / 2 - 2.6),
];

// The steepest angle of the diverging track, measured from the switch.
const ANGLE = Math.max(...DOC.map(({ t }) => Math.atan2(-t[1], t[0])));
const ARC = 26;

/** How the sheet is framed: whole on a card, a circled detail on a phone (journal n° 69). */
export type Cadrage = 'planche' | 'detail';

const VIEWS: Record<Cadrage, string> = {
  planche: '0 0 400 300',
  detail: '96 60 210 262',
};

/** A cross-hair target. */
const Target = ({ at: [x, y] }: { at: Pt }) => (
  <g className="aig__fin">
    <circle cx={x} cy={y} r="2.8" fill="none" />
    <path d={`M${x - 5} ${y} h10 M${x} ${y - 5} v10`} />
  </g>
);

const MICROPRINT = 'SNCF GPT · RAG · AGENT REACT · AZURE OPENAI · AI SEARCH · CI/CD · LYON 2023 · '.repeat(6);

const hexagon = (x: number, y: number, r: number) =>
  [0, 60, 120, 180, 240, 300]
    .map((angle) => `${(x + r * Math.cos((angle * Math.PI) / 180)).toFixed(2)},${(y + r * Math.sin((angle * Math.PI) / 180)).toFixed(2)}`)
    .join(' ');

/**
 * Industrial markings, like those etched in the corner of a car window: the
 * maker's mark, round certification stamps with short technical words, and a
 * date code in dots (16 November 2023, the prototype's first showing).
 */
function Marquages({ x = 0, y = 0, compact = false }: { x?: number; y?: number; compact?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect className="aig__plein" x="22" y="215.4" width="6" height="6" />
      <text className="aig__marque" x="31.5" y="221">
        Atelier A.T.
      </text>
      {!compact && (
        <text className="aig__micro" x="22" y="229.6">
          Prototypé · qualifié · déployé
        </text>
      )}

      <g className="aig__sigle">
        <circle className="aig__trait" cx="29" cy="243" r="6.6" />
        <circle className="aig__fin" cx="29" cy="243" r="5.2" />
        <text x="29" y="244.4" textAnchor="middle">
          A7
        </text>

        <g className="aig__trait">
          <path d="M40.4 241.6 A5.6 5.6 0 0 1 50.6 239.8" />
          <path d="M51.6 244.4 A5.6 5.6 0 0 1 41.4 246.2" />
        </g>
        <path className="aig__plein" d="M49.2 237.6 L52 240.4 L48.3 241.2 Z M42.8 248.4 L40 245.6 L43.7 244.8 Z" />

        <polygon className="aig__trait" points={hexagon(63, 243, 7)} />
        <text x="63" y="244.4" textAnchor="middle">
          RAG
        </text>

        <rect className="aig__trait" x="73" y="237.5" width="19" height="11" rx="2" />
        <text x="82.5" y="244.4" textAnchor="middle">
          CI/CD
        </text>

        <polygon className="aig__trait" points="102,236 109,243 102,250 95,243" />
        <text x="102" y="244.4" textAnchor="middle">
          FR
        </text>
      </g>

      {!compact && (
        <>
          <text className="aig__micro" x="22" y="259">
            23R-001116 · DOT 1435 M23
          </text>
          <text className="aig__micro" x="22" y="265">
            AS-REACT · Azure OpenAI
          </text>
          <g className="aig__plein">
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={23 + i * 3} cy="272.6" r="0.9" />
            ))}
            {[0, 1, 2, 3].map((i) => (
              <circle key={i} cx={40 + i * 3} cy="272.6" r="0.9" />
            ))}
          </g>
          <text className="aig__micro" x="32" y="273.8">
            23
          </text>
        </>
      )}
    </g>
  );
}

/** The track: sleepers, axes, rails, blades, frogs, check rails, the agent, dimensions and destinations. */
function Voie({ clip }: { clip: string }) {
  const arcEnd: Pt = [A[0] + ARC * Math.cos(ANGLE), A[1] - ARC * Math.sin(ANGLE)];
  return (
    <>
      <g clipPath={`url(#${clip})`}>
        <g className="aig__traverses">
          {SLEEPERS.map((corners, i) => (
            <polygon key={i} points={corners.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')} />
          ))}
        </g>
        <g className="aig__axe">
          {AXES.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <g className="aig__rail">
          {RAILS.map((d) => (
            <path key={d} d={d} />
          ))}
          {CHECK_RAILS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <g className="aig__lame">
          {BLADES.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      </g>
      <Target at={FROG_DOC} />
      <Target at={FROG_OUTILS} />
      <rect className="miniature__agent" x={A[0] - 4.5} y={A[1] - 4.5} width="9" height="9" />
      <rect className="aig__bulle" x={B[0] - 2.5} y={B[1] - 2.5} width="5" height="5" />

      <g className="aig__fin">
        <path d={`M58 ${MAIN_Y - GAUGE / 2} V${MAIN_Y + GAUGE / 2}`} />
        <path
          d={`M56.6 ${MAIN_Y - GAUGE / 2 + 2.4} L58 ${MAIN_Y - GAUGE / 2} L59.4 ${MAIN_Y - GAUGE / 2 + 2.4} M56.6 ${MAIN_Y + GAUGE / 2 - 2.4} L58 ${MAIN_Y + GAUGE / 2} L59.4 ${MAIN_Y + GAUGE / 2 - 2.4}`}
          fill="none"
        />
        <path
          d={`M${A[0] + ARC} ${A[1]} A${ARC} ${ARC} 0 0 0 ${arcEnd[0].toFixed(2)} ${arcEnd[1].toFixed(2)}`}
          fill="none"
        />
        <path
          d={`M${A[0]} ${A[1]} L${(A[0] + (ARC + 6) * Math.cos(ANGLE)).toFixed(2)} ${(A[1] - (ARC + 6) * Math.sin(ANGLE)).toFixed(2)}`}
        />
      </g>
      <text className="aig__micro" x="55" y={MAIN_Y} transform={`rotate(-90 55 ${MAIN_Y})`} textAnchor="middle">
        1 435
      </text>
      <text className="aig__micro aig__micro--bas" x={A[0] + 6} y={A[1] - 30}>
        {`α · tg ${Math.tan(ANGLE).toFixed(2).replace('.', ',')}`}
      </text>

      <g className="aig__micro">
        <text x="20" y={MAIN_Y - 16}>
          ← Ticket · ServiceNow
        </text>
        <text x="384" y={118 - 16} textAnchor="end">
          Documentation →
        </text>
        <text x="384" y={MAIN_Y - 16} textAnchor="end">
          Incidents résolus →
        </text>
        <text x="384" y={242 - 16} textAnchor="end">
          Outils DevOps →
        </text>
      </g>
    </>
  );
}

/** The sheet's frame: two borders, zone letters and numbers, microprint in the margin, a chainage. */
function Feuille({ margin }: { margin: string }) {
  return (
    <>
      <rect className="aig__fin" x="6" y="6" width="388" height="288" fill="none" />
      <rect className="aig__trait" x="12" y="12" width="376" height="276" fill="none" />
      {['A', 'B', 'C', 'D', 'E', 'F'].map((letter, i) => (
        <g key={letter}>
          <path className="aig__fin" d={`M${12 + (376 / 6) * i} 6 v6`} />
          <text className="aig__micro" x={12 + (376 / 6) * (i + 0.5)} y="10.4" textAnchor="middle">
            {letter}
          </text>
        </g>
      ))}
      {['1', '2', '3', '4'].map((number, i) => (
        <g key={number}>
          <path className="aig__fin" d={`M6 ${12 + (276 / 4) * i} h6`} />
          <text className="aig__micro" x="9" y={12 + (276 / 4) * (i + 0.5) + 1.2} textAnchor="middle">
            {number}
          </text>
        </g>
      ))}
      <text className="aig__microprint" x="14" y="292" clipPath={`url(#${margin})`}>
        {MICROPRINT}
      </text>

      <path className="aig__fin" d="M20 26 H252" />
      {Array.from({ length: 30 }, (_, i) => (
        <path key={i} className="aig__fin" d={`M${20 + i * 8} 26 v${i % 5 === 0 ? -4 : -2}`} />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <text key={i} className="aig__micro" x={20 + i * 40} y="20">
          {`0+${String(i * 40).padStart(3, '0')}`}
        </text>
      ))}
    </>
  );
}

/** Top right: the title, large, and the file reference. */
const Titre = () => (
  <g>
    <text className="aig__titre" x="382" y="48" textAnchor="end">
      SNCF GPT
    </text>
    <path className="aig__fin" d="M270 56 H382" />
    <text className="aig__micro" x="382" y="63" textAnchor="end">
      Réf. dossier 01-SNCF-GPT
    </text>
    <text className="aig__micro" x="382" y="69" textAnchor="end">
      Pl. 01/04 · Rév. C · 2023
    </text>
  </g>
);

export function Aiguillage({ cadrage = 'planche' }: { cadrage?: Cadrage }) {
  const id = useId().replace(/[^\w-]/g, '');
  const [sheet, margin, lens, ring] = ['feuille', 'marge', 'loupe', 'anneau'].map((name) => `${id}-${name}`);

  return (
    <svg className="miniature__plan aig" viewBox={VIEWS[cadrage]} aria-hidden="true">
      <defs>
        <clipPath id={sheet}>
          <rect x="12" y="12" width="376" height="276" />
        </clipPath>
        <clipPath id={margin}>
          <rect x="12" y="288" width="376" height="6" />
        </clipPath>
        <clipPath id={lens}>
          <circle cx="196" cy="176" r="86" />
        </clipPath>
        <path id={ring} d="M196 82 A94 94 0 1 1 195.99 82" />
      </defs>

      {cadrage === 'detail' ? (
        <>
          {/* A detail view: the turnout enlarged in a circle, the title under it. */}
          <g clipPath={`url(#${lens})`}>
            <Voie clip={sheet} />
          </g>
          <circle className="aig__trait" cx="196" cy="176" r="86" fill="none" />
          <circle className="aig__fin" cx="196" cy="176" r="90" fill="none" />
          <text className="aig__microprint">
            <textPath href={`#${ring}`}>{MICROPRINT}</textPath>
          </text>
          <text className="aig__micro aig__micro--titre" x="104" y="74">
            SNCF GPT
          </text>
          <path className="aig__fin" d="M104 77 H134" />
          <text className="aig__micro" x="104" y="300">
            Réf. dossier 01-SNCF-GPT
          </text>
          <text className="aig__micro" x="104" y="306">
            Détail A · 2:1 · Pl. 01/04
          </text>
          <Marquages x={190} y={64} compact />
        </>
      ) : (
        <>
          <Feuille margin={margin} />
          <Titre />
          <Voie clip={sheet} />
          <Marquages />
        </>
      )}
    </svg>
  );
}
