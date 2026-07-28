import {
  conversationBadge,
  conversationMetaMarkers,
  conversationMetrics,
  conversationPrefixMarker,
  conversationSkeletonWidths,
  conversationSnippet,
  conversationStateLabels,
  conversationTimestamp,
  conversationTimestampLabel,
  defaultConversationLabels,
  UNREAD_DISPLAY_MAX,
  type ConversationDensity,
  type ConversationLabels,
  type ConversationSummary,
} from '@glacier/logic';
import { BellOff, CircleAlert, Pencil, Pin } from '@glacier/icons';
import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode, ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import { CounterBadge } from '../../atoms/display/CounterBadge/CounterBadge.tsx';
import styles from './ConversationList.module.css';

export type { ConversationDensity, ConversationLabels, ConversationSummary };

/** A conversation plus the avatar node the row cannot build for itself. */
export interface ConversationItem extends ConversationSummary {
  /**
   * The avatar. A slot rather than a `src`, because a group chat wants an
   * AvatarGroup here and the row has no business knowing which it was given.
   */
  avatar?: ReactNode;
}

export interface ConversationListItemProps
  extends Omit<ComponentProps<'li'>, 'onSelect' | 'title' | 'id'> {
  /** The conversation this row shows. */
  item: ConversationItem;
  /** How tightly the row is packed. */
  density?: ConversationDensity;
  /** This is the open conversation. */
  selected?: boolean;
  /** Called with the conversation id when the row is activated. */
  onSelect?: (id: string) => void;
  /** 1-based position in the FULL flattened list, so a windowed list still counts right. */
  posInSet?: number;
  /** Length of the FULL flattened list, for the same reason. */
  setSize?: number;
  /** Instant the timestamps are read against; injectable so a list renders deterministically. */
  now?: Date | number;
  /** BCP-47 tag for the timestamp formatter. */
  locale?: string;
  /** Translated strings; merged over the shared English defaults. */
  labels?: Partial<ConversationLabels>;
  /** Loads every part as its own placeholder, keeping the row's exact geometry. */
  skeleton?: boolean;
}

const MARKER_ICON = { pinned: Pin, muted: BellOff } as const;
const PREFIX_ICON = { failed: CircleAlert, draft: Pencil } as const;

/**
 * One conversation in a chat sidebar.
 *
 * A row has to carry avatar, name, snippet, timestamp, unread count, and four
 * state markers without turning into noise, so it spends its space as three
 * independent slots — the prefix at the head of the snippet, the quiet glyphs
 * beside the timestamp, and the badge on the snippet's trailing edge. Which
 * marker wins a contested slot is decided once in @glacier/logic; see the
 * precedence note there. The upshot is that a conversation that is pinned AND
 * muted AND has a failed send AND four unread messages renders all four, each
 * in its own place, with the single adjustment that muting drops the badge from
 * danger to neutral.
 *
 * It is an `option`, so it is deliberately NOT built on ListItem: ListItem's row
 * becomes a `<button>` or `<a>` the moment it is actionable, and an option must
 * be the focusable element itself with no interactive descendants. Everything
 * below the row — Avatar, CounterBadge, Skeleton — is the kit's own.
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
  className,
  style,
  onClick,
  onKeyDown,
  // Roving tabindex: the list hands the open row a 0 and everything else a -1,
  // so Tab enters the sidebar once and lands where the user left off.
  tabIndex = -1,
  ...rest
}: ConversationListItemProps) {
  const text = { ...defaultConversationLabels, ...labels };
  const metrics = conversationMetrics(density);

  // The density's measurements reach CSS as custom properties, so the
  // stylesheet keeps deciding how they are spent while the scale stays shared.
  const densityVars = {
    '--conversation-height': `var(--glacier-${metrics.height})`,
    '--conversation-padding-inline': `var(--glacier-${metrics.paddingInline})`,
    '--conversation-padding-block': `var(--glacier-${metrics.paddingBlock})`,
    '--conversation-gap': `var(--glacier-${metrics.gap})`,
    '--conversation-line-gap': `var(--glacier-${metrics.lineGap})`,
    '--conversation-meta-gap': `var(--glacier-${metrics.metaGap})`,
    '--conversation-radius': `var(--glacier-${metrics.radius})`,
    '--conversation-font-size': `var(--glacier-${metrics.fontSize})`,
    '--conversation-marker-size': metrics.markerIcon,
  } as CSSProperties;

  const badge = conversationBadge(item);
  const prefix = conversationPrefixMarker(item);
  const metaMarkers = conversationMetaMarkers(item);
  const snippet = conversationSnippet(item);
  const stamp = item.timestamp == null ? '' : conversationTimestamp(item.timestamp, { now, locale });

  // A placeholder holds the row's exact geometry: same grid, same line boxes,
  // same trailing column, so nothing moves when the conversation arrives.
  if (skeleton) {
    return (
      <li
        {...rest}
        className={cx(styles.row, className)}
        style={{ ...densityVars, ...style }}
        data-density={density}
        data-skeleton=""
        aria-hidden="true"
      >
        <span className={styles.avatar}>
          <Skeleton variant="circle" width={`var(--glacier-${metrics.avatar === 'sm' ? 'size-xl' : 'size-2xl'})`} />
        </span>
        <span className={styles.copy}>
          <span className={styles.nameLine}>
            <span className={styles.bone}>
              <Skeleton variant="text" width={conversationSkeletonWidths.name} />
            </span>
            <span className={styles.meta}>
              <Skeleton variant="text" width={conversationSkeletonWidths.timestamp} />
            </span>
          </span>
          <span className={styles.snippetLine}>
            <span className={styles.bone}>
              <Skeleton variant="text" width={conversationSkeletonWidths.snippet} />
            </span>
            <span className={styles.badge}>
              <Skeleton variant="circle" width={conversationSkeletonWidths.badge} />
            </span>
          </span>
        </span>
      </li>
    );
  }

  const handleClick = (event: MouseEvent<HTMLLIElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) onSelect?.(item.id);
  };

  const activate = () => onSelect?.(item.id);

  const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    // Enter and Space live on the row, not the list, so a row still activates
    // when it is used outside a ConversationList.
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activate();
    }
  };

  return (
    <li
      {...rest}
      role="option"
      aria-selected={selected}
      aria-posinset={posInSet}
      aria-setsize={setSize}
      className={cx(styles.row, className)}
      style={{ ...densityVars, ...style }}
      data-conversation-id={item.id}
      data-density={density}
      data-selected={selected || undefined}
      data-unread={badge ? '' : undefined}
      data-muted={item.muted || undefined}
      tabIndex={tabIndex}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Decorative: the name beside it is what identifies the conversation. */}
      <span className={styles.avatar} aria-hidden="true">
        {item.avatar}
      </span>

      <span className={styles.copy}>
        <span className={styles.nameLine}>
          <span className={styles.name}>{item.name}</span>
          {/* The glyphs are painted state; the phrases below carry the meaning. */}
          <span className={styles.meta} aria-hidden="true">
            {metaMarkers.map((marker) => {
              const Glyph = MARKER_ICON[marker];
              return <Glyph key={marker} className={styles.marker} data-marker={marker} />;
            })}
            {stamp && <span className={styles.time}>{stamp}</span>}
          </span>
        </span>

        <span className={styles.snippetLine}>
          <span className={styles.snippet}>
            {prefix &&
              (() => {
                const Glyph = PREFIX_ICON[prefix];
                return (
                  <span className={styles.prefix} data-marker={prefix}>
                    <Glyph className={styles.marker} aria-hidden="true" />
                    {prefix === 'failed' ? text.failed : text.draft}
                  </span>
                );
              })()}
            {snippet}
          </span>
          {/* CounterBadge is a live region; inside an option it would announce
              itself a second time, so the count is spoken by the phrase list. */}
          {badge && (
            <span className={styles.badge} aria-hidden="true">
              <CounterBadge
                count={badge.count}
                max={UNREAD_DISPLAY_MAX}
                tone={badge.tone}
                size={metrics.badge}
              />
            </span>
          )}
        </span>
      </span>

      {/* Weight, glyphs, and a badge are all invisible to a screen reader, and
          an abbreviated "Tue" is useless without its neighbours to read it
          against. Both are spelled out here instead. */}
      <span className={styles.srOnly}>
        {conversationStateLabels(item, text).join('. ')}
        {item.timestamp != null && `. ${conversationTimestampLabel(item.timestamp, locale)}`}
      </span>
    </li>
  );
}
