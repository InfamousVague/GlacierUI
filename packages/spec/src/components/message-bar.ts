import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/**
 * Which chord sends.
 *
 * Transcribed from `composerSubmitModes` in `@glacier/logic`, which cannot be
 * imported here without making the spec depend on the package that already
 * depends on it - the same arrangement `messageDeliveryStatuses` is under. A
 * test asserts the two lists are identical, so the duplication is checked
 * rather than trusted.
 */
export const composerSubmitModes = ['enter', 'modifier'] as const;

/** What a character is, for the purpose of a limit; mirrors `draftCountModes`. */
export const draftCountModes = ['graphemes', 'codePoints', 'utf16'] as const;

/** How a draft stands against its limit; mirrors `draftMeterStates`. */
export const draftMeterStates = ['idle', 'near', 'over'] as const;

/**
 * The two slot idioms, stated once so the next component does not invent a
 * third.
 *
 * A slot that appears ONCE takes a node (`attach`, `actions`) - the caller
 * knows everything needed to build it before render. A slot that appears PER
 * ITEM, or that needs facts only this component holds, takes a
 * `render*(context)` handler (`renderSend`, `renderAttachment`) - the send
 * control cannot be a node, because a replacement has to receive the live
 * sendability or it will be a button that looks enabled over an empty draft.
 * This is already the house idiom: MessageBubble's `reactions` is a node and
 * MessageGroup's `renderReactions` is a handler, for exactly this reason.
 */
export const messageBarSpec: ComponentSpec = {
  name: 'MessageBar',
  id: 'message-bar',
  category: 'molecule',
  status: 'draft',
  summary:
    'The composer at the foot of a thread: an auto-growing field, a send control that is live exactly when the draft can go out, and the staged attachments, quoted reply, edit mode, and character budget that surround it.',
  element: 'div',
  anatomy: [
    { name: 'bar', description: 'The frame. It carries the border, the surface, the corner, and - because the frame is what a user perceives as the control - the focus ring, drawn on focus-within rather than on the field inside it.', required: true },
    { name: 'banner', description: 'The strip above the field that says what this draft is: a quoted reply, or a message being edited. Present only in those modes, and dismissible only when the caller wired a cancel handler.' },
    { name: 'tray', description: 'The staged attachments, above the field. A controlled list, so the chip in the tray and the block in the sent bubble are drawn by one caller function.' },
    { name: 'field', description: 'The textarea itself: borderless and unpainted, because the frame owns the surface. A bare element rather than the Textarea atom, which brings its own border, ring, and Field wiring.', required: true },
    {
      name: 'grower',
      description:
        'How the field reaches its height, and the one place the two bindings genuinely diverge. The DOM stacks a hidden twin carrying the same text under the same typography and lets the grid take the taller of the two, so the height is CSS rather than a measurement on every keystroke; React Native has no twin and reaches the same height through onContentSizeChange. Both are clamped by the same minRows and maxRows.',
    },
    { name: 'attach', description: 'The leading slot, for an attachment or media control.' },
    { name: 'actions', description: 'The trailing slot before the send control, for anything the app adds.' },
    { name: 'send', description: 'The send control. Replaceable through renderSend, which hands over the live sendability so a custom control stays exactly as correct as the default one.', required: true },
    { name: 'meter', description: 'The character counter, drawn only once the budget starts to matter.' },
    { name: 'hint', description: 'The submit-policy line. Always present for a screen reader; visible only when asked for.' },
    { name: 'typing', description: 'The typing row under the bar, rendered by TypingIndicator.' },
  ],
  props: [
    { name: 'value', type: 'string', description: 'The draft, controlled.' },
    { name: 'defaultValue', type: 'string', description: 'The initial draft when the bar owns its own state.' },
    { name: 'onValueChange', type: 'handler', description: 'Called with the next draft on every edit.' },
    { name: 'onSend', type: 'handler', description: 'Called with a ComposerSubmission: the trimmed text, the staged attachments, and the replyToId and editingId that were in force. One object rather than a bare string, because reading the reply target out of app state after the callback fires is the race that answers the wrong message.' },
    { name: 'submitMode', type: 'enum', values: composerSubmitModes, default: 'enter', description: 'Which chord sends. Fixed rather than derived from the pointer type: a send that resolves from the environment cannot be tested, and mis-resolves on a touchscreen laptop. Callers who want the pointer answer pass `composerSubmitModeFor`.' },
    { name: 'placeholder', type: 'string', description: 'Empty-field prompt; defaults to the translated kit string.' },
    { name: 'minRows', type: 'number', default: 1, description: 'Rows the empty field shows. One for a chat bar; three for a review or support box, whose height is an invitation to write more than a line.' },
    { name: 'maxRows', type: 'number', default: 6, description: 'Rows the field grows to before it scrolls, so a long draft never pushes the transcript off the screen.' },
    { name: 'maxLength', type: 'number', description: 'The character budget. Never set as a maxlength attribute: that blocks keystrokes, truncates a paste silently, and cuts an input method off mid-word. The bar counts, refuses to send when over, and lets the text stand.' },
    { name: 'countAs', type: 'enum', values: draftCountModes, default: 'graphemes', description: 'What counts as a character. A flag is one grapheme, two code points, and four UTF-16 units, so the mode has to agree with whatever the server enforces.' },
    { name: 'attachments', type: 'array', description: 'The staged attachments, controlled.', item: { type: 'object', description: 'One ChatAttachment: id, and optionally url, mimeType, fileName, byteSize, width, height, durationMs.' } },
    { name: 'onAttachmentsChange', type: 'handler', description: 'Called with the next staged list after one is added or removed.' },
    { name: 'renderAttachment', type: 'handler', description: 'Draws one staged attachment; receives the attachment and its resolved kind, so a staged voice note and a sent one are called the same thing.' },
    { name: 'replyTo', type: 'object', description: 'The message being answered, resolved by `replyPreview` rather than handed over as markup - so the excerpt, the truncation, and the media word come from one place on both platforms.', fields: [
      { name: 'id', type: 'string', required: true, description: 'Travels with the send as replyToId.' },
      { name: 'authorName', type: 'string', description: 'Who wrote it, already resolved to a display name.' },
      { name: 'text', type: 'string', required: true, description: 'The excerpt, already cut.' },
      { name: 'kind', type: 'string', description: 'image, video, audio, or file, when the quoted message was media.' },
      { name: 'truncated', type: 'boolean', description: 'The excerpt was cut, so the binding can add its own ellipsis.' },
    ] },
    { name: 'onCancelReply', type: 'handler', description: 'Dismisses the reply banner. Its presence is what gives Escape a meaning; without it Escape does nothing.' },
    { name: 'editingId', type: 'string', description: 'The message being rewritten. Travels with the send as editingId.' },
    { name: 'onCancelEdit', type: 'handler', description: 'Leaves edit mode. Like onCancelReply, its presence is what makes Escape mean something.' },
    { name: 'typing', type: 'array', description: 'Who is typing, as display names. Resolved through `typingText` and `formatTyping`, never a pre-joined sentence.', item: { type: 'string', description: 'One typist\'s display name. Blank names are dropped rather than rendered as a gap.' } },
    { name: 'typingMax', type: 'number', default: 2, description: 'How many names the typing row has room for; on overflow one slot goes back to the "and N others" phrase.' },
    { name: 'busy', type: 'boolean', default: false, description: 'A send is already in flight. The field stays editable - the next message is usually seconds away - but the send control stands down.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'A closed thread: nothing is editable and nothing can go out.' },
    { name: 'renderSend', type: 'handler', description: 'Replaces the send control, receiving the live state (text, canSend, busy, disabled, submitMode, the draft meter, and send()). A split send, a mic that becomes a send, a Post button - all stay exactly as correct as the default one, instead of forking the component.' },
    { name: 'attach', type: 'node', description: 'The leading slot, for an attachment or media control.' },
    { name: 'actions', type: 'node', description: 'The trailing slot before the send control.' },
    { name: 'keyboardHint', type: 'boolean', default: false, description: 'Shows the submit-policy line as visible Kbd keys. The screen-reader version is always present regardless, because the person most likely to be surprised by an irreversible invisible keypress is the person who cannot see a tooltip.' },
    { name: 'glass', type: 'boolean', default: false, description: 'The frosted material, for a bar pinned over a scrolling transcript - the one place in the kit where content passes under a control. On the frame, not the field.' },
    { name: 'asForm', type: 'boolean', default: false, description: 'Hosts the bar in a form element. Off by default: implicit submission applies to single-line inputs only, so Enter in a textarea is hand-handled either way, and a nested form is invalid the moment the bar lands inside a page form.' },
    { name: 'inputProps', type: 'object', description: 'Forwarded to the textarea. Its onKeyDown runs first, and a key it has already handled skips the submit policy entirely - which is what lets a mentions or slash-command overlay swallow Enter without this component changing.', fields: [
      { name: 'onKeyDown', type: 'handler', description: 'Runs before the submit policy; call preventDefault to claim the key.' },
    ] },
    { name: 'labels', type: 'object', description: 'Translated strings, merged over the kit catalog.', fields: [
      { name: 'placeholder', type: 'string', description: 'Empty-field prompt.' },
      { name: 'send', type: 'string', description: 'The send control\'s accessible name.' },
      { name: 'attach', type: 'string', description: 'The attach control\'s accessible name.' },
      { name: 'cancelReply', type: 'string', description: 'Dismisses the reply banner.' },
      { name: 'cancelEdit', type: 'string', description: 'Leaves edit mode.' },
    ] },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder at the bar\'s exact geometry.' },
  ],
  defaults: {
    submitMode: 'enter',
    countAs: 'graphemes',
    minRows: 1,
    maxRows: 6,
    typingMax: 2,
    busy: false,
    disabled: false,
    keyboardHint: false,
    glass: false,
    asForm: false,
    skeleton: false,
  },
  dimensions: {
    /**
     * The bubble's own corner, deliberately: the bar should read as the shape
     * the draft is about to become.
     */
    radius: token('radius-xl'),
    paddingInline: token('space-2'),
    paddingBlock: token('space-2'),
    gap: token('space-2'),
    /** Between the banner, the tray, the field row, and the meter. */
    stackGap: token('space-2'),
    border: token('hairline'),
    fieldPaddingInline: token('space-2'),
    fieldPaddingBlock: token('space-1'),
  },
  states: [
    { name: 'default', description: 'An empty draft: the field at its minimum height, the send control standing down, and no counter, banner, or tray.' },
    {
      name: 'focus-within',
      description: 'The ring sits on the frame, not on the textarea, because the frame is what the user perceives as the control - a ring around the inner field with the border still outside it reads as two boxes.',
      tokens: { ring: token('focus-ring') },
    },
    {
      name: 'sendable',
      description: 'The draft has words or an attachment, so the send control takes the accent fill. This is the only paint in the bar that answers a question the user is actually asking.',
      paint: { background: token('accent-solid'), text: token('accent-contrast') },
    },
    {
      name: 'near',
      description: 'The last tenth of the budget. The counter appears in the warning tone - it is deliberately absent until here, because a number that changes on every keystroke is noise on screen and a firehose in a live region.',
      tokens: { text: token('warning-text') },
    },
    {
      name: 'over',
      description: 'Past the limit. The counter turns danger and the send refuses, and the text stands: truncating a paste silently is a worse failure than a message that will not send yet.',
      tokens: { text: token('danger-text') },
    },
    {
      name: 'busy',
      description: 'A send is in flight. The control stands down but the field stays live and keeps focus, because blurring dismisses a mobile keyboard and the next message is seconds away.',
      paint: { text: token('text-subtle') },
    },
    {
      name: 'disabled',
      description: 'A closed thread. Nothing is editable and nothing can go out.',
      paint: { background: token('surface-sunken'), text: token('text-subtle') },
    },
    { name: 'skeleton', description: 'A placeholder at the bar\'s exact footprint, so a loading thread does not jump when the composer arrives.' },
  ],
  paint: { background: token('surface-raised'), text: token('text'), border: token('border') },
  focusRing: { ring: token('focus-ring'), offset: '2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'radius-xl', 'radius-lg', 'radius-md',
    'space-1', 'space-2', 'space-3',
    'surface-raised', 'surface-sunken',
    'glass-regular', 'glass-border', 'glass-highlight', 'glass-saturate', 'blur-sm',
    'accent-solid', 'accent-contrast',
    'border', 'border-subtle', 'hairline',
    'text', 'text-muted', 'text-subtle',
    'warning-text', 'danger-text',
    'font-size-sm', 'font-size-xs', 'leading-sm', 'leading-xs',
    'focus-ring', 'duration-fast', 'ease-out',
  ],
  a11y: {
    focusable: false,
    keyboard: [
      { keys: 'Enter', action: 'Sends in the default mode; opens a line in modifier mode. Never acts while an input method is composing.' },
      { keys: 'Shift + Enter', action: 'Opens a line in the default mode.' },
      { keys: 'Meta / Control + Enter', action: 'Sends in modifier mode.' },
      { keys: 'Alt + Enter', action: 'Always opens a line, in either mode.' },
      { keys: 'Escape', action: 'Leaves reply or edit mode when the caller wired a cancel handler. Never clears the draft: the browser\'s own undo does not reach a controlled value.' },
    ],
    notes: [
      'The submit policy is on `aria-describedby` as a visually-hidden line, always, whether or not the visible hint is shown. Enter here is irreversible and invisible, and the reader least likely to have discovered it by accident is the one who cannot see a keyboard hint.',
      'The bar hosts a div rather than a form by default. Implicit submission applies to single-line inputs, so Enter in a textarea is hand-handled in every case, and the landmark is not worth an invalid nested form the moment the bar is dropped inside a page form. `asForm` is there for callers who want it.',
      'The send control is disabled from the same `composerCanSend` the key handler consults, so a draft of three spaces cannot get two different answers.',
      'Only the counter crossing a threshold is announced. The transcript is already a polite live region that announces an in-flight send and a failure; announcing the same facts here would double-speak them into one queue.',
      'The staged attachments are a labelled list, and each remove control names its file rather than saying "Remove" five times.',
    ],
  },
  motion: {
    description:
      'The field grows without a transition. An eased height would lag the caret behind the character that caused the line to wrap, which is the one thing a composer must never do. The send control keeps the kit\'s press dip; everything else is paint.',
    press: true,
    transition: { speed: 'fast', ease: 'out' },
  },
};

export const typingIndicatorSpec: ComponentSpec = {
  name: 'TypingIndicator',
  id: 'typing-indicator',
  category: 'atom',
  status: 'draft',
  summary:
    'The row that says who is typing, resolved from a list of names through the shared template chooser rather than from a sentence the caller joined.',
  element: 'div',
  anatomy: [
    { name: 'indicator', description: 'The row.', required: true },
    { name: 'dots', description: 'The three animated dots. Decoration: the sentence beside them is the content, and the dots are hidden from the accessibility tree.' },
    { name: 'text', description: 'The sentence, interpolated from the template the name count chose.' },
  ],
  props: [
    { name: 'names', type: 'array', required: true, description: 'Who is typing, as display names. Blank names are dropped rather than rendered as a gap - a typist whose profile has not loaded should shorten the list, not produce " is typing".', item: { type: 'string', description: 'One typist\'s display name.' } },
    { name: 'max', type: 'number', default: 2, description: 'How many names the row has room for. On overflow one slot goes back to the "and N others" phrase, because the summary occupies a slot too.' },
    { name: 'dots', type: 'boolean', default: true, description: 'Draws the animated dots beside the sentence.' },
    { name: 'templates', type: 'object', description: 'Translated sentences, one per shape, merged over the kit catalog. Each may use {names}, {first}, {last}, {count}, and {total}.', fields: [
      { name: 'one', type: 'string', description: 'One typist.' },
      { name: 'two', type: 'string', description: 'Exactly two.' },
      { name: 'several', type: 'string', description: 'More than two, all named.' },
      { name: 'many', type: 'string', description: 'More than the row has room for.' },
    ] },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder at the row\'s exact height.' },
  ],
  defaults: { max: 2, dots: true, skeleton: false },
  dimensions: {
    gap: token('space-2'),
    dotSize: '4px',
    dotGap: token('space-1'),
  },
  states: [
    { name: 'default', description: 'One or more typists: three pulsing dots and the sentence their count chose.', paint: { text: token('text-muted') } },
    { name: 'empty', description: 'Nobody is typing. The row renders nothing at all rather than an empty line, so the composer does not shift by a row every time somebody stops.', behavioral: true },
    { name: 'skeleton', description: 'A placeholder at the row\'s exact height.' },
  ],
  paint: { text: token('text-muted') },
  tokens: ['space-1', 'space-2', 'text-muted', 'text-subtle', 'font-size-xs', 'leading-xs', 'duration-slow', 'ease-in-out'],
  a11y: {
    focusable: false,
    notes: [
      'The row is a polite live region, so a typist appearing is mentioned without cutting off whatever was being read. It is never assertive: somebody starting to type is not an interruption.',
      'The dots are decoration and are hidden from the accessibility tree; the sentence is the whole content.',
      'The sentence comes from a template chosen by the count, never a joined list, because the conjunction, the verb agreement, and the word order all differ by language.',
    ],
  },
  motion: {
    description:
      'The dots pulse in sequence, and stop entirely under reduced motion - the sentence still says who is typing, so nothing is lost with the animation.',
    transition: { speed: 'slow', ease: 'in-out' },
  },
};
