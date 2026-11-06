/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrastRatio, oklchToHex } from './color';
import { ACCENT, ESPACES, FOND, INK_COLORS, TYPO } from './tokens';

// Read from disk: Vitest swaps stylesheets for empty modules, even with ?raw.
const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');

describe('validated tokens', () => {
  it('keeps tokens.css in step with the accent', () => {
    expect(css).toContain(`--accent: ${ACCENT.hex.toLowerCase()};`);
    expect(css).toContain(`--on-accent: ${ACCENT.onAccent.toLowerCase()};`);
  });

  it('keeps tokens.css in step with the background colour', () => {
    expect(css).toContain(`--fond: ${oklchToHex(FOND.color)};`);
  });

  it('keeps tokens.css in step with the inks', () => {
    expect(css).toContain(`--ink: ${INK_COLORS.ink};`);
    expect(css).toContain(`--ink-soft: ${INK_COLORS.soft};`);
    expect(css).toContain(`--line: ${INK_COLORS.line};`);
  });

  it('keeps tokens.css in step with the type', () => {
    expect(css).toContain(`--font-display: '${TYPO.display.family}',`);
    expect(css).toContain(`--font-text: '${TYPO.text.family}',`);
    expect(css).toContain(`--font-label: '${TYPO.label.family}',`);
    expect(css).toContain(`--size-display: ${TYPO.display.size};`);
    expect(css).toContain(`--size-text: ${TYPO.text.size};`);
    expect(css).toContain(`--size-label: ${TYPO.label.size};`);
    expect(css).toContain(`--type-ratio: ${TYPO.ratio};`);
    expect(css).toContain(`--display-weight: ${TYPO.display.weight};`);
    expect(css).toContain(`--display-tracking: ${TYPO.display.tracking}em;`);
    expect(css).toContain(`--label-case: ${TYPO.label.caps ? 'uppercase' : 'none'};`);
  });

  it('keeps tokens.css in step with the spacing and the grid', () => {
    expect(ESPACES.scale).toEqual([1, 2, 3, 4, 6, 8, 12, 16].map((step) => step * ESPACES.base));
    ESPACES.scale.forEach((value, index) => expect(css).toContain(`--space-${index + 1}: ${value};`));
    expect(css).toContain(`--cols: ${ESPACES.columns};`);
    expect(css).toContain(`--gutter: ${ESPACES.gutter};`);
    expect(css).toContain(`--margin: ${ESPACES.margin};`);
  });

  it('keeps both inks readable on the background (WCAG AA, 4.5:1)', () => {
    const fond = oklchToHex(FOND.color);
    expect(contrastRatio(INK_COLORS.ink, fond)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(INK_COLORS.soft, fond)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps selected text readable (WCAG AA, 4.5:1)', () => {
    expect(contrastRatio(ACCENT.onAccent, ACCENT.hex)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps the cube cursor visible on the background (3:1 for UI)', () => {
    expect(contrastRatio(ACCENT.hex, oklchToHex(FOND.color))).toBeGreaterThanOrEqual(3);
  });
});
