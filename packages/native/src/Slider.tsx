import { useRef, useState, type ComponentType } from 'react';
import { View, type ViewProps } from 'react-native';
import { sliderSpec } from '@glacier/spec';
import { useControlled } from '@glacier/commons';
import { t } from './tokens.ts';
import { dimensionsFor } from './resolve.ts';

/**
 * The Glacier Slider, rendered with React Native primitives. The web control is
 * a styled `<input type="range">`; native has no such element, so this composes
 * the same three anatomy parts by hand — a full-width `track` (segment-track
 * tint), a leading `fill` (accent-solid) sized to the value, and the round
 * iOS-style `thumb` (slider-thumb + inset glass highlight and shadow-2). Every
 * measurement (control height, track height, thumb diameter, vertical length,
 * radius) and every paint token is read from the slider spec through the shared
 * resolvers, so the resting visual is pixel-identical to @glacier/react's Slider
 * and cannot drift from it.
 *
 * Interaction: the track owns its responder. It snaps on touch-down and updates
 * continuously as a pointer moves, fired through the shared `useControlled` so
 * controlled/uncontrolled behavior matches the web exactly.
 *
 * Web features with no native runtime are accepted-but-noop and reported:
 *  - `hapticStep` / `data-haptic`: the web fires haptics through a DOM
 *    HapticsProvider that this package has no counterpart for; the prop is
 *    accepted and ignored (Expo Haptics is a device follow-up).
 *  - the `--slider-length` custom property (vertical rail length) is a CSS-var
 *    knob with no prop; native uses the spec's `verticalLength`.
 *  - the active thumb scale-up and the focus-visible halo are motion/focus
 *    states, not part of the resting paint the parity check compares.
 */

// The orientation union mirrors the web component (which hardcodes it, so there
// is nothing to derive from an array here).
export type SliderOrientation = 'horizontal' | 'vertical';

export interface SliderProps extends Omit<ViewProps, 'style' | 'children'> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  /**
   * Lay the rail vertically, filling from the bottom (min) up — for volume and
   * the like. The rail length is the spec's `verticalLength` (the web
   * `--slider-length` custom property is not exposed on native).
   */
  orientation?: SliderOrientation;
  /**
   * Web-only: percent of the range between haptic ticks. Accepted for prop
   * parity but a noop on native (no HapticsProvider here).
   */
  hapticStep?: number;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Dims the slider and blocks interaction. */
  disabled?: boolean;
}

// react-native-web hands `onLayout` a layout event; the track View is typed
// through a narrow local alias because the docs shim intentionally only models
// the subset of events the kit consumes.
type LayoutEvent = { nativeEvent: { layout: { width: number; height: number } } };
type PressEvent = { nativeEvent: { locationX: number; locationY: number } };
type PointerEvent = {
  nativeEvent: { clientX: number; clientY: number; buttons?: number };
  currentTarget: { getBoundingClientRect(): { left: number; top: number; width: number; height: number } };
};
const Track = View as unknown as ComponentType<
  ViewProps & {
    onLayout?: (e: LayoutEvent) => void;
    onStartShouldSetResponder?: () => boolean;
    onResponderGrant?: (e: PressEvent) => void;
    onResponderMove?: (e: PressEvent) => void;
    onClick?: (e: PointerEvent) => void;
    onPointerDown?: (e: PointerEvent) => void;
    onPointerMove?: (e: PointerEvent) => void;
    onPointerUp?: (e: PointerEvent) => void;
  }
>;

// Geometry read once from the spec. `height`, `trackHeight`, `thumbDiameter`,
// and `verticalLength` are raw rem lengths in the spec (used directly); `radius`
// is a $token ref wrapped by t().
const DIMS = dimensionsFor(sliderSpec);
const CONTROL_H = DIMS.height ?? '1.375rem';
const TRACK_H = DIMS.trackHeight ?? '0.375rem';
const THUMB = DIMS.thumbDiameter ?? '1.25rem';
const V_LEN = DIMS.verticalLength ?? '8rem';
const RADIUS = t(DIMS.radius ?? 'radius-full');
const HALF_THUMB = `calc(${THUMB} * -0.5)`;

// Paint tokens (children carry the paint; the spec's `paint` is empty).
const TRACK_COLOR = t('segment-track');
const FILL_COLOR = t('accent-solid');
const THUMB_COLOR = t('slider-thumb');
// The thumb's resting shadow: an inset hairline glass highlight over shadow-2,
// mirroring the ::-webkit-slider-thumb box-shadow. Resolved by react-native-web,
// noop on a device build (like Card/StatTile).
const THUMB_SHADOW = `inset 0 ${t('hairline')} 0 ${t('glass-highlight')}, ${t('shadow-2')}`;

const clamp = (n: number, lo: number, hi: number) => (n < lo ? lo : n > hi ? hi : n);

/**
 * A styled range control with a filled leading track and an iOS-style thumb.
 * Tap anywhere on the rail to jump the value there (snapped to `step`); pass
 * `orientation="vertical"` to stand the rail up and fill from the bottom.
 */
export function Slider({
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  orientation = 'horizontal',
  hapticStep: _hapticStep,
  skeleton = false,
  disabled = false,
  ...rest
}: SliderProps) {
  const [current, setCurrent] = useControlled({
    value,
    defaultValue: defaultValue ?? min,
    onChange: onValueChange,
  });
  // Pixel length of the rail along the travel axis, captured on layout so a tap
  // can be mapped to a value.
  const [extent, setExtent] = useState(0);
  const pointerDragging = useRef(false);

  const vertical = orientation === 'vertical';
  const range = max - min;
  const fillPct = range <= 0 ? 0 : ((current - min) / range) * 100;

  const setFromCoordinates = (locationX: number, locationY: number, liveExtent?: number) => {
    const travelExtent = liveExtent ?? extent;
    if (disabled || travelExtent <= 0 || range <= 0) return;
    // Vertical fills bottom-to-top, so invert the Y position.
    const frac = clamp((vertical ? travelExtent - locationY : locationX) / travelExtent, 0, 1);
    const raw = min + frac * range;
    const snapped = step > 0 ? Math.round((raw - min) / step) * step + min : raw;
    setCurrent(clamp(snapped, min, max));
  };
  const setFromPosition = (e: PressEvent) => setFromCoordinates(e.nativeEvent.locationX, e.nativeEvent.locationY);
  const setFromPointer = (e: PointerEvent) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    setFromCoordinates(
      e.nativeEvent.clientX - bounds.left,
      e.nativeEvent.clientY - bounds.top,
      vertical ? bounds.height : bounds.width,
    );
  };

  // The round handle, shared by both orientations and the skeleton bone shape.
  const thumb = (
    <View
      style={{
        width: THUMB,
        height: THUMB,
        borderRadius: RADIUS,
        backgroundColor: THUMB_COLOR,
        boxShadow: THUMB_SHADOW,
      }}
    />
  );

  if (skeleton) {
    // Resting placeholder at the exact control geometry: the track bone with the
    // thumb bone riding it at the midpoint, so loading never shifts layout. The
    // shimmer sweep is a device follow-up (rule 5), matching Checkbox/Switch.
    const bone = t('border-strong');
    return (
      <View
        aria-hidden={true}
        style={{
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
          width: vertical ? CONTROL_H : '100%',
          height: vertical ? V_LEN : CONTROL_H,
        }}
      >
        <View
          style={{
            width: vertical ? TRACK_H : '100%',
            height: vertical ? '100%' : TRACK_H,
            borderRadius: RADIUS,
            backgroundColor: bone,
          }}
        />
        <View
          style={{ width: THUMB, height: THUMB, borderRadius: RADIUS, backgroundColor: bone, position: 'absolute' }}
        />
      </View>
    );
  }

  // The fill overlay and thumb are absolutely positioned inside the track box.
  // Horizontal: fill from the left edge, thumb centered on the fill's leading
  // edge and on the track's cross axis. Vertical: fill from the bottom, thumb
  // centered on it.
  const fill = (
    <View
      style={
        vertical
          ? { position: 'absolute', left: 0, right: 0, bottom: 0, height: `${fillPct}%`, borderRadius: RADIUS, backgroundColor: FILL_COLOR }
          : { position: 'absolute', top: 0, bottom: 0, left: 0, width: `${fillPct}%`, borderRadius: RADIUS, backgroundColor: FILL_COLOR }
      }
    />
  );

  const thumbWrap = (
    <View
      style={
        vertical
          ? { position: 'absolute', left: '50%', bottom: `${fillPct}%`, marginLeft: HALF_THUMB, marginBottom: HALF_THUMB }
          : { position: 'absolute', top: '50%', left: `${fillPct}%`, marginTop: HALF_THUMB, marginLeft: HALF_THUMB }
      }
    >
      {thumb}
    </View>
  );

  return (
    <Track
      accessibilityRole="adjustable"
      accessibilityState={{ disabled }}
      aria-orientation={vertical ? 'vertical' : undefined}
      onLayout={(e) => setExtent(vertical ? e.nativeEvent.layout.height : e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => !disabled}
      onResponderGrant={setFromPosition}
      onResponderMove={setFromPosition}
      onClick={setFromPointer}
      onPointerDown={(e) => {
        pointerDragging.current = true;
        setFromPointer(e);
      }}
      onPointerMove={(e) => {
        if (pointerDragging.current && e.nativeEvent.buttons !== 0) setFromPointer(e);
      }}
      onPointerUp={() => {
        pointerDragging.current = false;
      }}
      style={{
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        width: vertical ? CONTROL_H : '100%',
        height: vertical ? V_LEN : CONTROL_H,
        opacity: disabled ? 0.5 : 1,
      }}
      {...rest}
    >
      {/* The rail: full length, segment-track tint; holds the fill and thumb. */}
      <View
        style={{
          position: 'relative',
          width: vertical ? TRACK_H : '100%',
          height: vertical ? '100%' : TRACK_H,
          borderRadius: RADIUS,
          backgroundColor: TRACK_COLOR,
        }}
      >
        {fill}
        {thumbWrap}
      </View>
    </Track>
  );
}
