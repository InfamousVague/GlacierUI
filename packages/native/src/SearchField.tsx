import { type ReactNode, useState } from 'react';
import { View, TextInput, Pressable, type TextInputProps } from 'react-native';
import { Svg, Circle, Path } from 'react-native-svg';
import { searchFieldSpec, controlSizes } from '@glacier/spec';
import { useControlled, paintFor } from '@glacier/commons';
import { t } from './tokens.ts';
import { sizeFor, dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

// Derived from the spec so the size union cannot drift from the web kit.
export type SearchFieldSize = (typeof controlSizes)[number];

export interface SearchFieldProps
  extends Omit<
    TextInputProps,
    'value' | 'defaultValue' | 'onChangeText' | 'placeholder' | 'style' | 'editable'
  > {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  size?: SearchFieldSize;
  /** Right-aligned slot for a keyboard shortcut hint, e.g. a Kbd. */
  shortcut?: ReactNode;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
  /** Mirrors the web input's `disabled`; wired to the TextInput's `editable`. */
  disabled?: boolean;
}

// Size-independent box metrics (radius, border) read once from the spec.
const BOX = dimensionsFor(searchFieldSpec);

// The field's resting paint is the spec's top-level `paint` (background/text/
// border). Strip the leading `$` exactly as the shared resolvers do so it cannot
// drift from the web kit.
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);
const BASE = (searchFieldSpec.paint ?? {}) as { background?: string; text?: string; border?: string };

// The focus border and the disabled sunken surface come straight from the spec's
// state entries (matching `.input:focus` / `.input:disabled` in the CSS).
const FOCUS_BORDER = t(paintFor(searchFieldSpec, 'states', 'focus').border ?? 'focus-ring');
const DISABLED_BG = t(paintFor(searchFieldSpec, 'states', 'disabled').background ?? 'surface-sunken');

// The magnifier's left inset per size mirrors the CSS size rules (sm/md share
// space-3, lg steps up to space-4). It is not one of the spec's per-size metrics
// (which only carry paddingInline), so it is mapped here by token name.
const ICON_INSET: Record<SearchFieldSize, string> = {
  sm: 'space-3',
  md: 'space-3',
  lg: 'space-4',
};

// The leading magnifier and trailing clear glyphs, matching the web SVGs. Both
// are 1em (relative to the field's inherited font size) and painted with
// text-subtle — the web strokes with currentColor off the icon/clear `color`.
const MagnifierGlyph = (
  <Svg width="1em" height="1em" viewBox="0 0 16 16" fill="none">
    <Circle cx={7} cy={7} r={4.5} stroke={t('text-subtle')} strokeWidth={1.5} />
    <Path d="m11 11 3.5 3.5" stroke={t('text-subtle')} strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
);

const ClearGlyph = (
  <Svg width="1em" height="1em" viewBox="0 0 16 16" fill="none">
    <Path d="m3.5 3.5 9 9" stroke={t('text-subtle')} strokeWidth={1.5} strokeLinecap="round" />
    <Path d="m12.5 3.5-9 9" stroke={t('text-subtle')} strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
);

/**
 * The Glacier SearchField, rendered with React Native primitives. A leading
 * magnifier and a trailing slot (a clear button once typed, or an optional
 * shortcut hint while empty) frame a <TextInput>. Paint (surface fill, hairline
 * border, text + subtle placeholder) and geometry (radius, per-size height,
 * inline padding, font size) are read from the search-field spec through the
 * shared resolvers, so the resting visual is identical to @glacier/react's
 * SearchField and cannot drift from it.
 *
 * The web's `onValueChange` contract is preserved and driven by the TextInput's
 * `onChangeText`; `disabled` maps to `editable={false}` plus the sunken/dimmed
 * paint. The focus ring is a resting approximation: the border swaps to the
 * focus-ring token on focus (via onFocus/onBlur), with no 3px accent-soft bloom
 * (a box-shadow the device runtime cannot cheaply reproduce). Glass renders the
 * resting tint only — the backdrop blur and inset highlight are web-only no-ops.
 *
 * Web-only, accepted-but-noop here: the surrounding Field context (id,
 * aria-describedby, aria-invalid) has no native equivalent, and the clear
 * button's label is the literal "Clear search" (no LocaleProvider natively).
 */
export function SearchField({
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  placeholder = 'Search',
  size = 'md',
  shortcut,
  skeleton = false,
  glass = false,
  disabled = false,
  onFocus,
  onBlur,
  ...rest
}: SearchFieldProps) {
  const [value, setValue] = useControlled({ value: controlledValue, defaultValue, onChange: onValueChange });
  const [focused, setFocused] = useState(false);

  if (skeleton) {
    return <Skeleton width="100%" height={t(`control-height-${size}`)} radius={t('radius-lg')} />;
  }

  const dims = sizeFor(searchFieldSpec, size);

  // Resting border is the base token; focus swaps to the focus ring; glass uses
  // its own hairline. (Disabled keeps the base border, matching the CSS.)
  const borderColor = glass ? t('glass-border') : focused ? FOCUS_BORDER : t(bare(BASE.border) ?? 'border');

  // Solid surface, transparent under glass (the wrapper carries the material),
  // sunken when disabled — matching `.input`, `.glass .input`, `.input:disabled`.
  const backgroundColor = disabled
    ? DISABLED_BG
    : glass
      ? 'transparent'
      : t(bare(BASE.background) ?? 'surface');

  return (
    <View
      style={{
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        // The frosted material sits on the wrapper so it rounds to match the
        // input behind it (native cannot blur — resting tint only).
        ...(glass ? { backgroundColor: t('glass-regular'), borderRadius: t(BOX.radius ?? 'radius-lg') } : null),
      }}
    >
      {/* Leading magnifier: absolutely inset from the start, decorative. */}
      <View
        pointerEvents="none"
        style={{ position: 'absolute', left: t(ICON_INSET[size]), top: 0, bottom: 0, justifyContent: 'center' }}
      >
        {MagnifierGlyph}
      </View>

      <TextInput
        editable={!disabled}
        placeholder={placeholder}
        placeholderTextColor={t('text-subtle')}
        value={value}
        onChangeText={setValue}
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
          height: t(dims.height ?? `control-height-${size}`),
          borderWidth: t(BOX.border ?? 'hairline'),
          borderStyle: 'solid',
          borderColor,
          borderRadius: t(BOX.radius ?? 'radius-lg'),
          backgroundColor,
          color: t(bare(BASE.text) ?? 'text'),
          fontFamily: t('font-sans'),
          fontSize: t(dims.fontSize ?? 'font-size-sm'),
          paddingHorizontal: t(dims.paddingInline ?? 'space-8'),
          opacity: disabled ? 0.5 : 1,
        }}
        {...rest}
      />

      {/* The clear button and the shortcut hint share the trailing slot, so only
          one shows at a time: the shortcut hints how to focus an empty field;
          once there is a value, it becomes the clear button. */}
      {value ? (
        <View style={{ position: 'absolute', right: t('space-2'), top: 0, bottom: 0, justifyContent: 'center' }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => setValue('')}
            style={{
              width: '1.5em',
              height: '1.5em',
              borderRadius: t('radius-full'),
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent',
            }}
          >
            {ClearGlyph}
          </Pressable>
        </View>
      ) : shortcut != null ? (
        <View
          pointerEvents="none"
          style={{ position: 'absolute', right: t('space-3'), top: 0, bottom: 0, justifyContent: 'center' }}
        >
          {shortcut}
        </View>
      ) : null}
    </View>
  );
}
