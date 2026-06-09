type ProjectsTopbarProps = {
  projectCount: number;
  selectedIndex: number;
};

export function ProjectsTopbar({ projectCount, selectedIndex }: ProjectsTopbarProps) {
  return (
    <header className="projects-ds__topbar">
      <div className="projects-ds__players" aria-hidden="true">
        <span className="projects-ds__player projects-ds__player--active" />
        <span className="projects-ds__player" />
        <span className="projects-ds__player" />
        <span className="projects-ds__player" />
      </div>

      <div className="projects-ds__status" aria-label="Project library status">
        <span>Projects</span>
        <strong>{String(selectedIndex + 1).padStart(2, '0')}</strong>
        <span>/</span>
        <strong>{String(projectCount).padStart(2, '0')}</strong>
      </div>
    </header>
  );
}
