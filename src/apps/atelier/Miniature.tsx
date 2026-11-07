import { useRef } from 'react';
import type { CSSProperties, PointerEvent, ReactNode } from 'react';
import { Aiguillage } from './Aiguillage';
import type { Cadrage } from './Aiguillage';
import './miniature.css';

// Brushed metal: noise stretched along x, so it reads as fine streaks.
const BRUSHED = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>` +
    `<filter id='b' x='0' y='0' width='100%' height='100%'>` +
    `<feTurbulence type='fractalNoise' baseFrequency='0.004 0.9' numOctaves='2' seed='3' stitchTiles='stitch'/>` +
    `<feColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0.9 -0.2'/>` +
    `</filter><rect width='100%' height='100%' filter='url(#b)'/></svg>`,
)}")`;

/**
 * The finish retained at step 7 (journal n° 66): iridescent aluminium, the
 * drawing engraved in it. The light and the wave's colours reflected in the
 * metal follow the pointer, and drift back when it leaves.
 */
function Metal({ cadrage, children }: { cadrage?: Cadrage; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const move = (event: PointerEvent) => {
    const box = event.currentTarget.getBoundingClientRect();
    ref.current?.style.setProperty('--mx', `${(((event.clientX - box.left) / box.width) * 100).toFixed(1)}%`);
    ref.current?.style.setProperty('--my', `${(((event.clientY - box.top) / box.height) * 100).toFixed(1)}%`);
  };
  const leave = () => {
    ref.current?.style.removeProperty('--mx');
    ref.current?.style.removeProperty('--my');
  };

  return (
    <span
      ref={ref}
      className="miniature"
      data-cadrage={cadrage}
      style={{ '--brushed': BRUSHED } as CSSProperties}
      onPointerMove={move}
      onPointerLeave={leave}
    >
      {children}
    </span>
  );
}

/** SNCF GPT's thumbnail: the three-way turnout in a detail view, in iridescent aluminium. */
export function Miniature({ cadrage = 'paysage' }: { cadrage?: Cadrage }) {
  return (
    <Metal cadrage={cadrage}>
      <Aiguillage cadrage={cadrage} />
    </Metal>
  );
}
