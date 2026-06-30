import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { selectedProjects } from '../../data/projects';
import { BackButton } from './BackButton';
import { useCurtainExit } from './useCurtainExit';
import { ProjectImmersive } from './ProjectImmersive';
import './projectsLanding.css';

const SCRAMBLE_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%*+=<>/';

/** Airport split-flap / departure-board reveal: glyphs cycle, then lock left to right. */
function useScramble(text: string, active: boolean) {
  const [scrambled, setScrambled] = useState<string | null>(null);

  useEffect(() => {
    if (!active) {
      return;
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
  }, [active, text]);

  // Plain title when idle; the scrambling output only applies while active.
  return active ? (scrambled ?? text) : text;
}

function ScrambleTitle({ text, active }: { text: string; active: boolean }) {
  const output = useScramble(text, active);
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
  const [openId, setOpenId] = useState<string | null>(null);
  const { phaseClass, requestClose, handleTransitionEnd } = useCurtainExit(() => onBack?.());

  const activeProject = selectedProjects.find((project) => project.id === activeId) ?? null;
  const openIndex = selectedProjects.findIndex((project) => project.id === openId);
  const openProject = openIndex >= 0 ? selectedProjects[openIndex] : null;

  const handleSelect = (projectId: string) => {
    setOpenId(projectId);
    onSelect?.(projectId);
  };

  return createPortal(
    <div
      className={`yc-projects${phaseClass ? ` ${phaseClass}` : ''}`}
      onTransitionEnd={handleTransitionEnd}
    >
      <header className="yc-projects__bar">
        <BackButton label="back" onClick={requestClose} />
        <p className="yc-projects__eyebrow">Selected work — 2022 / 2026</p>
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
                <ScrambleTitle text={project.title} active={activeId === project.id} />
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
