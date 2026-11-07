/* The icons of the Mikky kit (24 × 24, drawn in the current colour). */
const PATHS = {
  folder: 'M3.5 7.5A1.5 1.5 0 0 1 5 6h4l2 2h8a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5z',
  sliders: 'M4 7h9M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1M15 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM9 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM17 15a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  up: 'M12 19V5M6.5 10.5 12 5l5.5 5.5',
  down: 'm6 9.5 6 6 6-6',
  check: 'm6 12.5 4 4 8-9',
  plus: 'M12 5v14M5 12h14',
  more: 'M5.5 12h.01M12 12h.01M18.5 12h.01',
  mic: 'M12 4a2.6 2.6 0 0 0-2.6 2.6v4.8a2.6 2.6 0 0 0 5.2 0V6.6A2.6 2.6 0 0 0 12 4zM6.8 11.2a5.2 5.2 0 0 0 10.4 0M12 16.4V20',
  back: 'm14.5 6-6 6 6 6',
  right: 'm9.5 6 6 6-6 6',
  sparkle: 'M12 4l1.8 4.7 4.7 1.8-4.7 1.8L12 17l-1.8-4.7-4.7-1.8 4.7-1.8z',
  pointer: 'M6 4l12 6.2-5.2 1.6L10.4 17z',
  table: 'M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5zM4 10h16M10 10v10',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name }: { name: IconName }) {
  return (
    <svg className={name === 'more' ? 'mk-icon mk-icon--points' : 'mk-icon'} viewBox="0 0 24 24" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}
