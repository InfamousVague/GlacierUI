import { View, type ViewProps } from 'react-native';
import { progressBarSizes, progressBarTones, progressBarSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { paintStyle, sizeFor, dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

// Derived from the spec so the unions cannot drift from the web kit.
export type ProgressBarSize = (typeof progressBarSizes)[number];
export type ProgressBarTone = (typeof progressBarTones)[number];

export interface ProgressBarProps extends Omit<ViewProps, 'style' | 'children'> {
  /** 0 to max. Omit (or set indeterminate) for an unknown duration. */
  value?: number;
  max?: number;
  indeterminate?: boolean;
  size?: ProgressBarSize;
  tone?: ProgressBarTone;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Accessible name for the bar. */
  'aria-label'?: string;
}

// Size-independent box metrics (radius) read once from the spec.
const BOX = dimensionsFor(progressBarSpec);

/**
 * A resolved measurement value. `sizeFor` returns token names alongside raw CSS
 * lengths (the track's `height: 0.375rem` is declared inline in the spec's sizes,
 * not as a token). A token name gets wrapped in the custom property; a raw length
 * — anything starting with a digit or dot — passes straight through so it never
 * becomes `var(--glacier-0.375rem)`.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

/**
 * The Glacier ProgressBar, rendered with React Native primitives. Geometry
 * (track height, radius) and paint (the tone-colored fill, the neutral track)
 * are read from the progress-bar spec through the shared resolvers, so it is
 * visually identical to @glacier/react's ProgressBar and cannot drift from it.
 *
 * This renders the RESTING visual only. The web kit eases the determinate fill's
 * width on change and sweeps a 40%-wide fill for the indeterminate case (an
 * opacity pulse under reduced motion); reproducing those on-device (no animation
 * runtime here) is a follow-up. The static geometry is exact: a determinate bar
 * holds its computed width, and an indeterminate bar shows the 40% fill at the
 * track's left edge — the sweep animation's static (pre-animation) position.
 */
export function ProgressBar({
  value,
  max = 100,
  indeterminate = false,
  size = 'md',
  tone = 'accent',
  skeleton = false,
  'aria-label': ariaLabel,
  ...rest
}: ProgressBarProps) {
  const dims = sizeFor(progressBarSpec, size);
  const trackHeight = metric(dims.height, size === 'sm' ? '0.375rem' : '0.625rem');
  const radius = t(BOX.radius ?? 'radius-full');

  if (skeleton) {
    return <Skeleton width="100%" height={trackHeight} radius={radius} {...rest} />;
  }

  const unknown = indeterminate || value === undefined;
  const clamped = unknown ? 0 : Math.min(Math.max(value, 0), max);
  // Tone paint is the fill background (accent-solid / success-solid / ...); the
  // track always paints the neutral segment token, matching Progress.module.css.
  const fillPaint = paintStyle(progressBarSpec, 'tones', tone);

  return (
    <View
      accessibilityRole="progressbar"
      aria-label={ariaLabel}
      style={{
        position: 'relative',
        width: '100%',
        height: trackHeight,
        overflow: 'hidden',
        borderRadius: radius,
        backgroundColor: t('segment-track'),
      }}
      {...rest}
    >
      <View
        style={
          unknown
            ? {
                // `.indeterminate .fill`: absolute, inset-block 0 (top/bottom),
                // width 40%; its static horizontal position is the left edge.
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: '40%',
                borderRadius: radius,
                ...fillPaint,
              }
            : {
                height: '100%',
                width: `${(clamped / max) * 100}%`,
                borderRadius: radius,
                ...fillPaint,
              }
        }
      />
    </View>
  );
}
