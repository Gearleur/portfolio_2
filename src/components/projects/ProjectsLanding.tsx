import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { selectedProjects } from '../../data/projects';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useFullscreenDialog } from '../../hooks/useFullscreenDialog';
import { BackButton } from './BackButton';
import { useCurtainExit } from './useCurtainExit';
import { ProjectImmersive } from './ProjectImmersive';
import './projectsLanding.css';

const SCRAMBLE_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%*+=<>/';

/** Airport split-flap / departure-board reveal: glyphs cycle, then lock left to right. */
function useScramble(text: string, active: boolean, gentle = false) {
  const [scrambled, setScrambled] = useState<string | null>(null);

  useEffect(() => {
    if (!active || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    if (gentle) {
      const characters = Array.from(text);
      const mutableIndexes = characters
        .map((character, index) => (character === ' ' ? -1 : index))
        .filter((index) => index >= 0);
      let tick = 0;
      const reset = window.setTimeout(() => setScrambled(text), 0);

      const interval = window.setInterval(() => {
        if (tick >= 12 || mutableIndexes.length === 0) {
          window.clearInterval(interval);
          setScrambled(text);
          return;
        }

        const next = [...characters];
        const animatedCharacters = tick % 2 === 0 ? 2 : 1;
        for (let character = 0; character < animatedCharacters; character += 1) {
          const index = mutableIndexes[Math.floor(Math.random() * mutableIndexes.length)];
          next[index] = SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
        }
        setScrambled(next.join(''));
        tick += 1;
      }, 110);

      return () => {
        window.clearTimeout(reset);
        window.clearInterval(interval);
      };
    }

    const targets = Array.from(text).map((char, index) => ({
      char,
      lockFrame: 2 + Math.floor(index * 0.5) + Math.floor(Math.random() * 3),
    }));

    let frame = 0;
    const interval = setInterval(() => {
      let next = '';
      let locked = 0;
      for (const target of targets) {
        if (target.char === ' ') {
          next += ' ';
          locked += 1;
        } else if (frame >= target.lockFrame) {
          next += target.char;
          locked += 1;
        } else {
          next += SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
        }
      }
      setScrambled(next);
      frame += 1;
      if (locked === targets.length) {
        clearInterval(interval);
      }
    }, 22);

    return () => clearInterval(interval);
  }, [active, gentle, text]);

  // Plain title when idle; the scrambling output only applies while active.
  return active ? (scrambled ?? text) : text;
}

function ScrambleTitle({ text, active, gentle }: { text: string; active: boolean; gentle: boolean }) {
  const output = useScramble(text, active, gentle);
  return (
    <span className="yc-item__title">
      <span aria-hidden="true">{output}</span>
      <span className="visually-hidden">{text}</span>
    </span>
  );
}

type ProjectsLandingProps = {
  onBack?: () => void;
  onSelect?: (projectId: string) => void;
};

export function ProjectsLanding({ onBack, onSelect }: ProjectsLandingProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [animatedId, setAnimatedId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width: 720px)');
  const { phaseClass, requestClose, handleTransitionEnd } = useCurtainExit(() => onBack?.());
  const dialogRef = useRef<HTMLDivElement>(null);

  const activeProject = selectedProjects.find((project) => project.id === activeId) ?? null;
  const openIndex = selectedProjects.findIndex((project) => project.id === openId);
  const openProject = openIndex >= 0 ? selectedProjects[openIndex] : null;
  useFullscreenDialog({
    backgroundSelector: '#portfolio-content',
    enabled: !openProject,
    onClose: requestClose,
    ref: dialogRef,
  });

  useEffect(() => {
    if (!isMobile || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const projectIds = selectedProjects.map((project) => project.id);
    const introOrder = [...projectIds].sort(() => Math.random() - 0.5);
    const timers: number[] = [];
    let ambientTimer = 0;
    let lastId: string | null = null;

    const animate = (projectId: string) => {
      lastId = projectId;
      setAnimatedId(projectId);
      timers.push(window.setTimeout(() => setAnimatedId(null), 1450));
    };

    introOrder.forEach((projectId, index) => {
      timers.push(window.setTimeout(() => animate(projectId), 220 + index * 1550));
    });

    const scheduleAmbientAnimation = () => {
      const delay = 6000 + Math.random() * 2000;
      ambientTimer = window.setTimeout(() => {
        const candidates = projectIds.filter((projectId) => projectId !== lastId);
        const projectId = candidates[Math.floor(Math.random() * candidates.length)] ?? projectIds[0];
        animate(projectId);
        scheduleAmbientAnimation();
      }, delay);
    };

    timers.push(window.setTimeout(scheduleAmbientAnimation, 220 + introOrder.length * 1550));

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(ambientTimer);
    };
  }, [isMobile]);

  const handleSelect = (projectId: string) => {
    setOpenId(projectId);
    onSelect?.(projectId);
  };

  return createPortal(
    <div
      ref={dialogRef}
      className={`yc-projects${phaseClass ? ` ${phaseClass}` : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="projects-dialog-title"
      tabIndex={-1}
      onTransitionEnd={handleTransitionEnd}
    >
      <header className="yc-projects__bar">
        <BackButton label="back" onClick={requestClose} />
        <p className="yc-projects__eyebrow" id="projects-dialog-title">Selected work — 2022 / 2026</p>
      </header>

      <div className="yc-projects__body">
        <ol className="yc-list" onMouseLeave={() => setActiveId(null)}>
          {selectedProjects.map((project, index) => (
            <li className="yc-list__row" key={project.id}>
              <button
                className={`yc-item${activeId === project.id ? ' is-active' : ''}`}
                type="button"
                onMouseEnter={() => setActiveId(project.id)}
                onFocus={() => setActiveId(project.id)}
                onClick={() => handleSelect(project.id)}
                aria-label={`Open project ${project.title}`}
              >
                <span className="yc-item__index">{String(index + 1).padStart(2, '0')}</span>
                <ScrambleTitle
                  text={project.title}
                  active={isMobile ? animatedId === project.id : activeId === project.id}
                  gentle={isMobile}
                />
                <span className="yc-item__year">{project.period}</span>
              </button>
            </li>
          ))}
        </ol>

        <aside className="yc-detail" aria-live="polite">
          {activeProject ? (
            <div className="yc-detail__card">
              <p className="yc-detail__meta">
                {activeProject.affiliation ? `${activeProject.affiliation} — ` : ''}
                {activeProject.period}
              </p>
              <p className="yc-detail__summary">{activeProject.summary}</p>
              <ul className="yc-detail__stack">
                {activeProject.stack.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="yc-detail__hint">[ hover an index ]</p>
          )}
        </aside>
      </div>

      {openProject ? (
        <ProjectImmersive project={openProject} index={openIndex} onClose={() => setOpenId(null)} />
      ) : null}
    </div>,
    document.body,
  );
}
