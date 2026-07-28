import { sizeFor } from '@glacier/logic';
import { avatarSpec, type ComponentSpec } from '@glacier/spec';
import {
  avatarStack,
  avatarStackLabels,
  clampOverlap,
  splitStack,
  stackDepth,
  stackLabel,
  type AvatarStackDirection,
  type AvatarStackLabels,
} from '@glacier/logic';
import type { ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import { Avatar, type AvatarShape, type AvatarSize } from '../../atoms/display/Avatar/Avatar.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import styles from './AvatarGroup.module.css';

export type { AvatarStackDirection, AvatarStackLabels };

/** One person in a stack. The same shape a ReadReceiptStack takes. */
export interface AvatarStackItem {
  name?: string;
  src?: string;
  alt?: string;
}

export interface AvatarGroupProps extends Omit<ComponentProps<'span'>, 'children'> {
  /** The roster, in the order it should read. */
  avatars: readonly AvatarStackItem[];
  /**
   * How many avatars are drawn. The count chip is extra rather than the last
   * slot, so a roster of exactly `max` shows every face and no chip.
   */
  max?: number;
  size?: AvatarSize;
  shape?: AvatarShape;
  /** How much of a diameter each avatar covers of the one before it. */
  overlap?: number;
  /** Which end of the stack paints on top. */
  direction?: AvatarStackDirection;
  /** Draws a surface-coloured ring around each avatar so overlapping edges separate. */
  ring?: boolean;
  /** Accessible name for the group; defaults to naming everyone it shows. */
  label?: string;
  /** Overrides the English strings the group builds for itself. */
  labels?: Partial<AvatarStackLabels>;
  /** Renders placeholders with the exact stack geometry. */
  skeleton?: boolean;
}

/**
 * Reads a measurement off the avatar spec as a CSS value.
 *
 * The stack's geometry is entirely the Avatar's — its diameter drives the
 * overlap, the ring, and the count chip — so it is read from the avatar spec
 * through the shared resolver instead of being restated here, where it would be
 * free to drift from Avatar.module.css.
 */
function avatarMetric(spec: ComponentSpec, size: string, metric: string, fallback: string): string {
  const token = sizeFor(spec, size)[metric] ?? fallback;
  return `var(--glacier-${token})`;
}

/**
 * Avatars overlapped into one object, capped, and trailed by a count.
 *
 * The three cases a caller actually hits — fewer people than the cap, exactly
 * the cap, and more — all come out of one `splitStack` in @glacier/logic, so
 * neither binding can disagree about where the boundary sits. The overlap is a
 * fraction of a diameter rather than a length, which is what lets one number
 * hold the proportions across all four avatar steps.
 */
export function AvatarGroup({
  avatars,
  max = avatarStack.max,
  size = 'md',
  shape = 'circle',
  overlap = avatarStack.overlap,
  direction = 'first-on-top',
  ring = true,
  label,
  labels,
  skeleton = false,
  className,
  ...rest
}: AvatarGroupProps) {
  const { shown, overflow } = splitStack(avatars, max);
  const text = { ...avatarStackLabels, ...labels };

  const diameter = avatarMetric(avatarSpec, size, 'diameter', 'size-2xl');
  const fontSize = avatarMetric(avatarSpec, size, 'fontSize', 'font-size-sm');
  const pull = `calc(${diameter} * -${clampOverlap(overlap)})`;
  const ringPad = ring ? `calc(${diameter} * ${avatarStack.ring})` : undefined;

  // Slots, not people: the count chip stacks in the same order as the faces.
  const slots = shown.length + (overflow > 0 ? 1 : 0);
  const slotStyle = (index: number) => ({
    zIndex: stackDepth(index, slots, direction),
    marginInlineStart: index === 0 ? undefined : pull,
    padding: ringPad,
  });
  const slotClass = cx(styles.slot, ring && styles.ringed, styles[shape]);

  const groupLabel =
    label ?? stackLabel(shown.map((person) => person.name ?? ''), overflow, text.more);

  return (
    <span
      className={cx(styles.group, className)}
      role="group"
      aria-label={skeleton ? undefined : groupLabel}
      aria-hidden={skeleton ? 'true' : undefined}
      {...rest}
    >
      {shown.map((person, index) => (
        <span key={index} className={slotClass} style={slotStyle(index)} data-stack-slot={index}>
          {/* Each face is decorative: the group's name already carries the
              roster, and four unlabelled images in a row is noise, not detail. */}
          <Avatar
            src={person.src}
            alt={person.alt}
            name={person.name}
            size={size}
            shape={shape}
            skeleton={skeleton}
            aria-hidden="true"
          />
        </span>
      ))}
      {overflow > 0 && (
        <span className={slotClass} style={slotStyle(shown.length)} data-stack-slot="overflow">
          {skeleton ? (
            <Skeleton
              variant={shape === 'circle' ? 'circle' : 'rect'}
              width={diameter}
              height={diameter}
              radius={shape === 'rounded' ? 'var(--glacier-radius-md)' : undefined}
            />
          ) : (
            // The group's own name already ends in "2 more"; labelling the chip
            // as well would announce the count twice.
            <span
              className={cx(styles.count, styles[shape])}
              style={{ width: diameter, height: diameter, fontSize }}
              aria-hidden="true"
            >
              +{overflow}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
