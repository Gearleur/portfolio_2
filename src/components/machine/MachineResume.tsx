import { useCopyText } from '../../hooks/useCopyText';
import { MachineResumeDocument } from './MachineResumeDocument';
import { getMachineResumeMarkdown } from './machineResumeMarkdown';
import './machineMode.css';

export function MachineResume() {
  const { copy, state: copyState } = useCopyText();

  const handleCopy = async () => {
    await copy(getMachineResumeMarkdown());
  };

  const copyLabel = copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Retry' : 'Copy all';

  return (
    <main className="machine-resume" aria-labelledby="machine-resume-title">
      <div className="machine-resume__rail machine-resume__rail--left" aria-hidden="true" />
      <div className="machine-resume__rail machine-resume__rail--right" aria-hidden="true" />

      <button
        className={`machine-copy-button machine-copy-button--${copyState}`}
        type="button"
        onClick={handleCopy}
        aria-label="Copy the complete CV as Markdown"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <rect x="5" y="5" width="8" height="9" rx="1" />
          <path d="M3 11H2.8A.8.8 0 0 1 2 10.2V2.8A.8.8 0 0 1 2.8 2h7.4a.8.8 0 0 1 .8.8V3" />
        </svg>
        <span>{copyLabel}</span>
      </button>
      <span className="machine-copy-status" role="status" aria-live="polite">
        {copyState === 'copied' ? 'Complete CV copied to clipboard.' : copyState === 'error' ? 'Unable to copy. Try again.' : ''}
      </span>

      <MachineResumeDocument />
    </main>
  );
}
