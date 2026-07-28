import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** How the bar packs itself; the same three words the player card uses. */
export const composeBarDensities = ['compact', 'comfortable', 'spacious'] as const;

/**
 * Why send is unavailable, or that it is available.
 *
 * The bar never simply greys the control out: each blocked reason has a
 * different fix, so the reason is carried through to the label rather than
 * collapsed into a boolean. Resolved by `canSendCompose` in @glacier/logic.
 */
export const composeBlockReasons = ['empty', 'uploading', 'over-limit', 'sending', 'disabled'] as const;

export const composeBarSpec: ComponentSpec = {
  name: 'ComposeBar',
  id: 'compose-bar',
  category: 'organism',
  status: 'draft',
  summary:
    'The message composer: a context banner and attachment tray above, the auto-growing input in the middle, and the attach, voice, and send controls on the trailing edge.',
  element: 'form',
  anatomy: [
    { name: 'bar', description: 'The surface everything sits on, pinned to the bottom of a conversation.', required: true },
    { name: 'banner', description: 'The ComposeContextBanner, when replying, editing, or forwarding.' },
    { name: 'tray', description: 'The AttachmentTray, when there are pending files. Absent, not empty, when there are none.' },
    { name: 'input', description: 'The MessageInput.', required: true },
    { name: 'leading', description: 'Controls before the input — attach, and anything the app adds.' },
    { name: 'trailing', description: 'Controls after it: the character counter, the voice recorder, and the send control.', required: true },
    { name: 'send', description: 'The SendButton, the one solid control on the bar.', required: true },
    { name: 'popup', description: 'The MentionAutocomplete, floating above the input while a token is being typed.' },
  ],
  props: [
    { name: 'value', type: 'string', description: 'Controlled message text.' },
    { name: 'defaultValue', type: 'string', default: '', description: 'Initial text when uncontrolled.' },
    { name: 'onValueChange', type: 'handler', description: 'Called with the next text on every edit.' },
    {
      name: 'onSend',
      type: 'handler',
      description:
        'Called with the trimmed text and the attachments when send is allowed. The bar never clears itself: the owner clears the value once the send has actually landed, so a failed send does not lose the message.',
    },
    {
      name: 'attachments',
      type: 'array',
      description: 'Pending attachments, rendered in the tray. Their upload is the app\'s: the bar shows progress, it does not transport.',
      item: { type: 'object', description: 'A ComposeAttachment (id, name, size, status, progress, error).' },
    },
    { name: 'onAttachmentCancel', type: 'handler', description: 'Called with an id when its chip is dismissed.' },
    { name: 'onAttachmentRetry', type: 'handler', description: 'Called with an id when a failed chip is retried.' },
    { name: 'onFiles', type: 'handler', description: 'Called with files added by the attach control, a drop, or a paste. Turning them into attachments is the app\'s job.' },
    { name: 'accept', type: 'string', description: 'Native accept string for the attach control, applied to picks, drops, and pastes alike.' },
    { name: 'maxSize', type: 'number', description: 'Per-file byte cap; larger files are refused with FileUpload\'s size reason.' },
    { name: 'maxFiles', type: 'number', description: 'Cap on pending attachments; files past it are refused with FileUpload\'s count reason.' },
    { name: 'onReject', type: 'handler', description: 'Called with every refused file and its reason (type, size, count) — the same vocabulary FileUpload rejects with.' },
    { name: 'context', type: 'object', description: 'The reply/edit/forward context; renders the banner when set.', fields: [
      { name: 'mode', type: 'enum', values: ['reply', 'edit', 'forward'], required: true, description: 'Which context this is.' },
      { name: 'author', type: 'node', description: 'Who the referenced message is from.' },
      { name: 'preview', type: 'node', description: 'One clamped line of the referenced message.' },
      { name: 'count', type: 'number', description: 'How many messages are being forwarded.' },
    ] },
    { name: 'onContextDismiss', type: 'handler', description: 'Called when the banner is dismissed or Escape is pressed with a context open.' },
    { name: 'limit', type: 'number', description: 'Character cap. Sets the counter and blocks send while the message is over it.' },
    { name: 'sending', type: 'boolean', default: false, description: 'A send is in flight: the control spins and the bar refuses a second send.' },
    { name: 'failed', type: 'boolean', default: false, description: 'The last send failed: the control turns danger and becomes the retry.' },
    { name: 'mentions', type: 'array', description: 'Candidates for the @-popup.', item: { type: 'object', description: 'A mention candidate (id, label, keywords, group).' } },
    { name: 'commands', type: 'array', description: 'Candidates for the /-popup, matched by the same matcher.', item: { type: 'object', description: 'A command candidate (id, label, keywords, group).' } },
    { name: 'onVoice', type: 'handler', description: 'Called with the recorded seconds when a voice take is sent. Omit it and the recorder is not rendered.' },
    { name: 'voiceMeter', type: 'handler', description: 'Loudness reader handed to the recorder; the host owns the microphone.' },
    { name: 'enterPolicy', type: 'enum', values: ['send', 'newline', 'auto'], default: 'auto', description: 'Forwarded to the input.' },
    { name: 'density', type: 'enum', values: composeBarDensities, default: 'comfortable', description: 'How tightly the bar is packed.' },
    { name: 'minRows', type: 'number', default: 1, description: 'Forwarded to the input.' },
    { name: 'maxRows', type: 'number', default: 6, description: 'Forwarded to the input.' },
    { name: 'placeholder', type: 'string', description: 'Input placeholder.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Blocks the whole bar.' },
    { name: 'glass', type: 'boolean', default: false, description: 'Renders the frosted glass material, for a bar floating over a conversation.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the bar\'s exact geometry.' },
  ],
  defaults: {
    defaultValue: '', sending: false, failed: false, enterPolicy: 'auto', density: 'comfortable',
    minRows: 1, maxRows: 6, disabled: false, glass: false, skeleton: false,
  },
  dimensions: {
    gap: token('space-2'),
    radius: token('radius-xl'),
    border: token('hairline'),
    paddingBlock: token('space-2'),
    paddingInline: token('space-2'),
    stackGap: token('space-2'),
  },
  states: [
    {
      name: 'focus-within',
      description: 'Focus anywhere inside lifts the bar\'s border to the focus ring, so the whole composer reads as active rather than just the field inside it.',
      paint: { border: token('focus-ring') },
    },
    {
      name: 'dragging',
      description: 'Files dragged over the bar paint an accent border and an accent-soft wash — the same signal FileUpload gives, because it is the same gesture.',
      paint: { border: token('accent-solid'), background: token('accent-soft') },
    },
    { name: 'sending', description: 'A send is in flight: the send control spins and the bar refuses a second send, but the field stays editable so the next message can be started.', behavioral: true },
    { name: 'disabled', description: 'Halved opacity; every control ignores input.' },
  ],
  paint: { background: token('surface'), text: token('text'), border: token('border') },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'surface', 'surface-raised', 'text', 'border', 'hairline', 'radius-xl',
    'space-1', 'space-2', 'space-3', 'focus-ring', 'accent-solid', 'accent-soft',
    'glass-regular', 'glass-border', 'glass-highlight', 'glass-saturate', 'blur-sm',
    'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'form',
    focusable: false,
    keyboard: [
      { keys: 'Enter', action: 'Sends or writes a newline, per the resolved policy; a mention popup takes it first to complete the token.' },
      { keys: 'Shift+Enter', action: 'Always a newline.' },
      { keys: 'Cmd/Ctrl+Enter', action: 'Always sends.' },
      { keys: 'Escape', action: 'Closes the mention popup; with no popup open, dismisses the reply/edit/forward context.' },
      { keys: 'Tab', action: 'Moves through the banner dismiss, the tray chips, the input, and the trailing controls in reading order.' },
    ],
    notes: [
      'A form region with an accessible name, so a reader can jump to the composer and knows what the controls belong to.',
      'The send affordance is never removed, only refused — see SendButton: on touch, where Enter writes a newline, it is the only way to send.',
      'Send is refused, not hidden, and the reason travels to the control\'s label: nothing typed, an upload still running, over the limit, or a send already in flight all read differently.',
      'The bar never clears its own value. Clearing on send would lose the message when the send fails, which is exactly when the text matters most.',
    ],
  },
  motion: {
    description:
      'The bar\'s own height changes as the input grows and the banner and tray appear; those changes are not eased, so the caret never lags the text. Only paint transitions.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
