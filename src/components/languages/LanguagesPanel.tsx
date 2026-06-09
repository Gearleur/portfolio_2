import { languageEntries } from '../../data/languages';
import './languages.css';

export function LanguagesPanel() {
  return (
    <section className="languages-panel" aria-labelledby="languages-heading">
      <header className="languages-netflix-header">
        <div className="languages-netflix-header__top">
          <p className="languages-netflix-header__brand">LANGFLIX</p>
          <span>Your Account & Help</span>
        </div>

        <div className="languages-netflix-header__nav">
          <nav aria-label="Languages navigation">
            <span>Watch Instantly</span>
            <span>Browse Languages</span>
            <span>Your Queue</span>
            <span>Suggestions For You</span>
          </nav>

          <label>
            <span className="visually-hidden">Search languages</span>
            <input type="search" value="Languages, levels, contexts" readOnly />
          </label>
        </div>
      </header>

      <div className="languages-netflix-subnav" aria-hidden="true">
        <span>Genres</span>
        <span>New Arrivals</span>
        <span>Starz Play</span>
        <span>Instant to your TV</span>
        <span>Help</span>
      </div>

      <section
        className="languages-shelf languages-shelf--featured"
        aria-labelledby="languages-heading"
      >
        <header className="languages-shelf__header">
          <h1 id="languages-heading">Critically-acclaimed Communication & Collaboration</h1>
          <button type="button">see all</button>
        </header>

        <div className="languages-shelf__body">
          <aside className="languages-shelf__prefs">
            <p>Your taste preferences created this row:</p>
            <strong>International work</strong>
            <strong>Technical writing</strong>
            <strong>Academic exchange</strong>
          </aside>

          <div className="languages-movies">
            {languageEntries.map((language) => (
              <article className="language-movie" key={language.id}>
                <div className={`language-movie__poster language-movie__poster--${language.tone}`}>
                  <span>{language.id === 'french' ? 'FR' : 'EN'}</span>
                  <b>{language.label}</b>
                </div>
                <button type="button">Play</button>
                <div className="languages-stars" aria-hidden="true">
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span className={language.id === 'english' ? 'is-empty' : ''}>★</span>
                </div>
                <small>{language.level}</small>
              </article>
            ))}

            <article className="language-movie">
              <div className="language-movie__poster language-movie__poster--mix">
                <span>INT</span>
                <b>Switch Mode</b>
              </div>
              <button type="button">Play</button>
              <div className="languages-stars" aria-hidden="true">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>
              <small>Ready</small>
            </article>
          </div>
        </div>
      </section>

      <section className="languages-shelf" aria-label="Quirky languages featuring strong engineering context">
        <header className="languages-shelf__header">
          <h2>Quirky Languages Featuring a Strong Engineering Lead</h2>
          <button type="button">see all</button>
        </header>

        <div className="languages-movies languages-movies--wide">
          {languageEntries.map((language) => (
            <article className="language-detail" key={`${language.id}-detail`}>
              <div className={`language-detail__cover language-detail__cover--${language.tone}`}>
                <span>{language.level}</span>
              </div>
              <div>
                <h3>{language.label}</h3>
                <p>{language.note}</p>
                <button type="button">Resume</button>
              </div>
            </article>
          ))}

          <article className="language-detail">
            <div className="language-detail__cover language-detail__cover--mix">
              <span>2x</span>
            </div>
            <div>
              <h3>International Mode</h3>
              <p>Comfortable switching between French and English across technical contexts.</p>
              <button type="button">Resume</button>
            </div>
          </article>
        </div>
      </section>
    </section>
  );
}
