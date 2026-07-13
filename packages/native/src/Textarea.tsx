import { useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { textareaSpec, textareaSizes } from '@glacier/spec';
import { paintFor } from '@glacier/commons';
import { t } from './tokens.ts';
import { sizeFor, dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

// Derived from the spec so the size union cannot drift from the web kit.
export type TextareaSize = (typeof textareaSizes)[number];

export interface TextareaProps extends Omit<TextInputProps, 'style' | 'multiline'> {
  size?: TextareaSize;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
  /**
   * Recolors the border to the danger tokens. On the web this is read from the
   * surrounding Field's aria-invalid; there is no native FieldContext, so it is
   * surfaced as a direct prop (mirroring the native Input).
   */
  invalid?: boolean;
  /** DOM parity for the textarea `id`; maps to `nativeID`. */
  id?: string;
  /**
   * Web parity for the textarea's `disabled` attribute: dims the field and
   * blocks input. Equivalent to `editable={false}` (either turns editing off).
   */
  disabled?: boolean;
}

// Size-independent geometry read once from the spec. `minHeight` is a raw CSS
// value ('5rem'), not a $token, so it is used directly; the rest are token names.
const DIMS = dimensionsFor(textareaSpec);
const MIN_HEIGHT = DIMS.minHeight ?? '5rem';

// Base + state paint pulled straight from the spec so the colors cannot drift.
// The base `paint` block holds `$token` refs (like the web CSS variables); strip
// the leading `$` exactly as the shared resolvers do.
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);
const BASE = (textareaSpec.paint ?? {}) as { background?: string; text?: string; border?: string };
const DISABLED = paintFor(textareaSpec, 'states', 'disabled'); // { background: 'surface-sunken' }
const FOCUS = paintFor(textareaSpec, 'states', 'focus'); // { border: 'focus-ring', ring: 'accent-soft' }
const INVALID = paintFor(textareaSpec, 'states', 'invalid'); // { border: 'danger-border', ring: 'danger-soft' }

/**
 * The Glacier Textarea, rendered with React Native primitives. Paint and
 * geometry are read from the textarea spec through the shared resolvers, so it
 * is visually identical to @glacier/react's Textarea and cannot drift from it: a
 * surface fill, hairline border, radius-lg corners, a 5rem min-height, and
 * per-size inline padding + font size. It renders the <TextInput multiline>
 * primitive; value/defaultValue/onChangeText/placeholder/editable pass through in
 * the React Native idiom (the DOM textarea's onChange/disabled map onto
 * onChangeText/editable), and `disabled` is accepted as a web-parity alias.
 *
 * Resting visual only. The web focus box-shadow glow and the border/background
 * CSS transition are a device follow-up; the focus border-color swap is done live
 * via onFocus/onBlur state as a resting approximation. `glass` is the frosted
 * tint only (RN cannot blur), matching the other atoms. The web binding pulls
 * id / aria-describedby / aria-invalid from a surrounding Field — there is no
 * native FieldContext here, so drive invalid styling at the app level.
 */
export function Textarea({
  size = 'md',
  skeleton = false,
  glass = false,
  invalid = false,
  disabled = false,
  editable,
  id,
  onFocus,
  onBlur,
  ...rest
}: TextareaProps) {
  const [focused, setFocused] = useState(false);

  // The web skeleton is a 100%-wide, 5.5rem-tall radius-lg block.
  if (skeleton) {
    return <Skeleton width="100%" height="5.5rem" radius={t('radius-lg')} />;
  }

  const dims = sizeFor(textareaSpec, size);
  const isEditable = editable !== false && !disabled;

  // Resting surface: the solid spec paint, or the frosted tint (glass-regular
  // fill + glass-border hairline) mirroring the web `.glass` rule.
  const surface = glass
    ? { backgroundColor: t('glass-regular'), borderColor: t('glass-border') }
    : {
        backgroundColor: t(bare(BASE.background) ?? 'surface'),
        borderColor: t(bare(BASE.border) ?? 'border'),
      };

  // Resting border: danger when invalid, else the surface border. Focus swaps to
  // focus-ring (danger-solid when invalid); a disabled field never takes focus.
  const restingBorder = invalid ? t(INVALID.border ?? 'danger-border') : surface.borderColor;
  const borderColor =
    isEditable && focused
      ? invalid
        ? t('danger-solid')
        : t(FOCUS.border ?? 'focus-ring')
      : restingBorder;

  return (
    <TextInput
      multiline
      nativeID={id}
      editable={isEditable}
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
        minHeight: MIN_HEIGHT,
        borderWidth: t(DIMS.border ?? 'hairline'),
        borderStyle: 'solid',
        borderColor,
        borderRadius: t(DIMS.radius ?? 'radius-lg'),
        backgroundColor: isEditable ? surface.backgroundColor : t(DISABLED.background ?? 'surface-sunken'),
        // Text color, size, family, and line-height belong on the text element
        // itself (TextInput is a text primitive, not a wrapper View).
        color: t(bare(BASE.text) ?? 'text'),
        fontFamily: t('font-sans'),
        fontSize: t(dims.fontSize ?? 'font-size-sm'),
        lineHeight: t('leading-md'),
        paddingVertical: t(dims.paddingBlock ?? 'space-3'),
        paddingHorizontal: t(dims.paddingInline ?? 'space-4'),
        opacity: isEditable ? 1 : 0.5,
        // Multiline fields start their text at the top, like a DOM <textarea>.
        textAlignVertical: 'top',
      }}
      {...rest}
    />
  );
}
