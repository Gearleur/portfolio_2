import type { SelectedProject } from '../../data/projects';

type ProjectPresentationProps = {
  project: SelectedProject;
};

export function ProjectPresentation({ project }: ProjectPresentationProps) {
  const presentation = project.presentation;

  if (!presentation) {
    return null;
  }

  return (
    <article className={`projects-wii-presentation projects-wii-presentation--${project.tone}`}>
      <header className="projects-wii-presentation__hero">
        <div className="projects-wii-presentation__intro">
          <p className="projects-wii-presentation__eyebrow">Project started</p>
          <h2>{project.title}</h2>
          <p className="projects-wii-presentation__meta">
            {project.affiliation ? `${project.affiliation} | ` : ''}
            {project.period}
          </p>
          <p>{presentation.intro}</p>
          <div className="projects-wii-presentation__links" aria-label="Project links">
            {presentation.links.map((link) => (
              <a href={link.href} target="_blank" rel="noreferrer" key={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </header>

      <section className="projects-wii-presentation__architecture" aria-labelledby="tn09-architecture">
        <h3 id="tn09-architecture">Architecture RAG</h3>
        {presentation.diagram ? (
          <figure className="projects-wii-presentation__diagram">
            <img src={presentation.diagram.src} alt={presentation.diagram.alt} />
          </figure>
        ) : null}
        <ol>
          {presentation.architecture.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <div className="projects-wii-presentation__sections">
        {presentation.sections.map((section) => (
          <section className="projects-wii-presentation__section" key={section.title}>
            <h3>{section.title}</h3>
            <p>{section.body}</p>
            <ul>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="projects-wii-presentation__predictions" aria-labelledby="tn09-predictions">
        <h3 id="tn09-predictions">Predictions</h3>
        <ul>
          {presentation.predictions.map((prediction) => (
            <li key={prediction}>{prediction}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}
