import { useState } from 'react';
import { selectedProjects } from '../../data/projects';
import { ProjectPresentation } from './ProjectPresentation';
import { useProjectCarousel } from './useProjectCarousel';
import './projects.css';

const EMPTY_CHANNEL_COUNT = 3;

export function ProjectsPanel() {
  const [isProjectChannelOpen, setIsProjectChannelOpen] = useState(false);
  const [isProjectStarted, setIsProjectStarted] = useState(false);
  const {
    beginSwipe,
    cancelSwipe,
    endSwipe,
    selectedIndex,
    selectedProject,
    selectedProjectId,
    selectNextProject,
    selectPreviousProject,
    selectProject,
  } = useProjectCarousel(selectedProjects);

  if (!selectedProject) {
    return null;
  }

  const openProjectChannel = (projectId: string) => {
    selectProject(projectId);
    setIsProjectStarted(false);
    setIsProjectChannelOpen(true);
  };

  const openSelectedProjectChannel = () => {
    setIsProjectStarted(false);
    setIsProjectChannelOpen(true);
  };

  const closeProjectChannel = () => {
    setIsProjectStarted(false);
    setIsProjectChannelOpen(false);
  };

  const goToPreviousProject = () => {
    selectPreviousProject();
    setIsProjectStarted(false);
  };

  const goToNextProject = () => {
    selectNextProject();
    setIsProjectStarted(false);
  };

  const startProject = () => {
    if (!selectedProject.presentation) {
      return;
    }

    setIsProjectStarted(true);
  };

  return (
    <section
      className={`projects-wii${isProjectChannelOpen ? ' projects-wii--channel-open' : ''}`}
      aria-labelledby="projects-heading"
    >
      <h1 className="visually-hidden" id="projects-heading">
        Selected projects
      </h1>

      {isProjectChannelOpen ? (
        isProjectStarted ? (
          <ProjectPresentation project={selectedProject} />
        ) : (
          <article className={`projects-wii-play projects-wii-play--${selectedProject.tone}`}>
            <header className="projects-wii-play__tab">
              <span>OUI Project Channel</span>
            </header>

            <section className="projects-wii-play__description" aria-label={selectedProject.title}>
              <p className="projects-wii-play__eyebrow">
                Project Channel {String(selectedIndex + 1).padStart(2, '0')}
              </p>
              <h2>{selectedProject.title}</h2>
              <p className="projects-wii-play__meta">
                {selectedProject.affiliation ? `${selectedProject.affiliation} | ` : ''}
                {selectedProject.period}
              </p>
              <p className="projects-wii-play__summary">{selectedProject.summary}</p>

              <ul className="projects-wii-play__bullets">
                {selectedProject.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>

              <ul className="projects-wii-play__stack" aria-label="Project stack">
                {selectedProject.stack.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
            </section>
          </article>
        )
      ) : (
        <div
          className="projects-wii__channels"
          onPointerDown={beginSwipe}
          onPointerUp={endSwipe}
          onPointerCancel={cancelSwipe}
        >
          {selectedProjects.map((project, index) => (
            <button
              className={`projects-wii-channel projects-wii-channel--${project.tone}${
                project.id === selectedProjectId ? ' is-active' : ''
              }`}
              type="button"
              onClick={() => openProjectChannel(project.id)}
              key={project.id}
            >
              <span className="projects-wii-channel__visual" aria-hidden="true">
                <span>{String(index + 1).padStart(2, '0')}</span>
              </span>
              <span className="projects-wii-channel__title">{project.title}</span>
            </button>
          ))}

          {Array.from({ length: EMPTY_CHANNEL_COUNT }).map((_, index) => (
            <div className="projects-wii-empty-channel" aria-hidden="true" key={index} />
          ))}
        </div>
      )}

      <button
        className="projects-wii__page-arrow projects-wii__page-arrow--previous"
        type="button"
        onClick={goToPreviousProject}
        aria-label="Previous project"
      />
      <button
        className="projects-wii__page-arrow projects-wii__page-arrow--next"
        type="button"
        onClick={goToNextProject}
        aria-label="Next project"
      />

      {isProjectChannelOpen ? (
        <footer className="projects-wii__channel-bar" aria-label="OUI project controls">
          <button
            className="projects-wii__menu-pill"
            type="button"
            onClick={closeProjectChannel}
          >
            OUI Menu
          </button>
          <button
            className={`projects-wii__start-pill${
              selectedProject.presentation ? ' projects-wii__start-pill--ready' : ''
            }`}
            type="button"
            onClick={startProject}
            disabled={!selectedProject.presentation}
          >
            Start
          </button>
        </footer>
      ) : (
        <footer className="projects-wii__system-bar" aria-label="OUI system menu">
          <button
            className="projects-wii__oui-button"
            type="button"
            onClick={openSelectedProjectChannel}
          >
            OUI
          </button>
          <div className="projects-wii__sd-card" aria-hidden="true">
            SD
          </div>
          <div className="projects-wii__clock" aria-hidden="true">
            <strong>12:00</strong>
            <span>AM</span>
            <p>Fri 1/1</p>
          </div>
          <button className="projects-wii__mail-button" type="button" onClick={goToNextProject}>
            <span aria-hidden="true" />
            <span className="visually-hidden">Next project</span>
          </button>
        </footer>
      )}
    </section>
  );
}
