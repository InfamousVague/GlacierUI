import { useState, type ReactNode } from 'react';
import { View, Text, Pressable, TextInput, type TextInputProps } from 'react-native';
import { numberInputSpec, controlSizes } from '@glacier/spec';
import { useControlled } from '@glacier/commons';
import { t } from './tokens.ts';
import { sizeFor, dimensionsFor, paintFor } from './resolve.ts';

// Derived from the spec so the size union cannot drift from the web kit.
export type NumberInputSize = (typeof controlSizes)[number];

export interface NumberInputProps
  extends Omit<TextInputProps, 'value' | 'defaultValue' | 'editable' | 'onChangeText' | 'style'> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  size?: NumberInputSize;
  disabled?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
  'aria-label'?: string;
  /**
   * Web opts a stepper out of haptics with "none". This binding has no haptics
   * runtime, so the prop is accepted for contract parity and ignored.
   */
  'data-haptic'?: string;
}

// Size-independent box metrics (radius, border) read once from the spec.
const BOX = dimensionsFor(numberInputSpec);

// Base surface/border paint and the disabled/focus state tokens, read from the
// spec so they cannot drift from NumberInput.module.css. `bare` strips the
// leading `$` from the top-level paint refs exactly as the shared resolvers do.
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);
const BASE = (numberInputSpec.paint ?? {}) as { background?: string; text?: string; border?: string };
const DISABLED_BG = paintFor(numberInputSpec, 'states', 'disabled').background ?? 'surface-sunken';
const FOCUS_BORDER = paintFor(numberInputSpec, 'states', 'focus-within').border ?? 'focus-ring';

// The +/- glyph font size per control size. These live only in the web CSS
// (`.sm .step` … one ramp step above the group font), not in the spec's size
// metrics, so they are mapped here to mirror NumberInput.module.css exactly.
const STEP_FONT: Record<NumberInputSize, string> = {
  sm: 'font-size-md',
  md: 'font-size-lg',
  lg: 'font-size-xl',
};

/**
 * The Glacier NumberInput, rendered with React Native primitives: a minus
 * Pressable, a centered <TextInput> with tabular figures, and a plus Pressable,
 * wrapped in a bordered group at control height. Paint and geometry are read
 * from the number-input spec through the shared resolvers, so it stays visually
 * identical to @glacier/react's NumberInput and cannot drift from it.
 *
 * The public contract matches the web component (numeric `value`/`defaultValue`,
 * `onValueChange`, clamping to `min`/`max`, step buttons disabling at the
 * bounds). Native-only simplifications, all resting-visual: the focus ring is a
 * border-color swap on focus/blur (the web 3px accent-soft bloom needs a shadow
 * runtime); press-and-hold auto-repeat collapses to a single step per tap; and
 * haptics (`data-haptic`) are a no-op with no device haptics engine here.
 */
export function NumberInput({
  value,
  defaultValue,
  min,
  max,
  step = 1,
  onValueChange,
  size = 'md',
  disabled = false,
  skeleton = false,
  glass = false,
  'aria-label': ariaLabel,
  'data-haptic': _dataHaptic,
  onFocus,
  onBlur,
  ...rest
}: NumberInputProps) {
  const [current, setCurrent] = useControlled({ value, defaultValue: defaultValue ?? 0, onChange: onValueChange });
  const [focused, setFocused] = useState(false);

  const dims = sizeFor(numberInputSpec, size);
  const height = t(dims.height ?? 'control-height-md');

  if (skeleton) {
    // Matches the web skeleton: an 8rem placeholder at control height, rounded
    // to the group radius.
    return (
      <View
        aria-hidden={true}
        style={{
          width: '8rem',
          height,
          borderRadius: t(BOX.radius ?? 'radius-lg'),
          backgroundColor: t('hover'),
        }}
      />
    );
  }

  const clamp = (next: number): number => {
    let out = next;
    if (min !== undefined && out < min) out = min;
    if (max !== undefined && out > max) out = max;
    return out;
  };
  const commit = (next: number): void => setCurrent(clamp(next));
  const stepBy = (dir: 1 | -1): void => commit(current + dir * step);

  const atMin = min !== undefined && current <= min;
  const atMax = max !== undefined && current >= max;

  // Group surface + border. Glass swaps the solid surface for the frosted tint
  // (native cannot blur, so this is the resting material only); disabled sits on
  // the sunken surface; focus swaps the border to the focus-ring token.
  const groupBackground = disabled
    ? t(DISABLED_BG)
    : glass
      ? t('glass-regular')
      : t(bare(BASE.background) ?? 'surface');
  const groupBorder = focused
    ? t(FOCUS_BORDER)
    : glass
      ? t('glass-border')
      : t(bare(BASE.border) ?? 'border');

  // One step button: a square Pressable (width = the group's control height) with
  // a muted glyph that dims to text-subtle when disabled at the bound.
  const StepButton = ({
    dir,
    label,
    glyph,
    stepDisabled,
    corner,
  }: {
    dir: 1 | -1;
    label: string;
    glyph: ReactNode;
    stepDisabled: boolean;
    corner: 'start' | 'end';
  }) => (
    <Pressable
      accessibilityRole="button"
      aria-label={label}
      disabled={stepDisabled}
      onPress={() => stepBy(dir)}
      style={{
        width: height,
        alignSelf: 'stretch',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: corner === 'start' ? t(BOX.radius ?? 'radius-lg') : 0,
        borderBottomLeftRadius: corner === 'start' ? t(BOX.radius ?? 'radius-lg') : 0,
        borderTopRightRadius: corner === 'end' ? t(BOX.radius ?? 'radius-lg') : 0,
        borderBottomRightRadius: corner === 'end' ? t(BOX.radius ?? 'radius-lg') : 0,
      }}
    >
      <Text
        style={{
          color: stepDisabled ? t('text-subtle') : t('text-muted'),
          fontSize: t(STEP_FONT[size]),
          // line-height:1, matching the web `.step` rule.
          lineHeight: t(STEP_FONT[size]) as never,
          fontFamily: t('font-sans'),
        }}
      >
        {glyph}
      </Text>
    </Pressable>
  );

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'stretch',
        alignSelf: 'flex-start',
        height,
        borderRadius: t(BOX.radius ?? 'radius-lg'),
        borderWidth: t(BOX.border ?? 'hairline'),
        borderStyle: 'solid',
        borderColor: groupBorder,
        backgroundColor: groupBackground,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <StepButton dir={-1} label="Decrease" glyph="-" stepDisabled={disabled || atMin} corner="start" />
      <TextInput
        aria-label={ariaLabel}
        value={String(current)}
        editable={!disabled}
        keyboardType="numeric"
        onChangeText={(text) => commit(Number(text))}
        onFocus={() => {
          setFocused(true);
          onFocus?.();
        }}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        style={{
          flex: 1,
          minWidth: 0,
          textAlign: 'center',
          color: t(bare(BASE.text) ?? 'text'),
          fontSize: t(dims.fontSize ?? 'font-size-sm'),
          fontFamily: t('font-sans'),
          // tabular figures, matching the web `.input` font-variant-numeric.
          fontVariant: ['tabular-nums'],
          paddingHorizontal: t(dims.paddingInline ?? 'space-3'),
          // The web input carries a hairline divider on each side (border-inline).
          borderLeftWidth: t(BOX.border ?? 'hairline'),
          borderRightWidth: t(BOX.border ?? 'hairline'),
          borderColor: t(bare(BASE.border) ?? 'border'),
        }}
        {...rest}
      />
      <StepButton dir={1} label="Increase" glyph="+" stepDisabled={disabled || atMax} corner="end" />
    </View>
  );
}
