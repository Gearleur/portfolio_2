import { describe, expect, it } from 'vitest';
import {
  SHADER_SWAP_RATIO,
  cssPerspectiveFromFov,
  fitScaleForScreen,
  getCameraCssMatrix,
  getObjectCssMatrix,
  shouldSwapToShader,
} from './screenProjection';

const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

describe('cssPerspectiveFromFov', () => {
  it('matches the three.js perspective for a 90 degree field of view', () => {
    expect(cssPerspectiveFromFov(90, 1000)).toBeCloseTo(500, 5);
  });

  it('grows as the field of view narrows', () => {
    expect(cssPerspectiveFromFov(30, 1000)).toBeGreaterThan(cssPerspectiveFromFov(60, 1000));
  });

  it('scales linearly with the viewport height', () => {
    expect(cssPerspectiveFromFov(45, 2000)).toBeCloseTo(cssPerspectiveFromFov(45, 1000) * 2, 5);
  });
});

describe('shouldSwapToShader', () => {
  it('keeps the DOM while the screen is readable', () => {
    expect(shouldSwapToShader(0.55)).toBe(false);
  });

  it('swaps once below the threshold', () => {
    expect(shouldSwapToShader(SHADER_SWAP_RATIO - 0.01)).toBe(true);
  });
});

describe('css matrix formatting', () => {
  it('flips the Y axis for the camera matrix', () => {
    expect(getCameraCssMatrix(IDENTITY)).toBe('matrix3d(1,0,0,0,0,-1,0,0,0,0,1,0,0,0,0,1)');
  });

  it('flips the second column for the object matrix', () => {
    expect(getObjectCssMatrix(IDENTITY)).toBe(
      'translate(-50%,-50%) matrix3d(1,0,0,0,0,-1,0,0,0,0,1,0,0,0,0,1)',
    );
  });
});

describe('fitScaleForScreen', () => {
  it('fits a wide viewport against the plane width', () => {
    const scale = fitScaleForScreen(1440, 900, 1.78, 1.34);
    expect(scale * 1440).toBeCloseTo(1.78, 10);
    expect(scale * 900).toBeLessThanOrEqual(1.34);
  });

  it('fits a tall viewport against the plane height', () => {
    const scale = fitScaleForScreen(390, 844, 1.78, 1.34);
    expect(scale * 844).toBeCloseTo(1.34, 10);
    expect(scale * 390).toBeLessThanOrEqual(1.78);
  });

  it('stays positive when the viewport has no measurable size yet', () => {
    expect(fitScaleForScreen(0, 0, 1.78, 1.34)).toBeGreaterThan(0);
  });
});
