/**
 * Seek bar geometry - the shared brain behind the audio scrubber's painting.
 *
 * Every shape resolves to the same two things: a path for the played portion
 * and a path for the portion still ahead of the playhead. Level bars are stroked
 * segments rather than filled rects, so a shape swap never changes how a
 * renderer draws - it draws exactly two stroked paths, always. That keeps the
 * DOM and native bindings from re-deriving any of this and drifting apart.
 *
 * Coordinates live in a 0..100 by 0..100 box that both bindings stretch with
 * `preserveAspectRatio="none"`, so a wavelength is a percentage of the bar's
 * width and the wave keeps the same number of cycles at any pixel size. Stroke
 * weight is the renderer's business (a non-scaling stroke in px), which is why
 * nothing here knows about thickness - only `seekBarStroke` classifies it.
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
 * - `line` - a plain rail, the familiar seek bar.
 * - `wave` - an even squiggle behind the playhead, flat rail ahead of it.
 * - `waveform` - the squiggle's amplitude follows `levels`, so the whole track
 *   is a rough picture of the audio, louder passages swelling wider.
 * - `swell` - the squiggle grows from flat at the start of the track to full
 *   height at the playhead, then settles to a flat rail ahead of it. Reads as a
 *   build rather than an even texture.
 *
 * Sharp curves, drawn corner-to-corner rather than sampled, so the points stay
 * genuinely pointed at any width:
 * - `zigzag` - an even triangle wave.
 * - `spikes` - a triangle wave whose peaks follow `levels`.
 *
 * Level marks:
 * - `bars` - level bars standing on the baseline.
 * - `mirror` - level bars mirrored around the centerline, the editor look.
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

/** A beat travelling outward from where it was heard, deforming the bar as it passes. */
export interface SeekBarRipple {
  /** Where the beat landed along the bar, 0..1. Normally the playhead. */
  at: number;
  /** How far through its life it is, 0..1; at 1 it has travelled out and gone. */
  age: number;
  /** How hard the beat hit, 0..1. */
  strength: number;
}

/**
 * How hard the music is hitting right now, and the hits still travelling.
 * `@glacier/logic`'s `useBeat` produces this from a loudness meter; a caller
 * with its own beat detection can hand the same shape straight in.
 */
export interface SeekBarBeat {
  /** A steady swell of the whole squiggle, 0..1: jumps on a hit, falls between them. */
  pulse: number;
  /** The individual hits, each rippling out from where it landed. */
  ripples: readonly SeekBarRipple[];
}

/** How much taller the squiggle stands at full pulse. Deliberately slight - it should read as breathing, not as a bounce. */
const PULSE_DEPTH = 0.3;

/** Peak deflection a ripple's crest adds on top, in viewBox units. */
const RIPPLE_LIFT = 8;

/** How far along the bar a ripple travels over its life, as a fraction of the width. */
const RIPPLE_REACH = 0.4;

/** Half-width of the crest, as a fraction of the bar. Narrow, so a beat reads as a passing bump. */
const RIPPLE_WIDTH = 0.06;

/**
 * The most a caller can dial the beat up to. Past this the swell spends most of
 * its time clamped at the centerline, which reads as a bar that has stopped
 * responding rather than as a louder one - so the ceiling is where the effect
 * stops improving, not an arbitrary round number.
 */
export const SEEK_MAX_INTENSITY = 3;

/**
 * The setting an unset bar draws at. Two thirds of the way to the ceiling: at
 * the tuned baseline the deformation is honest but easy to miss on a short bar,
 * and this is where a beat reads unmistakably as the music without the swell
 * spending its time clamped at the centerline.
 */
export const SEEK_DEFAULT_INTENSITY = 1;

/**
 * How hard the beat deforms the bar: 0 holds it still, `SEEK_DEFAULT_INTENSITY`
 * is what an unset bar draws at, and anything above exaggerates both the swell
 * and the ripples together. Clamped, so a runaway value cannot flatten the
 * painting.
 */
function resolveIntensity(intensity: number | undefined): number {
  if (intensity === undefined || !Number.isFinite(intensity)) return SEEK_DEFAULT_INTENSITY;
  return Math.min(Math.max(intensity, 0), SEEK_MAX_INTENSITY);
}

/** Where along the bar the beat starts building past its baseline. */
const SURGE_FROM = 0.55;

/**
 * Where the build tops out. Well short of the edge: the playhead spends the end
 * of a track in the last tenth, and a crest still at full height there has no
 * room left to resolve before the frame cuts it off.
 */
const SURGE_CREST = 0.78;

/** The multiplier at the crest - the tail of the bar is where the beat is loudest. */
const SURGE_PEAK = 1.8;

/**
 * The multiplier at the very edge. Below the baseline on purpose: a crest that
 * is still growing when it runs out of bar gets cut off by the viewBox and by
 * its own stroke width, which reads as a glitch rather than as a loud moment.
 * Settling under 1 lets the deformation finish inside the frame.
 */
const SURGE_EDGE = 0.25;

/**
 * Where the amplitude stops being taken at face value. Below this a beat is
 * drawn exactly as asked; above it the soft ceiling starts to bite.
 */
const AMPLITUDE_KNEE = 30;

/**
 * The height a beat-driven wave approaches but never reaches, leaving room for
 * a stroke that is drawn at a fixed pixel weight however short the bar is. The
 * old hard clamp at the centerline flattened every loud passage into the same
 * square-topped run; this bends instead, so a hit that would have overshot
 * still reads as louder than the one before it.
 */
const AMPLITUDE_CEILING = MID - 8;

/**
 * Smooth saturation: identity up to the knee - so an ordinary bar is untouched
 * - then easing toward the ceiling with a matching slope, so there is no corner
 * where the two meet and no flat top where the loud parts end up.
 */
function softCap(amplitude: number): number {
  if (amplitude <= AMPLITUDE_KNEE) return amplitude;
  const room = AMPLITUDE_CEILING - AMPLITUDE_KNEE;
  return AMPLITUDE_KNEE + room * (1 - Math.exp(-(amplitude - AMPLITUDE_KNEE) / room));
}

/** Smoothstep - eases both ends so neither the build nor the settle has a corner in it. */
const smooth = (t: number): number => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

/**
 * The local multiplier on the beat's intensity at a point along the bar.
 *
 * Flat at 1 through the first stretch, building to `SURGE_PEAK` across the
 * tail - which is where the playhead spends the end of a track and where the
 * eye already is - then falling back under 1 into the edge so the last crest
 * lands inside the frame instead of being sheared off by it.
 */
function surgeAt(fraction: number): number {
  const f = clamp01(fraction);
  if (f <= SURGE_FROM) return 1;
  if (f <= SURGE_CREST) {
    return 1 + (SURGE_PEAK - 1) * smooth((f - SURGE_FROM) / (SURGE_CREST - SURGE_FROM));
  }
  return SURGE_PEAK + (SURGE_EDGE - SURGE_PEAK) * smooth((f - SURGE_CREST) / (1 - SURGE_CREST));
}

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
  /**
   * Live beat state. The squiggle swells with `pulse` and each ripple bumps it
   * as it travels past, so the bar deforms in time with what is playing.
   * `line` ignores it: the plain rail is the one shape that stays plain.
   */
  beat?: SeekBarBeat;
  /**
   * How hard the beat deforms the bar. Defaults to `SEEK_DEFAULT_INTENSITY`;
   * 0 holds it still without the caller having to stop feeding it audio, and
   * up to `SEEK_MAX_INTENSITY` exaggerates it for a bar that is the hero of a
   * now-playing surface. Scales the swell and the ripples together, so the
   * bar reads as more emphatic rather than as a different effect.
   */
  intensity?: number;
  /**
   * Draw the tracer: a second copy of the played run showing the bar as it was
   * a moment ago, so a hit reads twice - once on the bar, once trailing it.
   * Only produced when there is a beat to lag behind; without one the two runs
   * would be the same path drawn twice.
   */
  tracer?: boolean;
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
  /**
   * The played run as it stood a moment ago, when `tracer` is on and a beat is
   * driving the bar. Renderers draw it under the played run in the same tone at
   * half opacity - it is a shadow of the bar, not a second reading of the
   * position. Empty or absent when there is nothing to trail.
   */
  tracerPath?: string;
  /**
   * How present the tracer is, 0 to 1, to be multiplied into whatever opacity
   * the renderer draws it at. Full while the beat has any life in it, easing to
   * nothing as the last of it dies - so when the music stops the shadow is not
   * left behind as a flat line under the bar, it goes.
   */
  tracerFade?: number;
}

/**
 * How a shape wants to be stroked. Classification only - the pixel values stay
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
 * Resolves a tone to token names - never to colour values, so themes keep
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
 * - `muted` - the segment track, tuned for the page's base surface.
 * - `contrast` - lifted for raised surfaces. `segment-track` is a translucent
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
 * - `solid` - one token, laid flat.
 * - `tonal` - a ramp inside one family, from the tone's solid to its lighter
 *   text token. Quiet; reads as depth rather than as a gradient.
 * - `blend` - a ramp that travels to another family, so the hue genuinely
 *   moves along the bar. This is the one that looks like a gradient.
 * - `fade` - the tone dissolving toward transparent, for a run that should
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
 * the platform understands - `var(--glacier-*)` on the web, the native kit's
 * own resolver on a device - so both bindings compose identical strings and a
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
 * would otherwise draw a uniform picket fence - this gives them something that
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
 * its states at once - textured behind, flat ahead - which is what the loaded
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
 * says the opposite - it reads as an empty control rather than a loading one. So
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
 * flow straight into the path strings and blank the whole bar - one bad
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

/**
 * Extra deflection the travelling beats add at a point on the bar, in viewBox
 * units before the lift is applied.
 *
 * Each ripple is a crest that starts where the beat was heard and moves out in
 * both directions, thinning as it goes: a Gaussian around a radius that grows
 * with age, faded by how far through its life it is. Overlapping beats sum, so
 * a dense passage genuinely reads busier than a sparse one - the caller clamps
 * the total, not this.
 */
function rippleLift(fraction: number, ripples: readonly SeekBarRipple[]): number {
  let lift = 0;
  for (const ripple of ripples) {
    const age = clamp01(ripple.age);
    const front = age * RIPPLE_REACH;
    const offset = (Math.abs(fraction - clamp01(ripple.at)) - front) / RIPPLE_WIDTH;
    lift += Math.exp(-offset * offset) * (1 - age) * clamp01(ripple.strength);
  }
  return lift;
}

/** The multiplier the steady pulse applies to a resting amplitude. */
const pulseScale = (beat: SeekBarBeat | undefined, intensity: number): number =>
  1 + (beat ? clamp01(beat.pulse) : 0) * PULSE_DEPTH * intensity;

/**
 * How far behind the bar the tracer runs, as a fraction of a ripple's life.
 * Wide enough that the two crests are plainly separate as they travel - the
 * point of the shadow is the gap - but short of half a life, past which the
 * shadow would still be showing a hit the bar has already finished with.
 */
const TRACER_LAG = 0.45;

/**
 * How much harder the beat drives the tracer than the bar.
 *
 * Both runs are drawn from the same shape, so wherever they agree the shadow is
 * exactly underneath the played run and invisible - at a matched strength the
 * only part that ever shows is the sliver where the lag has moved a crest, and
 * on a bar a few pixels tall that sliver is thinner than the stroke covering
 * it. Overdriving the shadow is what gives it something to show: it swings
 * wider than the run it trails, so each hit reads as a shape breaking out from
 * behind the bar and settling back.
 */
const TRACER_GAIN = 2.1;

/**
 * How hard the beat was driving the bar a moment ago, 0 to 1.
 *
 * The hits are the only clock a pure geometry call has - each one knows how far
 * through its life it is - so the shadow's swell is rebuilt from them rather
 * than taken from the pulse, which only ever reports now.
 *
 * All of the delay is in the release. A hit lands on the shadow at full weight
 * the same frame it lands on the bar, so the two start out agreeing and the
 * shadow is never seen climbing into place - an animated attack reads as the
 * shape sliding up rather than as a strike. What it does not share is the way
 * out: the bar's swell falls off with the pulse, which is a short clock, while
 * this decays across the hit's whole life. So the bar drops out from under a
 * shadow still holding the last beat, which is what keeps the pair from being
 * one envelope drawn at two sizes.
 */
function laggedEnergy(beat: SeekBarBeat): number {
  // Nothing travelling is nothing to date the swell against, so the pulse is
  // taken as it stands - there is no history here to hold it back.
  if (beat.ripples.length === 0) return clamp01(beat.pulse);
  let energy = 0;
  for (const ripple of beat.ripples) {
    energy = Math.max(energy, clamp01(ripple.strength) * (1 - clamp01(ripple.age)));
  }
  return energy;
}

/**
 * The beat as it stood a moment ago.
 *
 * A ripple's age is how far through its life it is, so winding every age back
 * by the same amount replays the bar `TRACER_LAG` earlier: crests sit closer to
 * where their hit landed, and a hit too new to have existed then is dropped
 * rather than drawn early. The pulse gets the same treatment by way of
 * `laggedEnergy`, so the shadow's swell is dated to match its crests instead of
 * being the only part of it still living in the present.
 */
function laggedBeat(beat: SeekBarBeat): SeekBarBeat {
  const ripples: SeekBarRipple[] = [];
  for (const ripple of beat.ripples) {
    const age = clamp01(ripple.age) - TRACER_LAG;
    if (age >= 0) ripples.push({ ...ripple, age });
  }
  return { pulse: laggedEnergy(beat), ripples };
}

/**
 * How much life is left in a beat, 0 to 1: the steady pulse, or the liveliest
 * hit still travelling weighed against how much of its life it has spent,
 * whichever is carrying more.
 */
function beatEnergy(beat: SeekBarBeat): number {
  let energy = clamp01(beat.pulse);
  for (const ripple of beat.ripples) {
    energy = Math.max(energy, clamp01(ripple.strength) * (1 - clamp01(ripple.age)));
  }
  return energy;
}

/**
 * How much of its resting shape the tracer still holds, 0 flat to 1 full.
 *
 * The bar's own squiggle is always there - it is the track, not the music, so a
 * shadow drawn from the same shape would sit under it whatever is playing. The
 * tracer instead keeps only as much of that shape as the hit it trails is still
 * carrying: struck, it is thrown out to full body the same frame the bar is;
 * left alone, it sinks back toward the centre line. The square root is what
 * makes that a settle rather than a drop - it lingers near the top and only
 * lets go at the end, so between hits the shadow reads as still on its way back
 * to flat rather than as having arrived. It never quite gets there while the
 * music is playing, which is the point: every beat catches it on the way down.
 */
function tracerSettle(beat: SeekBarBeat): number {
  return Math.sqrt(laggedEnergy(beat));
}

/**
 * The energy below which the shadow starts leaving altogether.
 *
 * Settling back to flat is what the tracer does between beats, and a flat
 * shadow is still the bar's shadow - fading on every gap would read as flicker,
 * and on a slow track the gaps are long. So this sits under the quietest moment
 * of a playing track, and is reached instead on a stop, where the beat is being
 * eased away deliberately: what it catches is the last stretch of that, when
 * what is left would otherwise be a half-opacity straight line lying under a
 * stopped bar.
 */
const TRACER_FADE_FROM = 0.06;

/**
 * How present the shadow is, from gone to fully drawn. Read from the beat as it
 * stands, not from the dated swell the shape is drawn at: leaving is the one
 * thing the shadow should do on time, so a stopped bar is not left with a
 * half-opacity line under it for a beat longer than the music lasted.
 */
function tracerFade(beat: SeekBarBeat): number {
  return smooth(beatEnergy(beat) / TRACER_FADE_FROM);
}

interface WaveOptions {
  levels?: number[];
  wavelength: number;
  amplitude: number;
  modulated: boolean;
  beat?: SeekBarBeat;
  intensity: number;
  /**
   * How much of the resting shape the run keeps, 0 flat to 1 full. Left unset
   * on the bar itself, which always draws its full body; the tracer sets it so
   * it can settle back toward the centre line between hits.
   */
  settle?: number;
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
  const fraction = x / SEEK_VIEW_WIDTH;
  const base = o.modulated ? o.amplitude * levelAt(o.levels, fraction) : o.amplitude;
  const ramped = o.rampTo === undefined || o.rampTo <= 0 ? base : base * clamp01(x / o.rampTo);
  // What the run is holding of its resting shape - full for the bar, sagging
  // back toward flat for a tracer whose beat has gone quiet.
  const held = o.settle === undefined ? ramped : ramped * clamp01(o.settle);
  if (!o.beat || o.intensity === 0) return held;
  // Position-dependent: the beat builds through the tail, where the playhead
  // ends up and the eye already is, then settles into the edge so the last
  // crest resolves inside the frame instead of being sheared off by it.
  const local = o.intensity * surgeAt(fraction);
  // The pulse scales what is already there, so a passage the levels say is
  // quiet stays quiet; the ripple adds on top, so a hit still shows through a
  // silent stretch. The total is eased toward a ceiling that keeps the stroke
  // inside the frame, rather than clipped against it.
  const swelled =
    held * pulseScale(o.beat, local) + RIPPLE_LIFT * local * rippleLift(fraction, o.beat.ripples);
  return softCap(swelled);
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
 * its points off at exactly the scale you notice, so the vertices - the extrema
 * at each quarter and three-quarter wavelength - are emitted directly and the
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
 * how the ends look - no rect radius to be distorted by the stretch.
 */
function marksPath(
  played: boolean,
  options: {
    levels?: number[];
    progress: number;
    count: number;
    mirrored: boolean;
    minBarHeight: number;
    beat?: SeekBarBeat;
    intensity: number;
    /** How much of its resting height the comb keeps, 0 flat to 1 full. */
    settle?: number;
  },
): string {
  const { levels, progress, count, mirrored, minBarHeight, beat, intensity, settle } = options;
  if (count <= 0) return '';
  const slot = SEEK_VIEW_WIDTH / count;
  const cut = progress * SEEK_VIEW_WIDTH;
  const held = settle === undefined ? 1 : clamp01(settle);
  const segments: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const center = (i + 0.5) * slot;
    if (center <= cut !== played) continue;
    const level = levelAt(levels, count === 1 ? 0 : i / (count - 1));
    // Same treatment the wave shapes get - the pulse scales the mark, a passing
    // ripple lifts it, both surging through the tail and settling into the edge
    // - clamped so a beat cannot push a mark out of the box.
    const fraction = center / SEEK_VIEW_WIDTH;
    const local = intensity * surgeAt(fraction);
    const lift = beat ? 2 * RIPPLE_LIFT * local * rippleLift(fraction, beat.ripples) : 0;
    const grown = level * SEEK_VIEW_HEIGHT * held * pulseScale(beat, local) + lift;
    const height = Math.min(Math.max(grown, minBarHeight), SEEK_VIEW_HEIGHT);
    const [top, bottom] = mirrored
      ? [MID - height / 2, MID + height / 2]
      : [SEEK_VIEW_HEIGHT - height, SEEK_VIEW_HEIGHT];
    segments.push(`M ${r(center)} ${r(bottom)} L ${r(center)} ${r(top)}`);
  }
  return segments.join(' ');
}

/**
 * Resolves a shape and a playhead position into the paths a renderer draws.
 * Pure: same inputs, same strings, on any platform.
 */
export function seekBarGeometry({
  shape,
  progress,
  levels,
  beat,
  intensity,
  tracer = false,
  wavelength = 8,
  amplitude = 18,
  barCount = 48,
  minBarHeight = 4,
}: SeekBarGeometryOptions): SeekBarGeometry {
  const p = clamp01(progress);
  const cut = p * SEEK_VIEW_WIDTH;
  const strength = resolveIntensity(intensity);
  // The plain rail has no beat to lag, so it has nothing to cast a shadow of.
  const shadow = tracer && beat && strength > 0 && shape !== 'line' ? laggedBeat(beat) : undefined;
  const shadowStrength = strength * TRACER_GAIN;
  const shadowSettle = shadow && beat ? tracerSettle(beat) : undefined;
  const shadowFade = shadow && beat ? tracerFade(beat) : undefined;

  if (MARK_SHAPES.has(shape)) {
    const count = levels && levels.length > 0 ? levels.length : barCount;
    const options = {
      levels,
      progress: p,
      count,
      mirrored: shape === 'mirror',
      minBarHeight,
      beat,
      intensity: strength,
    };
    return {
      playedPath: marksPath(true, options),
      aheadPath: marksPath(false, options),
      tracerPath: shadow
        ? marksPath(true, {
            ...options,
            beat: shadow,
            intensity: shadowStrength,
            settle: shadowSettle,
          })
        : undefined,
      tracerFade: shadowFade,
    };
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
    beat,
    intensity: strength,
    rampTo: shape === 'swell' ? cut : undefined,
  };
  const run = shape === 'zigzag' || shape === 'spikes' ? trianglePath : sinePath;

  return {
    playedPath: run(0, cut, wave),
    // The even shapes settle to a flat rail ahead of the playhead - the read of
    // the reference design, where the texture is what has been heard. The
    // modulated ones keep drawing the levels so the passage coming up stays
    // visible.
    aheadPath: modulated ? run(cut, SEEK_VIEW_WIDTH, wave) : linePath(cut, SEEK_VIEW_WIDTH),
    // Same run, same shape, the beat wound back and driven harder - so the
    // shadow only differs from the bar where a hit is travelling, and where it
    // does differ it swings wide enough to be seen from behind it. Its resting
    // body is let go of as the beat it trails fades, so between hits it is
    // always on its way back to flat.
    tracerPath: shadow
      ? run(0, cut, {
          ...wave,
          beat: shadow,
          intensity: shadowStrength,
          settle: shadowSettle,
        })
      : undefined,
    tracerFade: shadowFade,
  };
}
