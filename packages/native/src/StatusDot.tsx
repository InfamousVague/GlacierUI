import { View, type ViewProps } from 'react-native';
import { statusDotSpec, tones, compactSizes } from '@glacier/spec';
import { t } from './tokens.ts';
import { paintStyle, sizeFor, dimensionsFor } from './resolve.ts';

// Derived from the spec so the unions cannot drift from the web kit.
export type StatusDotTone = (typeof tones)[number];
export type StatusDotSize = (typeof compactSizes)[number];

export interface StatusDotProps extends Omit<ViewProps, 'children' | 'style'> {
  tone?: StatusDotTone;
  size?: StatusDotSize;
  /** Present on the web kit as an expanding ring; the device animation is a follow-up. */
  pulse?: boolean;
  /** Accessible name. When set the dot is a status region; otherwise it is decorative. */
  label?: string;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
}

// Size-independent box metric (radius) read once from the spec.
const BOX = dimensionsFor(statusDotSpec);

/**
 * The Glacier StatusDot, rendered with React Native primitives. Fill and
 * geometry are read from the status-dot spec through the shared resolvers, so it
 * is visually identical to @glacier/react's StatusDot and cannot drift from it.
 * The pulse ring is a web-only animation for now (the resting dot is rendered);
 * a device build adds it as a follow-up. Like the web kit the dot is a bare
 * circle: `label` names a status region for screen readers only (it is never
 * drawn as visible text); without one the dot is decorative (aria-hidden).
 */
export function StatusDot({
  tone = 'neutral',
  size = 'md',
  pulse = false,
  label,
  skeleton = false,
  ...rest
}: StatusDotProps) {
  const dims = sizeFor(statusDotSpec, size);
  const diameter = t(dims.diameter ?? 'size-xs');
  const radius = t(BOX.radius ?? 'radius-full');
  // Skeleton renders the resting wash (Skeleton's `hover` base) at the dot geometry.
  const paint = skeleton ? { backgroundColor: t('hover') } : paintStyle(statusDotSpec, 'tones', tone);

  // A labelled dot is a status region; otherwise (and while a skeleton) it is
  // purely decorative and hidden from the accessibility tree, matching the web
  // `role`/`aria-label`/`aria-hidden` wiring.
  const isStatus = !!label && !skeleton;

  return (
    <View
      accessibilityRole={isStatus ? 'status' : undefined}
      accessibilityLabel={isStatus ? label : undefined}
      aria-hidden={isStatus ? undefined : true}
      style={{
        width: diameter,
        height: diameter,
        borderRadius: radius,
        ...paint,
      }}
      {...rest}
    />
  );
}
