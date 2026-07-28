import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/**
 * The glyph families a file card shows, mirroring `fileGlyph` in
 * @glacier/logic. Semantic names rather than icon names, so an icon-pack swap
 * is one table in each binding instead of a rename across the kit.
 */
export const fileAttachmentGlyphs = [
  'image', 'video', 'audio', 'pdf', 'document', 'sheet', 'slides', 'archive', 'code', 'text', 'file',
] as const;

export const fileAttachmentSpec: ComponentSpec = {
  name: 'FileAttachment',
  id: 'file-attachment',
  category: 'molecule',
  status: 'draft',
  summary:
    'A document sent in a message: a glyph chosen by type, the file name truncated in the middle so the extension survives, a human-readable size, and a download control that becomes a progress bar while the bytes move.',
  element: 'div',
  anatomy: [
    { name: 'row', description: 'The card: glyph, name and size, action.', required: true },
    { name: 'glyph', description: 'The type icon, decorative — the name already carries the type.', required: true },
    {
      name: 'name',
      description:
        'The file name in two runs: an elastic head that ellipses and a pinned tail that never does, so the extension is always visible.',
      required: true,
    },
    { name: 'meta', description: 'The size, and the transferred-of-total line while a transfer is running.' },
    { name: 'action', description: 'The download control; replaced by a cancel control mid-transfer.' },
    { name: 'progress', description: 'The ProgressBar under the meta line, present only while transferring.' },
  ],
  props: [
    {
      name: 'attachment',
      type: 'object',
      required: true,
      description: 'The ChatAttachment: file name, mime type, and byte size.',
      fields: [
        { name: 'id', type: 'string', required: true, description: 'Stable identity and render key.' },
        { name: 'fileName', type: 'string', description: 'As the user sees it; also the accessible name.' },
        { name: 'mimeType', type: 'string', description: 'Picks the glyph, with the extension as the fallback.' },
        { name: 'byteSize', type: 'number', description: 'Formatted as a decimal-unit size, e.g. 1.2 MB.' },
      ],
    },
    {
      name: 'progress',
      type: 'number',
      description:
        'Transfer progress as a fraction from 0 to 1. Set, the card switches to its in-progress state; omitted, it is at rest. Pass an out-of-range or non-finite value and it clamps rather than painting past the end.',
    },
    { name: 'indeterminate', type: 'boolean', default: false, description: 'A transfer is running but its total is unknown; the bar sweeps instead of filling.' },
    { name: 'onDownload', type: 'handler', description: 'Called when the download control is activated. Omit it and no action is rendered.' },
    { name: 'onCancel', type: 'handler', description: 'Called when a running transfer is cancelled. Omit it and the transfer cannot be stopped from here.' },
    { name: 'href', type: 'string', description: 'Renders the action as a real download link instead of a button, so it survives right-click and long-press.' },
    { name: 'locale', type: 'string', description: 'Formats the size; defaults to the surrounding locale.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the card\'s exact geometry.' },
    { name: 'labels', type: 'object', description: 'Localized strings for the card.', fields: [
      { name: 'file', type: 'string', description: 'Spoken when the attachment has no file name, e.g. "File".' },
      { name: 'download', type: 'string', description: 'The download action, with a {name} slot.' },
      { name: 'cancel', type: 'string', description: 'The cancel action, with a {name} slot.' },
      { name: 'transferring', type: 'string', description: 'The in-progress line, with a {percent} slot.' },
    ] },
  ],
  defaults: { indeterminate: false, skeleton: false },
  dimensions: {
    radius: token('radius-md'),
    gap: token('space-3'),
    border: token('hairline'),
    paddingBlock: token('space-2'),
    paddingInline: token('space-3'),
    glyphSize: token('size-2xl'),
    metaGap: token('space-1'),
  },
  states: [
    {
      name: 'transferring',
      description: 'The size line becomes a percentage and a ProgressBar appears under it. The card keeps its height, so a finishing transfer does not resize the bubble.',
      tokens: { bar: token('accent-solid') },
    },
    { name: 'skeleton', description: 'Glyph, two text lines, and the action each load as their own placeholder, so the card holds the layout it will settle into.' },
  ],
  paint: { background: '$surface-sunken', text: '$text', border: '$border-subtle' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'surface-sunken', 'border-subtle', 'hairline', 'radius-md',
    'space-1', 'space-2', 'space-3', 'size-2xl',
    'text', 'text-muted', 'accent-solid', 'accent-text',
    'font-size-sm', 'font-size-xs', 'duration-fast', 'ease-out',
  ],
  a11y: {
    focusable: false,
    keyboard: [{ keys: 'Tab', action: 'Moves to the download (or cancel) control.' }],
    notes: [
      'The name is middle-truncated for the eye only: the full name is on the element, so a screen reader and a tooltip both read it whole.',
      'The action names the file it acts on ("Download report.pdf"), because a row of identical "Download" buttons is unusable in a forms list.',
      'A running transfer reports its percentage through the ProgressBar\'s value, and the visible percentage text is decorative so it is not announced twice.',
    ],
  },
  motion: {
    description: 'Only the progress fill eases; the card itself never animates its size, since it holds the same box at rest and mid-transfer.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
