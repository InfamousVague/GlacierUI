/**
 * Halftone masks, computed rather than drawn.
 *
 * A halftone is arithmetic: dots on a fixed grid whose RADIUS varies with
 * position, so the field reads dense where they nearly touch and open where
 * they shrink to pinpricks. The grid never moves - that constancy is the whole
 * effect, and it is also the thing no image generator gets right, because
 * "evenly spaced dots of smoothly varying size" is a description of a
 * computation, not of a picture.
 *
 * The output is geometry: circle centres and radii in a unit box. A renderer
 * turns that into SVG (`halftoneSvg` below), a canvas, or a native shape list,
 * and every one of them gets the same dots.
 *
 * WHY THE DISSOLVE IS NOT A FADE. Toward the thin end the dots do not become
 * translucent - they DISAPPEAR, chosen by a hash of their own grid coordinates.
 * That matters because these are masks: a grey dot means "half showing", so a
 * faded field paints a haze over whatever it is masking, where a dissolved one
 * paints scattered specks of the real thing. Opacity is a different effect
 * wearing the same name.
 *
 * DETERMINISM. The dropout is a hash of (column, row, seed), not a random
 * number generator, so the same options always give the same texture - across
 * reloads, across platforms, and in tests. A field that reshuffled on every
 * render would shimmer.
 */

/** Where the field is densest; everything thins away from it. */
export type HalftoneOrigin =
  /** A corner. The ramp runs along the diagonal to the opposite corner. */
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  /** The middle, thinning outward in every direction. */
  | 'center'
  /** All four edges, thinning inward - a frame rather than a vignette. */
  | 'edges'
  /** One edge, thinning straight across to the far side. */
  | 'top'
  | 'bottom'
  | 'left'
  | 'right';

export interface HalftoneOptions {
  /** Dots across the widest axis. More cells = finer texture. */
  cells?: number;
  /**
   * Columns and rows, when the target is not square.
   *
   * A square field stretched onto a wide box turns every dot into a flat
   * streak, and at any real density the streaks merge into lines - which stops
   * reading as a halftone entirely. Giving the long axis proportionally more
   * cells keeps the dots round once the mask is scaled to fit. Both default to
   * `cells`, so a square target needs neither.
   */
  cols?: number;
  rows?: number;
  /** Where the field is densest. */
  origin?: HalftoneOrigin;
  /**
   * Dot radius at the dense end, as a fraction of the cell. 0.5 exactly touches
   * the neighbouring dot; above that they merge into a solid field, which is
   * usually what you want at the very densest corner.
   */
  maxRadius?: number;
  /** Dot radius at the thin end, same units. The floor before dropout. */
  minRadius?: number;
  /**
   * Shapes the ramp. 1 is linear; above 1 holds the dense end longer and
   * collapses faster at the tail, which reads as a sharper falloff.
   */
  falloff?: number;
  /**
   * How much of the thin end dissolves. 0 keeps every dot and merely shrinks
   * them; 1 removes all of them by the far end. The dropout probability rises
   * with the ramp, so the dense end is always intact.
   */
  dissolve?: number;
  /** Changes which dots dissolve, without changing anything else. */
  seed?: number;
}

/** One dot, in a 0..1 box. Multiply by the viewBox to place it. */
export interface HalftoneDot {
  cx: number;
  cy: number;
  r: number;
}

const DEFAULTS = {
  cells: 48,
  origin: 'top-left' as HalftoneOrigin,
  maxRadius: 0.52,
  minRadius: 0.04,
  falloff: 1.6,
  dissolve: 1,
  seed: 1,
};

/**
 * A hash, not a PRNG: the value for a cell depends only on the cell, so dots
 * can be generated in any order, in parallel, or one at a time, and the field
 * comes out identical. A sequential generator would tie each dot's fate to how
 * many were drawn before it.
 *
 * Integer mixing in the style of xorshift, finished into 0..1.
 */
function hash01(x: number, y: number, seed: number): number {
  let h = (x * 374761393 + y * 668265263 + seed * 1442695040888963407) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  h = h ^ (h >>> 16);
  return ((h >>> 0) % 100000) / 100000;
}

/**
 * How far along the ramp a point is: 0 at the dense end, 1 at the thin one.
 *
 * `u` and `v` are the point's position in the unit box. Every origin reduces to
 * this one number, which is what lets the dot maths below be written once.
 */
export function halftoneRamp(u: number, v: number, origin: HalftoneOrigin): number {
  switch (origin) {
    // Diagonals are averaged rather than measured as true distance: true
    // distance curves the iso-density lines, and a corner halftone reads better
    // with them straight, running perpendicular to the diagonal.
    case 'top-left':
      return (u + v) / 2;
    case 'top-right':
      return (1 - u + v) / 2;
    case 'bottom-left':
      return (u + 1 - v) / 2;
    case 'bottom-right':
      return (1 - u + 1 - v) / 2;
    // Normalised so the ramp reaches 1 at the nearest EDGE rather than at the
    // corner, or the corners would still be dense at the far end.
    case 'center':
      return Math.min(1, Math.hypot(u - 0.5, v - 0.5) * 2);
    // The complement of 'center': 0 at whichever edge is nearest, 1 in the
    // middle. The distance is to the NEAREST edge, not radial, so the dense
    // band follows the frame rather than bulging at the corners - and it is not
    // subtracted from 1, which would have made this an exact duplicate of
    // 'center' under a different name.
    case 'edges':
      return Math.min(1, Math.min(u, 1 - u, v, 1 - v) * 2);
    case 'top':
      return v;
    case 'bottom':
      return 1 - v;
    case 'left':
      return u;
    case 'right':
      return 1 - u;
    default:
      return 0;
  }
}

/**
 * Every dot in the field, already dissolved.
 *
 * Dots that dropped out are absent from the array rather than present with a
 * zero radius, so a renderer emits nothing for them and the SVG stays small -
 * at the thin end most of the grid is gone.
 */
export function halftoneDots(options: HalftoneOptions = {}): HalftoneDot[] {
  const { cells, cols, rows, origin, maxRadius, minRadius, falloff, dissolve, seed } = { ...DEFAULTS, ...options };
  const nx = Math.max(1, Math.floor(cols ?? cells));
  const ny = Math.max(1, Math.floor(rows ?? cells));
  const stepX = 1 / nx;
  const stepY = 1 / ny;
  // The radius is in units of the SMALLER cell, so a non-square grid still
  // yields round dots that cannot overlap on the tighter axis.
  const step = Math.min(stepX, stepY);
  const dots: HalftoneDot[] = [];

  for (let row = 0; row < ny; row += 1) {
    for (let col = 0; col < nx; col += 1) {
      // Cell CENTRES, so the field is inset by half a cell on every side and
      // no dot is clipped in half by the viewBox edge.
      const u = (col + 0.5) * stepX;
      const v = (row + 0.5) * stepY;
      const t = Math.min(1, Math.max(0, halftoneRamp(u, v, origin)));
      const shaped = Math.pow(t, falloff);

      // Dropout rises with the ramp and is compared against a per-cell hash, so
      // the survivors thin out gradually and unevenly - clumps and gaps, which
      // is what makes it read as a dissolve rather than as a regular sieve.
      if (dissolve > 0 && hash01(col, row, seed) < shaped * dissolve) continue;

      const r = (maxRadius + (minRadius - maxRadius) * shaped) * step;
      if (r <= 0) continue;
      dots.push({ cx: u, cy: v, r });
    }
  }
  return dots;
}

export interface HalftoneSvgOptions extends HalftoneOptions {
  /** Side of the square viewBox. Only affects the numbers, not the look. */
  size?: number;
  /** Non-square viewBox. Both default to `size`. Set these AND cols/rows in
   *  proportion, or the dots come out oval. */
  width?: number;
  height?: number;
  /** The dots' colour. White is what a luminance mask wants. */
  fill?: string;
  /** Behind the dots. Black is what a luminance mask wants. */
  background?: string;
  /** Decimal places in the emitted coordinates. */
  precision?: number;
}

/**
 * The field as a standalone SVG document.
 *
 * White on black by default, which is the polarity `mask-mode: luminance`
 * reads: white shows the masked colour, black cuts it away.
 */
export function halftoneSvg(options: HalftoneSvgOptions = {}): string {
  const { size = 1000, width, height, fill = '#fff', background = '#000', precision = 2, ...rest } = options;
  const w = width ?? size;
  const h = height ?? size;
  const round = (value: number) => Number(value.toFixed(precision));
  // The radius scales by the SHORTER side, so a dot stays a circle in a wide
  // viewBox instead of being drawn as an ellipse the renderer then stretches.
  const r0 = Math.min(w, h);
  const dots = halftoneDots(rest)
    .map((dot) => `<circle cx="${round(dot.cx * w)}" cy="${round(dot.cy * h)}" r="${round(dot.r * r0)}"/>`)
    .join('');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">` +
    `<rect width="${w}" height="${h}" fill="${background}"/>` +
    `<g fill="${fill}">${dots}</g>` +
    `</svg>`
  );
}

/**
 * The same field as a `url("data:...")` value, ready for `mask-image`.
 *
 * Percent-encoded rather than base64: an SVG of a few thousand circles is
 * mostly ASCII that survives encoding almost unchanged, where base64 would add
 * a third to its length for nothing. `#` must be encoded whatever else is not,
 * or the parser treats the colour as a fragment and the URL ends there.
 */
export function halftoneDataUri(options: HalftoneSvgOptions = {}): string {
  const svg = halftoneSvg(options);
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
