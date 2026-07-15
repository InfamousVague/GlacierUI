import { type ReactNode } from 'react';
import { Pressable, Text, type PressableProps } from 'react-native';
import { buttonVariants, buttonSpec, controlSizes } from '@glacier/spec';
import { press } from '@glacier/commons';
import { t } from './tokens.ts';
import { paintStyle, sizeFor, dimensionsFor } from './resolve.ts';

// Derived from the spec so the unions cannot drift from the web kit.
export type ButtonVariant = (typeof buttonVariants)[number];
export type ButtonSize = (typeof controlSizes)[number];

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children?: ReactNode;
}

// Size-independent box metrics (radius, gap) read once from the spec.
const BOX = dimensionsFor(buttonSpec);

/**
 * The Glacier Button, rendered with React Native primitives. Paint and geometry
 * are read from the button spec through the shared resolvers, so it is visually
 * identical to @glacier/react's Button and cannot drift from it. Text children
 * are wrapped in <Text> automatically (React Native cannot render bare strings
 * inside a Pressable).
 */
export function Button({
  variant = 'solid',
  size = 'md',
  fullWidth = false,
  disabled = false,
  children,
  ...rest
}: ButtonProps) {
  const paint = paintStyle(buttonSpec, 'variants', variant);
  const dims = sizeFor(buttonSpec, size);
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          columnGap: t(BOX.gap ?? 'space-2'),
          height: t(dims.height ?? 'control-height-md'),
          paddingHorizontal: t(dims.paddingInline ?? 'space-5'),
          borderRadius: t(BOX.radius ?? 'control-radius'),
          // Every web button carries a transparent hairline border so filled and
          // outline variants share one box size (see `.button` in the CSS). Match
          // it here as the base; the outline variant's paint overrides the color.
          borderWidth: t('hairline'),
          borderStyle: 'solid',
          borderColor: 'transparent',
          ...(fullWidth ? { alignSelf: 'stretch' as const } : {}),
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: pressed && !disabled ? press.control : 1 }],
          ...paint,
        },
      ]}
      {...rest}
    >
      <Text
        style={{
          color: (paint.color as string) ?? t('text'),
          fontSize: t(dims.fontSize ?? 'font-size-sm'),
          fontFamily: t('font-sans'),
          fontWeight: t('font-weight-medium') as never,
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
