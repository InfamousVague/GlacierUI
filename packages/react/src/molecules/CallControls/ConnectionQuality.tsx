import type { ComponentProps, CSSProperties } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import {
  CONNECTION_BARS,
  connectionBarHeights,
  connectionBarsFilled,
  connectionQualityTone,
  toConnectionQualityLevel,
  type ConnectionQualityLevel,
} from '@glacier/logic';
import styles from './ConnectionQuality.module.css';

export type { ConnectionQualityLevel };

/** Names every level, so the indicator can be spoken in any language. */
export interface ConnectionQualityLabels {
  unknown: string;
  /** Given the level, so the label can name it. */
  level: (level: 0 | 1 | 2 | 3 | 4) => string;
}

const DEFAULT_LABELS: ConnectionQualityLabels = {
  unknown: 'Connection quality unknown',
  level: (level) =>
    `Connection quality: ${['no connection', 'poor', 'fair', 'good', 'excellent'][level] ?? 'unknown'}`,
};

export interface ConnectionQualityProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** How good the link is, 0 to 4, or unknown before the first measurement. */
  level?: ConnectionQualityLevel | number | null;
  size?: 'sm' | 'md';
  /** Accessible name. Falls back to a generated description of the level. */
  label?: string;
  /** Overrides the generated descriptions; merged over the English defaults. */
  labels?: Partial<ConnectionQualityLabels>;
  /** Renders a placeholder with the exact geometry. */
  skeleton?: boolean;
}

/**
 * Four stepped bars showing link quality.
 *
 * Not a Meter: Meter is a row of equal pips reading a level, and equal pips are
 * how the kit already draws battery and strength. Stepped heights are the
 * universal signal-bars shape, and reading one as the other in a call — where
 * the difference is "should I keep talking" — is worth its own atom.
 *
 * `unknown` is a state, not zero. Before the first probe lands there is no
 * measurement, and painting zero bars would say "about to drop" when the truth
 * is "not measured yet"; the two lead to opposite decisions.
 *
 * The grading from level to tone lives in @glacier/logic, so a two-bar call
 * is amber on both platforms rather than amber on one and red on the other.
 */
export function ConnectionQuality({
  level = 'unknown',
  size = 'md',
  label,
  labels,
  skeleton = false,
  className,
  ...rest
}: ConnectionQualityProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const resolved = toConnectionQualityLevel(level);
  const filled = connectionBarsFilled(resolved);
  const tone = connectionQualityTone(resolved);

  const bars = Array.from({ length: CONNECTION_BARS }, (_, i) => (
    <span
      key={i}
      className={cx(styles.bar, i < filled && styles.filled)}
      style={{ '--bar-height': `${(connectionBarHeights[i] ?? 1) * 100}%` } as CSSProperties}
    />
  ));

  if (skeleton) {
    return (
      <span className={cx(styles.quality, styles[size], className)} aria-hidden="true">
        {Array.from({ length: CONNECTION_BARS }, (_, i) => (
          <Skeleton
            key={i}
            width="var(--glacier-space-1)"
            height={`${(connectionBarHeights[i] ?? 1) * 100}%`}
            radius="var(--glacier-radius-xs)"
          />
        ))}
      </span>
    );
  }

  return (
    <div
      // One labelled image, not four bars: a screen reader should hear
      // "Connection quality: good", never "bar, bar, bar, bar". The label always
      // names the level in words, so the grading does not depend on seeing hue.
      role="img"
      aria-label={label ?? (resolved === 'unknown' ? text.unknown : text.level(resolved))}
      className={cx(styles.quality, styles[size], styles[tone], className)}
      data-level={resolved}
      data-tone={tone}
      {...rest}
    >
      {bars}
    </div>
  );
}
