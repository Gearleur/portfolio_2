import { useEffect, useRef, useState } from 'react';
import { CATEGORIES, FONTS, ROLES, describeAxes, ensureFont, fontStack } from './typotheque';
import type { CatalogFont, Category, FontChoice, Role } from './typotheque';

type TypothequeProps = { choice: FontChoice; onAssign: (role: Role, id: string) => void };

/** The font catalogue: try any face on the stand-in page by giving it a role. */
export function Typotheque({ choice, onAssign }: TypothequeProps) {
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [sample, setSample] = useState('Du prototype à la production');
  const shown = filter === 'all' ? FONTS : FONTS.filter((font) => font.category === filter);

  return (
    <div className="typotheque">
      <h3>
        Typothèque{' '}
        <span>
          {FONTS.length} polices libres (licence OFL ou domaine public), hébergées avec le site. Donne un rôle à une police pour l’essayer
          sur la page témoin.
        </span>
      </h3>

      <div className="typotheque__tools">
        <div className="atelier-segment" role="group" aria-label="Catégorie">
          <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
            Toutes <span>{FONTS.length}</span>
          </button>
          {CATEGORIES.map((category) => (
            <button key={category.id} type="button" aria-pressed={filter === category.id} onClick={() => setFilter(category.id)}>
              {category.name} <span>{FONTS.filter((font) => font.category === category.id).length}</span>
            </button>
          ))}
        </div>
        <label className="typotheque__sample">
          <span>Texte d’essai</span>
          <input value={sample} onChange={(event) => setSample(event.target.value)} />
        </label>
      </div>

      <ul className="typotheque__grid">
        {shown.map((font) => (
          <FontCard key={font.id} font={font} sample={sample || font.family} choice={choice} onAssign={onAssign} />
        ))}
      </ul>
    </div>
  );
}

type FontCardProps = { font: CatalogFont; sample: string; choice: FontChoice; onAssign: (role: Role, id: string) => void };

function FontCard({ font, sample, choice, onAssign }: FontCardProps) {
  const ref = useRef<HTMLLIElement>(null);
  const [ready, setReady] = useState(!font.file);

  // Load the face only when its card comes near the screen.
  useEffect(() => {
    const card = ref.current;
    if (ready || !card) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        void ensureFont(font).then(() => setReady(true));
      },
      { rootMargin: '400px' },
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, [font, ready]);

  const category = CATEGORIES.find((item) => item.id === font.category)?.name;
  const family = { fontFamily: fontStack(font) };

  return (
    <li ref={ref} className="typo-card" data-ready={ready}>
      <p className="typo-card__head">
        <span className="typo-card__name">{font.family}</span>
        <span className="typo-card__category">{category}</span>
      </p>
      <p className="typo-card__sample" style={family}>
        {sample}
      </p>
      <p className="typo-card__alphabet" style={family}>
        Aa Bb Gg Rr 0123 éàç ?!
      </p>
      <p className="typo-card__note">{font.note}</p>
      <p className="typo-card__meta">{describeAxes(font)}</p>
      <div className="typo-card__roles" role="group" aria-label={`Utiliser ${font.family} pour`}>
        {ROLES.map((role) => (
          <button key={role.id} type="button" aria-pressed={choice[role.id] === font.id} onClick={() => onAssign(role.id, font.id)}>
            {role.name}
          </button>
        ))}
      </div>
    </li>
  );
}
