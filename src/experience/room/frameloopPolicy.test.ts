import { describe, expect, it } from 'vitest';
import { resolveFrameloop } from './frameloopPolicy';

describe('resolveFrameloop', () => {
  it('runs when the room is active and the tab is visible', () => {
    expect(resolveFrameloop({ isIdle: false, isDocumentHidden: false })).toBe('always');
  });

  it('stops when the canvas is idle, even with the tab visible', () => {
    expect(resolveFrameloop({ isIdle: true, isDocumentHidden: false })).toBe('never');
  });

  it('stops when the tab is hidden, even while the room is active', () => {
    expect(resolveFrameloop({ isIdle: false, isDocumentHidden: true })).toBe('never');
  });

  it('stops when both conditions ask for it, and neither alone can undo it', () => {
    expect(resolveFrameloop({ isIdle: true, isDocumentHidden: true })).toBe('never');
  });
});
