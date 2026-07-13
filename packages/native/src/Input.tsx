import { type ReactNode, useState } from 'react';
import { View, TextInput, type TextInputProps } from 'react-native';
import { controlSizes, inputSpec } from '@glacier/spec';
import { paintFor } from '@glacier/commons';
import { t } from './tokens.ts';
import { sizeFor, dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

// Derived from the spec so the size union cannot drift from the web kit.
export type InputSize = (typeof controlSizes)[number];

export interface InputProps extends Omit<TextInputProps, 'style'> {
  size?: InputSize;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
  /** Icon or adornment pinned to the leading edge; the text pads clear of it. */
  leadingIcon?: ReactNode;
  /** Icon or adornment pinned to the trailing edge, such as a clear button. */
  trailingIcon?: ReactNode;
  /**
   * Recolors the border to danger (and the focus ring to danger-soft). On the
   * web this is read from the surrounding Field's aria-invalid; there is no
   * FieldContext here, so the native binding surfaces it as a direct prop.
   */
  invalid?: boolean;
  /** DOM parity for `disabled`; maps to `editable={false}` plus the sunken dim. */
  disabled?: boolean;
  /** DOM parity for the input `id`; maps to `nativeID`. */
  id?: string;
}

// Size-independent box metrics (radius, border) read once from the spec.
const BOX = dimensionsFor(inputSpec);

// The base paint (`{ background, text, border }`) lives on the spec's top-level
// `paint`, not a variant/tone/state group, so read it directly and strip the
// leading `$` exactly as the shared resolvers do so it cannot drift.
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);
const BASE = (inputSpec.paint ?? {}) as { background?: string; text?: string; border?: string };

// State paints, read from the spec's `states` group so the tokens stay in sync
// with Input.module.css (`:focus`, `:disabled`, `[aria-invalid]`).
const FOCUS = paintFor(inputSpec, 'states', 'focus'); //   { border: focus-ring,  ring: accent-soft }
const DISABLED = paintFor(inputSpec, 'states', 'disabled'); // { background: surface-sunken }
const INVALID = paintFor(inputSpec, 'states', 'invalid'); // { border: danger-border, ring: danger-soft }

// The web pads the field clear of a pinned icon: space-8 at sm/md, space-10 at lg.
const iconPad = (size: InputSize): string => (size === 'lg' ? 'space-10' : 'space-8');

/**
 * The Glacier Input, rendered with React Native primitives. Paint and geometry
 * (border, surface, radius, height, inline padding, font size) are read from
 * the input spec through the shared resolvers, so the resting field is visually
 * identical to @glacier/react's Input and cannot drift from it. The text field
 * is a <TextInput>; value/defaultValue/onChangeText/placeholder/editable mirror
 * the DOM contract.
 *
 * Resting visuals only: the web eases the border and paints a 3px focus glow
 * (a box-shadow). Focus here is a resting approximation — the border swaps to
 * the focus-ring (or danger) color on focus/blur, and on react-native-web the
 * glow rides along as a box-shadow; a device build simply drops the glow. The
 * frosted `glass` material is the resting tint only (no backdrop blur on-device).
 */
export function Input({
  size = 'md',
  skeleton = false,
  glass = false,
  leadingIcon,
  trailingIcon,
  invalid = false,
  disabled = false,
  editable,
  id,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);

  if (skeleton) {
    // Same geometry the web Skeleton renders: full width, control height, radius-lg.
    return (
      <Skeleton width="100%" height={t(`control-height-${size}`)} radius={t(BOX.radius ?? 'radius-lg')} />
    );
  }

  const dims = sizeFor(inputSpec, size);

  // Resting border: danger when invalid, the glass hairline under glass, else the
  // spec base border. Focus swaps to focus-ring (danger-solid when invalid).
  const restingBorder = invalid
    ? t(INVALID.border ?? 'danger-border')
    : glass
      ? t('glass-border')
      : t(bare(BASE.border) ?? 'border');
  const borderColor = focused
    ? invalid
      ? t('danger-solid')
      : t(FOCUS.border ?? 'focus-ring')
    : restingBorder;

  // Disabled sinks the surface; glass is the resting frosted tint; else base surface.
  const backgroundColor = disabled
    ? t(DISABLED.background ?? 'surface-sunken')
    : glass
      ? t('glass-regular')
      : t(bare(BASE.background) ?? 'surface');

  // The 3px focus glow (box-shadow on react-native-web; ignored on-device).
  const ringToken = invalid ? INVALID.ring ?? 'danger-soft' : FOCUS.ring ?? 'accent-soft';

  const field = (
    <TextInput
      nativeID={id}
      editable={editable ?? !disabled}
      placeholderTextColor={t('text-subtle')}
      onFocus={() => {
        setFocused(true);
        onFocus?.();
      }}
      onBlur={() => {
        setFocused(false);
        onBlur?.();
      }}
      style={{
        width: '100%',
        height: t(dims.height ?? 'control-height-md'),
        // Inline padding from the size step; a pinned icon widens its side.
        paddingLeft: t(leadingIcon ? iconPad(size) : dims.paddingInline ?? 'space-4'),
        paddingRight: t(trailingIcon ? iconPad(size) : dims.paddingInline ?? 'space-4'),
        borderWidth: t(BOX.border ?? 'hairline'),
        borderStyle: 'solid',
        borderColor,
        borderRadius: t(BOX.radius ?? 'radius-lg'),
        backgroundColor,
        // Text color and size ride on the input itself (RN has no inheritance).
        color: t(bare(BASE.text) ?? 'text'),
        fontSize: t(dims.fontSize ?? 'font-size-sm'),
        fontFamily: t('font-sans'),
        opacity: disabled ? 0.5 : 1,
        ...(focused ? { boxShadow: `0 0 0 3px ${t(ringToken)}` } : null),
      }}
      {...rest}
    />
  );

  // No wrapper when there is nothing to pin, so the bare-field case is unchanged.
  if (!leadingIcon && !trailingIcon) return field;

  // The icon slots are 1.125rem squares pinned space-3 from their edge, tinted
  // text-subtle; a currentColor icon inherits that on react-native-web.
  const slot = {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    width: '1.125rem',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    color: t('text-subtle'),
  };
  return (
    <View style={{ position: 'relative', flexDirection: 'row', alignItems: 'center', width: '100%' }}>
      {leadingIcon && <View pointerEvents="none" style={{ ...slot, left: t('space-3') }}>{leadingIcon}</View>}
      {field}
      {trailingIcon && <View style={{ ...slot, right: t('space-3') }}>{trailingIcon}</View>}
    </View>
  );
}
