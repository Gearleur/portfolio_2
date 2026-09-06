export const PORTAL_WINDOW_THRESHOLD = 2;
export const PORTAL_DELAY_MS = 40_000;

export function shouldRevealPortal(input: {
  openedWindowCount: number;
  elapsedMs: number;
}): boolean {
  return (
    input.openedWindowCount >= PORTAL_WINDOW_THRESHOLD || input.elapsedMs >= PORTAL_DELAY_MS
  );
}
