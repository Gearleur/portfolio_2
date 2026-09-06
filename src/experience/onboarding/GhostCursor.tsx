import { GHOST_MAX_LOOPS } from './onboardingPhase';
import './onboarding.css';

export function GhostCursor() {
  return (
    <img
      className="ghost-cursor"
      src="/assets/cursors/ghost-pointer.svg"
      alt=""
      aria-hidden="true"
      style={{ animationIterationCount: GHOST_MAX_LOOPS }}
    />
  );
}
