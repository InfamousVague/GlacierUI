import { View, type ViewProps } from 'react-native';
import { meterSpec, meterTones, compactSizes } from '@glacier/spec';
import { t } from './tokens.ts';
import { paintFor, sizeFor, dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

// Derived from the spec so the unions cannot drift from the web kit.
export type MeterTone = (typeof meterTones)[number];
export type MeterSize = (typeof compactSizes)[number];

export interface MeterProps extends Omit<ViewProps, 'children' | 'style'> {
  /** Current level, 0 to max. */
  value: number;
  /** Upper bound. Defaults to the segment count, so value maps 1:1 to segments. */
  max?: number;
  /** Number of discrete segments. */
  segments?: number;
  /**
   * Fill color. 'auto' grades by level: the bottom third reads danger, the
   * middle third warning, the top success. Suits strength and health meters.
   */
  tone?: MeterTone;
  size?: MeterSize;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Accessible name for the meter. */
  'aria-label'?: string;
}

// Size-independent box metrics (radius, gap) read once from the spec.
const BOX = dimensionsFor(meterSpec);

/**
 * A resolved measurement value. `sizeFor`/`dimensionsFor` return token names
 * (e.g. `space-1`) alongside raw CSS lengths (the meter's `height: 0.375rem` is
 * declared inline, not as a token). Token names get wrapped in the custom
 * property; a raw length — anything that starts with a digit or dot — passes
 * straight through so it never becomes `var(--glacier-0.375rem)`.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

/** 'auto' grades by level, matching autoTone() in Meter.tsx. */
function autoTone(ratio: number): 'danger' | 'warning' | 'success' {
  if (ratio <= 1 / 3) return 'danger';
  if (ratio <= 2 / 3) return 'warning';
  return 'success';
}

/**
 * The Glacier Meter, rendered with React Native primitives: a row of flex:1
 * segment Views that fill from the left. Paint and geometry are read from the
 * meter spec through the shared resolvers, so it is visually identical to
 * @glacier/react's Meter and cannot drift from it. Empty segments paint the
 * track; filled segments paint the resolved tone's solid (for 'auto' the tone is
 * graded per level, exactly like the web kit). This renders the resting visual
 * only — the web kit eases each segment's fill color when the level changes; that
 * transition is a no-op here (no animation runtime).
 *
 * Accessibility: the web div sets role="meter" plus aria-valuemin/max/now. Only
 * role and aria-label carry over here (react-native-web maps accessibilityRole to
 * the ARIA role); the numeric aria-value* attributes are accepted-but-not-emitted
 * pending an accessibilityValue seam, matching ProgressRing.
 */
export function Meter({
  value,
  max,
  segments = 4,
  tone = 'auto',
  size = 'md',
  skeleton = false,
  'aria-label': ariaLabel,
  ...rest
}: MeterProps) {
  const segHeight = metric(sizeFor(meterSpec, size).height, '0.375rem');
  const radius = metric(BOX.radius, 'radius-full');
  const container = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    columnGap: metric(BOX.gap, 'space-1'),
    width: '100%' as const,
  };

  if (skeleton) {
    return (
      <View aria-hidden={true} style={container} {...rest}>
        {Array.from({ length: segments }, (_, i) => (
          <View key={i} style={{ flex: 1 }}>
            <Skeleton height={segHeight} radius={radius} />
          </View>
        ))}
      </View>
    );
  }

  const bound = max ?? segments;
  const clamped = Math.min(Math.max(value, 0), bound);
  const filled = Math.round((clamped / bound) * segments);
  const resolvedTone = tone === 'auto' ? autoTone(clamped / bound) : tone;

  // Empty segments always paint the track; filled ones the resolved tone solid.
  const trackToken = paintFor(meterSpec, 'states', 'empty').background ?? 'segment-track';
  const fillToken = paintFor(meterSpec, 'tones', resolvedTone).background ?? 'accent-solid';

  return (
    <View accessibilityRole="meter" aria-label={ariaLabel} style={container} {...rest}>
      {Array.from({ length: segments }, (_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: segHeight,
            borderRadius: radius,
            backgroundColor: t(i < filled ? fillToken : trackToken),
          }}
        />
      ))}
    </View>
  );
}
