import { useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { profile } from '../../shared/data/profile';
import { useChoixLangue, useLangue, useTr } from './langue';
import { GridColumns } from './Temoin';
import { useTranche } from './tranche';

// The Vitrine's first screen, drafted from the CV: the sentence, then only
// « Actuellement », « Précédemment » and « Formation », as on Rachel Chen's
// page. The final words are written with Alexandre at step 7.
type Tr = (fr: string, en: string) => string;

/**
 * The nav only holds what goes somewhere: the projects, the top of the page (who I am), the CV. « Contact »
 * is gone: the three ways to reach me are always in view, under it.
 */
const nav = (tr: Tr, langue: string) =>
  [
    { id: 'projets', texte: tr('Projets', 'Projects') },
    { id: 'apropos', texte: tr('À propos', 'About') },
    { id: 'cv', texte: tr('CV', 'Résumé'), href: `/documents/cv-${langue}.pdf` },
  ] as const;

/** A run of text, or a link to an organisation's site. */
type Part = string | { text: string; href: string };

const at = (name: string, href: string): Part => ({ text: `@${name}`, href });

const entete = (tr: Tr): [string, Part[][]][] => [
  [tr('Actuellement', 'Currently'), [[tr('Étudiant', 'Student')]]],
  // One sentence over two lines, broken before « @Renault » (\n, see .m-facts dd).
  [
    tr('Précédemment', 'Previously'),
    [
      [
        tr('Ingénieur IA ', 'AI engineer '),
        at('SNCF', 'https://www.groupe-sncf.com'),
        tr(', ingénieur IA\n', ', AI engineer\n'),
        at('Renault', 'https://www.renaultgroup.com'),
        '\u00a0/\u00a0',
        { text: 'Alpine', href: 'https://www.alpinecars.com' },
      ],
    ],
  ],
  [
    tr('Formation', 'Education'),
    [
      [at('UTC', 'https://www.utc.fr'), ', 2022 – 2026'],
      [at('Shanghai University', 'https://www.shu.edu.cn'), ', 2024 – 2025'],
    ],
  ],
];
// Captioned like works in a museum, small and minimal: title in italics · organisation, year.
const PROJECTS = [
  { number: '01', name: 'SNCF GPT', org: 'SNCF', year: '2023' },
  { number: '02', name: 'Whiteboard AMDEC', org: 'Renault / Alpine', year: '2025' },
  { number: '03', name: 'Synthèse de réunions', nameEn: 'Meeting summaries', org: 'SNCF', year: '2025' },
];

type MaquetteProps = {
  /** Grey blocks in place of the words, to judge the placement only. */
  blocks: boolean;
  /** Shows the columns over the page. */
  columns?: number;
  /** Pictures for the project cards, by project number; the others stay grey. */
  images?: Partial<Record<string, ReactNode>>;
  /** Opens a project's page when its card is clicked (the Atelier's step 7); the caller ignores projects without one. */
  onOuvrir?: (number: string) => void;
};

/**
 * The Vitrine's first screen at 1440 × 900, as retained at step 5: the content
 * starts at the left edge, the name, nav and contact close the page on the right.
 * The explored layouts are in the history (commit 0022543).
 */
export function Maquette({ blocks, columns, images, onOuvrir }: MaquetteProps) {
  return (
    <div className="maquette" data-blocks={blocks ? '' : undefined}>
      {columns && <GridColumns count={columns} />}
      <div className="m-side">
        <Name />
        <NavList className="m-nav m-label" />
        <Contact />
      </div>
      <Hero />
      <Visuals images={images} onOuvrir={onOuvrir} />
    </div>
  );
}

type MaquetteMobileProps = MaquetteProps & {
  /** Shows the open menu panel. */
  menuOpen: boolean;
  /** Makes « Menu » and « Fermer » work; without it the phone is a still. */
  onMenu?: (open: boolean) => void;
  /** Slides the menu in from the right edge (step 6); without it the menu just appears. */
  glisse?: boolean;
};

/**
 * The same first screen on a 390 × 844 phone. The side column folds into a thin
 * strip along the right edge; the project images run over it.
 */
export function MaquetteMobile({ menuOpen, onMenu, glisse, blocks, columns, images, onOuvrir }: MaquetteMobileProps) {
  const ref = useRef<HTMLDivElement>(null);

  useTranche(ref, '.m-img');

  return (
    <div ref={ref} className="mobile" data-blocks={blocks ? '' : undefined} data-glisse={glisse ? '' : undefined}>
      {columns && <GridColumns count={columns} />}
      <div className="m-strip">
        <Name />
        <button type="button" className="m-label" onClick={() => onMenu?.(true)}>
          <T>Menu</T>
        </button>
      </div>
      <Hero />
      <Visuals images={images} onOuvrir={onOuvrir} />
      <div className="m-menu" data-open={menuOpen ? '' : undefined} inert={!menuOpen}>
        <Fermer onMenu={onMenu} />
        <NavList className="m-menu__nav" onChoix={() => onMenu?.(false)} />
        <Contact />
      </div>
    </div>
  );
}

/** A run of words, which the blocks view turns into grey bars. */
export const T = ({ children }: { children: ReactNode }) => <span className="m-t">{children}</span>;

export const Name = () => (
  <p className="m-name">
    {/* Like a logo: back to the home from a project, else to the top of the page. */}
    <a
      href={window.location.pathname}
      onClick={(event) => {
        event.preventDefault();
        if (window.location.hash) window.location.hash = '';
        else defiler(event.currentTarget, 'haut');
      }}
    >
      <T>Alexandre Teixeira</T>
    </a>
  </p>
);

const Fermer = ({ onMenu }: { onMenu?: (open: boolean) => void }) => {
  const tr = useTr();
  return (
    <button type="button" className="m-label" onClick={() => onMenu?.(false)}>
      <T>{tr('Fermer', 'Close')}</T>
    </button>
  );
};

/** Scrolls the page (the desktop's or the phone's own scroller) to the projects or back to the top. */
function defiler(depuis: Element, vers: 'projets' | 'haut') {
  const page = depuis.closest('.maquette, .mobile');
  if (!page) return;
  const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const projets = page.querySelector<HTMLElement>('.m-visuals');
  const top = vers === 'haut' || !projets ? 0 : Math.max(0, projets.offsetTop - 48);
  page.scrollTo({ top, behavior: reduit ? 'auto' : 'smooth' });
}

export const NavList = ({ className, onChoix }: { className: string; onChoix?: () => void }) => {
  const tr = useTr();
  const langue = useLangue();
  const choisir = useChoixLangue();
  const items = nav(tr, langue);
  return (
    <ul className={className}>
      {items.map((item, index) => (
        <li key={item.id} data-cursor="cube" aria-current={index === 0 ? 'page' : undefined} style={{ '--i': index } as CSSProperties}>
          {'href' in item ? (
            <a href={item.href} target="_blank" rel="noreferrer" onClick={onChoix}>
              <T>{item.texte}</T>
            </a>
          ) : (
            <a
              href={`#${item.id}`}
              onClick={(event) => {
                event.preventDefault();
                defiler(event.currentTarget, item.id === 'projets' ? 'projets' : 'haut');
                onChoix?.();
              }}
            >
              <T>{item.texte}</T>
            </a>
          )}
        </li>
      ))}
      <li className="m-lang" style={{ '--i': items.length } as CSSProperties}>
        {(['fr', 'en'] as const).map((l, i) => (
          <span key={l}>
            {i > 0 && ' · '}
            <button type="button" className="m-lang__choix" aria-pressed={langue === l} lang={l} onClick={() => choisir(l)}>
              <T>{l.toUpperCase()}</T>
            </button>
          </span>
        ))}
      </li>
    </ul>
  );
};

/** The three ways to reach me, always one click away. */
export const Contact = () => {
  const tr = useTr();
  const liens = [
    { texte: tr('E-mail', 'Email'), href: `mailto:${profile.email}` },
    { texte: 'LinkedIn', href: profile.linkedinUrl, externe: true },
    { texte: 'GitHub', href: profile.githubUrl, externe: true },
  ];
  return (
    <ul className="m-contact m-label">
      {liens.map(({ texte, href, externe }) => (
        <li key={texte} data-cursor="cube">
          <a href={href} {...(externe ? { target: '_blank', rel: 'noreferrer' } : {})}>
            <T>{texte}</T>
          </a>
        </li>
      ))}
    </ul>
  );
};

const Hero = () => {
  const tr = useTr();
  const ENTETE = entete(tr);
  return (
    <div className="m-hero">
      <p className="m-title">
        <T>{tr('AI engineer, du prototype à la ', 'AI engineer, from prototype to ')}</T>
        {/* The full stop, as an accent square that fades now and then: the page is alive. It never wraps alone. */}
        <span className="m-nowrap">
          <mark>
            <T>production</T>
          </mark>
          <span className="m-blink" aria-hidden="true" />
        </span>
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
};

const Visuals = ({ images, onOuvrir }: Pick<MaquetteProps, 'images' | 'onOuvrir'>) => {
  const tr = useTr();
  return (
    <ul className="m-visuals" id="projets">
      {PROJECTS.map((project) => (
        <li
          key={project.number}
          data-cursor="projet"
          data-cursor-label={tr('Voir le projet', 'View project')}
          onClick={onOuvrir ? () => onOuvrir(project.number) : undefined}
        >
          <span className="m-img">{images?.[project.number]}</span>
          <span className="m-work">
            <em>
              <T>{project.nameEn ? tr(project.name, project.nameEn) : project.name}</T>
            </em>
            <span className="m-work__meta">
              <T>
                {' · '}
                {project.org}, {project.year}
              </T>
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
};
