import { Fragment, useId } from 'react';
import type { ReactNode } from 'react';
import { useTr } from './langue';
import type { LogoId } from './logos';
import { Pastilles } from './Marque';
import './schemas.css';

/*
 * The project page's technical diagrams (step 7, journal n° 82): flat and
 * plain, to be understood by a reader who wants to know how it works. Ink
 * strokes, the page's type, the accent only for the path that matters.
 * Drawn from Alexandre's internship report (TN09); 720 units wide, about the
 * width they are shown at.
 */

export type SchemaId = 'parcours' | 'assistant' | 'pistes' | 'sources' | 'recherche' | 'pdf' | 'agent' | 'pipeline';

/** A part of the assistant's screen, for the four cards of « Ce que voit le support ». */
export type Ecran = 'liste' | 'incident' | 'reponse' | 'conversation';

type Ton = 'accent' | 'faible';

/**
 * Arrow heads, ink and accent, under ids unique to each drawing: the cursor's
 * agent pointer, drawn straight like the back link's arrow (journal n° 80),
 * its tip on the end of the line. The same size whatever the stroke.
 */
function Defs({ id }: { id: string }) {
  return (
    <defs>
      {(['', '-accent'] as const).map((suffix) => (
        <marker
          key={suffix}
          id={`${id}-tete${suffix}`}
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth="9"
          markerHeight="9"
          markerUnits="userSpaceOnUse"
          orient="auto-start-reverse"
        >
          <path d="M10 5 L0 0 L3.5 5 L0 10 Z" className={`sc-tete${suffix && ' sc-tete--accent'}`} />
        </marker>
      ))}
    </defs>
  );
}

function Boite({
  x,
  y,
  w,
  h,
  titre,
  sous,
  ton,
  pointille,
  logos,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  titre: string;
  sous?: string;
  ton?: Ton;
  pointille?: boolean;
  /** Brand marks, as tabs on the box's top edge. */
  logos?: LogoId[];
}) {
  return (
    <g className={`sc-boite${ton ? ` sc-boite--${ton}` : ''}${pointille ? ' sc-boite--pointille' : ''}`}>
      <rect x={x} y={y} width={w} height={h} rx="3" />
      <text className="sc-titre" x={x + 10} y={sous ? y + h / 2 - 3 : y + h / 2 + 4}>
        {titre}
      </text>
      {sous && (
        <text className="sc-sous" x={x + 10} y={y + h / 2 + 13}>
          {sous}
        </text>
      )}
      {logos && <Pastilles ids={logos} right={x + w - 8} top={y} />}
    </g>
  );
}

function Fleche({ id, d, ton, pointille }: { id: string; d: string; ton?: Ton; pointille?: boolean }) {
  return (
    <path
      d={d}
      className={`sc-trait${ton ? ` sc-trait--${ton}` : ''}${pointille ? ' sc-trait--pointille' : ''}`}
      markerEnd={`url(#${id}-tete${ton === 'accent' ? '-accent' : ''})`}
    />
  );
}

function Svg({ h, children, label }: { h: number; children: (id: string) => ReactNode; label: string }) {
  const id = useId().replace(/[^\w-]/g, '');
  return (
    <svg className="schema" viewBox={`0 0 720 ${h}`} role="img" aria-label={label}>
      <Defs id={id} />
      {children(id)}
    </svg>
  );
}

/* 1 · A ticket's path, from the project to the experts; the answer is already
   in the documentation, next to the first level (report, fig. 4.7). */
function Parcours() {
  const tr = useTr();
  const boxes: { titre: string; sous: string; logos?: LogoId[] }[] = [
    { titre: tr('Projet', 'Project'), sous: tr('1 200 projets', '1,200 projects') },
    { titre: 'Ticket', sous: 'ServiceNow' },
    { titre: tr('Support N1', 'Level-1 support'), sous: 'ServiceDesk', logos: ['sncf'] },
    { titre: tr('Support eUL', 'Factory support'), sous: tr('outillage, pipelines', 'tooling, pipelines'), logos: ['sncf'] },
    { titre: tr('Experts eUL', 'Factory experts'), sous: tr('build, déploiement', 'build, deployment'), logos: ['sncf'] },
  ];
  const x = (i: number) => 10 + i * 145;
  return (
    <Svg h={250} label={tr('Le parcours d’un ticket, du projet aux experts, avec la documentation à côté du support de niveau 1', 'A ticket’s path, from the project to the experts, with the documentation next to level-1 support')}>
      {(id) => (
        <>
          {boxes.map((box, i) => (
            <Boite key={box.titre} x={x(i)} y={70} w={120} h={52} {...box} ton={i === 4 ? 'accent' : undefined} />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <Fleche key={i} id={id} d={`M${x(i) + 120} 96 H${x(i + 1)}`} />
          ))}
          <path className="sc-trait sc-trait--faible" d={`M${x(2) + 60} 64 V56 H${x(4) + 60} V64`} />
          <text className="sc-petit" x={x(3) + 60} y={48} textAnchor="middle">
            {tr('escalade', 'escalation')}
          </text>
          <text className="sc-petit sc-accent-texte" x={x(4) + 120} y={140} textAnchor="end">
            {tr('des ingénieurs pris', 'engineers taken off')}
          </text>
          <text className="sc-petit sc-accent-texte" x={x(4) + 120} y={154} textAnchor="end">
            {tr('sur leurs propres sujets', 'their own work')}
          </text>
          <Boite x={x(2) - 15} y={178} w={150} h={52} titre="Documentation" sous={tr('Markdown sur GitLab', 'Markdown on GitLab')} pointille logos={['gitlab']} />
          <Fleche id={id} d={`M${x(2) + 60} 178 V122`} ton="accent" pointille />
          <text className="sc-petit sc-accent-texte" x={x(2) + 148} y={198}>
            {tr('la réponse y est souvent déjà,', 'the answer is often already there,')}
          </text>
          <text className="sc-petit sc-accent-texte" x={x(2) + 148} y={212}>
            {tr('pour les tickets de niveau 1', 'for level-1 tickets')}
          </text>
        </>
      )}
    </Svg>
  );
}

/* 2 · The assistant's screen, redrawn as a wireframe (report, fig. 7.10). A
   card shows one part of it, framed upright and outlined in the accent. */
const CADRES: Record<Ecran, string> = {
  liste: '0 0 150 200',
  incident: '160 100 270 360',
  reponse: '446 10 270 360',
  conversation: '160 196 255 340',
};

function EcranAssistant({ focus }: { focus?: Ecran }) {
  const tr = useTr();
  const on = (part: Ecran) => (focus === part ? ' sc-focus' : '');
  const barres = (x: number, y: number, widths: number[], step = 10) =>
    widths.map((w, i) => <rect key={i} className="sc-barre" x={x} y={y + i * step} width={w} height="4" rx="2" />);
  return (
    <svg
      className="schema schema--ecran"
      viewBox={focus ? CADRES[focus] : '0 0 720 420'}
      role="img"
      aria-label={tr('L’écran de l’assistant : la liste des tickets, l’incident résumé, la réponse avec ses sources, la conversation', 'The assistant’s screen: the ticket list, the summarised incident, the answer with its sources, the conversation')}
    >
      <rect className="sc-cadre" x="0.5" y="0.5" width="719" height="419" rx="6" />
      {/* Left: the open tickets and the settings. */}
      <rect className="sc-zone" x="1" y="1" width="150" height="418" />
      <text className="sc-titre" x="14" y="30">
        {tr('Assistant support', 'Support assistant')}
      </text>
      <text className="sc-sous" x="14" y="62">
        {tr('Incidents en cours', 'Open incidents')}
      </text>
      <g className={`sc-boite${on('liste')}`}>
        <rect x="14" y="72" width="122" height="26" rx="3" />
        <text className="sc-mono" x="22" y="89">
          INC•••••••
        </text>
        <path className="sc-trait" d="M120 82 l4 4 l4 -4" />
      </g>
      <text className="sc-sous" x="14" y="124">
        {tr('Température', 'Temperature')}
      </text>
      <path className="sc-trait" d="M14 138 H136" />
      <circle className="sc-agent" cx="88" cy="138" r="4" />
      <g className="sc-boite">
        <rect x="14" y="156" width="64" height="24" rx="3" />
        <text className="sc-sous" x="24" y="172">
          {tr('Traiter', 'Process')}
        </text>
      </g>

      {/* Middle: the incident, what the assistant extracted, its sources, similar tickets. */}
      <text className="sc-titre" x="166" y="30">
        Incident INC•••••••
      </text>
      <text className="sc-sous" x="166" y="56">
        Description
      </text>
      {barres(166, 64, [250, 190])}
      <path className="sc-filet" d="M166 96 H430" />
      <text className="sc-sous" x="166" y="116">
        {tr('Informations extraites', 'Extracted information')}
      </text>
      <g className={`sc-boite${on('incident')}`}>
        <rect x="166" y="124" width="262" height="70" rx="3" />
        <text className="sc-petit" x="178" y="144">
          {tr('Projet · code ••••', 'Project · code ••••')}
        </text>
        <text className="sc-petit" x="178" y="162">
          {tr('Type d’incident · build (CI)', 'Incident type · build (CI)')}
        </text>
        <text className="sc-petit" x="178" y="180">
          {tr('Lien vers le job · ••••', 'Job link · ••••')}
        </text>
      </g>
      <text className="sc-sous" x="166" y="218">
        Sources
      </text>
      {[0, 1, 2].map((i) => (
        <path key={i} className={`sc-lien${on('reponse')}`} d={`M166 ${232 + i * 14} H${380 - i * 40}`} />
      ))}
      <text className="sc-sous" x="166" y="290">
        {tr('Tickets similaires', 'Similar tickets')}
      </text>
      {[0, 1].map((i) => (
        <g key={i} className="sc-boite">
          <rect x="166" y={298 + i * 28} width="262" height="22" rx="3" />
          {barres(176, 307 + i * 28, [150])}
        </g>
      ))}

      {/* Right: the answer, in steps, each with its sources. */}
      <text className="sc-titre" x="456" y="30">
        {tr('Réponse', 'Answer')}
      </text>
      {barres(456, 44, [240, 200])}
      <g className={on('reponse')}>
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <text className="sc-petit" x="456" y={84 + i * 30}>
              {i + 1}.
            </text>
            {barres(472, 78 + i * 30, [214, 160 - i * 14])}
            <text className="sc-petit sc-accent-texte" x={650 - i * 14} y={96 + i * 30}>
              [{(i % 2) + 1}]
            </text>
          </g>
        ))}
      </g>
      {barres(456, 238, [230, 170])}

      {/* Bottom: the conversation, to steer the assistant. */}
      <g className={`sc-boite${on('conversation')}`}>
        <rect x="166" y="372" width="540" height="32" rx="16" />
        <text className="sc-sous" x="184" y="392">
          {tr('Guider l’assistant…', 'Guide the assistant…')}
        </text>
        <path className="sc-plein" d="M684 382 L696 388 L684 394 Z" />
      </g>
    </svg>
  );
}

/* 3 · What the study covered (report, fig. 7.4), as a map. */
type Mots = [fr: string, en: string];

const PISTES: { label: Mots; angle: number; leaves: Mots[] }[] = [
  { label: ['Problèmes du RAG', 'RAG problems'], angle: -90, leaves: [['Hallucinations', 'Hallucinations'], ['Coût', 'Cost'], ['Contexte ignoré', 'Ignored context']] },
  { label: ['Données', 'Data'], angle: -25, leaves: [['Nettoyage', 'Cleaning'], ['Découpage', 'Chunking'], ['Vision', 'Vision'], ['Augmentation', 'Augmentation']] },
  { label: ['Azure', 'Azure'], angle: 32, leaves: [['Blob Storage', 'Blob Storage'], ['AI Search · index', 'AI Search · index'], ['Web App', 'Web App']] },
  { label: ['Prompting', 'Prompting'], angle: 95, leaves: [['Chain-of-Thought', 'Chain-of-Thought'], ['Self-consistency', 'Self-consistency'], ['Tree of Thoughts', 'Tree of Thoughts']] },
  { label: ['Agents', 'Agents'], angle: 152, leaves: [['ReAct', 'ReAct'], ['Outils', 'Tools'], ['Multi-agents', 'Multi-agent']] },
  { label: ['Recherche', 'Search'], angle: -150, leaves: [['Multi-vecteurs', 'Multi-vector'], ['Rerankers · BM25', 'Rerankers · BM25'], ['Graph RAG', 'Graph RAG']] },
];

function Pistes() {
  const tr = useTr();
  const cx = 360;
  const cy = 205;
  const at = (angle: number, r: number) => [cx + r * Math.cos((angle * Math.PI) / 180), cy + r * Math.sin((angle * Math.PI) / 180)];
  return (
    <Svg h={410} label={tr('La carte des pistes explorées pendant l’étude : données, recherche, agents, prompting, problèmes du RAG, Azure', 'A map of what the study covered: data, search, agents, prompting, RAG problems, Azure')}>
      {() => (
        <>
          {PISTES.map((piste) => {
            const [bx, by] = at(piste.angle, 92);
            const spread = 19;
            return (
              <g key={piste.label[0]}>
                <path className="sc-filet" d={`M${cx} ${cy} L${bx} ${by}`} />
                {piste.leaves.map((leaf, i) => {
                  const angle = piste.angle + (i - (piste.leaves.length - 1) / 2) * spread;
                  const [lx, ly] = at(angle, 168);
                  const right = Math.cos((angle * Math.PI) / 180) >= 0.2;
                  const left = Math.cos((angle * Math.PI) / 180) <= -0.2;
                  return (
                    <g key={leaf[0]}>
                      <path className="sc-filet" d={`M${bx} ${by} L${lx} ${ly}`} />
                      <circle className="sc-point" cx={lx} cy={ly} r="2.5" />
                      <text
                        className="sc-petit"
                        x={lx + (right ? 7 : left ? -7 : 0)}
                        y={ly + (right || left ? 4 : ly < cy ? -8 : 15)}
                        textAnchor={right ? 'start' : left ? 'end' : 'middle'}
                      >
                        {tr(...leaf)}
                      </text>
                    </g>
                  );
                })}
                <circle className="sc-noeud" cx={bx} cy={by} r="4" />
                <text className="sc-titre" x={bx} y={by + (by < cy ? -10 : 18)} textAnchor="middle">
                  {tr(...piste.label)}
                </text>
              </g>
            );
          })}
          <rect className="sc-agent" x={cx - 6} y={cy - 6} width="12" height="12" />
          <text className="sc-titre" x={cx + 12} y={cy + 4}>
            Assistant
          </text>
        </>
      )}
    </Svg>
  );
}

/* 4 · Decision 1: the sources kept and the ones left out (report, 7.2.3). */
function Sources() {
  const tr = useTr();
  const sources = [
    { titre: tr('Documentation de l’Usine', 'The Factory’s documentation'), sous: tr('Markdown sur GitLab · à jour, structurée', 'Markdown on GitLab · current, structured'), garde: true, logos: ['gitlab'] as LogoId[] },
    { titre: tr('Incidents résolus', 'Solved incidents'), sous: tr('ServiceNow · JSON · les solutions passées', 'ServiceNow · JSON · past fixes'), garde: true },
    { titre: 'Forum', sous: tr('riche, mais souvent daté', 'rich, but often dated'), garde: false },
    { titre: tr('Fil d’actualité', 'News feed'), sous: tr('temps réel · trop mouvant pour un index', 'real time · too fluid to index'), garde: false },
  ];
  return (
    <Svg h={236} label={tr('Les sources gardées, la documentation et les incidents résolus, et les sources écartées, le forum et le fil d’actualité', 'The sources kept, the documentation and solved incidents, and the ones left out, the forum and the news feed')}>
      {(id) => (
        <>
          {sources.map((source, i) => {
            const y = 10 + i * 56;
            return (
              <g key={source.titre}>
                <Boite
                  x={10}
                  y={y}
                  w={270}
                  h={44}
                  titre={source.titre}
                  sous={source.sous}
                  ton={source.garde ? undefined : 'faible'}
                  pointille={!source.garde}
                  logos={'logos' in source ? source.logos : undefined}
                />
                {source.garde ? (
                  <Fleche id={id} d={`M280 ${y + 22} C 370 ${y + 22}, 370 ${74 + i * 26}, 456 ${74 + i * 26} H470`} ton="accent" />
                ) : (
                  <>
                    <path className="sc-trait sc-trait--faible sc-trait--pointille" d={`M280 ${y + 22} H316`} />
                    <path className="sc-trait sc-trait--faible" d={`M322 ${y + 16} l12 12 M334 ${y + 16} l-12 12`} />
                    <text className="sc-petit" x={344} y={y + 26}>
                      {tr('écarté', 'left out')}
                    </text>
                  </>
                )}
              </g>
            );
          })}
          <text className="sc-petit" x={470} y={140}>
            {tr('après nettoyage, découpage et embeddings', 'after cleaning, chunking and embeddings')}
          </text>
          <Boite x={470} y={56} w={240} h={64} titre={tr('Index Azure AI Search', 'Azure AI Search index')} sous={tr('texte, vecteurs et métadonnées', 'text, vectors and metadata')} ton="accent" />
        </>
      )}
    </Svg>
  );
}

/* 5 · Decision 2: hybrid search (report, 7.2.6). */
function Recherche() {
  const tr = useTr();
  return (
    <Svg h={210} label={tr('La recherche hybride : mots-clés et vecteurs en parallèle, fusionnés, puis reclassés', 'Hybrid search: keywords and vectors in parallel, fused, then reranked')}>
      {(id) => (
        <>
          <Boite x={10} y={79} w={100} h={52} titre="Question" sous={tr('du ticket', 'from the ticket')} />
          <Boite x={150} y={20} w={176} h={52} titre={tr('Mots-clés · BM25', 'Keywords · BM25')} sous={tr('codes d’erreur, noms d’outils', 'error codes, tool names')} />
          <Boite x={150} y={138} w={176} h={52} titre={tr('Vecteurs · ADA-002', 'Vectors · ADA-002')} sous={tr('1 536 dimensions · le sens', '1,536 dimensions · meaning')} />
          <Boite x={366} y={79} w={104} h={52} titre="Fusion" sous={tr('un classement', 'one ranking')} />
          <Boite x={500} y={79} w={106} h={52} titre={tr('Reclassement', 'Reranking')} sous={tr('sémantique', 'semantic')} />
          <Boite x={630} y={79} w={80} h={52} titre="Passages" sous={tr('→ modèle', '→ model')} ton="accent" />
          <Fleche id={id} d="M110 96 C 124 96, 124 46, 138 46 H150" />
          <Fleche id={id} d="M110 114 C 124 114, 124 164, 138 164 H150" />
          <Fleche id={id} d="M326 46 C 340 46, 340 96, 354 96 H366" />
          <Fleche id={id} d="M326 164 C 340 164, 340 114, 354 114 H366" />
          <Fleche id={id} d="M470 105 H500" ton="accent" />
          <Fleche id={id} d="M606 105 H630" ton="accent" />
        </>
      )}
    </Svg>
  );
}

/* 6 · Decision 3: the same PDF, read by rules and by a model (report, 8.3.2). */
function Pdf() {
  const tr = useTr();
  const page = (
    <g>
      <rect className="sc-cadre" x="10" y="20" width="170" height="226" rx="2" />
      <rect className="sc-barre" x="24" y="34" width="110" height="7" rx="2" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={`a${i}`} className="sc-barre" x="24" y={54 + i * 10} width="66" height="4" rx="2" />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <rect key={`b${i}`} className="sc-barre" x="24" y={112 + i * 10} width="66" height="4" rx="2" />
      ))}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <rect key={`c${i}`} className="sc-barre" x="100" y={54 + i * 10} width="66" height="4" rx="2" />
      ))}
      <g className="sc-tableau">
        <rect x="24" y="168" width="142" height="62" />
        <path d="M24 188.7 H166 M24 209.3 H166 M71.3 168 V230 M118.7 168 V230" />
      </g>
      {[
        ['1', 20, 62],
        ['2', 20, 120],
        ['3', 96, 62],
        ['4', 20, 176],
      ].map(([n, x, y]) => (
        <g key={n as string}>
          <circle className="sc-numero" cx={(x as number) - 2} cy={(y as number) - 4} r="6" />
          <text className="sc-micro" x={(x as number) - 2} y={(y as number) - 1} textAnchor="middle">
            {n}
          </text>
        </g>
      ))}
      <text className="sc-petit" x="10" y="12">
        {tr('Le document : deux colonnes, un tableau', 'The document: two columns, one table')}
      </text>
    </g>
  );
  const bloc = (x: number, y: number, n: string, w = 56, ton?: Ton) => (
    <g>
      <rect className={`sc-bloc${ton ? ` sc-bloc--${ton}` : ''}`} x={x} y={y} width={w} height="24" rx="2" />
      <text className="sc-petit" x={x + w / 2} y={y + 16} textAnchor="middle">
        {n}
      </text>
    </g>
  );
  return (
    <Svg h={256} label={tr('Le même PDF lu par un parseur à règles, dans le désordre et le tableau cassé, puis par Azure Document Intelligence, dans l’ordre et le tableau gardé', 'The same PDF read by a rule-based parser, out of order with the table broken, then by Azure Document Intelligence, in order with the table kept')}>
      {(id) => (
        <>
          {page}
          <Fleche id={id} d="M180 120 C 210 120, 210 72, 234 72 H246" />
          <Fleche id={id} d="M180 140 C 210 140, 210 192, 234 192 H246" ton="accent" />
          <text className="sc-titre" x="250" y="34">
            {tr('Parseur à règles', 'Rule-based parser')}
          </text>
          <text className="sc-sous" x="250" y="50">
            {tr('le texte dans l’ordre du fichier, le tableau en morceaux', 'text in file order, the table in pieces')}
          </text>
          {bloc(250, 60, '1')}
          {bloc(312, 60, '3')}
          {bloc(374, 60, '2')}
          {['4a', '4c', '4b', '4d'].map((cell, i) => (
            <Fragment key={cell}>{bloc(436 + i * 46, 60, cell, 40)}</Fragment>
          ))}
          <path className="sc-trait sc-trait--faible" d="M650 62 l16 16 M666 62 l-16 16" />
          <text className="sc-titre" x="250" y="154">
            Azure Document Intelligence
          </text>
          <text className="sc-sous" x="250" y="170">
            {tr('l’ordre de lecture, les colonnes et le tableau reconnus', 'reading order, columns and table recognised')}
          </text>
          {bloc(250, 180, '1', 56, 'accent')}
          {bloc(312, 180, '2', 56, 'accent')}
          {bloc(374, 180, '3', 56, 'accent')}
          <g className="sc-tableau sc-tableau--accent">
            <rect x="436" y="180" width="150" height="48" />
            <path d="M436 196 H586 M436 212 H586 M486 180 V228 M536 180 V228" />
          </g>
          <text className="sc-petit" x="596" y="208">
            {tr('4 · un tableau', '4 · one table')}
          </text>
          <path className="sc-trait sc-trait--accent" d="M680 202 l6 7 l12 -14" />
        </>
      )}
    </Svg>
  );
}

/* 7 · Decision 4: from searching before every answer to a ReAct agent that
   chooses its tools (report, 9.2.3 to 9.2.5). */
function Agent() {
  const tr = useTr();
  return (
    <Svg h={300} label={tr('Avant : la recherche puis le modèle, toujours. Après : un agent ReAct qui pense, agit avec ses outils, observe, et recommence jusqu’à pouvoir répondre', 'Before: search then the model, every time. After: a ReAct agent that thinks, acts with its tools, observes, and loops until it can answer')}>
      {(id) => (
        <>
          <text className="sc-titre" x="10" y="18">
            {tr('Avant · une recherche à chaque fois', 'Before · a search every time')}
          </text>
          {['Question', tr('Recherche', 'Search'), tr('Modèle', 'Model'), tr('Réponse', 'Answer')].map((titre, i) => (
            <Boite key={titre} x={40} y={36 + i * 64} w={170} h={40} titre={titre} />
          ))}
          {[0, 1, 2].map((i) => (
            <Fleche key={i} id={id} d={`M125 ${76 + i * 64} V${100 + i * 64}`} />
          ))}
          <path className="sc-filet" d="M262 10 V290" />

          <text className="sc-titre" x="290" y="18">
            {tr('Après · un agent ReAct', 'After · a ReAct agent')}
          </text>
          <Boite x={300} y={40} w={150} h={46} titre={tr('Pensée', 'Thought')} sous={tr('que me manque-t-il ?', 'what am I missing?')} ton="accent" />
          <Boite x={300} y={130} w={150} h={46} titre="Action" sous={tr('appelle un outil', 'calls a tool')} />
          <Boite x={300} y={220} w={150} h={46} titre="Observation" sous={tr('lit le résultat', 'reads the result')} />
          <Fleche id={id} d="M375 86 V130" ton="accent" />
          <Fleche id={id} d="M375 176 V220" ton="accent" />
          <Fleche id={id} d="M300 243 C 266 243, 266 63, 286 63 H300" ton="accent" />
          <rect className="sc-agent" x={432} y={48} width="10" height="10" />
          <Boite x={560} y={40} w={150} h={46} titre={tr('Réponse', 'Answer')} sous={tr('avec ses sources', 'with its sources')} ton="accent" />
          <Fleche id={id} d="M450 63 H560" ton="accent" />
          <text className="sc-petit" x="505" y="56" textAnchor="middle">
            {tr('quand il sait', 'once it knows')}
          </text>
          <text className="sc-petit" x="485" y="146" textAnchor="middle">
            {tr('ses outils', 'its tools')}
          </text>
          <path className="sc-trait" d="M450 153 H520" />
          <path className="sc-trait" d="M520 127 V247" />
          {[tr('Recherche doc', 'Doc search'), tr('Graphe de la doc', 'Doc graph'), tr('Incidents résolus', 'Solved incidents'), tr('Reformulation', 'Rephrasing')].map((titre, i) => (
            <g key={titre}>
              <Boite x={560} y={112 + i * 40} w={150} h={30} titre={titre} pointille />
              <Fleche id={id} d={`M520 ${127 + i * 40} H560`} />
            </g>
          ))}
        </>
      )}
    </Svg>
  );
}

/* 8 · The Usine Logicielle's pipeline, from the commit to production
   (report, fig. 9.1 and 9.2.1). */
function Pipeline() {
  const tr = useTr();
  const ci: { titre: string; sous: string; logos?: LogoId[] }[] = [
    { titre: 'GitLab', sous: 'code · webhook', logos: ['gitlab'] },
    { titre: 'Jenkins', sous: tr('orchestre le build', 'runs the build'), logos: ['jenkins'] },
    { titre: 'Build', sous: tr('conteneur dédié', 'dedicated container'), logos: ['docker'] },
    { titre: tr('Tests unitaires', 'Unit tests'), sous: tr('à chaque build', 'on every build'), logos: ['python'] },
    { titre: tr('Qualité, sécurité', 'Quality, security'), sous: 'SonarQube, Checkmarx', logos: ['checkmarx', 'sonarqube'] },
  ];
  const x = (i: number) => 10 + i * 141;
  return (
    <Svg h={300} label={tr('Le pipeline : GitLab, Jenkins, build, tests unitaires, qualité et sécurité, puis Artifactory, Ansible avec les secrets de Vault, et Azure', 'The pipeline: GitLab, Jenkins, build, unit tests, quality and security, then Artifactory, Ansible with secrets from Vault, and Azure')}>
      {(id) => (
        <>
          <text className="sc-sous" x="10" y="18">
            {tr('Intégration continue', 'Continuous integration')}
          </text>
          {ci.map((box, i) => (
            <Boite key={box.titre} x={x(i)} y={30} w={i === 4 ? 144 : 124} h={52} {...box} />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <Fleche key={i} id={id} d={`M${x(i) + 124} 56 H${x(i + 1)}`} />
          ))}
          <text className="sc-petit" x={x(1)} y={100}>
            {tr('récupère les dépendances dans Artifactory', 'pulls dependencies from Artifactory')}
          </text>

          <text className="sc-sous" x="10" y="160">
            {tr('Déploiement continu', 'Continuous delivery')}
          </text>
          <Fleche id={id} d={`M${x(4) + 72} 82 V172`} ton="accent" />
          <Boite x={x(4)} y={172} w={144} h={52} titre="Artifactory" sous={tr('binaires, image', 'binaries, image')} ton="accent" logos={['jfrog']} />
          <Boite x={x(2) + 30} y={172} w={150} h={52} titre="Ansible" sous={tr('déploie l’artefact', 'deploys the artifact')} ton="accent" logos={['ansible']} />
          <Boite x={x(0)} y={172} w={190} h={52} titre="Azure" sous={tr('l’application en production', 'the app in production')} ton="accent" />
          <Fleche id={id} d={`M${x(4)} 198 H${x(2) + 180}`} ton="accent" />
          <Fleche id={id} d={`M${x(2) + 30} 198 H${x(0) + 190}`} ton="accent" />
          <Boite x={x(2) + 30} y={250} w={150} h={40} titre={tr('Vault · les secrets', 'Vault · secrets')} pointille logos={['vault']} />
          <Fleche id={id} d={`M${x(2) + 105} 250 V224`} pointille />
        </>
      )}
    </Svg>
  );
}

const SCHEMAS: Record<SchemaId, () => ReactNode> = {
  parcours: Parcours,
  assistant: () => <EcranAssistant />,
  pistes: Pistes,
  sources: Sources,
  recherche: Recherche,
  pdf: Pdf,
  agent: Agent,
  pipeline: Pipeline,
};

/** One of the project page's diagrams. */
export function Schema({ id }: { id: SchemaId }) {
  const Drawing = SCHEMAS[id];
  return <Drawing />;
}

/** A part of the assistant's screen, framed upright for a card. */
export function EcranCadre({ focus }: { focus: Ecran }) {
  return <EcranAssistant focus={focus} />;
}
