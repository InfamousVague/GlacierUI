import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
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
  prependedCount,
  queueArrivals,
  shouldShowScrollToLatest,
  transcriptAdjustment,
  unreadBelow,
  unreadIndex,
  type AnnouncerState,
  type TranscriptAnnounce,
  type TranscriptLabels,
  type TranscriptMetrics,
  type TranscriptScrollState,
} from '@glacier/logic';
import { cx } from '../../internal/cx.ts';
import { DateSeparator } from './DateSeparator.tsx';
import { ScrollToLatest } from './ScrollToLatest.tsx';
import { UnreadDivider } from './UnreadDivider.tsx';
import styles from './MessageList.module.css';

export type { TranscriptScrollState, TranscriptLabels, TranscriptAnnounce };

/**
 * Where a row sits in the transcript, handed to every renderer.
 *
 * `index` and `total` are against the FULL sequence, never against whatever
 * subset happens to be mounted — which is the whole reason they are passed at
 * all rather than being read off the DOM. A windowing list that mounted rows
 * 300-320 and let them number themselves 1-21 would tell a screen reader the
 * conversation has twenty-one messages in it.
 */
export interface TranscriptRowContext {
  index: number;
  total: number;
  /** This row sits at or below the unread divider. */
  afterUnread: boolean;
}

/**
 * The imperative escape hatch, handed back through `ref`.
 *
 * `ref` gives you this rather than the root element on purpose: what a caller
 * actually wants from a transcript is "put me at the bottom" after sending a
 * message, and handing back a div would make every consumer re-derive the
 * scroll arithmetic this component exists to own.
 */
export interface MessageListHandle {
  /** Jumps to the newest message. */
  scrollToBottom(): void;
  /** Brings a sequence row into view by its commons-assigned key. */
  scrollToItem(key: string): void;
  /** The viewport's geometry right now, or undefined before mount. */
  getMetrics(): TranscriptMetrics | undefined;
}

type DayItem = Extract<ChatSequenceItem, { kind: 'day' }>;
type UnreadItem = Extract<ChatSequenceItem, { kind: 'unread' }>;

export interface MessageListProps<M extends ChatMessage = ChatMessage>
  extends Omit<ComponentProps<'div'>, 'children' | 'onScroll' | 'ref'> {
  /**
   * The rendered sequence, from `groupMessages` + `insertSeparators`.
   *
   * The list consumes it and never rebuilds it. In particular it never re-derives
   * the unread anchor: that anchor is pinned to a message id by the caller
   * precisely so the divider holds still, and a transcript that recomputed it on
   * every render would undo the one thing that design bought.
   */
  items: ChatSequenceItem<M>[];
  /** Renders one author run. The list holds no opinion about what a message looks like. */
  renderGroup: (group: MessageGroup<M>, context: TranscriptRowContext) => ReactNode;
  /** Renders a day separator. Defaults to `DateSeparator`. */
  renderDay?: (item: DayItem, context: TranscriptRowContext) => ReactNode;
  /** Renders the unread rule. Defaults to `UnreadDivider`. */
  renderUnread?: (item: UnreadItem, context: TranscriptRowContext) => ReactNode;
  /**
   * Renders any row, overriding all three renderers above. The escape hatch —
   * and, not coincidentally, the exact signature a windowing list calls.
   */
  renderItem?: (item: ChatSequenceItem<M>, context: TranscriptRowContext) => ReactNode;
  /** Content above the first row, inside the scroll content. */
  header?: ReactNode;
  /** Content below the last row: a typing indicator belongs here, not floating. */
  footer?: ReactNode;
  /** Instant the day labels are read against; injectable so the transcript renders deterministically. */
  now?: number;
  /** BCP-47 tag for the day formatter. */
  locale?: string;
  /** Translated strings, merged over the shared English defaults. */
  labels?: Partial<TranscriptLabels>;
  /** Pins the current day separator to the top edge while its day scrolls past. */
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
  /** Row to open on instead of the bottom — normally the unread divider's key. */
  initialItemKey?: string;
  /**
   * Reserved. An initial height guess for a row that has not been measured.
   *
   * Nothing reads it today, and it is declared anyway: it is the one input a
   * windowing list needs that cannot be derived from the props already here, so
   * declaring it now is what makes the windowing swap additive rather than a
   * breaking change to everyone's call site. See the virtualisation note on the
   * component below.
   */
  estimateRowHeight?: (item: ChatSequenceItem<M>, index: number) => number;
  /** Caps the viewport height. Omit inside a flex column, where it fills what is left. */
  maxHeight?: number | string;
  /** Hands back the imperative handle; see `MessageListHandle`. */
  ref?: Ref<MessageListHandle>;
}

/** One mounted row: its node, and whether it may serve as a scroll anchor. */
interface RowEntry {
  node: HTMLElement;
  anchorable: boolean;
}

function readMetrics(el: HTMLElement): TranscriptMetrics {
  return { scrollTop: el.scrollTop, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight };
}

function sameState(a: TranscriptScrollState, b: TranscriptScrollState): boolean {
  return (
    a.atBottom === b.atBottom &&
    a.distanceFromBottom === b.distanceFromBottom &&
    a.unreadBelow === b.unreadBelow &&
    a.showScrollToLatest === b.showScrollToLatest
  );
}

/**
 * The transcript: a bottom-anchored scrolling log of message groups with day and
 * unread separators woven through it.
 *
 * ## What it does not do
 *
 * It does not know what a message looks like. Rows arrive as a
 * `ChatSequenceItem[]` and leave through `renderGroup` / `renderDay` /
 * `renderUnread`, so the same transcript renders bubbles, a compact IRC-style
 * log, or a moderation queue without either side knowing about the other.
 *
 * ## Anchoring — the actual hard part
 *
 * A transcript has to satisfy two demands that pull in opposite directions:
 * follow the conversation when the reader is at the end, and hold absolutely
 * still when they are not. Both are solved by measuring one thing.
 *
 * On every scroll, and after every commit, the list records the **topmost row
 * intersecting the viewport** as `{ key, offsetTop }`. After the next commit, a
 * `useLayoutEffect` — before paint, so nothing is ever seen to move — looks that
 * row up again and hands its old and new offsets to `transcriptAdjustment` in
 * @glacier/logic, which decides between three moves:
 *
 * - **pin to bottom**, when the reader was already at the end. New messages
 *   stick, because being at the end is how you ask to be shown what arrives.
 * - **shift by the anchor row's movement**, otherwise. If a page of history
 *   landed above and pushed the row down 900px, the viewport moves down 900px
 *   and the reader's eye never leaves the sentence it was on. If the row did not
 *   move — because the change was *below* the reader — the delta is zero and
 *   nothing happens, which is why appending needs no special case.
 * - **nothing**, when neither applies.
 *
 * Measuring a real row rather than diffing `scrollHeight` is what makes this
 * survive the cases that break the naive version: an image above the viewport
 * finishing its load, a quoted reply expanding, or a prepend that also merges
 * two runs into one and therefore does *not* grow the content by the height of
 * what was added. The height delta survives only as a fallback for when the
 * anchor row is gone, and only on a detected prepend, where it is the right
 * answer by construction.
 *
 * A `ResizeObserver` runs the same correction when the content resizes without
 * the items changing, which is the image-loading case. `overflow-anchor: none`
 * is set on the viewport so the browser's own scroll anchoring cannot apply a
 * second, differently-timed correction on top of ours.
 *
 * The obvious alternative — `flex-direction: column-reverse`, which makes the
 * browser pin the bottom for free — is rejected deliberately. It reverses the
 * DOM order, so the reading order, the tab order, and every sticky day header
 * all come out backwards, and it has long-standing scrollbar and RTL bugs.
 * Getting the easy 20% free is not worth breaking the transcript for anyone
 * navigating it with anything other than their eyes.
 *
 * ## Virtualisation seam
 *
 * The seam is the `<div className={rows}>` element below and nothing else:
 * windowing replaces `items.map(row)` and no public prop changes, because
 * everything that would otherwise leak is already true today —
 *
 * - rows are keyed by the key commons assigned them, which survives paging;
 * - `row(item, index)` is already a pure function of the item and its index,
 *   which is precisely a virtualiser's row callback;
 * - the scroll arithmetic reads only `scrollTop`/`scrollHeight`/`clientHeight`
 *   and never enumerates rows, so it does not care how many are mounted;
 * - the anchor registry tolerates a missing row and falls back to the height
 *   delta, which is the case a virtualiser creates when it unmounts an anchor;
 * - `aria-setsize` / `aria-posinset` are already computed against the full
 *   sequence, so the announced count stays truthful;
 * - `data-index` is already on every row, which is the handle a virtualiser
 *   needs to map an index back to a mounted node;
 * - `estimateRowHeight` is already declared, which is the one input a windowing
 *   list needs that cannot be derived from the props above.
 *
 * The kit's existing `VirtualList` does not fit this seam, and the reasons are
 * structural rather than cosmetic: it is fixed-row-height by design, and chat
 * rows are variable by nature; and it owns its own scroll viewport, where the
 * transcript's viewport has to stay its own — it is the sticky positioning
 * ancestor for the day rows, the `offsetParent` every anchor measurement is
 * taken against, and the element the correction writes `scrollTop` to. What
 * drops in here is a variable-height list that is *given* a scroll offset and
 * returns a slice, rather than one that scrolls.
 *
 * ## Announcements
 *
 * See the `announce` prop and the `a11y.notes` on the spec. In short: the log is
 * navigable but not live by default, and arrivals are coalesced into one polite
 * count so a busy channel cannot reduce a screen reader to reading first
 * syllables.
 */
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
  initialItemKey,
  estimateRowHeight: _estimateRowHeight,
  maxHeight,
  className,
  style,
  ref,
  ...rest
}: MessageListProps<M>) {
  const text = useMemo(() => ({ ...defaultTranscriptLabels, ...labels }), [labels]);

  const viewportRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<Map<string, RowEntry>>(new Map());
  const anchorRef = useRef<{ key: string; offset: number } | undefined>(undefined);
  const metricsRef = useRef<TranscriptMetrics>({ scrollTop: 0, scrollHeight: 0, clientHeight: 0 });
  const atBottomRef = useRef(true);
  const shownRef = useRef(false);
  const firstKeyRef = useRef<string | undefined>(undefined);
  const lastIdRef = useRef<string | undefined>(undefined);
  const reachedTopRef = useRef(false);
  const mountedRef = useRef(false);

  // Read by callbacks that must not be re-created on every items change; a stale
  // closure here would report an unread count from two renders ago.
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const unreadOverrideRef = useRef(unreadCount);
  unreadOverrideRef.current = unreadCount;

  const [scrollState, setScrollState] = useState<TranscriptScrollState>({
    atBottom: true,
    distanceFromBottom: 0,
    unreadBelow: 0,
    showScrollToLatest: false,
  });
  const [announcer, setAnnouncer] = useState<AnnouncerState>(idleAnnouncer);
  const [announcement, setAnnouncement] = useState('');

  /** Re-reads the viewport and republishes the state chrome depends on. */
  const publish = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const metrics = readMetrics(el);
    metricsRef.current = metrics;
    const atBottom = isAtBottom(metrics);
    atBottomRef.current = atBottom;

    const override = unreadOverrideRef.current;
    const unread = atBottom ? 0 : (override ?? unreadBelow(itemsRef.current, false));
    const next: TranscriptScrollState = {
      atBottom,
      distanceFromBottom: distanceFromBottom(metrics),
      unreadBelow: unread,
      showScrollToLatest: shouldShowScrollToLatest(metrics, { unread, shown: shownRef.current }),
    };
    shownRef.current = next.showScrollToLatest;
    setScrollState((previous) => (sameState(previous, next) ? previous : next));
  }, []);

  /**
   * Records the topmost row still intersecting the viewport.
   *
   * Sticky rows are excluded: a stuck day header's `offsetTop` tracks the scroll
   * position rather than its place in the content, so anchoring to one would
   * measure the viewport against itself and correct by a delta it invented.
   */
  const recordAnchor = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const top = el.scrollTop;
    let best: { key: string; offset: number } | undefined;
    for (const [key, entry] of rowsRef.current) {
      if (!entry.anchorable) continue;
      const offset = entry.node.offsetTop;
      if (offset + entry.node.offsetHeight <= top) continue;
      if (!best || offset < best.offset) best = { key, offset };
    }
    anchorRef.current = best;
  }, []);

  /** Applies the correction commons decided on, before paint. */
  const applyAdjustment = useCallback(
    (prepended: boolean) => {
      const el = viewportRef.current;
      if (!el) return;
      const anchor = anchorRef.current;
      const entry = anchor ? rowsRef.current.get(anchor.key) : undefined;
      const adjustment = transcriptAdjustment({
        atBottom: atBottomRef.current,
        prepended,
        anchorOffset: entry?.node.offsetTop,
        previousAnchorOffset: anchor?.offset,
        scrollHeight: el.scrollHeight,
        previousScrollHeight: metricsRef.current.scrollHeight,
      });

      if (adjustment.kind === 'pin-bottom') el.scrollTop = el.scrollHeight;
      else if (adjustment.kind === 'anchor') el.scrollTop = el.scrollTop + adjustment.delta;

      // Re-armed here rather than only in the scroll handler: a prepend moves the
      // reader away from the top without necessarily producing a scroll event.
      reachedTopRef.current = el.scrollTop <= reachTopOffset;
      publish();
      recordAnchor();
    },
    [publish, recordAnchor, reachTopOffset],
  );

  // Mount, and every subsequent change to the sequence. Layout, not effect: the
  // correction has to land before the browser paints, or the reader sees the
  // jump we are correcting.
  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const previousFirstKey = firstKeyRef.current;
    firstKeyRef.current = items[0]?.key;

    if (!mountedRef.current) {
      mountedRef.current = true;
      const start = initialItemKey ? rowsRef.current.get(initialItemKey) : undefined;
      // A returning reader opens on their divider; everyone else opens at the end.
      el.scrollTop = start ? start.node.offsetTop : el.scrollHeight;
      reachedTopRef.current = el.scrollTop <= reachTopOffset;
      publish();
      recordAnchor();
      return;
    }

    applyAdjustment(prependedCount(previousFirstKey, items) > 0);
  }, [items, initialItemKey, reachTopOffset, applyAdjustment, publish, recordAnchor]);

  // Content that changes size without the items changing: an image above the
  // viewport finishing its load is the case that matters, and it is the one a
  // height-diffing transcript silently gets wrong.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const content = el.firstElementChild;
    if (!content) return;
    const observer = new ResizeObserver(() => applyAdjustment(false));
    observer.observe(content);
    return () => observer.disconnect();
  }, [applyAdjustment]);

  const handleScroll = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    publish();
    recordAnchor();

    if (el.scrollTop <= reachTopOffset) {
      // Latched, so dragging around near the top does not fire a page request per
      // scroll frame. It re-arms only after the reader leaves the zone.
      if (!reachedTopRef.current) {
        reachedTopRef.current = true;
        if (!loadingOlder) onReachTop?.();
      }
    } else {
      reachedTopRef.current = false;
    }
  }, [publish, recordAnchor, reachTopOffset, loadingOlder, onReachTop]);

  // Report upward whenever anything chrome cares about moved.
  useEffect(() => {
    onScrollStateChange?.(scrollState);
  }, [scrollState, onScrollStateChange]);

  // Count arrivals from the previously-known tail, never from a length
  // difference: paging older history lengthens the list without anything having
  // arrived, and announcing that is worse than announcing nothing.
  useEffect(() => {
    const previous = lastIdRef.current;
    lastIdRef.current = lastMessageId(items);
    if (announce !== 'count') return;
    const arrived = countMessagesAfter(items, previous);
    if (arrived <= 0) return;
    setAnnouncer((state) => queueArrivals(state, arrived));
  }, [items, announce]);

  // Publish what the interval allows, and come back for the rest when it does.
  useEffect(() => {
    if (announcer.pending <= 0) return;
    const speak = (): boolean => {
      const { state, count } = drainAnnouncement(announcer, Date.now());
      if (count <= 0) return false;
      setAnnouncer(state);
      setAnnouncement(formatTranscriptLabel(text.newMessageCount, { count }));
      return true;
    };
    if (speak()) return;
    const wait = Math.max(0, ANNOUNCE_INTERVAL_MS - (Date.now() - announcer.lastAt));
    const timer = setTimeout(speak, wait);
    return () => clearTimeout(timer);
  }, [announcer, text.newMessageCount]);

  const scrollToBottom = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    publish();
    recordAnchor();
  }, [publish, recordAnchor]);

  useImperativeHandle(
    ref,
    () => ({
      scrollToBottom,
      scrollToItem: (key: string) => {
        const el = viewportRef.current;
        const entry = rowsRef.current.get(key);
        if (!el || !entry) return;
        el.scrollTop = entry.node.offsetTop;
        publish();
        recordAnchor();
      },
      getMetrics: () => (viewportRef.current ? readMetrics(viewportRef.current) : undefined),
    }),
    [scrollToBottom, publish, recordAnchor],
  );

  const unreadAt = useMemo(() => unreadIndex(items), [items]);
  const total = items.length;

  const row = (item: ChatSequenceItem<M>, index: number): ReactNode => {
    const context: TranscriptRowContext = {
      index,
      total,
      afterUnread: unreadAt >= 0 && index >= unreadAt,
    };
    const sticky = stickyDays && item.kind === 'day';

    let content: ReactNode;
    if (renderItem) content = renderItem(item, context);
    else if (item.kind === 'group') content = renderGroup(item.group, context);
    else if (item.kind === 'day')
      content = renderDay
        ? renderDay(item, context)
        : <DateSeparator at={item.at} now={now} locale={locale} labels={labels} variant={sticky ? 'chip' : 'rule'} />;
    else
      content = renderUnread ? renderUnread(item, context) : <UnreadDivider count={item.count} labels={labels} />;

    return (
      <div
        key={item.key}
        // React 19 ref cleanup: the callback never sees null, so the key it
        // closed over is always the key being removed.
        ref={(node) => {
          if (node) rowsRef.current.set(item.key, { node, anchorable: !sticky });
          return () => {
            rowsRef.current.delete(item.key);
          };
        }}
        role="listitem"
        // Against the FULL sequence, so a windowed list still counts right.
        aria-setsize={total}
        aria-posinset={index + 1}
        className={cx(styles.row, sticky && styles.sticky)}
        data-key={item.key}
        data-kind={item.kind}
        data-index={index}
      >
        {content}
      </div>
    );
  };

  const sizeStyle: CSSProperties = maxHeight === undefined ? {} : { maxHeight };

  return (
    <div className={cx(styles.root, className)} style={style} data-at-bottom={scrollState.atBottom || undefined}>
      <div
        ref={viewportRef}
        className={styles.viewport}
        style={sizeStyle}
        role="log"
        aria-label={text.log}
        // Explicit, because role="log" is implicitly polite. A live transcript on
        // a busy channel interrupts itself on every arrival, so the reader hears
        // an endless run of first syllables; the coalesced status region below is
        // what speaks instead. announce="messages" hands the job back to the log
        // for a quiet one-to-one thread.
        aria-live={announce === 'messages' ? 'polite' : 'off'}
        aria-busy={loadingOlder || undefined}
        tabIndex={0}
        onScroll={handleScroll}
        {...rest}
      >
        <div className={styles.content}>
          {header}
          {total > 0 && (
            // The seam: windowing replaces this map and nothing else.
            <div className={styles.rows} role="list">
              {items.map(row)}
            </div>
          )}
          {footer}
        </div>
      </div>

      {scrollToLatest && (
        <div className={styles.jump}>
          <ScrollToLatest
            visible={scrollState.showScrollToLatest}
            count={scrollState.unreadBelow}
            labels={labels}
            onClick={scrollToBottom}
          />
        </div>
      )}

      {/* One polite, atomic region for the whole transcript. Atomic because a
          partially-updated count is worse than a late one. */}
      <span className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">
        {loadingOlder ? text.loadingOlder : announcement}
      </span>
    </div>
  );
}
