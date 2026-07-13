import { type ReactNode } from 'react';
import { View, Text, ScrollView, type ViewProps } from 'react-native';
import { tableSpec } from '@glacier/spec';
import { t } from './tokens.ts';

/**
 * Table — the @glacier/native binding of the web organism.
 *
 * KIND: scroll. The web `.wrap` is an `overflow-x: auto` box, so the whole table
 * lives inside a horizontal <ScrollView>. Rows are composed from View/Text (no
 * DOM <table>): a rowgroup of header cells over a rowgroup of body rows, each row
 * a flex-row whose bottom hairline spans the full width (matching the web's
 * collapsed horizontal borders). The item/column data contract is identical to
 * @glacier/react's Table — same `columns` (key/header/align/render) and `data`.
 *
 * Paint is read from `tableSpec` (background → surface, text → text); the rest of
 * the geometry (radius-md wrap, hairline `border` dividers, space-3/space-4 cell
 * padding, the font-size-sm caption) is carried from Table.module.css, which the
 * spec does not tokenize, via bare token names wrapped by t().
 *
 * Approximation, documented as a device follow-up: the web uses `table-layout:
 * auto` to size each column to its content. That needs measurement, so this
 * binding distributes columns evenly (`flex: 1` over a `COLUMN_MIN` floor). The
 * table fills the viewport like the web's `width: 100%` and scrolls horizontally
 * once the columns' floors exceed it; header and body columns stay aligned
 * because they share one flex rule. Long-table virtualization is likewise a
 * follow-up — every row renders. `className` is accepted for parity and ignored.
 */

export interface TableColumn {
  key: string;
  header: ReactNode;
  align?: 'left' | 'center' | 'right';
  render?: (row: Record<string, unknown>, index: number) => ReactNode;
}

export interface TableProps extends Omit<ViewProps, 'children' | 'style'> {
  columns: TableColumn[];
  data: Record<string, unknown>[];
  caption?: ReactNode;
  emptyState?: ReactNode;
  /** Merged after the component's own wrap style so it augments, never clobbers. */
  style?: ViewProps['style'];
  /** Web-only escape hatch; accepted for parity and ignored on native. */
  className?: string;
}

/** Strip the leading `$` from a spec ref, exactly as the shared resolvers do. */
function bare(v: string | undefined): string | undefined {
  return v?.startsWith('$') ? v.slice(1) : v;
}

// Spec paint: the table's surface fill and base text color.
const PAINT = (tableSpec.paint ?? {}) as { background?: string; text?: string };
const SURFACE = t(bare(PAINT.background) ?? 'surface');
const TEXT = t(bare(PAINT.text) ?? 'text');

// The resting per-column floor. The web auto-sizes columns; without measurement
// this binding gives every column an equal share above this width, so wide
// tables scroll instead of crushing their cells. A raw length (like Pill/
// TabStrip's inline rem metrics) — never a token, so t() must not wrap it.
const COLUMN_MIN = '6rem';

/** align → RN horizontal placement. Web maps left→start, right→end (§ text color/align rule). */
function alignItemsFor(align: TableColumn['align']): 'center' | 'flex-end' | 'stretch' {
  return align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'stretch';
}
function textAlignFor(align: TableColumn['align']): 'center' | 'right' | 'left' {
  return align === 'center' ? 'center' : align === 'right' ? 'right' : 'left';
}

/** Wrap bare text in <Text> (RN cannot render a raw string in a View); pass
 *  through a caller-supplied ReactNode element unchanged. */
function asText(node: ReactNode, style: Record<string, unknown>): ReactNode {
  return typeof node === 'string' || typeof node === 'number' ? <Text style={style}>{node}</Text> : node;
}

/**
 * The Glacier Table, rendered with React Native primitives. Visually identical to
 * @glacier/react's Table (paint from the spec, geometry from the CSS), it reads
 * the same `columns`/`data` shape and renders the header, body rows and optional
 * caption inside a horizontally-scrolling surface with hairline row dividers.
 */
export function Table({ columns, data, caption, emptyState, className: _className, style, ...rest }: TableProps) {
  const hairline = t('hairline');
  const borderColor = t('border');
  const padBlock = t('space-3');
  const padInline = t('space-4');
  const fontSans = t('font-sans');
  const subtle = t('text-subtle');

  // The bottom hairline that divides every row (header + body cells alike).
  const rowDivider = {
    borderBottomWidth: hairline,
    borderBottomColor: borderColor,
    borderStyle: 'solid' as const,
  };

  const cellBox = (align: TableColumn['align']) => ({
    flex: 1,
    minWidth: COLUMN_MIN,
    paddingVertical: padBlock,
    paddingHorizontal: padInline,
    alignItems: alignItemsFor(align),
  });

  const headerText = {
    color: TEXT,
    fontSize: t('font-size-md'),
    fontFamily: fontSans,
    fontWeight: '600' as never,
  };
  const cellText = (align: TableColumn['align']) => ({
    color: TEXT,
    fontSize: t('font-size-md'),
    fontFamily: fontSans,
    textAlign: textAlignFor(align),
  });

  return (
    <ScrollView
      horizontal
      {...rest}
      style={[
        {
          borderWidth: hairline,
          borderColor,
          borderStyle: 'solid',
          borderRadius: t('radius-md'),
          backgroundColor: SURFACE,
          overflow: 'hidden',
        },
        style as never,
      ]}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View accessibilityRole="table" style={{ flexGrow: 1, backgroundColor: SURFACE }}>
        {/* Header rowgroup */}
        <View accessibilityRole="rowgroup">
          <View accessibilityRole="row" style={{ flexDirection: 'row', ...rowDivider }}>
            {columns.map((column) => (
              <View
                key={column.key}
                accessibilityRole="columnheader"
                style={cellBox(column.align)}
              >
                {asText(column.header, { ...headerText, textAlign: textAlignFor(column.align) })}
              </View>
            ))}
          </View>
        </View>

        {/* Body rowgroup */}
        <View accessibilityRole="rowgroup">
          {data.length === 0 ? (
            <View accessibilityRole="row" style={{ flexDirection: 'row', ...rowDivider }}>
              <View
                style={{
                  flex: 1,
                  paddingVertical: padInline,
                  paddingHorizontal: padInline,
                  alignItems: 'center',
                }}
              >
                {asText(emptyState ?? 'No rows', {
                  color: subtle,
                  fontSize: t('font-size-md'),
                  fontFamily: fontSans,
                  textAlign: 'center',
                })}
              </View>
            </View>
          ) : (
            data.map((row, rowIndex) => (
              <View
                key={`${rowIndex}-${String(row.id ?? 'row')}`}
                accessibilityRole="row"
                style={{ flexDirection: 'row', ...rowDivider }}
              >
                {columns.map((column) => (
                  <View
                    key={`${column.key}-${rowIndex}`}
                    accessibilityRole="cell"
                    style={cellBox(column.align)}
                  >
                    {column.render
                      ? column.render(row, rowIndex)
                      : asText(String(row[column.key] ?? ''), cellText(column.align))}
                  </View>
                ))}
              </View>
            ))
          )}
        </View>

        {/* Caption — caption-side: bottom in the web CSS, so it renders below. */}
        {caption != null
          ? asText(caption, {
              paddingVertical: t('space-2'),
              paddingHorizontal: padInline,
              color: subtle,
              fontSize: t('font-size-sm'),
              fontFamily: fontSans,
              textAlign: 'left',
            })
          : null}
      </View>
    </ScrollView>
  );
}
