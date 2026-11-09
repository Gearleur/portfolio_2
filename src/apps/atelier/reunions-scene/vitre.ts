/** The thumbnail is drawn for a card of this width (the Vitrine's) and scales with the picture. */
export const BASE = 518;

/** The background film's length, in seconds: everything in it comes back to its start (journal n° 105). */
export const BOUCLE = 16;

/** Where the glass sits: centred, 70 % of the width and 37 % of the height. */
export function placeVitre(W: number, H: number) {
  const w = W * 0.7;
  const h = H * 0.37;
  return { x: (W - w) / 2, y: (H - h) / 2, w, h };
}

/** The light, from the top left, swaying gently, once per loop (radians, y up). */
export const lumiere = (t: number) => (3 * Math.PI) / 4 + 0.35 * Math.sin((2 * Math.PI * t) / BOUCLE);
