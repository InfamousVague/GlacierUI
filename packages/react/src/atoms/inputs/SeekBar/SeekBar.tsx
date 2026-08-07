import {
  formatDuration,
  seekBarGeometry,
  seekBarHasThumb,
  seekBarGradient,
  seekBarPaint,
  seekBarRail,
  seekBarSkeleton,
  seekBarStopColor,
  seekBarStroke,
  SEEK_VIEW_HEIGHT,
  SEEK_VIEW_WIDTH,
  type SeekBarBeat,
} from '@glacier/logic';
import { seekBarShapes, seekBarTones, seekBarFills, seekBarRails } from '@glacier/spec';
import { useReducedMotion } from 'motion/react';
import {
  useCallback,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { cx } from '../../../internal/cx.ts';
import { useControlled } from '../../../internal/useControlled.ts';
import styles from './SeekBar.module.css';

// Derived from the spec so the unions cannot drift.
export type SeekBarShape = (typeof seekBarShapes)[number];
export type SeekBarTone = (typeof seekBarTones)[number];
export type SeekBarFill = (typeof seekBarFills)[number];
export type SeekBarRail = (typeof seekBarRails)[number];

export interface SeekBarProps extends Omit<ComponentProps<'div'>, 'onChange' | 'defaultValue'> {
  /** Track length in seconds. */
  duration: number;
  /** Controlled playhead position in seconds. */
  value?: number;
  /** Initial position when uncontrolled. */
  defaultValue?: number;
  /** Called with the position in seconds as the user scrubs or keys. */
  onValueChange?: (seconds: number) => void;
  /**
   * Called once with the final position when a scrub is released, for players
   * that seek on commit rather than on every pointer move.
   */
  onSeekEnd?: (seconds: number) => void;
  /** How progress is painted. */
  shape?: SeekBarShape;
  /** Colour family the played run paints from; the run ahead stays muted in every tone. */
  tone?: SeekBarTone;
  /** Flat token, or a ramp along the played run between the tone's two tokens. */
  fill?: SeekBarFill;
  /**
   * How visible the run ahead of the playhead is. Muted suits the page surface;
   * contrast lifts it for raised surfaces like a card.
   */
  rail?: SeekBarRail;
  /**
   * Normalized 0-1 loudness samples, read by the waveform, spikes, bars, and
   * mirror shapes. Omitted, every sample reads as full.
   */
  levels?: number[];
  /**
   * Live beat state - a 0-1 `pulse` and the hits still travelling as `ripples`.
   * The squiggle swells with the pulse and each hit rises as a crest and
   * ripples outward, so the bar deforms in time with the music. `useBeat` in
   * `@glacier/logic` produces this from the same meter the levels come from.
   * Ignored by `line`, and dropped entirely under reduced motion.
   */
  beat?: SeekBarBeat;
  /**
   * How hard the `beat` deforms the bar, from 0 (still) to
   * `SEEK_MAX_INTENSITY`. Defaults to `SEEK_DEFAULT_INTENSITY` (1), the tuned
   * baseline. Turn it up for a bar that is the hero
   * of a now-playing screen, down for one sitting in a dense list. Setting 0
   * leaves the bar still without the caller having to tear down its meter.
   */
  intensity?: number;
  /**
   * Draws a tracer under the played run: a half-opacity copy of the bar in its
   * own tone, lagging the beat by a fixed slice of time. It holds its shape
   * only as long as the beat it trails does, sinking back toward the flat rail
   * between hits and being thrown out again by the next one - so it reads as
   * something settling behind the bar rather than a second copy of it. Needs a
   * `beat` to lag behind; without one there is nothing to hold it out, so
   * nothing is drawn. Dropped under reduced motion along with the beat itself.
   */
  tracer?: boolean;
  /** Arrow-key step in seconds; Page keys move by ten steps. */
  step?: number;
  /** Formats a position for aria-valuetext. Defaults to m:ss. */
  formatTime?: (seconds: number) => string;
  /** Bar height step. */
  size?: 'sm' | 'md';
  /** Dims the bar and blocks pointer and keyboard input. */
  disabled?: boolean;
  /** Renders a placeholder with the exact geometry. */
  skeleton?: boolean;
  /** Accessible name for the scrubber, e.g. "Seek". */
  'aria-label': string;
}

/**
 * The transport scrubber for audio: press or drag anywhere on the bar to seek.
 * `shape` decides how it paints - a plain rail, a squiggle behind the playhead,
 * or a waveform of the track's `levels` - while the interaction, semantics, and
 * geometry stay identical across all of them.
 */
export function SeekBar({
  duration,
  value,
  defaultValue = 0,
  onValueChange,
  onSeekEnd,
  shape = 'swell',
  tone = 'accent',
  fill = 'solid',
  rail = 'muted',
  levels,
  beat,
  intensity,
  tracer = false,
  step = 5,
  formatTime = formatDuration,
  size = 'md',
  disabled = false,
  skeleton = false,
  className,
  style,
  'aria-label': ariaLabel,
  ...rest
}: SeekBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  // a gradient is referenced by id, so each bar needs its own
  const gradientId = useId();
  const [scrubbing, setScrubbing] = useState(false);
  const [current, setCurrent] = useControlled(value, defaultValue);
  // The beat is a per-frame reshape of the path, not a transition, so there is
  // nothing to shorten under reduced motion - the honest answer is to draw the
  // bar at rest and let the audio be the only thing moving.
  const reducedMotion = useReducedMotion();

  const span = Math.max(duration, 0);
  const position = Math.min(Math.max(current, 0), span);
  const progress = span > 0 ? position / span : 0;

  const commit = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(next, 0), span);
      setCurrent(clamped);
      onValueChange?.(clamped);
      return clamped;
    },
    [span, setCurrent, onValueChange],
  );

  const timeFromPointer = useCallback(
    (event: PointerEvent<HTMLDivElement>): number => {
      const track = trackRef.current;
      if (!track) return position;
      const rect = track.getBoundingClientRect();
      if (rect.width === 0) return position;
      const f = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
      return f * span;
    },
    [span, position],
  );

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // jsdom and some synthetic events have no active pointer to capture
    }
    setScrubbing(true);
    commit(timeFromPointer(event));
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || !scrubbing) return;
    commit(timeFromPointer(event));
  };

  const endScrub = (event: PointerEvent<HTMLDivElement>) => {
    if (!scrubbing) return;
    setScrubbing(false);
    // Commit first, then report: `onSeekEnd?.(commit(...))` would skip the
    // commit entirely whenever no handler is attached, because an optional
    // call never evaluates its arguments.
    const committed = commit(timeFromPointer(event));
    onSeekEnd?.(committed);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const moves: Record<string, number | undefined> = {
      ArrowLeft: position - step,
      ArrowDown: position - step,
      ArrowRight: position + step,
      ArrowUp: position + step,
      PageDown: position - step * 10,
      PageUp: position + step * 10,
      Home: 0,
      End: span,
    };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    // Keying is a discrete seek, so it commits like a released drag.
    const committed = commit(next);
    onSeekEnd?.(committed);
  };

  if (skeleton) {
    // The placeholder is the control at rest: half the run textured, half flat
    // ahead of it, with the playhead in between. A bare stripe would not say
    // what is arriving.
    const bone = seekBarSkeleton(shape);
    const boneGeometry = seekBarGeometry({
      shape: bone.shape,
      progress: bone.progress,
      levels: levels ?? bone.levels,
    });
    const boneStroke = seekBarStroke(bone.shape);
    return (
      <div
        className={cx(styles.root, styles[size], className)}
        // the thumb reads the same custom property the tones set, so pointing it
        // at the placeholder grey is all it takes to mute it
        style={{ '--seek-from': 'var(--glacier-hover)', ...style } as CSSProperties}
        data-rail={rail}
        data-cap={boneStroke.cap}
        data-weight={boneStroke.weight}
        data-skeleton=""
        aria-hidden="true"
        {...rest}
      >
        <svg
          className={styles.plot}
          viewBox={`0 0 ${SEEK_VIEW_WIDTH} ${SEEK_VIEW_HEIGHT}`}
          preserveAspectRatio="none"
          focusable="false"
        >
          {boneGeometry.aheadPath && (
            <path
              className={cx(styles.stroke, styles.bone)}
              d={boneGeometry.aheadPath}
              vectorEffect="non-scaling-stroke"
              fill="none"
            />
          )}
          {boneGeometry.playedPath && (
            <path
              className={cx(styles.stroke, styles.bone)}
              d={boneGeometry.playedPath}
              vectorEffect="non-scaling-stroke"
              fill="none"
            />
          )}
        </svg>
        {seekBarHasThumb(bone.shape) && (
          <span className={styles.thumb} style={{ left: `${bone.progress * 100}%` }} />
        )}
      </div>
    );
  }

  const { playedPath, aheadPath, tracerPath, tracerFade } = seekBarGeometry({
    shape,
    progress,
    levels,
    beat: reducedMotion ? undefined : beat,
    intensity,
    tracer,
  });
  // The cap and weight class come from the shared classifier, so the two
  // bindings cannot disagree about which shapes butt their caps; the CSS below
  // still owns the actual pixel values, keeping them themeable.
  const stroke = seekBarStroke(shape);
  // Token names resolved once in @glacier/logic, handed to CSS as custom
  // properties: the mapping stays shared with native while the stylesheet keeps
  // deciding how the colours are used.
  const paint = seekBarPaint(tone);
  const railPaint = seekBarRail(rail);
  const paintVars = {
    '--seek-from': `var(--glacier-${paint.from})`,
    '--seek-rail': `var(--glacier-${railPaint.rail})`,
    '--seek-rail-hover': `var(--glacier-${railPaint.hover})`,
  } as CSSProperties;
  // Stops are described in token names and rendered by the shared formatter, so
  // this binding and native compose byte-identical colour strings. The mixing
  // itself is CSS color-mix in OKLCH, which keeps a two-hue ramp even instead of
  // letting it dip through a muddy middle.
  const stops = seekBarGradient(tone, fill);

  return (
    <div
      ref={trackRef}
      className={cx(styles.root, styles[size], className)}
      style={{ ...paintVars, ...style }}
      data-shape={shape}
      data-tone={tone}
      data-fill={fill}
      data-rail={rail}
      data-cap={stroke.cap}
      data-weight={stroke.weight}
      data-scrubbing={scrubbing || undefined}
      data-disabled={disabled || undefined}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={span}
      aria-valuenow={position}
      aria-valuetext={formatTime(position)}
      aria-disabled={disabled || undefined}
      aria-orientation="horizontal"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endScrub}
      onPointerCancel={endScrub}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {/* Decoration: the position is carried by the slider value above, so the
          painting itself is hidden from assistive tech. */}
      <svg
        className={styles.plot}
        viewBox={`0 0 ${SEEK_VIEW_WIDTH} ${SEEK_VIEW_HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        {stops && (
          <defs>
            {/* Ramps along the bar, not across it, so the gradient reads as
                distance travelled. userSpaceOnUse keeps it anchored to the
                viewBox rather than to each path's own bounding box, which
                would restart the ramp on every bar of a comb. */}
            <linearGradient
              id={gradientId}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2={SEEK_VIEW_WIDTH}
              y2="0"
            >
              {stops.map((stop) => (
                <stop
                  key={stop.offset}
                  offset={`${stop.offset * 100}%`}
                  stopColor={seekBarStopColor(stop, (name) => `var(--glacier-${name})`)}
                />
              ))}
            </linearGradient>
          </defs>
        )}
        {/* The viewBox stretches to the bar's box, so only a non-scaling stroke
            keeps an even weight and a round cap actually round. */}
        {/* Drawn first so it sits under both runs: it is the bar's shadow, and
            a shadow that covers what casts it is just a second bar. The half
            opacity is the stylesheet's; this multiplies into it, taking the
            shadow away entirely as the last of the beat dies rather than
            leaving a flat line lying under a stopped bar. */}
        {tracerPath && (
          <path
            className={cx(styles.stroke, styles.tracer)}
            d={tracerPath}
            strokeOpacity={tracerFade}
            vectorEffect="non-scaling-stroke"
            fill="none"
          />
        )}
        {aheadPath && (
          <path
            className={cx(styles.stroke, styles.ahead)}
            d={aheadPath}
            vectorEffect="non-scaling-stroke"
            fill="none"
          />
        )}
        {playedPath && (
          <path
            className={cx(styles.stroke, styles.played)}
            stroke={stops ? `url(#${gradientId})` : undefined}
            d={playedPath}
            vectorEffect="non-scaling-stroke"
            fill="none"
          />
        )}
      </svg>
      {/* The mark shapes carry the playhead in the break between painted and
          unpainted marks, so a pill there would only cover one up. */}
      {seekBarHasThumb(shape) && (
        <span className={styles.thumb} style={{ left: `${progress * 100}%` }} aria-hidden="true" />
      )}
    </div>
  );
}
