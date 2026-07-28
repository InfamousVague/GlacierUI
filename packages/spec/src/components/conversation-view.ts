import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';
import { messageDeliveryStatuses, messageLayouts } from './message-bubble.ts';

/**
 * Whose client produced a message.
 *
 * Transcribed from `MessageAuthorship` in `@glacier/logic` for the same reason
 * `messageDeliveryStatuses` is: the spec cannot import the package that already
 * depends on it. A test asserts the two lists match.
 */
export const messageAuthorships = ['local', 'remote'] as const;

/** Where a local message sits on its way to the server; mirrors `MessageAck`. */
export const messageAcks = ['optimistic', 'confirmed', 'failed'] as const;

export const conversationViewSpec: ComponentSpec = {
  name: 'ConversationView',
  id: 'conversation-view',
  category: 'organism',
  status: 'draft',
  summary:
    'A scrolling thread built from a flat message log and the reader\'s id: runs grouped by author, drawn on the edge their authorship earns, with a delivery state on the local side only and an in-flight send drawn provisionally rather than as a fault.',
  element: 'div',
  anatomy: [
    { name: 'scroller', description: 'The scroll region itself. Owns the overflow, keeps itself pinned to the live end while the reader is already there, and is focusable so the thread can be scrolled from the keyboard.', required: true },
    { name: 'thread', description: 'The column of runs inside the scroller, bottom-anchored so a short conversation sits at the foot of the pane rather than floating at its top.', required: true },
    { name: 'run', description: 'One author\'s run, rendered by MessageGroup. Carries the resolved authorship and acknowledgement as data attributes so a run can be found by either axis.' },
    { name: 'empty', description: 'What a conversation with no messages shows instead of a blank pane.' },
    { name: 'skeleton', description: 'The placeholder thread: real runs on alternating edges, holding the geometry the loaded transcript will settle into.' },
  ],
  props: [
    { name: 'messages', type: 'array', required: true, description: 'The transcript as a flat, chronological log. Grouped into runs by `groupMessages`; the order given is the order rendered.', item: { type: 'object', description: 'One ChatMessage: id, authorId, at, and optionally text, status, editedAt, breaksGroup.' } },
    { name: 'viewerId', type: 'string', required: true, description: 'The reading user. Authorship is derived from this against each run\'s authorId, so no caller ever pre-tags a message as own or other.' },
    { name: 'layout', type: 'enum', values: messageLayouts, default: 'bubble', description: 'Forwarded to every run. Bubble encodes authorship in edge and fill; row encodes it in a header.' },
    { name: 'now', type: 'number', description: 'The instant timestamps are read against; injected so a thread renders deterministically.' },
    { name: 'locale', type: 'string', description: 'BCP-47 tag for the timestamp formatter.' },
    { name: 'groupWindowMs', type: 'number', description: 'Pause after which a new run begins. Defaults to the shared five-minute window.' },
    { name: 'avatarFor', type: 'handler', description: 'Returns the avatar for one author id; drawn once at the head of each run.' },
    { name: 'authorNameFor', type: 'handler', description: 'Returns the display name for one author id; drawn once at the head of each run.' },
    { name: 'renderBody', type: 'handler', description: 'Replaces the default text rendering for one message; receives the message and its slot context.' },
    { name: 'labels', type: 'object', description: 'Translated delivery and edited words, forwarded to every run.', fields: [
      { name: 'sending', type: 'string', description: 'Queued, not yet acknowledged.' },
      { name: 'sent', type: 'string', description: 'The server has it.' },
      { name: 'delivered', type: 'string', description: 'It reached the other device.' },
      { name: 'read', type: 'string', description: 'It was opened.' },
      { name: 'failed', type: 'string', description: 'It did not go out.' },
      { name: 'edited', type: 'string', description: 'Appended to a message that was changed after sending.' },
    ] },
    { name: 'empty', type: 'node', description: 'Replaces the default empty state shown when the log holds no messages.' },
    { name: 'label', type: 'string', description: 'Accessible name for the scroll region, e.g. the other participant\'s name.' },
    { name: 'stick', type: 'boolean', default: true, description: 'Follows the live end of the thread while the reader is already at it. Never scrolls a reader who has scrolled up.' },
    { name: 'onAtBottomChange', type: 'handler', description: 'Called when the reader arrives at or leaves the live end, so a caller can show its own jump-to-latest affordance.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders the placeholder thread at the geometry the loaded one will settle into.' },
  ],
  defaults: { layout: 'bubble', stick: true, skeleton: false },
  dimensions: {
    /** Between two runs. Wider than the gap inside a run, which is what makes a run read as one utterance. */
    gap: token('space-4'),
    paddingInline: token('space-4'),
    paddingBlock: token('space-3'),
    /**
     * How far a provisional run steps back. Alpha rather than a second fill:
     * see the `optimistic` state for why an in-flight message must stay the
     * colour it will settle at.
     */
    provisionalOpacity: '0.65',
  },
  states: [
    {
      name: 'default',
      description: 'A thread of grouped runs, scrolled to its live end.',
    },
    {
      name: 'remote',
      description: 'A run from anyone but the reader: the raised surface on the leading edge, and — the invariant this component exists to hold — no delivery mark at all. A tick reports what our server said about our outbox; about a message someone else sent, we know only that it arrived, so a tick here would be a claim with nothing behind it.',
      paint: { background: token('surface-raised'), text: token('text') },
    },
    {
      name: 'local',
      description: 'A run the reader wrote: the accent fill on the trailing edge, and always a delivery mark. Always, including when the caller modelled no statuses — a local message that reports nothing is indistinguishable from one that never sent.',
      paint: { background: token('accent-solid'), text: token('accent-contrast') },
    },
    {
      name: 'optimistic',
      description:
        'A local run the server has not acknowledged. It keeps its fill and its text exactly — restated here so a port binds "does not repaint" rather than inventing a second colour — and steps back by `provisionalOpacity` alone. A hue change would make an in-flight message and a settled one two different colours, and the reader would have to learn the second one to recognise the first; alpha says "not yet" without saying "wrong", and resolves by simply going away.',
      paint: { background: token('accent-solid'), text: token('accent-contrast') },
    },
    {
      name: 'failed',
      description: 'A local run that did not go out. Unacknowledged like an optimistic one, but no longer waiting, so it does the opposite: it keeps full strength and takes the danger border and glyph. This is the one row in a transcript that asks the reader to act, and de-emphasising it is the exact wrong move.',
      paint: { border: token('danger-border') },
      tokens: { glyph: token('danger-text') },
    },
    {
      name: 'empty',
      description: 'A conversation with nothing in it yet: a centred, muted stop rather than a blank pane the reader will read as a failure to load.',
      tokens: { text: token('text-muted') },
    },
    {
      name: 'focus-visible',
      description: 'The scroll region takes an inset accent ring when reached from the keyboard, because a scroller nobody can focus is a scroller nobody can page through.',
      tokens: { ring: token('focus-ring') },
    },
    {
      name: 'skeleton',
      description: 'Placeholder runs on alternating edges, at the real footprint. They carry no delivery state at all: a placeholder claiming "Read" is a lie with a tick beside it.',
    },
  ],
  // The runs carry every drop of paint; the thread itself is a scroll box, and
  // painting it would put a second surface behind whatever it was dropped into.
  paint: {},
  focusRing: { ring: token('focus-ring'), offset: '-2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'space-3', 'space-4',
    'surface-raised', 'accent-solid', 'accent-contrast',
    'danger-border', 'danger-text',
    'text', 'text-muted',
    'focus-ring', 'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'log',
    focusable: true,
    keyboard: [
      { keys: 'Tab', action: 'Focuses the scroll region, so the thread can be paged without a pointer.' },
      { keys: 'ArrowUp / ArrowDown / PageUp / PageDown / Home / End', action: 'Scrolls the thread. Native scroller behaviour, not re-implemented.' },
    ],
    notes: [
      'role="log" with aria-live="polite": a thread is an append-only record, and polite is what stops an arriving message from cutting off whatever the reader was already being told.',
      'The scroll region is focusable and named, because a scrollable region that cannot be focused cannot be read by keyboard alone.',
      'Authorship is announced by each run, which is labelled by its author; the thread itself does not repeat it.',
      'The delivery state travels with a translated word, never the glyph alone — and only ever on the local side, so a screen reader is never told a delivery fact about a message the viewer did not send.',
    ],
  },
  motion: {
    description:
      'The thread follows the live end without animating to it. An eased scroll on arrival would move text a reader is mid-sentence in, and the one case where following is correct — the reader is already at the bottom — is the case where there is nothing to travel.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
