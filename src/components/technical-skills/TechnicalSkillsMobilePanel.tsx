import { technicalSkillCategories } from '../../data/technicalSkills';
import './technicalSkills.css';

export function TechnicalSkillsMobilePanel() {
  return (
    <section className="ios-settings-panel" aria-labelledby="ios-skills-heading">
      <header className="ios-settings-panel__bar">
        <h1 id="ios-skills-heading">Settings</h1>
      </header>

      <div className="ios-settings-panel__content">
        <div className="ios-settings-list" aria-label="Skill categories">
          <div className="ios-settings-section">
            {technicalSkillCategories.map((category, index) => (
              <details
                className="ios-settings-category"
                key={category.id}
                open={index === 0}
              >
                <summary className="ios-settings-row">
                  <img src={category.mobileIconSrc} alt="" />
                  <div>
                    <h2>{category.title}</h2>
                  </div>
                  <span className="ios-settings-row__chevron" aria-hidden="true">
                    ›
                  </span>
                </summary>

                <div className="ios-settings-dropdown">
                  <p>{category.description}</p>
                  <ul>
                    {category.skills.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
