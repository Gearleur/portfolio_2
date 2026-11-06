import { useEffect, useId, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { grainImage, GRAIN_TILE } from './grain';
import { useTr } from './langue';
import { ensureFont, findFont } from './typotheque';
import './miniature-alpine.css';

/*
 * The Whiteboard AMDEC thumbnail (step 7, journal n° 90 to 94): a static
 * poster in electric blue with red touches, after Alexandre's references
 * (industrial labels, Swiss grid posters, « the grid is lying »). An Alpine
 * berlinette in side view with its dimensions, two agents (tiny red
 * pointers) on parts of it, a grid that the agents leave for new ideas, and
 * a product label: agents, models, GPUs. 400 × 300 units.
 */

type Pt = [number, number];

/** A seeded random sequence, so the drawing is the same at every render. */
function alea(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

const poly = (points: Pt[]) => `M${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')}`;

/* ——— The grid the agents leave: order on the left, new ideas on the right. ——— */

const desordre = (x: number) => Math.min(1, Math.max(0, (x - 66) / 92)) ** 1.5;
const deplace = (x: number, y: number): Pt => {
  const t = desordre(x);
  return [x + t * 7 * Math.cos(y * 0.13 + x * 0.04), y + t * 13 * Math.sin(x * 0.08 + y * 0.06)];
};

function grille(): string[] {
  const r = alea(7);
  const paths: string[] = [];
  const trace = (points: Pt[], breaks: (p: Pt) => boolean) => {
    let run: Pt[] = [];
    for (const point of points) {
      if (breaks(point)) {
        if (run.length > 1) paths.push(poly(run.map(([x, y]) => deplace(x, y))));
        run = [];
      } else run.push(point);
    }
    if (run.length > 1) paths.push(poly(run.map(([x, y]) => deplace(x, y))));
  };
  for (let y = 146; y <= 234; y += 11) {
    const points: Pt[] = Array.from({ length: 80 }, (_, i) => [18 + i * 2, y]);
    trace(points, ([x]) => x > 116 && r() < (x - 116) / 64);
  }
  for (let x = 18; x <= 172; x += 11) {
    const points: Pt[] = Array.from({ length: 45 }, (_, i) => [x, 146 + i * 2]);
    trace(points, () => x > 116 && r() < ((x - 116) / 90) * 0.5);
  }
  return paths;
}

const GRILLE = grille();

/** What the agents find past the grid: specks, squares, a few deep ones. */
const ECLATS = (() => {
  const r = alea(11);
  return Array.from({ length: 34 }, () => {
    const x = 124 + r() * 62;
    const y = 146 + r() * 88;
    const kind = r();
    return { x, y, s: kind < 0.25 ? 3 + r() * 3.5 : 0.8 + r() * 2.2, encre: kind < 0.25, point: kind > 0.78 };
  });
})();

const FISSURES = [
  'M112 158 C130 150, 150 166, 186 150',
  'M104 214 C126 222, 150 196, 184 226',
  'M118 186 C136 178, 150 190, 186 182',
];

/* ——— The berlinette, side view, facing left: about 1 : 24, ground at y 128. ——— */

const SOL = 128;
const ROUES = [241, 342];
const R_ROUE = 13;
const CY_ROUE = SOL - R_ROUE;

const arche = (x: number) => {
  const dx = Math.sqrt(15 ** 2 - (121 - CY_ROUE) ** 2);
  return `L${(x + dx).toFixed(2)} 121 A15 15 0 1 0 ${(x - dx).toFixed(2)} 121`;
};

const CAISSE = [
  'M206 121 L205.5 113',
  'C205.5 108, 207 104.5, 211 103',
  'C226 99, 248 96, 268 94.5',
  'C278 87, 286 81, 296 78.5',
  'C306 76.5, 318 76.5, 326 78',
  'C340 81, 356 89, 366 93',
  'C372 95, 377 96.5, 379 99',
  'L380 110 C380 116, 379 120, 376 121',
  arche(ROUES[1]),
  arche(ROUES[0]),
  'L206 121 Z',
].join(' ');

const VITRE = 'M274 95 C282 87, 289 82, 297 80.5 C308 79, 318 79.5, 324 81 C333 84, 340 88, 344 91 L344 94.2 L274 95.6 Z';

/** The barcode of the product label, from the file reference: bars and gaps alternate. */
const BARRES = (() => {
  const widths = Array.from('03AMDEC2025ALPINEFMEA').flatMap((char) => {
    const code = char.charCodeAt(0);
    return [1 + (code % 3), 1 + ((code >> 2) % 2), 1 + ((code >> 3) % 3), 1 + ((code >> 1) % 2)];
  });
  const bars: { x: number; w: number }[] = [];
  widths.reduce((x, width, i) => {
    if (i % 2 === 0) bars.push({ x, w: width * 0.42 });
    return x + width * 0.42 + 0.42;
  }, 208);
  return bars.filter(({ x }) => x < 290);
})();

/** The cursor's pointer, tiny, in the accent: an agent. */
const Pointe = ({ at: [x, y] }: { at: Pt }) => (
  <polygon className="ma-pointe" points={`${x},${y} ${x},${y + 7} ${x + 1.75},${y + 5.25} ${x + 5},${y + 5}`} />
);

/** A boxed tag on a leader line, as on the reference sheets. */
function Repere({ at, x, y, texte }: { at: Pt; x: number; y: number; texte: string }) {
  const w = texte.length * 2.84 + 5;
  return (
    <g className="ma-repere">
      <path d={`M${at[0]} ${at[1]} V${y + 8}`} />
      <rect x={x} y={y} width={w} height="8" />
      <text className="ma-mono" x={x + 3} y={y + 5.6}>
        {texte}
      </text>
    </g>
  );
}

/** A dimension line with its ticks and value. */
function Cote({ x1, x2, y, valeur }: { x1: number; x2: number; y: number; valeur: string }) {
  return (
    <g className="ma-cote">
      <path d={`M${x1} ${y} H${x2} M${x1} ${y - 2.5} V${y + 2.5} M${x2} ${y - 2.5} V${y + 2.5}`} />
      <path d={`M${x1 - 1.6} ${y + 1.6} l3.2 -3.2 M${x2 - 1.6} ${y + 1.6} l3.2 -3.2`} />
      <text className="ma-mono" x={(x1 + x2) / 2} y={y - 1.8} textAnchor="middle">
        {valeur}
      </text>
    </g>
  );
}

const FONTES = ['big-shoulders-display', 'mona-sans', 'geist-mono'];

export function MiniatureAlpine() {
  const tr = useTr();
  const id = useId().replace(/[^\w-]/g, '');
  const grain = useMemo(() => grainImage({ size: 0.75, irregularity: 0.75 }), []);
  const style = { '--grain': grain, '--grain-size': `${GRAIN_TILE}px` } as CSSProperties;

  // The poster's three faces are self-hosted in the typothèque (SIL OFL).
  useEffect(() => {
    for (const font of FONTES) void ensureFont(findFont(font));
  }, []);

  return (
    <span className="miniature-alpine" style={style}>
      <svg className="ma-plan" viewBox="0 0 400 300" aria-hidden="true">
        <defs>
          <marker id={`${id}-fleche`} viewBox="0 0 10 10" refX="10" refY="5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto">
            <path d="M10 5 L0 0 L3.5 5 L0 10 Z" className="ma-plein" />
          </marker>
        </defs>

        <rect className="ma-cadre" x="6" y="6" width="388" height="288" />

        {/* Top band: the client, the series, the dates. */}
        <text className="ma-large" x="16" y="19">
          ALPINE
        </text>
        <text className="ma-mono" x="47" y="18.6">
          · RENAULT GROUP
        </text>
        <text className="ma-mono" x="200" y="18.6" textAnchor="middle">
          {tr('Série 03 / 03', 'Series 03 / 03')}
        </text>
        <text className="ma-mono" x="384" y="18.6" textAnchor="end">
          {tr('Mars – juin 2025', 'March – June 2025')}
        </text>
        <path className="ma-filet" d="M16 24 H384" />

        {/* Title, condensed, with the red full stop. */}
        <text className="ma-cond" x="15" y="66">
          WHITEBOARD
        </text>
        <text className="ma-cond" x="15" y="102">
          AMDEC<tspan className="ma-rouge-texte">.</tspan>
        </text>
        <text className="ma-mono" x="16" y="116">
          {tr('Agents IA pour l’analyse de risques', 'AI agents for risk analysis')}
        </text>

        {/* The grid the agents leave: from the obvious to the new. */}
        <text className="ma-mono" x="16" y="138">
          {tr('Boucle de créativité', 'Creativity loop')}
        </text>
        <text className="ma-mono" x="188" y="138" textAnchor="end">
          {tr('Les agents quittent la grille.', 'The agents leave the grid.')}
        </text>
        <g className="ma-grille">
          {GRILLE.map((d, i) => (
            <path key={i} d={d} />
          ))}
          {FISSURES.map((d) => (
            <path key={d} className="ma-fissure" d={d} />
          ))}
        </g>
        {ECLATS.map(({ x, y, s, encre, point }, i) =>
          point ? (
            <circle key={i} className="ma-eclat" cx={x} cy={y} r={s / 3} />
          ) : (
            <rect key={i} className={encre ? 'ma-encre' : 'ma-eclat'} x={x} y={y} width={s} height={s} />
          ),
        )}
        <rect className="ma-rouge" x="160" y="180" width="8" height="8" />
        <rect className="ma-rouge" x="177" y="207" width="3.6" height="3.6" />
        <Pointe at={[166, 186]} />
        <text className="ma-mono" x="16" y="250">
          {tr('Évident', 'Obvious')}
        </text>
        <path className="ma-fin" d="M46 248.4 H70" markerEnd={`url(#${id}-fleche)`} />
        <rect className="ma-rouge" x="73" y="244.6" width={tr('Inédit', 'New').length * 2.84 + 5} height="7.6" />
        <text className="ma-mono ma-blanc" x="75.5" y="250">
          {tr('Inédit', 'New')}
        </text>
        <text className="ma-mono" x="188" y="250" textAnchor="end">
          /03
        </text>

        {/* The berlinette, its dimensions, two agents on its parts. */}
        <text className="ma-large ma-large--titre" x="205" y="40">
          BERLINETTE
        </text>
        <text className="ma-mono" x="205" y="48">
          {tr('Vue de profil · cotes en mm', 'Side view · dimensions in mm')}
        </text>
        <path className="ma-fin" d={`M200 ${SOL} H386`} />
        <path className="ma-caisse" d={CAISSE} />
        <path className="ma-fin" d={VITRE} />
        <path className="ma-fin" d="M298 95.5 C299 104, 300 112, 301 120 M328 99 L345 97 L343 104 Z M372 101 h6" />
        <circle className="ma-fin" cx="214" cy="105.5" r="3" />
        <circle className="ma-fin" cx="214" cy="105.5" r="1.4" />
        {ROUES.map((x) => (
          <g key={x}>
            <circle className="ma-roue" cx={x} cy={CY_ROUE} r={R_ROUE} />
            <circle className="ma-fin" cx={x} cy={CY_ROUE} r="9" />
            <circle className="ma-fin ma-tirets" cx={x} cy={CY_ROUE} r="6.4" />
            {[0, 72, 144, 216, 288].map((a) => {
              const c = Math.cos((a * Math.PI) / 180);
              const s = Math.sin((a * Math.PI) / 180);
              return <path key={a} className="ma-fin" d={`M${x + c * 2.4} ${CY_ROUE + s * 2.4} L${x + c * 8.6} ${CY_ROUE + s * 8.6}`} />;
            })}
          </g>
        ))}
        <path className="ma-doux" d={`M${ROUES[0]} ${CY_ROUE} V140 M${ROUES[1]} ${CY_ROUE} V140 M205.5 121 V149 M380 110 V149 M382 77 H390 M382 ${SOL} H390`} />
        <Cote x1={ROUES[0]} x2={ROUES[1]} y={137} valeur="2 420" />
        <Cote x1={205.5} x2={380} y={146} valeur="4 180" />
        <g className="ma-cote">
          <path d={`M388 77 V${SOL} M385.5 77 H390.5 M385.5 ${SOL} H390.5`} />
          <text className="ma-mono" x="386" y={(77 + SOL) / 2} textAnchor="middle" transform={`rotate(-90 386 ${(77 + SOL) / 2})`}>
            1 252
          </text>
        </g>
        <Repere at={[245.5, 109.5]} x={226} y={56} texte={tr('01 Freinage', '01 Brakes')} />
        <Repere at={[336.5, 100.5]} x={322} y={56} texte={tr('02 Refroidissement', '02 Cooling')} />
        <Pointe at={[245.5, 109.5]} />
        <Pointe at={[336.5, 100.5]} />

        {/* The product label: agents, models, GPUs. */}
        <g className="ma-etiquette">
          <rect className="ma-trait" x="200" y="156" width="184" height="98" rx="7" />
          <path className="ma-fin" d="M284 156 V214 M200 214 H384 M300 214 V254" />

          <text className="ma-cond ma-cond--moyen" x="208" y="180">
            3 AGENTS
          </text>
          <text className="ma-mono" x="208" y="190">
            + 1 {tr('superviseur', 'supervisor')}
          </text>
          <text className="ma-mono" x="208" y="198">
            ADK · LangGraph
          </text>
          <text className="ma-mono" x="208" y="206">
            RAG · CAG
          </text>

          {[320, 334, 348].map((x) => (
            <circle key={x} className="ma-trait" cx={x} cy="177" r="11" />
          ))}
          <circle className="ma-plein" cx="334" cy="177" r="1.6" />
          <text className="ma-mono" x="334" y="199" textAnchor="middle">
            Mistral · Gemma · Qwen
          </text>
          <text className="ma-mono" x="334" y="207" textAnchor="middle">
            open weights
          </text>

          {BARRES.map(({ x, w }) => (
            <rect key={x} className="ma-plein" x={x} y="220" width={w} height="16" />
          ))}
          <text className="ma-mono" x="208" y="246">
            P/N 03-AMDEC-0625
          </text>

          <text className="ma-cond ma-cond--moyen" x="308" y="238">
            8×A100
          </text>
          <text className="ma-mono" x="308" y="247">
            vLLM · service only
          </text>
        </g>

        {/* Bottom band. */}
        <path className="ma-filet" d="M16 262 H384" />
        <text className="ma-mono" x="16" y="273.5">
          Atelier A.T. · {tr('Réf.', 'Ref.')} 03-AMDEC
        </text>
        <rect className="ma-rouge" x="162" y="266.5" width="76" height="9.5" />
        <text className="ma-mono ma-blanc" x="200" y="273" textAnchor="middle">
          RPN = G × O × D
        </text>
        <text className="ma-mono" x="384" y="273.5" textAnchor="end">
          {tr('Pl. 01/01 · AMDEC / FMEA', 'Sh. 01/01 · FMEA')}
        </text>
        <path className="ma-tirets-epais" d="M300 283 H384" />
        <text className="ma-mono" x="16" y="285">
          {tr('Ne pas plier · fait main', 'Do not bend · handcrafted')}
        </text>
      </svg>
    </span>
  );
}
