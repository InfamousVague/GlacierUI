import { useEffect, useRef } from 'react';
import { Animated, Platform, View, type ViewProps } from 'react-native';
import { controlSizes, spinnerTones, spinnerSpec, skeletonSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { paintFor, paintStyle, sizeFor, dimensionsFor } from './resolve.ts';

// Derived from the spec so the size and tone unions cannot drift from the web kit.
export type SpinnerSize = (typeof controlSizes)[number];
export type SpinnerTone = (typeof spinnerTones)[number];

export interface SpinnerProps extends Omit<ViewProps, 'style' | 'children'> {
  /** sm tracks the surrounding font size (1em); md and lg are fixed. */
  size?: SpinnerSize;
  tone?: SpinnerTone;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Accessible name. Pass an empty string when a parent already announces loading. */
  'aria-label'?: string;
}

// Size-independent box metrics (radius) read once from the spec.
const BOX = dimensionsFor(spinnerSpec);

// The un-localized default label. The web kit localizes this through its
// LocaleProvider (kitMessages.loading); the native kit has no i18n runtime, so
// it falls back to the spec's English default. Callers can still pass an
// explicit `aria-label`.
const DEFAULT_LABEL = String(spinnerSpec.defaults?.['aria-label'] ?? 'Loading');

/**
 * A resolved measurement value. `sizeFor`/`dimensionsFor` return token names
 * (e.g. `radius-full`, `size-md`) alongside raw CSS lengths (the spinner's
 * `1em` / `1.875rem` diameters and `2px` / `3px` borders are declared inline,
 * not as tokens). A token name gets wrapped in its custom property; a raw
 * length — anything that starts with a digit or a dot — passes straight through
 * so it never becomes `var(--glacier-2px)`.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

/**
 * The Glacier Spinner, rendered with a single React Native View. The resting
 * visual is a ring: a full-radius bordered box with its bottom edge transparent,
 * exactly the RESTING computed style of the DOM kit's spinning `<span>` (before
 * the CSS `spin` keyframes rotate it). Diameter, border width, radius and the
 * per-tone ring color are read from the spinner spec through the shared
 * resolvers, so it cannot drift from @glacier/react's Spinner.
 *
 * The `inherit` tone paints `currentColor`, which react-native-web resolves
 * against the inherited text color on the DOM (matching the web
 * `.spinner.inherit` rule); a concrete device token map is the follow-up.
 */
export function Spinner({ size = 'md', tone = 'subtle', skeleton = false, ...rest }: SpinnerProps) {
  const dims = sizeFor(spinnerSpec, size);
  const diameter = metric(dims.diameter, 'size-md');
  const border = metric(dims.border, '2px');
  const radius = metric(BOX.radius, 'radius-full');

  if (skeleton) {
    // The web renders a Skeleton disc masked down to just its border band (the
    // `.skeletonRing` radial-gradient mask). React Native has no mask-image, so
    // reproduce the same ring silhouette directly: a bordered box at the exact
    // diameter and stroke, painted with the skeleton wash color.
    const wash = paintStyle(skeletonSpec, 'variants', 'circle').backgroundColor;
    return (
      <View
        // Decorative placeholder, mirroring the web Skeleton's aria-hidden.
        aria-hidden={true}
        style={{
          width: diameter,
          height: diameter,
          borderRadius: radius,
          borderWidth: border,
          borderStyle: 'solid',
          borderColor: wash,
        }}
        {...rest}
      />
    );
  }

  // The ring is a currentColor border in the DOM; each tone repaints via the
  // text role (subtle → text-subtle, accent → accent-solid). The `inherit` tone
  // declares no token, so it keeps currentColor.
  const tonePaint = paintFor(spinnerSpec, 'tones', tone);
  const ringColor = tonePaint.text ? t(tonePaint.text) : 'currentColor';

  const label = rest['aria-label'] ?? DEFAULT_LABEL;
  const isHidden = label === '';

  const ringStyle = {
    width: diameter,
    height: diameter,
    borderRadius: radius,
    borderWidth: border,
    borderStyle: 'solid' as const,
    color: ringColor,
    borderColor: ringColor,
    borderBottomColor: 'transparent',
  };

  if (Platform.OS === 'web') {
    return (
      <View
        accessibilityRole="status"
        aria-label={isHidden ? undefined : label}
        aria-hidden={isHidden || undefined}
        style={{
          ...ringStyle,
          animationName: 'nativeSpinnerRotate',
          animationDuration: '800ms',
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
        }}
        {...rest}
      />
    );
  }

  return <AnimatedSpinner {...rest} isHidden={isHidden} label={label} ringStyle={ringStyle} />;
}

function AnimatedSpinner({ isHidden, label, ringStyle, ...rest }: ViewProps & { isHidden: boolean; label: string; ringStyle: Record<string, string> }) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(Animated.timing(rotation, { toValue: 1, duration: 800, useNativeDriver: true }));
    animation.start();
    return () => animation.stop();
  }, [rotation]);

  return (
    <Animated.View
      accessibilityRole="status"
      aria-label={isHidden ? undefined : label}
      aria-hidden={isHidden || undefined}
      style={{
        ...ringStyle,
        borderBottomColor: 'transparent',
        transform: [{ rotate: rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
      }}
      {...rest}
    />
  );
}
