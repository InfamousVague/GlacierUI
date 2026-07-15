import {
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { defineMessages, useT } from '../../i18n/index.ts';
import { Checkbox } from '../../atoms/inputs/Selection/Checkbox.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import styles from './DataGrid.module.css';

const messages = defineMessages({
  selectAll: {
    en: 'Select all rows', es: 'Seleccionar todas las filas', fr: 'Tout sélectionner',
    de: 'Alle Zeilen auswählen', ja: 'すべての行を選択', pt: 'Selecionar todas as linhas',
    zh: '全选所有行', ar: 'تحديد كل الصفوف',
  },
  selectRow: {
    en: 'Select row', es: 'Seleccionar fila', fr: 'Sélectionner la ligne',
    de: 'Zeile auswählen', ja: '行を選択', pt: 'Selecionar linha',
    zh: '选择行', ar: 'تحديد الصف',
  },
  noResults: {
    en: 'No results', es: 'Sin resultados', fr: 'Aucun résultat',
    de: 'Keine Ergebnisse', ja: '結果なし', pt: 'Sem resultados',
    zh: '无结果', ar: 'لا نتائج',
  },
});

/** A row's stable identity. Every row must carry an `id`. */
export type DataGridRowId = string | number;

/** The minimum shape a row must satisfy: an `id` plus arbitrary column values. */
export interface DataGridRow {
  id: DataGridRowId;
  [key: string]: unknown;
}

export type SortDirection = 'asc' | 'desc';

/** The active sort: which column and which direction, or null for unsorted. */
export interface DataGridSort {
  columnKey: string;
  direction: SortDirection;
}

export interface DataGridColumn {
  /** Matches a key on each row, and identifies the column for sorting. */
  key: string;
  /** Header content. */
  header: ReactNode;
  /** Cell text alignment. Defaults to start. */
  align?: 'start' | 'center' | 'end';
  /** When true, the header becomes an activatable sort control. */
  sortable?: boolean;
  /** A fixed or minimum column width, e.g. '12rem'. */
  width?: string;
  /** Custom cell renderer. Defaults to String(row[key]). */
  render?: (row: DataGridRow, rowIndex: number) => ReactNode;
  /** Custom comparable value for sorting. Defaults to row[key]. */
  sortValue?: (row: DataGridRow) => string | number;
}

export interface DataGridProps extends Omit<ComponentProps<'div'>, 'onSelect'> {
  columns: DataGridColumn[];
  data: DataGridRow[];
  /** Accessible name for the grid. */
  'aria-label'?: string;
  // Sorting
  sort?: DataGridSort | null;
  defaultSort?: DataGridSort | null;
  onSortChange?: (sort: DataGridSort | null) => void;
  /** Skip built-in client sorting; report sort changes and render data as given. */
  manualSort?: boolean;
  // Selection
  /** Render a leading checkbox column with select-all in the header. */
  selectable?: boolean;
  selectedIds?: DataGridRowId[];
  defaultSelectedIds?: DataGridRowId[];
  onSelectionChange?: (ids: DataGridRowId[]) => void;
  // States
  loading?: boolean;
  loadingRows?: number;
  emptyState?: ReactNode;
  // Presentation
  density?: 'comfortable' | 'compact';
  stickyHeader?: boolean;
  /** Cap the body height and scroll vertically; pairs with stickyHeader. */
  maxHeight?: string;
  skeleton?: boolean;
}

function compare(a: string | number, b: string | number): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}

/**
 * A data grid: column-driven table with client sorting, row selection,
 * loading and empty states, responsive overflow, and a roving-focus keyboard
 * grid. Distinct from Table, which is a static semantic table with no
 * interaction model. For very large datasets, pair with a windowing layer
 * (feed only the visible slice as `data` and drive `sort`/`selectedIds`
 * yourself with `manualSort`).
 */
export function DataGrid({
  columns,
  data,
  'aria-label': ariaLabel,
  sort: controlledSort,
  defaultSort = null,
  onSortChange,
  manualSort = false,
  selectable = false,
  selectedIds: controlledSelected,
  defaultSelectedIds = [],
  onSelectionChange,
  loading = false,
  loadingRows = 5,
  emptyState,
  density = 'comfortable',
  stickyHeader = false,
  maxHeight,
  skeleton = false,
  className,
  style,
  ...rest
}: DataGridProps) {
  const t = useT();
  const [sort, setSort] = useControlled<DataGridSort | null>(controlledSort, defaultSort);
  const [selected, setSelected] = useControlled<DataGridRowId[]>(controlledSelected, defaultSelectedIds);
  const gridRef = useRef<HTMLTableElement>(null);
  const [focus, setFocus] = useState({ r: 0, c: 0 });

  const leadCols = selectable ? 1 : 0;
  const colCount = columns.length + leadCols;

  const sortedData = useMemo(() => {
    if (manualSort || !sort) return data;
    const col = columns.find((c) => c.key === sort.columnKey);
    if (!col) return data;
    const accessor = col.sortValue ?? ((row: DataGridRow) => row[col.key] as string | number);
    const dir = sort.direction === 'asc' ? 1 : -1;
    return [...data].sort((a, b) => compare(accessor(a), accessor(b)) * dir);
  }, [data, sort, manualSort, columns]);

  const hasRows = !loading && sortedData.length > 0;
  const dataRowCount = hasRows ? sortedData.length : 0;
  const rowCount = 1 + dataRowCount; // header + navigable body rows
  // Rows actually in the a11y tree (skeleton or empty rows included) so
  // aria-rowcount never under-reports while loading or empty.
  const renderedBodyRows = loading ? Math.max(1, loadingRows) : sortedData.length || 1;
  // Clamp the roving coordinate to the current shape so exactly one existing
  // cell always holds tabIndex 0, even after data shrinks to empty or loading.
  const activeR = Math.min(Math.max(focus.r, 0), rowCount - 1);
  const activeC = Math.min(Math.max(focus.c, 0), colCount - 1);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const rowIds = useMemo(() => sortedData.map((r) => r.id), [sortedData]);
  const allSelected = rowIds.length > 0 && rowIds.every((id) => selectedSet.has(id));
  const someSelected = !allSelected && rowIds.some((id) => selectedSet.has(id));
  const fixedTableWidth = columns.every((column) => column.width != null)
    ? `calc(${[
      ...(selectable ? ['var(--glacier-space-4) + var(--glacier-space-4) + 1.375rem'] : []),
      ...columns.map((column) => column.width!),
    ].join(' + ')})`
    : undefined;

  function emitSelection(next: DataGridRowId[]) {
    setSelected(next);
    onSelectionChange?.(next);
  }
  function toggleAll() {
    // Union/subtract only the visible ids so selections on other pages survive
    // the documented windowing pattern (feed the visible slice + manualSort).
    if (allSelected) {
      const visible = new Set(rowIds);
      emitSelection(selected.filter((id) => !visible.has(id)));
    } else {
      const merged = selected.slice();
      for (const id of rowIds) if (!selectedSet.has(id)) merged.push(id);
      emitSelection(merged);
    }
  }
  function toggleRow(id: DataGridRowId) {
    emitSelection(selectedSet.has(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  }

  function applySort(columnKey: string) {
    const col = columns.find((c) => c.key === columnKey);
    if (!col?.sortable) return;
    let next: DataGridSort | null;
    if (!sort || sort.columnKey !== columnKey) next = { columnKey, direction: 'asc' };
    else if (sort.direction === 'asc') next = { columnKey, direction: 'desc' };
    else next = null;
    setSort(next);
    onSortChange?.(next);
  }

  function focusCell(r: number, c: number) {
    gridRef.current
      ?.querySelector<HTMLElement>(`[data-r="${r}"][data-c="${c}"]`)
      ?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLTableElement>) {
    const r = activeR;
    const c = activeC;
    let nr = r;
    let nc = c;
    switch (e.key) {
      case 'ArrowRight': nc = Math.min(c + 1, colCount - 1); break;
      case 'ArrowLeft': nc = Math.max(c - 1, 0); break;
      case 'ArrowDown': nr = Math.min(r + 1, rowCount - 1); break;
      case 'ArrowUp': nr = Math.max(r - 1, 0); break;
      case 'Home': if (e.ctrlKey) nr = 0; nc = 0; break;
      case 'End': if (e.ctrlKey) nr = rowCount - 1; nc = colCount - 1; break;
      default: return;
    }
    e.preventDefault();
    if (nr !== r || nc !== c) {
      setFocus({ r: nr, c: nc });
      focusCell(nr, nc);
    }
  }

  const tabIndexFor = (r: number, c: number) => (activeR === r && activeC === c ? 0 : -1);
  // Keep the roving coordinate in step with pointer focus, so the next arrow
  // key moves relative to the cell the user actually clicked into.
  const onCellFocus = (r: number, c: number) => () => {
    if (focus.r !== r || focus.c !== c) setFocus({ r, c });
  };

  const wrapStyle: CSSProperties = { ...style, maxHeight };

  if (skeleton) {
    const rows = Math.max(1, loadingRows);
    return (
      <div className={cx(styles.wrap, className)} data-density={density} style={wrapStyle} aria-hidden {...rest}>
        <table className={styles.table} style={fixedTableWidth ? { width: fixedTableWidth } : undefined}>
          <colgroup>
            {selectable ? <col className={styles.selectColumn} /> : null}
            {columns.map((col) => <col key={col.key} style={col.width ? { width: col.width } : undefined} />)}
          </colgroup>
          <thead className={cx(styles.head, stickyHeader && styles.sticky)}>
            <tr>
              {selectable ? <th className={styles.selectCell}><Skeleton variant="rect" width="1.1rem" height="1.1rem" /></th> : null}
              {columns.map((col) => (
                <th key={col.key} className={styles.headerCell}><Skeleton variant="text" width="60%" /></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, i) => (
              <tr key={i}>
                {selectable ? <td className={styles.selectCell}><Skeleton variant="rect" width="1.1rem" height="1.1rem" /></td> : null}
                {columns.map((col) => (
                  <td key={col.key} className={styles.cell}><Skeleton variant="text" width="70%" /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={cx(styles.wrap, className)} data-density={density} style={wrapStyle} {...rest}>
      <table
        ref={gridRef}
        role="grid"
        aria-label={ariaLabel}
        aria-rowcount={1 + renderedBodyRows}
        aria-colcount={colCount}
        aria-multiselectable={selectable || undefined}
        aria-busy={loading || undefined}
        className={styles.table}
        style={fixedTableWidth ? { width: fixedTableWidth } : undefined}
        onKeyDown={onKeyDown}
      >
        <colgroup>
          {selectable ? <col className={styles.selectColumn} /> : null}
          {columns.map((col) => <col key={col.key} style={col.width ? { width: col.width } : undefined} />)}
        </colgroup>
        <thead className={cx(styles.head, stickyHeader && styles.sticky)}>
          <tr role="row" aria-rowindex={1}>
            {selectable ? (
              <th
                role="columnheader"
                aria-colindex={1}
                data-r={0}
                data-c={0}
                tabIndex={tabIndexFor(0, 0)}
                onFocus={onCellFocus(0, 0)}
                className={cx(styles.headerCell, styles.selectCell)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleAll(); }
                }}
              >
                <Checkbox
                  tabIndex={-1}
                  checked={allSelected}
                  indeterminate={someSelected}
                  onCheckedChange={toggleAll}
                  aria-label={t(messages.selectAll)}
                />
              </th>
            ) : null}
            {columns.map((col, ci) => {
              const c = ci + leadCols;
              const active = sort?.columnKey === col.key;
              const ariaSort = col.sortable
                ? active
                  ? sort?.direction === 'asc' ? 'ascending' : 'descending'
                  : 'none'
                : undefined;
              return (
                <th
                  key={col.key}
                  role="columnheader"
                  aria-colindex={c + 1}
                  aria-sort={ariaSort}
                  data-r={0}
                  data-c={c}
                  tabIndex={tabIndexFor(0, c)}
                  onFocus={onCellFocus(0, c)}
                  style={col.width ? { width: col.width } : undefined}
                  className={cx(styles.headerCell, col.align && styles[col.align], col.sortable && styles.sortable)}
                  onClick={col.sortable ? () => applySort(col.key) : undefined}
                  onKeyDown={col.sortable ? (e) => {
                    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); applySort(col.key); }
                  } : undefined}
                >
                  <span className={styles.headerInner}>
                    {col.header}
                    {col.sortable ? (
                      <SortIcon direction={active ? sort?.direction : undefined} />
                    ) : null}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: Math.max(1, loadingRows) }, (_, i) => (
              <tr key={i} role="row">
                {selectable ? <td className={styles.selectCell}><Skeleton variant="rect" width="1.1rem" height="1.1rem" /></td> : null}
                {columns.map((col) => (
                  <td key={col.key} className={styles.cell}><Skeleton variant="text" width="70%" /></td>
                ))}
              </tr>
            ))
          ) : sortedData.length === 0 ? (
            <tr role="row">
              <td role="gridcell" colSpan={colCount} className={styles.emptyCell}>
                {emptyState ?? t(messages.noResults)}
              </td>
            </tr>
          ) : (
            sortedData.map((row, ri) => {
              const r = ri + 1;
              const isSelected = selectedSet.has(row.id);
              return (
                <tr key={row.id} role="row" aria-rowindex={r + 1} aria-selected={selectable ? isSelected : undefined} className={cx(isSelected && styles.selectedRow)}>
                  {selectable ? (
                    <td
                      role="gridcell"
                      aria-colindex={1}
                      data-r={r}
                      data-c={0}
                      tabIndex={tabIndexFor(r, 0)}
                      onFocus={onCellFocus(r, 0)}
                      className={styles.selectCell}
                      onKeyDown={(e) => {
                        if (e.key === ' ') { e.preventDefault(); toggleRow(row.id); }
                      }}
                    >
                      <Checkbox
                        tabIndex={-1}
                        checked={isSelected}
                        onCheckedChange={() => toggleRow(row.id)}
                        aria-label={t(messages.selectRow)}
                      />
                    </td>
                  ) : null}
                  {columns.map((col, ci) => {
                    const c = ci + leadCols;
                    return (
                      <td
                        key={col.key}
                        role="gridcell"
                        aria-colindex={c + 1}
                        data-r={r}
                        data-c={c}
                        tabIndex={tabIndexFor(r, c)}
                        onFocus={onCellFocus(r, c)}
                        className={cx(styles.cell, col.align && styles[col.align])}
                      >
                        {col.render ? col.render(row, ri) : String(row[col.key] ?? '')}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function SortIcon({ direction }: { direction?: SortDirection }) {
  return (
    <svg
      className={styles.sortIcon}
      data-direction={direction ?? 'none'}
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {direction === 'desc' ? (
        <path d="M8 3.5v9M4.5 9 8 12.5 11.5 9" />
      ) : (
        <path d="M8 12.5v-9M4.5 7 8 3.5 11.5 7" />
      )}
    </svg>
  );
}
