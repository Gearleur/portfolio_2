import { professionalExperiences } from '../../data/professionalExperience';
import './professionalExperience.css';

export function ProfessionalExperiencePanel() {
  return (
    <section className="experience-panel" aria-labelledby="experience-heading">
      <header className="experience-panel__header">
        <p className="experience-panel__eyebrow">Professional dossier</p>
        <div>
          <h1 id="experience-heading">Professional Experience</h1>
          <p>
            AI engineering across industrial LLM systems, computer vision products and
            production-grade web platforms.
          </p>
        </div>
      </header>

      <div className="experience-panel__metrics" aria-label="Experience highlights">
        <span>3 AI roles</span>
        <span>3,000+ daily users</span>
        <span>8x A100 deployment</span>
      </div>

      <div className="experience-timeline">
        {professionalExperiences.map((experience) => (
          <article className="experience-card" key={`${experience.company}-${experience.period}`}>
            <div className="experience-card__visual" aria-hidden="true">
              {experience.imageSrc ? (
                <img src={experience.imageSrc} alt="" />
              ) : (
                <span>{experience.monogram}</span>
              )}
            </div>

            <div className="experience-card__content">
              <header className="experience-card__header">
                <div>
                  <p className="experience-card__duration">{experience.duration}</p>
                  <h2>{experience.company}</h2>
                  <p className="experience-card__role">{experience.role}</p>
                </div>
                <p className="experience-card__period">{experience.period}</p>
              </header>

              <p className="experience-card__summary">{experience.summary}</p>

              <ul className="experience-card__highlights">
                {experience.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>

              {experience.impact ? (
                <div className="experience-card__impact">
                  {experience.impact.map((impact) => (
                    <span key={impact}>{impact}</span>
                  ))}
                </div>
              ) : null}

              <ul className="experience-card__tech">
                {experience.technologies.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
