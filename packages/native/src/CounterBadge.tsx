import { View, Text, type ViewProps } from 'react-native';
import { counterBadgeSpec, counterBadgeTones, compactSizes } from '@glacier/spec';
import { t } from './tokens.ts';
import { paintStyle, sizeFor, dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

// Derived from the spec so the unions cannot drift from the web kit.
export type CounterBadgeTone = (typeof counterBadgeTones)[number];
export type CounterBadgeSize = (typeof compactSizes)[number];

export interface CounterBadgeProps extends Omit<ViewProps, 'style' | 'children'> {
  count: number;
  /** Render `${max}+` when count is greater than max. */
  max?: number;
  tone?: CounterBadgeTone;
  /** Render a small dot with no number, for presence or attention. */
  dot?: boolean;
  size?: CounterBadgeSize;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
}

// Size-independent box metrics (the pill radius) read once from the spec.
const BOX = dimensionsFor(counterBadgeSpec);

/**
 * The Glacier CounterBadge, rendered with React Native primitives. Paint and
 * geometry are read from the counter-badge spec through the shared resolvers, so
 * it is visually identical to @glacier/react's CounterBadge and cannot drift
 * from it. Pill-shaped with tabular figures; the count is rendered in <Text>
 * with an explicit color (color does not inherit through a View).
 */
export function CounterBadge({
  count,
  max = 99,
  tone = 'danger',
  dot = false,
  size = 'md',
  skeleton = false,
  glass = false,
  ...rest
}: CounterBadgeProps) {
  const dims = sizeFor(counterBadgeSpec, size);
  // Glass reads the material tokens directly (they live outside the spec's tone
  // set, matching the web CSS). The web `.glass` rule sets a border-COLOR but no
  // width, so no border is actually drawn; we match that by omitting the border.
  const paint = glass
    ? { backgroundColor: t('glass-regular'), color: t('text') }
    : paintStyle(counterBadgeSpec, 'tones', tone);

  // Skeleton delegates to the shared Skeleton exactly as the web kit does: a
  // fixed 1.25rem hover-tinted circle, independent of `size`.
  if (skeleton) {
    return <Skeleton variant="circle" width="1.25rem" {...rest} />;
  }

  if (dot) {
    return (
      <View
        accessibilityRole="text"
        accessibilityLabel="New activity"
        style={{
          width: t(dims.diameter ?? 'size-xs'),
          height: t(dims.diameter ?? 'size-xs'),
          borderRadius: t(BOX.radius ?? 'radius-full'),
          backgroundColor: paint.backgroundColor,
          borderColor: paint.borderColor,
          borderWidth: paint.borderWidth,
          borderStyle: paint.borderStyle,
        }}
        {...rest}
      />
    );
  }

  if (count <= 0) return null;

  const label = count > max ? `${max}+` : String(count);

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${count} items`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: t(dims.height ?? 'size-md'),
        // min-width equals the height so single digits stay circular.
        minWidth: t(dims.height ?? 'size-md'),
        paddingHorizontal: t(dims.paddingInline ?? 'space-2'),
        borderRadius: t(BOX.radius ?? 'radius-full'),
        backgroundColor: paint.backgroundColor,
        borderColor: paint.borderColor,
        borderWidth: paint.borderWidth,
        borderStyle: paint.borderStyle,
      }}
      {...rest}
    >
      <Text
        style={{
          color: (paint.color as string) ?? t('text'),
          fontSize: t(dims.fontSize ?? 'font-size-xs'),
          // line-height:1 — the glyph box is exactly the font size, matching
          // the web `.badge { line-height: 1 }` so the pill height is not padded.
          lineHeight: t(dims.fontSize ?? 'font-size-xs') as never,
          fontFamily: t('font-sans'),
          fontWeight: t('font-weight-semibold') as never,
          fontVariant: ['tabular-nums'],
        }}
      >
        {label}
      </Text>
    </View>
  );
}
