import { useEffect, useRef, useState, type ReactNode } from 'react';
import './aiEntrance.css';
import { AsciiGlitches } from './AsciiGlitches';

type Phase = 'desktop' | 'entering' | 'ai' | 'leaving';

export function AiEntrance({ children }: { children: (open: () => void) => ReactNode }) {
  const [phase, setPhase] = useState<Phase>('desktop');
  const title = useRef<HTMLHeadingElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const active = phase !== 'desktop';
  const page = useRef<HTMLElement>(null);

  useEffect(() => {
    if (phase !== 'entering' && phase !== 'leaving') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timeout = window.setTimeout(() => {
      setPhase(phase === 'entering' ? 'ai' : 'desktop');
    }, reduced ? 30 : 1100);
    return () => window.clearTimeout(timeout);
  }, [phase]);

  useEffect(() => {
    if (phase === 'ai') title.current?.focus({ preventScroll: true });
    if (phase === 'desktop') {
      opener.current?.focus({ preventScroll: true });
      page.current?.scrollTo(0, 0);
    }
  }, [phase]);

  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPhase('leaving');
    };
    window.addEventListener('keydown', close);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', close);
    };
  }, [active]);

  const open = () => {
    if (phase !== 'desktop') return;
    setPhase('entering');
  };

  return (
    <div className="ai-entrance" data-phase={phase}>
      <div className="ai-origin" inert={active} aria-hidden={active}
        onClickCapture={(event) => {
          const target = event.target as HTMLElement;
          const launch = target.closest<HTMLButtonElement>('.ai-launch');
          if (launch) {
            opener.current = launch;
            launch.blur();
          }
        }}>
        {children(open)}
      </div>
      <section className="ai-page" ref={page} aria-labelledby="ai-title" inert={phase !== 'ai'} aria-hidden={phase !== 'ai'}>
        {phase === 'ai' && <AsciiGlitches />}
        <button className="ai-back" onClick={() => setPhase('leaving')}>
          <span aria-hidden="true">←</span> Retour au bureau
        </button>
        <div className="ai-intro">
          <h1 id="ai-title" ref={title} tabIndex={-1}>Parlons de l’IA<span className="ai-title-dot">.</span></h1>
        </div>
      </section>
    </div>
  );
}
