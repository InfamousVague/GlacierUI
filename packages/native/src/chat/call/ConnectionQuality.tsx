// The Glacier ConnectionQuality, rendered with React Native primitives: four
// stepped bars showing link quality, plus an unknown state. The grading from
// level to tone and the height ramp both come from @glacier/logic, so a
// two-bar call is amber here and amber on the web rather than amber on one
// platform and red on the other. Bar fill comes from the connection-quality spec
// through the shared resolvers.
//
// Web-parity notes:
// - Bars are bottom-aligned Views at the shared height fractions; the box height
//   and bar width come from the spec, and the 2px gutter is the spec's own
//   off-scale gap.
// - Unknown drops every bar to 0.5 opacity rather than emptying them, matching
//   the web `.neutral .bar` rule — "no reading" must not read as "no signal".
// - The web eases the fill color over duration-normal when the level changes;
//   there is no animation runtime here, so the bars step to the new tone.

import { View, type ViewProps } from 'react-native';
import { t } from '../../tokens.ts';
import { paintFor, sizeFor, dimensionsFor } from '../../resolve.ts';
import { Skeleton } from '../../atoms/feedback/Skeleton.tsx';
// TODO(integration): switch to '@glacier/spec' once the call-controls specs are
// registered in packages/spec/src/index.ts.
import { connectionQualitySpec } from '../../../../spec/src/components/connection-quality.ts';
import {
  CONNECTION_BARS,
  connectionBarHeights,
  connectionBarsFilled,
  connectionQualityTone,
  toConnectionQualityLevel,
  type ConnectionQualityLevel,
} from '@glacier/logic';

export type { ConnectionQualityLevel };
export type ConnectionQualitySize = 'sm' | 'md';

/** Names every level, so the indicator can be spoken in any language. */
export interface ConnectionQualityLabels {
  unknown: string;
  level: (level: 0 | 1 | 2 | 3 | 4) => string;
}

const DEFAULT_LABELS: ConnectionQualityLabels = {
  unknown: 'Connection quality unknown',
  level: (level) =>
    `Connection quality: ${['no connection', 'poor', 'fair', 'good', 'excellent'][level] ?? 'unknown'}`,
};

export interface ConnectionQualityProps extends Omit<ViewProps, 'children' | 'style'> {
  /** How good the link is, 0 to 4, or unknown before the first measurement. */
  level?: ConnectionQualityLevel | number | null;
  size?: ConnectionQualitySize;
  /** Accessible name. Falls back to a generated description of the level. */
  label?: string;
  labels?: Partial<ConnectionQualityLabels>;
  skeleton?: boolean;
}

// Size-independent box metrics (bar width, gap, radius) read once from the spec.
const BOX = dimensionsFor(connectionQualitySpec);

/**
 * `dimensionsFor` returns token names alongside raw CSS lengths (the gap is a
 * deliberate off-scale 2px). Token names get wrapped in the custom property; a
 * raw length passes straight through so it never becomes `var(--glacier-2px)`.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

export function ConnectionQuality({
  level = 'unknown',
  size = 'md',
  label,
  labels,
  skeleton = false,
  ...rest
}: ConnectionQualityProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const resolved = toConnectionQualityLevel(level);
  const filled = connectionBarsFilled(resolved);
  const tone = connectionQualityTone(resolved);

  const height = metric(sizeFor(connectionQualitySpec, size).height, 'size-md');
  const barWidth = metric(BOX.barWidth, 'space-1');
  const gap = metric(BOX.gap, '2px');
  const radius = metric(BOX.radius, 'radius-xs');

  const trackToken = paintFor(connectionQualitySpec, 'states', 'empty').background ?? 'segment-track';
  const fillToken = paintFor(connectionQualitySpec, 'tones', tone).background ?? 'segment-track';

  const container = {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    columnGap: gap,
    height,
    // Unknown fades back rather than emptying, so it cannot be mistaken for a
    // call about to drop.
    opacity: resolved === 'unknown' ? 0.5 : 1,
  };

  if (skeleton) {
    return (
      <View aria-hidden={true} style={container} {...rest}>
        {Array.from({ length: CONNECTION_BARS }, (_, i) => (
          <Skeleton
            key={i}
            width={barWidth}
            height={`${(connectionBarHeights[i] ?? 1) * 100}%`}
            radius={radius}
          />
        ))}
      </View>
    );
  }

  return (
    <View
      // One labelled image, not four bars: a screen reader should hear
      // "Connection quality: good", never "bar, bar, bar, bar".
      accessibilityRole="img"
      accessibilityLabel={label ?? (resolved === 'unknown' ? text.unknown : text.level(resolved))}
      aria-label={label ?? (resolved === 'unknown' ? text.unknown : text.level(resolved))}
      style={container}
      {...rest}
    >
      {Array.from({ length: CONNECTION_BARS }, (_, i) => (
        <View
          key={i}
          style={{
            width: barWidth,
            height: `${(connectionBarHeights[i] ?? 1) * 100}%`,
            borderRadius: radius,
            backgroundColor: t(i < filled ? fillToken : trackToken),
          }}
        />
      ))}
    </View>
  );
}
