import { useEffect, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
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
// Captioned like works in a museum, small and minimal: title in italics · organisation, year.
const PROJECTS = [
  { number: '01', name: 'SNCF GPT', org: 'SNCF', year: '2023' },
  { number: '02', name: 'Synthèse de réunions', org: 'SNCF', year: '2025' },
  { number: '03', name: 'Whiteboard AMDEC', org: 'Renault / Alpine', year: '2025' },
];
const CONTACT = ['E-mail', 'LinkedIn', 'GitHub'];

type MaquetteProps = {
  /** Grey blocks in place of the words, to judge the placement only. */
  blocks: boolean;
  /** Shows the columns over the page. */
  columns?: number;
  /** Pictures for the project cards, by project number; the others stay grey. */
  images?: Partial<Record<string, ReactNode>>;
  /** Opens a project's page when its card is clicked (the Atelier's step 7). */
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
export function MaquetteMobile({ menuOpen, onMenu, glisse, blocks, columns, images }: MaquetteMobileProps) {
  const ref = useRef<HTMLDivElement>(null);

  // The name and « Menu » stay over the pictures that run over the strip; where
  // one passes under them, and only there, they take an accent background: an
  // accent copy of the word (data-text) shows through a mask (--over).
  useEffect(() => {
    const page = ref.current;
    if (!page) return;
    const words = [...page.querySelectorAll<HTMLElement>('.m-strip > *')];
    for (const word of words) word.dataset.text = word.textContent ?? '';
    const update = () => {
      const pictures = [...page.querySelectorAll('.m-img')].map((picture) => picture.getBoundingClientRect());
      for (const word of words) {
        const box = word.getBoundingClientRect();
        const spans = pictures
          .filter((picture) => box.left < picture.right && box.right > picture.left)
          .map((picture) => [Math.max(box.top, picture.top), Math.min(box.bottom, picture.bottom)])
          .filter(([top, bottom]) => bottom > top)
          .map(([top, bottom]) => [((top - box.top) / box.height) * 100, ((bottom - box.top) / box.height) * 100]);
        // The word is turned half a turn: « to top » runs from its visual top down.
        const stops = spans.flatMap(([from, to]) => [
          `transparent ${from.toFixed(2)}%`,
          `#000 ${from.toFixed(2)}%`,
          `#000 ${to.toFixed(2)}%`,
          `transparent ${to.toFixed(2)}%`,
        ]);
        word.style.setProperty('--over', `linear-gradient(to top, transparent, ${stops.join(', ')}${stops.length ? ', ' : ''}transparent)`);
      }
    };
    update();
    page.addEventListener('scroll', update, { passive: true });
    const resize = new ResizeObserver(update);
    resize.observe(page);
    return () => {
      page.removeEventListener('scroll', update);
      resize.disconnect();
    };
  }, []);

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
      <Visuals images={images} />
      <div className="m-menu" data-open={menuOpen ? '' : undefined} inert={!menuOpen}>
        <button type="button" className="m-label" onClick={() => onMenu?.(false)}>
          <T>Fermer</T>
        </button>
        <NavList className="m-menu__nav" />
        <Contact />
      </div>
    </div>
  );
}

/** A run of words, which the blocks view turns into grey bars. */
export const T = ({ children }: { children: ReactNode }) => <span className="m-t">{children}</span>;

export const Name = () => (
  <p className="m-name">
    <T>Alexandre Teixeira</T>
  </p>
);

export const NavList = ({ className }: { className: string }) => (
  <ul className={className}>
    {NAV.map((item, index) => (
      <li key={item} data-cursor="cube" aria-current={index === 0 ? 'page' : undefined} style={{ '--i': index } as CSSProperties}>
        <T>{item}</T>
      </li>
    ))}
    <li className="m-lang" data-cursor="cube" style={{ '--i': NAV.length } as CSSProperties}>
      <T>FR · EN</T>
    </li>
  </ul>
);

export const Contact = () => (
  <ul className="m-contact m-label">
    {CONTACT.map((item) => (
      <li key={item} data-cursor="cube">
        <T>{item}</T>
      </li>
    ))}
  </ul>
);

const Hero = () => (
  <div className="m-hero">
    <p className="m-title">
      <T>AI engineer, du prototype à la </T>
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

const Visuals = ({ images, onOuvrir }: Pick<MaquetteProps, 'images' | 'onOuvrir'>) => (
  <ul className="m-visuals">
    {PROJECTS.map((project) => (
      <li
        key={project.number}
        data-cursor="projet"
        data-cursor-label="Voir le projet"
        onClick={onOuvrir && images?.[project.number] ? () => onOuvrir(project.number) : undefined}
      >
        <span className="m-img">{images?.[project.number]}</span>
        <span className="m-work">
          <em>
            <T>{project.name}</T>
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
