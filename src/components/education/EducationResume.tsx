import { educationEntries } from '../../data/education';
import './education.css';

export function EducationResume() {
  return (
    <section className="education-resume" aria-labelledby="education-heading">
      <header className="education-resume__header">
        <p className="education-resume__eyebrow">Academic record</p>
        <h1 id="education-heading">Education</h1>
      </header>

      <div className="education-resume__entries">
        {educationEntries.map((entry) => (
          <article className="education-resume__entry" key={`${entry.degree}-${entry.period}`}>
            <header className="education-resume__entry-header">
              <span className="education-resume__logo-frame">
                <img src={entry.logoSrc} alt={entry.logoAlt} />
              </span>
              <div>
                <h2>{entry.degree}</h2>
                <p className="education-resume__institution">
                  {entry.institution}
                  {entry.location ? <span> | {entry.location}</span> : null}
                </p>
              </div>
              <p className="education-resume__period">{entry.period}</p>
            </header>

            <div className="education-resume__coursework">
              <span>Relevant coursework:</span>
              <ul>
                {entry.coursework.map((course) => (
                  <li key={course}>{course}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
