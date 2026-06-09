import type { PointerEventHandler } from 'react';
import type { SelectedProject } from '../../data/projects';
import { ProjectTile } from './ProjectTile';

type ProjectWheelProps = {
  onCancelSwipe: () => void;
  onEndSwipe: PointerEventHandler<HTMLDivElement>;
  onNextProject: () => void;
  onPreviousProject: () => void;
  onSelectProject: (projectId: string) => void;
  onStartSwipe: PointerEventHandler<HTMLDivElement>;
  projects: readonly SelectedProject[];
  selectedIndex: number;
  selectedProjectId: string;
};

export function ProjectWheel({
  onCancelSwipe,
  onEndSwipe,
  onNextProject,
  onPreviousProject,
  onSelectProject,
  onStartSwipe,
  projects,
  selectedIndex,
  selectedProjectId,
}: ProjectWheelProps) {
  return (
    <div className="project-wheel" aria-label="Project selector">
      <button
        className="project-wheel__nav project-wheel__nav--up"
        type="button"
        onClick={onPreviousProject}
        aria-label="Previous project"
      />

      <div
        className="project-wheel__track"
        onPointerDown={onStartSwipe}
        onPointerUp={onEndSwipe}
        onPointerCancel={onCancelSwipe}
      >
        {projects.map((project, index) => (
          <ProjectTile
            index={index}
            isActive={project.id === selectedProjectId}
            onSelect={onSelectProject}
            project={project}
            projectCount={projects.length}
            selectedIndex={selectedIndex}
            key={project.id}
          />
        ))}
      </div>

      <button
        className="project-wheel__side-nav project-wheel__side-nav--previous"
        type="button"
        onClick={onPreviousProject}
        aria-label="Previous project"
      />
      <button
        className="project-wheel__side-nav project-wheel__side-nav--next"
        type="button"
        onClick={onNextProject}
        aria-label="Next project"
      />

      <button
        className="project-wheel__nav project-wheel__nav--down"
        type="button"
        onClick={onNextProject}
        aria-label="Next project"
      />
    </div>
  );
}
