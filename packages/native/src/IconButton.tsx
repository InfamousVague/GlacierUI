import { type ReactNode } from 'react';
import { Pressable, View, type PressableProps } from 'react-native';
import { iconButtonVariants, iconButtonSpec, controlSizes } from '@glacier/spec';
import { press } from '@glacier/commons';
import { t } from './tokens.ts';
import { paintStyle, sizeFor, dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

// Derived from the spec so the unions cannot drift from the web kit.
export type IconButtonVariant = (typeof iconButtonVariants)[number];
export type IconButtonSize = (typeof controlSizes)[number];

export interface IconButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  /** Required: icon-only controls have no visible text. */
  'aria-label': string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  /** Renders a placeholder with the control's exact geometry. */
  skeleton?: boolean;
  /** The single centered icon glyph. */
  children?: ReactNode;
}

// Size-independent box metrics (radius, gap, border) read once from the spec.
const BOX = dimensionsFor(iconButtonSpec);

/**
 * The Glacier IconButton, rendered with React Native primitives. A square,
 * icon-only button whose paint (six variants) and geometry (three sizes) are
 * read from the icon-button spec through the shared resolvers, so it stays
 * pixel-identical to @glacier/react's IconButton and cannot drift from it.
 *
 * Web-parity notes:
 * - The control is a square: width = height = the size's `diameter`
 *   (control-height-*), padding 0, matching the web `.icon` rule.
 * - Every variant carries a transparent hairline border as the base box so the
 *   filled and outline variants share one outer size (web `.button` rule); the
 *   outline / glass paint overrides the border color.
 * - Press feedback dips to `press.compact` (0.94), matching the web
 *   `pressTap('compact')`.
 * - The icon is a caller-supplied ReactNode slot (spec anatomy: `icon`,
 *   required). It is wrapped in a centering View that carries the variant text
 *   color plus the size font-size, so a currentColor / em-sized SVG inherits
 *   them on react-native-web (this binding does not render its own glyph).
 *
 * Resting visuals only — the web's hover color ease and the focus-ring bloom are
 * motion the native binding does not run; the glass variant's backdrop blur and
 * shadow have no React Native equivalent and are dropped.
 */
export function IconButton({
  variant = 'ghost',
  size = 'md',
  skeleton = false,
  disabled = false,
  children,
  'aria-label': ariaLabel,
  ...rest
}: IconButtonProps) {
  const dims = sizeFor(iconButtonSpec, size);

  if (skeleton) {
    // Same geometry as the resting control: a square the size of the control
    // height, with the shared control radius (web renders <Skeleton> here too).
    return (
      <Skeleton
        variant="rect"
        width={t(dims.diameter ?? 'control-height-md')}
        height={t(dims.diameter ?? 'control-height-md')}
        radius={t(BOX.radius ?? 'control-radius')}
      />
    );
  }

  const paint = paintStyle(iconButtonSpec, 'variants', variant);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={ariaLabel}
      aria-label={ariaLabel}
      disabled={disabled}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'flex-start',
          // Square: width = height = the size's diameter (control-height-*).
          width: t(dims.diameter ?? 'control-height-md'),
          height: t(dims.height ?? 'control-height-md'),
          padding: 0,
          borderRadius: t(BOX.radius ?? 'control-radius'),
          // Transparent hairline base so every variant shares one outer box
          // size (web `.button` rule); the outline/glass paint overrides it.
          borderWidth: t(BOX.border ?? 'hairline'),
          borderStyle: 'solid',
          borderColor: 'transparent',
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: pressed && !disabled ? press.compact : 1 }],
          ...paint,
        },
      ]}
      {...rest}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          // The icon inherits the variant text color and the size font-size, so
          // a currentColor / em-sized SVG picks them up on react-native-web.
          color: (paint.color as string) ?? t('text'),
          fontSize: t(dims.fontSize ?? 'font-size-sm'),
        }}
      >
        {children}
      </View>
    </Pressable>
  );
}
