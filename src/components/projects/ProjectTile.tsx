import type { CSSProperties } from 'react';
import type { SelectedProject } from '../../data/projects';

type ProjectTileProps = {
  index: number;
  isActive: boolean;
  onSelect: (projectId: string) => void;
  project: SelectedProject;
  projectCount: number;
  selectedIndex: number;
};

type ProjectTileStyle = CSSProperties & Record<string, string | number>;

function getNormalizedOffset(index: number, selectedIndex: number, projectCount: number) {
  const offset = index - selectedIndex;

  if (Math.abs(offset) > projectCount / 2) {
    return offset - Math.sign(offset) * projectCount;
  }

  return offset;
}

function getProjectTileStyle(index: number, selectedIndex: number, projectCount: number) {
  const normalizedOffset = getNormalizedOffset(index, selectedIndex, projectCount);
  const distance = Math.min(Math.abs(normalizedOffset), 2);

  return {
    '--wheel-mobile-x': `${normalizedOffset * 108}px`,
    '--wheel-scale': 1 - distance * 0.1,
    '--wheel-x': '0px',
    '--wheel-y': `${normalizedOffset * 190}px`,
  } as ProjectTileStyle;
}

export function ProjectTile({
  index,
  isActive,
  onSelect,
  project,
  projectCount,
  selectedIndex,
}: ProjectTileProps) {
  return (
    <button
      className={`project-tile project-tile--${project.tone}${isActive ? ' project-tile--active' : ''}`}
      style={getProjectTileStyle(index, selectedIndex, projectCount)}
      type="button"
      onClick={() => onSelect(project.id)}
    >
      <span className="project-tile__screen">
        <span className="project-tile__icon" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
      </span>
      <span className="project-tile__label">{project.title}</span>
    </button>
  );
}
