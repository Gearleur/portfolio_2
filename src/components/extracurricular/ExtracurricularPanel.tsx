import { extracurricularExperiences } from '../../data/extracurricular';
import './extracurricular.css';

const sidebarLinks = [
  'My Profile [ edit ]',
  'My Friends',
  'My Groups',
  'My Parties',
  'My Messages',
  'My Account',
  'My Privacy',
];

const profileRows = [
  ['Name', 'Alexandre Teixeira'],
  ['Member Since', 'Sept. 2022'],
  ['Last Update', 'June 10, 2026'],
  ['School', 'UTC'],
  ['Residence', 'Paris'],
  ['Status', 'Building things'],
  ['Email', 'alexandretei13@gmail.com'],
];

const interestRows = [
  ['Interests', 'AI products, startups, partnerships, student events'],
  ['Favorite Topics', 'Venture creation, market positioning, international business'],
  ['Currently Reading', 'Founder notes, product strategy and technical case studies'],
  ['About Me', 'Curious about people, systems and the messy part where ideas become real projects.'],
];

export function ExtracurricularPanel() {
  return (
    <section className="facebook-panel" aria-labelledby="facebook-profile-heading">
      <header className="facebook-masthead">
        <div className="facebook-masthead__mark" aria-hidden="true" />
        <div>
          <p className="facebook-masthead__brand">[ thefacebook ]</p>
          <nav aria-label="Facebook navigation">
            <span>home</span>
            <span>search</span>
            <span>global social net</span>
            <span>invite</span>
            <span>faq</span>
            <span>logout</span>
          </nav>
        </div>
      </header>

      <div className="facebook-profile-bar">
        <h1 id="facebook-profile-heading">Alexandre Teixeira's Profile</h1>
        <span>UTC Network</span>
      </div>

      <div className="facebook-layout">
        <aside className="facebook-sidebar" aria-label="Profile shortcuts">
          <div className="facebook-search">
            <label htmlFor="facebook-search">quick search</label>
            <div>
              <input id="facebook-search" type="search" value="" readOnly />
              <button type="button">go</button>
            </div>
          </div>

          <nav className="facebook-links" aria-label="Old Facebook links">
            {sidebarLinks.map((link) => (
              <a href="#facebook-profile-heading" key={link}>
                {link}
              </a>
            ))}
          </nav>

          <div className="facebook-ad" aria-hidden="true">
            <strong>Founder Breakfast</strong>
            <span>Shanghai</span>
            <small>startup mornings</small>
          </div>

          <div className="facebook-photo-strip" aria-hidden="true">
            <span className="facebook-polaroid facebook-polaroid--one">SH</span>
            <span className="facebook-polaroid facebook-polaroid--two">IF</span>
            <span className="facebook-polaroid facebook-polaroid--three">UTC</span>
          </div>
        </aside>

        <main className="facebook-main">
          <section className="facebook-box facebook-picture-box" aria-labelledby="facebook-picture-heading">
            <h2 id="facebook-picture-heading">Picture</h2>
            <div className="facebook-picture">
              <span>AT</span>
              <small>photos later</small>
            </div>
          </section>

          <section className="facebook-box facebook-actions" aria-label="Profile actions">
            <button type="button">Send Alexandre a Message</button>
            <button type="button">Poke Him!</button>
          </section>

          <section className="facebook-box">
            <h2>Connection</h2>
            <p>You are connected through entrepreneurship, student life and creative projects.</p>
          </section>

          <section className="facebook-box">
            <h2>Mutual Experience</h2>
            <p>You have 2 experiences in common with Alexandre.</p>
            <div className="facebook-friends">
              {extracurricularExperiences.map((experience) => (
                <article className="facebook-friend" key={experience.id}>
                  <span className={`facebook-friend__avatar facebook-friend__avatar--${experience.tone}`}>
                    {experience.tone === 'founder' ? 'FB' : 'IF'}
                  </span>
                  <strong>{experience.organization}</strong>
                  <small>{experience.location}</small>
                </article>
              ))}
            </div>
          </section>

          <section className="facebook-box">
            <h2>Access</h2>
            <p>Alexandre is currently logged in from a non-residential location.</p>
          </section>
        </main>

        <aside className="facebook-info" aria-label="Profile information">
          <section className="facebook-box">
            <h2>Information</h2>
            <div className="facebook-info-table">
              <h3>Account Info:</h3>
              {profileRows.map(([label, value]) => (
                <p key={label}>
                  <strong>{label}:</strong>
                  <span>{value}</span>
                </p>
              ))}
            </div>
          </section>

          <section className="facebook-box">
            <h2>Extracurricular Info</h2>
            <div className="facebook-experiences">
              {extracurricularExperiences.map((experience) => (
                <article
                  className={`facebook-experience facebook-experience--${experience.tone}`}
                  key={experience.id}
                >
                  <header>
                    <p>{experience.period}</p>
                    <h3>
                      {experience.role} - {experience.organization}
                    </h3>
                    <span>{experience.location}</span>
                  </header>

                  <p>{experience.summary}</p>

                  <ul>
                    {experience.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>

                  <div className="facebook-tags" aria-label={`${experience.organization} tags`}>
                    {experience.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="facebook-box">
            <h2>Personal Info</h2>
            <div className="facebook-info-table">
              {interestRows.map(([label, value]) => (
                <p key={label}>
                  <strong>{label}:</strong>
                  <span>{value}</span>
                </p>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
