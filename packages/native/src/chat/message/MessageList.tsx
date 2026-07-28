/**
 * @glacier/native — MessageList.
 *
 * The React Native binding of @glacier/react's MessageList: the transcript. It
 * consumes the same `ChatSequenceItem[]` from `insertSeparators`, renders it
 * through the same render props, and makes every scroll decision by calling the
 * same functions in @glacier/logic — `isAtBottom`, `shouldShowScrollToLatest`,
 * `unreadBelow`, `transcriptAdjustment`, `countMessagesAfter`,
 * `drainAnnouncement`. Geometry comes from the message-list spec through the
 * shared resolvers. Nothing about *when* the transcript follows, holds still, or
 * speaks is decided in this file.
 *
 * WHAT MAPS
 *
 * - **Bottom pinning.** A `ScrollView` with `onScroll` at a 16ms throttle gives
 *   `contentOffset.y` / `contentSize.height` / `layoutMeasurement.height`, which
 *   are exactly `scrollTop` / `scrollHeight` / `clientHeight`. Those three feed
 *   the same `TranscriptMetrics` the DOM binding builds, so "near enough to the
 *   bottom" is one number in one place. Pinning is `scrollToEnd({ animated:
 *   false })` where the web writes `scrollTop = scrollHeight`.
 * - **Prepend anchoring.** `maintainVisibleContentPosition` is the platform
 *   doing natively what the web binding does by hand: the scroll view records a
 *   visible child and holds its screen position when content is inserted above
 *   it. `minIndexForVisible: 1` skips index 0 so the header (the load-older
 *   affordance) is not the thing anchored to. This is strictly better than the
 *   DOM path — it runs on the UI thread, so it survives a prepend during a fling.
 * - **Sticky day rows.** `stickyHeaderIndices` on the ScrollView. See WHAT DOES
 *   NOT MAP.
 * - **The unread divider's stability.** Identical, because it is not a scroll
 *   behaviour at all: the divider is placed against a pinned message id by
 *   `insertSeparators`, and neither binding recomputes it.
 *
 * WHAT DOES NOT MAP
 *
 * - **`position: sticky` per element.** RN has no such thing. Pinning is a
 *   property of the SCROLL VIEW — `stickyHeaderIndices` names which direct
 *   children stick — so this component computes those indices from the sequence
 *   rather than each day row deciding for itself. Three consequences, none of
 *   them cosmetic:
 *     · rows must be DIRECT children of the ScrollView, so there is no wrapper
 *       row element here and therefore no place to hang `aria-setsize` /
 *       `aria-posinset` the way the web binding does;
 *     · only the top edge pins. CSS sticky's other insets, and its scoping to
 *       the parent box, have no counterpart;
 *     · header content shifts every index, so the indices are offset by one when
 *       a header is present — a fencepost the web binding simply does not have.
 *   Day rows default to the `chip` variant when pinned for the same reason:
 *   if pinning silently fails (an RN version or a `FlatList` without support), a
 *   chip that failed to float still reads correctly, whereas a rule that failed
 *   to float leaves a line drawn through somebody's message.
 * - **`overflow-anchor: none`.** There is no browser scroll anchoring to switch
 *   off, so there is nothing to fight and nothing to declare.
 * - **The `ResizeObserver` re-anchor.** The web binding re-corrects when content
 *   above the viewport changes size without the items changing (an image
 *   finishing its load). `maintainVisibleContentPosition` covers the insertion
 *   case; the resize case is a device follow-up, and on RN the usual fix is
 *   giving media its intrinsic size up front so it never reflows.
 * - **The live region.** `role="log"`, `aria-live`, and a visually hidden polite
 *   status node are DOM constructs. The equivalent here is
 *   `AccessibilityInfo.announceForAccessibility`, which this binding calls with
 *   the SAME coalesced count the web speaks — `drainAnnouncement` decides when,
 *   so a busy channel cannot flood VoiceOver any more than it can flood NVDA.
 *   It is fired through a callback rather than imported, so this file stays
 *   testable under react-native-web where the API does not exist.
 * - **Focus ring and keyboard scrolling.** DOM concerns; drags and flings scroll
 *   here.
 * - **`maxHeight` / `className`.** Accepted for API parity; the transcript fills
 *   its flex parent.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import type { ChatMessage, ChatSequenceItem, MessageGroup } from '@glacier/logic';
import {
  ANNOUNCE_INTERVAL_MS,
  countMessagesAfter,
  defaultTranscriptLabels,
  distanceFromBottom,
  drainAnnouncement,
  formatTranscriptLabel,
  idleAnnouncer,
  isAtBottom,
  lastMessageId,
  queueArrivals,
  shouldShowScrollToLatest,
  unreadBelow,
  unreadIndex,
  type AnnouncerState,
  type TranscriptAnnounce,
  type TranscriptLabels,
  type TranscriptMetrics,
  type TranscriptScrollState,
} from '@glacier/logic';
import {
  messageListSpec,
  // TODO(integration): switch to '@glacier/spec' once message-list.ts is
  // registered in packages/spec/src/index.ts.
} from '../../../../spec/src/components/message-list.ts';
import { t } from '../../tokens.ts';
import { dimensionsFor } from '../../resolve.ts';
import { DateSeparator } from './DateSeparator.tsx';
import { ScrollToLatest } from '../roster/ScrollToLatest.tsx';
import { UnreadDivider } from './UnreadDivider.tsx';

const DIMS = dimensionsFor(messageListSpec);

/**
 * The two pieces of the real ScrollView surface the kit's `react-native.d.ts`
 * shim does not model yet, declared as a local augmentation rather than by
 * editing the shared shim — both exist on react-native and react-native-web, and
 * both are load-bearing here: without `maintainVisibleContentPosition` there is
 * no prepend anchoring at all, and without a ref there is no way to pin.
 */
declare module 'react-native' {
  interface ScrollViewProps {
    ref?: { current: ScrollHandle | null };
    /** Holds a visible child's screen position when content is inserted above it. */
    maintainVisibleContentPosition?: { minIndexForVisible: number; autoscrollToTopThreshold?: number };
  }
}

/** The one method this component calls on the scroll view. */
export interface ScrollHandle {
  scrollToEnd(options?: { animated?: boolean }): void;
}

/**
 * The scroll event as RN actually delivers it. The shim types only
 * `contentOffset`, so the other two measurements are read through this and a
 * cast; they are present on every platform RN runs on.
 */
interface ScrollEventLike {
  nativeEvent: {
    contentOffset: { y: number };
    contentSize: { height: number };
    layoutMeasurement: { height: number };
  };
}

type ShimScrollEvent = { nativeEvent: { contentOffset: { x: number; y: number } } };

/** Where a row sits in the transcript, handed to every renderer. */
export interface TranscriptRowContext {
  index: number;
  total: number;
  /** This row sits at or below the unread divider. */
  afterUnread: boolean;
}

type DayItem = Extract<ChatSequenceItem, { kind: 'day' }>;
type UnreadItem = Extract<ChatSequenceItem, { kind: 'unread' }>;

export interface MessageListProps<M extends ChatMessage = ChatMessage> {
  /** The rendered sequence from groupMessages + insertSeparators. Never rebuilt here. */
  items: ChatSequenceItem<M>[];
  /** Renders one author run. */
  renderGroup: (group: MessageGroup<M>, context: TranscriptRowContext) => React.ReactNode;
  /** Renders a day separator. Defaults to `DateSeparator`. */
  renderDay?: (item: DayItem, context: TranscriptRowContext) => React.ReactNode;
  /** Renders the unread rule. Defaults to `UnreadDivider`. */
  renderUnread?: (item: UnreadItem, context: TranscriptRowContext) => React.ReactNode;
  /** Renders any row, overriding all three renderers above. */
  renderItem?: (item: ChatSequenceItem<M>, context: TranscriptRowContext) => React.ReactNode;
  /** Content above the first row, inside the scroll content. */
  header?: React.ReactNode;
  /** Content below the last row: a typing indicator belongs here. */
  footer?: React.ReactNode;
  /** Instant the day labels are read against. */
  now?: number;
  /** BCP-47 tag for the day formatter. */
  locale?: string;
  /** Translated strings, merged over the shared English defaults. */
  labels?: Partial<TranscriptLabels>;
  /** Pins the current day separator to the top edge. See the header for the caveats. */
  stickyDays?: boolean;
  /** Called whenever any part of the reported scroll state changes. */
  onScrollStateChange?: (state: TranscriptScrollState) => void;
  /** Called once each time the reader scrolls within `reachTopOffset` of the start. */
  onReachTop?: () => void;
  /** How close to the start counts as reaching the top, in pixels. */
  reachTopOffset?: number;
  /** A page of older history is in flight; suppresses further `onReachTop` calls. */
  loadingOlder?: boolean;
  /** Overrides the unread tally derived from the divider. */
  unreadCount?: number;
  /** Renders the built-in floating jump control. */
  scrollToLatest?: boolean;
  /** How arrivals reach assistive technology. */
  announce?: TranscriptAnnounce;
  /**
   * Speaks a coalesced arrival count. Wire it to
   * `AccessibilityInfo.announceForAccessibility` in the app; it is injected
   * rather than imported so this file runs under react-native-web, where that
   * API does not exist.
   */
  onAnnounce?: (message: string) => void;
  /** Reserved; see the web binding. Declared so windowing is not an API change. */
  estimateRowHeight?: (item: ChatSequenceItem<M>, index: number) => number;
  /** Accepted for API parity; the transcript fills its flex parent. */
  maxHeight?: number | string;
  /** Web-only class hook. Accepted for parity and ignored on native. */
  className?: string;
}

function metricsOf(event: ShimScrollEvent): TranscriptMetrics {
  const { contentOffset, contentSize, layoutMeasurement } = (event as unknown as ScrollEventLike).nativeEvent;
  return {
    scrollTop: contentOffset.y,
    // The same three numbers the DOM binding reads off the viewport, so
    // @glacier/logic decides "at the bottom" once for both platforms.
    scrollHeight: contentSize?.height ?? 0,
    clientHeight: layoutMeasurement?.height ?? 0,
  };
}

function sameState(a: TranscriptScrollState, b: TranscriptScrollState): boolean {
  return (
    a.atBottom === b.atBottom &&
    a.distanceFromBottom === b.distanceFromBottom &&
    a.unreadBelow === b.unreadBelow &&
    a.showScrollToLatest === b.showScrollToLatest
  );
}

/** The transcript, rendered with React Native primitives. */
export function MessageList<M extends ChatMessage = ChatMessage>({
  items,
  renderGroup,
  renderDay,
  renderUnread,
  renderItem,
  header,
  footer,
  now,
  locale,
  labels,
  stickyDays = true,
  onScrollStateChange,
  onReachTop,
  reachTopOffset = 240,
  loadingOlder = false,
  unreadCount,
  scrollToLatest = true,
  announce = 'count',
  onAnnounce,
  estimateRowHeight: _estimateRowHeight,
  maxHeight: _maxHeight,
  className: _className,
}: MessageListProps<M>) {
  const text = useMemo(() => ({ ...defaultTranscriptLabels, ...labels }), [labels]);

  const scrollRef = useRef<ScrollHandle | null>(null);
  const atBottomRef = useRef(true);
  const shownRef = useRef(false);
  const lastIdRef = useRef<string | undefined>(undefined);
  const reachedTopRef = useRef(false);

  const [scrollState, setScrollState] = useState<TranscriptScrollState>({
    atBottom: true,
    distanceFromBottom: 0,
    unreadBelow: 0,
    showScrollToLatest: false,
  });
  const [announcer, setAnnouncer] = useState<AnnouncerState>(idleAnnouncer);

  const publish = useCallback(
    (metrics: TranscriptMetrics) => {
      const atBottom = isAtBottom(metrics);
      atBottomRef.current = atBottom;
      const unread = atBottom ? 0 : (unreadCount ?? unreadBelow(items, false));
      const next: TranscriptScrollState = {
        atBottom,
        distanceFromBottom: distanceFromBottom(metrics),
        unreadBelow: unread,
        showScrollToLatest: shouldShowScrollToLatest(metrics, { unread, shown: shownRef.current }),
      };
      shownRef.current = next.showScrollToLatest;
      setScrollState((previous) => (sameState(previous, next) ? previous : next));
    },
    [items, unreadCount],
  );

  const handleScroll = useCallback(
    (event: ShimScrollEvent) => {
      const metrics = metricsOf(event);
      publish(metrics);
      if (metrics.scrollTop <= reachTopOffset) {
        if (!reachedTopRef.current) {
          reachedTopRef.current = true;
          if (!loadingOlder) onReachTop?.();
        }
      } else {
        reachedTopRef.current = false;
      }
    },
    [publish, reachTopOffset, loadingOlder, onReachTop],
  );

  useEffect(() => {
    onScrollStateChange?.(scrollState);
  }, [scrollState, onScrollStateChange]);

  // Pinning. The web binding does this in a layout effect against scrollTop;
  // here the ScrollView owns its offset, so the equivalent is scrollToEnd. It is
  // deliberately unanimated: an animated pin is one the reader can outrun.
  useEffect(() => {
    if (!atBottomRef.current) return;
    scrollRef.current?.scrollToEnd({ animated: false });
  }, [items]);

  // Arrival counting: from the previously-known tail, never from a length
  // difference, so paging older history announces nothing.
  useEffect(() => {
    const previous = lastIdRef.current;
    lastIdRef.current = lastMessageId(items);
    if (announce !== 'count') return;
    const arrived = countMessagesAfter(items, previous);
    if (arrived <= 0) return;
    setAnnouncer((state) => queueArrivals(state, arrived));
  }, [items, announce]);

  useEffect(() => {
    if (announcer.pending <= 0 || !onAnnounce) return;
    const speak = (): boolean => {
      const { state, count } = drainAnnouncement(announcer, Date.now());
      if (count <= 0) return false;
      setAnnouncer(state);
      onAnnounce(formatTranscriptLabel(text.newMessageCount, { count }));
      return true;
    };
    if (speak()) return;
    const wait = Math.max(0, ANNOUNCE_INTERVAL_MS - (Date.now() - announcer.lastAt));
    const timer = setTimeout(speak, wait);
    return () => clearTimeout(timer);
  }, [announcer, onAnnounce, text.newMessageCount]);

  const unreadAt = useMemo(() => unreadIndex(items), [items]);
  const total = items.length;

  const rows = items.map((item, index) => {
    const context: TranscriptRowContext = {
      index,
      total,
      afterUnread: unreadAt >= 0 && index >= unreadAt,
    };
    const sticky = stickyDays && item.kind === 'day';

    let content: React.ReactNode;
    if (renderItem) content = renderItem(item, context);
    else if (item.kind === 'group') content = renderGroup(item.group, context);
    else if (item.kind === 'day')
      content = renderDay
        ? renderDay(item, context)
        : <DateSeparator at={item.at} now={now} locale={locale} labels={labels} variant={sticky ? 'chip' : 'rule'} />;
    else content = renderUnread ? renderUnread(item, context) : <UnreadDivider count={item.count} labels={labels} />;

    // A direct child of the ScrollView, because stickyHeaderIndices only pins
    // direct children — this is the wrapper the web binding has and this one
    // cannot.
    return <View key={item.key}>{content}</View>;
  });

  // Offset by the header, which occupies index 0 when it is present.
  const headerOffset = header ? 1 : 0;
  const stickyIndices = stickyDays
    ? items.reduce<number[]>((acc, item, index) => {
        if (item.kind === 'day') acc.push(index + headerOffset);
        return acc;
      }, [])
    : undefined;

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <ScrollView
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        stickyHeaderIndices={stickyIndices}
        // The platform doing natively what the web binding hand-rolls: a visible
        // child's screen position is held when content lands above it. Index 0 is
        // skipped so the load-older header is not what gets anchored.
        maintainVisibleContentPosition={{ minIndexForVisible: headerOffset }}
        contentContainerStyle={{
          gap: t(DIMS.gap ?? 'space-2'),
          paddingHorizontal: t(DIMS.paddingInline ?? 'space-4'),
          paddingVertical: t(DIMS.paddingBlock ?? 'space-3'),
        }}
        aria-label={text.log}
        aria-busy={loadingOlder || undefined}
      >
        {header}
        {rows}
        {footer}
      </ScrollView>

      {scrollToLatest && (
        <View
          style={{
            position: 'absolute',
            right: t(DIMS.jumpOffset ?? 'space-4'),
            bottom: t(DIMS.jumpOffset ?? 'space-4'),
          }}
        >
          <ScrollToLatest
            visible={scrollState.showScrollToLatest}
            count={scrollState.unreadBelow}
            labels={labels}
            onPress={() => scrollRef.current?.scrollToEnd({ animated: false })}
          />
        </View>
      )}
    </View>
  );
}
