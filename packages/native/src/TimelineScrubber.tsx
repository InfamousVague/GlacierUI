// The Glacier TimelineScrubber, rendered with React Native primitives: a
// flight-recorder band over a recorded time window with an activity backdrop,
// tone-colored event markers, sparse time ticks, and a playhead. Geometry and
// paint are read from `timelineScrubberSpec` through
// the shared resolvers so the resting visual cannot drift from @glacier/react.

import { useState, type ComponentType } from 'react';
import { View, Text, Pressable, type ViewProps, type PressableProps } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { timelineScrubberSpec, timelineScrubberMarkerTones, compactSizes } from '@glacier/spec';
import { useControlled } from '@glacier/commons';
import { t } from './tokens.ts';
import { sizeFor, dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

// Derived from the spec so the unions cannot drift from the web kit.
export type TimelineScrubberMarkerTone = (typeof timelineScrubberMarkerTones)[number];
export type TimelineScrubberSize = (typeof compactSizes)[number];

export interface TimelineScrubberMarker {
  /** Epoch milliseconds; clamped into the window. */
  time: number;
  /** Tick color family. Defaults to neutral. */
  tone?: TimelineScrubberMarkerTone;
  /** Accessible description of the event, surfaced as the tick tooltip on web. */
  label?: string;
}

export interface TimelineScrubberProps extends Omit<ViewProps, 'style' | 'children'> {
  /** Window start, epoch milliseconds. */
  start: number;
  /** Window end, epoch milliseconds. While live this is "now" and advances as new samples arrive. */
  end: number;
  /** The inspected time. Omit to pin the playhead to the live edge. */
  value?: number;
  /** Called with the scrubbed time as the playhead moves, or null when the user returns to live. */
  onChange?: (time: number | null) => void;
  /** Optional normalized 0-1 context series rendered as the track backdrop. */
  activity?: number[];
  /** Flagged instants drawn as thin ticks over the track. */
  markers?: TimelineScrubberMarker[];
  /**
   * Web-only: arrow-key step in milliseconds. Native has no key stepping (the
   * playhead is a tappable track, not a focus-driven slider), so this is
   * accepted for prop parity and ignored here.
   */
  step?: number;
  /** Formats a timestamp for the ticks and aria-valuetext. */
  formatTime?: (time: number) => string;
  /** Track height step. The handle adds its overhang above the track. */
  size?: TimelineScrubberSize;
  /** Renders the track on the frosted glass material. */
  glass?: boolean;
  /** Blocks scrubbing and dims the control. */
  disabled?: boolean;
  /** Renders a placeholder with the exact geometry. */
  skeleton?: boolean;
  /** Accessible name for the scrubber. */
  'aria-label': string;
}

const defaultFormat = (time: number) => new Date(time).toLocaleTimeString();

/** A tap within this fraction of the trailing edge snaps back to live. */
const LIVE_SNAP = 0.995;

/**
 * A resolved measurement: token names (e.g. `space-2`) get the custom property;
 * a raw CSS length — anything starting with a digit or dot — passes through so
 * it never becomes `var(--glacier-2px)`. Mirrors Sparkline's `metric`.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

// Size-independent geometry read once from the spec. `radius`/`gap`/
// `tickFontSize` are $token refs wrapped by t(); the widths and handle diameter
// are raw CSS lengths used directly.
const DIMS = dimensionsFor(timelineScrubberSpec);
const RADIUS = t(DIMS.radius ?? 'radius-md');
const GAP = metric(DIMS.gap, 'space-2');
const PLAYHEAD_W = DIMS.playheadWidth ?? '2px';
const MARKER_W = DIMS.markerWidth ?? '2px';
const HANDLE = DIMS.handleDiameter ?? '0.75rem';
const TICK_FONT = metric(DIMS.tickFontSize, 'font-size-xs');

// Layout constants that live in the CSS, not the spec: the handle overhang above
// the track (its top offset + the room the root reserves for it).
const HANDLE_TOP = '-0.5625rem';
const ROOT_PAD_TOP = '0.625rem';

const clamp = (n: number, lo: number, hi: number) => (n < lo ? lo : n > hi ? hi : n);
const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** The marker tick color, mirroring `.marker[data-tone]` in the CSS. */
function markerColor(tone: TimelineScrubberMarkerTone = 'neutral'): string {
  return tone === 'neutral' ? t('text-subtle') : t(`${tone}-solid`);
}

// react-native-web hands `onLayout` a layout event and `onPress` a press event
// carrying `nativeEvent.locationX`; the permissive d.ts declares neither, so the
// track Pressable is typed through a narrow local alias (matching Slider).
type LayoutEvent = { nativeEvent: { layout: { width: number; height: number } } };
type PressEvent = { nativeEvent: { locationX: number; locationY: number } };
const Track = Pressable as unknown as ComponentType<
  Omit<PressableProps, 'onPress'> & { onLayout?: (e: LayoutEvent) => void; onPress?: (e: PressEvent) => void }
>;

/**
 * A flight-recorder control: a horizontal band over a recorded time window with
 * an activity backdrop, event markers, and a playhead. Controlled: `value` is
 * the inspected time (omit for live) and `onChange` reports scrubs, with null
 * meaning "back to live".
 *
 * Interaction: the track is a Pressable that jumps the playhead to the tap
 * position (a tap in the trailing 0.5% snaps back to live), fired through the
 * shared `useControlled` so controlled/uncontrolled behavior matches the web —
 * `value === undefined` pins to the live edge, exactly as on web. Precise
 * pointer-drag scrubbing, the drag-time glow and floating readout, keyboard
 * stepping, and the live-dot pulse are pointer/motion affordances with no
 * resting counterpart; they are device follow-ups. The `glass` material paints
 * its resting tint (fill, hairline border, radius); the DOM backdrop-blur and
 * inset highlight are not reproducible natively and are accepted-but-noop.
 */
export function TimelineScrubber({
  start,
  end,
  value,
  onChange,
  activity,
  markers,
  step: _step,
  formatTime = defaultFormat,
  size = 'md',
  glass = false,
  disabled = false,
  skeleton = false,
  'aria-label': ariaLabel,
  ...rest
}: TimelineScrubberProps) {
  // `null` is the live edge. Controlled by `value` when a number is passed;
  // uncontrolled (and starting live) when it is omitted, matching the web's
  // "omit value = live".
  const [scrubbed, setScrubbed] = useControlled<number | null>({
    value,
    defaultValue: null,
    onChange,
  });
  // Track pixel width, captured on layout so a tap maps to a time.
  const [extent, setExtent] = useState(0);

  const trackHeight = metric(sizeFor(timelineScrubberSpec, size).height, size === 'sm' ? '2.5rem' : '3.5rem');

  const live = scrubbed === null;
  const windowSpan = Math.max(end - start, 1);
  const clamped = scrubbed === null ? end : clamp(scrubbed, start, end);
  const fraction = (clamped - start) / windowSpan;

  const handleTap = (e: PressEvent) => {
    if (disabled || extent <= 0) return;
    const frac = clamp(e.nativeEvent.locationX / extent, 0, 1);
    setScrubbed(frac >= LIVE_SNAP ? null : start + frac * windowSpan);
  };

  if (skeleton) {
    return (
      <View style={{ width: '100%', paddingTop: ROOT_PAD_TOP }} {...rest}>
        <Skeleton height={trackHeight} width="100%" radius={RADIUS} />
      </View>
    );
  }

  // The activity silhouette: the exact same 0..100 viewBox path the DOM kit draws.
  const activityPath =
    activity && activity.length >= 2
      ? `M ${activity
          .map((v, i) => `${(i / (activity.length - 1)) * 100} ${100 - clamp01(v) * 100}`)
          .join(' L ')} L 100 100 L 0 100 Z`
      : undefined;

  // Track surface + border swap for the frosted material under `glass`.
  const trackBg = glass ? t('glass-regular') : t('surface-sunken');
  const trackBorder = glass ? t('glass-border') : t('border');
  return (
    <View
      style={{ width: '100%', paddingTop: ROOT_PAD_TOP, userSelect: 'none' as never }}
      {...rest}
    >
      <Track
        accessibilityRole="adjustable"
        accessibilityState={{ disabled }}
        aria-label={ariaLabel}
        disabled={disabled}
        onLayout={(e) => setExtent(e.nativeEvent.layout.width)}
        onPress={handleTap}
        style={{
          position: 'relative',
          height: trackHeight,
          borderRadius: RADIUS,
          borderWidth: t('hairline'),
          borderStyle: 'solid',
          borderColor: trackBorder,
          backgroundColor: trackBg,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {/* The paint layer: clips the activity, markers, and ticks to the
            rounding; the playhead lives outside it so its handle rides above. */}
        <View
          aria-hidden={true}
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderRadius: RADIUS, overflow: 'hidden' }}
        >
          {activityPath && (
            <Svg
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}
            >
              <Path d={activityPath} fill={t('text')} />
            </Svg>
          )}
          {markers?.map((marker, i) => {
            const f = clamp01((marker.time - start) / windowSpan);
            return (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${f * 100}%`,
                  width: MARKER_W,
                  transform: [{ translateX: '-50%' }],
                  backgroundColor: markerColor(marker.tone),
                  opacity: 0.8,
                }}
              />
            );
          })}
        </View>

        {/* The playhead: a vertical accent line with the lollipop handle above. */}
        <View
          aria-label={ariaLabel}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${fraction * 100}%`,
            width: PLAYHEAD_W,
            transform: [{ translateX: '-50%' }],
            backgroundColor: t('accent-solid'),
            borderRadius: t('radius-full'),
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: HANDLE_TOP,
              left: '50%',
              transform: [{ translateX: '-50%' }],
              width: HANDLE,
              height: HANDLE,
              borderRadius: t('radius-full'),
              backgroundColor: t('accent-solid'),
            }}
          />
        </View>
      </Track>
      {markers && markers.length > 0 && (
        <View aria-hidden={true} style={{ position: 'relative', width: '100%', height: '2rem', pointerEvents: 'none' }}>
          {markers.map((marker, i) => {
            const f = clamp01((marker.time - start) / windowSpan);
            const edge = f === 0 ? 'start' : f === 1 ? 'end' : undefined;
            return (
              <Text
                key={i}
                numberOfLines={1}
                style={{
                  position: 'absolute',
                  top: i % 2 === 0 ? 0 : '1rem',
                  left: `${f * 100}%`,
                  transform: edge === 'start' ? undefined : edge === 'end' ? [{ translateX: '-100%' }] : [{ translateX: '-50%' }],
                  fontSize: TICK_FONT,
                  color: t('text-muted'),
                }}
              >
                {formatTime(marker.time)}
              </Text>
            );
          })}
        </View>
      )}
    </View>
  );
}
