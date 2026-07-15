import { useEffect, useRef } from 'react';
import { Animated, Platform, View, type ViewProps } from 'react-native';
import { skeletonVariants, skeletonSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { paintStyle, dimensionsFor } from './resolve.ts';

// Derived from the spec so the variant union cannot drift from the web kit.
export type SkeletonVariant = (typeof skeletonVariants)[number];

export interface SkeletonProps extends Omit<ViewProps, 'style' | 'children'> {
  /** text is a 1em line, rect a rounded block, circle a disc. */
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  /** Corner radius override, e.g. t('control-radius'). */
  radius?: string;
}

// Size-independent metrics read once from the spec: textHeight, and the
// per-variant radii (textRadius / rectRadius / circleRadius).
const DIMS = dimensionsFor(skeletonSpec);

const RADIUS: Record<SkeletonVariant, string | undefined> = {
  text: DIMS.textRadius,
  rect: DIMS.rectRadius,
  circle: DIMS.circleRadius,
};

/**
 * The kit's one loading-placeholder primitive, rendered with a React Native
 * View. Paint (a subtle hover-token wash) and the per-variant radii come from
 * the skeleton spec through the shared resolvers, so it matches @glacier/react's
 * Skeleton and cannot drift from it. text is a 1em line, rect a rounded block,
 * circle a disc whose height falls back to its width.
 *
 * A clipped highlight band crosses the placeholder continuously, preserving
 * the web kit's loading affordance without changing its geometry.
 */
export function Skeleton({
  variant = 'rect',
  width,
  height,
  radius,
  ...rest
}: SkeletonProps) {
  const paint = paintStyle(skeletonSpec, 'variants', variant);
  const resolvedHeight =
    height ?? (variant === 'circle' ? width : variant === 'text' ? DIMS.textHeight : undefined);
  const variantRadius = RADIUS[variant];

  if (Platform.OS === 'web') {
    return (
      <View
        aria-hidden={true}
        style={{
          width,
          height: resolvedHeight,
          borderRadius: radius ?? (variantRadius ? t(variantRadius) : undefined),
          overflow: 'hidden',
          ...paint,
        }}
        {...rest}
      >
        <View
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '45vw',
            backgroundImage: `linear-gradient(100deg, ${t('hover')} 0%, ${t('active')} 50%, ${t('hover')} 100%)`,
            animationName: 'nativeSkeletonShimmer',
            animationDuration: '1.8s',
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
          }}
        />
      </View>
    );
  }

  return <AnimatedSkeleton {...rest} width={width} height={resolvedHeight} radius={radius ?? (variantRadius ? t(variantRadius) : undefined)} paint={paint} />;
}

function AnimatedSkeleton({ width, height, radius, paint, ...rest }: Omit<ViewProps, 'style' | 'children'> & Pick<SkeletonProps, 'width' | 'height' | 'radius'> & { paint: ReturnType<typeof paintStyle> }) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(Animated.timing(shimmer, { toValue: 1, duration: 1800, useNativeDriver: true }));
    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  return (
    <View
      // Decorative: hidden from the accessibility tree, matching the web
      // Skeleton's aria-hidden. Mark the loading region with aria-busy at the
      // app level instead.
      aria-hidden={true}
      style={{
        width,
        height,
        borderRadius: radius,
        overflow: 'hidden',
        ...paint,
      }}
      {...rest}
    >
      <Animated.View
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: '45%',
          backgroundColor: t('active'),
          opacity: 0.6,
          transform: [{ translateX: shimmer.interpolate({ inputRange: [0, 1], outputRange: [-220, 880] }) }],
        }}
      />
    </View>
  );
}
