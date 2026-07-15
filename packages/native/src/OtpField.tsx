import { useRef, useState, type ComponentType } from 'react';
import { View, TextInput, type TextInputProps, type ViewProps } from 'react-native';
import { otpFieldSpec, otpFieldTypes, controlSizes } from '@glacier/spec';
import { useControlled, paintFor } from '@glacier/commons';
import { t } from './tokens.ts';
import { sizeFor, dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

// Derived from the spec so the unions cannot drift from the web kit.
export type OtpFieldType = (typeof otpFieldTypes)[number];
export type OtpFieldSize = (typeof controlSizes)[number];

// Characters each mode accepts; everything else is stripped on entry (mirrors
// the web component's FILTERS).
const FILTERS: Record<OtpFieldType, RegExp> = {
  numeric: /[^0-9]/g,
  alphanumeric: /[^0-9a-zA-Z]/g,
};

// Cell width per size. This is the ONE geometry the spec does not declare
// (the spec sizes give height/fontSize/gap/radius); it lives only in the web
// CSS, so it is mirrored here verbatim — same values the web SKELETON_CELL uses.
const CELL_WIDTH: Record<OtpFieldSize, string> = {
  sm: '2rem',
  md: '2.5rem',
  lg: '3rem',
};

type FocusableInput = { focus?: () => void };
const FocusableTextInput = TextInput as unknown as ComponentType<TextInputProps & { ref?: (input: FocusableInput | null) => void }>;

export interface OtpFieldProps extends Omit<ViewProps, 'style' | 'children' | 'aria-label'> {
  /** Number of code characters. */
  length?: number;
  /** Controlled code value. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Called with the sanitized code on every change. */
  onValueChange?: (value: string) => void;
  /** Called once with the full code when the last cell fills. */
  onComplete?: (value: string) => void;
  /** Which characters the code accepts. */
  type?: OtpFieldType;
  /** Renders dots instead of the entered characters. */
  masked?: boolean;
  /** Draws a separator dash after every N cells, e.g. 3 for a 123-456 code. */
  groupSize?: number;
  size?: OtpFieldSize;
  disabled?: boolean;
  /** Paints the invalid treatment, matching Input's aria-invalid styling. */
  error?: boolean;
  autoFocus?: boolean;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
  /** Renders placeholders with the component's exact geometry. */
  skeleton?: boolean;
  /** Accessible name for the code input; defaults to "One-time code". */
  'aria-label'?: string;
}

// Size-independent metrics read once from the spec.
const DIMS = dimensionsFor(otpFieldSpec);
const BORDER = DIMS.border ?? 'hairline';

// Base resting paint (background/text/border), stripped of the leading `$`
// exactly as the shared resolvers do so it cannot drift from the web kit.
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);
const BASE = (otpFieldSpec.paint ?? {}) as { background?: string; text?: string; border?: string };
const BASE_BG = bare(BASE.background) ?? 'surface';
const BASE_TEXT = bare(BASE.text) ?? 'text';
const BASE_BORDER = bare(BASE.border) ?? 'border';

// State tokens, all read from the spec's `states` entries.
const FOCUS_BORDER = paintFor(otpFieldSpec, 'states', 'focus').border ?? 'focus-ring';
const DISABLED_BG = paintFor(otpFieldSpec, 'states', 'disabled').background ?? 'surface-sunken';
const ERROR_BORDER = paintFor(otpFieldSpec, 'states', 'error').border ?? 'danger-border';
const ERROR_ACTIVE_BORDER = paintFor(otpFieldSpec, 'states', 'error')['active-border'] ?? 'danger-solid';

/**
 * The Glacier OtpField, rendered with React Native primitives. Where the web
 * kit stretches one invisible <input> across presentation cells (for native
 * autocomplete="one-time-code"), React Native has no invisible-input-over-cells
 * trick, so this renders a row of single-character <TextInput> cells — the
 * shape the native binding calls for. Each cell is painted and sized from the
 * otpField spec through the shared resolvers (border/background/radius/height/
 * fontSize/font-mono), so the RESTING visual matches @glacier/react's OtpField
 * and cannot drift from it.
 *
 * The blinking caret and the 3px focus/error glow ring are motion/DOM effects
 * with no animation runtime here; the focus ring is approximated by swapping the
 * focused cell's border to focus-ring (danger-solid under error), the resting
 * treatment the parity check compares. Platform code autofill and the localized
 * default label are DOM/i18n features noted as native follow-ups.
 */
export function OtpField({
  length = 6,
  value: valueProp,
  defaultValue,
  onValueChange,
  onComplete,
  type = 'numeric',
  masked = false,
  groupSize,
  size = 'md',
  disabled = false,
  error = false,
  autoFocus = false,
  glass = false,
  skeleton = false,
  'aria-label': ariaLabel,
  ...rest
}: OtpFieldProps) {
  const [value, setValue] = useControlled<string>({
    value: valueProp,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  });
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<Array<FocusableInput | null>>([]);

  const dims = sizeFor(otpFieldSpec, size);
  const gap = dims.gap ?? 'space-2';
  const radius = dims.radius ?? 'radius-md';
  const height = dims.height ?? 'control-height-md';
  const fontSize = dims.fontSize ?? 'font-size-md';

  const row = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    alignSelf: 'flex-start' as const,
    columnGap: t(gap),
  };

  if (skeleton) {
    return (
      <View aria-hidden={true} style={row}>
        {Array.from({ length }, (_, i) => (
          <Skeleton key={i} width={CELL_WIDTH[size]} height={t(height)} radius={t(radius)} />
        ))}
      </View>
    );
  }

  // The code reads left to right; cell i shows value[i]. Typing/paste is
  // sanitized and re-compacted so onValueChange emits the same clean string the
  // web kit does.
  const commit = (next: string) => {
    if (next === value) return;
    setValue(next);
    if (next.length === length) onComplete?.(next);
  };

  const handleChange = (index: number, text: string) => {
    const filtered = text.replace(FILTERS[type], '');
    const chars = Array.from({ length }, (_, i) => value[i] ?? '');
    if (filtered === '') {
      chars[index] = '';
    } else {
      // A single keystroke advances to the next cell; a paste fills forward.
      let pos = index;
      for (const ch of filtered) {
        if (pos >= length) break;
        chars[pos] = ch;
        pos += 1;
      }
    }
    commit(chars.join('').slice(0, length));

    if (filtered) inputRefs.current[Math.min(index + filtered.length, length - 1)]?.focus?.();
    else if (value[index] && index > 0) inputRefs.current[index - 1]?.focus?.();
  };

  return (
    <View
      {...rest}
      aria-label={ariaLabel ?? 'One-time code'}
      style={{ ...row, opacity: disabled ? 0.5 : 1 }}
    >
      {Array.from({ length }, (_, i) => {
        const focused = focusedIndex === i;
        const showSeparator =
          groupSize != null && groupSize > 0 && (i + 1) % groupSize === 0 && i < length - 1;

        // Border precedence mirrors the CSS cascade: base border, then glass,
        // then error, then the focused (active) cell wins with the focus/danger
        // ring color.
        let borderColor = BASE_BORDER;
        if (glass) borderColor = 'glass-border';
        if (error) borderColor = ERROR_BORDER;
        if (focused) borderColor = error ? ERROR_ACTIVE_BORDER : FOCUS_BORDER;

        let backgroundColor = glass ? 'glass-regular' : BASE_BG;
        if (disabled) backgroundColor = DISABLED_BG;

        return (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', columnGap: t(gap) }}>
            <FocusableTextInput
              ref={(input) => {
                inputRefs.current[i] = input;
              }}
              // Masking is native via secureTextEntry (dots), matching the web
              // MASK_CHAR presentation; the cell still owns the real character.
              value={value[i] ?? ''}
              editable={!disabled}
              autoFocus={i === 0 ? autoFocus : undefined}
              secureTextEntry={masked}
              keyboardType={type === 'numeric' ? 'number-pad' : 'default'}
              onChangeText={(text) => handleChange(i, text)}
              onFocus={() => setFocusedIndex(i)}
              onBlur={() => setFocusedIndex((cur) => (cur === i ? null : cur))}
              style={{
                width: CELL_WIDTH[size],
                height: t(height),
                borderWidth: t(BORDER),
                borderStyle: 'solid',
                borderColor: t(borderColor),
                borderRadius: t(radius),
                backgroundColor: t(backgroundColor),
                textAlign: 'center',
                // Text paint lives on the input itself (it renders the glyph).
                color: t(BASE_TEXT),
                fontSize: t(fontSize),
                fontFamily: t('font-mono'),
              }}
            />
            {showSeparator && (
              <View
                aria-hidden={true}
                style={{
                  width: t(gap),
                  height: 2,
                  borderRadius: t('radius-full'),
                  backgroundColor: t('border-strong'),
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}
