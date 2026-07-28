import { motion, useReducedMotion } from 'motion/react';
import { Speed, Ease, transition, pressTap } from '@glacier/motion';
import { sizeFor } from '@glacier/logic';
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../../internal/cx.ts';
import { Skeleton } from '../../feedback/Skeleton/Skeleton.tsx';
import type { CallControlSize, CallControlState } from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once the call-controls specs are
// registered in packages/spec/src/index.ts.
import {
  callControlButtonSpec,
  callControlSizes,
  callControlStates,
} from '../../../../../spec/src/components/call-control-button.ts';
import styles from './CallControlButton.module.css';

// Derived from the spec so the unions cannot drift from the contract.
export type { CallControlState, CallControlSize };
export { callControlSizes, callControlStates };

export interface CallControlButtonProps
  extends Omit<ComponentProps<typeof motion.button>, 'children'> {
  /** Required: the glyph carries no name, and the caption is optional and hidden. */
  'aria-label': string;
  /**
   * The three-way visual state. Note that `danger` is not only for hangup: a
   * muted mic or a stopped camera is danger too, because the user has cut
   * something off. Use `callControlState()` from @glacier/logic rather than
   * deciding per call site.
   */
  state?: CallControlState;
  /** Touch-first size step. Both clear the 48px hit-target floor. */
  size?: CallControlSize;
  /**
   * Toggle state, reported as aria-pressed. Deliberately separate from `state`:
   * pressed says what the control DID, state says how alarming that is. A muted
   * mic is pressed and danger; a live speaker is pressed and engaged.
   */
  pressed?: boolean;
  /** A short word under the glyph. Decorative — `aria-label` is the name. */
  caption?: ReactNode;
  /** Renders a placeholder with the control's exact geometry. */
  skeleton?: boolean;
  /** Painted behind the glyph, inside the disc. MicToggle puts its level ring here. */
  ring?: ReactNode;
  /** The icon glyph. */
  children?: ReactNode;
}

/**
 * The round control in a call.
 *
 * This is not IconButton with a bigger radius. Three things make it its own
 * atom, and every one of them is a decision IconButton makes differently:
 *
 * 1. **It is a circle, and the disc is not the button box.** With a caption the
 *    button is a column, so the paint, the hit target, and the focus ring all
 *    belong to the disc rather than the element.
 * 2. **The hit target has a floor.** It sizes from the `size-*` ramp (48px /
 *    64px), not `control-height-*`. Control heights are density-scaled and drop
 *    to 40px at the extra-compact density; a control pressed with a thumb, often
 *    while walking, must not shrink because the user likes dense tables.
 * 3. **Its three states are not a variant ramp.** `engaged` and `danger` are not
 *    "more emphasis" and "even more emphasis" — they are opposite messages, and
 *    which one a toggle takes when it is ON depends on the control. For a mute
 *    button the toggled state is the alarming one, the inverse of every other
 *    toggle in the kit, which is why `pressed` and `state` are separate props
 *    and why the mapping lives in @glacier/logic.
 */
export function CallControlButton({
  state = 'idle',
  size = 'md',
  pressed,
  caption,
  skeleton = false,
  ring,
  disabled,
  className,
  children,
  ...rest
}: CallControlButtonProps) {
  const reduce = useReducedMotion();

  if (skeleton) {
    // The circle only: a caption placeholder would claim a word we do not know
    // yet. The diameter is read out of the spec rather than restated, so the
    // placeholder cannot be a different size from the control it stands in for.
    const diameter = sizeFor(callControlButtonSpec, size).diameter ?? 'size-3xl';
    return (
      <Skeleton variant="circle" width={`var(--glacier-${diameter})`} className={className} />
    );
  }

  return (
    <motion.button
      type="button"
      className={cx(styles.button, styles[size], className)}
      data-state={state}
      disabled={disabled}
      aria-pressed={pressed}
      whileTap={pressTap('compact', reduce || disabled)}
      transition={transition(Speed.Fast, Ease.Out)}
      {...rest}
    >
      <span className={cx(styles.disc, styles[state])}>
        {ring}
        <span className={styles.glyph}>{children}</span>
      </span>
      {/* Decorative: a caption reading "Mute" must never fight a label reading
          "Unmute", so the caption stays out of the accessibility tree. */}
      {caption != null && (
        <span className={styles.caption} aria-hidden="true">
          {caption}
        </span>
      )}
    </motion.button>
  );
}
