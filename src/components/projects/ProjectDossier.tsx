import type { SelectedProject } from '../../data/projects';

type ProjectDossierProps = {
  project: SelectedProject;
};

export function ProjectDossier({ project }: ProjectDossierProps) {
  return (
    <article className={`project-dossier project-dossier--${project.tone}`}>
      <p className="project-dossier__eyebrow">Nintendo-style project card</p>
      <h1 id="projects-heading">{project.title}</h1>
      <p className="project-dossier__meta">
        {project.affiliation ? `${project.affiliation} | ` : ''}
        {project.period}
      </p>
      <p className="project-dossier__summary">{project.summary}</p>

      <ul className="project-dossier__bullets">
        {project.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>

      <ul className="project-dossier__stack" aria-label="Project stack">
        {project.stack.map((technology) => (
          <li key={technology}>{technology}</li>
        ))}
      </ul>
    </article>
  );
}
