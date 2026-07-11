import { type ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../i18n/messages.ts';
import styles from './Pagination.module.css';

export interface PaginationProps extends Omit<ComponentProps<'nav'>, 'children'> {
  page: number;
  total: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  boundaryCount?: number;
}

function clampPage(page: number, totalPages: number) {
  return Math.min(Math.max(page, 1), totalPages);
}

function buildPageItems(page: number, totalPages: number, siblingCount: number, boundaryCount: number) {
  const items: Array<number | 'ellipsis'> = [];
  const seen = new Set<number>();
  const pushPage = (value: number) => {
    if (value < 1 || value > totalPages || seen.has(value)) return;
    seen.add(value);
    items.push(value);
  };

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i += 1) pushPage(i);
    return items;
  }

  const leftBoundaryCount = Math.max(1, Math.min(boundaryCount, totalPages));
  for (let i = 1; i <= leftBoundaryCount; i += 1) pushPage(i);

  const start = Math.max(2, page - siblingCount);
  const end = Math.min(totalPages - 1, page + siblingCount);

  if (start > leftBoundaryCount + 1) items.push('ellipsis');
  for (let i = start; i <= end; i += 1) pushPage(i);
  if (end < totalPages - leftBoundaryCount) items.push('ellipsis');

  const rightBoundaryStart = Math.max(totalPages - leftBoundaryCount + 1, leftBoundaryCount + 1);
  for (let i = rightBoundaryStart; i <= totalPages; i += 1) pushPage(i);
  return items;
}

export function Pagination({ page, total, pageSize = 10, onPageChange, siblingCount = 1, boundaryCount = 1, className, ...rest }: PaginationProps) {
  const t = useT();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = clampPage(page, totalPages);
  const items = buildPageItems(currentPage, totalPages, siblingCount, boundaryCount);

  return (
    <nav aria-label="Pagination" className={cx(styles.root, className)} {...rest}>
      <button type="button" className={styles.button} disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
        {t(kitMessages.previous)}
      </button>
      <div className={styles.pages}>
        {items.map((item, index) => {
          if (item === 'ellipsis') {
            return (
              <span key={`ellipsis-${index}`} className={styles.ellipsis} aria-hidden="true">
                …
              </span>
            );
          }
          const isCurrent = item === currentPage;
          return (
            <button
              key={item}
              type="button"
              className={cx(styles.page, isCurrent && styles.current)}
              aria-current={isCurrent ? 'page' : undefined}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          );
        })}
      </div>
      <button type="button" className={styles.button} disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>
        {t(kitMessages.next)}
      </button>
    </nav>
  );
}
