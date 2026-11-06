import { Fragment, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode, RefObject } from 'react';
import { Contact, Name, NavList, T } from './Maquettes';
import { Marque } from './Marque';
import { Miniature } from './Miniature';
import { EcranCadre, Schema } from './Schemas';
import type { Bloc, Phrase, Projet } from './projets';
import { useTranche } from './tranche';
import './projet.css';

const two = (n: number) => String(n).padStart(2, '0');

/** A bold lead, then the rest; linked when the phrase has an address. */
function Texte({ lead, text, href }: Phrase) {
  const words = (
    <>
      {lead && (
        <strong>
          <T>{lead}</T>
        </strong>
      )}
      {lead && ' '}
      <T>{text}</T>
    </>
  );
  return href ? (
    <a className="m-link" href={href} target="_blank" rel="noreferrer">
      {words}
    </a>
  ) : (
    words
  );
}

/** A picture: a diagram or the thumbnail, or a grey placeholder with what it will show. */
function Visuel({ children, legende, n }: { children?: ReactNode; legende: string; n: number }) {
  return (
    <figure className="p-visuel">
      <span className="p-visuel__image">{children}</span>
      <figcaption className="m-label">
        <T>
          Fig. {two(n)} — {children ? '' : 'À dessiner : '}
          {legende}
        </T>
      </figcaption>
    </figure>
  );
}

function Blocs({ blocs, figures }: { blocs: Bloc[]; figures: Map<Bloc, number> }) {
  return blocs.map((bloc, index) => {
    switch (bloc.type) {
      case 'texte':
        return (
          <p key={index} className="p-texte">
            <Texte {...bloc} />
          </p>
        );
      case 'intertitre':
        return (
          <h3 key={index} className="p-intertitre">
            <T>{bloc.text}</T>
          </h3>
        );
      case 'liste':
        return (
          <ul key={index} className="p-liste">
            {bloc.items.map((item) => (
              <li key={item.text}>
                <Texte {...item} />
              </li>
            ))}
          </ul>
        );
      case 'colonnes':
        return (
          <ul key={index} className="p-colonnes" style={{ '--n': bloc.items.length } as CSSProperties}>
            {bloc.items.map((item) => (
              <li key={item.text}>
                <Texte {...item} />
              </li>
            ))}
          </ul>
        );
      case 'cartes':
        return (
          <ul key={index} className="p-cartes" style={{ '--n': bloc.items.length } as CSSProperties}>
            {bloc.items.map((item) => (
              <li key={item.text}>
                <span className="p-carte__image">
                  <EcranCadre focus={item.ecran} />
                </span>
                <Texte {...item} />
              </li>
            ))}
          </ul>
        );
      case 'question':
        return (
          <p key={index} className="p-question">
            <T>{bloc.text}</T>
          </p>
        );
      case 'compromis':
        return (
          <p key={index} className="p-compromis">
            <T>{bloc.text}</T>
          </p>
        );
      case 'decision':
        // Its label and text on the reading measure, its diagram wider, like the section's own.
        return (
          <Fragment key={index}>
            <p className="p-decision__n m-label">
              <T>Décision {bloc.n}</T>
            </p>
            <p className="p-texte">
              <Texte lead={bloc.lead} text={bloc.text} />
            </p>
            <Visuel legende={bloc.visuel} n={figures.get(bloc) ?? 0}>
              {bloc.schema && <Schema id={bloc.schema} />}
            </Visuel>
          </Fragment>
        );
      case 'visuel':
        return (
          <Visuel key={index} legende={bloc.legende} n={figures.get(bloc) ?? 0}>
            {bloc.schema && <Schema id={bloc.schema} />}
          </Visuel>
        );
    }
  });
}

/**
 * The table of contents' tracking, for a page that scrolls in `ref`: the
 * section being read, and a way to scroll to one.
 */
function useSommaire(ref: RefObject<HTMLDivElement | null>, first: string) {
  const [active, setActive] = useState(first);
  // A section chosen in the table of contents stays marked while the page scrolls to it.
  const chosen = useRef<{ id: string; timer: number } | null>(null);

  // The table of contents follows the section being read: the last one whose
  // top has passed a reading line, 30 % down the screen. The last sections can
  // never scroll up to that line, so over the last screen of the page the line
  // slides down to the bottom: at the very end, the last section is the one read.
  useEffect(() => {
    const page = ref.current;
    if (!page) return;
    const release = () => {
      if (chosen.current) window.clearTimeout(chosen.current.timer);
      chosen.current = null;
    };
    const update = () => {
      // After a click, keep the chosen section until the scrolling has stopped.
      if (chosen.current) {
        window.clearTimeout(chosen.current.timer);
        chosen.current.timer = window.setTimeout(release, 200);
        return;
      }
      const left = page.scrollHeight - page.clientHeight - page.scrollTop;
      const end = Math.min(1, Math.max(0, 1 - left / page.clientHeight));
      const line = page.scrollTop + page.clientHeight * (0.3 + 0.7 * end) - 1;
      const sections = [...page.querySelectorAll<HTMLElement>('[data-section]')];
      const current = sections.filter((section) => section.offsetTop <= line).pop() ?? sections[0];
      if (current) setActive(current.dataset.section ?? '');
    };
    update();
    page.addEventListener('scroll', update, { passive: true });
    // The reader takes over: follow the reading again.
    const events = ['wheel', 'touchstart', 'keydown'] as const;
    for (const event of events) page.addEventListener(event, release, { passive: true });
    return () => {
      release();
      page.removeEventListener('scroll', update);
      for (const event of events) page.removeEventListener(event, release);
    };
  }, [ref]);

  const go = (id: string) => {
    const page = ref.current;
    const section = page?.querySelector<HTMLElement>(`[data-section="${id}"]`);
    if (!page || !section) return;
    if (chosen.current) window.clearTimeout(chosen.current.timer);
    chosen.current = { id, timer: window.setTimeout(() => (chosen.current = null), 1200) };
    setActive(id);
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    page.scrollTo({ top: section.offsetTop - page.clientHeight * 0.08, behavior: smooth ? 'smooth' : 'auto' });
  };

  return { active, go };
}

/** Back to the projects: the cursor's agent pointer (step 6), drawn straight, and the page's trail. */
function Retour({ nom, onRetour }: { nom: string; onRetour?: () => void }) {
  return (
    <p className="p-retour m-label">
      <button type="button" onClick={onRetour}>
        <svg className="p-retour__fleche" viewBox="0 0 10 10" aria-hidden="true">
          <polygon points="0,5 10,0 6.5,5 10,10" />
        </svg>
        <T>Projets</T>
      </button>
      <T> / {nom}</T>
    </p>
  );
}

/** The table of contents: numbered, the section being read marked by the accent square. */
function Sommaire({ projet, active, onGo }: { projet: Projet; active: string; onGo: (id: string) => void }) {
  return (
    <ol className="p-sommaire m-label">
      {projet.sections.map((section, index) => (
        <li key={section.id} aria-current={section.id === active ? 'location' : undefined}>
          <button type="button" data-cursor="cube" onClick={() => onGo(section.id)}>
            <span className="p-sommaire__n">{two(index + 1)}</span>
            <T>{section.nav}</T>
          </button>
        </li>
      ))}
    </ol>
  );
}

/** The page's words and pictures: the header, then the sections. */
function Article({ projet, cadrage }: { projet: Projet; cadrage: 'paysage' | 'portrait' }) {
  // Figures are numbered through the page, the hero thumbnail first.
  const figures = new Map<Bloc, number>();
  let count = 1;
  for (const section of projet.sections)
    for (const bloc of section.blocs) if (bloc.type === 'visuel' || bloc.type === 'decision') figures.set(bloc, ++count);

  return (
    <article className="p-contenu">
      <header className="p-entete">
        <h1 className="p-titre">
          <T>{projet.nom}</T>
          <Marque id={projet.logo} className="p-titre__logo" />
        </h1>
        <p className="p-accroche">
          <T>{projet.accroche}</T>
        </p>
        {/* The results first: the key figures, before the cartel; the rest closes the page. */}
        <ul className="p-chiffres" style={{ '--n': projet.chiffres.length } as CSSProperties}>
          {projet.chiffres.map((chiffre) => (
            <li key={chiffre.value}>
              <span className="p-chiffre">
                <T>{chiffre.value}</T>
              </span>
              <T>{chiffre.text}</T>
            </li>
          ))}
        </ul>
        <dl className="p-cartel">
          {projet.cartel.map(([term, value]) => (
            <div key={term}>
              <dt className="m-label">
                <T>{term}</T>
              </dt>
              <dd>
                <T>{value}</T>
              </dd>
            </div>
          ))}
        </dl>
        <Visuel legende={`${projet.nom}, détail de l’aiguillage.`} n={1}>
          <Miniature cadrage={cadrage} />
        </Visuel>
      </header>

      {projet.sections.map((section, index) => (
        <section key={section.id} className="p-section" data-section={section.id}>
          <p className="p-section__n m-label">
            <T>
              {two(index + 1)} — {section.nav}
            </T>
          </p>
          <h2 className="p-section__titre">
            <T>{section.titre}</T>
          </h2>
          <Blocs blocs={section.blocs} figures={figures} />
        </section>
      ))}
    </article>
  );
}

/**
 * A project page in the Vitrine's frame, like Rachel Chen's case studies: the
 * reading down the middle; on the left, the table of contents, which follows
 * the reading; on the right, the name, nav and contact.
 */
export function ProjetMaquette({ projet, onRetour }: { projet: Projet; onRetour?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { active, go } = useSommaire(ref, projet.sections[0].id);

  return (
    <div ref={ref} className="maquette projet">
      <nav className="p-gauche" aria-label="Sommaire">
        <Retour nom={projet.nom} onRetour={onRetour} />
        <Sommaire projet={projet} active={active} onGo={go} />
      </nav>

      <div className="m-side">
        <Name />
        <NavList className="m-nav m-label" />
        <Contact />
      </div>

      <Article projet={projet} cadrage="paysage" />
    </div>
  );
}

/**
 * The same page on a 390 × 844 phone (journal n° 86): the strip on the right,
 * as on the Vitrine; the back link at the top; one column of reading, the
 * figures and cartel stacked, the diagrams scrolling sideways at a readable
 * size. The pictures and diagrams run over the strip, like the Vitrine's
 * (journal n° 87). « Menu » slides in the table of contents above the nav.
 */
export function ProjetMobile({
  projet,
  onRetour,
  menuOpen,
  onMenu,
}: {
  projet: Projet;
  onRetour?: () => void;
  menuOpen: boolean;
  onMenu?: (open: boolean) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { active, go } = useSommaire(ref, projet.sections[0].id);
  // The pictures run over the strip, as on the Vitrine's phone page.
  useTranche(ref, '.p-visuel__image');

  return (
    <div ref={ref} className="mobile projet projet--mobile" data-glisse="">
      <div className="m-strip">
        <Name />
        <button type="button" className="m-label" onClick={() => onMenu?.(true)}>
          <T>Menu</T>
        </button>
      </div>
      <Retour nom={projet.nom} onRetour={onRetour} />
      <Article projet={projet} cadrage="portrait" />
      <div className="m-menu" data-open={menuOpen ? '' : undefined} inert={!menuOpen}>
        <button type="button" className="m-label" onClick={() => onMenu?.(false)}>
          <T>Fermer</T>
        </button>
        <Sommaire
          projet={projet}
          active={active}
          onGo={(id) => {
            onMenu?.(false);
            go(id);
          }}
        />
        <NavList className="m-menu__nav" />
        <Contact />
      </div>
    </div>
  );
}
