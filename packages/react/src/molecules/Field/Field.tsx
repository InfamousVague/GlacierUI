import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Motion, Speed, motionProps } from '@perfect/motion';
import { useId, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { FieldContext } from '../../internal/FieldContext.ts';
import { Skeleton } from '../../atoms/Skeleton/Skeleton.tsx';
import styles from './Field.module.css';

export interface FieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  /** When set, replaces the hint and shakes in. */
  error?: ReactNode;
  required?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  className?: string;
  children: ReactNode;
}

export function Field({ label, hint, error, required, skeleton = false, className, children }: FieldProps) {
  const id = useId();
  const reduce = useReducedMotion();
  const invalid = Boolean(error);
  const metaId = hint || error ? `${id}-meta` : undefined;

  if (skeleton) {
    return (
      <div className={cx(styles.field, className)}>
        {label && (
          <span className={styles.label}>
            <Skeleton variant="text" width="5rem" />
          </span>
        )}
        {children}
        <div className={styles.meta}>
          {hint && <Skeleton variant="text" width="9rem" />}
        </div>
      </div>
    );
  }

  return (
    <div className={cx(styles.field, className)} data-invalid={invalid || undefined}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && (
            <span className={styles.req} aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
      )}
      <FieldContext.Provider value={{ id, describedBy: metaId, invalid }}>
        {children}
      </FieldContext.Provider>
      <div className={styles.meta} id={metaId}>
        <AnimatePresence mode="wait" initial={false}>
          {error ? (
            <motion.div
              key="error"
              className={styles.error}
              role="alert"
              initial={{ opacity: 0 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, ...motionProps(Motion.Shake).animate }}
              exit={{ opacity: 0 }}
              transition={reduce ? { duration: 0 } : motionProps(Motion.Shake).transition}
            >
              {error}
            </motion.div>
          ) : hint ? (
            <motion.div
              key="hint"
              className={styles.hint}
              {...motionProps(Motion.FadeIn, Speed.Fast)}
              transition={reduce ? { duration: 0 } : motionProps(Motion.FadeIn, Speed.Fast).transition}
            >
              {hint}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
