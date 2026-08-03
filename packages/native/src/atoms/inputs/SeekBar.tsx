// The Glacier SeekBar, rendered with React Native primitives: the audio
// transport scrubber, painted as a plain rail, a squiggle behind the playhead,
// or a waveform of the track's levels. The curves themselves come from
// `seekBarGeometry` in @glacier/logic - the same function the DOM kit calls -
// so the two bindings cannot draw different waves, and paint and geometry are
// read from `seekBarSpec` through the shared resolvers.

import { useId, useRef, useState, type ComponentType } from 'react';
import { View, type ViewProps } from 'react-native';
import { Svg, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { seekBarSpec, seekBarShapes, seekBarTones, seekBarFills, seekBarRails, compactSizes } from '@glacier/spec';
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
  useControlled,
  SEEK_VIEW_HEIGHT,
  SEEK_VIEW_WIDTH,
} from '@glacier/logic';
import { t } from '../../tokens.ts';
import { sizeFor, dimensionsFor } from '../../resolve.ts';

// Derived from the spec so the unions cannot drift from the web kit.
export type SeekBarShape = (typeof seekBarShapes)[number];
export type SeekBarTone = (typeof seekBarTones)[number];
export type SeekBarFill = (typeof seekBarFills)[number];
export type SeekBarRail = (typeof seekBarRails)[number];
export type SeekBarSize = (typeof compactSizes)[number];

export interface SeekBarProps
  extends Omit<
    ViewProps,
    // the bar owns its own scrubbing, so the responder handlers are not part of
    // its public surface
    | 'style'
    | 'children'
    | 'onStartShouldSetResponder'
    | 'onMoveShouldSetResponder'
    | 'onResponderGrant'
    | 'onResponderMove'
    | 'onResponderRelease'
    | 'onResponderTerminate'
  > {
  /** Track length in seconds. */
  duration: number;
  /** Controlled playhead position in seconds. */
  value?: number;
  /** Initial position when uncontrolled. */
  defaultValue?: number;
  /** Called with the position in seconds as the user scrubs. */
  onValueChange?: (seconds: number) => void;
  /** Called once with the final position when a scrub is released. */
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
  /** Normalized 0-1 loudness samples for the waveform, spikes, bars, and mirror shapes. */
  levels?: number[];
  /** Formats a position for the accessibility value. Defaults to m:ss. */
  formatTime?: (seconds: number) => string;
  /** Bar height step. */
  size?: SeekBarSize;
  /** Dims the bar and blocks input. */
  disabled?: boolean;
  /** Renders a placeholder with the exact geometry. */
  skeleton?: boolean;
  /** Accessible name for the scrubber, e.g. "Seek". */
  'aria-label': string;
}

/**
 * Wraps a bare token name so a raw CSS length in the spec passes through, and
 * only a $token ref becomes `var(--glacier-*)`. Mirrors Sparkline's `metric`.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

// Size-independent geometry read once from the spec. `radius` is a $token ref
// wrapped by t(); the stroke and thumb widths are raw CSS lengths.
const DIMS = dimensionsFor(seekBarSpec);
const RADIUS = t(DIMS.radius ?? 'radius-full');
const STROKE = Number.parseFloat(DIMS.strokeWidth ?? '3px');
const BAR_STROKE = Number.parseFloat(DIMS.barStrokeWidth ?? '2px');
const THUMB_W = Number.parseFloat(DIMS.thumbWidth ?? '4px');

const clamp = (n: number, lo: number, hi: number) => (n < lo ? lo : n > hi ? hi : n);

// Scrubbing runs on the responder system rather than a Pressable. A Pressable
// only reports taps, so there is no drag; worse, react-native-web's press event
// carries no `locationX` at all, and dividing by that undefined produced a NaN
// position that blanked the whole painting. Responder events carry coordinates
// on both platforms and stream while the finger moves.
//
// The permissive d.ts declares none of these props, so the track is typed
// through a narrow local alias (matching Slider and ResizableSplitPane).
type LayoutEvent = { nativeEvent: { layout: { width: number; height: number } } };
type SeekResponderEvent = { nativeEvent: { locationX?: number; pageX?: number } };
const Track = View as unknown as ComponentType<
  Omit<
    ViewProps,
    | 'onStartShouldSetResponder'
    | 'onMoveShouldSetResponder'
    | 'onResponderGrant'
    | 'onResponderMove'
    | 'onResponderRelease'
    | 'onResponderTerminate'
  > & {
    ref?: { current: { measureInWindow?: (cb: (x: number) => void) => void } | null };
    onLayout?: (e: LayoutEvent) => void;
    accessibilityValue?: { min: number; max: number; now: number; text?: string };
    onStartShouldSetResponder?: () => boolean;
    onMoveShouldSetResponder?: () => boolean;
    onResponderGrant?: (e: SeekResponderEvent) => void;
    onResponderMove?: (e: SeekResponderEvent) => void;
    onResponderRelease?: (e: SeekResponderEvent) => void;
    onResponderTerminate?: () => void;
  }
>;

/**
 * The transport scrubber for audio: press anywhere on the bar to seek there.
 * `shape` decides how it paints while the interaction and semantics stay the
 * same. Controlled through `value`/`onValueChange`, or uncontrolled from
 * `defaultValue`.
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
  formatTime = formatDuration,
  size = 'md',
  disabled = false,
  skeleton = false,
  'aria-label': ariaLabel,
  ...rest
}: SeekBarProps) {
  const [extent, setExtent] = useState(0);
  // the track's page origin, only needed when a platform reports pageX instead
  // of a track-relative locationX
  const originRef = useRef(0);
  // only the measure method is used, so the ref is typed by what it needs
  const trackRef = useRef<{ measureInWindow?: (cb: (x: number) => void) => void } | null>(null);
  // a gradient is referenced by id, so each bar needs its own
  const gradientId = useId();
  const [current, setCurrent] = useControlled({ value, defaultValue, onChange: onValueChange });

  const span = Math.max(duration, 0);
  const position = clamp(current, 0, span);
  const progress = span > 0 ? position / span : 0;

  const barHeight = metric(sizeFor(seekBarSpec, size).height, size === 'sm' ? '1.5rem' : '2rem');

  if (skeleton) {
    // The placeholder is the control at rest: half the run textured, half flat
    // ahead of it, with the playhead in between - the same picture the DOM kit
    // draws, from the same shared definition.
    const bone = seekBarSkeleton(shape);
    const boneGeometry = seekBarGeometry({
      shape: bone.shape,
      progress: bone.progress,
      levels: levels ?? bone.levels,
    });
    const boneStroke = seekBarStroke(bone.shape);
    const boneWidth = boneStroke.weight === 'bar' ? BAR_STROKE : STROKE;
    const bonePath = (d: string) => (
      <Path
        d={d}
        fill="none"
        stroke={t('hover')}
        strokeWidth={boneWidth}
        strokeLinecap={boneStroke.cap}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    );
    return (
      <View aria-hidden={true} style={{ alignSelf: 'stretch', height: barHeight }} {...rest}>
        <Svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${SEEK_VIEW_WIDTH} ${SEEK_VIEW_HEIGHT}`}
          preserveAspectRatio="none"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}
        >
          {boneGeometry.aheadPath !== '' && bonePath(boneGeometry.aheadPath)}
          {boneGeometry.playedPath !== '' && bonePath(boneGeometry.playedPath)}
        </Svg>
        {seekBarHasThumb(bone.shape) && (
          <View
            style={{
              position: 'absolute',
              top: '20%',
              height: '60%',
              left: `${bone.progress * 100}%`,
              width: THUMB_W,
              marginLeft: -THUMB_W / 2,
              borderRadius: RADIUS,
              backgroundColor: t('hover'),
            }}
          />
        )}
      </View>
    );
  }

  const { playedPath, aheadPath } = seekBarGeometry({ shape, progress, levels });
  // Cap and weight come from the same classifier the DOM kit uses, so an
  // equalizer butts its caps identically on both platforms.
  const stroke = seekBarStroke(shape);
  const strokeWidth = stroke.weight === 'bar' ? BAR_STROKE : STROKE;
  // The same tone -> token mapping the DOM kit reads, so a tone cannot mean two
  // different colours across the two bindings.
  const paint = seekBarPaint(tone);
  // Same stop list and same formatter the DOM kit uses; only the token wrapper
  // differs, so a gradient cannot mean two different things across bindings.
  const stops = seekBarGradient(tone, fill);
  const playedStroke = stops ? `url(#${gradientId})` : t(paint.from);
  // the same rail mapping the DOM kit reads, so "contrast" means one thing
  const aheadStroke = t(seekBarRail(rail).rail);

  /**
   * Where along the track the finger is, or null when the platform gives us
   * nothing usable. `locationX` is already relative to the track; `pageX` needs
   * the track's own origin taken off. Returning null rather than a guessed
   * number keeps a bad coordinate from ever reaching the geometry.
   */
  const positionFrom = (event: SeekResponderEvent): number | null => {
    if (disabled || extent <= 0 || span <= 0) return null;
    const { locationX, pageX } = event.nativeEvent;
    const x = Number.isFinite(locationX)
      ? (locationX as number)
      : Number.isFinite(pageX)
        ? (pageX as number) - originRef.current
        : Number.NaN;
    if (!Number.isFinite(x)) return null;
    return clamp(x / extent, 0, 1) * span;
  };

  const scrub = (event: SeekResponderEvent) => {
    const next = positionFrom(event);
    if (next !== null) setCurrent(next);
  };

  const endScrub = (event: SeekResponderEvent) => {
    const next = positionFrom(event);
    if (next !== null) {
      setCurrent(next);
      onSeekEnd?.(next);
    }
  };

  return (
    <Track
      accessibilityRole="adjustable"
      accessibilityState={{ disabled }}
      accessibilityValue={{ min: 0, max: Math.round(span), now: Math.round(position), text: formatTime(position) }}
      aria-label={ariaLabel}
      ref={trackRef}
      onLayout={(e) => {
        setExtent(e.nativeEvent.layout.width);
        // remember where the track sits, for the pageX fallback above
        trackRef.current?.measureInWindow?.((x: number) => {
          originRef.current = x;
        });
      }}
      onStartShouldSetResponder={() => !disabled}
      onMoveShouldSetResponder={() => !disabled}
      onResponderGrant={scrub}
      onResponderMove={scrub}
      onResponderRelease={endScrub}
      style={{
        position: 'relative',
        // Stretch to the parent's cross axis rather than asking for width:100%.
        // A percentage resolves against the parent, and a parent that sizes to
        // its content - a plain flex column - has no width until its children
        // do, so a percentage width collapses to zero and the whole painting
        // disappears. Stretching has no such circularity.
        alignSelf: 'stretch',
        height: barHeight,
        opacity: disabled ? 0.5 : 1,
      }}
      {...rest}
    >
      {/* Decoration: the position is carried by the accessibility value above. */}
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${SEEK_VIEW_WIDTH} ${SEEK_VIEW_HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden={true}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}
      >
        {stops && (
          <Defs>
            {/* Ramps along the bar, not across it, and anchored to the viewBox
                so a comb does not restart the ramp on every bar. */}
            <LinearGradient
              id={gradientId}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2={String(SEEK_VIEW_WIDTH)}
              y2="0"
            >
              {stops.map((stop) => (
                <Stop key={stop.offset} offset={`${stop.offset * 100}%`} stopColor={seekBarStopColor(stop, t)} />
              ))}
            </LinearGradient>
          </Defs>
        )}
        {/* The viewBox stretches to the bar's box, so only a non-scaling stroke
            keeps an even weight and a round cap actually round. */}
        {aheadPath !== '' && (
          <Path
            d={aheadPath}
            fill="none"
            stroke={aheadStroke}
            strokeWidth={strokeWidth}
            strokeLinecap={stroke.cap}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {playedPath !== '' && (
          <Path
            d={playedPath}
            fill="none"
            stroke={playedStroke}
            strokeWidth={strokeWidth}
            strokeLinecap={stroke.cap}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </Svg>
      {/* A slim vertical pill rather than a round knob: on the wave shapes a
          disc would sit on top of the levels it is meant to be reading. The
          mark shapes drop it entirely - the break in the comb is the playhead. */}
      {seekBarHasThumb(shape) && (
        <View
          aria-hidden={true}
          style={{
            position: 'absolute',
            top: '20%',
            height: '60%',
            left: `${progress * 100}%`,
            width: THUMB_W,
            marginLeft: -THUMB_W / 2,
            borderRadius: RADIUS,
            backgroundColor: t(paint.from),
          }}
        />
      )}
    </Track>
  );
}
