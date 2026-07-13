import { type ReactNode } from 'react';
import { Text as RNText, View, type TextProps as RNTextProps } from 'react-native';
import { textSpec, textSizes, textTones, textWeights, textAligns } from '@glacier/spec';
import { t } from './tokens.ts';
import { paintStyle, sizeFor } from './resolve.ts';

// Derived from the spec so the unions cannot drift from the web kit.
export type TextSize = (typeof textSizes)[number];
export type TextToneName = (typeof textTones)[number];
export type TextWeight = (typeof textWeights)[number];
export type TextAlign = (typeof textAligns)[number];

export interface TextProps extends Omit<RNTextProps, 'children' | 'style'> {
  size?: TextSize;
  tone?: TextToneName;
  weight?: TextWeight;
  /** Monospace with tabular numerals, for values and measurements. */
  mono?: boolean;
  /** Text alignment; inherits (left) when unset. */
  align?: TextAlign;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  children?: ReactNode;
}

// React Native's textAlign has no logical start/end; map to the physical
// values (LTR). center/justify pass straight through.
const ALIGN: Record<TextAlign, 'left' | 'center' | 'right' | 'justify'> = {
  start: 'left',
  center: 'center',
  end: 'right',
  justify: 'justify',
};

/**
 * The Glacier Text primitive, rendered with React Native's <Text>. Font size,
 * color, weight and family are read from the text spec through the shared
 * resolvers, so it is visually identical to @glacier/react's Text and cannot
 * drift from it. This is the base other native atoms lean on for labels.
 */
export function Text({
  size = 'md',
  tone = 'default',
  weight = 'regular',
  mono = false,
  align,
  skeleton = false,
  children,
  ...rest
}: TextProps) {
  const dims = sizeFor(textSpec, size);
  const paint = paintStyle(textSpec, 'tones', tone);
  const fontSize = t(dims.fontSize ?? 'font-size-md');

  if (skeleton) {
    // Resting placeholder: a static tinted block at the line's font size. The
    // shimmer animation is a device follow-up (no animation runtime here).
    return (
      <View
        style={{
          height: fontSize,
          width: t('space-24'),
          backgroundColor: t('hover'),
          borderRadius: t('radius-sm'),
        }}
      />
    );
  }

  return (
    <RNText
      style={{
        color: (paint.color as string) ?? t('text'),
        fontSize,
        // Per-size line-height, matching Typography.module.css `.text.<size>`.
        lineHeight: t(`leading-${size}`) as never,
        fontFamily: mono ? t('font-mono') : t('font-sans'),
        fontWeight: t(`font-weight-${weight}`) as never,
        // Mono values line up in columns, matching the web `.mono` rule.
        ...(mono ? { fontVariant: ['tabular-nums'] } : null),
        textAlign: align ? ALIGN[align] : undefined,
      }}
      {...rest}
    >
      {children}
    </RNText>
  );
}
