import { describe, expect, it } from 'vitest';
import { PORTAL_DELAY_MS, PORTAL_WINDOW_THRESHOLD, shouldRevealPortal } from './portalTrigger';

describe('shouldRevealPortal', () => {
  it('stays hidden at the start of the visit', () => {
    expect(shouldRevealPortal({ openedWindowCount: 0, elapsedMs: 0 })).toBe(false);
  });

  it('stays hidden with a single opened window before the delay', () => {
    expect(shouldRevealPortal({ openedWindowCount: 1, elapsedMs: PORTAL_DELAY_MS - 1 })).toBe(false);
  });

  it('reveals once the window threshold is reached', () => {
    expect(
      shouldRevealPortal({ openedWindowCount: PORTAL_WINDOW_THRESHOLD, elapsedMs: 0 }),
    ).toBe(true);
  });

  it('reveals once the delay elapsed even without any window', () => {
    expect(shouldRevealPortal({ openedWindowCount: 0, elapsedMs: PORTAL_DELAY_MS })).toBe(true);
  });
});
