export type GrainSettings = {
  /** Opacity of the specks, 0–1. */
  strength: number;
  /** 1 is the reference grain; above 1 the specks get bigger. */
  size: number;
  /** 0 keeps one speck size; towards 1 coarser specks mix in, like film. */
  irregularity: number;
};

export const GRAIN_TILE = 320;

/**
 * Builds the grain as an SVG data URL of dark specks: two noises of different
 * scales are mixed, then only their peaks are kept, so specks vary in size and
 * spacing instead of reading as an even screen. The large tile keeps the
 * repetition out of sight.
 */
export function grainImage({ size, irregularity }: Pick<GrainSettings, 'size' | 'irregularity'>) {
  const fine = (0.95 / size).toFixed(3);
  const coarse = (0.42 / size).toFixed(3);
  const coarseWeight = 0.6 * irregularity;
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${GRAIN_TILE}' height='${GRAIN_TILE}'>` +
    `<filter id='g' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>` +
    `<feTurbulence type='fractalNoise' baseFrequency='${fine}' numOctaves='3' seed='7' stitchTiles='stitch' result='fine'/>` +
    `<feTurbulence type='fractalNoise' baseFrequency='${coarse}' numOctaves='3' seed='11' stitchTiles='stitch' result='coarse'/>` +
    `<feComposite in='fine' in2='coarse' operator='arithmetic' k2='${(1 - coarseWeight).toFixed(3)}' k3='${coarseWeight.toFixed(3)}'/>` +
    `<feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 6 0 0 0 -3.1'/>` +
    `</filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
