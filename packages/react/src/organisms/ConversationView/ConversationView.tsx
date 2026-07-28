import {
  dimensionsFor,
  type ChatMessage,
  type MessageLabels,
  type MessageLayout,
  type Millis,
} from '@glacier/logic';
// TODO(integration): switch to '@glacier/logic' once conversation-view.ts is
// re-exported from packages/logic/src/index.ts.
import {
  CONVERSATION_SKELETON_VIEWER,
  atBottom,
  conversationRuns,
  conversationSkeletonMessages,
  type ConversationRun,
} from '../../../../logic/src/conversation-view.ts';
import {
  useLayoutEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ComponentProps,
  type ReactNode,
  type UIEvent,
} from 'react';
// TODO(integration): switch to '@glacier/spec' once conversation-view.ts is
// re-exported from packages/spec/src/index.ts.
import { conversationViewSpec } from '../../../../spec/src/components/conversation-view.ts';
import { cx } from '../../internal/cx.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { EmptyState } from '../../atoms/feedback/EmptyState/EmptyState.tsx';
import { MessageGroup, type MessageSlotContext } from '../../molecules/MessageBubble/MessageGroup.tsx';
import { conversationMessages } from './messages.ts';
import styles from './ConversationView.module.css';

export type { ConversationRun };

/**
 * The spec's measurements, read once. `provisionalOpacity` is a raw number
 * rather than a token — alpha does not sit on any scale — so anything starting
 * with a digit or dot passes through instead of becoming `var(--glacier-0.65)`.
 */
const DIMS = dimensionsFor(conversationViewSpec);

function metric(value: string | undefined, fallback: string): string {
  const resolved = value ?? fallback;
  return /^[.\d]/.test(resolved) ? resolved : `var(--glacier-${resolved})`;
}

const VARS = {
  '--conversation-gap': metric(DIMS.gap, 'space-4'),
  '--conversation-padding-inline': metric(DIMS.paddingInline, 'space-4'),
  '--conversation-padding-block': metric(DIMS.paddingBlock, 'space-3'),
  '--conversation-provisional-opacity': metric(DIMS.provisionalOpacity, '0.65'),
} as CSSProperties;

export interface ConversationViewProps<M extends ChatMessage = ChatMessage>
  extends Omit<ComponentProps<'div'>, 'children' | 'onScroll'> {
  /** The transcript as a flat, chronological log. */
  messages: M[];
  /**
   * The reading user. Authorship is derived from this, so a caller never tags
   * a message as own or other — the same log renders correctly in two windows
   * signed in as two different people.
   */
  viewerId: string;
  layout?: MessageLayout;
  /** The instant timestamps are read against. */
  now?: Millis;
  /** BCP-47 tag for the timestamp formatter. */
  locale?: string;
  /** Pause after which a new run begins; defaults to the shared window. */
  groupWindowMs?: number;
  /** The avatar for one author, drawn once at the head of each run. */
  avatarFor?: (authorId: string) => ReactNode;
  /** The display name for one author, drawn once at the head of each run. */
  authorNameFor?: (authorId: string) => ReactNode;
  /** Replaces the default text rendering for one message. */
  renderBody?: (context: MessageSlotContext<M>) => ReactNode;
  /** Translated delivery and edited words, forwarded to every run. */
  labels?: Partial<MessageLabels>;
  /** Replaces the default empty state. */
  empty?: ReactNode;
  /** Accessible name for the scroll region, e.g. the other participant. */
  label?: string;
  /** Follows the live end while the reader is already at it. */
  stick?: boolean;
  /** Fires when the reader arrives at or leaves the live end. */
  onAtBottomChange?: (atBottom: boolean) => void;
  /** Renders the placeholder thread at the geometry it will settle into. */
  skeleton?: boolean;
}

/**
 * A scrolling conversation, built from a flat log and the reader's id.
 *
 * It exists to keep two axes apart that are constantly conflated, and almost
 * everything about the component follows from that:
 *
 * **Authorship — local or remote.** Which client produced the message. It
 * decides the edge, the fill, and which side of the column the run hugs, and it
 * is derived here from `viewerId` rather than demanded of the caller, because
 * "mine" is not a property of a message: the same row is mine in one window and
 * theirs in another.
 *
 * **Acknowledgement — optimistic or confirmed.** Whether the server has it.
 * This is about delivery, not authorship, and it exists on the local side only.
 *
 * The interaction is the part worth stating: **a remote run never shows a
 * tick, and a local run always does.** Not "does not by default" — never.
 * `conversationRuns` strips a status off a remote message rather than declining
 * to draw one, because a delivery mark is a claim about our outbox and there is
 * nothing behind that claim for a message someone else sent; a transport that
 * stamps every row it syncs is an ordinary thing, and the resulting tick would
 * be a lie the reader has no way to detect. The mirror of that rule fills a
 * status in on a local message that arrived without one, because a local
 * message reporting nothing is indistinguishable from one that never sent.
 *
 * An unacknowledged send reads as *in flight*, not as broken: the run keeps its
 * colour and steps back by a single alpha, and the delivery atom's clock glyph
 * carries the rest. No spinners. Every message is optimistic for a moment, and
 * a transcript that spun for each of them would be a loading screen with words
 * in it. A failed send does the opposite and stays at full strength with the
 * danger border, because it is the one row asking to be acted on.
 *
 * Scrolling is deliberately thin. It follows the live end while the reader is
 * already there and does nothing at all once they have scrolled up. There is no
 * anchoring, no offset preservation across prepends, no jump-to-latest button —
 * the heavy machinery belongs to a virtualised list, and the honest version of
 * "stick to bottom" is one comparison, in @glacier/logic, shared with native.
 */
export function ConversationView<M extends ChatMessage = ChatMessage>({
  messages,
  viewerId,
  layout = 'bubble',
  now,
  locale,
  groupWindowMs,
  avatarFor,
  authorNameFor,
  renderBody,
  labels,
  empty,
  label,
  stick = true,
  onAtBottomChange,
  skeleton = false,
  className,
  style,
  ...rest
}: ConversationViewProps<M>) {
  const t = useT();
  const scroller = useRef<HTMLDivElement>(null);
  // A ref, not state: whether the reader is parked at the end must be readable
  // inside the layout effect that runs before paint, and re-rendering the whole
  // transcript on every scroll frame to store it would be its own bug.
  const stuck = useRef(true);

  const runs = useMemo(() => {
    // The placeholder travels the identical grouping and side path the loaded
    // thread will, so it cannot settle into a different layout than the one it
    // was holding. `delivery: false` keeps it from claiming a state it has not
    // got — a bone captioned "Read" is a lie with a tick beside it.
    if (skeleton) {
      return conversationRuns(conversationSkeletonMessages(now ?? 0), CONVERSATION_SKELETON_VIEWER, {
        delivery: false,
      }) as unknown as ConversationRun<M>[];
    }
    return conversationRuns(messages, viewerId, groupWindowMs === undefined ? {} : { windowMs: groupWindowMs });
  }, [skeleton, messages, viewerId, groupWindowMs, now]);

  // What "the thread changed at its end" means, in one primitive: a new tail
  // message, a removed one, or the tail's delivery advancing. Comparing this
  // rather than the array identity means a caller who rebuilds the log on every
  // render does not get a scroll on every render.
  const tail = messages[messages.length - 1];
  const signature = `${messages.length}:${tail?.id ?? ''}:${tail?.status ?? ''}`;

  useLayoutEffect(() => {
    const element = scroller.current;
    // The one case where scrolling the reader is correct: they were already at
    // the end. Anything else is the viewport being taken from them mid-sentence.
    if (!element || !stick || !stuck.current) return;
    element.scrollTop = element.scrollHeight;
  }, [stick, signature, skeleton, layout]);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const next = atBottom({
      offset: element.scrollTop,
      viewport: element.clientHeight,
      content: element.scrollHeight,
    });
    if (next === stuck.current) return;
    stuck.current = next;
    onAtBottomChange?.(next);
  };

  const isEmpty = !skeleton && runs.length === 0;

  return (
    <div
      ref={scroller}
      className={cx(styles.conversation, className)}
      style={{ ...VARS, ...style }}
      data-layout={layout}
      data-empty={isEmpty || undefined}
      data-skeleton={skeleton || undefined}
      // Append-only, so `log` rather than `feed`, and polite rather than
      // assertive: an arriving message must never cut off whatever the reader
      // was already being told.
      //
      // A placeholder is none of that yet. Announcing bones in a live region is
      // worse than silence, and the whole subtree is hidden instead — which is
      // also why the tab stop goes with it, since a focusable node inside an
      // aria-hidden one is a dead end.
      role={skeleton ? undefined : 'log'}
      aria-live={skeleton ? undefined : 'polite'}
      // A scroll region nobody can focus is a scroll region nobody can page
      // through without a pointer.
      tabIndex={skeleton ? undefined : 0}
      aria-label={skeleton ? undefined : label ?? t(conversationMessages.conversationLabel)}
      aria-hidden={skeleton || undefined}
      onScroll={handleScroll}
      {...rest}
    >
      <div className={styles.thread}>
        {isEmpty
          ? empty ?? (
              <EmptyState
                title={t(conversationMessages.conversationEmptyTitle)}
                description={t(conversationMessages.conversationEmptyBody)}
              />
            )
          : runs.map((run) => {
              const name = authorNameFor?.(run.group.authorId);
              return (
                <div
                  key={run.key}
                  className={styles.run}
                  // Both axes, side by side and independently queryable — which
                  // is the whole point of the component, so it is also how it
                  // is tested and how an app hangs its own affordances off it.
                  data-authorship={run.authorship}
                  data-ack={run.ack}
                  data-provisional={run.provisional || undefined}
                >
                  <MessageGroup
                    group={run.group}
                    layout={layout}
                    own={run.own}
                    avatar={avatarFor?.(run.group.authorId)}
                    authorName={name}
                    now={now}
                    locale={locale}
                    renderBody={renderBody}
                    labels={labels}
                    skeleton={skeleton}
                  />
                </div>
              );
            })}
      </div>
    </div>
  );
}
