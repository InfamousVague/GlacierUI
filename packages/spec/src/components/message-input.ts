import type { ComponentSpec } from '../schema.ts';
import { controlSizes, token } from '../vocab.ts';

/** Size steps, exported so the React kit derives its union from here. */
export const messageInputSizes = controlSizes;

/**
 * What the bare Enter key does.
 *
 * `auto` is the default and the only honest one for a kit that ships to both a
 * desktop browser and a phone: the same component is a keyboard-first composer
 * on one and a thumb-first one on the other, and picking either literal at
 * author time is wrong on the other device. The host resolves it — see
 * `resolveEnterPolicy` in @glacier/logic.
 */
export const composeEnterPolicies = ['send', 'newline', 'auto'] as const;

export const messageInputSpec: ComponentSpec = {
  name: 'MessageInput',
  id: 'message-input',
  category: 'atom',
  status: 'draft',
  summary:
    'The auto-growing multi-line field of a compose bar: it grows with what is typed up to a row cap and then scrolls, resolves what Enter does per platform, and turns pasted files into attachments.',
  element: 'textarea',
  anatomy: [
    {
      name: 'field',
      description:
        'The textarea itself. This is @glacier/react\'s Textarea atom with resize and the fixed min-height taken off it, not a second field: the paint, the focus ring, and the invalid state are Textarea\'s.',
      required: true,
    },
  ],
  props: [
    { name: 'value', type: 'string', description: 'Controlled text.' },
    { name: 'defaultValue', type: 'string', default: '', description: 'Initial text when uncontrolled.' },
    { name: 'onValueChange', type: 'handler', description: 'Called with the next text on every edit.' },
    {
      name: 'onSend',
      type: 'handler',
      description:
        'Called with the current text when the resolved Enter policy says send, or on Cmd/Ctrl+Enter. Never fires while an IME composition is open.',
    },
    {
      name: 'enterPolicy',
      type: 'enum',
      values: composeEnterPolicies,
      default: 'auto',
      description:
        'What a bare Enter does. auto sends on a fine pointer and inserts a newline on a coarse one, where a send control is the send affordance.',
    },
    { name: 'minRows', type: 'number', default: 1, description: 'Rows the field is tall before anything is typed.' },
    {
      name: 'maxRows',
      type: 'number',
      default: 6,
      description: 'Rows the field may grow to before it stops growing and scrolls its own content.',
    },
    { name: 'size', type: 'enum', values: controlSizes, default: 'md', description: 'Size step; forwarded to the Textarea.' },
    { name: 'placeholder', type: 'string', description: 'Placeholder text.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Blocks typing, sending, and pasting.' },
    {
      name: 'onPasteFiles',
      type: 'handler',
      description:
        'Called with the files on the clipboard when a paste carries any. The paste is swallowed so a screenshot does not also drop its filename into the text.',
    },
    {
      name: 'onCaretChange',
      type: 'handler',
      description: 'Called with the caret offset after every edit or selection move, so a mention popup knows where the caret is.',
    },
    { name: 'onKeyDown', type: 'handler', description: 'Runs before the key policy, so a caller can intercept a key an open popup owns.' },
    { name: 'aria-label', type: 'string', description: 'Accessible name when no surrounding Field labels the input.' },
  ],
  defaults: { defaultValue: '', enterPolicy: 'auto', minRows: 1, maxRows: 6, size: 'md', disabled: false },
  sizes: [
    { name: 'sm', paddingBlock: token('space-2'), paddingInline: token('space-3'), fontSize: token('font-size-xs') },
    { name: 'md', paddingBlock: token('space-2'), paddingInline: token('space-3'), fontSize: token('font-size-sm') },
    { name: 'lg', paddingBlock: token('space-3'), paddingInline: token('space-4'), fontSize: token('font-size-md') },
  ],
  dimensions: { radius: token('radius-lg'), border: token('hairline'), lineHeight: token('leading-md') },
  states: [
    { name: 'hover', description: 'Border strengthens when not focused or disabled.', paint: { border: token('border-strong') } },
    {
      name: 'focus',
      description: 'Border shifts to the focus ring colour with an accent-soft glow, exactly as Textarea paints it.',
      paint: { border: token('focus-ring') },
      tokens: { ring: token('accent-soft') },
    },
    {
      name: 'scrolling',
      description:
        'Past maxRows the field stops growing and scrolls. Nothing repaints; the height simply stops changing, which is the signal.',
      behavioral: true,
    },
    { name: 'disabled', description: 'Halved opacity over the sunken surface; typing, sending, and pasting are all blocked.', paint: { background: token('surface-sunken') } },
  ],
  paint: { background: token('surface'), text: token('text'), border: token('border') },
  focusRing: { ring: token('accent-soft'), offset: '0' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'surface', 'surface-sunken', 'text', 'text-subtle', 'border', 'border-strong', 'hairline',
    'radius-lg', 'space-2', 'space-3', 'space-4', 'leading-md',
    'font-sans', 'font-size-xs', 'font-size-sm', 'font-size-md',
    'focus-ring', 'accent-soft', 'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'textbox',
    focusable: true,
    keyboard: [
      { keys: 'Enter', action: 'Sends or inserts a newline, whichever the resolved policy says.' },
      { keys: 'Shift+Enter', action: 'Always inserts a newline, on every platform and under every policy.' },
      { keys: 'Cmd/Ctrl+Enter', action: 'Always sends, so a user on a newline-policy field still has a keyboard route to send.' },
    ],
    notes: [
      'The height animates nothing: a field that eased its growth would lag the caret, so it resizes in the same frame as the keystroke.',
      'An open IME composition suppresses send entirely — in Japanese and Chinese the first Enter commits the candidate, and sending on it would truncate the word being written.',
      'The growth cap is expressed in rows rather than pixels so it holds at any font size or density.',
    ],
  },
  motion: {
    description: 'None on the field itself. Only the border and focus glow cross-fade, inherited from Textarea.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
