export type Oklch = { lightness: number; chroma: number; hue: number };

export function oklchCss({ lightness, chroma, hue }: Oklch) {
  return `oklch(${lightness.toFixed(3)} ${chroma.toFixed(3)} ${Math.round(hue)})`;
}

/** OKLCH → sRGB hex (Björn Ottosson's OKLab matrices), clamped to the gamut. */
export function oklchToHex({ lightness, chroma, hue }: Oklch) {
  const radians = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(radians);
  const b = chroma * Math.sin(radians);

  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;

  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];

  return `#${linear
    .map((channel) => {
      const x = Math.min(1, Math.max(0, channel));
      const encoded = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
      return Math.round(encoded * 255).toString(16).padStart(2, '0');
    })
    .join('')}`;
}

function luminance(hex: string) {
  const [r, g, b] = [0, 1, 2].map((index) => {
    const value = parseInt(hex.slice(1 + 2 * index, 3 + 2 * index), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two #rrggbb colours, from 1 to 21. */
export function contrastRatio(a: string, b: string) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** One hue and chroma for the whole ink family; each role sets its lightness. */
export type Inks = { hue: number; chroma: number; ink: number; soft: number; line: number };

export function inkPalette({ hue, chroma, ink, soft, line }: Inks) {
  return {
    ink: oklchToHex({ lightness: ink, chroma, hue }),
    soft: oklchToHex({ lightness: soft, chroma: chroma * 0.8, hue }),
    line: oklchToHex({ lightness: line, chroma: chroma * 0.5, hue }),
  };
}
