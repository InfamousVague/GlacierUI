import { type ReactNode } from 'react';
import { View, Text, type ViewProps } from 'react-native';
import { pillVariants, pillSpec, tones, compactSizes } from '@glacier/spec';
import { t } from './tokens.ts';
import { paintFor, sizeFor, dimensionsFor } from './resolve.ts';

// Derived from the spec so the unions cannot drift from the web kit.
export type PillVariant = (typeof pillVariants)[number];
export type PillTone = (typeof tones)[number];
export type PillSize = (typeof compactSizes)[number];

export interface PillProps extends Omit<ViewProps, 'children' | 'style'> {
  tone?: PillTone;
  variant?: PillVariant;
  size?: PillSize;
  /** Leading glyph, hidden from assistive tech. */
  icon?: ReactNode;
  children?: ReactNode;
}

// Size-independent box metrics (radius, gap, border) read once from the spec.
const BOX = dimensionsFor(pillSpec);

/**
 * A resolved measurement value. `sizeFor`/`dimensionsFor` return token names
 * (e.g. `space-3`) alongside raw CSS lengths (the pill's `height: 1.375rem` is
 * declared inline, not as a token). Token names get wrapped in the custom
 * property; a raw length — anything that starts with a digit — passes straight
 * through so it never becomes `var(--glacier-1.375rem)`.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

/**
 * The paint for one variant x tone as a React Native style. The pill's tones
 * carry all three renderings in one map: `background`/`text` are the soft
 * fill, `solid-background`/`solid-text` the solid fill, and `outline-border`
 * the outline hairline (its text reuses the soft `text`). Read straight from
 * the spec so it stays pixel-identical to Pill.module.css.
 */
function pillPaint(variant: PillVariant, tone: PillTone) {
  const p = paintFor(pillSpec, 'tones', tone);
  // Hairline border is always present (transparent on soft/solid) so every
  // variant shares the same box size, matching the web `.pill` base rule.
  const base = {
    backgroundColor: 'transparent' as string,
    borderColor: 'transparent' as string,
    color: metric(p.text, 'text-muted'),
  };
  if (variant === 'solid') {
    base.backgroundColor = metric(p['solid-background'], 'accent-solid');
    base.color = metric(p['solid-text'], 'accent-contrast');
  } else if (variant === 'outline') {
    base.borderColor = metric(p['outline-border'], 'border-strong');
  } else {
    base.backgroundColor = metric(p.background, 'accent-soft');
  }
  return base;
}

/**
 * The Glacier Pill, rendered with React Native primitives. Paint and geometry
 * are read from the pill spec through the shared resolvers, so it is visually
 * identical to @glacier/react's Pill and cannot drift from it. The label is
 * wrapped in <Text> (React Native cannot render a bare string inside a View,
 * and text color does not inherit from a parent View).
 */
export function Pill({ tone = 'neutral', variant = 'soft', size = 'md', icon, children, ...rest }: PillProps) {
  const paint = pillPaint(variant, tone);
  const dims = sizeFor(pillSpec, size);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        columnGap: metric(BOX.gap, 'space-1'),
        height: metric(dims.height, '1.75rem'),
        paddingHorizontal: metric(dims.paddingInline, 'space-3'),
        borderRadius: metric(BOX.radius, 'radius-full'),
        borderWidth: metric(BOX.border, 'hairline'),
        borderStyle: 'solid',
        borderColor: paint.borderColor,
        backgroundColor: paint.backgroundColor,
      }}
      {...rest}
    >
      {icon != null && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            // Pull the leading glyph toward the edge and let it inherit the
            // pill's text color, matching the web `.icon` rule (a currentColor
            // SVG picks up this `color` on react-native-web).
            marginLeft: 'calc(var(--glacier-space-1) * -0.5)',
            color: paint.color,
          }}
        >
          {icon}
        </View>
      )}
      <Text
        numberOfLines={1}
        style={{
          color: paint.color,
          fontSize: metric(dims.fontSize, 'font-size-sm'),
          // line-height:1, matching the web `.pill` rule.
          lineHeight: metric(dims.fontSize, 'font-size-sm') as never,
          fontFamily: t('font-sans'),
          fontWeight: t('font-weight-medium') as never,
        }}
      >
        {children}
      </Text>
    </View>
  );
}
