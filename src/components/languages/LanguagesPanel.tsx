import { useState } from 'react';
import { languageEntries } from '../../data/languages';
import './languages.css';

export function LanguagesPanel() {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(languageEntries[0].id);
  const selected = languageEntries.find((language) => language.id === selectedId)!;
  const visible = languageEntries.filter((language) =>
    `${language.label} ${language.level} ${language.note}`.toLowerCase().includes(query.toLowerCase().trim()),
  );

  return (
    <section className="languages-panel" aria-labelledby="languages-heading">
      <header className="languages-netflix-header">
        <div className="languages-netflix-header__top">
          <p className="languages-netflix-header__brand">LANGFLIX</p>
          <span>The language collection</span>
        </div>
        <div className="languages-netflix-header__nav">
          <span className="languages-netflix-header__tab">Browse languages</span>
          <label>
            <span className="visually-hidden">Search languages</span>
            <input type="search" placeholder="Find a language, level…" value={query}
              onChange={(event) => setQuery(event.target.value)} />
          </label>
        </div>
      </header>

      <div className="languages-intro">
        <p className="languages-intro__eyebrow">Available in original version</p>
        <h1 id="languages-heading">Good conversations. No subtitles.</h1>
        <p>Two languages for everyday life, research and engineering.</p>
      </div>

      <section className="languages-shelf" aria-labelledby="languages-collection-heading">
        <header className="languages-shelf__header">
          <h2 id="languages-collection-heading">My language collection</h2>
          <span>{visible.length} titles</span>
        </header>
        <div className="languages-movies">
          {visible.map((language) => (
            <button type="button" className={`language-movie${selectedId === language.id ? ' is-selected' : ''}`}
              key={language.id} aria-pressed={selectedId === language.id}
              aria-label={`View ${language.label} details`} onClick={() => setSelectedId(language.id)}>
              <span className={`language-movie__poster language-movie__poster--${language.tone}`}>
                <span className="language-movie__edition">LANGFLIX ORIGINAL COLLECTION</span>
                <span className="language-movie__monogram" aria-hidden="true">{language.id === 'french' ? 'Fr' : 'En'}</span>
                <span className="language-movie__poster-title">{language.label}</span>
                <span className="language-movie__caption">{language.id === 'french' ? 'THE ORIGINAL VERSION' : 'A WORLD OF CONNECTIONS'}</span>
              </span>
              <span className="language-movie__info"><strong>{language.label}</strong><span>{language.level}</span></span>
              <span className="language-movie__action"><span aria-hidden="true">▶</span> View details</span>
            </button>
          ))}
          {visible.length === 0 && <p className="languages-empty" role="status">No languages found. Try “English” or “Français”.</p>}
        </div>
      </section>

      <section className="language-feature" aria-live="polite" aria-labelledby="language-detail-heading">
        <div className="language-feature__meta"><span>NOW SHOWING</span><span>{selected.level}</span></div>
        <h2 id="language-detail-heading">{selected.label}</h2>
        <p>{selected.note}</p>
        <div className="language-feature__tags"><span>Communication</span><span>Engineering</span><span>Academic life</span></div>
      </section>
      <footer className="languages-footer"><span>LANGFLIX</span> Two languages. One portfolio.</footer>
    </section>
  );
}
