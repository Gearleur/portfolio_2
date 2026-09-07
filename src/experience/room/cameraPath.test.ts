import { describe, expect, it } from 'vitest';
import { PULLBACK_PATH, sampleCameraPath } from './cameraPath';

describe('sampleCameraPath', () => {
  it('returns the first keyframe at t = 0', () => {
    expect(sampleCameraPath(PULLBACK_PATH, 0).position).toEqual(PULLBACK_PATH[0].position);
  });

  it('returns the last keyframe at t = 1', () => {
    const last = PULLBACK_PATH[PULLBACK_PATH.length - 1];
    expect(sampleCameraPath(PULLBACK_PATH, 1).position).toEqual(last.position);
  });

  it('clamps outside the unit range', () => {
    expect(sampleCameraPath(PULLBACK_PATH, -4).position).toEqual(PULLBACK_PATH[0].position);
    expect(sampleCameraPath(PULLBACK_PATH, 4).position).toEqual(
      PULLBACK_PATH[PULLBACK_PATH.length - 1].position,
    );
  });

  it('interpolates between two keyframes', () => {
    const path = [
      {
        t: 0,
        position: [0, 0, 0] as [number, number, number],
        lookAt: [0, 0, 0] as [number, number, number],
      },
      {
        t: 1,
        position: [10, 0, 0] as [number, number, number],
        lookAt: [0, 0, 0] as [number, number, number],
      },
    ];

    expect(sampleCameraPath(path, 0.5).position[0]).toBeCloseTo(5, 5);
  });

  it('moves the camera backwards along Z during the pullback', () => {
    const start = sampleCameraPath(PULLBACK_PATH, 0).position[2];
    const end = sampleCameraPath(PULLBACK_PATH, 1).position[2];
    expect(end).toBeGreaterThan(start);
  });
});
