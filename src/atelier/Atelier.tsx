import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { Charte } from './Charte';
import { CheminStep } from './steps/CheminStep';
import { CouleursStep } from './steps/CouleursStep';
import { EspacesStep } from './steps/EspacesStep';
import { FondStep } from './steps/FondStep';
import { TypoStep } from './steps/TypoStep';

type Step = { n: number; name: string; status: 'valide' | 'en-cours' | 'a-venir' };

// Mirrors the plan in docs/atelier/README.md, section 5.
const STEPS: Step[] = [
  { n: 1, name: 'Le fond', status: 'valide' },
  { n: 2, name: 'Les couleurs', status: 'valide' },
  { n: 3, name: 'La typo', status: 'valide' },
  { n: 4, name: 'Espaces et grille', status: 'valide' },
  { n: 5, name: 'Chemin de fer', status: 'en-cours' },
  { n: 6, name: 'Composants', status: 'a-venir' },
  { n: 7, name: 'Contenu', status: 'a-venir' },
  { n: 8, name: 'Vitrine', status: 'a-venir' },
  { n: 9, name: 'Finitions', status: 'a-venir' },
  { n: 10, name: 'Mise en ligne', status: 'a-venir' },
];

const STEP_VIEWS: Record<number, () => JSX.Element> = { 1: FondStep, 2: CouleursStep, 3: TypoStep, 4: EspacesStep, 5: CheminStep };
// The step in progress, or the last one built when everything shown is validated.
const CURRENT = STEPS.find((step) => step.status === 'en-cours')?.n ?? Math.max(...Object.keys(STEP_VIEWS).map(Number));

/** The step shown comes from the URL (#etape-1), so a step can be linked and the back button works. */
function stepFromHash() {
  const n = Number(/^#etape-(\d+)$/.exec(window.location.hash)?.[1]);
  return n in STEP_VIEWS ? n : CURRENT;
}

const label = (n: number) => String(n).padStart(2, '0');

export function Atelier() {
  const [active, setActive] = useState(stepFromHash);

  useEffect(() => {
    const sync = () => setActive(stepFromHash());
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const View = STEP_VIEWS[active];

  return (
    <main className="atelier-canvas">
      <header className="atelier-head">
        <h1>Atelier</h1>
        <p>
          Portfolio argile · étape {CURRENT} / {STEPS.length}
        </p>
      </header>

      <Charte />

      <nav className="atelier-steps" aria-label="Étapes">
        <ol>
          {STEPS.map((step) => (
            <li key={step.n}>
              {step.n in STEP_VIEWS ? (
                <a
                  className="atelier-steps__item"
                  href={`#etape-${step.n}`}
                  data-status={step.status}
                  aria-current={step.n === active ? 'step' : undefined}
                >
                  <span>{label(step.n)}</span> {step.name}
                </a>
              ) : (
                <span className="atelier-steps__item" data-status={step.status} aria-disabled="true">
                  <span>{label(step.n)}</span> {step.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <View key={active} />
    </main>
  );
}
