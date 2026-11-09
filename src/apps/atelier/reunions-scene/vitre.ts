/** The thumbnail is drawn for a card of this width (the Vitrine's) and scales with the picture. */
export const BASE = 518;

/** Where the glass sits: centred, 70 % of the width and 37 % of the height. */
export function placeVitre(W: number, H: number) {
  const w = W * 0.7;
  const h = H * 0.37;
  return { x: (W - w) / 2, y: (H - h) / 2, w, h };
}

/** The light, from the top left, swaying gently (radians, y up). */
export const lumiere = (t: number) => (3 * Math.PI) / 4 + 0.35 * Math.sin(t * 0.3);
