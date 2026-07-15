import { type ReactNode } from 'react';
import { View, Pressable, type ViewProps, type PressableProps } from 'react-native';
import { cardSpec, cardVariants, cardElevations } from '@glacier/spec';
import { press } from '@glacier/commons';
import { t } from './tokens.ts';
import { paintFor, paintStyle, dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

// Derived from the spec so the unions cannot drift from the web kit.
export type Elevation = (typeof cardElevations)[number];
export type CardVariant = (typeof cardVariants)[number];

export interface CardProps extends Omit<PressableProps, 'children'> {
  /** Shadow depth, 0 through 5. Defaults to the resting depth (1). */
  elevation?: Elevation;
  /** Adds a press dip for clickable cards (the web also lifts on hover). */
  interactive?: boolean;
  /** 'glass' renders a translucent material (resting tint only on native). */
  variant?: CardVariant;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  children?: ReactNode;
}

// Size-independent box metrics (radius, padding, border) read once from the spec.
const BOX = dimensionsFor(cardSpec);

/**
 * The Glacier Card, rendered with React Native primitives. Paint (variant fill +
 * hairline border) and geometry (radius, padding) are read from the card spec
 * through the shared resolvers, so it is visually identical to @glacier/react's
 * Card and cannot drift from it. Each elevation maps to its resting `shadow-*`
 * token via `boxShadow`; glass keeps its own fixed material shadow.
 *
 * The dark-theme `elevation-overlay-*` token is composited as a child View,
 * because React Native has no CSS background-image layer. Glass backdrop blur
 * and the interactive hover lift remain web-only; an interactive card instead
 * dips by `press.control` on tap. Card content brings its own <Text>, so no
 * text color is set on the container (RN text does not inherit color from a
 * parent View).
 */
export function Card({
  elevation = 1,
  interactive = false,
  variant = 'solid',
  skeleton = false,
  children,
  style,
  ...rest
}: CardProps) {
  const paint = paintStyle(cardSpec, 'variants', variant);

  // Resting drop shadow. Solid reads the shadow token for its elevation step
  // from the spec's states; glass pairs a fixed depth with an inset highlight,
  // mirroring the `.glass[data-elevation]` rule in Surface.module.css.
  const boxShadow =
    variant === 'glass'
      ? `inset 0 ${t('hairline')} 0 ${t('glass-highlight')}, ${t('shadow-2')}`
      : t(paintFor(cardSpec, 'states', `elevation-${elevation}`).shadow ?? `shadow-${elevation}`);

  const box = {
    backgroundColor: paint.backgroundColor,
    borderColor: paint.borderColor,
    borderWidth: t(BOX.border ?? 'hairline'),
    borderStyle: 'solid' as const,
    borderRadius: t(BOX.radius ?? 'radius-xl'),
    padding: t(BOX.padding ?? 'space-6'),
    boxShadow,
  };
  const elevationOverlay =
    variant === 'solid' && elevation > 0 ? (
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: t(`elevation-overlay-${elevation}`),
          borderRadius: t(BOX.radius ?? 'radius-xl'),
        }}
      />
    ) : null;

  if (skeleton) {
    // Resting placeholder at the card's exact geometry: three text lines with a
    // space-2 gap, matching the web skeleton's 40% / 100% / 85% widths.
    return (
      <View {...rest} style={[box, style as never]}>
        {elevationOverlay}
        <View style={{ rowGap: t('space-2') }}>
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="85%" />
        </View>
      </View>
    );
  }

  if (interactive) {
    return (
      <Pressable
        {...rest}
        // Caller style merges last so layout props (width/margin) augment the box
        // without clobbering its paint, and `...rest` cannot override the style.
        style={({ pressed }) => [box, { transform: [{ scale: pressed ? press.control : 1 }] }, style as never]}
      >
        {elevationOverlay}
        {children}
      </Pressable>
    );
  }

  return (
    <View {...rest} style={[box, style as never]}>
      {elevationOverlay}
      {children}
    </View>
  );
}
