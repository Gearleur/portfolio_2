import { Fragment, useId } from 'react';
import type { ReactNode } from 'react';
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

/** Arrow heads, ink and accent, under ids unique to each drawing. */
function Defs({ id }: { id: string }) {
  return (
    <defs>
      {(['', '-accent'] as const).map((suffix) => (
        <marker
          key={suffix}
          id={`${id}-tete${suffix}`}
          viewBox="0 0 8 8"
          refX="7.5"
          refY="4"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L8 4 L0 8 Z" className={`sc-tete${suffix && ' sc-tete--accent'}`} />
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
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  titre: string;
  sous?: string;
  ton?: Ton;
  pointille?: boolean;
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
  const boxes = [
    { titre: 'Projet', sous: '1 200 projets' },
    { titre: 'Ticket', sous: 'ServiceNow' },
    { titre: 'Support N1', sous: 'ServiceDesk' },
    { titre: 'Support eUL', sous: 'outillage, pipelines' },
    { titre: 'Experts eUL', sous: 'build, déploiement' },
  ];
  const x = (i: number) => 10 + i * 145;
  return (
    <Svg h={250} label="Le parcours d’un ticket, du projet aux experts, avec la documentation à côté du support de niveau 1">
      {(id) => (
        <>
          {boxes.map((box, i) => (
            <Boite key={box.titre} x={x(i)} y={70} w={120} h={52} {...box} ton={i === 4 ? 'accent' : undefined} />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <Fleche key={i} id={id} d={`M${x(i) + 120} 96 H${x(i + 1)}`} />
          ))}
          <path className="sc-filet" d={`M${x(2) + 60} 136 V142 H${x(4) + 60} V136`} />
          <text className="sc-petit" x={x(3) + 60} y={156} textAnchor="middle">
            escalade
          </text>
          <text className="sc-petit sc-accent-texte" x={x(4) + 120} y={58} textAnchor="end">
            des experts pris sur leurs sujets
          </text>
          <Boite x={x(2) - 15} y={178} w={150} h={52} titre="Documentation" sous="Markdown sur GitLab" pointille />
          <Fleche id={id} d={`M${x(2) + 60} 178 V126`} ton="accent" pointille />
          <text className="sc-petit sc-accent-texte" x={x(2) + 148} y={198}>
            la réponse y est souvent déjà,
          </text>
          <text className="sc-petit sc-accent-texte" x={x(2) + 148} y={212}>
            pour les tickets de niveau 1
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
  const on = (part: Ecran) => (focus === part ? ' sc-focus' : '');
  const barres = (x: number, y: number, widths: number[], step = 10) =>
    widths.map((w, i) => <rect key={i} className="sc-barre" x={x} y={y + i * step} width={w} height="4" rx="2" />);
  return (
    <svg
      className="schema schema--ecran"
      viewBox={focus ? CADRES[focus] : '0 0 720 420'}
      role="img"
      aria-label="L’écran de l’assistant : la liste des tickets, l’incident résumé, la réponse avec ses sources, la conversation"
    >
      <rect className="sc-cadre" x="0.5" y="0.5" width="719" height="419" rx="6" />
      {/* Left: the open tickets and the settings. */}
      <rect className="sc-zone" x="1" y="1" width="150" height="418" />
      <text className="sc-titre" x="14" y="30">
        Assistant support
      </text>
      <text className="sc-sous" x="14" y="62">
        Incidents en cours
      </text>
      <g className={`sc-boite${on('liste')}`}>
        <rect x="14" y="72" width="122" height="26" rx="3" />
        <text className="sc-mono" x="22" y="89">
          INC•••••••
        </text>
        <path className="sc-trait" d="M120 82 l4 4 l4 -4" />
      </g>
      <text className="sc-sous" x="14" y="124">
        Température
      </text>
      <path className="sc-trait" d="M14 138 H136" />
      <circle className="sc-agent" cx="88" cy="138" r="4" />
      <g className="sc-boite">
        <rect x="14" y="156" width="64" height="24" rx="3" />
        <text className="sc-sous" x="24" y="172">
          Traiter
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
        Informations extraites
      </text>
      <g className={`sc-boite${on('incident')}`}>
        <rect x="166" y="124" width="262" height="70" rx="3" />
        <text className="sc-petit" x="178" y="144">
          Projet · code ••••
        </text>
        <text className="sc-petit" x="178" y="162">
          Type d’incident · build (CI)
        </text>
        <text className="sc-petit" x="178" y="180">
          Lien vers le job · ••••
        </text>
      </g>
      <text className="sc-sous" x="166" y="218">
        Sources
      </text>
      {[0, 1, 2].map((i) => (
        <path key={i} className={`sc-lien${on('reponse')}`} d={`M166 ${232 + i * 14} H${380 - i * 40}`} />
      ))}
      <text className="sc-sous" x="166" y="290">
        Tickets similaires
      </text>
      {[0, 1].map((i) => (
        <g key={i} className="sc-boite">
          <rect x="166" y={298 + i * 28} width="262" height="22" rx="3" />
          {barres(176, 307 + i * 28, [150])}
        </g>
      ))}

      {/* Right: the answer, in steps, each with its sources. */}
      <text className="sc-titre" x="456" y="30">
        Réponse
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
          Guider l’assistant…
        </text>
        <path className="sc-plein" d="M684 382 L696 388 L684 394 Z" />
      </g>
    </svg>
  );
}

/* 3 · What the study covered (report, fig. 7.4), as a map. */
const PISTES: { label: string; angle: number; leaves: string[] }[] = [
  { label: 'Problèmes du RAG', angle: -90, leaves: ['Hallucinations', 'Coût', 'Contexte ignoré'] },
  { label: 'Données', angle: -25, leaves: ['Nettoyage', 'Découpage', 'Vision', 'Augmentation'] },
  { label: 'Azure', angle: 32, leaves: ['Blob Storage', 'AI Search · index', 'Web App'] },
  { label: 'Prompting', angle: 95, leaves: ['Chain-of-Thought', 'Self-consistency', 'Tree of Thoughts'] },
  { label: 'Agents', angle: 152, leaves: ['ReAct', 'Outils', 'Multi-agents'] },
  { label: 'Recherche', angle: -150, leaves: ['Multi-vecteurs', 'Rerankers · BM25', 'Graph RAG'] },
];

function Pistes() {
  const cx = 360;
  const cy = 205;
  const at = (angle: number, r: number) => [cx + r * Math.cos((angle * Math.PI) / 180), cy + r * Math.sin((angle * Math.PI) / 180)];
  return (
    <Svg h={410} label="La carte des pistes explorées pendant l’étude : données, recherche, agents, prompting, problèmes du RAG, Azure">
      {() => (
        <>
          {PISTES.map((piste) => {
            const [bx, by] = at(piste.angle, 92);
            const spread = 19;
            return (
              <g key={piste.label}>
                <path className="sc-filet" d={`M${cx} ${cy} L${bx} ${by}`} />
                {piste.leaves.map((leaf, i) => {
                  const angle = piste.angle + (i - (piste.leaves.length - 1) / 2) * spread;
                  const [lx, ly] = at(angle, 168);
                  const right = Math.cos((angle * Math.PI) / 180) >= 0.2;
                  const left = Math.cos((angle * Math.PI) / 180) <= -0.2;
                  return (
                    <g key={leaf}>
                      <path className="sc-filet" d={`M${bx} ${by} L${lx} ${ly}`} />
                      <circle className="sc-point" cx={lx} cy={ly} r="2.5" />
                      <text
                        className="sc-petit"
                        x={lx + (right ? 7 : left ? -7 : 0)}
                        y={ly + (right || left ? 4 : ly < cy ? -8 : 15)}
                        textAnchor={right ? 'start' : left ? 'end' : 'middle'}
                      >
                        {leaf}
                      </text>
                    </g>
                  );
                })}
                <circle className="sc-noeud" cx={bx} cy={by} r="4" />
                <text className="sc-titre" x={bx} y={by + (by < cy ? -10 : 18)} textAnchor="middle">
                  {piste.label}
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
  const sources = [
    { titre: 'Documentation de l’Usine', sous: 'Markdown sur GitLab · à jour, structurée', garde: true },
    { titre: 'Incidents résolus', sous: 'ServiceNow · JSON · les solutions passées', garde: true },
    { titre: 'Forum', sous: 'riche, mais souvent daté', garde: false },
    { titre: 'Fil d’actualité', sous: 'temps réel · trop mouvant pour un index', garde: false },
  ];
  return (
    <Svg h={236} label="Les sources gardées, la documentation et les incidents résolus, et les sources écartées, le forum et le fil d’actualité">
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
                />
                {source.garde ? (
                  <Fleche id={id} d={`M280 ${y + 22} C 380 ${y + 22}, 380 ${74 + i * 26}, 470 ${74 + i * 26}`} ton="accent" />
                ) : (
                  <>
                    <path className="sc-trait sc-trait--faible sc-trait--pointille" d={`M280 ${y + 22} H316`} />
                    <path className="sc-trait sc-trait--faible" d={`M322 ${y + 16} l12 12 M334 ${y + 16} l-12 12`} />
                    <text className="sc-petit" x={344} y={y + 26}>
                      écarté
                    </text>
                  </>
                )}
              </g>
            );
          })}
          <text className="sc-petit" x={470} y={140}>
            après nettoyage, découpage et embeddings
          </text>
          <Boite x={470} y={56} w={240} h={64} titre="Index Azure AI Search" sous="texte, vecteurs et métadonnées" ton="accent" />
        </>
      )}
    </Svg>
  );
}

/* 5 · Decision 2: hybrid search (report, 7.2.6). */
function Recherche() {
  return (
    <Svg h={210} label="La recherche hybride : mots-clés et vecteurs en parallèle, fusionnés, puis reclassés">
      {(id) => (
        <>
          <Boite x={10} y={79} w={100} h={52} titre="Question" sous="du ticket" />
          <Boite x={150} y={20} w={176} h={52} titre="Mots-clés · BM25" sous="codes d’erreur, noms d’outils" />
          <Boite x={150} y={138} w={176} h={52} titre="Vecteurs · ADA-002" sous="1 536 dimensions · le sens" />
          <Boite x={366} y={79} w={104} h={52} titre="Fusion" sous="un classement" />
          <Boite x={500} y={79} w={106} h={52} titre="Reclassement" sous="sémantique" />
          <Boite x={630} y={79} w={80} h={52} titre="Passages" sous="→ modèle" ton="accent" />
          <Fleche id={id} d="M110 96 C 130 96, 130 46, 150 46" />
          <Fleche id={id} d="M110 114 C 130 114, 130 164, 150 164" />
          <Fleche id={id} d="M326 46 C 346 46, 346 96, 366 96" />
          <Fleche id={id} d="M326 164 C 346 164, 346 114, 366 114" />
          <Fleche id={id} d="M470 105 H500" ton="accent" />
          <Fleche id={id} d="M606 105 H630" ton="accent" />
        </>
      )}
    </Svg>
  );
}

/* 6 · Decision 3: the same PDF, read by rules and by a model (report, 8.3.2). */
function Pdf() {
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
        Le document : deux colonnes, un tableau
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
    <Svg h={256} label="Le même PDF lu par un parseur à règles, dans le désordre et le tableau cassé, puis par Azure Document Intelligence, dans l’ordre et le tableau gardé">
      {(id) => (
        <>
          {page}
          <Fleche id={id} d="M180 120 C 210 120, 210 70, 240 70" />
          <Fleche id={id} d="M180 140 C 210 140, 210 190, 240 190" ton="accent" />
          <text className="sc-titre" x="250" y="34">
            Parseur à règles
          </text>
          <text className="sc-sous" x="250" y="50">
            le texte dans l’ordre du fichier, le tableau en morceaux
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
            l’ordre de lecture, les colonnes et le tableau reconnus
          </text>
          {bloc(250, 180, '1', 56, 'accent')}
          {bloc(312, 180, '2', 56, 'accent')}
          {bloc(374, 180, '3', 56, 'accent')}
          <g className="sc-tableau sc-tableau--accent">
            <rect x="436" y="180" width="150" height="48" />
            <path d="M436 196 H586 M436 212 H586 M486 180 V228 M536 180 V228" />
          </g>
          <text className="sc-petit" x="596" y="208">
            4 · un tableau
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
  return (
    <Svg h={300} label="Avant : la recherche puis le modèle, toujours. Après : un agent ReAct qui pense, agit avec ses outils, observe, et recommence jusqu’à pouvoir répondre">
      {(id) => (
        <>
          <text className="sc-titre" x="10" y="18">
            Avant · une recherche à chaque fois
          </text>
          {['Question', 'Recherche', 'Modèle', 'Réponse'].map((titre, i) => (
            <Boite key={titre} x={40} y={36 + i * 64} w={170} h={40} titre={titre} />
          ))}
          {[0, 1, 2].map((i) => (
            <Fleche key={i} id={id} d={`M125 ${76 + i * 64} V${100 + i * 64}`} />
          ))}
          <path className="sc-filet" d="M262 10 V290" />

          <text className="sc-titre" x="290" y="18">
            Après · un agent ReAct
          </text>
          <Boite x={300} y={40} w={150} h={46} titre="Pensée" sous="que me manque-t-il ?" ton="accent" />
          <Boite x={300} y={130} w={150} h={46} titre="Action" sous="appelle un outil" />
          <Boite x={300} y={220} w={150} h={46} titre="Observation" sous="lit le résultat" />
          <Fleche id={id} d="M375 86 V130" ton="accent" />
          <Fleche id={id} d="M375 176 V220" ton="accent" />
          <Fleche id={id} d="M300 243 C 262 243, 262 63, 300 63" ton="accent" />
          <rect className="sc-agent" x={432} y={48} width="10" height="10" />
          <Boite x={560} y={40} w={150} h={46} titre="Réponse" sous="avec ses sources" ton="accent" />
          <Fleche id={id} d="M450 63 H560" ton="accent" />
          <text className="sc-petit" x="505" y="56" textAnchor="middle">
            quand il sait
          </text>
          {['Recherche doc', 'Graphe de la doc', 'Incidents résolus', 'Reformulation'].map((titre, i) => (
            <g key={titre}>
              <Boite x={560} y={112 + i * 40} w={150} h={30} titre={titre} pointille />
              <path className="sc-trait sc-trait--pointille" d={`M450 153 C 505 153, 505 ${127 + i * 40}, 560 ${127 + i * 40}`} />
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
  const ci = [
    { titre: 'GitLab', sous: 'code · webhook' },
    { titre: 'Jenkins', sous: 'orchestre le build' },
    { titre: 'Build', sous: 'conteneur dédié' },
    { titre: 'Tests unitaires', sous: 'à chaque build' },
    { titre: 'Qualité, sécurité', sous: 'SonarQube, Checkmarx' },
  ];
  const x = (i: number) => 10 + i * 141;
  return (
    <Svg h={300} label="Le pipeline : GitLab, Jenkins, build, tests unitaires, qualité et sécurité, puis Artifactory, Ansible avec les secrets de Vault, et Azure">
      {(id) => (
        <>
          <text className="sc-sous" x="10" y="18">
            Intégration continue
          </text>
          {ci.map((box, i) => (
            <Boite key={box.titre} x={x(i)} y={30} w={i === 4 ? 144 : 124} h={52} {...box} />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <Fleche key={i} id={id} d={`M${x(i) + 124} 56 H${x(i + 1)}`} />
          ))}
          <text className="sc-petit" x={x(1)} y={100}>
            récupère les dépendances dans Artifactory
          </text>

          <text className="sc-sous" x="10" y="160">
            Déploiement continu
          </text>
          <Fleche id={id} d={`M${x(4) + 72} 82 V172`} ton="accent" />
          <Boite x={x(4)} y={172} w={144} h={52} titre="Artifactory" sous="binaires, image" ton="accent" />
          <Boite x={x(2) + 30} y={172} w={150} h={52} titre="Ansible" sous="déploie l’artefact" ton="accent" />
          <Boite x={x(0)} y={172} w={190} h={52} titre="Azure" sous="l’application en production" ton="accent" />
          <Fleche id={id} d={`M${x(4)} 198 H${x(2) + 180}`} ton="accent" />
          <Fleche id={id} d={`M${x(2) + 30} 198 H${x(0) + 190}`} ton="accent" />
          <Boite x={x(2) + 30} y={250} w={150} h={40} titre="Vault · les secrets" pointille />
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
