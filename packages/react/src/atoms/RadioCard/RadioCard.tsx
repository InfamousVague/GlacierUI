import { motion, useReducedMotion } from 'motion/react';
import { Speed, Ease, transition } from '@perfect/motion';
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './RadioCard.module.css';

export interface RadioCardProps
  extends Omit<ComponentProps<'input'>, 'type' | 'onChange' | 'checked' | 'defaultChecked' | 'title'> {
  /** The card heading, the primary label of the choice. */
  title: ReactNode;
  /** Secondary line under the title. */
  description?: ReactNode;
  /** Leading glyph or preview swatch above the title. */
  icon?: ReactNode;
  /** Controlled selected state. */
  checked?: boolean;
  /** Initial selected state when uncontrolled. */
  defaultChecked?: boolean;
  /** Called with the next checked state when the card is selected. */
  onCheckedChange?: (checked: boolean) => void;
  /** Extra content rendered below the description. */
  children?: ReactNode;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
}

/**
 * A selectable card with radio semantics: a preview tile that checks as one of
 * a group. Group cards with a shared `name` so the browser and assistive
 * technology treat them as a single radio set. Works controlled (`checked` +
 * `onCheckedChange`) or uncontrolled (`defaultChecked`).
 */
export function RadioCard({
  title,
  description,
  icon,
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  skeleton = false,
  children,
  className,
  ...rest
}: RadioCardProps) {
  const [isChecked, setChecked] = useControlled(checked, defaultChecked);
  const reduce = useReducedMotion();
  const controlled = checked !== undefined;

  if (skeleton) {
    return (
      <span className={cx(styles.skeleton, className)}>
        <Skeleton variant="text" width="7rem" />
        <Skeleton variant="text" width="10rem" />
      </span>
    );
  }

  return (
    <label className={cx(styles.card, controlled && isChecked && styles.checked, disabled && styles.disabled, className)}>
      <input
        type="radio"
        className={styles.nativeInput}
        checked={isChecked}
        disabled={disabled}
        onChange={(e) => {
          setChecked(e.target.checked);
          onCheckedChange?.(e.target.checked);
        }}
        {...rest}
      />
      {icon != null && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={styles.body}>
        <span className={styles.title}>{title}</span>
        {description != null && <span className={styles.description}>{description}</span>}
        {children != null && <span className={styles.extra}>{children}</span>}
      </span>
      <RadioCardIndicator checked={controlled ? isChecked : undefined} reduce={reduce} />
    </label>
  );
}

function RadioCardIndicator({ checked, reduce }: { checked?: boolean; reduce: boolean | null }) {
  const check = (
    <svg viewBox="0 0 12 12" fill="none">
      <path
        d="M2.5 6.5 L5 8.75 L9.5 3.5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Uncontrolled: the check is driven purely by the sibling input via CSS.
  if (checked === undefined) {
    return (
      <span className={cx(styles.indicator, styles.indicatorCss)} aria-hidden="true">
        {check}
      </span>
    );
  }

  // Controlled: framer springs the check in on select.
  return (
    <motion.span
      className={styles.indicator}
      aria-hidden="true"
      initial={false}
      animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
      transition={reduce ? { duration: 0 } : transition(Speed.Fast, Ease.Spring)}
    >
      {check}
    </motion.span>
  );
}
