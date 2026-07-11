import type { ComponentProps, MouseEventHandler, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import styles from './List.module.css';

export type ListSize = 'sm' | 'md';

export interface ListProps extends ComponentProps<'ul'> {
  size?: ListSize;
  /** Draws separators between direct ListItem children. */
  divided?: boolean;
}

export interface ListItemProps extends Omit<ComponentProps<'li'>, 'onClick' | 'title'> {
  title: ReactNode;
  description?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  href?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

/** A semantic list container that gives direct ListItem children shared row metrics. */
export function List({ size = 'md', divided = false, className, ...rest }: ListProps) {
  return (
    <ul
      {...rest}
      className={cx(styles.list, styles[size], divided && styles.divided, className)}
      data-size={size}
    />
  );
}

/** A semantic list row with optional leading, supporting, and trailing content. */
export function ListItem({
  title,
  description,
  leading,
  trailing,
  selected = false,
  disabled = false,
  href,
  onClick,
  className,
  ...rest
}: ListItemProps) {
  const content = (
    <>
      {leading != null && <span className={styles.leading} aria-hidden="true">{leading}</span>}
      <span className={styles.copy}>
        <span className={styles.title}>{title}</span>
        {description != null && <span className={styles.description}>{description}</span>}
      </span>
      {trailing != null && <span className={styles.trailing}>{trailing}</span>}
    </>
  );

  return (
    <li
      {...rest}
      className={cx(styles.item, className)}
      data-glacier-list-item=""
      data-selected={selected || undefined}
      data-disabled={disabled || undefined}
    >
      {href && !disabled ? (
        <a className={styles.row} href={href} aria-current={selected ? 'page' : undefined}>
          {content}
        </a>
      ) : onClick ? (
        <button type="button" className={styles.row} disabled={disabled} onClick={onClick} aria-pressed={selected || undefined}>
          {content}
        </button>
      ) : (
        <div className={styles.row}>{content}</div>
      )}
    </li>
  );
}