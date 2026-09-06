import { describe, expect, it } from 'vitest';
import { GHOST_DELAY_MS, READ_ME_DELAY_MS, nextOnboardingPhase } from './onboardingPhase';

const base = {
  hasSeenBefore: false,
  hasInteracted: false,
  elapsedMs: 0,
  prefersReducedMotion: false,
  isPortalReady: false,
};

describe('nextOnboardingPhase', () => {
  it('stays hidden before the readme delay', () => {
    expect(nextOnboardingPhase({ ...base, elapsedMs: READ_ME_DELAY_MS - 1 })).toBe('hidden');
  });

  it('shows the readme once the delay passed', () => {
    expect(nextOnboardingPhase({ ...base, elapsedMs: READ_ME_DELAY_MS })).toBe('readme');
  });

  it('adds the ghost cursor after the inactivity delay', () => {
    expect(
      nextOnboardingPhase({ ...base, elapsedMs: READ_ME_DELAY_MS + GHOST_DELAY_MS }),
    ).toBe('readme-and-ghost');
  });

  it('never shows the ghost cursor with reduced motion', () => {
    expect(
      nextOnboardingPhase({
        ...base,
        elapsedMs: READ_ME_DELAY_MS + GHOST_DELAY_MS,
        prefersReducedMotion: true,
      }),
    ).toBe('readme');
  });

  it('is done once the visitor interacted', () => {
    expect(nextOnboardingPhase({ ...base, elapsedMs: 99_000, hasInteracted: true })).toBe('done');
  });

  it('is done for a returning visitor', () => {
    expect(nextOnboardingPhase({ ...base, elapsedMs: 99_000, hasSeenBefore: true })).toBe('done');
  });

  it('is done as soon as the portal is ready', () => {
    expect(nextOnboardingPhase({ ...base, elapsedMs: 99_000, isPortalReady: true })).toBe('done');
  });
});
