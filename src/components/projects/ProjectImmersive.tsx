import { useRef } from 'react';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import type { SelectedProject } from '../../data/projects';
import { useFullscreenDialog } from '../../hooks/useFullscreenDialog';
import { BackButton } from './BackButton';
import { ProjectCaseStudy } from './ProjectCaseStudy';
import { useCurtainExit } from './useCurtainExit';
import './caseStudy.css';

type ProjectImmersiveProps = {
  project: SelectedProject;
  index: number;
  onClose: () => void;
};

function revealDelay(step: number): CSSProperties {
  return { '--reveal-delay': `${120 + step * 90}ms` } as CSSProperties;
}

export function ProjectImmersive({ project, index, onClose }: ProjectImmersiveProps) {
  const { phaseClass, requestClose, handleTransitionEnd } = useCurtainExit(onClose);
  const scrollRef = useRef<HTMLDivElement>(null);
  useFullscreenDialog({
    backgroundSelector: '.yc-projects',
    onClose: requestClose,
    ref: scrollRef,
  });

  const lead = project.presentation?.intro ?? project.summary;

  return createPortal(
    <div
      ref={scrollRef}
      className={`yc-immersive${phaseClass ? ` ${phaseClass}` : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      tabIndex={-1}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className="yc-immersive__inner">
        <header className="yc-immersive__bar yc-immersive__stagger" style={revealDelay(0)}>
          <BackButton label="index" onClick={requestClose} />
          <p className="yc-immersive__tag">Project {String(index + 1).padStart(2, '0')}</p>
        </header>

        <div className="yc-immersive__hero yc-immersive__stagger" style={revealDelay(1)}>
          <p className="yc-immersive__meta">
            {project.affiliation ? `${project.affiliation} — ` : ''}
            {project.period}
          </p>
          <h2 className="yc-immersive__title">{project.title}</h2>
        </div>

        {project.caseStudy ? (
          <div className="yc-immersive__fade" style={revealDelay(2)}>
            <ProjectCaseStudy caseStudy={project.caseStudy} scrollRef={scrollRef} />
          </div>
        ) : (
          <>
            <p className="yc-immersive__lead yc-immersive__stagger" style={revealDelay(2)}>
              {lead}
            </p>

            <section className="yc-immersive__block yc-immersive__stagger" style={revealDelay(3)}>
              <h3 className="yc-immersive__label">Highlights</h3>
              <ul className="yc-immersive__bullets">
                {project.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </section>
          </>
        )}

        <section className="yc-immersive__block yc-immersive__stagger" style={revealDelay(4)}>
          <h3 className="yc-immersive__label">Stack</h3>
          <ul className="yc-immersive__stack">
            {project.stack.map((technology) => (
              <li key={technology}>{technology}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>,
    document.body,
  );
}
