import { selectedProjects } from '../../data/projects';
import { ProjectDossier } from './ProjectDossier';
import { ProjectWheel } from './ProjectWheel';
import { ProjectsFooter } from './ProjectsFooter';
import { ProjectsTopbar } from './ProjectsTopbar';
import { useProjectCarousel } from './useProjectCarousel';
import './projects.css';

export function ProjectsPanel() {
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

  return (
    <section className="projects-ds" aria-labelledby="projects-heading">
      <ProjectsTopbar projectCount={selectedProjects.length} selectedIndex={selectedIndex} />

      <div className="projects-ds__layout">
        <ProjectWheel
          onCancelSwipe={cancelSwipe}
          onEndSwipe={endSwipe}
          onNextProject={selectNextProject}
          onPreviousProject={selectPreviousProject}
          onSelectProject={selectProject}
          onStartSwipe={beginSwipe}
          projects={selectedProjects}
          selectedIndex={selectedIndex}
          selectedProjectId={selectedProjectId}
        />

        <ProjectDossier project={selectedProject} />
      </div>

      <ProjectsFooter />
    </section>
  );
}
