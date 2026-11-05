import { oklchCss, oklchToHex } from './color';
import { percent } from './format';
import { ACCENT, APPOINT, FOND, INK_COLORS } from './tokens';

// Step 0, validated on 2026-11-05 (docs/atelier/README.md, section 7).
const BRIEF: [string, string][] = [
  ['Trois mots', 'AI engineer · du prototype à la production · expérimentation'],
  ['Pour qui', 'Les recruteurs d’abord, des clients ensuite'],
  ['En 5 secondes', 'Ce que je sais faire en IA : les dernières technologies mises en service, avec une vraie adoption grâce à l’UI/UX'],
  ['On refuse', 'Le fouillis et les idées en vrac : la page est construite'],
  ['Langues', 'La Vitrine en français et en anglais'],
  ['Adresses', '/portfolio/ pour la Vitrine, /atelier/ pour l’Atelier'],
];

type Card = {
  label: string;
  value: string;
  code?: string;
  swatch?: string;
  swatches?: string[];
  cube?: boolean;
  note: string;
  step: number;
};

/** Everything validated so far, at the top of the Atelier. It grows with each step. */
export function Charte() {
  const { grain, wave } = FOND;
  const cards: Card[] = [
    { label: 'Accent', value: ACCENT.name, code: ACCENT.hex, swatch: ACCENT.hex, note: 'Curseur, sélection, surbrillance', step: 1 },
    { label: 'Fond', value: 'Clair et uni', code: oklchToHex(FOND.color).toUpperCase(), swatch: oklchCss(FOND.color), note: oklchCss(FOND.color), step: 1 },
    {
      label: 'Encres',
      value: 'Noir',
      swatches: [INK_COLORS.ink, INK_COLORS.soft, INK_COLORS.line],
      note: `Encre ${INK_COLORS.ink.toUpperCase()} · douce ${INK_COLORS.soft.toUpperCase()} · filet ${INK_COLORS.line.toUpperCase()}`,
      step: 2,
    },
    {
      label: 'Appoint',
      value: 'Snow crimson',
      swatches: APPOINT.map((color) => color.hex),
      note: 'Sept couleurs gardées en plus. Les rôles viendront avec les composants.',
      step: 2,
    },
    { label: 'Grain', value: percent(grain.strength), note: `Taille ${percent(grain.size)} · irrégularité ${percent(grain.irregularity)}`, step: 1 },
    {
      label: 'Onde',
      value: 'Neige vermillon',
      swatch: `conic-gradient(${wave.colors.join(', ')})`,
      note: `Du coin haut droit vers le bas gauche. Arrivée à ${percent(wave.first)}, puis ${percent(wave.echo)} toutes les ${wave.every} s environ.`,
      step: 1,
    },
    { label: 'Curseur', value: 'Petit cube', cube: true, note: 'Couleur accent. Sa forme exacte viendra avec les composants.', step: 1 },
    { label: 'Lumière', value: 'Aucune', note: 'Pas d’ombre de fenêtre', step: 1 },
  ];

  return (
    <section className="charte" aria-labelledby="charte-title">
      <header className="charte__head">
        <h2 id="charte-title">La charte</h2>
        <p>Tout ce qu’on a validé ensemble. Elle se remplit à chaque étape.</p>
      </header>
      <div className="charte__body">
        <dl className="charte__brief">
          {BRIEF.map(([term, detail]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{detail}</dd>
            </div>
          ))}
        </dl>
        <ul className="charte__cards">
          {cards.map((card) => (
            <li key={card.label}>
              <span className="charte__label">
                {card.label} <span>étape {card.step}</span>
              </span>
              <span className="charte__value">
                {card.swatch && <span className="charte__swatch" style={{ background: card.swatch }} />}
                {card.cube && <span className="charte__cube" style={{ background: ACCENT.hex }} />}
                {card.value}
                {card.code && <code>{card.code}</code>}
              </span>
              {card.swatches && (
                <span className="charte__swatches">
                  {card.swatches.map((color, index) => (
                    <span key={`${color}-${index}`} style={{ background: color }} />
                  ))}
                </span>
              )}
              <span className="charte__note">{card.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
