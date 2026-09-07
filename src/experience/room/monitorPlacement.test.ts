import { describe, expect, it } from 'vitest';
import {
  CRT_MONITOR_POSITION,
  CRT_MONITOR_ROTATION,
  CRT_MONITOR_ROTATION_Y,
  CRT_SCREEN_LOCAL_POSITION,
  CRT_SCREEN_PLANE,
  crtScreenWorldPose,
} from './monitorPlacement';

describe('crtScreenWorldPose', () => {
  it('keeps the rotation tuple and the scalar in step', () => {
    expect(CRT_MONITOR_ROTATION).toEqual([0, CRT_MONITOR_ROTATION_Y, 0]);
  });

  it('places the screen in front of the monitor along its own normal', () => {
    const { center, normal } = crtScreenWorldPose();
    const forward = CRT_SCREEN_LOCAL_POSITION[2];

    expect(center[0]).toBeCloseTo(CRT_MONITOR_POSITION[0] + normal[0] * forward, 10);
    expect(center[1]).toBeCloseTo(CRT_MONITOR_POSITION[1] + CRT_SCREEN_LOCAL_POSITION[1], 10);
    expect(center[2]).toBeCloseTo(CRT_MONITOR_POSITION[2] + normal[2] * forward, 10);
  });

  it('returns a unit normal', () => {
    const { normal } = crtScreenWorldPose();
    expect(Math.hypot(normal[0], normal[1], normal[2])).toBeCloseTo(1, 10);
  });

  it('describes a landscape screen', () => {
    expect(CRT_SCREEN_PLANE.width).toBeGreaterThan(CRT_SCREEN_PLANE.height);
  });
});
