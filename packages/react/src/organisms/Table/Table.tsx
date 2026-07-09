import { type ComponentProps, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import styles from './Table.module.css';

export interface TableColumn {
  key: string;
  header: ReactNode;
  align?: 'left' | 'center' | 'right';
  render?: (row: Record<string, unknown>, index: number) => ReactNode;
}

export interface TableProps extends Omit<ComponentProps<'table'>, 'children'> {
  columns: TableColumn[];
  data: Record<string, unknown>[];
  caption?: ReactNode;
  emptyState?: ReactNode;
}

export function Table({ columns, data, caption, emptyState, className, ...rest }: TableProps) {
  return (
    <div className={styles.wrap}>
      <table className={cx(styles.table, className)} {...rest}>
        {caption ? <caption className={styles.caption}>{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className={cx(styles.headerCell, column.align && styles[column.align])}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td className={styles.emptyCell} colSpan={columns.length}>
                {emptyState ?? 'No rows'}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={`${rowIndex}-${row.id ?? 'row'}`}>
                {columns.map((column) => (
                  <td key={`${column.key}-${rowIndex}`} className={cx(styles.cell, column.align && styles[column.align])}>
                    {column.render ? column.render(row, rowIndex) : String(row[column.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
