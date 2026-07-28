import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import type { CallControlSize } from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once the call-controls specs are
// registered in packages/spec/src/index.ts.
import {
  callControlBarAligns,
  callControlBarVariants,
} from '../../../../spec/src/components/call-control-bar.ts';
import styles from './CallControlBar.module.css';

// Derived from the spec so the unions cannot drift from the contract.
export type CallControlBarAlign = (typeof callControlBarAligns)[number];
export type CallControlBarVariant = (typeof callControlBarVariants)[number];
export { callControlBarAligns, callControlBarVariants };

export interface CallControlBarProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** The controls, in reading order. The destructive leave control goes last. */
  children?: ReactNode;
  /** What the bar itself is made of, under the controls. */
  variant?: CallControlBarVariant;
  /** Spacing step. Match it to the size given to the controls. */
  size?: CallControlSize;
  /** How the controls distribute along the row. */
  align?: CallControlBarAlign;
  /** Lets the row wrap rather than squeezing controls under the hit-target floor. */
  wrap?: boolean;
  /** Accessible name for the group, e.g. "Call controls". */
  label?: string;
}

/**
 * The row of controls in an active call.
 *
 * It owns layout, spacing, and the surface under the controls — nothing else.
 * The controls are children, so a call screen composes exactly the row it needs
 * rather than passing a pile of `showMute` / `showCamera` flags into a bar that
 * would then have to know about every control the product ever grows.
 *
 * Two deliberate non-features:
 *
 * - **No roving tabindex.** A composite widget would make every control but one
 *   unreachable by Tab, and in a live call every control has to be one key away.
 * - **No confirmation on the leave control.** Hanging up is instantaneous,
 *   expected, and undone by calling back; a modal thrown over a live
 *   conversation is worse than the mis-tap it prevents, and it is exactly the
 *   wrong thing for the user who wants OUT of a call right now. The mis-tap is
 *   answered with geometry instead: the leave control takes the danger fill, a
 *   hit target no smaller than 48px, and the end of the row, furthest from the
 *   mute and camera controls that get pressed most.
 */
export function CallControlBar({
  children,
  variant = 'bare',
  size = 'md',
  align = 'center',
  wrap = true,
  label,
  className,
  ...rest
}: CallControlBarProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cx(styles.bar, styles[variant], styles[size], styles[align], wrap && styles.wrap, className)}
      data-variant={variant}
      data-size={size}
      data-align={align}
      {...rest}
    >
      {children}
    </div>
  );
}
