import type { ReactNode } from 'react';
import { GridColumns } from './Temoin';

// Stand-in content for the Vitrine's first screen; the real words come at step 7.
const NAV = ['Projets', 'À propos', 'CV', 'Contact'];
const FACTS = [
  ['Rôle', 'AI engineer'],
  ['Approche', 'Du prototype à la production'],
  ['Langues', 'Français · English'],
];
const PROJECTS = [
  { number: '01', name: 'Projet témoin A', stage: 'En production', year: '2025', programme: 'Agent conversationnel', team: 'Support client' },
  { number: '02', name: 'Projet témoin B', stage: 'Pilote', year: '2025', programme: 'Outil interne', team: 'Juridique' },
  { number: '03', name: 'Projet témoin C', stage: 'Prototype', year: '2024', programme: 'Interface', team: 'Produit' },
  { number: '04', name: 'Projet témoin D', stage: 'Expérimentation', year: '2024', programme: 'Recherche', team: 'Labo' },
];
const BIO = 'Des technologies d’IA récentes mises en service, avec des interfaces que les équipes adoptent vraiment.';
const CONTACT = ['E-mail', 'LinkedIn', 'GitHub'];

export type Layout =
  | 'coins'
  | 'colonnes'
  | 'colonnes-index'
  | 'colonnes-trois'
  | 'laterale'
  | 'laterale-liste'
  | 'laterale-droite'
  | 'couverture'
  | 'lookbook'
  | 'agence'
  | 'agence-cadre'
  | 'agence-index'
  | 'affiche'
  | 'journal'
  | 'cartel'
  | 'plan'
  | 'manuel';

type MaquetteProps = {
  layout: Layout;
  /** Grey blocks in place of the words, to judge the placement only. */
  blocks: boolean;
  /** Shows the 16 columns over the page. */
  columns?: number;
};

/** The Vitrine's first screen at 1440 × 900, in one of the step 5 layouts. */
export function Maquette({ layout, blocks, columns }: MaquetteProps) {
  const Page = PAGES[layout];
  return (
    <div className={`maquette maquette--${layout}`} data-blocks={blocks ? '' : undefined}>
      {columns && <GridColumns count={columns} />}
      <Page />
    </div>
  );
}

/** A run of words, which the blocks view turns into grey bars. */
const T = ({ children }: { children: ReactNode }) => <span className="m-t">{children}</span>;

const Name = () => (
  <p className="m-name">
    <T>Alexandre Teixeira</T>
  </p>
);

const Nav = ({ vertical = false }: { vertical?: boolean }) => (
  <ul className={`m-nav m-label${vertical ? ' m-nav--vertical' : ''}`}>
    {NAV.map((item, index) => (
      <li key={item} aria-current={index === 0 ? 'page' : undefined}>
        <T>{item}</T>
      </li>
    ))}
    <li className="m-lang">
      <T>FR · EN</T>
    </li>
  </ul>
);

const Title = () => (
  <p className="m-title">
    <T>AI engineer, du prototype à la </T>
    <mark>
      <T>production</T>
    </mark>
    <T>.</T>
  </p>
);

const Bio = () => (
  <p className="m-bio">
    <T>{BIO}</T>
  </p>
);

const Facts = () => (
  <dl className="m-facts">
    {FACTS.map(([term, detail]) => (
      <div key={term}>
        <dt className="m-label">
          <T>{term}</T>
        </dt>
        <dd>
          <T>{detail}</T>
        </dd>
      </div>
    ))}
  </dl>
);

const Contact = () => (
  <ul className="m-contact m-label">
    {CONTACT.map((item) => (
      <li key={item}>
        <T>{item}</T>
      </li>
    ))}
  </ul>
);

const Index = () => (
  <ol className="m-index">
    {PROJECTS.map((project) => (
      <li key={project.number}>
        <span className="m-label">
          <T>{project.number}</T>
        </span>
        <span>
          <T>{project.name}</T>
        </span>
        <span className="m-label">
          <T>{project.stage}</T>
        </span>
        <span className="m-label">
          <T>{project.year}</T>
        </span>
      </li>
    ))}
  </ol>
);

const Visuals = ({ count, captions = false }: { count: number; captions?: boolean }) => (
  <ul className="m-visuals">
    {PROJECTS.slice(0, count).map((project) => (
      <li key={project.number}>
        <span className="m-img" />
        {captions && (
          <>
            <span>
              <T>{project.name}</T>
            </span>
            <span className="m-label">
              <T>{project.stage}</T>
            </span>
          </>
        )}
      </li>
    ))}
  </ul>
);

/** Kalkbrenner: the sentence in the middle, everything else in the corners. */
function Coins() {
  return (
    <>
      <Name />
      <Nav />
      <div className="m-hero">
        <Title />
        <Bio />
      </div>
      <Facts />
      <p className="m-more m-label">
        <T>Projets (4) ↓</T>
      </p>
      <Contact />
    </>
  );
}

/** Van Arnam: who on the left, the project index on the right, visuals below. */
function Colonnes() {
  return (
    <>
      <Name />
      <Nav />
      <div className="m-hero">
        <Title />
        <Bio />
        <Facts />
      </div>
      <Index />
      <Visuals count={4} />
    </>
  );
}

/** Rachel Chen: a side column for the name and the nav, the sentence then project cards. */
function Laterale() {
  return (
    <>
      <div className="m-side">
        <Name />
        <Nav vertical />
        <Contact />
      </div>
      <div className="m-hero">
        <Title />
        <Bio />
        <Facts />
      </div>
      <Visuals count={3} captions />
    </>
  );
}

/** Fashion magazine cover: the name as a masthead, the projects as cover lines around one image. */
function Couverture() {
  return (
    <>
      <p className="m-masthead">
        <T>Alexandre Teixeira</T>
      </p>
      <p className="m-dateline m-label">
        <T>N° 01</T>
        <T>Novembre 2026</T>
        <T>AI engineer</T>
        <T>FR · EN</T>
      </p>
      <ul className="m-coverlines">
        {PROJECTS.slice(0, 3).map((project) => (
          <li key={project.number}>
            <span className="m-label">
              <T>{project.stage}</T>
            </span>
            <span className="m-coverline">
              <T>{project.name}</T>
            </span>
          </li>
        ))}
      </ul>
      <span className="m-img m-cover" />
      <div className="m-hero">
        <Title />
        <Bio />
      </div>
      <Nav />
      <Contact />
    </>
  );
}

/** Fashion house lookbook: the name small in the middle, the projects as looks in a row. */
function Lookbook() {
  return (
    <>
      <Nav />
      <Name />
      <Contact />
      <ul className="m-looks">
        {PROJECTS.map((project) => (
          <li key={project.number}>
            <span className="m-img" />
            <span className="m-label">
              <T>Look {project.number}</T>
            </span>
            <span>
              <T>{project.name}</T>
            </span>
          </li>
        ))}
      </ul>
      <div className="m-hero">
        <Title />
      </div>
    </>
  );
}

const [SHOWN] = PROJECTS;

const Statement = () => (
  <p className="m-statement m-label">
    <T>AI engineer · Du prototype à la production · Français, English</T>
  </p>
);

const Figure = ({ wide = false }: { wide?: boolean }) => (
  <figure className={`m-figure${wide ? ' m-figure--wide' : ''}`}>
    <span className="m-img" />
    <figcaption className="m-label">
      <T>
        {SHOWN.number} · {SHOWN.name} · {SHOWN.programme}
      </T>
    </figcaption>
  </figure>
);

/** The projects as an architect's fact sheet; the shown project is marked. */
const Sheet = () => (
  <table className="m-sheet">
    <thead className="m-label">
      <tr>
        {['N°', 'Projet', 'Programme', 'Équipe', 'Statut', 'Année'].map((heading) => (
          <th key={heading}>
            <T>{heading}</T>
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {PROJECTS.map((project) => (
        <tr key={project.number} aria-current={project === SHOWN ? 'true' : undefined}>
          {[project.number, project.name, project.programme, project.team, project.stage, project.year].map((cell, index) => (
            <td key={index}>
              <T>{cell}</T>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

/** Architecture practice: one image, the sentence, and the projects as a fact sheet. */
function Agence() {
  return (
    <>
      <Name />
      <Statement />
      <Nav />
      <Figure />
      <div className="m-hero">
        <Title />
        <Sheet />
      </div>
    </>
  );
}

/** Agence, full frame: a wide image, then the sentence and the fact sheet side by side. */
function AgenceCadre() {
  return (
    <>
      <Name />
      <Statement />
      <Nav />
      <Figure wide />
      <div className="m-hero">
        <Title />
      </div>
      <Sheet />
    </>
  );
}

/** Agence, index only: the sentence, a small preview of the hovered project, the sheet full width. */
function AgenceIndex() {
  return (
    <>
      <Name />
      <Statement />
      <Nav />
      <div className="m-hero">
        <Title />
      </div>
      <span className="m-img m-preview" />
      <Sheet />
    </>
  );
}

/** Colonnes, projects first: the index with a thumbnail per row on the left, who on the right. */
function ColonnesIndex() {
  return (
    <>
      <Name />
      <Nav />
      <ol className="m-thumbindex">
        {PROJECTS.map((project) => (
          <li key={project.number}>
            <span className="m-img" />
            <span className="m-bigname">
              <T>{project.name}</T>
            </span>
            <span className="m-label">
              <T>{project.stage}</T>
            </span>
            <span className="m-label">
              <T>{project.year}</T>
            </span>
          </li>
        ))}
      </ol>
      <div className="m-hero">
        <Title />
        <Bio />
        <Facts />
      </div>
    </>
  );
}

/** Colonnes, in three: the sentence across, then Qui, Projets and Contact under a rule each. */
function ColonnesTrois() {
  return (
    <>
      <Name />
      <Nav />
      <div className="m-hero">
        <Title />
      </div>
      <section className="m-col m-col--qui">
        <p className="m-label">
          <T>Qui</T>
        </p>
        <Bio />
        <Facts />
      </section>
      <section className="m-col m-col--projets">
        <p className="m-label">
          <T>Projets</T>
        </p>
        <Index />
      </section>
      <section className="m-col m-col--contact">
        <p className="m-label">
          <T>Contact</T>
        </p>
        <Contact />
      </section>
    </>
  );
}

/** Nav latérale with a list: the projects as large serif titles, one per line. */
function LateraleListe() {
  return (
    <>
      <div className="m-side">
        <Name />
        <Nav vertical />
        <Contact />
      </div>
      <div className="m-hero">
        <Title />
        <Bio />
      </div>
      <ol className="m-titlelist">
        {PROJECTS.map((project) => (
          <li key={project.number}>
            <span className="m-label">
              <T>{project.number}</T>
            </span>
            <span className="m-bigname">
              <T>{project.name}</T>
            </span>
            <span className="m-label">
              <T>{project.stage}</T>
            </span>
            <span className="m-label">
              <T>{project.year}</T>
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}

/** Swiss poster (Müller-Brockmann, Vignelli): four columns of facts, the sentence huge, numbered projects. */
function Affiche() {
  return (
    <>
      <div className="m-poster-head">
        <div>
          <Name />
          <p className="m-label">
            <T>AI engineer</T>
          </p>
        </div>
        <Nav vertical />
        <p className="m-label">
          <T>Novembre 2026</T>
        </p>
        <Contact />
      </div>
      <div className="m-hero">
        <Title />
      </div>
      <ol className="m-numbers">
        {PROJECTS.map((project) => (
          <li key={project.number}>
            <span className="m-number">
              <T>{project.number}</T>
            </span>
            <span>
              <T>{project.name}</T>
            </span>
            <span className="m-label">
              <T>{project.stage}</T>
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}

/** Broadsheet (FT Weekend, Le Monde): a small masthead, the sentence as the headline, projects as articles. */
function Journal() {
  return (
    <>
      <p className="m-edition m-label">
        <T>N° 01 · Novembre 2026 · AI engineer</T>
      </p>
      <Nav />
      <p className="m-flag">
        <T>Alexandre Teixeira</T>
      </p>
      <div className="m-hero">
        <Title />
        <Bio />
      </div>
      <aside className="m-aside">
        <Facts />
      </aside>
      <ul className="m-articles">
        {PROJECTS.map((project) => (
          <li key={project.number}>
            <span className="m-label">
              <T>{project.stage}</T>
            </span>
            <span className="m-headline">
              <T>{project.name}</T>
            </span>
            <span className="m-body">
              <T>
                {project.programme} pour l’équipe {project.team.toLowerCase()}. Texte provisoire : le récit du projet viendra à
                l’étape 7.
              </T>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Gallery (White Cube, Fondation Cartier): one work at a time, with its museum label. */
function Cartel() {
  const [shown] = PROJECTS;
  return (
    <>
      <Name />
      <Nav />
      <div className="m-hero">
        <Title />
      </div>
      <span className="m-img m-artwork" />
      <dl className="m-tombstone">
        <dt>
          <T>Alexandre Teixeira</T>
        </dt>
        <dd className="m-work">
          <T>{shown.name}</T>
          <T>, {shown.year}</T>
        </dd>
        <dd>
          <T>{shown.programme}</T>
        </dd>
        <dd className="m-label">
          <T>Modèles de langage, Python, interface web</T>
        </dd>
        <dd className="m-label">
          <T>
            {shown.stage} · {shown.team}
          </T>
        </dd>
      </dl>
      <p className="m-pager m-label">
        <T>01 / 04 ← →</T>
      </p>
    </>
  );
}

const AXES = 'ABCDEFGHIJKLMNOP'.split('');
const TITLE_BLOCK = [
  ['Projet', 'Portfolio'],
  ['Auteur', 'Alexandre Teixeira'],
  ['Fonction', 'AI engineer'],
  ['Échelle', '1:1'],
  ['Date', 'Novembre 2026'],
  ['Planche', '01 / 04'],
];

/** Architect's drawing: lettered axes over the columns, the projects as a legend, a title block. */
function Plan() {
  return (
    <>
      <div className="m-plan-lines" aria-hidden="true">
        {AXES.map((axis) => (
          <span key={axis} />
        ))}
      </div>
      <ol className="m-axes m-label" aria-hidden="true">
        {AXES.map((axis) => (
          <li key={axis}>
            <T>{axis}</T>
          </li>
        ))}
      </ol>
      <Name />
      <Nav />
      <div className="m-hero">
        <Title />
        <Bio />
      </div>
      <Index />
      <dl className="m-cartouche">
        {TITLE_BLOCK.map(([term, detail]) => (
          <div key={term}>
            <dt className="m-label">
              <T>{term}</T>
            </dt>
            <dd>
              <T>{detail}</T>
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}

const SECTIONS = ['Introduction', 'Projets', 'Méthode', 'À propos', 'Contact'];

/** Graphics standards manual (Vignelli, NASA 1975): numbered sections, running head, folio. */
function Manuel() {
  return (
    <>
      <p className="m-running m-label">
        <T>Alexandre Teixeira</T>
        <T>Manuel · Édition 2026</T>
        <T>FR · EN</T>
      </p>
      <ol className="m-toc">
        {SECTIONS.map((section, index) => (
          <li key={section} aria-current={index === 0 ? 'true' : undefined}>
            <span className="m-label">
              <T>{index + 1}.0</T>
            </span>
            <span>
              <T>{section}</T>
            </span>
          </li>
        ))}
      </ol>
      <div className="m-hero">
        <p className="m-section-number">
          <T>1.0</T>
        </p>
        <Title />
        <Bio />
        <Facts />
      </div>
      <ol className="m-subsections">
        {PROJECTS.map((project, index) => (
          <li key={project.number}>
            <span className="m-label">
              <T>2.{index + 1}</T>
            </span>
            <span>
              <T>{project.name}</T>
            </span>
            <span className="m-label">
              <T>{project.stage}</T>
            </span>
          </li>
        ))}
      </ol>
      <p className="m-folio m-label">
        <T>Page 1</T>
      </p>
    </>
  );
}

const PAGES: Record<Layout, () => ReactNode> = {
  coins: Coins,
  colonnes: Colonnes,
  'colonnes-index': ColonnesIndex,
  'colonnes-trois': ColonnesTrois,
  laterale: Laterale,
  'laterale-liste': LateraleListe,
  // The same page, its side column moved to the right by the stylesheet.
  'laterale-droite': Laterale,
  couverture: Couverture,
  lookbook: Lookbook,
  agence: Agence,
  'agence-cadre': AgenceCadre,
  'agence-index': AgenceIndex,
  affiche: Affiche,
  journal: Journal,
  cartel: Cartel,
  plan: Plan,
  manuel: Manuel,
};
