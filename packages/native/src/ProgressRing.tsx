import { type ReactNode } from 'react';
import { View, Text } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { progressRingTones } from '@glacier/spec';
import { t } from './tokens.ts';
import { Skeleton } from './Skeleton.tsx';

// Derived from the spec so the tone union cannot drift from the web kit.
export type ProgressRingTone = (typeof progressRingTones)[number];

export interface ProgressRingProps {
  /** 0 to max. Clamped into range. */
  value: number;
  max?: number;
  /** Pixel diameter of the ring. */
  size?: number;
  /** Stroke width of the track and arc in pixels. */
  thickness?: number;
  tone?: ProgressRingTone;
  /** Centered content. Takes priority over showValue. */
  label?: ReactNode;
  /** With no label, render the rounded percentage in the center. */
  showValue?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Accessible name for the ring. */
  'aria-label'?: string;
}

// The arc fill per tone (the track is always the neutral segment token),
// matching ProgressRing.module.css. Token names, wrapped by t().
const ARC_TOKEN: Record<ProgressRingTone, string> = {
  accent: 'accent-solid',
  success: 'success-solid',
  warning: 'warning-solid',
  danger: 'danger-solid',
};

/**
 * The Glacier ProgressRing, rendered with react-native-svg. The arc is a stroked
 * circle whose dash offset encodes progress, exactly like the DOM kit's <svg>,
 * so it is visually identical on web (react-native-svg resolves to a real DOM
 * <svg>) and on device. The whole ring is rotated -90deg so 0% starts at twelve
 * o'clock, matching `.svg { transform: rotate(-90deg) }` in the CSS.
 */
export function ProgressRing({
  value,
  max = 100,
  size = 48,
  thickness = 4,
  tone = 'accent',
  label,
  showValue = false,
  skeleton = false,
  'aria-label': ariaLabel,
}: ProgressRingProps) {
  if (skeleton) {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Skeleton variant="circle" width={size} height={size} />
      </View>
    );
  }

  const clamped = Math.min(Math.max(value, 0), max);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - clamped / max);
  const center = size / 2;
  const percent = Math.round((clamped / max) * 100);
  const hasLabel = label != null;

  return (
    <View
      accessibilityRole="progressbar"
      aria-label={ariaLabel}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={center} cy={center} r={radius} fill="none" stroke={t('segment-track')} strokeWidth={thickness} />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={t(ARC_TOKEN[tone])}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
        />
      </Svg>
      {(hasLabel || showValue) && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
          {hasLabel ? (
            label
          ) : (
            <Text style={{ fontSize: t('font-size-sm'), color: t('text'), fontFamily: t('font-sans'), fontVariant: ['tabular-nums'] }}>
              {percent}%
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
