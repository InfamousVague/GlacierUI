import { motion, useReducedMotion } from 'motion/react';
import { Speed, Ease, transition } from '@glacier/motion';
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../../internal/cx.ts';
import { useControlled } from '../../../internal/useControlled.ts';
import { CounterBadge } from '../../display/CounterBadge/CounterBadge.tsx';
import styles from './FilterChip.module.css';

export interface FilterChipProps extends Omit<ComponentProps<typeof motion.button>, 'children' | 'onChange'> {
  /** Controlled selected state. */
  selected?: boolean;
  /** Initial selected state when uncontrolled. */
  defaultSelected?: boolean;
  /** Called with the next selected state when the chip is toggled. */
  onSelectedChange?: (selected: boolean) => void;
  /** Leading glyph. */
  icon?: ReactNode;
  /** Trailing count, rendered as a CounterBadge; hidden when 0 or less. */
  count?: number;
  size?: 'sm' | 'md';
  children?: ReactNode;
}

/**
 * A toggleable filter pill (button, aria-pressed) for faceted filtering. The
 * selected state paints the accent soft tint like Toggle, with an optional
 * leading icon and an optional trailing count rendered as a CounterBadge.
 * Controlled selected + onSelectedChange, matching the kit's other toggles.
 */
export function FilterChip({
  selected,
  defaultSelected = false,
  onSelectedChange,
  icon,
  count,
  size = 'md',
  disabled,
  className,
  children,
  onClick,
  ...rest
}: FilterChipProps) {
  const [isSelected, setSelected] = useControlled(selected, defaultSelected);
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      aria-pressed={isSelected}
      className={cx(styles.chip, styles[size], className)}
      disabled={disabled}
      whileTap={reduce || disabled ? undefined : { scale: 0.96 }}
      transition={transition(Speed.Fast, Ease.Out)}
      onClick={(event) => {
        setSelected(!isSelected);
        onSelectedChange?.(!isSelected);
        onClick?.(event);
      }}
      {...rest}
    >
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
      {count !== undefined && count > 0 && (
        <CounterBadge className={styles.count} count={count} tone={isSelected ? 'accent' : 'neutral'} size={size} />
      )}
    </motion.button>
  );
}
