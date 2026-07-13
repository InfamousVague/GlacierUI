import { type ReactNode } from 'react';
import { View, Text, Pressable, type PressableProps } from 'react-native';
import { switchSizes, switchSpec } from '@glacier/spec';
import { useControlled, paintFor } from '@glacier/commons';
import { t } from './tokens.ts';
import { sizeFor, dimensionsFor } from './resolve.ts';

// Derived from the spec so the union cannot drift from the web kit.
export type SwitchSize = (typeof switchSizes)[number];

export interface SwitchProps extends Omit<PressableProps, 'children' | 'style' | 'onPress'> {
  label?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size?: SwitchSize;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
}

// Size-independent box metrics (radius, gap, per-size track width, padding)
// read once from the spec.
const BOX = dimensionsFor(switchSpec);
// The accent fill for the on state, read from the spec's `checked` state paint.
const CHECKED = paintFor(switchSpec, 'states', 'checked');
// The unchecked track fill and the thumb color are literals in the web CSS
// (the track's off tint is `--glacier-border`; the thumb is a fixed near-white
// that does not flip with theme), so they are matched here rather than derived.
// NB: react-native-web silently drops a literal `oklch()` color string (it only
// passes `var(--glacier-*)` tokens through), so the web's `oklch(0.995 0 0)` is
// given here as its sRGB equivalent — otherwise the thumb renders transparent.
const THUMB_COLOR = 'rgb(253, 253, 253)';

/**
 * The Glacier Switch, rendered with React Native primitives. Track and thumb
 * geometry come from the switch spec (per-size height/diameter, track width,
 * padding, radius) and the on-state accent fill from the spec's `checked` state,
 * so it stays visually identical to @glacier/react's Switch. The thumb slides by
 * flex alignment (left when off, right when on); the spring is a device
 * follow-up (rule 7 — resting visual only). State is controlled/uncontrolled via
 * useControlled and toggled by the Pressable.
 */
export function Switch({
  label,
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  size = 'md',
  skeleton = false,
  glass = false,
  ...rest
}: SwitchProps) {
  const [isChecked, setChecked] = useControlled({
    value: checked,
    defaultValue: defaultChecked ?? false,
    onChange: onCheckedChange,
  });

  const dims = sizeFor(switchSpec, size); // { diameter, height } — raw rem values
  const trackWidth = (size === 'sm' ? BOX.trackWidthSm : BOX.trackWidthMd) ?? '2.75rem';
  const radius = t(BOX.radius ?? 'radius-full');
  const padding = BOX.trackPadding ?? '0.125rem';
  const gap = t(BOX.gap ?? 'space-2');

  // Off = `border` tint (glass swaps in the frosted material), on = accent fill.
  const offColor = glass ? t('glass-regular') : t('border');
  const trackColor = isChecked ? t(CHECKED.background ?? 'accent-solid') : offColor;

  const trackBox = {
    width: trackWidth,
    height: dims.height ?? '1.625rem',
    borderRadius: radius,
    padding,
  } as const;

  if (skeleton) {
    // Resting placeholder at the exact track geometry; the shimmer is a device
    // follow-up (rule 7).
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: gap }}>
        <View style={{ ...trackBox, backgroundColor: t('border') }} />
        {label != null && (
          <View style={{ width: '6rem', height: dims.diameter ?? '1rem', borderRadius: radius, backgroundColor: t('border') }} />
        )}
      </View>
    );
  }

  const thumb = (
    <View
      style={{
        width: dims.diameter ?? '1.375rem',
        height: dims.diameter ?? '1.375rem',
        borderRadius: t('radius-full'),
        backgroundColor: THUMB_COLOR,
      }}
    />
  );

  const track = (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: isChecked, disabled }}
      disabled={disabled}
      onPress={() => setChecked(!isChecked)}
      // The web track has no press-scale feedback; only the thumb slides. Match
      // that here by keeping the track a static box (no pressed transform).
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: isChecked ? 'flex-end' : 'flex-start',
        backgroundColor: trackColor,
        ...trackBox,
      }}
      {...rest}
    >
      {thumb}
    </Pressable>
  );

  if (label == null) {
    return <View style={{ opacity: disabled ? 0.5 : 1, alignSelf: 'flex-start' }}>{track}</View>;
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: gap, opacity: disabled ? 0.5 : 1, alignSelf: 'flex-start' }}>
      {track}
      <Text
        style={{
          color: t('text'),
          fontSize: t('font-size-sm'),
          fontFamily: t('font-sans'),
        }}
      >
        {label}
      </Text>
    </View>
  );
}
