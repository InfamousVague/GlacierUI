import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Button, type ButtonVariant, type ControlSize } from '../../atoms/inputs/Button/Button.tsx';
import { Menu } from '../../organisms/Menu/Menu.tsx';
import styles from './SplitButton.module.css';

const Chevron = (
  <svg className={styles.chevron} width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export interface SplitButtonProps extends Omit<ComponentProps<'span'>, 'children'> {
  /** Main-action label/content. */
  children: ReactNode;
  /** Fired by the main (start) segment. */
  onAction: () => void;
  /** MenuItem children for the built-in dropdown (end) segment. */
  menu: ReactNode;
  /** Accessible name for the dropdown segment. */
  menuLabel: string;
  variant?: ButtonVariant;
  size?: ControlSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  placement?: ComponentProps<typeof Menu>['placement'];
  className?: string;
}

/**
 * A button with a built-in secondary control: the start segment fires the
 * primary action, the end segment opens an attached menu of related actions.
 * Both segments are real Buttons, so every variant/size/token of the Button
 * contract applies unchanged; the pair reads as one control.
 */
export function SplitButton({
  children,
  onAction,
  menu,
  menuLabel,
  variant = 'solid',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  placement = 'bottom',
  className,
  ...rest
}: SplitButtonProps) {
  return (
    <span className={cx(styles.split, fullWidth && styles.fullWidth, className)} {...rest}>
      <Button
        variant={variant}
        size={size}
        disabled={disabled}
        loading={loading}
        onClick={onAction}
        className={styles.main}
      >
        {children}
      </Button>
      <Menu
        aria-label={menuLabel}
        placement={placement}
        trigger={
          <Button variant={variant} size={size} disabled={disabled} aria-label={menuLabel} className={styles.more}>
            {Chevron}
          </Button>
        }
      >
        {menu}
      </Menu>
    </span>
  );
}
