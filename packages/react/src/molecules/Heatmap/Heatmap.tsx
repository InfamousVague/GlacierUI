import { useId, type ComponentProps, type CSSProperties } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../i18n/messages.ts';
import styles from './Heatmap.module.css';

/** A single dated value, e.g. one day of contribution counts. */
export interface HeatmapPoint {
  /** ISO-ish date or any string key; surfaced in the cell title. */
  date: string;
  /** The magnitude for this cell. */
  value: number;
}

/**
 * The grid data: a 2D array of numbers (rows of values), or a flat list of
 * `{ date, value }` points laid out left-to-right, top-to-bottom into columns.
 */
export type HeatmapData = number[][] | HeatmapPoint[];

export interface HeatmapProps extends ComponentProps<'div'> {
  /** Values to plot: a 2D `number[][]` grid or a flat `{ date, value }[]` list. */
  data: HeatmapData;
  /** Number of intensity steps (including the empty step 0). Defaults to 5. */
  levels?: number;
  /** Show a less→more legend under the grid. Defaults to false. */
  legend?: boolean;
  /** Cells per column when `data` is a flat list. Defaults to 7 (a week). */
  rows?: number;
  /** Renders a placeholder grid of square skeletons with the exact geometry. */
  skeleton?: boolean;
  /** Columns the skeleton grid renders while there is no data. Rows follow `rows`. */
  skeletonColumns?: number;
  /** Accessible name for the grid. */
  'aria-label'?: string;
  className?: string;
}

interface Cell {
  value: number;
  date?: string;
}

function isPointList(data: HeatmapData): data is HeatmapPoint[] {
  return data.length > 0 && !Array.isArray(data[0]);
}

/**
 * Turn arbitrary input into columns of cells. A 2D array is transposed so its
 * rows read across and its columns read down (matching the on-screen grid); a
 * flat point list is chunked into columns of `rows` height.
 */
function toColumns(data: HeatmapData, rows: number): Cell[][] {
  if (data.length === 0) return [];
  if (isPointList(data)) {
    const cells: Cell[] = data.map((p) => ({ value: p.value, date: p.date }));
    const columns: Cell[][] = [];
    for (let i = 0; i < cells.length; i += rows) {
      columns.push(cells.slice(i, i + rows));
    }
    return columns;
  }
  // number[][] - treat each inner array as a row, transpose into columns.
  const grid = data as number[][];
  const width = grid.reduce((max, row) => Math.max(max, row.length), 0);
  const columns: Cell[][] = [];
  for (let c = 0; c < width; c += 1) {
    const column: Cell[] = [];
    for (let r = 0; r < grid.length; r += 1) {
      const value = grid[r]?.[c];
      if (value !== undefined) column.push({ value });
    }
    columns.push(column);
  }
  return columns;
}

/** Map a value onto an integer level in `[0, levels - 1]` given the data max. */
function levelOf(value: number, max: number, levels: number): number {
  if (value <= 0 || max <= 0) return 0;
  const steps = levels - 1;
  const level = Math.ceil((value / max) * steps);
  return Math.min(steps, Math.max(1, level));
}

/**
 * A GitHub-contribution-style intensity grid. Values - a 2D array or a flat
 * list of `{ date, value }` - are bucketed onto an accent ramp: level 0 reads
 * as an empty track, higher levels step up in accent saturation. Each cell
 * carries a title so its value is legible to pointer and screen-reader users,
 * and an optional legend spells out the less→more scale.
 */
export function Heatmap({ data, levels = 5, legend = false, rows = 7, skeleton = false, skeletonColumns = 12, className, 'aria-label': label, ...rest }: HeatmapProps) {
  const t = useT();
  const steps = Math.max(2, Math.floor(levels));
  const columns = toColumns(data, Math.max(1, Math.floor(rows)));
  const max = columns.reduce(
    (m, column) => column.reduce((cm, cell) => Math.max(cm, cell.value), m),
    0,
  );

  const legendId = useId();
  const legendSwatches: number[] = Array.from({ length: steps }, (_, i) => i);

  if (skeleton) {
    // one square bone per cell so the placeholder reads as the grid it holds;
    // real data wins, otherwise the host names the grid via skeletonColumns
    // and rows so the bones match the heatmap that will replace them
    const columnCount = columns.length > 0 ? columns.length : Math.max(1, Math.floor(skeletonColumns));
    const rowCount = Math.max(1, Math.floor(rows));
    return (
      <div className={cx(styles.heatmap, className)} aria-hidden="true">
        <div className={styles.grid}>
          {Array.from({ length: columnCount }, (_, ci) => (
            <div key={ci} className={styles.column}>
              {Array.from({ length: rowCount }, (_, ri) => (
                <Skeleton
                  key={ri}
                  width="var(--glacier-space-4)"
                  height="var(--glacier-space-4)"
                  radius="var(--glacier-radius-xs)"
                />
              ))}
            </div>
          ))}
        </div>
        {legend && (
          <div className={styles.legend}>
            <Skeleton width="1.5rem" height="0.5rem" />
            {legendSwatches.map((level) => (
              <Skeleton
                key={level}
                width="var(--glacier-space-3)"
                height="var(--glacier-space-3)"
                radius="var(--glacier-radius-xs)"
              />
            ))}
            <Skeleton width="1.75rem" height="0.5rem" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      {...rest}
      role="img"
      aria-label={label}
      aria-describedby={legend ? legendId : undefined}
      className={cx(styles.heatmap, className)}
    >
      <div className={styles.grid}>
        {columns.map((column, ci) => (
          <div key={ci} className={styles.column}>
            {column.map((cell, ri) => {
              const level = levelOf(cell.value, max, steps);
              const title = cell.date
                ? `${cell.date}: ${cell.value}`
                : `${cell.value}`;
              return (
                <div
                  key={ri}
                  className={styles.cell}
                  data-level={level}
                  style={{ '--level': level, '--steps': steps - 1 } as CSSProperties}
                  title={title}
                >
                  <span className={styles.srOnly}>{title}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {legend && (
        <div id={legendId} className={styles.legend}>
          <span className={styles.legendText}>{t(kitMessages.less)}</span>
          {legendSwatches.map((level) => (
            <span
              key={level}
              className={styles.swatch}
              data-level={level}
              style={{ '--level': level, '--steps': steps - 1 } as CSSProperties}
              aria-hidden="true"
            />
          ))}
          <span className={styles.legendText}>{t(kitMessages.more)}</span>
        </div>
      )}
    </div>
  );
}

Heatmap.displayName = 'Heatmap';
