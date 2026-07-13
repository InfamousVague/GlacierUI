import { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { surfaceSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { paintStyle } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

// The web keeps a numeric public contract (0 | 1 | 2 | 'sunken') even though the
// spec's `surfaceLevels` are string variant names ('0'…'sunken'); we mirror the
// web type exactly so the docs compare 1:1, and stringify at the lookup seam.
export type SurfaceLevel = 0 | 1 | 2 | 'sunken';

export interface SurfaceProps extends Omit<ViewProps, 'children'> {
  /** 0 = app background, 1 = surface, 2 = raised, 'sunken' = inset wells. */
  level?: SurfaceLevel;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
  children?: ReactNode;
}

/**
 * The Glacier Surface, rendered with React Native primitives. It is the plainest
 * atom in the kit: a background plane at one of four elevation levels, with no
 * border, radius, or padding of its own (matching `.surface` in the CSS). The
 * per-level fill is read from the surface spec's variants through the shared
 * resolver, so it cannot drift from @glacier/react's Surface.
 *
 * The spec's `text` paint role is intentionally dropped from the container: the
 * web relies on CSS color inheritance, but RN `<Text>` does not inherit from a
 * parent `<View>`, so — like Card — content brings its own `<Text>` color.
 *
 * Resting visuals only. `glass` renders its resting tint (`glass-regular`); the
 * web's `backdrop-filter` blur has no native runtime and is accepted-but-noop
 * (as in Avatar/Card/Checkbox). The web's glass `border-color` is also a noop
 * there — the base surface sets no border width/style, so nothing is painted —
 * and is likewise omitted here.
 */
export function Surface({ level = 1, skeleton = false, glass = false, children, style, ...rest }: SurfaceProps) {
  if (skeleton) {
    // Mirrors the web 1:1: a full-width, 6rem-tall placeholder at radius-lg.
    return <Skeleton width="100%" height="6rem" radius={t('radius-lg')} {...rest} />;
  }

  // Solid: the per-level background from the spec. Glass overrides it with the
  // frosted material token. Only the background role is taken onto the View.
  const paint = paintStyle(surfaceSpec, 'variants', String(level));
  const backgroundColor = glass ? t('glass-regular') : paint.backgroundColor;

  return (
    // Caller style merges last so a demo can add padding/border/radius without
    // wiping the surface fill, and `...rest` cannot override the style.
    <View {...rest} style={[{ backgroundColor }, style as never]}>
      {children}
    </View>
  );
}
