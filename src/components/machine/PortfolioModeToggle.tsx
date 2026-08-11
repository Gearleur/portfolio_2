export type PortfolioMode = 'human' | 'machine';

type PortfolioModeToggleProps = {
  mode: PortfolioMode;
  onChange: (mode: PortfolioMode) => void;
};

export function PortfolioModeToggle({ mode, onChange }: PortfolioModeToggleProps) {
  return (
    <div className={`portfolio-mode-toggle portfolio-mode-toggle--${mode}`} role="group" aria-label="Portfolio display mode">
      <button
        type="button"
        className="portfolio-mode-toggle__option"
        aria-pressed={mode === 'human'}
        onClick={() => onChange('human')}
      >
        <span className="portfolio-mode-toggle__dot" aria-hidden="true" />
        Human
      </button>
      <button
        type="button"
        className="portfolio-mode-toggle__option"
        aria-pressed={mode === 'machine'}
        onClick={() => onChange('machine')}
      >
        <span className="portfolio-mode-toggle__dot" aria-hidden="true" />
        Machine
      </button>
    </div>
  );
}
