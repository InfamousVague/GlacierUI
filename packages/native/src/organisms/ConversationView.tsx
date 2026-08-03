// The Glacier ConversationView, rendered with React Native primitives: a
// scrolling thread built from a flat message log and the reader's id.
//
// Both axes it exists to keep apart - local/remote authorship and
// optimistic/confirmed acknowledgement - are resolved by `conversationRuns` in
// @glacier/logic, the same function the DOM kit calls, so a remote bubble
// cannot grow a tick on one platform and not the other. Geometry and the
// provisional alpha come from conversationViewSpec through the shared
// resolvers rather than being typed in here.
//
// Web-parity notes: the DOM binding pulls its region name and empty-state
// wording from the kit's translation catalog, which has no native counterpart,
// so those arrive as `labels` with the same English defaults. The focus ring is
// a pointer-free-keyboard affordance with no on-device equivalent and is left
// to the platform.

import { useRef, type ReactNode } from 'react';
import { ScrollView, View, type ScrollViewHandle } from 'react-native';
import {
  type ChatMessage,
  type MessageLabels,
  type MessageLayout,
  type Millis,
} from '@glacier/logic';
// re-exported from packages/logic/src/index.ts.
import {
  CONVERSATION_SKELETON_VIEWER,
  atBottom,
  conversationRuns,
  conversationSkeletonMessages,
  type ConversationRun,
} from '@glacier/logic';
// re-exported from packages/spec/src/index.ts.
import { conversationViewSpec } from '@glacier/spec';
import { t } from '../tokens.ts';
import { dimensionsFor } from '../resolve.ts';
import { EmptyState } from '../atoms/feedback/EmptyState.tsx';
import { MessageGroup, type MessageSlotContext } from '../chat/message/MessageGroup.tsx';

export type { ConversationRun };

// Read once from the spec: the gap between runs, the thread's padding, and how
// far a provisional run steps back.
const DIMS = dimensionsFor(conversationViewSpec);

/**
 * A resolved measurement. Token names get wrapped in the custom property; a raw
 * value the spec declares inline - the alpha, which sits on no scale - passes
 * through so it never becomes `var(--glacier-0.65)`.
 */
function metric(value: string | undefined, fallback: string): string {
  const resolved = value ?? fallback;
  return /^[.\d]/.test(resolved) ? resolved : t(resolved);
}

const GAP = metric(DIMS.gap, 'space-4');
const PADDING_INLINE = metric(DIMS.paddingInline, 'space-4');
const PADDING_BLOCK = metric(DIMS.paddingBlock, 'space-3');
const PROVISIONAL_OPACITY = Number(metric(DIMS.provisionalOpacity, '0.65'));

/** The words the thread itself says; the DOM kit reads the same set from its catalog. */
export interface ConversationViewLabels {
  /** Accessible name for the scroll region. */
  region: string;
  emptyTitle: string;
  emptyBody: string;
}

const DEFAULT_LABELS: ConversationViewLabels = {
  region: 'Conversation',
  emptyTitle: 'No messages yet',
  emptyBody: 'Messages you send and receive will appear here.',
};

export interface ConversationViewProps<M extends ChatMessage = ChatMessage> {
  /** The transcript as a flat, chronological log. */
  messages: M[];
  /** The reading user; authorship is derived from this, never pre-tagged. */
  viewerId: string;
  layout?: MessageLayout;
  now?: Millis;
  locale?: string;
  /** The page runs right to left; forwarded to every run's tail. */
  rtl?: boolean;
  /** Pause after which a new run begins; defaults to the shared window. */
  groupWindowMs?: number;
  avatarFor?: (authorId: string) => ReactNode;
  authorNameFor?: (authorId: string) => ReactNode;
  renderBody?: (context: MessageSlotContext<M>) => ReactNode;
  /** Translated delivery and edited words, forwarded to every run. */
  labels?: Partial<MessageLabels>;
  /** Translated words the thread itself says. */
  viewLabels?: Partial<ConversationViewLabels>;
  /** Replaces the default empty state. */
  empty?: ReactNode;
  /** Follows the live end while the reader is already at it. */
  stick?: boolean;
  /** Fires when the reader arrives at or leaves the live end. */
  onAtBottomChange?: (atBottom: boolean) => void;
  /** Renders the placeholder thread at the geometry it will settle into. */
  skeleton?: boolean;
}

/**
 * A scrolling conversation.
 *
 * **Authorship** (local/remote) decides the edge and the fill; **acknowledgement**
 * (optimistic/confirmed) decides only whether the run is drawn provisionally.
 * They are independent, and their interaction is a hard rule rather than a
 * default: a remote run shows no delivery mark at all - a tick is a claim about
 * our own outbox, and there is nothing behind that claim for a message someone
 * else sent - while a local run always shows one, filled in when the caller
 * modelled no statuses, because a local message reporting nothing is
 * indistinguishable from one that never sent.
 *
 * An unacknowledged send steps back by one alpha and keeps its colour. A failed
 * one does the opposite: full strength, danger border, because it is the only
 * row in a transcript that asks the reader to act.
 *
 * Sticking to the bottom is one comparison - `atBottom` in @glacier/logic - and
 * it fires only from `onContentSizeChange`, which is the moment a message
 * actually lands. A reader who has scrolled up is never moved.
 */
export function ConversationView<M extends ChatMessage = ChatMessage>({
  messages,
  viewerId,
  layout = 'bubble',
  now,
  locale,
  rtl = false,
  groupWindowMs,
  avatarFor,
  authorNameFor,
  renderBody,
  labels,
  viewLabels,
  empty,
  stick = true,
  onAtBottomChange,
  skeleton = false,
}: ConversationViewProps<M>) {
  const text = { ...DEFAULT_LABELS, ...viewLabels };
  const scroller = useRef<ScrollViewHandle | null>(null);
  // A ref, not state: re-rendering a whole transcript on every scroll frame to
  // remember one boolean would be its own bug.
  const stuck = useRef(true);

  // The placeholder travels the identical grouping and side path the loaded
  // thread will, so it cannot settle into a different layout than the one it
  // held. `delivery: false` stops it claiming a state it has not got.
  const runs = skeleton
    ? (conversationRuns(conversationSkeletonMessages(now ?? 0), CONVERSATION_SKELETON_VIEWER, {
        delivery: false,
      }) as unknown as ConversationRun<M>[])
    : conversationRuns(messages, viewerId, groupWindowMs === undefined ? {} : { windowMs: groupWindowMs });

  const isEmpty = !skeleton && runs.length === 0;

  return (
    <ScrollView
      ref={scroller}
      style={{ flex: 1, minHeight: 0 }}
      contentContainerStyle={{
        flexGrow: 1,
        // A short conversation sits at the foot of the pane; an empty one
        // centres, because there is nothing below it for a bottom anchor to
        // mean anything against.
        justifyContent: isEmpty ? 'center' : 'flex-end',
        // Wider than the gap inside a run - that difference is the whole
        // grouping signal.
        gap: GAP,
        paddingVertical: PADDING_BLOCK,
        paddingHorizontal: PADDING_INLINE,
      }}
      scrollEventThrottle={16}
      onScroll={(event) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        const next = atBottom({
          offset: contentOffset.y,
          viewport: layoutMeasurement.height,
          content: contentSize.height,
        });
        if (next === stuck.current) return;
        stuck.current = next;
        onAtBottomChange?.(next);
      }}
      // The moment a message lands. The one case where scrolling the reader is
      // correct is the case where they were already at the end, so it is the
      // only case this acts on.
      onContentSizeChange={() => {
        if (!stick || !stuck.current) return;
        scroller.current?.scrollToEnd({ animated: false });
      }}
      // Append-only, so `log`. A placeholder is not a log yet, and announcing
      // bones in a live region is worse than silence.
      accessibilityRole={skeleton ? undefined : 'log'}
      aria-label={skeleton ? undefined : text.region}
      aria-hidden={skeleton || undefined}
    >
      {isEmpty
        ? empty ?? <EmptyState title={text.emptyTitle} description={text.emptyBody} />
        : runs.map((run) => (
            <View
              key={run.key}
              style={{
                minWidth: 0,
                // The acknowledgement axis, and the entire visual budget spent
                // on it. Alpha rather than a second fill: an in-flight message
                // must be recognisably the message it is about to become, and a
                // hue change would make the reader learn a second colour to
                // identify the first. Never applied to a failed send.
                opacity: run.provisional ? PROVISIONAL_OPACITY : 1,
              }}
            >
              <MessageGroup
                group={run.group}
                layout={layout}
                own={run.own}
                rtl={rtl}
                avatar={avatarFor?.(run.group.authorId)}
                authorName={authorNameFor?.(run.group.authorId)}
                now={now}
                locale={locale}
                renderBody={renderBody}
                labels={labels}
                skeleton={skeleton}
              />
            </View>
          ))}
    </ScrollView>
  );
}
