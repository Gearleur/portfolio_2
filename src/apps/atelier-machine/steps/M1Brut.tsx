import { useRef, useState } from 'react';
import type { CSSProperties, JSX } from 'react';
import { profile } from '../../../shared/data/profile';
import '../m1b/m1b.css';

/*
 * Atelier 2 · M1 bis, « Brut »: another matter for the Machine state, kept beside the one
 * retained at M1 to compare. After basement.studio/ai (the principle, not the pixels): no
 * erased page and no glass, the whole screen is a plain-text index of the site, one ink on
 * black, capitals, dotted fields and ruled sections. The words are the Vitrine's own.
 */

const ENCRES = [
  { id: 'coquelicot', nom: 'Coquelicot', couleur: '#e0301f' },
  { id: 'ambre', nom: 'Ambre', couleur: '#ff5a1f' },
  { id: 'papier', nom: 'Papier', couleur: '#e9e8e3' },
] as const;

const FONDS = [
  { id: 'noir', nom: 'Noir', couleur: '#000000' },
  { id: 'nuit', nom: 'Bleu nuit', couleur: '#1b2029' },
] as const;

// The name in blocks: five rows per letter, a cell per « # ».
const LETTRES: Record<string, string[]> = {
  T: ['#####', '..#..', '..#..', '..#..', '..#..'],
  E: ['#####', '#....', '####.', '#....', '#####'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  X: ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
  R: ['####.', '#...#', '####.', '#..#.', '#...#'],
  A: ['.###.', '#...#', '#####', '#...#', '#...#'],
};
const NOM = 'TEIXEIRA';
const RANGS = [0, 1, 2, 3, 4].map((rang) => NOM.split('').map((lettre) => LETTRES[lettre][rang]).join('.'));

const NAV = ['/accueil', '/projets', '/a-propos', '/cv', '/contact'];

const FICHE: [string, string][] = [
  ['nom', 'Alexandre Teixeira'],
  ['rôle', 'AI engineer, du prototype à la production'],
  ['actuellement', 'Étudiant'],
  ['précédemment', 'Ingénieur IA @SNCF, ingénieur IA @Renault / Alpine'],
  ['formation', 'UTC, 2022 – 2026 ; Shanghai University, 2024 – 2025'],
  ['lieu', profile.location],
  ['langues', 'fr, en'],
];

const PROJETS: { nom: string; meta: string; texte: string; mots: string[] }[] = [
  {
    nom: 'Whiteboard AMDEC',
    meta: 'Renault / Alpine, 2025',
    texte: 'Un tableau blanc où des agents IA aident les ingénieurs d’Alpine à construire leurs analyses de risques.',
    mots: ['agents', 'RAG', 'produit'],
  },
  {
    nom: 'SNCF GPT',
    meta: 'SNCF, 2023',
    texte: 'Un assistant IA pour le support DevOps, point de départ de SNCF Groupe GPT, l’IA générative du groupe.',
    mots: ['RAG', 'agent', 'CI/CD', 'production'],
  },
  { nom: 'Synthèse de réunions', meta: 'SNCF, 2025', texte: '[texte à reprendre de la page projet]', mots: ['transcription', 'LLM', 'Azure'] },
  {
    nom: 'Dessiner avec l’IA',
    meta: 'Méthode, 2026',
    texte: 'L’IA produit, je dirige. Des ateliers en code, des références, des clones qui marchent vraiment, des curseurs, et une décision à la fois.',
    mots: ['méthode', 'design'],
  },
];

const points = (terme: string) => `${terme} ${'.'.repeat(Math.max(3, 15 - terme.length))}`;

const Filet = ({ children }: { children: string }) => (
  <h3 className="m1b-filet">
    <span>{children}</span>
  </h3>
);

function Choix<T extends string>({ nom, options, valeur, onChange }: { nom: string; options: readonly { id: T; nom: string }[]; valeur: T; onChange: (id: T) => void }) {
  return (
    <div className="m1b-choix" role="group" aria-label={nom}>
      <span>{nom}</span>
      {options.map((option) => (
        <button key={option.id} type="button" aria-pressed={option.id === valeur} onClick={() => onChange(option.id)}>
          {option.nom}
        </button>
      ))}
    </div>
  );
}

export function M1Brut(): JSX.Element {
  const [encre, setEncre] = useState<(typeof ENCRES)[number]['id']>('coquelicot');
  const [fond, setFond] = useState<(typeof FONDS)[number]['id']>('noir');
  const [casse, setCasse] = useState<'capitales' | 'courante'>('capitales');
  const cadre = useRef<HTMLDivElement>(null);

  const style = {
    '--encre': ENCRES.find((e) => e.id === encre)?.couleur,
    '--nuit': FONDS.find((f) => f.id === fond)?.couleur,
  } as CSSProperties;

  return (
    <section className="atelier-step" aria-labelledby="etape-m1b">
      <header className="atelier-step__head">
        <span className="atelier-step__index">M1 bis</span>
        <h2 id="etape-m1b">Brut</h2>
        <span className="atelier-status">À comparer</span>
      </header>
      <p className="atelier-step__note">
        Une autre matière, à côté de celle retenue en M1, d’après la page pour les IA de basement.studio : plus de page
        effacée ni de verre, tout l’écran devient un index en texte brut, une seule encre sur noir. Les mots sont ceux de
        la Vitrine. Cette page-là défile.
      </p>

      <div className="m1b-outils">
        <Choix nom="Encre" options={ENCRES} valeur={encre} onChange={setEncre} />
        <Choix nom="Fond" options={FONDS} valeur={fond} onChange={setFond} />
        <Choix
          nom="Casse"
          options={[
            { id: 'capitales', nom: 'Capitales' },
            { id: 'courante', nom: 'Courante' },
          ]}
          valeur={casse}
          onChange={setCasse}
        />
        <button type="button" className="m1b-plein" onClick={() => void cadre.current?.requestFullscreen?.()}>
          Plein écran <span aria-hidden="true">↗</span>
        </button>
      </div>

      <div ref={cadre} className="m1b" data-casse={casse} style={style}>
        <div className="m1b-page">
          <div className="m1b-colonne">
            <p className="m1b-nom" role="img" aria-label="Teixeira">
              {RANGS.map((rang, y) => (
                <span key={y} aria-hidden="true">
                  {rang.split('').map((cellule, x) => (
                    <i key={x} data-plein={cellule === '#' ? '' : undefined} />
                  ))}
                </span>
              ))}
            </p>

            <ul className="m1b-nav">
              {NAV.map((lien, index) => (
                <li key={lien} aria-current={index === 0 ? 'page' : undefined}>
                  {lien}
                </li>
              ))}
            </ul>

            <p className="m1b-titre">alexandre-teixeira :: index lisible par les machines</p>
            <p className="m1b-sourd"># Le portfolio en texte brut, pour les agents IA, les robots, et les humains qui le préfèrent ainsi.</p>

            <Filet>à propos</Filet>
            <dl className="m1b-fiche">
              {FICHE.map(([terme, valeur]) => (
                <div key={terme}>
                  <dt>{points(terme)}</dt>
                  <dd>{valeur}</dd>
                </div>
              ))}
            </dl>

            <Filet>projets</Filet>
            {PROJETS.map((projet) => (
              <div key={projet.nom} className="m1b-projet">
                <p>
                  * <u>{projet.nom}</u> <span className="m1b-sourd">— {projet.meta}</span>
                </p>
                <p>{projet.texte}</p>
                <p className="m1b-sourd">{projet.mots.map((mot) => `[${mot}]`).join(' ')}</p>
              </div>
            ))}

            <Filet>fichiers</Filet>
            <p>
              <u>/cv-fr.pdf</u>, <u>/cv-en.pdf</u>, <u>/agent/profile.md</u>, <u>/agent/profile.json</u>, <u>/llms.txt</u>
            </p>

            <Filet>contact</Filet>
            <dl className="m1b-fiche">
              <div>
                <dt>{points('e-mail')}</dt>
                <dd>{profile.email}</dd>
              </div>
              <div>
                <dt>{points('linkedin')}</dt>
                <dd>{profile.linkedinUrl.replace('https://www.', '')}</dd>
              </div>
              <div>
                <dt>{points('github')}</dt>
                <dd>{profile.githubUrl.replace('https://', '')}</dd>
              </div>
            </dl>
          </div>
        </div>

        <p className="m1b-mode" aria-hidden="true">
          <span>Humain</span>
          <span data-actif="">Machine</span>
        </p>
      </div>
    </section>
  );
}
