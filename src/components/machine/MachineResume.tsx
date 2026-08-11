import { useEffect, useRef, useState } from 'react';
import { professionalExperiences } from '../../data/professionalExperience';
import { machineProjects, machineSkillGroups } from './machineResumeData';
import { getMachineResumeMarkdown } from './machineResumeMarkdown';
import './machineMode.css';

const LINKEDIN_URL = 'https://www.linkedin.com/in/alexandre-teixeira-639636214/';
const GITHUB_URL = 'https://github.com/Gearleur';

function Prompt({ children = '>' }: { children?: string }) {
  return <span className="machine-prompt" aria-hidden="true">{children}</span>;
}

type CopyState = 'idle' | 'copied' | 'error';

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall back to the selection-based API when clipboard permissions are restricted.
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  let didCopy: boolean;

  try {
    didCopy = document.execCommand('copy');
  } finally {
    textarea.remove();
  }

  if (!didCopy) {
    throw new Error('Clipboard copy failed');
  }
}

export function MachineResume() {
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const resetCopyStateTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (resetCopyStateTimer.current !== null) {
      window.clearTimeout(resetCopyStateTimer.current);
    }
  }, []);

  const handleCopy = async () => {
    if (resetCopyStateTimer.current !== null) {
      window.clearTimeout(resetCopyStateTimer.current);
    }

    try {
      await copyText(getMachineResumeMarkdown());
      setCopyState('copied');
    } catch {
      setCopyState('error');
    }

    resetCopyStateTimer.current = window.setTimeout(() => setCopyState('idle'), 1800);
  };

  const copyLabel = copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Retry' : 'Copy all';

  return (
    <main className="machine-resume" aria-labelledby="machine-resume-title">
      <div className="machine-resume__rail machine-resume__rail--left" aria-hidden="true" />
      <div className="machine-resume__rail machine-resume__rail--right" aria-hidden="true" />

      <button
        className={`machine-copy-button machine-copy-button--${copyState}`}
        type="button"
        onClick={handleCopy}
        aria-label="Copy the complete CV as Markdown"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <rect x="5" y="5" width="8" height="9" rx="1" />
          <path d="M3 11H2.8A.8.8 0 0 1 2 10.2V2.8A.8.8 0 0 1 2.8 2h7.4a.8.8 0 0 1 .8.8V3" />
        </svg>
        <span>{copyLabel}</span>
      </button>
      <span className="machine-copy-status" role="status" aria-live="polite">
        {copyState === 'copied' ? 'Complete CV copied to clipboard.' : copyState === 'error' ? 'Unable to copy. Try again.' : ''}
      </span>

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
          <p className="machine-resume__role">AI Engineer · GenAI &amp; Production LLM Systems</p>

          <pre className="machine-json" aria-label="Contact information in JSON format"><code>{`{
  "email": "alexandretei13@gmail.com",
  "phone": "+33 7 86 01 55 04",
  "location": "Paris, France",
  "linkedin": "alexandre-teixeira-639636214",
  "github": "Gearleur",
  "portfolio": "current_document",
  "availability": "open"
}`}</code></pre>

          <nav className="machine-resume__links" aria-label="Contact links">
            <a href="mailto:alexandretei13@gmail.com">[EMAIL]</a>
            <a href="tel:+33786015504">[PHONE]</a>
            <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">[LINKEDIN]</a>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">[GITHUB]</a>
            <a href="/CV_en.pdf" download>[CV_EN.PDF]</a>
            <a href="/CV_fr.pdf" download>[CV_FR.PDF]</a>
          </nav>

          <blockquote>
            <Prompt /> 0→1 AI Engineer — I turn complex business problems into AI products that get
            deployed and adopted. My approach: understand the workflow, simplify the problem, and
            build from idea to impact.
          </blockquote>
        </header>

        <section className="machine-section" aria-labelledby="machine-education-title">
          <h2 id="machine-education-title"><span>##</span> EDUCATION</h2>

          <div className="machine-entry">
            <div className="machine-entry__heading">
              <h3><span>###</span> University of Technology of Compiègne (UTC)</h3>
              <time>2022–2026 · Compiègne</time>
            </div>
            <p className="machine-entry__subtitle">Master’s-level Engineering Degree (Diplôme d’Ingénieur), Computer Science</p>
            <p><Prompt /> Artificial Intelligence, optimization, operations research, logic and search-based problem solving, cybersecurity.</p>
          </div>

          <div className="machine-entry">
            <div className="machine-entry__heading">
              <h3><span>###</span> Shanghai University — UTSEUS</h3>
              <time>Sep. 2024–Jan. 2025 · Shanghai</time>
            </div>
            <p className="machine-entry__subtitle">Exchange Program in Artificial Intelligence</p>
            <p><Prompt /> Natural Language Processing, Generative AI, Data Analysis, Data Visualization.</p>
          </div>
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
            <p>// expand a record to inspect implementation</p>
          </div>

          <div className="machine-projects__list">
            {machineProjects.map((project, index) => (
              <details className="machine-project" key={project.id}>
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
          <p><Prompt /> <strong>Languages:</strong> French (native) · English (professional) · Chinese (basic)</p>
          <p><Prompt /> <strong>Partnership Manager, Imaginarium Festival (2022–2023):</strong> managed sponsorships for a €600,000-budget student festival.</p>
          <p><Prompt /> <strong>Founder Breakfast, Shanghai (2024–2025):</strong> engaged with startup founders on AI-driven innovation.</p>
        </section>

        <footer className="machine-resume__footer">
          <p>EOF — alexandre_teixeira.cv.md</p>
          <p>checksum: experience × execution × impact</p>
        </footer>
      </article>
    </main>
  );
}
