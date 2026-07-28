/**
 * Colour conversion and parsing for the picker.
 *
 * OKLCH is the working space, because that is the space the kit's own ramps are
 * authored in — a picker that thought in HSL would hand back colours that do
 * not sit on the same perceptual footing as every token around them.
 *
 * The conversions here are the standard OKLab matrices, written out rather than
 * pulled from a colour library: they are forty lines, they are exact, and a
 * dependency in this package would have to be carried by both bindings.
 */

/** A colour in OKLCH: lightness 0-1, chroma 0-0.4ish, hue in degrees. */
export interface Oklch {
  l: number;
  c: number;
  /** Degrees, 0-360. */
  h: number;
  /** Alpha 0-1. Absent means fully opaque. */
  a?: number;
}

/** A colour in sRGB, each channel 0-255. */
export interface Rgb {
  r: number;
  g: number;
  b: number;
  a?: number;
}

const clamp = (n: number, min: number, max: number): number => (n < min ? min : n > max ? max : n);
const round = (n: number, places: number): number => {
  const f = 10 ** places;
  return Math.round(n * f) / f;
};

/** sRGB companding: linear light to the encoded value a display expects. */
function gammaEncode(x: number): number {
  return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
}

function gammaDecode(x: number): number {
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

/**
 * OKLCH to sRGB.
 *
 * Channels are clamped into gamut rather than reported as out-of-range: a
 * picker has to show *something*, and the clamped colour is what the display
 * would produce anyway.
 */
export function oklchToRgb(color: Oklch): Rgb {
  const { l, c, h, a } = color;
  const hRad = (h * Math.PI) / 180;
  const aLab = c * Math.cos(hRad);
  const bLab = c * Math.sin(hRad);

  const lRoot = l + 0.3963377774 * aLab + 0.2158037573 * bLab;
  const mRoot = l - 0.1055613458 * aLab - 0.0638541728 * bLab;
  const sRoot = l - 0.0894841775 * aLab - 1.291485548 * bLab;

  const lLin = lRoot ** 3;
  const mLin = mRoot ** 3;
  const sLin = sRoot ** 3;

  const r = 4.0767416621 * lLin - 3.3077115913 * mLin + 0.2309699292 * sLin;
  const g = -1.2684380046 * lLin + 2.6097574011 * mLin - 0.3413193965 * sLin;
  const b = -0.0041960863 * lLin - 0.7034186147 * mLin + 1.707614701 * sLin;

  const to255 = (x: number) => Math.round(clamp(gammaEncode(x), 0, 1) * 255);
  return { r: to255(r), g: to255(g), b: to255(b), ...(a !== undefined ? { a } : {}) };
}

/** sRGB to OKLCH. */
export function rgbToOklch(color: Rgb): Oklch {
  const r = gammaDecode(clamp(color.r, 0, 255) / 255);
  const g = gammaDecode(clamp(color.g, 0, 255) / 255);
  const b = gammaDecode(clamp(color.b, 0, 255) / 255);

  const lLin = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const mLin = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const sLin = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const lRoot = Math.cbrt(lLin);
  const mRoot = Math.cbrt(mLin);
  const sRoot = Math.cbrt(sLin);

  const l = 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot;
  const aLab = 1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot;
  const bLab = 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot;

  const c = Math.sqrt(aLab * aLab + bLab * bLab);
  // A neutral has no meaningful hue; atan2(0,0) is 0, which is as good an
  // answer as any and keeps the slider from jumping when chroma hits zero.
  const h = c < 1e-6 ? 0 : ((Math.atan2(bLab, aLab) * 180) / Math.PI + 360) % 360;

  return {
    l: round(clamp(l, 0, 1), 4),
    c: round(Math.max(0, c), 4),
    h: round(h, 2),
    ...(color.a !== undefined ? { a: color.a } : {}),
  };
}

/** `#rrggbb`, or `#rrggbbaa` when the colour carries alpha below 1. */
export function rgbToHex(color: Rgb): string {
  const hex = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
  const base = `#${hex(color.r)}${hex(color.g)}${hex(color.b)}`;
  if (color.a === undefined || color.a >= 1) return base;
  return base + hex(clamp(color.a, 0, 1) * 255);
}

/**
 * Parses `#rgb`, `#rgba`, `#rrggbb`, or `#rrggbbaa`, with or without the hash.
 * Returns null for anything else, so a half-typed value in a text field simply
 * does not apply rather than resolving to black.
 */
export function parseHex(input: string): Rgb | null {
  const raw = input.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]+$/.test(raw)) return null;

  const expand = (s: string) =>
    s
      .split('')
      .map((ch) => ch + ch)
      .join('');

  let hex: string;
  if (raw.length === 3 || raw.length === 4) hex = expand(raw);
  else if (raw.length === 6 || raw.length === 8) hex = raw;
  else return null;

  const int = (at: number) => Number.parseInt(hex.slice(at, at + 2), 16);
  const rgb: Rgb = { r: int(0), g: int(2), b: int(4) };
  if (hex.length === 8) rgb.a = round(int(6) / 255, 3);
  return rgb;
}

/** OKLCH straight to hex, the round trip a picker does on every drag. */
export function oklchToHex(color: Oklch): string {
  return rgbToHex(oklchToRgb(color));
}

/** The CSS `oklch()` form, which is what a token would hold. */
export function formatOklch(color: Oklch): string {
  const { l, c, h, a } = color;
  const base = `oklch(${round(l, 4)} ${round(c, 4)} ${round(h, 2)}`;
  return a !== undefined && a < 1 ? `${base} / ${round(a, 3)})` : `${base})`;
}

/** Parses a CSS `oklch(...)` string. Returns null if it is not one. */
export function parseOklch(input: string): Oklch | null {
  const match = /^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+%?)\s*)?\)$/i.exec(input.trim());
  if (!match) return null;
  const num = (raw: string | undefined): number | undefined => {
    if (raw === undefined) return undefined;
    const value = Number.parseFloat(raw);
    if (!Number.isFinite(value)) return undefined;
    return raw.endsWith('%') ? value / 100 : value;
  };
  const l = num(match[1]);
  const c = num(match[2]);
  const h = num(match[3]);
  if (l === undefined || c === undefined || h === undefined) return null;
  const a = num(match[4]);
  return { l: clamp(l, 0, 1), c: Math.max(0, c), h: ((h % 360) + 360) % 360, ...(a !== undefined ? { a } : {}) };
}

/**
 * The maximum chroma the picker's chroma axis spans.
 *
 * Not a hard limit of OKLCH — chroma is unbounded in principle — but past this
 * every hue is well outside sRGB and the slider would spend most of its travel
 * on colours that all clamp to the same thing.
 */
export const MAX_CHROMA = 0.37;

/**
 * Whether a colour survives a round trip through sRGB unchanged, i.e. whether
 * it is actually displayable. The picker uses this to mark out-of-gamut choices
 * rather than silently showing the clamped colour as though it were the one
 * asked for.
 */
export function inSrgbGamut(color: Oklch, tolerance = 0.02): boolean {
  const back = rgbToOklch(oklchToRgb(color));
  return Math.abs(back.l - color.l) < tolerance && Math.abs(back.c - color.c) < tolerance;
}

/**
 * A readable foreground for a background: whichever of black or white has more
 * contrast. Uses OKLCH lightness, which is perceptual, rather than sRGB
 * luminance — the whole reason the kit works in this space.
 */
export function readableOn(background: Oklch): '#000000' | '#ffffff' {
  return background.l > 0.6 ? '#000000' : '#ffffff';
}
