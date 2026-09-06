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
