import { describe, expect, it } from 'vitest';
import {
  MIN_WINDOW_SIZE,
  clampFrameToDesktop,
  getCenteredFrame,
  getMaximizedFrame,
} from './windowFrame';

function desktop(width: number, height: number) {
  return {
    clientHeight: height,
    clientWidth: width,
    getBoundingClientRect: () => ({ left: 0, top: 0 }),
    scrollLeft: 0,
    scrollTop: 0,
  } as HTMLElement;
}

describe('window frame utilities', () => {
  it('keeps a window within the desktop margins', () => {
    expect(
      clampFrameToDesktop({ x: -100, y: 900, width: 900, height: 900 }, desktop(800, 600)),
    ).toEqual({ x: 12, y: 12, width: 776, height: 576 });
  });

  it('centers a frame after clamping its dimensions', () => {
    expect(getCenteredFrame({ x: 0, y: 0, width: 400, height: 300 }, desktop(800, 600))).toEqual({
      x: 200,
      y: 150,
      width: 400,
      height: 300,
    });
  });

  it('maximizes with margins and preserves minimum dimensions', () => {
    expect(getMaximizedFrame(desktop(200, 180))).toEqual({
      x: 12,
      y: 12,
      width: MIN_WINDOW_SIZE.width,
      height: MIN_WINDOW_SIZE.height,
    });
  });
});
