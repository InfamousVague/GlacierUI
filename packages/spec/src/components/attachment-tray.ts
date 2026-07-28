import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/**
 * The life of one pending attachment.
 *
 * `pending` is queued but not yet started, `uploading` is in flight with a
 * progress fraction, `complete` has landed, `failed` can be retried, and
 * `canceled` was pulled by the user. The legal moves between them live in
 * `advanceAttachment` (@glacier/logic) rather than being re-derived per
 * binding.
 */
export const composeAttachmentStatuses = ['pending', 'uploading', 'complete', 'failed', 'canceled'] as const;

export const attachmentTraySpec: ComponentSpec = {
  name: 'AttachmentTray',
  id: 'attachment-tray',
  category: 'molecule',
  status: 'draft',
  summary:
    'The row of pending attachments above a compose bar: one chip per file, each with its own progress and its own cancel.',
  element: 'ul',
  anatomy: [
    { name: 'tray', description: 'The scrolling row the chips sit in. It renders nothing at all when there are no attachments, so an empty composer has no empty shelf above it.', required: true },
    { name: 'chip', description: 'One AttachmentChip per file.', required: true },
  ],
  props: [
    {
      name: 'attachments',
      type: 'array',
      required: true,
      description: 'The pending attachments, in the order they were added. Canceled ones are dropped by the owner, not hidden here.',
      item: {
        type: 'object',
        description: 'One pending attachment.',
        fields: [
          { name: 'id', type: 'string', required: true, description: 'Stable identity, also what the handlers report back.' },
          { name: 'name', type: 'string', required: true, description: 'File name shown on the chip, middle-truncated when long.' },
          { name: 'size', type: 'number', description: 'Byte count, formatted in the active locale.' },
          { name: 'status', type: 'enum', values: composeAttachmentStatuses, required: true, description: 'Where in its life the attachment is.' },
          { name: 'progress', type: 'number', description: 'Upload fraction 0..1; only meaningful while uploading.' },
          { name: 'error', type: 'string', description: 'Why it failed, shown in place of the size.' },
        ],
      },
    },
    { name: 'onCancel', type: 'handler', description: 'Called with an id when its chip is dismissed. Cancelling an in-flight upload and dropping a finished one are the same gesture.' },
    { name: 'onRetry', type: 'handler', description: 'Called with an id when a failed chip is activated. Omit it and a failed chip is not clickable.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Dims the tray and blocks cancel and retry.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders placeholder chips with the tray geometry.' },
  ],
  defaults: { disabled: false, skeleton: false },
  dimensions: { gap: token('space-2'), paddingBlock: token('space-2') },
  states: [
    {
      name: 'overflowing',
      description: 'More chips than fit scroll horizontally rather than wrapping into a wall that pushes the input off screen.',
      behavioral: true,
    },
    { name: 'disabled', description: 'Halved opacity; cancel and retry ignore input.' },
  ],
  paint: {},
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: ['space-2', 'duration-fast', 'ease-out'],
  a11y: {
    role: 'list',
    focusable: false,
    notes: [
      'A list, so a reader announces how many files are attached before reading them.',
      'The tray is labelled ("Attachments"); each chip names its own file, so the cancel control is never a bare "Remove".',
    ],
  },
  motion: {
    description: 'Chips enter and leave at the fast duration; the progress fill itself never eases, because a bar that lags its own number reads as a stall.',
    transition: { speed: 'fast', ease: 'out' },
  },
};

export const attachmentChipSpec: ComponentSpec = {
  name: 'AttachmentChip',
  id: 'attachment-chip',
  category: 'atom',
  status: 'draft',
  summary: 'One pending file: a type glyph, its name and size, a progress bar while it uploads, and a cancel.',
  element: 'li',
  anatomy: [
    { name: 'chip', description: 'The surface, sized to its name up to a cap.', required: true },
    { name: 'icon', description: 'A type glyph — image, or a generic document.' },
    { name: 'name', description: 'The file name, middle-truncated so the extension survives.', required: true },
    { name: 'meta', description: 'The locale-formatted byte count, replaced by the error text after a failure.' },
    { name: 'progress', description: 'A ProgressBar under the name while the file is in flight. It is the kit ProgressBar, not a second bar.' },
    { name: 'cancel', description: 'The dismiss control. It cancels an in-flight upload and removes a finished one — one gesture, because to the user both mean "not this file".', required: true },
  ],
  props: [
    { name: 'id', type: 'string', required: true, description: 'Stable identity reported back by the handlers.' },
    { name: 'name', type: 'string', required: true, description: 'File name.' },
    { name: 'size', type: 'number', description: 'Byte count, formatted in the active locale.' },
    { name: 'status', type: 'enum', values: composeAttachmentStatuses, default: 'pending', description: 'Where in its life the attachment is.' },
    { name: 'progress', type: 'number', description: 'Upload fraction 0..1. Omitted while uploading, the bar runs indeterminate.' },
    { name: 'error', type: 'string', description: 'Why it failed; shown in place of the size.' },
    { name: 'onCancel', type: 'handler', description: 'Called with the id when the dismiss control is pressed.' },
    { name: 'onRetry', type: 'handler', description: 'Called with the id when a failed chip is activated.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Dims the chip and blocks its controls.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the chip geometry.' },
  ],
  defaults: { status: 'pending', disabled: false, skeleton: false },
  dimensions: {
    radius: token('radius-md'),
    gap: token('space-2'),
    border: token('hairline'),
    paddingBlock: token('space-1'),
    paddingInline: token('space-2'),
    maxWidth: '14rem',
  },
  states: [
    { name: 'pending', description: 'Queued: the resting surface, no bar yet.', paint: { background: token('surface-sunken'), border: token('border-subtle') } },
    { name: 'uploading', description: 'In flight: the progress bar shows under the name and the chip announces its percentage politely.', tokens: { progress: token('accent-solid') } },
    { name: 'complete', description: 'Landed: the bar is gone and the border settles to the accent edge, so a finished file reads as attached rather than still working.', paint: { border: token('accent-border') } },
    { name: 'failed', description: 'The upload failed: a danger border and the error text where the size was. The chip becomes the retry.', paint: { border: token('danger-border'), text: token('danger-text') } },
    { name: 'canceled', description: 'Pulled by the user. Terminal, and normally removed from the list by its owner rather than rendered.', behavioral: true },
    { name: 'disabled', description: 'Halved opacity; the controls ignore input.' },
  ],
  paint: { background: token('surface-sunken'), text: token('text'), border: token('border-subtle') },
  focusRing: { ring: token('focus-ring'), offset: '2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'surface-sunken', 'border-subtle', 'accent-border', 'accent-solid', 'danger-border', 'danger-text',
    'text', 'text-muted', 'radius-md', 'hairline', 'space-1', 'space-2',
    'font-size-xs', 'focus-ring', 'duration-fast', 'ease-out',
  ],
  a11y: {
    focusable: true,
    keyboard: [
      { keys: 'Tab', action: 'Reaches the chip\'s cancel control; a failed chip also exposes its retry.' },
      { keys: 'Enter, Space', action: 'Activates the focused control.' },
    ],
    notes: [
      'Progress is announced on the chip through aria-live=polite in coarse steps, not on every frame, so a reader is not flooded by a fast upload.',
      'The cancel control names its file, because a row of "Remove" buttons is unusable without sight of the chips.',
      'The rejection vocabulary is FileUpload\'s (type, size, count): a file refused before it ever becomes an attachment never reaches this chip.',
    ],
  },
  motion: {
    description: 'The chip fades and lifts in at the fast duration; the progress fill tracks its value with no easing.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
