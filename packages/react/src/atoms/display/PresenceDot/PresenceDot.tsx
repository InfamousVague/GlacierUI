import {
  presenceLabel,
  presenceMark,
  presenceShape,
  type PresenceLabels,
  type PresenceStatus,
} from '@glacier/logic';
import { SkeletonVariant } from '@glacier/spec';
import type { ComponentProps, CSSProperties } from 'react';
import { cx } from '../../../internal/cx.ts';
import { Skeleton } from '../../feedback/Skeleton/Skeleton.tsx';
import styles from './PresenceDot.module.css';

export type { PresenceStatus, PresenceLabels };

export type PresenceDotSize = 'sm' | 'md';

/** Diameter per size, mirroring the --presence-d rules in the CSS. */
const SIZE_TOKEN: Record<PresenceDotSize, string> = {
  sm: 'var(--glacier-size-xs)',
  md: 'var(--glacier-size-sm)',
};

export interface PresenceDotProps extends Omit<ComponentProps<'span'>, 'children'> {
  /** Which of the five reachability states the dot reports. */
  status?: PresenceStatus;
  size?: PresenceDotSize;
  /** Draws a surface-coloured halo behind the dot, for pinning it to an avatar. */
  ring?: boolean;
  /** Overrides the text alternative; defaults to the status's own name. */
  label?: string;
  /**
   * Hides the dot from assistive tech. Only for a row whose visible text already
   * states the presence — otherwise the dot becomes colour-only.
   */
  decorative?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Overrides the English status names; merged over the shared defaults. */
  labels?: Partial<PresenceLabels>;
}

/**
 * A person's reachability as a dot.
 *
 * Unlike StatusDot, which hands the caller an open tone scale and stays silent
 * unless labelled, presence is a closed five-state vocabulary that has to be
 * legible three ways at once: the colour, the shape, and the text alternative.
 * The shape is what survives a colour-blind reader and a bad display, so every
 * status draws a different one; the label is what survives a screen reader, so
 * it is on by default and `decorative` is the deliberate opt-out.
 *
 * The status-to-shape table and the mark proportions come from
 * @glacier/logic, so a crescent is the same crescent on both platforms.
 */
export function PresenceDot({
  status = 'offline',
  size = 'md',
  ring = false,
  label,
  decorative = false,
  skeleton = false,
  labels,
  className,
  style,
  ...rest
}: PresenceDotProps) {
  const diameter = SIZE_TOKEN[size];
  const shape = presenceShape(status);

  // The fractions are the shared numbers; only the multiplication is per-binding.
  const stroke = `calc(${diameter} * ${presenceMark.ringStroke})`;
  const haloPad = `calc(${diameter} * ${presenceMark.halo})`;

  const dot = skeleton ? (
    <Skeleton variant={SkeletonVariant.Circle} width={diameter} className={className} />
  ) : (
    <span
      className={cx(styles.dot, styles[size], styles[status], className)}
      style={{ '--presence-stroke': stroke, ...style } as CSSProperties}
      // The shape is the non-colour half of the contract, so it is on the
      // element rather than only in a class name a stylesheet could drop.
      data-status={status}
      data-shape={shape}
      // A member list holds dozens of these; role="status" would make each one a
      // live region and turn a sign-in into a roster announcement.
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : (label ?? presenceLabel(status, labels))}
      aria-hidden={decorative ? 'true' : undefined}
      {...rest}
    >
      {shape === 'crescent' && (
        <span
          className={cx(styles.mark, styles.crescent)}
          style={{
            width: `${presenceMark.crescent * 100}%`,
            height: `${presenceMark.crescent * 100}%`,
            top: `calc(${diameter} * ${presenceMark.crescentInset})`,
            right: `calc(${diameter} * ${presenceMark.crescentInset})`,
          }}
        />
      )}
      {shape === 'bar' && (
        <span
          className={cx(styles.mark, styles.bar)}
          style={{ width: `${presenceMark.barWidth * 100}%`, height: `${presenceMark.barHeight * 100}%` }}
        />
      )}
      {shape === 'ring-dot' && (
        <span
          className={cx(styles.mark, styles.core)}
          style={{ width: `${presenceMark.core * 100}%`, height: `${presenceMark.core * 100}%` }}
        />
      )}
    </span>
  );

  if (!ring) return dot;

  // The halo is a pad behind the dot rather than an outline on it, so a dot
  // pinned over a photograph keeps a clean edge on both platforms.
  return (
    <span className={cx(styles.halo, styles[size])} style={{ padding: haloPad }} aria-hidden={decorative ? 'true' : undefined}>
      {dot}
    </span>
  );
}
