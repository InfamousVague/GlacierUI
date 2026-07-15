// The React Native binding for @glacier/react's Heatmap: a GitHub-contribution
// -style intensity grid. Columns of square cells are shaded by their level as a
// fraction of the data max (an accent-9 overlay whose opacity is the level's
// share of the top step, over a sunken track), with an optional less→more
// legend. Geometry (cell size, gap, radius) and the fixed paint tokens come from
// the heatmap spec, so it cannot drift from Heatmap.module.css. The public prop
// contract (data / HeatmapData / HeatmapPoint, levels, legend, rows, skeleton,
// skeletonColumns, aria-label) matches the web component 1:1.

import { View, Text, ScrollView, type ViewProps } from 'react-native';
import { heatmapSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

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

export interface HeatmapProps extends Omit<ViewProps, 'children'> {
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
  /** Web-only; accepted for prop parity with @glacier/react but a no-op here. */
  className?: string;
}

interface Cell {
  value: number;
  date?: string;
}

// Size-independent geometry (cell size, inter-cell gap, corner radius) read once
// from the heatmap spec, so it matches Heatmap.module.css.
const DIMS = dimensionsFor(heatmapSpec);
const CELL = DIMS.cell ?? 'space-4';
const GAP = DIMS.gap ?? 'space-1';
const RADIUS = DIMS.radius ?? 'radius-xs';
// The legend swatch is the smaller `space-3` tile in the CSS.
const SWATCH = 'space-3';

// The fixed paint tokens the spec declares for the grid: a sunken track, a
// hairline subtle border (firming to the accent border once a cell fills), the
// accent-9 intensity overlay, and the muted legend text.
const TRACK = t('surface-sunken');
const BORDER = t('border-subtle');
const BORDER_FILLED = t('accent-border');
const OVERLAY = t('accent-9');
const TEXT = t((heatmapSpec.paint?.text ?? '$text-subtle').replace(/^\$/, ''));

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
 * One shaded tile: the sunken track plus, once it fills, an absolutely
 * positioned accent-9 overlay whose opacity is the level's share of the top
 * step — the native equivalent of the web `.cell::before { opacity: alpha }`.
 * `overflow: 'hidden'` clips the overlay to the rounded corners. Used for both
 * grid cells (`space-4`) and legend swatches (`space-3`).
 */
function Shade({ sizeToken, level, steps, label }: { sizeToken: string; level: number; steps: number; label?: string }) {
  const denom = steps - 1;
  const alpha = denom > 0 ? level / denom : 0;
  const side = t(sizeToken);
  return (
    <View
      accessibilityElementsHidden={label == null}
      aria-hidden={label == null ? true : undefined}
      aria-label={label}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: side,
        height: side,
        borderRadius: t(RADIUS),
        backgroundColor: TRACK,
        borderWidth: t('hairline'),
        borderStyle: 'solid',
        // A filled cell reads as its own tile: firm up its edge as it saturates.
        borderColor: level > 0 ? BORDER_FILLED : BORDER,
      }}
    >
      {level > 0 && (
        <View
          aria-hidden={true}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: t(RADIUS),
            backgroundColor: OVERLAY,
            opacity: alpha,
          }}
        />
      )}
    </View>
  );
}

/**
 * A GitHub-contribution-style intensity grid, rendered with React Native
 * primitives. Values - a 2D array or a flat list of `{ date, value }` - are
 * bucketed onto the accent ramp: level 0 reads as an empty track, higher levels
 * step up the accent-9 overlay's opacity. Each cell carries an accessibility
 * label with its date and value so intensity is never conveyed by hue alone,
 * mirroring the web's per-cell title + visually-hidden text. The native
 * accessibility label stands in for the web's pointer tooltip; hover is a
 * web-only affordance and has no native equivalent (a long-press reveal is a
 * follow-up). The legend's less→more labels are rendered as literals since
 * there is no LocaleProvider on the native side. Resting visual only.
 */
export function Heatmap({
  data,
  levels = 5,
  legend = false,
  rows = 7,
  skeleton = false,
  skeletonColumns = 12,
  'aria-label': label,
  className: _className,
  style,
  ...rest
}: HeatmapProps) {
  const steps = Math.max(2, Math.floor(levels));
  const rowCount = Math.max(1, Math.floor(rows));
  const columns = toColumns(data, rowCount);
  const max = columns.reduce(
    (m, column) => column.reduce((cm, cell) => Math.max(cm, cell.value), m),
    0,
  );

  const legendSwatches: number[] = Array.from({ length: steps }, (_, i) => i);

  const containerStyle = { flexDirection: 'column' as const, width: '100%' as const, maxWidth: '100%' as const, rowGap: t('space-2') };

  const legendRow = legend ? (
    <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', columnGap: t(GAP) }}>
      <Text style={{ color: TEXT, fontSize: t('font-size-xs'), lineHeight: t('leading-xs') as never, fontFamily: t('font-sans') }}>
        Less
      </Text>
      {legendSwatches.map((level) => (
        <Shade key={level} sizeToken={SWATCH} level={level} steps={steps} />
      ))}
      <Text style={{ color: TEXT, fontSize: t('font-size-xs'), lineHeight: t('leading-xs') as never, fontFamily: t('font-sans') }}>
        More
      </Text>
    </View>
  ) : null;

  if (skeleton) {
    // one square bone per cell so the placeholder reads as the grid it holds;
    // real data wins, otherwise the host names the grid via skeletonColumns.
    const columnCount = columns.length > 0 ? columns.length : Math.max(1, Math.floor(skeletonColumns));
    return (
      <View
        aria-hidden={true}
        accessibilityElementsHidden={true}
        {...rest}
        style={[containerStyle, style as never]}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: '100%' }} contentContainerStyle={{ flexDirection: 'row', columnGap: t(GAP) }}>
          {Array.from({ length: columnCount }, (_, ci) => (
            <View key={ci} style={{ flexDirection: 'column', rowGap: t(GAP) }}>
              {Array.from({ length: rowCount }, (_, ri) => (
                <Skeleton key={ri} width={t(CELL)} height={t(CELL)} radius={t(RADIUS)} />
              ))}
            </View>
          ))}
        </ScrollView>
        {legend && (
          <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', columnGap: t(GAP) }}>
            <Skeleton width="1.5rem" height="0.5rem" />
            {legendSwatches.map((level) => (
              <Skeleton key={level} width={t(SWATCH)} height={t(SWATCH)} radius={t(RADIUS)} />
            ))}
            <Skeleton width="1.75rem" height="0.5rem" />
          </View>
        )}
      </View>
    );
  }

  return (
    <View
      accessibilityRole="image"
      aria-label={label}
      {...rest}
      style={[containerStyle, style as never]}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: '100%' }} contentContainerStyle={{ flexDirection: 'row', columnGap: t(GAP) }}>
        {columns.map((column, ci) => (
          <View key={ci} style={{ flexDirection: 'column', rowGap: t(GAP) }}>
            {column.map((cell, ri) => {
              const level = levelOf(cell.value, max, steps);
              const title = cell.date ? `${cell.date}: ${cell.value}` : `${cell.value}`;
              return <Shade key={ri} sizeToken={CELL} level={level} steps={steps} label={title} />;
            })}
          </View>
        ))}
      </ScrollView>
      {legendRow}
    </View>
  );
}

Heatmap.displayName = 'Heatmap';
