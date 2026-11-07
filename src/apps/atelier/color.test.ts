import { describe, expect, it } from 'vitest';
import { contrastRatio, oklchCss, oklchToHex } from './color';

describe('oklchToHex', () => {
  it('maps the achromatic ends to black and white', () => {
    expect(oklchToHex({ lightness: 0, chroma: 0, hue: 0 })).toBe('#000000');
    expect(oklchToHex({ lightness: 1, chroma: 0, hue: 0 })).toBe('#ffffff');
  });

  it('matches a known sRGB colour', () => {
    // CSS Color 4 reference: oklch(0.628 0.2577 29.23) is pure red.
    expect(oklchToHex({ lightness: 0.628, chroma: 0.2577, hue: 29.23 })).toBe('#ff0000');
  });

  it('clamps out-of-gamut colours instead of overflowing', () => {
    expect(oklchToHex({ lightness: 0.9, chroma: 0.4, hue: 140 })).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe('oklchCss', () => {
  it('writes a CSS oklch() value', () => {
    expect(oklchCss({ lightness: 0.93, chroma: 0.008, hue: 250 })).toBe('oklch(0.930 0.008 250)');
  });
});

describe('contrastRatio', () => {
  it('spans 1 to 21 and ignores argument order', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21);
    expect(contrastRatio('#8E0F24', '#8E0F24')).toBe(1);
    expect(contrastRatio('#ffffff', '#EA3F1C')).toBeCloseTo(contrastRatio('#EA3F1C', '#ffffff'));
  });

  it('matches the ratios logged for the accents', () => {
    expect(contrastRatio('#8E0F24', '#F8F9F6')).toBeCloseTo(8.86, 2);
    expect(contrastRatio('#ffffff', '#EA3F1C')).toBeCloseTo(4.02, 2);
  });
});
