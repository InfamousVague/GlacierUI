import { SkeletonVariant } from '@glacier/spec';
import { useId, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import styles from './Fieldset.module.css';

export interface FieldsetProps extends ComponentProps<'fieldset'> {
  /** The group label, rendered as a native legend. */
  legend: ReactNode;
  /** Muted supporting line under the legend, announced with the group via aria-describedby. */
  description?: ReactNode;
  /** Right-aligned actions on the legend row. */
  actions?: ReactNode;
  /**
   * The NATIVE fieldset disabled attribute: the browser disables every nested
   * form control for free, with no per-control wiring.
   */
  disabled?: boolean;
  /** Draws the classic hairline box with the legend floating on the border. */
  bordered?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  children?: ReactNode;
}

/**
 * A styled NATIVE fieldset. Using the real element is the whole point: the
 * legend names the group for assistive tech, and the native disabled attribute
 * cascades to every nested control without touching each one.
 */
export function Fieldset({
  legend,
  description,
  actions,
  disabled,
  bordered = false,
  skeleton = false,
  className,
  children,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: FieldsetProps) {
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;

  if (skeleton) {
    return (
      <fieldset {...rest} className={cx(styles.fieldset, bordered && styles.bordered, className)}>
        <legend className={styles.legend}>
          <Skeleton variant={SkeletonVariant.Text} width="8rem" />
        </legend>
        {description && (
          <div className={styles.description}>
            <Skeleton variant={SkeletonVariant.Text} width="16rem" />
          </div>
        )}
        <div className={styles.content}>{children}</div>
      </fieldset>
    );
  }

  return (
    <fieldset
      {...rest}
      disabled={disabled}
      aria-describedby={cx(ariaDescribedBy, descriptionId) || undefined}
      className={cx(styles.fieldset, bordered && styles.bordered, className)}
    >
      <legend className={styles.legend}>{legend}</legend>
      {description && (
        <div id={descriptionId} className={styles.description}>
          {description}
        </div>
      )}
      {actions && <div className={styles.actions}>{actions}</div>}
      <div className={styles.content}>{children}</div>
    </fieldset>
  );
}
