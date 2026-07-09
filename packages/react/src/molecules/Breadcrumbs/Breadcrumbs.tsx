import { type ComponentProps, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import styles from './Breadcrumbs.module.css';

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
  current?: boolean;
}

export interface BreadcrumbsProps extends Omit<ComponentProps<'nav'>, 'children'> {
  items: BreadcrumbItem[];
  separator?: ReactNode;
}

export function Breadcrumbs({ items, separator = '/', className, ...rest }: BreadcrumbsProps) {
  const visibleItems = items.filter((item) => item !== undefined);
  return (
    <nav aria-label="Breadcrumb" className={cx(styles.root, className)} {...rest}>
      <ol className={styles.list}>
        {visibleItems.map((item, index) => {
          const isCurrent = item.current ?? index === visibleItems.length - 1;
          const showSeparator = index < visibleItems.length - 1;
          return (
            <li key={`${item.label}-${index}`} className={styles.item}>
              {isCurrent ? (
                <span className={styles.current}>{item.label}</span>
              ) : item.href ? (
                <a className={styles.link} href={item.href}>
                  {item.label}
                </a>
              ) : (
                <span className={styles.text}>{item.label}</span>
              )}
              {showSeparator && (
                <span className={styles.separator} aria-hidden="true">
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
