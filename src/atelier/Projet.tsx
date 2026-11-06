import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent, RefObject } from 'react';
import { Contact, Name, NavList, T } from './Maquettes';
import { Miniature, PlanArchitecture } from './Miniature';
import type { Bloc, Phrase, Projet } from './projets';
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

/** A picture: one already drawn, or a grey placeholder with what it will show. */
function Visuel({ figure, legende, n }: { figure?: 'miniature' | 'plan'; legende: string; n: number }) {
  return (
    <figure className="p-visuel">
      <span className="p-visuel__image">
        {figure === 'miniature' && <Miniature />}
        {figure === 'plan' && <PlanArchitecture />}
      </span>
      <figcaption className="m-label">
        <T>
          Fig. {two(n)} — {figure ? '' : 'À dessiner : '}
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
      case 'cartes':
        return (
          <ul key={index} className={`p-${bloc.type}`} style={{ '--n': bloc.items.length } as CSSProperties}>
            {bloc.items.map((item) => (
              <li key={item.text}>
                {bloc.type === 'cartes' && <span className="p-carte__image" />}
                <Texte {...item} />
              </li>
            ))}
          </ul>
        );
      case 'chiffres':
        return (
          <ul key={index} className="p-chiffres" style={{ '--n': bloc.items.length } as CSSProperties}>
            {bloc.items.map((item) => (
              <li key={item.value}>
                <span className="p-chiffre">
                  <T>{item.value}</T>
                </span>
                <T>{item.text}</T>
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
        return (
          <div key={index} className="p-decision">
            <p className="p-decision__n m-label">
              <T>Décision {bloc.n}</T>
            </p>
            <p className="p-texte">
              <Texte lead={bloc.lead} text={bloc.text} />
            </p>
            <Visuel legende={bloc.visuel} n={figures.get(bloc) ?? 0} />
          </div>
        );
      case 'visuel':
        return <Visuel key={index} figure={bloc.figure} legende={bloc.legende} n={figures.get(bloc) ?? 0} />;
    }
  });
}

const TICKS = 64;

/**
 * The page's scroll bar, on the left (journal n° 76): a column of fine
 * strokes, like a ruler. The strokes level with the reading stretch into a
 * wave that follows the scroll; the whole column ripples a little as it goes;
 * a stroke marks where each section starts. Click or drag along it to scroll.
 */
function Defilement({ page, sections }: { page: RefObject<HTMLDivElement | null>; sections: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [marks, setMarks] = useState<number[]>([]);

  useEffect(() => {
    const scroller = page.current;
    const ruler = ref.current;
    if (!scroller || !ruler) return;
    const ticks = [...ruler.querySelectorAll<HTMLElement>('.p-trait')];
    let frame = 0;

    const draw = () => {
      frame = 0;
      const range = scroller.scrollHeight - scroller.clientHeight;
      const progress = range > 0 ? scroller.scrollTop / range : 0;
      const at = progress * (TICKS - 1);
      ticks.forEach((tick, index) => {
        const d = (index - at) / 4.5;
        const wave = Math.exp(-d * d);
        const ripple = 0.5 + 0.5 * Math.sin(index * 0.45 - progress * Math.PI * 6);
        tick.style.setProperty('--long', (0.18 + 0.1 * ripple + 0.72 * wave).toFixed(3));
        tick.style.setProperty('--fort', (0.3 + 0.7 * wave).toFixed(3));
        tick.toggleAttribute('data-ici', Math.round(at) === index);
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    // Where each section starts, as a stroke of the ruler.
    const measure = () => {
      const range = scroller.scrollHeight - scroller.clientHeight;
      const starts = [...scroller.querySelectorAll<HTMLElement>('[data-section]')].map((section) =>
        Math.round(Math.min(1, Math.max(0, (section.offsetTop - scroller.clientHeight * 0.08) / range)) * (TICKS - 1)),
      );
      setMarks(starts);
      schedule();
    };

    measure();
    scroller.addEventListener('scroll', schedule, { passive: true });
    const resize = new ResizeObserver(measure);
    resize.observe(scroller);
    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener('scroll', schedule);
      resize.disconnect();
    };
  }, [page, sections]);

  // Click or drag: the page follows the pointer along the ruler.
  const scrub = (event: ReactPointerEvent<HTMLDivElement>) => {
    const scroller = page.current;
    if (!scroller) return;
    const box = event.currentTarget.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (event.clientY - box.top) / box.height));
    scroller.scrollTo({ top: progress * (scroller.scrollHeight - scroller.clientHeight) });
  };

  return (
    <div
      ref={ref}
      className="p-defilement"
      data-cursor="defilement"
      aria-hidden="true"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        scrub(event);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) scrub(event);
      }}
    >
      {Array.from({ length: TICKS }, (_, index) => (
        <span key={index} className="p-trait" data-jalon={marks.includes(index) ? '' : undefined} />
      ))}
    </div>
  );
}

/**
 * A project page in the Vitrine's frame, like Rachel Chen's case studies: the
 * reading down the middle; on the left, the scroll bar and the table of
 * contents, which follows the reading; on the right, the name, nav and contact.
 */
export function ProjetMaquette({ projet }: { projet: Projet }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(projet.sections[0].id);

  // Figures are numbered through the page, the hero thumbnail first.
  const figures = new Map<Bloc, number>();
  let count = 1;
  for (const section of projet.sections)
    for (const bloc of section.blocs) if (bloc.type === 'visuel' || bloc.type === 'decision') figures.set(bloc, ++count);

  // The table of contents follows the section being read.
  useEffect(() => {
    const page = ref.current;
    if (!page) return;
    const update = () => {
      const line = page.scrollTop + page.clientHeight * 0.3;
      const sections = [...page.querySelectorAll<HTMLElement>('[data-section]')];
      const current = sections.filter((section) => section.offsetTop <= line).pop() ?? sections[0];
      if (current) setActive(current.dataset.section ?? '');
    };
    update();
    page.addEventListener('scroll', update, { passive: true });
    return () => page.removeEventListener('scroll', update);
  }, []);

  const go = (id: string) => {
    const page = ref.current;
    const section = page?.querySelector<HTMLElement>(`[data-section="${id}"]`);
    if (!page || !section) return;
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    page.scrollTo({ top: section.offsetTop - page.clientHeight * 0.08, behavior: smooth ? 'smooth' : 'auto' });
  };

  return (
    <div ref={ref} className="maquette projet">
      <nav className="p-gauche" aria-label="Sommaire">
        <Defilement page={ref} sections={projet.sections.length} />
        <ol className="p-sommaire m-label">
          {projet.sections.map((section, index) => (
            <li key={section.id} aria-current={section.id === active ? 'location' : undefined}>
              <button type="button" data-cursor="cube" onClick={() => go(section.id)}>
                <span className="p-sommaire__n">{two(index + 1)}</span>
                <T>{section.nav}</T>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="m-side">
        <Name />
        <NavList className="m-nav m-label" />
        <Contact />
      </div>

      <article className="p-contenu">
        <header className="p-entete">
          <p className="p-fil m-label">
            <T>Projets / {projet.nom}</T>
          </p>
          <h1 className="p-titre">
            <T>{projet.nom}</T>
          </h1>
          <p className="p-accroche">
            <T>{projet.accroche}</T>
          </p>
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
          <Visuel figure="miniature" legende={`${projet.nom}, détail de l’aiguillage.`} n={1} />
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
    </div>
  );
}
