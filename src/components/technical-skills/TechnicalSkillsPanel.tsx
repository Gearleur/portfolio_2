import { technicalSkillCategories } from '../../data/technicalSkills';
import './technicalSkills.css';

const skillCount = technicalSkillCategories.reduce(
  (count, category) => count + category.skills.length,
  0,
);

export function TechnicalSkillsPanel() {
  return (
    <section className="technical-skills-panel" aria-labelledby="technical-skills-heading">
      <header className="xp-toolbar">
        <nav className="xp-toolbar__menu" aria-label="Technical skills menu">
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Favorites</span>
          <span>Tools</span>
          <span>Help</span>
        </nav>

        <div className="xp-toolbar__address">
          <span>Address</span>
          <strong>Control Panel\Technical Skills</strong>
        </div>
      </header>

      <div className="xp-control-panel">
        <aside className="xp-sidebar" aria-label="Control panel tasks">
          <section className="xp-task-box">
            <h2>Control Panel</h2>
            <button type="button">Switch to Category View</button>
          </section>

          <section className="xp-task-box">
            <h2>See Also</h2>
            <a href="#technical-skills-heading">AI Engineering</a>
            <a href="#technical-skills-heading">Model Deployment</a>
            <a href="#technical-skills-heading">Backend Systems</a>
          </section>

          <section className="xp-task-box xp-task-box--stats">
            <h2>Details</h2>
            <p>{technicalSkillCategories.length} domains</p>
            <p>{skillCount} tools</p>
            <p>Portfolio stack ready</p>
          </section>
        </aside>

        <main className="xp-main" aria-labelledby="technical-skills-heading">
          <div className="xp-main__heading">
            <h1 id="technical-skills-heading">Technical Skills</h1>
            <p>Select an item to view installed technologies and engineering capabilities.</p>
          </div>

          <div className="xp-icon-grid">
            {technicalSkillCategories.map((category) => (
              <article
                className={`xp-skill-icon xp-skill-icon--${category.tone}`}
                key={category.id}
              >
                <span className="xp-skill-icon__graphic" aria-hidden="true">
                  <img src={category.iconSrc} alt="" />
                </span>
                <h2>{category.title}</h2>
              </article>
            ))}
          </div>

          <div className="xp-detail-list">
            {technicalSkillCategories.map((category) => (
              <article className="xp-detail-card" key={`${category.id}-details`}>
                <header>
                  <img className="xp-detail-card__icon" src={category.iconSrc} alt="" />
                  <div>
                    <h2>{category.title}</h2>
                    <p>{category.description}</p>
                  </div>
                </header>

                <ul>
                  {category.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </main>
      </div>
    </section>
  );
}
