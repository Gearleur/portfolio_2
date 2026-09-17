import React, { type ReactNode } from 'react';
import { professionalExperiences } from '../../data/professionalExperience';
import { profile } from '../../data/profile';
import { machineProfile, machineProjects, machineSkillGroups } from './machineResumeData';

function Prompt({ children = '>' }: { children?: string }) {
  return <span className="machine-prompt" aria-hidden="true">{children}</span>;
}

type MachineResumeDocumentProps = {
  expandProjects?: boolean;
  showAgentLink?: boolean;
  beforeSections?: ReactNode;
};

// Shared markup for the interactive Machine view and the static /agent page.
export function MachineResumeDocument({
  expandProjects = false,
  showAgentLink = true,
  beforeSections,
}: MachineResumeDocumentProps): React.JSX.Element {
  return (
    <article className="machine-resume__document">
      <header className="machine-resume__file-header">
        <div className="machine-resume__file-meta" aria-label="Document metadata">
          <span>alexandre_teixeira.cv.md</span>
          <span>UTF-8</span>
          <span>markdown+json</span>
          <span className="machine-resume__status">● parsed</span>
        </div>

        <p className="machine-comment">// candidate_profile — human-readable / machine-readable</p>
        <h1 id="machine-resume-title"><span>#</span> ALEXANDRE TEIXEIRA</h1>
        <p className="machine-resume__role">{machineProfile.role}</p>

        <pre className="machine-json" aria-label="Contact information in JSON format"><code>{JSON.stringify({
          email: profile.email,
          phone: profile.phoneDisplay,
          location: profile.location,
          linkedin: profile.linkedinUrl,
          github: profile.githubUrl,
          source: ['CV_en.pdf', 'CV_fr.pdf'],
        }, null, 2)}</code></pre>

        <nav className="machine-resume__links" aria-label="Contact links">
          <a href={`mailto:${profile.email}`}>[EMAIL]</a>
          <a href={profile.phoneHref}>[PHONE]</a>
          <a href={profile.linkedinUrl} target="_blank" rel="noreferrer">[LINKEDIN]</a>
          <a href={profile.githubUrl} target="_blank" rel="noreferrer">[GITHUB]</a>
          <a href="/CV_en.pdf" download>[CV_EN.PDF]</a>
          <a href="/CV_fr.pdf" download>[CV_FR.PDF]</a>
          <a href="/cv/en/">[VIEW CV EN]</a>
          <a href="/cv/fr/">[VOIR CV FR]</a>
          {showAgentLink && <a href="/agent/">[FOR AI AGENTS ↗]</a>}
        </nav>

        <blockquote>
          <Prompt /> {machineProfile.summary}
        </blockquote>
      </header>

      {beforeSections}

      <section className="machine-section" aria-labelledby="machine-education-title">
        <h2 id="machine-education-title"><span>##</span> EDUCATION</h2>

        {machineProfile.education.map((education) => (
          <div className="machine-entry" key={education.school}>
            <div className="machine-entry__heading">
              <h3><span>###</span> {education.school}</h3>
              <time>{education.period}</time>
            </div>
            <p className="machine-entry__subtitle">{education.degree}</p>
            {education.courses.map((course) => <p key={course}><Prompt /> {course}</p>)}
          </div>
        ))}
      </section>

      <section className="machine-section" aria-labelledby="machine-experience-title">
        <h2 id="machine-experience-title"><span>##</span> PROFESSIONAL_EXPERIENCE[]</h2>

        {professionalExperiences.map((experience, index) => (
          <article className="machine-entry machine-experience" key={`${experience.company}-${experience.period}`}>
            <div className="machine-entry__heading">
              <h3><span>### [{index}]</span> {experience.role}, {experience.company}</h3>
              <time>{experience.period}</time>
            </div>
            <p className="machine-entry__subtitle">{experience.summary}</p>
            <ul className="machine-list">
              {experience.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
            </ul>
            <p className="machine-inline-array">
              <span>stack:</span> [{experience.technologies.map((technology) => `"${technology}"`).join(', ')}]
            </p>
          </article>

        ))}
      </section>

      <section className="machine-section machine-projects" aria-labelledby="machine-projects-title">
        <div className="machine-section__heading">
          <h2 id="machine-projects-title"><span>##</span> SELECTED_PROJECTS[]</h2>
          <p>{expandProjects ? '// all records expanded for reading' : '// expand a record to inspect implementation'}</p>
        </div>

        <div className="machine-projects__list">
          {machineProjects.map((project, index) => (
            <details className="machine-project" key={project.id} open={expandProjects || undefined}>
              <summary>
                <span className="machine-project__toggle" aria-hidden="true" />
                <span className="machine-project__index">[{String(index).padStart(2, '0')}]</span>
                <span className="machine-project__title">{project.title}</span>
                <time>{project.period}</time>
              </summary>

              <div className="machine-project__details">
                {project.affiliation ? <p className="machine-comment">// {project.affiliation}</p> : null}
                <p>{project.summary}</p>
                <ul className="machine-list">
                  {project.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
                </ul>

                <div className="machine-table-wrap">
                  <table>
                    <thead>
                      <tr><th>component</th><th>implementation</th></tr>
                    </thead>
                    <tbody>
                      {project.system.map((row) => (
                        <tr key={row.component}>
                          <td>{row.component}</td>
                          <td>{row.implementation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="machine-inline-array">
                  <span>stack:</span> [{project.stack.map((technology) => `"${technology}"`).join(', ')}]
                </p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="machine-section" aria-labelledby="machine-skills-title">
        <h2 id="machine-skills-title"><span>##</span> TECHNICAL_SKILLS</h2>
        <div className="machine-table-wrap">
          <table className="machine-skills-table">
            <thead>
              <tr><th>namespace</th><th>capabilities[]</th></tr>
            </thead>
            <tbody>
              {machineSkillGroups.map((group) => (
                <tr key={group.label}>
                  <td>{group.label}</td>
                  <td>{group.values.join(' · ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="machine-section" aria-labelledby="machine-more-title">
        <h2 id="machine-more-title"><span>##</span> LANGUAGES_AND_LEADERSHIP</h2>
        <p><Prompt /> <strong>Languages:</strong> {machineProfile.languages}</p>
        {machineProfile.leadership.map((entry) => (
          <p key={entry.role}><Prompt /> <strong>{entry.role} ({entry.period}):</strong> {entry.summary}</p>
        ))}
      </section>

      <footer className="machine-resume__footer">
        <p>EOF — alexandre_teixeira.cv.md</p>
        <p>checksum: experience × execution × impact</p>
      </footer>
    </article>
  );
}
