import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** Why a file was refused, in the order the checks run: type, then size, then count. */
export const fileUploadRejectionReasons = ['type', 'size', 'count'] as const;

/**
 * FileUpload has NO transport policy: it chooses, validates, lists, and
 * removes files, and never uploads anything. Transport belongs to the app.
 *
 * The validation contract: every incoming file (picked or dropped) is checked
 * against `accept` (type), then `maxSize` (size), then `maxFiles` (count).
 * The first failing check wins; failing files are reported to `onReject` with
 * that reason and never enter the file list or the value.
 */
export const fileUploadSpec: ComponentSpec = {
  name: 'FileUpload',
  id: 'file-upload',
  category: 'molecule',
  status: 'draft',
  summary:
    'A dropzone over a native file input that chooses, validates, lists, and removes files - with no transport policy: it never uploads.',
  element: 'div',
  anatomy: [
    {
      name: 'dropzone',
      description:
        'The dashed-border surface wrapping the input; clicking anywhere in it opens the native chooser, and dragging files over it paints the dragging state.',
      required: true,
    },
    {
      name: 'input',
      description:
        'The visually hidden native file input: keyboard focus, the accessible name, the native chooser, and form participation all live here.',
      required: true,
    },
    { name: 'icon', description: 'The decorative upload glyph above the primary line.' },
    { name: 'label', description: 'The localized primary line, overridable through the label prop.', required: true },
    {
      name: 'hint',
      description:
        'The localized supporting line, overridable through the hint prop; a file-count summary joins it when maxFiles is set.',
    },
    { name: 'fileList', description: 'The list of accepted files below the zone; rejected files never appear in it.' },
    {
      name: 'fileRow',
      description: 'One accepted file: a file glyph, the middle-truncated name, the locale-formatted size, and the remove control.',
    },
    { name: 'remove', description: 'The icon button that removes its file from the list and reports the next value.' },
  ],
  props: [
    {
      name: 'accept',
      type: 'string',
      description:
        'Native accept string (extensions, exact types, or type wildcards). Applied to the input AND re-enforced in JS on drop; failures reject with reason type.',
    },
    {
      name: 'maxSize',
      type: 'number',
      description: 'Per-file size cap in bytes; larger files reject with reason size.',
    },
    {
      name: 'maxFiles',
      type: 'number',
      description:
        'Total file cap; files past it reject with reason count. Setting it also shows the count summary in the zone.',
    },
    {
      name: 'multiple',
      type: 'boolean',
      default: false,
      description: 'Allows picking and keeping more than one file. A single-file zone replaces its selection instead of appending.',
    },
    { name: 'disabled', type: 'boolean', default: false, description: 'Blocks the chooser, drops, and removal.' },
    {
      name: 'name',
      type: 'string',
      description: 'Submitted with forms through the real file input when set; the list is mirrored back into the input where the platform allows.',
    },
    {
      name: 'value',
      type: 'array',
      description: 'Controlled selected files.',
      item: { type: 'object', description: 'A platform file handle (the DOM File).' },
    },
    {
      name: 'defaultValue',
      type: 'array',
      description: 'Uncontrolled initial files.',
      item: { type: 'object', description: 'A platform file handle (the DOM File).' },
    },
    { name: 'onFilesChange', type: 'handler', description: 'Called with the next file list after files are added or removed.' },
    {
      name: 'onReject',
      type: 'handler',
      description:
        'Called with every refused file and its reason (type, size, or count). Rejected files never enter the list; surfacing them is app policy.',
    },
    { name: 'label', type: 'string', description: 'Primary line override; defaults to the localized kit string.' },
    { name: 'hint', type: 'string', description: 'Supporting line override; defaults to the localized kit string.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the dropzone geometry.' },
    { name: 'glass', type: 'boolean', default: false, description: 'Uses the frosted glass material for the dropzone surface.' },
    { name: 'id', type: 'string', description: 'Id for the native file input; falls back to the surrounding Field id.' },
    { name: 'aria-label', type: 'string', description: 'Accessible name for the input when no surrounding Field label is present.' },
  ],
  defaults: { multiple: false, disabled: false, skeleton: false, glass: false },
  dimensions: {
    radius: token('radius-lg'),
    gap: token('space-2'),
    border: token('hairline'),
    paddingBlock: token('space-6'),
    paddingInline: token('space-4'),
    listGap: token('space-1'),
    rowRadius: token('radius-md'),
    rowPaddingBlock: token('space-1'),
    rowPaddingInline: token('space-2'),
    rowGap: token('space-2'),
  },
  states: [
    { name: 'hover', description: 'The dashed border strengthens when not disabled or dragging.', paint: { border: token('border-strong') } },
    {
      name: 'focus',
      description: 'Focusing the hidden input paints the focus ring on the zone with an accent-soft halo.',
      paint: { border: token('focus-ring') },
      tokens: { ring: token('accent-soft') },
    },
    {
      name: 'dragging',
      description: 'Files dragged over the zone paint an accent border and an accent-soft wash (data-dragging).',
      paint: { border: token('accent-solid'), background: token('accent-soft') },
    },
    { name: 'invalid', description: 'A surrounding Field error paints a danger border.', paint: { border: token('danger-border') } },
    { name: 'disabled', description: 'The zone dims, uses the sunken surface, and ignores clicks and drops.', tokens: { background: token('surface-sunken') } },
  ],
  focusRing: { ring: token('focus-ring'), offset: '0' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'font-sans',
    'space-1', 'space-2', 'space-4', 'space-6', 'space-10',
    'radius-md', 'radius-lg', 'hairline',
    'border', 'border-strong', 'border-subtle', 'focus-ring', 'danger-border',
    'surface', 'surface-sunken',
    'text', 'text-muted', 'text-subtle',
    'accent-solid', 'accent-soft',
    'glass-regular', 'glass-border', 'glass-highlight', 'glass-saturate', 'blur-sm',
    'font-size-xs', 'font-size-sm', 'leading-sm',
    'duration-fast', 'ease-out',
  ],
  a11y: {
    focusable: true,
    keyboard: [
      { keys: 'Tab', action: 'Moves focus to the visually hidden native file input; the zone paints the focus ring.' },
      { keys: 'Enter, Space', action: 'Opens the native file chooser through the focused input.' },
    ],
    notes: [
      'The dropzone is a label wrapping a real input[type=file], so pointer users can click anywhere in the zone and assistive tech gets the native chooser.',
      'Drag-and-drop is a progressive enhancement over the input; every capability remains reachable without it.',
      'Reads id, aria-describedby, and aria-invalid from a surrounding Field when present; use aria-label otherwise.',
      'Each remove control carries a localized per-file accessible name; file sizes are formatted with the active locale.',
      'No transport policy: the component never uploads, so there is no progress or failure state to announce - that belongs to the app.',
    ],
  },
  motion: {
    description: 'The drag-over border and wash cross-fade at the fast duration; the transition is removed under reduced motion.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
