import { type ReactNode } from 'react';
import { Pressable, Text, type PressableProps } from 'react-native';
import { toggleSpec, controlSizes } from '@glacier/spec';
import { useControlled, press } from '@glacier/commons';
import { t } from './tokens.ts';
import { paintStyle, sizeFor, dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

// Derived from the spec so the size union cannot drift from the web kit.
export type ToggleSize = (typeof controlSizes)[number];

export interface ToggleProps extends Omit<PressableProps, 'style' | 'children'> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  size?: ToggleSize;
  /** Square icon-only layout, like IconButton. */
  iconOnly?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
  /** Required when the content is icon-only. */
  'aria-label'?: string;
  children?: ReactNode;
}

// The uncontrolled-label skeleton widths match the web SKELETON_WIDTHS map
// (raw CSS lengths, not tokens); icon-only falls back to the square control
// height in the render below.
const SKELETON_WIDTHS: Record<ToggleSize, string> = { sm: '4.5rem', md: '5.5rem', lg: '6.5rem' };

// Size-independent box metrics (radius, gap, border) read once from the spec.
const BOX = dimensionsFor(toggleSpec);

// The pressed (aria-pressed=true) paint: accent-soft fill, accent-border
// hairline, accent-text label. Read from the spec's `pressed` state so it stays
// pixel-identical to Toggle.module.css.
const PRESSED = paintStyle(toggleSpec, 'states', 'pressed');

// The resting (unpressed, non-glass) label color from the spec base paint;
// strip the leading `$` exactly as the shared resolvers do.
const BASE = (toggleSpec.paint ?? {}) as { text?: string };
const BASE_TEXT = t((BASE.text ?? '$text-muted').replace(/^\$/, ''));

/**
 * The Glacier Toggle, rendered with React Native primitives. A press-state
 * button (aria-pressed) whose paint and geometry are read from the toggle spec
 * through the shared resolvers, so it stays pixel-identical to @glacier/react's
 * Toggle and cannot drift from it.
 *
 * Web-parity notes:
 * - Three paints stack by web specificity: the resting box is transparent with
 *   a transparent hairline border and muted text; `glass` washes it in the
 *   frosted tint (glass-regular fill, glass-border hairline, full-strength
 *   text); a pressed toggle overrides both with the accent-soft state paint
 *   (matching `.toggle[aria-pressed]` beating `.glass` in the CSS cascade).
 * - Every state carries the transparent/colored hairline so the box never jumps
 *   size, mirroring the web `.toggle` base border.
 * - Press feedback dips to `press.compact` (0.94), matching the web
 *   `pressTap('compact')`.
 * - The label/icon is a caller-supplied ReactNode wrapped in a single <Text>
 *   carrying the state color + size font (native cannot render a bare string in
 *   a Pressable, and text color does not inherit from a parent View); a
 *   currentColor / em-sized icon inherits them on react-native-web.
 *
 * Resting visuals only — the web's hover color ease and focus-ring bloom are
 * motion the native binding does not run; glass drops its backdrop blur +
 * saturate + inset highlight (no React Native equivalent), keeping the tint.
 * `className` / `onClick` are web-only DOM props; native uses `onPress`.
 */
export function Toggle({
  pressed,
  defaultPressed = false,
  onPressedChange,
  size = 'md',
  iconOnly = false,
  skeleton = false,
  glass = false,
  disabled = false,
  children,
  ...rest
}: ToggleProps) {
  const [isPressed, setPressed] = useControlled({
    value: pressed,
    defaultValue: defaultPressed ?? false,
    onChange: onPressedChange,
  });
  const dims = sizeFor(toggleSpec, size);

  if (skeleton) {
    // Same geometry as the resting control: the control height, square when
    // icon-only, with the shared control radius (web renders <Skeleton> here).
    return (
      <Skeleton
        variant="rect"
        width={iconOnly ? t(dims.height ?? 'control-height-md') : SKELETON_WIDTHS[size]}
        height={t(dims.height ?? 'control-height-md')}
        radius={t(BOX.radius ?? 'control-radius')}
      />
    );
  }

  // Compose the three paints in the web cascade order: base < glass < pressed.
  let backgroundColor = 'transparent';
  let borderColor = 'transparent';
  let color = BASE_TEXT;
  if (glass) {
    backgroundColor = t('glass-regular');
    borderColor = t('glass-border');
    color = t('text');
  }
  if (isPressed) {
    backgroundColor = PRESSED.backgroundColor as string;
    borderColor = PRESSED.borderColor as string;
    color = PRESSED.color as string;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isPressed, disabled }}
      disabled={disabled}
      onPress={() => setPressed(!isPressed)}
      style={({ pressed: isTapping }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'flex-start',
          columnGap: t(BOX.gap ?? 'space-2'),
          height: t(dims.height ?? 'control-height-md'),
          // Icon-only is a square (width = control height, no inline padding);
          // otherwise the size's inline padding, matching the web `.iconOnly` /
          // size rules.
          ...(iconOnly
            ? { width: t(dims.height ?? 'control-height-md'), paddingHorizontal: 0 }
            : { paddingHorizontal: t(dims.paddingInline ?? 'space-4') }),
          borderRadius: t(BOX.radius ?? 'control-radius'),
          // Transparent hairline base so every state shares one box size (web
          // `.toggle` base border); glass / pressed override the color.
          borderWidth: t(BOX.border ?? 'hairline'),
          borderStyle: 'solid',
          backgroundColor,
          borderColor,
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: isTapping && !disabled ? press.compact : 1 }],
        },
      ]}
      {...rest}
    >
      <Text
        numberOfLines={1}
        style={{
          color,
          fontSize: t(dims.fontSize ?? 'font-size-sm'),
          // line-height:1, matching the web `.toggle` rule.
          lineHeight: t(dims.fontSize ?? 'font-size-sm') as never,
          fontFamily: t('font-sans'),
          fontWeight: t('font-weight-medium') as never,
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
