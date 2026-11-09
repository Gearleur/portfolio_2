/**
 * The refraction filter of the phone's notch: a displacement map, neutral grey in the middle and
 * pushing the page inward along each edge, like the bevel of a loupe. It is declared once per
 * page, and the notch's CSS (steps/navmobile.css) points at it. Where the browser cannot use an
 * SVG filter in a backdrop (Safari), the notch keeps its frosted glass.
 */
export function FiltreVerre() {
  const carte = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='366' height='56'>` +
      `<defs>` +
      `<linearGradient id='g' x1='0' x2='1' y1='0' y2='0'><stop offset='0' stop-color='rgb(255,128,128)'/><stop offset='1' stop-color='rgb(128,128,128)'/></linearGradient>` +
      `<linearGradient id='d' x1='0' x2='1' y1='0' y2='0'><stop offset='0' stop-color='rgb(128,128,128)'/><stop offset='1' stop-color='rgb(0,128,128)'/></linearGradient>` +
      `<linearGradient id='h' x1='0' x2='0' y1='0' y2='1'><stop offset='0' stop-color='rgb(128,255,128)'/><stop offset='1' stop-color='rgb(128,128,128)'/></linearGradient>` +
      `<linearGradient id='b' x1='0' x2='0' y1='0' y2='1'><stop offset='0' stop-color='rgb(128,128,128)'/><stop offset='1' stop-color='rgb(128,0,128)'/></linearGradient>` +
      `</defs>` +
      `<rect width='366' height='56' fill='rgb(128,128,128)'/>` +
      `<rect width='22' height='56' fill='url(#g)'/><rect x='344' width='22' height='56' fill='url(#d)'/>` +
      `<rect width='366' height='12' fill='url(#h)' opacity='.8'/><rect y='44' width='366' height='12' fill='url(#b)' opacity='.8'/>` +
      `</svg>`,
  );
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
      <filter id="verre-refraction" x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
        <feImage href={`data:image/svg+xml;charset=utf-8,${carte}`} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="carte" />
        <feDisplacementMap in="SourceGraphic" in2="carte" scale="30" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}
