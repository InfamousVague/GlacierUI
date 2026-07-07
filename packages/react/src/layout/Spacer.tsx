import { cx } from '../internal/cx.ts';
import styles from './Layout.module.css';

export interface SpacerProps {
  className?: string;
}

/**
 * A flexible gap that pushes siblings apart inside a Row or Stack. Drop one
 * between two groups to send them to opposite ends without margins.
 */
export function Spacer({ className }: SpacerProps) {
  return <div aria-hidden="true" className={cx(styles.spacer, className)} />;
}
