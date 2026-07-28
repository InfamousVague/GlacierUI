// The Glacier conversation list, rendered with React Native primitives: a chat
// sidebar of rows carrying avatar, name, snippet, timestamp, unread count, and
// the muted / pinned / draft / failed markers. Every decision the row makes —
// snippet truncation, the 99+ cap, the timestamp shape, which marker wins which
// slot — comes from @glacier/logic, the same functions the DOM kit calls, so
// the two cannot say different things about the same conversation. Paint and
// geometry are read from the conversation specs through the shared resolvers.

import type { ReactNode } from 'react';
import { View, Text, Pressable, ScrollView, type ViewProps } from 'react-native';
import { BellOff, CircleAlert, Pencil, Pin } from '@glacier/icons';
import { useControlled } from '@glacier/logic';
import {
  conversationBadge,
  conversationMetaMarkers,
  conversationMetrics,
  conversationOrder,
  conversationPrefixMarker,
  conversationRowHeight,
  conversationSectionLabel,
  conversationSkeletonWidths,
  conversationSnippet,
  conversationStateLabels,
  conversationTimestamp,
  conversationTimestampLabel,
  conversationWindow,
  defaultConversationLabels,
  groupConversations,
  UNREAD_DISPLAY_MAX,
  type ConversationDensity,
  type ConversationLabels,
  type ConversationSummary,
} from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once the conversation specs are
// registered in packages/spec/src/index.ts.
import {
  conversationListItemSpec,
  conversationListSpec,
} from '../../../../spec/src/components/conversation-list.ts';
import { t } from '../../tokens.ts';
import { paintFor, dimensionsFor } from '../../resolve.ts';
import { CounterBadge } from '../../atoms/display/CounterBadge.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton.tsx';

export type { ConversationDensity, ConversationLabels, ConversationSummary };

/** A conversation plus the avatar node the row cannot build for itself. */
export interface ConversationItem extends ConversationSummary {
  /** Avatar, or an avatar group for a group chat. A slot, so the row need not know which. */
  avatar?: ReactNode;
}

// Paint read once from the specs, so the rows cannot drift from
// ConversationList.module.css.
const ITEM_BASE = (conversationListItemSpec.paint ?? {}) as { text?: string };
const HOVER = paintFor(conversationListItemSpec, 'states', 'hover'); // { background }
const SELECTED = paintFor(conversationListItemSpec, 'states', 'selected'); // { background, text }
const UNREAD = paintFor(conversationListItemSpec, 'states', 'unread'); // { name, snippet, badge }
const MUTED = paintFor(conversationListItemSpec, 'states', 'muted'); // { marker, badge }
const PINNED = paintFor(conversationListItemSpec, 'states', 'pinned'); // { marker }
const DRAFT = paintFor(conversationListItemSpec, 'states', 'draft'); // { prefix }
const FAILED = paintFor(conversationListItemSpec, 'states', 'failed'); // { prefix }
const GROUPED = paintFor(conversationListSpec, 'states', 'grouped'); // { header }
const LIST_DIMS = dimensionsFor(conversationListSpec); // { gap, sectionGap, header* }

const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);

/** Avatar diameters per density, the tokens the web `.avatar` slot sizes to. */
const AVATAR_TOKEN: Record<'sm' | 'md', string> = { sm: 'size-xl', md: 'size-2xl' };

const MARKER_ICON = { pinned: Pin, muted: BellOff } as const;
const PREFIX_ICON = { failed: CircleAlert, draft: Pencil } as const;

/**
 * Marker glyph sizes in px. The spec declares them as CSS lengths because the
 * DOM sizes glyphs in rem; react-native-svg takes a number, so the rem values
 * are converted here at the 16px root rather than invented.
 */
const MARKER_PX: Record<ConversationDensity, number> = { compact: 12, comfortable: 14 };

export interface ConversationListItemProps extends Omit<ViewProps, 'style' | 'children'> {
  /** The conversation this row shows. */
  item: ConversationItem;
  density?: ConversationDensity;
  selected?: boolean;
  onSelect?: (id: string) => void;
  /** 1-based position in the FULL flattened list, so a windowed list still counts right. */
  posInSet?: number;
  setSize?: number;
  now?: Date | number;
  locale?: string;
  labels?: Partial<ConversationLabels>;
  /** Loads every part as its own placeholder, keeping the row's exact geometry. */
  skeleton?: boolean;
}

/**
 * One conversation in a chat sidebar.
 *
 * The three slots — the prefix at the head of the snippet, the quiet glyphs
 * beside the timestamp, the badge on the snippet's trailing edge — are the same
 * three the DOM row uses, filled by the same commons selectors, so a row that is
 * pinned AND muted AND failed AND unread renders identically on both platforms.
 *
 * Web-only, accepted-but-noop on native (documented):
 *   - the focus ring and hover wash — the resting binding paints neither; the
 *     pressed state stands in for hover.
 *   - roving tabindex — there is no DOM focus on a device; the list's keyboard
 *     model is a hardware-keyboard follow-up and lives in commons already.
 */
export function ConversationListItem({
  item,
  density = 'comfortable',
  selected = false,
  onSelect,
  posInSet,
  setSize,
  now,
  locale,
  labels,
  skeleton = false,
  ...rest
}: ConversationListItemProps) {
  const text = { ...defaultConversationLabels, ...labels };
  // The same scale the DOM kit reads, so a compact row is the same row here.
  const metrics = conversationMetrics(density);

  const rowStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    columnGap: t(metrics.gap),
    minWidth: 0,
    minHeight: t(metrics.height),
    paddingVertical: t(metrics.paddingBlock),
    paddingHorizontal: t(metrics.paddingInline),
    borderRadius: t(metrics.radius),
  };

  const avatarSize = t(AVATAR_TOKEN[metrics.avatar]);

  if (skeleton) {
    // A placeholder holds the row's exact geometry: same row box, same avatar
    // diameter, same two line boxes, so nothing moves when content arrives.
    return (
      <View aria-hidden={true} style={rowStyle} {...rest}>
        <Skeleton variant="circle" width={avatarSize} />
        <View style={{ flex: 1, minWidth: 0, rowGap: t(metrics.lineGap) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: t('space-2') }}>
            <View style={{ flex: 1 }}>
              <Skeleton variant="text" width={conversationSkeletonWidths.name} />
            </View>
            <Skeleton variant="text" width={conversationSkeletonWidths.timestamp} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: t('space-2') }}>
            <View style={{ flex: 1 }}>
              <Skeleton variant="text" width={conversationSkeletonWidths.snippet} />
            </View>
            <Skeleton variant="circle" width={conversationSkeletonWidths.badge} />
          </View>
        </View>
      </View>
    );
  }

  const badge = conversationBadge(item);
  const prefix = conversationPrefixMarker(item);
  const metaMarkers = conversationMetaMarkers(item);
  const snippet = conversationSnippet(item);
  const stamp = item.timestamp == null ? '' : conversationTimestamp(item.timestamp, { now, locale });
  const markerPx = MARKER_PX[density] ?? 14;

  const rowColor = selected ? t(SELECTED.text ?? 'accent-text') : t(bare(ITEM_BASE.text) ?? 'text');
  const nameColor = badge && !selected ? t(UNREAD.name ?? 'text') : rowColor;
  const quietColor = selected ? rowColor : t('text-subtle');
  const snippetColor = selected ? rowColor : badge ? t(UNREAD.snippet ?? 'text') : t('text-muted');
  const markerColor = selected ? rowColor : t(PINNED.marker ?? MUTED.marker ?? 'text-subtle');

  const prefixColor = t(
    (prefix === 'failed' ? FAILED.prefix : DRAFT.prefix) ?? (prefix === 'failed' ? 'danger-text' : 'warning-text'),
  );

  // Weight, glyphs, and a badge are invisible to a screen reader, and "Tue"
  // alone is useless without its neighbours to read it against. Both are
  // spelled out in the row's accessibility label instead.
  const spoken = [
    item.name,
    ...conversationStateLabels(item, text),
    item.timestamp == null ? '' : conversationTimestampLabel(item.timestamp, locale),
    snippet,
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <Pressable
      accessibilityRole="menuitem"
      aria-label={spoken}
      accessibilityState={{ selected }}
      aria-posinset={posInSet}
      aria-setsize={setSize}
      onPress={() => onSelect?.(item.id)}
      {...rest}
      style={({ pressed }) => [
        rowStyle,
        selected && { backgroundColor: t(SELECTED.background ?? 'accent-soft') },
        pressed && !selected && { backgroundColor: t(HOVER.background ?? 'hover') },
      ]}
    >
      {/* Decorative: the name beside it is what identifies the conversation. */}
      <View aria-hidden={true} style={{ width: avatarSize, height: avatarSize, flexShrink: 0 }}>
        {item.avatar}
      </View>

      <View style={{ flex: 1, minWidth: 0, rowGap: t(metrics.lineGap) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: t('space-2') }}>
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              minWidth: 0,
              color: nameColor,
              fontSize: t(metrics.fontSize),
              fontFamily: t('font-sans'),
              // Unread is legible in greyscale: the name gains weight, so the
              // badge is a second signal rather than the only one.
              fontWeight: (badge ? t('font-weight-semibold') : t('font-weight-regular')) as never,
            }}
          >
            {item.name}
          </Text>
          <View
            aria-hidden={true}
            style={{ flexDirection: 'row', alignItems: 'center', columnGap: t(metrics.metaGap), flexShrink: 0 }}
          >
            {metaMarkers.map((marker) => {
              const Glyph = MARKER_ICON[marker];
              return <Glyph key={marker} size={markerPx} color={markerColor} />;
            })}
            {stamp !== '' && (
              <Text
                style={{
                  color: quietColor,
                  fontSize: t('font-size-xs'),
                  fontFamily: t('font-sans'),
                  fontVariant: ['tabular-nums'],
                }}
              >
                {stamp}
              </Text>
            )}
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: t('space-2') }}>
          {/* The prefix never shrinks: if it truncated away, the row would
              silently stop saying that a message failed to send. */}
          {prefix != null && (
            <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: t('space-1'), flexShrink: 0 }}>
              {(() => {
                const Glyph = PREFIX_ICON[prefix];
                return <Glyph size={markerPx} color={selected ? rowColor : prefixColor} />;
              })()}
              <Text
                style={{
                  color: selected ? rowColor : prefixColor,
                  fontSize: t('font-size-xs'),
                  fontFamily: t('font-sans'),
                }}
              >
                {prefix === 'failed' ? text.failed : text.draft}
              </Text>
            </View>
          )}
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              minWidth: 0,
              color: snippetColor,
              fontSize: t('font-size-xs'),
              lineHeight: t('leading-sm') as never,
              fontFamily: t('font-sans'),
            }}
          >
            {snippet}
          </Text>
          {/* The count is already in the row's label; the badge repeating it
              would announce twice. */}
          {badge && (
            <View aria-hidden={true} style={{ flexShrink: 0 }}>
              <CounterBadge count={badge.count} max={UNREAD_DISPLAY_MAX} tone={badge.tone} size={metrics.badge} />
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export interface ConversationListProps extends Omit<ViewProps, 'style' | 'children'> {
  items: readonly ConversationItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  grouped?: boolean;
  density?: ConversationDensity;
  /**
   * Opens each conversation as the cursor moves. Accepted for prop parity; the
   * arrow-key cursor is a hardware-keyboard follow-up on native, so today it
   * only affects `moveCursor`.
   */
  selectionFollowsFocus?: boolean;
  /** Caps the list and makes it scroll. That ScrollView is the windowing host. */
  maxHeight?: number | string;
  empty?: ReactNode;
  now?: Date | number;
  locale?: string;
  labels?: Partial<ConversationLabels>;
}

/**
 * The chat sidebar: a single-select list of conversations, grouped into Pinned
 * and All. Selection, grouping, and the cursor model come from @glacier/logic,
 * so the two platforms group and step through the same list the same way.
 *
 * The windowing seam is identical to the DOM binding's: rows come from `items`
 * (never children), the row height is known from the spec's density step,
 * `conversationWindow()` already does the arithmetic and returns everything
 * while it has no viewport height, and the two struts are already in the tree.
 * On a device the drop-in is a FlatList in place of the ScrollView; the props
 * do not change either way.
 *
 * Web-only, accepted-but-noop on native (documented):
 *   - the listbox/option roles — native has no listbox, so rows are menuitems
 *     in an accessible container and selection is reported through
 *     accessibilityState rather than aria-selected.
 *   - roving tabindex and arrow-key navigation — no DOM focus on a device.
 */
export function ConversationList({
  items,
  value,
  defaultValue,
  onValueChange,
  grouped = true,
  density = 'comfortable',
  // Parity prop: the arrow-key cursor is a hardware-keyboard follow-up on
  // native, so it is accepted and unused here.
  selectionFollowsFocus: _selectionFollowsFocus = false,
  maxHeight,
  empty,
  now,
  locale,
  labels,
  ...rest
}: ConversationListProps) {
  const text = { ...defaultConversationLabels, ...labels };
  const [selected, setSelected] = useControlled({
    value,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  });

  const sections = groupConversations(items, grouped);
  const order = conversationOrder(sections);

  // No viewport measurements are fed in, so this resolves to the whole list and
  // two zero-height struts. See the seam note above.
  const slice = conversationWindow({ total: order.length, rowHeight: conversationRowHeight(density) });

  let rendered = -1;
  const body =
    order.length === 0 ? (
      <View style={{ paddingVertical: t('space-4'), paddingHorizontal: t('space-3') }}>{empty}</View>
    ) : (
      sections.map((section) => (
        <View key={section.id} accessibilityRole="menu" aria-label={conversationSectionLabel(section.id, text)}>
          <Text
            aria-hidden={true}
            style={{
              paddingVertical: t(LIST_DIMS.headerPaddingBlock ?? 'space-2'),
              paddingHorizontal: t(LIST_DIMS.headerPaddingInline ?? 'space-3'),
              color: t(GROUPED.header ?? 'text-subtle'),
              fontSize: t('font-size-xs'),
              fontFamily: t('font-sans'),
              fontWeight: t('font-weight-semibold') as never,
            }}
          >
            {conversationSectionLabel(section.id, text)}
          </Text>
          <View style={{ rowGap: t(LIST_DIMS.gap ?? 'space-1') }}>
            {section.items.map((item) => {
              rendered += 1;
              const index = rendered;
              if (index < slice.start || index >= slice.end) return null;
              return (
                <ConversationListItem
                  key={item.id}
                  item={item}
                  density={density}
                  selected={item.id === selected}
                  onSelect={setSelected}
                  posInSet={index + 1}
                  setSize={order.length}
                  now={now}
                  locale={locale}
                  labels={labels}
                />
              );
            })}
          </View>
        </View>
      ))
    );

  const content = (
    <>
      {/* The struts a windowing strategy inflates; zero-height while the whole
          list is rendered, and never part of the row sequence. */}
      <View aria-hidden={true} style={{ height: slice.padStart }} />
      {body}
      <View aria-hidden={true} style={{ height: slice.padEnd }} />
    </>
  );

  if (maxHeight === undefined) {
    return (
      <View aria-label={text.list} {...rest} style={{ rowGap: t(LIST_DIMS.sectionGap ?? 'space-4'), minWidth: 0 }}>
        {content}
      </View>
    );
  }

  return (
    <ScrollView
      aria-label={text.list}
      {...rest}
      style={{ maxHeight: maxHeight as never, minWidth: 0 }}
      contentContainerStyle={{ rowGap: t(LIST_DIMS.sectionGap ?? 'space-4') }}
    >
      {content}
    </ScrollView>
  );
}

export interface ConversationSkeletonProps extends Omit<ViewProps, 'style' | 'children'> {
  /** How many placeholder rows to draw. Enough to fill a viewport, not the list. */
  count?: number;
  density?: ConversationDensity;
}

/**
 * The chat sidebar while it loads. It renders the real ConversationListItem in
 * its skeleton state rather than a lookalike, so the placeholder cannot drift
 * from the row it stands in for. Placeholders are decorative; mark the region
 * around the list busy so the wait is announced once, not once per row.
 */
export function ConversationSkeleton({
  count = 6,
  density = 'comfortable',
  ...rest
}: ConversationSkeletonProps) {
  return (
    <View aria-hidden={true} {...rest} style={{ rowGap: t(LIST_DIMS.gap ?? 'space-1') }}>
      {Array.from({ length: Math.max(0, count) }, (_, index) => (
        // The row is a placeholder, so it carries no conversation: an empty
        // summary keeps the prop contract honest rather than faking data.
        <ConversationListItem key={index} skeleton density={density} item={{ id: `skeleton-${index}`, name: '' }} />
      ))}
    </View>
  );
}
