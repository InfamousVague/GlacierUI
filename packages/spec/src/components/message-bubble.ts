import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/**
 * The two chat layouts. Not skins of one component: a bubble transcript encodes
 * authorship in shape and alignment, a row transcript encodes it in a header,
 * and the two want different avatars, gaps, and paint.
 */
export const messageLayouts = ['bubble', 'row'] as const;

/** Which edge of the transcript a message hugs, in logical (never physical) terms. */
export const messageSides = ['start', 'end'] as const;

/** Where a message sits in its author's run; mirrors `BubblePosition` in commons. */
export const bubblePositions = ['only', 'first', 'middle', 'last'] as const;

/**
 * How far along a message is on its way out.
 *
 * Transcribed from `deliveryStatuses` in `@glacier/logic`, which cannot be
 * imported here without making the spec depend on the package that already
 * depends on it. A test asserts the two lists are identical, so the duplication
 * is checked rather than trusted.
 */
export const messageDeliveryStatuses = ['sending', 'sent', 'delivered', 'read', 'failed'] as const;

/** How much of a moment a meta line spells out. */
export const messageTimestampStyles = ['auto', 'time', 'date'] as const;

export const messageBubbleSpec: ComponentSpec = {
  name: 'MessageBubble',
  id: 'message-bubble',
  category: 'molecule',
  status: 'draft',
  summary:
    'One message in a transcript, drawn either as an edge-aligned tinted bubble whose corners encode its place in the run, or as a full-width row with an avatar gutter and a name and time header.',
  element: 'div',
  anatomy: [
    { name: 'bubble', description: 'The message itself: the tinted capsule in bubble layout, an unfilled block in row layout.', required: true },
    { name: 'gutter', description: 'The leading column that holds the avatar in row layout, and stays reserved on every row so continuation lines align.' },
    { name: 'header', description: 'The author name and time line above the body, in row layout only.' },
    { name: 'body', description: 'The message text. Selectable, and wrapped so an unbroken URL cannot widen the bubble.', required: true },
    { name: 'tail', description: 'The flare joining the last bubble of a run to its author. An SVG path rather than a pseudo-element, so both bindings draw one shape.' },
    { name: 'meta', description: 'The timestamp and delivery status line.' },
    { name: 'receipt', description: 'The read line under the meta: when it was read, or who read it in a group. Present only on the viewer\'s own messages, since a receipt about a message you received says nothing.' },
    { name: 'reactions', description: 'Slot under the body for the reaction bar.' },
    { name: 'attachments', description: 'Slot above the text for images, files, and media.' },
    { name: 'replyTo', description: 'Slot above the body for a quoted preview of the message being answered.' },
  ],
  props: [
    { name: 'layout', type: 'enum', values: messageLayouts, default: 'bubble', description: 'Bubble draws an edge-aligned tinted capsule; row draws full-width prose with an avatar gutter and a header line.' },
    { name: 'own', type: 'boolean', default: false, description: "The viewer sent it. In bubble layout this moves it to the trailing edge and repaints it in the accent; in row layout it changes nothing, since a row transcript is one column." },
    { name: 'position', type: 'enum', values: bubblePositions, default: 'only', description: 'Where the message sits in its author\'s run. Drives the corner radii, so a run reads as one sliced shape rather than separate lozenges.' },
    { name: 'tail', type: 'boolean', default: false, description: 'Draws the tail. Meaningful only on the message that ends a run; MessageGroup decides this for you.' },
    { name: 'side', type: 'enum', values: messageSides, description: 'Overrides the edge authorship would choose. Logical, so a right-to-left transcript mirrors as a whole.' },
    { name: 'avatar', type: 'node', description: 'Rendered in the leading gutter in row layout. The gutter is reserved whether or not one is given.' },
    { name: 'header', type: 'node', description: 'The name and time line above the body, in row layout.' },
    { name: 'at', type: 'number', description: 'When it was sent, epoch milliseconds. Renders a meta line when given.' },
    { name: 'now', type: 'number', description: 'The instant timestamps are read against; injected so a transcript renders deterministically.' },
    { name: 'locale', type: 'string', description: 'BCP-47 tag for the timestamp formatter.' },
    { name: 'status', type: 'enum', values: messageDeliveryStatuses, description: "How far along the send is. Omitted for anything received, which has no outbound state." },
    { name: 'readAt', type: 'number', description: 'When it was read, epoch milliseconds. The status says that it was opened; this says when, which is the difference between a tick and a receipt.' },
    { name: 'readBy', type: 'array', description: 'Who has read it. Resolved by `readReceipt`, and the only honest answer in a group thread, where one tick cannot say which of five people opened it.', item: { type: 'object', description: 'One MessageReader: actorId, and optionally name and at.' } },
    { name: 'edited', type: 'boolean', default: false, description: 'Marks a message its author has since changed.' },
    { name: 'meta', type: 'node', description: 'Replaces the default timestamp and status line entirely.' },
    { name: 'reactions', type: 'node', description: 'Slot under the body for the reaction bar.' },
    { name: 'attachments', type: 'node', description: 'Slot above the text for images, files, and media.' },
    { name: 'replyTo', type: 'node', description: 'Slot above the body for a quoted preview of the message being answered.' },
    { name: 'labels', type: 'object', description: 'Translated delivery and edited words, merged over the shared English defaults.', fields: [
      { name: 'sending', type: 'string', description: 'Queued, not yet acknowledged.' },
      { name: 'sent', type: 'string', description: 'The server has it.' },
      { name: 'delivered', type: 'string', description: 'It reached the other device.' },
      { name: 'read', type: 'string', description: 'It was opened.' },
      { name: 'failed', type: 'string', description: 'It did not go out.' },
      { name: 'edited', type: 'string', description: 'Appended to a message that was changed after sending.' },
    ] },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'children', type: 'node', description: 'The message text.' },
  ],
  defaults: { layout: 'bubble', own: false, position: 'only', tail: false, edited: false, skeleton: false },
  dimensions: {
    radius: token('radius-xl'),
    /** The corner facing a neighbour in the run: cut, not squared. */
    stackedRadius: token('radius-xs'),
    /** The corner a tail grows from; square, or the join shows a seam. */
    tailRadius: token('radius-none'),
    paddingInline: token('space-3'),
    paddingBlock: token('space-2'),
    gap: token('space-1'),
    /** Share of the column a bubble may fill; the remainder is what makes alignment readable. */
    maxWidth: '72%',
    tailWidth: '8px',
    tailHeight: '12px',
  },
  states: [
    {
      name: 'default',
      description: 'A received bubble: the raised surface, ordinary text, fully rounded when it stands alone.',
      // Restated from the top-level rest paint so a port can reach every one of
      // the three message paints through the same `paintFor(spec, 'states', …)`
      // call, rather than needing a second code path for the resting one.
      paint: { background: token('surface-raised'), text: token('text') },
    },
    {
      name: 'own',
      description: 'The viewer\'s own message: accent fill on the trailing edge, so authorship is legible from colour and position before a word is read.',
      paint: { background: token('accent-solid'), text: token('accent-contrast') },
    },
    {
      name: 'row',
      description: 'Row layout paints nothing at all - no fill, no border, no alignment. The header line and the avatar gutter carry authorship instead.',
      tokens: { text: token('text'), header: token('text-muted') },
    },
    {
      name: 'failed',
      description: 'A send that did not go out keeps its fill but takes a danger border, so it is findable by scanning without the transcript turning red.',
      paint: { border: token('danger-border') },
    },
    { name: 'skeleton', description: 'A placeholder holding the bubble\'s exact footprint, so a loading transcript does not reflow as it fills.' },
  ],
  // Rest paint is a received bubble; `own` and `row` are the deltas above.
  paint: { background: token('surface-raised'), text: token('text') },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'radius-xl', 'radius-xs', 'radius-none',
    'space-0', 'space-1', 'space-2', 'space-3',
    'size-xl', 'size-2xl',
    'surface-raised', 'accent-solid', 'accent-contrast', 'accent-text',
    'danger-border', 'danger-text',
    'text', 'text-muted', 'text-subtle',
    'font-size-sm', 'font-size-xs', 'leading-sm',
    'hairline', 'duration-fast', 'ease-out',
  ],
  a11y: {
    focusable: false,
    keyboard: [
      { keys: 'Tab', action: 'Skips the bubble itself and lands on whatever is interactive inside it - a link, a reaction chip, an attachment.' },
    ],
    notes: [
      'A message is prose, not a control: the body stays selectable and is never given a role that would stop a screen reader reading it as text.',
      'The timestamp is decorative once a group has announced its time, so it is hidden from the accessibility tree; the delivery status is not, and carries a translated text label beside its glyph.',
      'Authorship is spoken by the enclosing group, not repeated on every bubble.',
    ],
  },
  motion: {
    description: 'Paint eases; geometry does not. A bubble whose corners animated as the next message arrived would draw the eye to the shape instead of the words.',
    transition: { speed: 'fast', ease: 'out' },
  },
};

export const messageGroupSpec: ComponentSpec = {
  name: 'MessageGroup',
  id: 'message-group',
  category: 'molecule',
  status: 'draft',
  summary:
    'One author\'s run of messages: the avatar and name once at the top, the messages stacked with their corners cut to read as a single shape, and the time and delivery status collapsed to the end of the run.',
  element: 'div',
  anatomy: [
    { name: 'group', description: 'The run.', required: true },
    { name: 'gutter', description: 'The avatar column, reserved for the whole run so every message aligns.' },
    { name: 'header', description: 'The author name, and the run\'s start time in row layout.' },
    { name: 'messages', description: 'The bubbles, in order.', required: true },
    { name: 'meta', description: 'The run\'s single timestamp and delivery line.' },
  ],
  props: [
    { name: 'group', type: 'object', required: true, description: 'The run, exactly as `groupMessages` in @glacier/logic built it.', fields: [
      { name: 'id', type: 'string', required: true, description: 'The first message\'s id; the render key.' },
      { name: 'authorId', type: 'string', required: true, description: 'Who sent the run.' },
      { name: 'messages', type: 'array', required: true, description: 'The messages, in render order, never empty.', item: { type: 'object', description: 'One ChatMessage.' } },
      { name: 'startedAt', type: 'number', required: true, description: 'The first message\'s time.' },
      { name: 'endedAt', type: 'number', required: true, description: 'The last message\'s time; what the run\'s stamp prints.' },
      { name: 'status', type: 'enum', values: messageDeliveryStatuses, description: 'The least advanced status among the members.' },
      { name: 'standalone', type: 'boolean', description: 'A single message that refused to merge, such as a system notice.' },
      { name: 'continued', type: 'boolean', description: 'This run picks up after a separator split it, so the avatar and name must not repeat.' },
    ] },
    { name: 'layout', type: 'enum', values: messageLayouts, default: 'bubble', description: 'Forwarded to every message in the run.' },
    { name: 'own', type: 'boolean', description: 'The viewer wrote this run. Derived from viewerId when omitted.' },
    { name: 'viewerId', type: 'string', description: 'The reading user, compared against the run\'s authorId to decide authorship.' },
    { name: 'side', type: 'enum', values: messageSides, description: 'Overrides the edge authorship would choose, for the whole run. Logical, so a right-to-left transcript still mirrors as a whole. This is how a thread becomes a single column of bubbles without lying about `own`, which would take the delivery state with it.' },
    { name: 'avatar', type: 'node', description: 'Drawn once at the head of the run, and never on a continued run.' },
    { name: 'authorName', type: 'node', description: 'Drawn once at the head of the run, and never on a continued run.' },
    { name: 'authorLabel', type: 'string', description: 'The author\'s name as a plain string, so the run can be announced even when the visible header is suppressed.' },
    { name: 'tails', type: 'boolean', default: true, description: 'Draws a tail on the message that ends the run. Ignored in row layout.' },
    { name: 'now', type: 'number', description: 'The instant timestamps are read against.' },
    { name: 'locale', type: 'string', description: 'BCP-47 tag for the timestamp formatter.' },
    { name: 'renderBody', type: 'handler', description: 'Replaces the default text rendering for one message; receives the message and its slot context.' },
    { name: 'renderReactions', type: 'handler', description: 'Returns the reaction bar for one message; receives the message and its slot context.' },
    { name: 'renderAttachments', type: 'handler', description: 'Returns the attachment block for one message; receives the message and its slot context.' },
    { name: 'renderReplyTo', type: 'handler', description: 'Returns the quoted preview for one message; receives the message and its slot context.' },
    { name: 'labels', type: 'object', description: 'Translated delivery and edited words, forwarded to the meta line.', fields: [
      { name: 'sending', type: 'string', description: 'Queued, not yet acknowledged.' },
      { name: 'sent', type: 'string', description: 'The server has it.' },
      { name: 'delivered', type: 'string', description: 'It reached the other device.' },
      { name: 'read', type: 'string', description: 'It was opened.' },
      { name: 'failed', type: 'string', description: 'It did not go out.' },
      { name: 'edited', type: 'string', description: 'Appended to a message that was changed after sending.' },
    ] },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders the run as placeholders with its exact geometry.' },
  ],
  defaults: { layout: 'bubble', tails: true, skeleton: false },
  dimensions: {
    gap: token('space-1'),
    gutterGap: token('space-2'),
    lineGap: token('space-1'),
    gutter: token('size-xl'),
    rowGutter: token('size-2xl'),
  },
  states: [
    { name: 'default', description: 'A fresh run: avatar and name at the head, messages stacked, one meta line at the foot.' },
    {
      name: 'continued',
      description: 'The run picked up after the unread divider cut it. The avatar and name are suppressed and the gutter stays reserved, so one author never reads as two.',
      tokens: { header: token('text-muted') },
    },
    {
      name: 'standalone',
      description: 'A run of one that refused to merge - a system notice or call record. It keeps its own row and never grows a tail.',
      tokens: { text: token('text-subtle') },
    },
    { name: 'skeleton', description: 'Placeholder messages at the run\'s real footprint.' },
  ],
  // The bubbles carry the paint; the run itself is layout.
  paint: {},
  tokens: ['space-0', 'space-1', 'space-2', 'space-3', 'size-xl', 'size-2xl', 'text', 'text-muted', 'text-subtle', 'font-size-sm', 'font-size-xs'],
  a11y: {
    role: 'group',
    focusable: false,
    notes: [
      'The run is a group labelled by its author, so a screen reader says who is talking once instead of before every message.',
      'A continued run is still labelled by its author even though the visible name is suppressed, so the label does not disappear with the avatar.',
    ],
  },
  motion: {
    description: 'The run does not animate. A transcript that eased as it grew would move the text a reader is mid-sentence in.',
  },
};

export const messageMetaSpec: ComponentSpec = {
  name: 'MessageMeta',
  id: 'message-meta',
  category: 'atom',
  status: 'draft',
  summary: 'The timestamp and delivery status line under a message or a run, showing the least advanced status of everything it covers.',
  element: 'span',
  anatomy: [
    { name: 'meta', description: 'The line.', required: true },
    { name: 'time', description: 'The timestamp, spelled by the shape `messageTimestamp` chose.' },
    { name: 'edited', description: 'The marker for a message changed after sending.' },
    { name: 'status', description: 'The delivery glyph and its translated label.' },
    { name: 'receipt', description: 'The read line: when it was read, or who read it. Sits under the status line rather than beside it, because a group receipt is a sentence and the meta line is a row of glyphs.' },
  ],
  props: [
    { name: 'at', type: 'number', description: 'The moment to print, epoch milliseconds.' },
    { name: 'now', type: 'number', description: 'The instant it is read against; injected so a transcript renders deterministically.' },
    { name: 'locale', type: 'string', description: 'BCP-47 tag for the formatter.' },
    { name: 'timestampStyle', type: 'enum', values: messageTimestampStyles, default: 'time', description: 'How much of the moment to spell: the clock, the full relative ladder, or a date.' },
    { name: 'status', type: 'enum', values: messageDeliveryStatuses, description: 'One message\'s delivery state.' },
    { name: 'statuses', type: 'array', description: 'A run\'s delivery states, collapsed to the least advanced of them.', item: { type: 'enum', values: messageDeliveryStatuses, description: 'One member\'s status, or nothing for a received message.' } },
    { name: 'readAt', type: 'number', description: 'When it was read. Turns the bare word "Read" into "Read 9:41 AM", which is the fact the sender was actually waiting for.' },
    { name: 'readBy', type: 'array', description: 'Who read it, in a thread with more than two people. Collapsed by `readReceipt` into a template choice plus its slots, never a joined sentence.', item: { type: 'object', description: 'One MessageReader: actorId, and optionally name and at.' } },
    { name: 'readByMax', type: 'number', default: 2, description: 'How many reader names the line has room for; on overflow one slot goes back to the "and N others" phrase.' },
    { name: 'edited', type: 'boolean', default: false, description: 'Marks a message changed after sending.' },
    { name: 'own', type: 'boolean', default: false, description: 'Sits inside an accent-filled bubble, so the line inherits that bubble\'s contrast colour instead of the muted one.' },
    { name: 'labels', type: 'object', description: 'Translated delivery and edited words.', fields: [
      { name: 'sending', type: 'string', description: 'Queued, not yet acknowledged.' },
      { name: 'sent', type: 'string', description: 'The server has it.' },
      { name: 'delivered', type: 'string', description: 'It reached the other device.' },
      { name: 'read', type: 'string', description: 'It was opened.' },
      { name: 'failed', type: 'string', description: 'It did not go out.' },
      { name: 'edited', type: 'string', description: 'Appended to a message that was changed after sending.' },
    ] },
    { name: 'receiptTemplates', type: 'object', description: 'Translated read-receipt sentences, one per shape, merged over the kit catalog. Each may use {names}, {first}, {last}, {count}, {total}, and {time}.', fields: [
      { name: 'one', type: 'string', description: 'One reader, or a two-person thread where the time is the whole answer.' },
      { name: 'two', type: 'string', description: 'Exactly two readers.' },
      { name: 'several', type: 'string', description: 'More than two, all named.' },
      { name: 'many', type: 'string', description: 'More readers than the line has room for.' },
    ] },
    { name: 'formatTimestamp', type: 'handler', description: 'Spells the timestamp. Defaults to the platform Intl through `formatMessageTimestamp`.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder at the line\'s exact height.' },
  ],
  defaults: { timestampStyle: 'time', edited: false, own: false, readByMax: 2, skeleton: false },
  dimensions: {
    gap: token('space-1'),
    iconSize: '12px',
  },
  states: [
    {
      name: 'default',
      description: 'A subtle clock, and a delivery glyph when the message is the viewer\'s own.',
      // Restated from the rest paint for the same reason as MessageBubble's.
      paint: { text: token('text-subtle') },
    },
    { name: 'read', description: 'The double check tints to the accent; the shape does not change, so the line never reflows as a message progresses.', tokens: { glyph: token('accent-text') } },
    { name: 'receipt', description: 'The read history under the line, one step quieter than the stamp above it: it is the answer to a question already asked by the tick, not a second announcement of it.', tokens: { text: token('text-subtle') } },
    { name: 'failed', description: 'The only status that asks for action, so it is the only one drawn in a semantic colour.', tokens: { glyph: token('danger-text') } },
    { name: 'own', description: 'Inside an accent bubble the muted grey is unreadable, so the line takes the accent\'s contrast colour.', tokens: { text: token('accent-contrast') } },
    { name: 'skeleton', description: 'A placeholder at the line\'s exact height.' },
  ],
  paint: { text: token('text-subtle') },
  tokens: ['space-1', 'text-subtle', 'text-muted', 'accent-text', 'accent-contrast', 'danger-text', 'font-size-xs', 'leading-xs'],
  a11y: {
    focusable: false,
    notes: [
      'The timestamp is decorative when the enclosing group already announced its time, and is hidden from the accessibility tree there rather than read twice.',
      'The delivery glyph is an icon, so the status is always accompanied by its translated word for anything that is not looking at the screen.',
    ],
  },
  motion: {
    description: 'The status glyph swaps without a transition. A check that faded in would suggest the delivery itself was still in progress.',
  },
};
