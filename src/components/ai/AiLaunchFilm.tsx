import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { profile } from '../../data/profile';
import { DocumentGlobe } from './DocumentGlobe';
import './aiLaunchFilm.css';

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const chapters = ['L’idée', 'L’intention', 'L’espace', 'La construction', 'Les systèmes', 'La conversation', 'Vos équipes', 'Le temps', 'Votre réalité'];
const cards = ['Brief projet', 'Recherche.pdf', 'Synthèse', 'Nouveau message', 'Données.csv', 'Prochaine étape'];

function Artifact({ kind, label, className = '' }: { kind: number; label: string; className?: string }) {
  return <div className={`film-artifact film-artifact--${kind % 4} ${className}`}>
    <div className="film-artifact__bar"><i /><i /><i /><span>{label}</span></div>
    {kind % 4 === 0 ? <><span className="film-file-tag">PDF</span><strong>Du contexte.<br />Une direction.</strong><div className="film-lines"><i /><i /><i /><i /></div></>
      : kind % 4 === 1 ? <><div className="film-chat-bubble">On avance sur l’idée ?</div><div className="film-chat-bubble film-chat-bubble--reply">Oui. Voici la suite.</div><span className="film-typing">● ● ●</span></>
      : kind % 4 === 2 ? <><div className="film-chart">{[35, 55, 42, 72, 58, 90, 78].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</div><span className="film-caption">Une vue d’ensemble.</span></>
      : <><div className="film-mail"><span>↗</span><div><strong>Prochaine étape</strong><p>Tout est prêt pour votre regard.</p></div></div><div className="film-lines"><i /><i /><i /></div><span className="film-mail-tag">Brouillon · à valider</span></>}
  </div>;
}

function Waveform() {
  return <div className="film-wave" aria-hidden="true">{Array.from({ length: 35 }, (_, i) => <i key={i} style={{ '--wave-height': `${10 + Math.abs(Math.sin(i * .85) * Math.cos(i * .29)) * 60}px`, '--delay': `${i * -53}ms` } as CSSProperties} />)}</div>;
}

export function AiLaunchFilm() {
  const root = useRef<HTMLElement>(null);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [position, setPosition] = useState(0);
  const [onScreen, setOnScreen] = useState(false);
  const [validated, setValidated] = useState(false);
  const [simplified, setSimplified] = useState(false);
  const chapter = Math.min(8, Math.floor(position));
  const local = position - chapter;

  useEffect(() => {
    const el = root.current;
    const scroller = el?.closest('.ai-page');
    if (!el || !scroller) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const viewport = scroller.getBoundingClientRect();
      const extent = el.offsetHeight - scroller.clientHeight;
      setPosition(reduced ? 0 : Math.min(8.999, clamp((viewport.top - rect.top) / extent) * 9));
      setOnScreen(rect.top < viewport.bottom && rect.bottom > viewport.top);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    scroller.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => { cancelAnimationFrame(frame); scroller.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
  }, [reduced]);

  const scene = (index: number, className: string, children: ReactNode) => {
    const p = reduced ? .6 : clamp(position - index);
    const entering = index === 0 ? 1 : clamp((position - index + .12) / .24);
    const leaving = index === 8 ? 1 : 1 - clamp((position - index - .84) / .16);
    const visible = reduced || (position > index - .12 && position < index + 1);
    return <section className={`film-scene ${className}`} data-scene={index} data-active={reduced || chapter === index} inert={!reduced && chapter !== index} aria-hidden={!reduced && chapter !== index}
      style={{ '--p': p, '--in': reduced ? 1 : entering, '--out': reduced ? 0 : 1 - leaving, opacity: reduced ? 1 : entering * leaving, visibility: visible ? 'visible' : 'hidden' } as CSSProperties}>{children}</section>;
  };

  return <section className={`launch-film${reduced ? ' launch-film--reduced' : ''}`} ref={root} aria-label="De l’idée à de nouvelles façons de travailler" data-chapter={chapter}>
    <div className="launch-film__stage">
      <div className="film-thread" aria-hidden="true"><i style={{ transform: `translateX(${chapter * 14}px)` }} /> <span>{'{'} intention → action {'}'}</span></div>
      {scene(0, 'film-idea', <>
        <div className="film-idea__copy"><span className="film-kicker">ET SI…</span><h2>Le travail avançait<br />aussi vite que vos <em>idées ?</em></h2></div>
        <div className="film-idea__globe"><DocumentGlobe progress={reduced ? 1 : clamp(local * 2)} active={onScreen && chapter === 0} reducedMotion={reduced} /></div>
        <span className="film-note">Vos informations. Vos échanges. Vos outils.</span>
      </>)}
      {scene(1, 'film-intention', <>
        <div className="film-heading"><span className="film-kicker">01 / UNE INTENTION SUFFIT</span><h2>Vous exprimez<br />un objectif.</h2><p>Vos outils se mettent au travail.<br /><strong>Vous gardez la main.</strong></p></div>
        <div className="film-workflow">
          <div className="film-prompt"><span className="film-prompt__spark">✳</span><span>Prépare la prochaine étape.</span><span className="film-prompt__send">↑</span></div>
          <div className="film-workflow__wire" />
          <div className="film-steps">{['Rechercher', 'Préparer', 'Vérifier'].map((text, i) => <div key={text} style={{ '--step': i } as CSSProperties}><span>0{i + 1}</span><strong>{text}</strong><i>✓</i></div>)}</div>
          <div className="film-result"><span>↳</span><div><strong>Une prochaine étape, prête.</strong><p>La décision vous appartient.</p></div><button onClick={() => setValidated(!validated)} aria-pressed={validated}>{validated ? 'Validé ✓' : 'Valider ↗'}</button></div>
        </div>
      </>)}
      {scene(2, 'film-space', <>
        <div className="film-space__clutter" aria-hidden="true">{cards.map((label, i) => <div key={label} style={{ '--i': i } as CSSProperties}><Artifact kind={i} label={label} /></div>)}</div>
        <div className="film-space__copy"><span>Moins de manipulations.</span><span>Moins d’attente.</span><h2>Plus de temps pour<br /><em>créer, décider,<br />avancer.</em></h2></div>
      </>)}
      {scene(3, 'film-builder', <>
        <span className="film-builder__orbit film-builder__orbit--one" aria-hidden="true" /><span className="film-builder__orbit film-builder__orbit--two" aria-hidden="true" />
        <div className="film-builder__copy"><span className="film-kicker">DE L’AMBITION À LA CONSTRUCTION</span><h2>C’est ce que<br />je construis<br /><em>avec l’IA.</em></h2><span className="film-signature"><i />{profile.name}<small>Conception & développement IA</small></span></div>
        <div className="film-builder__symbols" aria-hidden="true"><span>{'{ }'}</span><span>↗</span><span>01</span><span>✳</span></div>
      </>)}
      {scene(4, 'film-systems', <>
        <div className="film-heading"><span className="film-kicker">02 / DES SYSTÈMES QUI FONT LE LIEN</span><h2>De l’intention<br />à <em>l’action.</em></h2><p>Des systèmes qui prennent en charge les tâches répétitives.<br />Qui font circuler les connaissances.<br />Qui vous aident à passer plus vite de l’intention à l’action.</p></div>
        <div className="film-system-map" aria-hidden="true"><div className="film-sources"><Artifact kind={0} label="Source.pdf" /><Artifact kind={3} label="Contexte · e-mail" /><Artifact kind={2} label="Données.csv" /></div><div className="film-system-map__link"><i /><span>✳</span><i /></div><div className="film-answer"><span className="film-kicker">LES CONNAISSANCES CIRCULENT</span><strong>Une réponse.<br />Son contexte.<br />Ses sources.</strong><div className="film-source-tags"><span>[1] Document</span><span>[2] Échange</span></div><div className="film-answer__action">Préparer la suite <span>↗</span></div></div></div>
      </>)}
      {scene(5, 'film-conversation', <>
        <div className="film-conversation__heading"><span className="film-kicker">DE NOUVELLES FAÇONS DE TRAVAILLER</span><h2>Une interface<br />à qui l’on <em>parle.</em></h2></div>
        <div className="film-conversation__ui"><Waveform /><div className="film-conversation__request">« Donne une forme à cette idée. »</div><div className={`film-live-result${simplified ? ' is-simple' : ''}`}><span className="film-live-result__label">VOTRE IDÉE, EN DIRECT</span><strong>{simplified ? 'Une idée. Une suite.' : 'Une intention prend forme.'}</strong><div className="film-live-result__blocks"><i /><i /><i /></div><div className="film-live-result__bottom"><span>Préciser</span><span>Préparer</span><span>Avancer ↗</span></div></div><button className="film-refine" aria-pressed={simplified} onClick={() => setSimplified(!simplified)}>{simplified ? 'Revenir à l’idée ↺' : 'Fais plus simple ↗'}</button></div>
        <p className="film-conversation__caption">Une idée que l’on précise en direct.<br />Des actions qui s’enchaînent dans une même conversation.</p>
      </>)}
      {scene(6, 'film-teams', <>
        <div className="film-team-windows" aria-hidden="true">{['Concevoir', 'Partager', 'Décider', 'Construire'].map((label, i) => <Artifact kind={i} label={label} key={label} className={`film-team-window--${i}`} />)}</div>
        <h2>Imaginez ce que<br />vos équipes pourraient<br /><em>accomplir…</em></h2>
      </>)}
      {scene(7, 'film-time', <>
        <span className="film-kicker">AVEC DAVANTAGE DE</span><h2>temps<span>.</span></h2><p>Pour leur métier.</p><div className="film-time__line" aria-hidden="true"><i /></div>
      </>)}
      {scene(8, 'film-real', <>
        <div className="film-real__copy"><span className="film-kicker">VOTRE RÉALITÉ, COMME POINT DE DÉPART.</span><h2>Je conçois et développe<br />les outils pour rendre<br /><em>cela possible.</em></h2><p>Avec vos méthodes,<br />vos contraintes,<br />vos ambitions.</p></div>
        <div className="film-real__diagram" aria-hidden="true"><div>Votre idée<span>↘</span></div><div className="film-real__core">Concevoir.<br />Tester.<br />Construire.</div><div><span>↗</span>Ce qui fonctionne.</div></div>
      </>)}
      <nav className="film-progress" aria-label="Scènes de la présentation">
        {chapters.map((label, i) => <button key={label} aria-label={`Scène ${i + 1} : ${label}`} aria-current={chapter === i ? 'step' : undefined} onClick={() => {
          const el = root.current; const scroller = el?.closest('.ai-page'); if (!el || !scroller) return;
          if (reduced) { el.querySelector(`[data-scene="${i}"]`)?.scrollIntoView({ block: 'start' }); return; }
          const top = scroller.scrollTop + el.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
          scroller.scrollTo({ top: top + ((i + .25) / 9) * (el.offsetHeight - scroller.clientHeight), behavior: 'instant' });
        }}><span /> <small>{String(i + 1).padStart(2, '0')}</small></button>)}
      </nav>
      <span className="film-chapter-label" aria-hidden="true">{String(chapter + 1).padStart(2, '0')} / {chapters[chapter]} <span>↓</span></span>
    </div>
  </section>;
}
