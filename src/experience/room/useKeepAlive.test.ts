import { describe, expect, it } from 'vitest';
import { KEEP_ALIVE_MS, shouldKeepCanvasMounted } from './useKeepAlive';

describe('shouldKeepCanvasMounted', () => {
  it('keeps the canvas while the room is rendering', () => {
    expect(shouldKeepCanvasMounted({ renderer: 'webgl', msSinceLeftRoom: 99_000 })).toBe(true);
  });

  it('keeps the canvas warm right after leaving the room', () => {
    expect(shouldKeepCanvasMounted({ renderer: 'none', msSinceLeftRoom: 0 })).toBe(true);
    expect(shouldKeepCanvasMounted({ renderer: 'none', msSinceLeftRoom: KEEP_ALIVE_MS - 1 })).toBe(
      true,
    );
  });

  it('releases the canvas once the grace period elapsed', () => {
    expect(shouldKeepCanvasMounted({ renderer: 'none', msSinceLeftRoom: KEEP_ALIVE_MS })).toBe(
      false,
    );
  });

  it('keeps the fallback mounted while it renders', () => {
    expect(shouldKeepCanvasMounted({ renderer: 'fallback', msSinceLeftRoom: 99_000 })).toBe(true);
  });
});
