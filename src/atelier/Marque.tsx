import { LOGOS } from './logos';
import type { LogoId } from './logos';

/** A brand mark in its own colour, inline in the text, 1em high by default. */
export function Marque({ id, className }: { id: LogoId; className?: string }) {
  const logo = LOGOS[id];
  return (
    <svg className={className ?? 'marque'} viewBox="0 0 24 24" role="img" aria-label={logo.titre}>
      <path d={logo.path} fill={logo.couleur} />
    </svg>
  );
}

/**
 * Brand marks as small tabs on a diagram box's top edge, right-aligned from
 * `right`: a paper patch hides the box's border behind each mark.
 */
export function Pastilles({ ids, right, top }: { ids: LogoId[]; right: number; top: number }) {
  const size = 14;
  const pad = 3;
  return (
    <g className="sc-pastilles">
      {ids.map((id, index) => {
        const x = right - (index + 1) * (size + 2 * pad) - index * 2;
        const logo = LOGOS[id];
        return (
          <g key={id}>
            <rect className="sc-pastille" x={x} y={top - size / 2 - pad} width={size + 2 * pad} height={size + 2 * pad} rx="3" />
            <g transform={`translate(${x + pad} ${top - size / 2}) scale(${size / 24})`}>
              <path d={logo.path} fill={logo.couleur}>
                <title>{logo.titre}</title>
              </path>
            </g>
          </g>
        );
      })}
    </g>
  );
}
