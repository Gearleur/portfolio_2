import { useId, useState } from 'react';
import { extracurricularExperiences } from '../../data/extracurricular';
import './extracurricular.css';

export function ExtracurricularPanel() {
  const [tab, setTab] = useState<'wall' | 'info'>('wall');
  const [query, setQuery] = useState('');
  const id = useId();
  const visible = extracurricularExperiences.filter((experience) =>
    `${experience.organization} ${experience.role} ${experience.location} ${experience.tags.join(' ')}`
      .toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <section className="facebook-panel" aria-labelledby={`${id}-heading`}>
      <header className="facebook-masthead">
        <p className="facebook-masthead__brand">thefacebook</p>
        <label className="facebook-search">
          <span className="visually-hidden">Search extracurricular experiences</span>
          <input type="search" placeholder="Search experiences…" value={query}
            onChange={(event) => { setQuery(event.target.value); setTab('wall'); }} />
        </label>
        <span className="facebook-masthead__network">UTC network</span>
      </header>

      <div className="facebook-layout">
        <aside className="facebook-sidebar" aria-label="About Alexandre">
          <div className="facebook-picture">
            <img src="/assets/extracurricular/moi.jpg" alt="Alexandre Teixeira" width={400} height={400} />
          </div>
          <div className="facebook-sidebar__caption">Entrepreneurship · Student life</div>
          <section className="facebook-box">
            <h2>Information</h2>
            <dl><dt>Network</dt><dd>UTC</dd><dt>Interests</dt><dd>AI products, startups & partnerships</dd></dl>
          </section>
          <section className="facebook-box">
            <h2>Groups <span>({extracurricularExperiences.length})</span></h2>
            {extracurricularExperiences.map((experience) => (
              <button type="button" className="facebook-group" key={experience.id}
                onClick={() => { setQuery(experience.organization); setTab('wall'); }}>
                <span className={`facebook-avatar facebook-avatar--${experience.tone}`} aria-hidden="true">{experience.tone === 'founder' ? 'FB' : 'IF'}</span>
                <span><strong>{experience.organization}</strong><small>{experience.location}</small></span>
              </button>
            ))}
          </section>
        </aside>

        <div className="facebook-main">
          <header className="facebook-profile-header">
            <p className="facebook-profile-header__eyebrow">Extracurricular experience</p>
            <h1 id={`${id}-heading`}>Alexandre Teixeira</h1>
            <p>People, ideas and projects beyond the classroom.</p>
          </header>
          <div className="facebook-tabs" role="group" aria-label="Profile sections">
            <button type="button" aria-pressed={tab === 'wall'} onClick={() => setTab('wall')}>Wall</button>
            <button type="button" aria-pressed={tab === 'info'} onClick={() => setTab('info')}>Info</button>
          </div>

          {tab === 'wall' ? (
            <section aria-label="Experience wall">
              <div className="facebook-feed-heading"><h2>Recent activity</h2><span>{visible.length} experiences</span></div>
              {query && <button className="facebook-clear" type="button" onClick={() => setQuery('')}>Clear filter ×</button>}
              {visible.length === 0 && <p className="facebook-empty" role="status">No experiences found. Try a group, role or city.</p>}
              {visible.map((experience) => (
                <article className="facebook-post" key={experience.id}>
                  <span className={`facebook-avatar facebook-avatar--${experience.tone}`} aria-hidden="true">{experience.tone === 'founder' ? 'FB' : 'IF'}</span>
                  <div className="facebook-post__body">
                    <header><h3>{experience.organization}</h3><p>{experience.role} · {experience.location}</p><small>{experience.period}</small></header>
                    <p className="facebook-post__summary">{experience.summary}</p>
                    <div className={`facebook-event facebook-event--${experience.tone}`}>
                      <span>{experience.tone === 'founder' ? 'ENTREPRENEURSHIP / SHANGHAI' : 'MUSIC / STUDENT LIFE'}</span>
                      <strong>{experience.organization}</strong>
                      <small>{experience.tone === 'founder' ? 'Ideas start with a conversation.' : 'Behind the scenes. Making it happen.'}</small>
                    </div>
                    <details className="facebook-post__details">
                      <summary>View experience details</summary>
                      <ul>{experience.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
                    </details>
                    <div className="facebook-tags">{experience.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                  </div>
                </article>
              ))}
            </section>
          ) : (
            <section className="facebook-about" aria-label="Profile information">
              <h2>About Alexandre</h2>
              <p>Curious about people, systems and the messy part where ideas become real projects.</p>
              <dl><dt>Education network</dt><dd>Université de technologie de Compiègne</dd><dt>Interests</dt><dd>AI products, venture creation, international business and student events.</dd><dt>Experience</dt><dd>Founder Breakfast in Shanghai and partnership management for Imaginarium Festival.</dd></dl>
            </section>
          )}
          <footer className="facebook-footer">Alexandre's profile <span>UTC · Extracurricular</span></footer>
        </div>
      </div>
    </section>
  );
}
