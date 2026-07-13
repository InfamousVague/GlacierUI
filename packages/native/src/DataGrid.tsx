import { useMemo, type ReactNode } from 'react';
import { View, Text, Pressable, ScrollView, type ViewProps } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { dataGridSpec } from '@glacier/spec';
import { useControlled, paintFor } from '@glacier/commons';
import { t } from './tokens.ts';
import { dimensionsFor } from './resolve.ts';
import { Checkbox } from './Checkbox.tsx';
import { Skeleton } from './Skeleton.tsx';

/**
 * DataGrid — the @glacier/native binding of the web organism.
 *
 * KIND: scroll table. The web `.wrap` is an `overflow: auto` box, so the whole
 * grid lives inside a horizontal <ScrollView> (border-md surface); when
 * `maxHeight` is set the body scrolls vertically inside a nested <ScrollView>,
 * and `stickyHeader` keeps the header row outside that vertical scroll so it
 * stays pinned. There is no DOM <table>: the header row and each body row are
 * flex-row Views of View/Text/Pressable cells, every one carrying the collapsed
 * bottom hairline the web draws with `border-collapse`.
 *
 * Paint and geometry are read from `dataGridSpec` through the shared resolvers —
 * surface/border paint, the accent-soft selected-row tint, the accent-text
 * sorted-header color, and the radius/hairline/space-* metrics — so the binding
 * cannot drift from the DOM kit. The columns / data / sort / selection prop
 * contract is identical to @glacier/react's DataGrid; sorting is client-side
 * unless `manualSort` defers it, and selection is multi-select through the
 * leading checkbox column with a select-all header checkbox.
 *
 * Web-only, accepted-but-noop on this binding (device follow-ups):
 *   - the roving-tabindex keyboard grid (Arrow/Home/End navigation, per-cell
 *     data-r/data-c focus, the `:focus-visible` ring) — RN has no key model here;
 *     tap a sortable header to cycle sort, tap a checkbox to toggle a row.
 *   - virtualization — every row renders; feed the visible slice + `manualSort`
 *     for very large datasets, exactly as the web docs advise.
 *   - the sort-indicator color crossfade and skeleton shimmer — resting visuals
 *     only; the static geometry is pixel-matched.
 *   - i18n — this kit has no locale runtime, so the select/empty labels emit the
 *     default English strings (same fallback as the Pagination/Steps bindings).
 *   - className — DOM escape hatch, accepted for parity and ignored.
 */

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

export interface DataGridProps extends Omit<ViewProps, 'children' | 'style'> {
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
  maxHeight?: string | number;
  skeleton?: boolean;
  /** Merged after the component's own wrap style so it augments, never clobbers. */
  style?: ViewProps['style'];
  /** Web-only escape hatch; accepted for parity and ignored on native. */
  className?: string;
}

// The default English labels; this kit has no i18n runtime (see the header).
const LABEL_SELECT_ALL = 'Select all rows';
const LABEL_SELECT_ROW = 'Select row';
const LABEL_NO_RESULTS = 'No results';

/** Strip the leading `$` from a spec ref, exactly as the shared resolvers do. */
function bare(v: string | undefined): string | undefined {
  return v?.startsWith('$') ? v.slice(1) : v;
}

// Spec paint + the accent state tints, read once so they cannot drift.
const PAINT = (dataGridSpec.paint ?? {}) as { background?: string; border?: string };
const SURFACE = t(bare(PAINT.background) ?? 'surface');
const BORDER = t(bare(PAINT.border) ?? 'border');
const SELECTED_BG = t(paintFor(dataGridSpec, 'states', 'selected').background ?? 'accent-soft');
const SORTED_TEXT = t(paintFor(dataGridSpec, 'states', 'sorted').text ?? 'accent-text');

// Size-independent geometry (radius, hairline, cell padding, header gap) as bare
// token names, wrapped by t() at use.
const DIMS = dimensionsFor(dataGridSpec);
const RADIUS = t(DIMS.radius ?? 'radius-md');
const HAIRLINE = t(DIMS.border ?? 'hairline');
const PAD_INLINE = t(DIMS.cellPaddingInline ?? 'space-4');
const PAD_BLOCK = t(DIMS.cellPaddingBlock ?? 'space-3');
const PAD_BLOCK_COMPACT = t(DIMS.compactPaddingBlock ?? 'space-2');
const PAD_EMPTY = t(DIMS.emptyPaddingBlock ?? 'space-8');
const HEADER_GAP = t(DIMS.headerGap ?? 'space-2');

// The web auto-sizes columns (table-layout: auto); without measurement this
// binding gives each un-sized column an equal share above a floor so wide grids
// scroll horizontally instead of crushing cells. A raw length, never a token.
const COLUMN_MIN = '8rem';

function compare(a: string | number, b: string | number): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}

/** align → RN cross-axis placement for the cell View. */
function alignItemsFor(align: DataGridColumn['align']): 'center' | 'flex-end' | 'flex-start' {
  return align === 'center' ? 'center' : align === 'end' ? 'flex-end' : 'flex-start';
}
/** align → RN textAlign (web maps start→left, end→right, § text-align rule). */
function textAlignFor(align: DataGridColumn['align']): 'center' | 'right' | 'left' {
  return align === 'center' ? 'center' : align === 'end' ? 'right' : 'left';
}

/** Wrap bare text in <Text> (RN cannot render a raw string in a View); pass a
 *  caller-supplied element through unchanged. */
function asText(node: ReactNode, style: Record<string, unknown>): ReactNode {
  return typeof node === 'string' || typeof node === 'number' ? <Text style={style}>{node}</Text> : node;
}

/** The direction glyph on a sortable header; color follows the sorted state. */
function SortIcon({ direction, color }: { direction?: SortDirection; color: string }) {
  return (
    <Svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden={true}>
      {direction === 'desc' ? <Path d="M8 3.5v9M4.5 9 8 12.5 11.5 9" /> : <Path d="M8 12.5v-9M4.5 7 8 3.5 11.5 7" />}
    </Svg>
  );
}

/**
 * The Glacier DataGrid, rendered with React Native primitives. Visually and
 * behaviorally matched to @glacier/react's DataGrid — column-driven header and
 * cells, client (or manual) sorting via tappable sortable headers, multi-select
 * through the leading checkbox column, loading/skeleton/empty states, horizontal
 * overflow, and a vertically-scrolling body under an optional sticky header.
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
  className: _className,
  style,
  ...rest
}: DataGridProps) {
  const [sort, setSort] = useControlled<DataGridSort | null>({
    value: controlledSort,
    defaultValue: defaultSort ?? null,
    onChange: onSortChange,
  });
  const [selected, setSelected] = useControlled<DataGridRowId[]>({
    value: controlledSelected,
    defaultValue: defaultSelectedIds,
    onChange: onSelectionChange,
  });

  const padBlock = density === 'compact' ? PAD_BLOCK_COMPACT : PAD_BLOCK;

  const sortedData = useMemo(() => {
    if (manualSort || !sort) return data;
    const col = columns.find((c) => c.key === sort.columnKey);
    if (!col) return data;
    const accessor = col.sortValue ?? ((row: DataGridRow) => row[col.key] as string | number);
    const dir = sort.direction === 'asc' ? 1 : -1;
    return [...data].sort((a, b) => compare(accessor(a), accessor(b)) * dir);
  }, [data, sort, manualSort, columns]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const rowIds = useMemo(() => sortedData.map((r) => r.id), [sortedData]);
  const allSelected = rowIds.length > 0 && rowIds.every((id) => selectedSet.has(id));
  const someSelected = !allSelected && rowIds.some((id) => selectedSet.has(id));

  function toggleAll() {
    // Union/subtract only the visible ids so selections on other pages survive
    // the documented windowing pattern (feed the visible slice + manualSort).
    if (allSelected) {
      const visible = new Set(rowIds);
      setSelected(selected.filter((id) => !visible.has(id)));
    } else {
      const merged = selected.slice();
      for (const id of rowIds) if (!selectedSet.has(id)) merged.push(id);
      setSelected(merged);
    }
  }
  function toggleRow(id: DataGridRowId) {
    setSelected(selectedSet.has(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  }
  function applySort(columnKey: string) {
    const col = columns.find((c) => c.key === columnKey);
    if (!col?.sortable) return;
    let next: DataGridSort | null;
    if (!sort || sort.columnKey !== columnKey) next = { columnKey, direction: 'asc' };
    else if (sort.direction === 'asc') next = { columnKey, direction: 'desc' };
    else next = null;
    setSort(next);
  }

  // The bottom hairline that divides every row (header + body cells alike).
  const rowDivider = {
    borderBottomWidth: HAIRLINE,
    borderBottomColor: BORDER,
    borderStyle: 'solid' as const,
  };
  // Per-column box: an explicit width when the column fixes one, else an equal
  // share above the floor. Shared by header and body so columns stay aligned.
  const colBox = (col: DataGridColumn) =>
    col.width
      ? { width: col.width, paddingVertical: padBlock, paddingHorizontal: PAD_INLINE, alignItems: alignItemsFor(col.align) }
      : { flex: 1, minWidth: COLUMN_MIN, paddingVertical: padBlock, paddingHorizontal: PAD_INLINE, alignItems: alignItemsFor(col.align) };
  // The leading checkbox column hugs its content (web `.selectCell` width: 1px).
  const selectBox = { paddingVertical: padBlock, paddingHorizontal: PAD_INLINE, alignItems: 'center' as const, justifyContent: 'center' as const };

  const cellTextStyle = (col: DataGridColumn) => ({
    color: t('text'),
    fontSize: t('font-size-sm'),
    fontFamily: t('font-sans'),
    textAlign: textAlignFor(col.align),
  });

  // ---- Header row ----
  function renderHeader() {
    return (
      <View accessibilityRole="row" style={{ flexDirection: 'row', backgroundColor: SURFACE, ...rowDivider }}>
        {selectable ? (
          <View accessibilityRole="columnheader" style={selectBox}>
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected}
              onCheckedChange={toggleAll}
              accessibilityLabel={LABEL_SELECT_ALL}
            />
          </View>
        ) : null}
        {columns.map((col) => {
          const active = sort?.columnKey === col.key;
          const headerColor = active ? SORTED_TEXT : t('text');
          const headerText = {
            color: headerColor,
            fontSize: t('font-size-sm'),
            fontFamily: t('font-sans'),
            fontWeight: '600' as never,
            textAlign: textAlignFor(col.align),
          };
          const inner = (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                columnGap: HEADER_GAP,
                justifyContent: alignItemsFor(col.align),
              }}
            >
              {asText(col.header, headerText)}
              {col.sortable ? (
                <SortIcon direction={active ? sort?.direction : undefined} color={active ? SORTED_TEXT : t('text-muted')} />
              ) : null}
            </View>
          );
          return col.sortable ? (
            <Pressable
              key={col.key}
              accessibilityRole="columnheader"
              accessibilityState={{ selected: active }}
              onPress={() => applySort(col.key)}
              style={colBox(col)}
            >
              {inner}
            </Pressable>
          ) : (
            <View key={col.key} accessibilityRole="columnheader" style={colBox(col)}>
              {inner}
            </View>
          );
        })}
      </View>
    );
  }

  // ---- Skeleton / loading rows: keep the header and column widths ----
  function renderSkeletonRows(count: number) {
    return Array.from({ length: Math.max(1, count) }, (_, i) => (
      <View key={i} accessibilityRole="row" style={{ flexDirection: 'row', ...rowDivider }}>
        {selectable ? (
          <View style={selectBox}>
            <Skeleton variant="rect" width={'1.1rem'} height={'1.1rem'} />
          </View>
        ) : null}
        {columns.map((col) => (
          <View key={col.key} style={colBox(col)}>
            <Skeleton variant="text" width={'70%'} />
          </View>
        ))}
      </View>
    ));
  }

  // ---- Body ----
  function renderBody() {
    if (loading) return <View accessibilityRole="rowgroup">{renderSkeletonRows(loadingRows)}</View>;
    if (sortedData.length === 0) {
      return (
        <View accessibilityRole="rowgroup">
          <View accessibilityRole="row" style={{ flexDirection: 'row', ...rowDivider }}>
            <View style={{ flex: 1, paddingVertical: PAD_EMPTY, paddingHorizontal: PAD_INLINE, alignItems: 'center', justifyContent: 'center' }}>
              {asText(emptyState ?? LABEL_NO_RESULTS, {
                color: t('text-subtle'),
                fontSize: t('font-size-sm'),
                fontFamily: t('font-sans'),
                textAlign: 'center',
              })}
            </View>
          </View>
        </View>
      );
    }
    return (
      <View accessibilityRole="rowgroup">
        {sortedData.map((row, ri) => {
          const isSelected = selectedSet.has(row.id);
          return (
            <View
              key={String(row.id)}
              accessibilityRole="row"
              accessibilityState={selectable ? { selected: isSelected } : undefined}
              style={{ flexDirection: 'row', ...rowDivider, ...(isSelected ? { backgroundColor: SELECTED_BG } : null) }}
            >
              {selectable ? (
                <View accessibilityRole="cell" style={selectBox}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleRow(row.id)}
                    accessibilityLabel={LABEL_SELECT_ROW}
                  />
                </View>
              ) : null}
              {columns.map((col) => (
                <View key={col.key} accessibilityRole="cell" style={colBox(col)}>
                  {col.render ? asText(col.render(row, ri), cellTextStyle(col)) : asText(String(row[col.key] ?? ''), cellTextStyle(col))}
                </View>
              ))}
            </View>
          );
        })}
      </View>
    );
  }

  // The skeleton prop renders the placeholder geometry, hidden from a11y: a
  // placeholder header (no live checkbox / sort control) over skeleton rows.
  if (skeleton) {
    return (
      <ScrollView
        horizontal
        aria-hidden={true}
        {...rest}
        style={[wrapStyle(), style as never]}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={{ flexGrow: 1, backgroundColor: SURFACE }}>
          <View accessibilityRole="row" style={{ flexDirection: 'row', backgroundColor: SURFACE, ...rowDivider }}>
            {selectable ? (
              <View style={selectBox}>
                <Skeleton variant="rect" width={'1.1rem'} height={'1.1rem'} />
              </View>
            ) : null}
            {columns.map((col) => (
              <View key={col.key} style={colBox(col)}>
                <Skeleton variant="text" width={'60%'} />
              </View>
            ))}
          </View>
          <View accessibilityRole="rowgroup">{renderSkeletonRows(loadingRows)}</View>
        </View>
      </ScrollView>
    );
  }

  // Compose header + body, threading maxHeight/stickyHeader: a sticky header sits
  // outside the vertical body scroll so it stays pinned; otherwise the whole grid
  // scrolls vertically together, matching the web `.wrap` + `position: sticky`.
  const body = renderBody();
  let content: ReactNode;
  if (maxHeight != null) {
    content = stickyHeader ? (
      <>
        {renderHeader()}
        <ScrollView style={{ maxHeight }}>{body}</ScrollView>
      </>
    ) : (
      <ScrollView style={{ maxHeight }}>
        {renderHeader()}
        {body}
      </ScrollView>
    );
  } else {
    content = (
      <>
        {renderHeader()}
        {body}
      </>
    );
  }

  return (
    <ScrollView
      horizontal
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      {...rest}
      style={[wrapStyle(), style as never]}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View accessibilityRole="grid" style={{ flexGrow: 1, backgroundColor: SURFACE }}>
        {content}
      </View>
    </ScrollView>
  );
}

/** The `.wrap` surface: hairline border, radius-md, surface fill, clipped. */
function wrapStyle() {
  return {
    borderWidth: HAIRLINE,
    borderColor: BORDER,
    borderStyle: 'solid' as const,
    borderRadius: RADIUS,
    backgroundColor: SURFACE,
    overflow: 'hidden' as const,
  };
}
