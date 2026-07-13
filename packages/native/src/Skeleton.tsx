import { View, type ViewProps } from 'react-native';
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
 * This renders the resting visual only: the web kit sweeps a highlight band
 * across every skeleton (an opacity pulse under reduced motion). Reproducing
 * that on-device (no animation runtime here) is a follow-up; the static tinted
 * block already holds the exact geometry so content never shifts on arrival.
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
  return (
    <View
      // Decorative: hidden from the accessibility tree, matching the web
      // Skeleton's aria-hidden. Mark the loading region with aria-busy at the
      // app level instead.
      aria-hidden={true}
      style={{
        width,
        height: resolvedHeight,
        borderRadius: radius ?? (variantRadius ? t(variantRadius) : undefined),
        ...paint,
      }}
      {...rest}
    />
  );
}
