/**
 * Geometry for the technical track drawings: a track is a centre line made of
 * straight and cubic segments, sampled finely, so rails (offset lines),
 * sleepers (rectangles across the tangent) and frogs (where two rails cross)
 * can be drawn exactly along curves.
 */

export type Pt = [number, number];
/** A straight segment to `to`, or a cubic one when `c1` and `c2` are given. */
export type Seg = { to: Pt; c1?: Pt; c2?: Pt };
/** A point on the centre line, its unit tangent and its distance from the start. */
export type Sample = { p: Pt; t: Pt; s: number };

const cubic = (a: Pt, b: Pt, c: Pt, d: Pt, u: number): Pt => {
  const v = 1 - u;
  return [
    v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0],
    v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1],
  ];
};

const dist = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);

/** Samples a centre line about every `step` units. */
export function sampleTrack(start: Pt, segs: Seg[], step = 0.5): Sample[] {
  const points: Pt[] = [start];
  let from = start;
  for (const seg of segs) {
    const { to, c1, c2 } = seg;
    const rough = c1 && c2 ? dist(from, c1) + dist(c1, c2) + dist(c2, to) : dist(from, to);
    const n = Math.max(2, Math.ceil(rough / step));
    for (let i = 1; i <= n; i++) {
      const u = i / n;
      points.push(c1 && c2 ? cubic(from, c1, c2, to, u) : [from[0] + (to[0] - from[0]) * u, from[1] + (to[1] - from[1]) * u]);
    }
    from = to;
  }

  let s = 0;
  return points.map((p, i) => {
    if (i > 0) s += dist(points[i - 1], p);
    const a = points[Math.max(0, i - 1)];
    const b = points[Math.min(points.length - 1, i + 1)];
    const length = dist(a, b) || 1;
    return { p, t: [(b[0] - a[0]) / length, (b[1] - a[1]) / length], s };
  });
}

/** The normal, pointing to the right of the direction of travel (down for a track going right). */
const normal = (t: Pt): Pt => [-t[1], t[0]];

/** A line parallel to the centre line, `d` units to its right (negative: to its left). */
export const offset = (samples: Sample[], d: number): Pt[] =>
  samples.map(({ p, t }) => {
    const n = normal(t);
    return [p[0] + n[0] * d, p[1] + n[1] * d];
  });

export const polyline = (points: Pt[]) =>
  `M${points.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' L')}`;

/** The point and tangent at distance `s` along the centre line. */
export function at(samples: Sample[], s: number): Sample {
  const i = samples.findIndex((sample) => sample.s >= s);
  if (i <= 0) return i === 0 ? samples[0] : samples[samples.length - 1];
  const a = samples[i - 1];
  const b = samples[i];
  const u = (s - a.s) / (b.s - a.s || 1);
  return { p: [a.p[0] + (b.p[0] - a.p[0]) * u, a.p[1] + (b.p[1] - a.p[1]) * u], t: b.t, s };
}

/** The centre line's y where it passes `x` (for lines that run left to right). */
export function yAt(samples: Sample[], x: number): number | undefined {
  const i = samples.findIndex((sample) => sample.p[0] >= x);
  if (i <= 0) return i === 0 ? samples[0].p[1] : undefined;
  const a = samples[i - 1].p;
  const b = samples[i].p;
  return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0] || 1);
}

/** A rectangle across the track at a sample: `w` along it, from `left` to `right` across it. */
export function across({ p, t }: Sample, w: number, left: number, right: number): Pt[] {
  const n = normal(t);
  const corner = (along: number, side: number): Pt => [p[0] + t[0] * along + n[0] * side, p[1] + t[1] * along + n[1] * side];
  return [corner(-w / 2, -left), corner(w / 2, -left), corner(w / 2, right), corner(-w / 2, right)];
}

/** Where two lines first cross, if they do. */
export function intersect(a: Pt[], b: Pt[]): Pt | undefined {
  for (let i = 1; i < a.length; i++) {
    for (let j = 1; j < b.length; j++) {
      const [p, r] = [a[i - 1], [a[i][0] - a[i - 1][0], a[i][1] - a[i - 1][1]]];
      const [q, v] = [b[j - 1], [b[j][0] - b[j - 1][0], b[j][1] - b[j - 1][1]]];
      const cross = r[0] * v[1] - r[1] * v[0];
      if (Math.abs(cross) < 1e-9) continue;
      const u = ((q[0] - p[0]) * v[1] - (q[1] - p[1]) * v[0]) / cross;
      const w = ((q[0] - p[0]) * r[1] - (q[1] - p[1]) * r[0]) / cross;
      if (u >= 0 && u <= 1 && w >= 0 && w <= 1) return [p[0] + r[0] * u, p[1] + r[1] * u];
    }
  }
  return undefined;
}

/** The distance along the centre line of the sample nearest to a point. */
export function nearest(samples: Sample[], point: Pt): number {
  let best = samples[0];
  for (const sample of samples) if (dist(sample.p, point) < dist(best.p, point)) best = sample;
  return best.s;
}
