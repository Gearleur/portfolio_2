import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { profile } from '../../data/profile';
import { SmoothMatrixButton } from './SmoothMatrixButton';
import './aiFinale.css';

const clamp = (value: number) => Math.max(0, Math.min(1, value));

type Grid = { cols: number; rows: number; cellSize: number };
const initialGrid: Grid = { cols: 8, rows: 5, cellSize: 180 };

export function AiFinale() {
  const root = useRef<HTMLElement>(null);
  const playground = useRef<HTMLDivElement>(null);
  const contact = useRef<HTMLDivElement>(null);
  const tiles = useRef<HTMLDivElement>(null);
  const opened = useRef(new Set<number>());
  const pending = useRef(new Map<number, number>());
  const [grid, setGrid] = useState<Grid>(initialGrid);
  const measuredGrid = useRef(initialGrid);
  const [revealedCount, setRevealedCount] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [coarse, setCoarse] = useState(false);
  const total = grid.cols * grid.rows;
  const complete = revealedCount >= total;

  const openCell = useCallback((index: number, delay = 0) => {
    if (index < 0 || index >= grid.cols * grid.rows || opened.current.has(index) || pending.current.has(index)) return;
    const reveal = () => {
      pending.current.delete(index);
      opened.current.add(index);
      const tile = tiles.current?.children[index] as HTMLElement | undefined;
      if (tile) tile.dataset.open = 'true';
      setRevealedCount(opened.current.size);
    };
    if (delay === 0) reveal();
    else pending.current.set(index, window.setTimeout(reveal, delay));
  }, [grid]);

  useEffect(() => {
    const section = playground.current;
    if (!section) return;
    const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointerMedia = window.matchMedia('(hover: none), (pointer: coarse)');
    const preferences = () => {
      setReduced(motionMedia.matches);
      setCoarse(pointerMedia.matches);
    };
    preferences();
    motionMedia.addEventListener('change', preferences);
    pointerMedia.addEventListener('change', preferences);
    const observer = new ResizeObserver(() => {
      if (!section.clientWidth || !section.clientHeight) return;
      const cols = section.clientWidth < 640 ? 4 : section.clientWidth < 1100 ? 6 : 8;
      const cellSize = section.clientWidth / cols;
      const rows = Math.ceil(section.clientHeight / cellSize);
      const previous = measuredGrid.current;
      if (previous.cols === cols && previous.rows === rows && previous.cellSize === cellSize) return;
      if (previous.cols !== cols || previous.rows !== rows) {
        pending.current.forEach(window.clearTimeout);
        pending.current.clear();
        opened.current.clear();
        setRevealedCount(0);
      }
      measuredGrid.current = { cols, rows, cellSize };
      setGrid(measuredGrid.current);
    });
    observer.observe(section);
    const timers = pending.current;
    return () => {
      observer.disconnect();
      motionMedia.removeEventListener('change', preferences);
      pointerMedia.removeEventListener('change', preferences);
      timers.forEach(window.clearTimeout);
      timers.clear();
    };
  }, []);

  useEffect(() => {
    const section = root.current;
    const play = playground.current;
    const ending = contact.current;
    const scroller = section?.closest('.ai-page');
    if (!section || !play || !ending || !scroller) return;
    let frame = 0;
    let seeded = false;
    const update = () => {
      frame = 0;
      const viewport = scroller.getBoundingClientRect();
      const playRect = play.getBoundingClientRect();
      const endRect = ending.getBoundingClientRect();
      const playProgress = clamp((viewport.bottom - playRect.top) / (viewport.height * 1.6));
      const contactProgress = reduced ? 1 : clamp((viewport.bottom - endRect.top - viewport.height * .08) / (viewport.height * .72));
      ending.style.setProperty('--contact-progress', String(contactProgress));
      ending.dataset.visible = String(reduced || contactProgress > .02);
      if (playRect.top < viewport.bottom && playRect.bottom > viewport.top) {
        if (!seeded && !coarse && !reduced) {
          seeded = true;
          [grid.cols + 1, (grid.rows - 2) * grid.cols + grid.cols - 2, Math.floor(grid.rows / 2) * grid.cols + Math.floor(grid.cols / 2)].forEach((index, i) => openCell(index, i * 140));
        }
        if (coarse || reduced) {
          for (let i = 0; i < total; i++) {
            const col = i % grid.cols;
            const row = Math.floor(i / grid.cols);
            const threshold = .32 + (col / Math.max(1, grid.cols - 1)) * .27 + row * .018;
            if (reduced || playProgress > threshold) openCell(i);
          }
        }
      }
    };
    const queue = () => { if (!frame) frame = requestAnimationFrame(update); };
    // A single frame reads layout; pointer exploration never starts a render loop.
    queue();
    scroller.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
    };
  }, [coarse, grid, openCell, reduced, total]);

  const explore = (index: number) => {
    if (reduced || coarse) return;
    openCell(index);
    if (index % grid.cols < grid.cols - 1) openCell(index + 1, 100);
    if (index + grid.cols < total) openCell(index + grid.cols, 190);
  };

  const continueToContact = () => {
    contact.current?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
    contact.current?.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: true });
  };

  return (
    <section ref={root} className={`ai-finale${reduced ? ' ai-finale--reduced' : ''}`} aria-label="Construisons la suite">
      <div className="ai-finale__gradient" aria-hidden="true" />
      <div className={`ai-finale__playground${complete ? ' is-complete' : ''}`} ref={playground} style={{ '--cell-size': `${grid.cellSize}px` } as CSSProperties}>
        <div className="ai-finale__tiles" ref={tiles} aria-hidden="true" style={{ gridTemplateColumns: `repeat(${grid.cols}, 1fr)` }}>
          {Array.from({ length: total }, (_, index) => (
            <div className="ai-finale__tile" key={`${grid.cols}-${grid.rows}-${index}`} onPointerEnter={(event) => { if (event.pointerType === 'mouse' || event.pointerType === 'pen') explore(index); }}>
              {index % 11 === 3 && <span className="ai-finale__tile-glyph">{['+', '·', '↗'][Math.floor(index / 11) % 3]}</span>}
            </div>
          ))}
        </div>
        <div className="ai-finale__lines" aria-hidden="true" />
        <div className="ai-finale__play-label"><span aria-hidden="true">[ + ]</span> Un peu d’espace.</div>
        <div className="ai-finale__play-footer">
          <p className="ai-finale__hint">{complete ? 'La suite est ouverte.' : coarse ? 'Défilez pour ouvrir la suite.' : 'Survolez. Laissez une trace.'}<span>{String(revealedCount).padStart(2, '0')} / {String(total).padStart(2, '0')}</span></p>
          <button className="ai-finale__continue" onClick={continueToContact}>Passer au contact <span aria-hidden="true">↓</span></button>
        </div>
      </div>
      <div className="ai-finale__contact" ref={contact}>
        <div className="ai-finale__contact-title">
          <p>De votre idée à ce qui fonctionne.</p>
          <h2>Construisons<br />la suite.</h2>
        </div>
        <div className="ai-finale__links">
          <SmoothMatrixButton href={`mailto:${profile.email}`} tone="orange">M’écrire ↗</SmoothMatrixButton>
          <SmoothMatrixButton href={profile.linkedinUrl} target="_blank" rel="noreferrer" tone="blue">LinkedIn ↗</SmoothMatrixButton>
        </div>
        <div className="ai-finale__identity"><strong>{profile.name}</strong><a href={`mailto:${profile.email}`}>{profile.email}</a></div>
        <span className="ai-finale__end-glyph" aria-hidden="true">[ ↗ ]</span>
      </div>
    </section>
  );
}
