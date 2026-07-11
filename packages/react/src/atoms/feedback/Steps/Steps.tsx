import { stepsSizes, stepsTones, stepsVariants, SkeletonVariant } from '@glacier/spec';
import { Fragment } from 'react';
import type { ComponentProps } from 'react';
import { useT } from '../../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../../i18n/messages.ts';
import { cx } from '../../../internal/cx.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './Steps.module.css';

// Derived from the spec so the tone and size unions cannot drift.
export type StepsTone = (typeof stepsTones)[number];
export type StepsSize = (typeof stepsSizes)[number];

export type StepsVariant = (typeof stepsVariants)[number];

/** Dot diameter per size, mirroring the .sm/.md rules in the CSS. */
const DIAMETER_REM: Record<StepsSize, string> = {
  sm: '0.375rem',
  md: '0.5rem',
};

/** Connected marker diameter per size, mirroring the .marker rules in the CSS. */
const MARKER_REM: Record<StepsSize, string> = {
  sm: '1.25rem',
  md: '1.5rem',
};

const CheckIcon = (
  <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" className={styles.check}>
    <path
      d="M2.5 6.5 L5 8.75 L9.5 3.5"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export interface StepsProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** Total number of steps; renders this many dots. */
  count: number;
  /** Zero-based index of the current step. Earlier dots read completed, later ones upcoming. */
  active?: number;
  /** Semantic color family for completed and current dots. */
  tone?: StepsTone;
  /** Compact size step; sets dot diameter and gap. */
  size?: StepsSize;
  /** dots is the compact dot row; connected joins circular markers with lines and checks. */
  variant?: StepsVariant;
  /** Numbers the connected markers from 1; completed markers keep the check. */
  numbered?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
}

/**
 * A row of progress dots marking position through a tour, wizard, or quiz.
 * Dots before the active index read as completed and fill solid in the tone;
 * the active dot is enlarged to mark the current step; later dots are hollow
 * with a hairline border. Position is announced by the group label, not color.
 */
export function Steps({
  count,
  active = 0,
  tone = 'accent',
  size = 'md',
  variant = 'dots',
  numbered = false,
  skeleton = false,
  className,
  ...rest
}: StepsProps) {
  const t = useT();
  const dots = Math.max(0, Math.floor(count));
  const connected = variant === 'connected';

  if (skeleton) {
    const diameter = connected ? MARKER_REM[size] : DIAMETER_REM[size];
    return (
      <div
        className={cx(styles.track, styles[size], connected && styles.connectedTrack, className)}
        aria-hidden="true"
      >
        {Array.from({ length: dots }, (_, i) => (
          <Fragment key={i}>
            <Skeleton variant={SkeletonVariant.Circle} width={diameter} />
            {connected && i < dots - 1 && <Skeleton height="2px" className={styles.connectorBone} />}
          </Fragment>
        ))}
      </div>
    );
  }

  const current = Math.min(Math.max(active, 0), Math.max(dots - 1, 0));
  const label = t(kitMessages.stepOf, { step: Math.min(current + 1, dots), total: dots });

  if (!connected) {
    return (
      <div
        role="group"
        aria-label={label}
        className={cx(styles.track, styles[size], className)}
        {...rest}
      >
        {Array.from({ length: dots }, (_, i) => {
          const state =
            i < current ? styles.completed : i === current ? styles.current : styles.upcoming;
          return <span key={i} className={cx(styles.dot, styles[tone], state)} aria-hidden="true" />;
        })}
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label={label}
      className={cx(styles.track, styles[size], styles.connectedTrack, className)}
      {...rest}
    >
      {Array.from({ length: dots }, (_, i) => {
        const state =
          i < current ? styles.markerDone : i === current ? styles.markerNow : styles.markerNext;
        return (
          <Fragment key={i}>
            <span className={cx(styles.marker, styles[tone], state)} aria-hidden="true">
              {i < current ? (
                CheckIcon
              ) : numbered ? (
                i + 1
              ) : i === current ? (
                <span className={styles.currentDot} />
              ) : null}
            </span>
            {i < dots - 1 && (
              <span
                className={cx(styles.connector, styles[tone], i < current && styles.connectorDone)}
                aria-hidden="true"
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
