import type { ReactNode } from 'react';
import { GridColumns } from './Temoin';

// The Vitrine's first screen, drafted from the CV: the sentence, then only
// « Actuellement », « Précédemment » and « Formation », as on Rachel Chen's
// page. The final words are written with Alexandre at step 7.
const NAV = ['Projets', 'À propos', 'CV', 'Contact'];

/** A run of text, or a link to an organisation's site. */
type Part = string | { text: string; href: string };

const at = (name: string, href: string): Part => ({ text: `@${name}`, href });

const ENTETE: [string, Part[][]][] = [
  ['Actuellement', [['Étudiant']]],
  // One sentence over two lines, broken before « @Renault » (\n, see .m-facts dd).
  [
    'Précédemment',
    [
      [
        'Ingénieur IA ',
        at('SNCF', 'https://www.groupe-sncf.com'),
        ', ingénieur IA\n',
        at('Renault', 'https://www.renaultgroup.com'),
        '\u00a0/\u00a0',
        { text: 'Alpine', href: 'https://www.alpinecars.com' },
      ],
    ],
  ],
  [
    'Formation',
    [
      [at('UTC', 'https://www.utc.fr'), ', 2022 – 2026'],
      [at('Shanghai University', 'https://www.shu.edu.cn'), ', 2024 – 2025'],
    ],
  ],
];
const PROJECTS = [
  { number: '01', name: 'SNCF GPT', meta: 'SNCF · 2023' },
  { number: '02', name: 'Synthèse de réunions', meta: 'SNCF · 2025' },
  { number: '03', name: 'Whiteboard AMDEC', meta: 'Renault / Alpine · 2025' },
];
const CONTACT = ['E-mail', 'LinkedIn', 'GitHub'];

type MaquetteProps = {
  /** Grey blocks in place of the words, to judge the placement only. */
  blocks: boolean;
  /** Shows the columns over the page. */
  columns?: number;
};

/**
 * The Vitrine's first screen at 1440 × 900, as retained at step 5: the content
 * starts at the left edge, the name, nav and contact close the page on the right.
 * The explored layouts are in the history (commit 0022543).
 */
export function Maquette({ blocks, columns }: MaquetteProps) {
  return (
    <div className="maquette" data-blocks={blocks ? '' : undefined}>
      {columns && <GridColumns count={columns} />}
      <div className="m-side">
        <Name />
        <NavList className="m-nav m-label" />
        <Contact />
      </div>
      <Hero />
      <Visuals />
    </div>
  );
}

type MaquetteMobileProps = MaquetteProps & {
  /** Shows the open menu panel. */
  menuOpen: boolean;
};

/**
 * The same first screen on a 390 × 844 phone. The side column folds into a thin
 * strip along the right edge; the project images run over it.
 */
export function MaquetteMobile({ menuOpen, blocks, columns }: MaquetteMobileProps) {
  return (
    <div className="mobile" data-blocks={blocks ? '' : undefined}>
      {columns && <GridColumns count={columns} />}
      <div className="m-strip">
        <Name />
        <p className="m-label">
          <T>Menu</T>
        </p>
      </div>
      <Hero />
      <Visuals />
      {menuOpen && (
        <div className="m-menu">
          <p className="m-label">
            <T>Fermer</T>
          </p>
          <NavList className="m-menu__nav" />
          <Contact />
        </div>
      )}
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

const NavList = ({ className }: { className: string }) => (
  <ul className={className}>
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

const Contact = () => (
  <ul className="m-contact m-label">
    {CONTACT.map((item) => (
      <li key={item}>
        <T>{item}</T>
      </li>
    ))}
  </ul>
);

const Hero = () => (
  <div className="m-hero">
    <p className="m-title">
      <T>AI engineer, du prototype à la </T>
      <mark>
        <T>production</T>
      </mark>
      <T>.</T>
    </p>
    <dl className="m-facts">
      {ENTETE.map(([term, lines]) => (
        <div key={term}>
          <dt className="m-label">
            <T>{term}</T>
          </dt>
          {lines.map((parts, index) => (
            <dd key={index}>
              {parts.map((part, position) =>
                typeof part === 'string' ? (
                  <T key={position}>{part}</T>
                ) : (
                  <a key={position} className="m-link" href={part.href} target="_blank" rel="noreferrer">
                    <T>{part.text}</T>
                  </a>
                ),
              )}
            </dd>
          ))}
        </div>
      ))}
    </dl>
  </div>
);

const Visuals = () => (
  <ul className="m-visuals">
    {PROJECTS.map((project) => (
      <li key={project.number}>
        <span className="m-img" />
        <span>
          <T>{project.name}</T>
        </span>
        <span className="m-label">
          <T>{project.meta}</T>
        </span>
      </li>
    ))}
  </ul>
);
