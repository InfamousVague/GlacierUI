import { Children, createContext, Fragment, useContext, type ReactNode } from 'react';
import { View, Text, Pressable, ScrollView, type ScrollViewProps, type ViewProps } from 'react-native';
import { listSpec, listItemSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { paintFor, sizeFor, dimensionsFor } from './resolve.ts';

/**
 * List + ListItem — the @glacier/native binding of the web molecules.
 *
 * KIND: scroll. The List is the scroll container: it renders a <ScrollView>
 * whose contentContainerStyle carries the inter-row gap (the web `<ul>` grid
 * gap), and it publishes `size` + `divided` to its ListItem children through a
 * context so each row resolves the same density and flat/card treatment the web
 * derives with CSS descendant selectors (`.list.sm .row`, `.divided .row`).
 * ListItem keeps the SAME data prop contract as the web
 * (title/description/leading/trailing/selected/disabled/href/onClick) so the
 * docs compare 1:1; used standalone it falls back to the md, undivided default.
 *
 * Paint and geometry are read from `listSpec` / `listItemSpec` through the shared
 * resolvers so the rows cannot drift from List.module.css:
 *   - list dims      → per-size row height + inline padding + inter-row gap.
 *   - item dims      → space-3 row gap, radius-lg row corners.
 *   - item base paint→ surface-raised card, border-subtle hairline, text.
 *   - states.selected→ accent-soft fill, accent-border, accent-text.
 *   - states.disabled→ text-disabled title.
 *   - divided divider→ the `border` hairline drawn between rows.
 * The row's block padding and font-size per size are not declared in the spec's
 * `sizes` map, so they are carried verbatim from the web `.list.sm/.md .row`
 * rules (sm: space-2 / font-size-xs, md: space-3 / font-size-sm).
 *
 * Web-only, accepted-but-noop on native (documented):
 *   - virtualization — a long List/Table would use a virtualized/windowed list;
 *     this binding renders the real scrollable content in a ScrollView. A
 *     virtualized (FlatList) variant is a device follow-up.
 *   - href navigation — the web renders an <a> that navigates; native has no
 *     router, so an `href` row is a Pressable with link semantics but no
 *     navigation. Wire it through `onClick`/onPress on device.
 *   - onClick's MouseEvent — the web handler receives a DOM MouseEvent; the
 *     native Pressable has none, so it is called with no argument.
 *   - className — DOM escape hatch, ignored.
 *   - hover / focus-visible washes and the row color transition — hover/motion
 *     the resting native binding does not run.
 */

// The web hardcodes this union (it is not derived from the spec there either).
export type ListSize = 'sm' | 'md';

export interface ListProps extends Omit<ScrollViewProps, 'children'> {
  size?: ListSize;
  /** Draws hairline separators between direct ListItem children. */
  divided?: boolean;
  children?: ReactNode;
  /** Web-only escape hatch; accepted for parity and ignored on native. */
  className?: string;
}

export interface ListItemProps extends Omit<ViewProps, 'children'> {
  title: ReactNode;
  description?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  /**
   * Renders the row with link semantics. DOM-only navigation; accepted for prop
   * parity with the web ListItem but does not navigate on native (no-op) — wire
   * navigation through `onClick`/onPress on device.
   */
  href?: string;
  /**
   * Renders the row as an actionable button. Called on press; the web handler
   * receives a MouseEvent, but the native Pressable has none, so it is invoked
   * with no argument (documented approximation).
   */
  onClick?: () => void;
  /** Web-only escape hatch; accepted for parity and ignored on native. */
  className?: string;
}

/** Shared row metrics a List publishes to its ListItem children. */
interface ListContextValue {
  size: ListSize;
  divided: boolean;
}
const ListContext = createContext<ListContextValue>({ size: 'md', divided: false });

// Strip the leading `$` from a base-paint ref exactly as the shared resolvers do.
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);

// Size-independent geometry read once from the specs.
const LIST_DIMS = dimensionsFor(listSpec); // { gap, border, radius }
const ITEM_DIMS = dimensionsFor(listItemSpec); // { gap: space-3, radius: radius-lg }

// The row's base card paint, the selected treatment, the disabled title, and the
// divided divider color — all read straight from the specs.
const ITEM_BASE = (listItemSpec.paint ?? {}) as { background?: string; text?: string; border?: string };
const SELECTED = paintFor(listItemSpec, 'states', 'selected'); // { background, border, text }
const DISABLED = paintFor(listItemSpec, 'states', 'disabled'); // { text }
const DIVIDER = paintFor(listSpec, 'states', 'divided'); // { border }

// Row block padding + font-size per size: the web `.list.sm/.md .row` rules,
// which the spec's `sizes` map does not carry (it declares height, paddingInline
// and the inter-row gap only). Kept as the web base values so they cannot invent
// geometry the spec never declared.
const ROW_PAD_BLOCK: Record<ListSize, string> = { sm: 'space-2', md: 'space-3' };
const ROW_FONT: Record<ListSize, string> = { sm: 'font-size-xs', md: 'font-size-sm' };

const isPrimitive = (v: ReactNode): v is string | number => typeof v === 'string' || typeof v === 'number';

/**
 * A semantic list container that gives its ListItem children shared row metrics.
 * Renders a scrollable ScrollView (bound its height through `style` to actually
 * scroll); the inter-row gap lives on contentContainerStyle, collapsing to 0 with
 * hairline dividers when `divided`.
 */
export function List({
  size = 'md',
  divided = false,
  className: _className,
  children,
  style,
  contentContainerStyle,
  ...rest
}: ListProps) {
  const dims = sizeFor(listSpec, size);
  const gap = divided ? 0 : t(dims.gap ?? (size === 'sm' ? 'space-1' : 'space-2'));

  // Divided lists interleave a hairline divider between consecutive rows,
  // matching the web `.divided > [data-glacier-list-item]:not(:first-child)`
  // border-top (the spec's `divider` anatomy).
  let content: ReactNode = children;
  if (divided) {
    const items = Children.toArray(children);
    content = items.map((child, index) => (
      <Fragment key={index}>
        {index > 0 && (
          <View
            aria-hidden={true}
            style={{ height: t(LIST_DIMS.border ?? 'hairline'), backgroundColor: t(DIVIDER.border ?? 'border') }}
          />
        )}
        {child}
      </Fragment>
    ));
  }

  return (
    <ListContext.Provider value={{ size, divided }}>
      <ScrollView
        accessibilityRole="list"
        {...rest}
        style={[{ minWidth: 0 }, style as never]}
        contentContainerStyle={[{ rowGap: gap }, contentContainerStyle as never]}
      >
        {content}
      </ScrollView>
    </ListContext.Provider>
  );
}

/**
 * A semantic list row with optional leading, supporting, and trailing content.
 * The row is a card by default (surface-raised, border-subtle hairline, radius-lg)
 * and flat when the parent List is divided; selected rows take the accent-soft
 * fill, accent border, and accent text. Density (height, padding, title size)
 * follows the parent List's `size`. Rendered as a Pressable when `onClick` or
 * `href` is set (and not disabled), else a static View.
 */
export function ListItem({
  title,
  description,
  leading,
  trailing,
  selected = false,
  disabled = false,
  href,
  onClick,
  className: _className,
  style,
  ...rest
}: ListItemProps) {
  const { size, divided } = useContext(ListContext);
  const dims = sizeFor(listSpec, size);

  const mutedColor = t('text-muted');
  const titleColor = disabled
    ? t(DISABLED.text ?? 'text-disabled')
    : selected
      ? t(SELECTED.text ?? 'accent-text')
      : t(bare(ITEM_BASE.text) ?? 'text');
  const rowFont = t(ROW_FONT[size]);

  // The row surface. Divided rows are flat (transparent, no border); card rows
  // carry the base hairline, swapped to the accent border + accent-soft fill when
  // selected.
  const rowStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    columnGap: t(ITEM_DIMS.gap ?? 'space-3'),
    width: '100%' as const,
    minWidth: 0,
    minHeight: t(dims.height ?? (size === 'sm' ? 'control-height-sm' : 'control-height-md')),
    paddingVertical: t(ROW_PAD_BLOCK[size]),
    paddingHorizontal: t(dims.paddingInline ?? (size === 'sm' ? 'space-3' : 'space-4')),
    borderRadius: t(ITEM_DIMS.radius ?? 'radius-lg'),
    borderWidth: divided ? 0 : t(LIST_DIMS.border ?? 'hairline'),
    borderStyle: 'solid' as const,
    borderColor: selected ? t(SELECTED.border ?? 'accent-border') : t(bare(ITEM_BASE.border) ?? 'border-subtle'),
    backgroundColor: divided
      ? selected
        ? t(SELECTED.background ?? 'accent-soft')
        : 'transparent'
      : selected
        ? t(SELECTED.background ?? 'accent-soft')
        : t(bare(ITEM_BASE.background) ?? 'surface-raised'),
  };

  const content = (
    <>
      {leading != null && (
        // Decorative leading slot, hidden from assistive tech and tinted muted so
        // a currentColor SVG picks up the color (the web `.leading` rule).
        <View
          aria-hidden={true}
          style={{ flexDirection: 'row', flexShrink: 0, alignItems: 'center', justifyContent: 'center', color: mutedColor }}
        >
          {isPrimitive(leading) ? (
            <Text style={{ color: mutedColor, fontSize: rowFont, fontFamily: t('font-sans') }}>{leading}</Text>
          ) : (
            leading
          )}
        </View>
      )}
      <View style={{ flex: 1, flexDirection: 'column', minWidth: 0, rowGap: t('space-1') }}>
        <Text numberOfLines={1} style={{ color: titleColor, fontSize: rowFont, fontFamily: t('font-sans') }}>
          {title}
        </Text>
        {description != null && (
          <Text
            style={{
              color: selected ? titleColor : mutedColor,
              // Selected description inherits the accent text at 0.78 opacity (web
              // `.item[data-selected] .description`); otherwise it rests muted.
              opacity: selected ? 0.78 : 1,
              fontSize: t('font-size-xs'),
              lineHeight: t('leading-sm') as never,
              fontFamily: t('font-sans'),
            }}
          >
            {description}
          </Text>
        )}
      </View>
      {trailing != null && (
        <View style={{ flexDirection: 'row', flexShrink: 0, alignItems: 'center', color: mutedColor }}>
          {isPrimitive(trailing) ? (
            <Text style={{ color: mutedColor, fontSize: rowFont, fontFamily: t('font-sans') }}>{trailing}</Text>
          ) : (
            trailing
          )}
        </View>
      )}
    </>
  );

  const interactive = !disabled && (href != null || onClick != null);

  if (interactive) {
    return (
      <Pressable
        accessibilityRole={href != null ? 'link' : 'button'}
        accessibilityState={{ selected, disabled }}
        disabled={disabled}
        // href navigation is a device follow-up; onClick fires on press with no
        // event argument (the web handler receives a MouseEvent).
        onPress={onClick != null ? () => onClick() : undefined}
        {...rest}
        style={[rowStyle, style as never]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View accessibilityState={{ selected, disabled }} {...rest} style={[rowStyle, style as never]}>
      {content}
    </View>
  );
}
