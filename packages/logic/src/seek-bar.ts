/**
 * Seek bar geometry — the shared brain behind the audio scrubber's painting.
 *
 * Every shape resolves to the same two things: a path for the played portion
 * and a path for the portion still ahead of the playhead. Level bars are stroked
 * segments rather than filled rects, so a shape swap never changes how a
 * renderer draws — it draws exactly two stroked paths, always. That keeps the
 * DOM and native bindings from re-deriving any of this and drifting apart.
 *
 * Coordinates live in a 0..100 by 0..100 box that both bindings stretch with
 * `preserveAspectRatio="none"`, so a wavelength is a percentage of the bar's
 * width and the wave keeps the same number of cycles at any pixel size. Stroke
 * weight is the renderer's business (a non-scaling stroke in px), which is why
 * nothing here knows about thickness — only `seekBarStroke` classifies it.
 */

/** The shared viewBox the geometry is authored in. */
export const SEEK_VIEW_WIDTH = 100;
export const SEEK_VIEW_HEIGHT = 100;

/** The rail's centerline, and the baseline bottom-anchored bars stand on. */
const MID = SEEK_VIEW_HEIGHT / 2;

/** Sample spacing along x for the smooth wave shapes; ~0.5% of the width reads smooth. */
const WAVE_STEP = 0.5;

/** Below this the played or ahead run is empty rather than a degenerate stub. */
const EPSILON = 0.001;

/**
 * How the bar paints progress.
 *
 * Smooth curves:
 * - `line` — a plain rail, the familiar seek bar.
 * - `wave` — an even squiggle behind the playhead, flat rail ahead of it.
 * - `waveform` — the squiggle's amplitude follows `levels`, so the whole track
 *   is a rough picture of the audio, louder passages swelling wider.
 * - `swell` — the squiggle grows from flat at the start of the track to full
 *   height at the playhead, then settles to a flat rail ahead of it. Reads as a
 *   build rather than an even texture.
 *
 * Sharp curves, drawn corner-to-corner rather than sampled, so the points stay
 * genuinely pointed at any width:
 * - `zigzag` — an even triangle wave.
 * - `spikes` — a triangle wave whose peaks follow `levels`.
 *
 * Level marks:
 * - `bars` — level bars standing on the baseline.
 * - `mirror` — level bars mirrored around the centerline, the editor look.
 */
export type SeekBarShape =
  | 'line'
  | 'wave'
  | 'waveform'
  | 'swell'
  | 'zigzag'
  | 'spikes'
  | 'bars'
  | 'mirror';

/** Shapes drawn as a comb of marks rather than a continuous run. */
const MARK_SHAPES = new Set<SeekBarShape>(['bars', 'mirror']);

export interface SeekBarGeometryOptions {
  shape: SeekBarShape;
  /** Playhead position as 0..1 of the duration. */
  progress: number;
  /**
   * Normalized 0..1 loudness samples. `waveform`, `spikes`, `bars`, and
   * `mirror` read these; omit them and every sample reads as full, so the
   * modulated shapes degrade to their even counterparts.
   */
  levels?: number[];
  /** Wavelength of the wave shapes in viewBox units (percent of the bar's width). */
  wavelength?: number;
  /** Peak deflection from the centerline, in viewBox units. */
  amplitude?: number;
  /** Mark count for the level shapes when no `levels` are supplied. */
  barCount?: number;
  /** Shortest bar drawn, so silence still reads as a mark rather than a gap. */
  minBarHeight?: number;
}

export interface SeekBarGeometry {
  /** Stroked path behind the playhead; empty at the start of the track. */
  playedPath: string;
  /** Stroked path ahead of the playhead; empty at the end of the track. */
  aheadPath: string;
}

/**
 * How a shape wants to be stroked. Classification only — the pixel values stay
 * with each renderer (CSS custom properties on the web, spec dimensions on
 * native) so themes keep control, while the choice itself is made in one place.
 */
export interface SeekBarStroke {
  /** Level marks butt so an equalizer reads as flat-topped, not lozenge-capped. */
  cap: 'round' | 'butt';
  /** Which weight the renderer should reach for. */
  weight: 'rail' | 'bar';
}

export function seekBarStroke(shape: SeekBarShape): SeekBarStroke {
  if (MARK_SHAPES.has(shape)) return { cap: 'butt', weight: 'bar' };
  return { cap: 'round', weight: 'rail' };
}

/**
 * Colour family the played run paints from. Mirrors `seekBarTones` in the spec.
 */
export type SeekBarTone = 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

/** The two token names a tone paints with, as bare names each binding wraps. */
export interface SeekBarPaint {
  /** The flat colour, and the start of the gradient ramp. */
  from: string;
  /** The lighter end of the ramp; unused by a solid fill. */
  to: string;
}

/**
 * Resolves a tone to token names — never to colour values, so themes keep
 * control and the DOM kit can wrap them in `var()` while native wraps them in
 * its own `t()`. Shared so a tone cannot mean two different things.
 *
 * Neutral is the exception the ramps do not cover: there is no `neutral-solid`,
 * so it borrows the text greys, which is what a muted seek bar wants anyway.
 */
export function seekBarPaint(tone: SeekBarTone): SeekBarPaint {
  if (tone === 'neutral') return { from: 'text-subtle', to: 'text-muted' };
  return { from: `${tone}-solid`, to: `${tone}-text` };
}

/**
 * How visible the run ahead of the playhead is.
 *
 * - `muted` — the segment track, tuned for the page's base surface.
 * - `contrast` — lifted for raised surfaces. `segment-track` is a translucent
 *   near-black, so on a card it sits a few hundredths of a lightness step from
 *   the surface underneath and effectively disappears; this keeps the unplayed
 *   run legible there.
 */
export type SeekBarRail = 'muted' | 'contrast';

/** The two token names a rail paints with: its resting colour and its hover. */
export interface SeekBarRailPaint {
  rail: string;
  hover: string;
}

/**
 * Resolves a rail to token names. Shared so both bindings agree on what
 * "contrast" means, and so each hover lands one step above its own resting
 * colour rather than jumping to a single hardcoded highlight.
 */
export function seekBarRail(rail: SeekBarRail): SeekBarRailPaint {
  return rail === 'contrast'
    ? { rail: 'border-strong', hover: 'text-subtle' }
    : { rail: 'segment-track', hover: 'border-strong' };
}

/**
 * How the played run is filled.
 *
 * - `solid` — one token, laid flat.
 * - `tonal` — a ramp inside one family, from the tone's solid to its lighter
 *   text token. Quiet; reads as depth rather than as a gradient.
 * - `blend` — a ramp that travels to another family, so the hue genuinely
 *   moves along the bar. This is the one that looks like a gradient.
 * - `fade` — the tone dissolving toward transparent, for a run that should
 *   trail off rather than stop.
 */
export type SeekBarFill = 'solid' | 'tonal' | 'blend' | 'fade';

/**
 * The family `blend` travels to. Chosen so the hue actually moves: pairing a
 * tone with a neighbour that shares its hue would produce a ramp you cannot
 * see. Accent and info sit on the same hue in the default theme, which is why
 * both cross to success rather than to each other.
 */
const BLEND_PARTNER: Record<SeekBarTone, SeekBarTone> = {
  accent: 'success',
  info: 'success',
  success: 'accent',
  warning: 'danger',
  danger: 'warning',
  neutral: 'accent',
};

/** How much of the tone dissolves away at the end of a `fade`. */
const FADE_PERCENT = 85;

/**
 * One gradient stop, described in token names rather than colours so each
 * binding can wrap them its own way and a theme still owns the values.
 */
export interface SeekBarStop {
  /** Position along the run, 0..1. */
  offset: number;
  /** The base token. */
  token: string;
  /** Mixed into the base to derive an intermediate colour. */
  mixToken?: string;
  /** How much of `mixToken` to mix in, 0..100. */
  mixPercent?: number;
  /** Mixes toward transparent instead, 0..100. */
  fadePercent?: number;
}

/**
 * The stops a fill paints with, or null for a flat one.
 *
 * Every ramp carries an explicit midpoint mixed from its two ends rather than
 * leaving the renderer to interpolate: the mix is done in OKLCH, so the path
 * between two hues stays even instead of dipping through a muddy middle.
 */
export function seekBarGradient(tone: SeekBarTone, fill: SeekBarFill): SeekBarStop[] | null {
  const { from, to } = seekBarPaint(tone);
  if (fill === 'solid') return null;
  if (fill === 'fade') {
    return [
      { offset: 0, token: from },
      { offset: 1, token: from, fadePercent: FADE_PERCENT },
    ];
  }
  const end = fill === 'blend' ? seekBarPaint(BLEND_PARTNER[tone]).from : to;
  return [
    { offset: 0, token: from },
    { offset: 0.5, token: from, mixToken: end, mixPercent: 50 },
    { offset: 1, token: end },
  ];
}

/**
 * Renders a stop to a colour string. `wrap` turns a token name into whatever
 * the platform understands — `var(--glacier-*)` on the web, the native kit's
 * own resolver on a device — so both bindings compose identical strings and a
 * gradient cannot mean two different things.
 */
export function seekBarStopColor(stop: SeekBarStop, wrap: (token: string) => string): string {
  const base = wrap(stop.token);
  if (stop.fadePercent !== undefined) {
    return `color-mix(in oklch, ${base}, transparent ${stop.fadePercent}%)`;
  }
  if (stop.mixToken !== undefined) {
    return `color-mix(in oklch, ${base}, ${wrap(stop.mixToken)} ${stop.mixPercent ?? 50}%)`;
  }
  return base;
}

/**
 * A gentle, deterministic waveform for the loading placeholder. Real levels are
 * exactly what a bar does not have yet while it loads, and the level shapes
 * would otherwise draw a uniform picket fence — this gives them something that
 * reads as audio.
 */
const SKELETON_LEVEL_COUNT = 40;
const SKELETON_LEVELS: number[] = Array.from({ length: SKELETON_LEVEL_COUNT }, (_unused, i) => {
  const t = i / (SKELETON_LEVEL_COUNT - 1);
  const envelope = Math.sin(t * Math.PI) ** 0.5;
  const ripple = 0.6 + 0.4 * Math.abs(Math.sin(t * Math.PI * 6));
  return Math.max(0.18, Math.min(1, envelope * ripple));
});

/**
 * Where the placeholder puts its playhead. Half way, so the bar shows both of
 * its states at once — textured behind, flat ahead — which is what the loaded
 * control actually looks like.
 */
const SKELETON_PROGRESS = 0.5;

export interface SeekBarSkeleton {
  shape: SeekBarShape;
  levels: number[];
  progress: number;
}

/**
 * What the loading placeholder should draw for a shape.
 *
 * A placeholder's job is to say "an audio bar is arriving here", and a flat rail
 * says the opposite — it reads as an empty control rather than a loading one. So
 * `line`, the one shape with no texture of its own, borrows the squiggle; every
 * other shape keeps its own silhouette. Drawn at half progress with a thumb, so
 * the shape of the real control comes through rather than a bare stripe.
 */
export function seekBarSkeleton(shape: SeekBarShape): SeekBarSkeleton {
  return {
    shape: shape === 'line' ? 'wave' : shape,
    levels: SKELETON_LEVELS,
    progress: SKELETON_PROGRESS,
  };
}

/**
 * Whether the shape wants a drawn playhead.
 *
 * The mark shapes already show the position exactly: the boundary between the
 * painted marks and the unpainted ones lands on a gap, which is a cleaner edge
 * than a pill sitting on top of the comb and hiding a mark under it. The
 * continuous shapes have no such break, so they keep the thumb.
 */
export function seekBarHasThumb(shape: SeekBarShape): boolean {
  return !MARK_SHAPES.has(shape);
}

/**
 * Clamps into 0..1, mapping anything non-finite to 0. A NaN would otherwise
 * flow straight into the path strings and blank the whole bar — one bad
 * coordinate from a host platform should degrade to "no progress", never to an
 * unpainted control.
 */
const clamp01 = (n: number): number => (Number.isFinite(n) ? (n < 0 ? 0 : n > 1 ? 1 : n) : 0);

/** Trim to 2dp: below the sub-pixel threshold once scaled, and keeps paths short. */
const r = (n: number): string => String(Math.round(n * 100) / 100);

/**
 * Nearest-sample lookup, so a short `levels` array spreads across the whole bar
 * instead of interpolating detail the caller never measured.
 */
function levelAt(levels: number[] | undefined, fraction: number): number {
  if (!levels || levels.length === 0) return 1;
  const index = Math.round(clamp01(fraction) * (levels.length - 1));
  return clamp01(levels[index] ?? 0);
}

interface WaveOptions {
  levels?: number[];
  wavelength: number;
  amplitude: number;
  modulated: boolean;
  /**
   * When set, the amplitude ramps from nothing at x=0 to full at this x, so the
   * squiggle builds along the run instead of starting at full height.
   */
  rampTo?: number;
}

/** Unit triangle wave in -1..1, phase-matched to `Math.sin` so shapes swap cleanly. */
function triangleUnit(x: number, wavelength: number): number {
  const u = (((x / wavelength) % 1) + 1) % 1;
  if (u < 0.25) return u * 4;
  if (u < 0.75) return 2 - u * 4;
  return u * 4 - 4;
}

function amplitudeAt(x: number, o: WaveOptions): number {
  const base = o.modulated ? o.amplitude * levelAt(o.levels, x / SEEK_VIEW_WIDTH) : o.amplitude;
  if (o.rampTo === undefined || o.rampTo <= 0) return base;
  return base * clamp01(x / o.rampTo);
}

/** Builds one run of the smooth squiggle, sampled densely enough to read as a curve. */
function sinePath(from: number, to: number, o: WaveOptions): string {
  if (to - from < EPSILON) return '';
  const yAt = (x: number): number => MID - Math.sin((x / o.wavelength) * Math.PI * 2) * amplitudeAt(x, o);
  const points: string[] = [];
  for (let x = from; x < to; x += WAVE_STEP) points.push(`${r(x)} ${r(yAt(x))}`);
  // land exactly on the cut so the played run meets the playhead precisely
  points.push(`${r(to)} ${r(yAt(to))}`);
  return `M ${points.join(' L ')}`;
}

/**
 * Builds a triangle run from its corners only. A sampled triangle would round
 * its points off at exactly the scale you notice, so the vertices — the extrema
 * at each quarter and three-quarter wavelength — are emitted directly and the
 * straight segments between them do the rest.
 */
function trianglePath(from: number, to: number, o: WaveOptions): string {
  if (to - from < EPSILON) return '';
  const yAt = (x: number): number => MID - triangleUnit(x, o.wavelength) * amplitudeAt(x, o);
  const points = [`${r(from)} ${r(yAt(from))}`];
  const first = Math.ceil((from - o.wavelength / 4) / (o.wavelength / 2));
  for (let k = first; ; k += 1) {
    const x = o.wavelength / 4 + (k * o.wavelength) / 2;
    if (x <= from) continue;
    if (x >= to) break;
    points.push(`${r(x)} ${r(yAt(x))}`);
  }
  points.push(`${r(to)} ${r(yAt(to))}`);
  return `M ${points.join(' L ')}`;
}

/** A flat run along the centerline. */
function linePath(from: number, to: number): string {
  return to - from < EPSILON ? '' : `M ${r(from)} ${r(MID)} L ${r(to)} ${r(MID)}`;
}

/**
 * Level marks as stroked segments. Each is one `M`/`L` pair in a single path,
 * so the whole comb costs one node per side and the renderer's butt cap decides
 * how the ends look — no rect radius to be distorted by the stretch.
 */
function marksPath(
  played: boolean,
  options: {
    levels?: number[];
    progress: number;
    count: number;
    mirrored: boolean;
    minBarHeight: number;
  },
): string {
  const { levels, progress, count, mirrored, minBarHeight } = options;
  if (count <= 0) return '';
  const slot = SEEK_VIEW_WIDTH / count;
  const cut = progress * SEEK_VIEW_WIDTH;
  const segments: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const center = (i + 0.5) * slot;
    if (center <= cut !== played) continue;
    const level = levelAt(levels, count === 1 ? 0 : i / (count - 1));
    const height = Math.max(level * SEEK_VIEW_HEIGHT, minBarHeight);
    const [top, bottom] = mirrored
      ? [MID - height / 2, MID + height / 2]
      : [SEEK_VIEW_HEIGHT - height, SEEK_VIEW_HEIGHT];
    segments.push(`M ${r(center)} ${r(bottom)} L ${r(center)} ${r(top)}`);
  }
  return segments.join(' ');
}

/**
 * Resolves a shape and a playhead position into the two paths a renderer draws.
 * Pure: same inputs, same strings, on any platform.
 */
export function seekBarGeometry({
  shape,
  progress,
  levels,
  wavelength = 8,
  amplitude = 18,
  barCount = 48,
  minBarHeight = 4,
}: SeekBarGeometryOptions): SeekBarGeometry {
  const p = clamp01(progress);
  const cut = p * SEEK_VIEW_WIDTH;

  if (MARK_SHAPES.has(shape)) {
    const count = levels && levels.length > 0 ? levels.length : barCount;
    const options = { levels, progress: p, count, mirrored: shape === 'mirror', minBarHeight };
    return { playedPath: marksPath(true, options), aheadPath: marksPath(false, options) };
  }

  if (shape === 'line') {
    return { playedPath: linePath(0, cut), aheadPath: linePath(cut, SEEK_VIEW_WIDTH) };
  }

  const modulated = shape === 'waveform' || shape === 'spikes';
  // `swell` ramps to full height exactly at the playhead, so the build always
  // resolves where the eye is looking rather than part way along the bar.
  const wave: WaveOptions = {
    levels,
    wavelength,
    amplitude,
    modulated,
    rampTo: shape === 'swell' ? cut : undefined,
  };
  const run = shape === 'zigzag' || shape === 'spikes' ? trianglePath : sinePath;

  return {
    playedPath: run(0, cut, wave),
    // The even shapes settle to a flat rail ahead of the playhead — the read of
    // the reference design, where the texture is what has been heard. The
    // modulated ones keep drawing the levels so the passage coming up stays
    // visible.
    aheadPath: modulated ? run(cut, SEEK_VIEW_WIDTH, wave) : linePath(cut, SEEK_VIEW_WIDTH),
  };
}
