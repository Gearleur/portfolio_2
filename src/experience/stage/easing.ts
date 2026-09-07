export function clamp01(value: number): number {
  if (value < 0) {
    return 0;
  }

  return value > 1 ? 1 : value;
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

export function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - 2 ** (-10 * t);
}

/*
 * Courbe en S de Perlin (6t^5 - 15t^4 + 10t^3) : vitesse et acceleration nulles
 * aux deux bouts. Le bureau se fige au demarrage, la camera decelere fort a
 * l'arrivee, et la courbe se lit aussi bien a l'envers -- ce dont le retour a
 * besoin, puisqu'il fait descendre la progression de 1 vers 0.
 */
export function smootherstep(t: number): number {
  const x = clamp01(t);

  return x * x * x * (x * (x * 6 - 15) + 10);
}
