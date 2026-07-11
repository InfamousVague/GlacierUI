import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** Character sets the code accepts. Exported so React derives its union. */
export const otpFieldTypes = ['numeric', 'alphanumeric'] as const;

export const otpFieldSpec: ComponentSpec = {
  name: 'OtpField',
  id: 'otp-field',
  category: 'atom',
  status: 'stable',
  summary:
    'A one-time passcode entry: a row of character cells driven by one invisible native input, so typing, paste, and platform code autofill behave natively while the caret blinks in the next empty cell.',
  element: 'div',
  anatomy: [
    { name: 'input', description: 'The real text input stretched invisibly across the cells; it owns focus, editing, and autocomplete="one-time-code".', required: true },
    { name: 'cells', description: 'The visual row of code cells, pinned left-to-right in every locale and hidden from assistive tech.', required: true },
    { name: 'cell', description: 'One character box; the active cell carries the focus ring.', required: true },
    { name: 'caret', description: 'A blinking bar in the next empty cell while the field has focus.' },
    { name: 'separator', description: 'A short dash between digit groups when groupSize is set.' },
  ],
  props: [
    { name: 'length', type: 'number', default: 6, description: 'Number of code characters.' },
    { name: 'value', type: 'string', description: 'Controlled code value.' },
    { name: 'defaultValue', type: 'string', description: 'Initial value when uncontrolled.' },
    { name: 'onValueChange', type: 'handler', description: 'Called with the sanitized code on every change.' },
    { name: 'onComplete', type: 'handler', description: 'Called with the full code when the last cell fills.' },
    { name: 'type', type: 'enum', values: otpFieldTypes, default: 'numeric', description: 'Which characters the code accepts; everything else is stripped on entry.' },
    { name: 'masked', type: 'boolean', default: false, description: 'Renders dots instead of the entered characters.' },
    { name: 'groupSize', type: 'number', description: 'Draws a separator dash after every N cells, e.g. 3 for a 123-456 code.' },
    { name: 'size', type: 'enum', values: ['sm', 'md', 'lg'], default: 'md', description: 'Cell size step.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Blocks input and dims the cells.' },
    { name: 'error', type: 'boolean', default: false, description: 'Paints the invalid treatment and sets aria-invalid on the input.' },
    { name: 'autoFocus', type: 'boolean', default: false, description: 'Focuses the field on mount.' },
    { name: 'glass', type: 'boolean', default: false, description: 'Renders the frosted glass material instead of a solid surface.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders placeholders with the exact cell geometry.' },
    { name: 'aria-label', type: 'string', description: 'Accessible name for the input; defaults to the localized "One-time code".' },
  ],
  sizes: [
    { name: 'sm', height: token('control-height-sm'), fontSize: token('font-size-sm'), gap: token('space-2'), radius: token('radius-md') },
    { name: 'md', height: token('control-height-md'), fontSize: token('font-size-md'), gap: token('space-2'), radius: token('radius-md') },
    { name: 'lg', height: token('control-height-lg'), fontSize: token('font-size-lg'), gap: token('space-2'), radius: token('radius-md') },
  ],
  defaults: {
    length: 6,
    type: 'numeric',
    masked: false,
    size: 'md',
    disabled: false,
    error: false,
    autoFocus: false,
    glass: false,
    skeleton: false,
  },
  dimensions: { border: token('hairline') },
  states: [
    { name: 'hover', description: 'Hovering the field strengthens the border of every inactive cell.', paint: { border: token('border-strong') } },
    {
      name: 'focus',
      description: 'While the real input has focus, the active cell (the next empty one) takes the focus-ring border with a 3px accent-soft glow.',
      tokens: { border: token('focus-ring'), ring: token('accent-soft') },
    },
    { name: 'disabled', description: 'Cells drop to half opacity on the sunken surface; the input blocks entry with a not-allowed cursor.', paint: { background: token('surface-sunken') } },
    {
      name: 'error',
      description: 'Every cell border turns danger; the active cell deepens to danger-solid with a 3px danger-soft glow, mirroring the Input aria-invalid treatment.',
      paint: { border: token('danger-border') },
      tokens: { 'active-border': token('danger-solid'), 'active-ring': token('danger-soft') },
    },
  ],
  // a 3px accent-soft glow hugging the active cell border, which itself turns focus-ring
  focusRing: { ring: token('accent-soft'), offset: '0' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'surface', 'surface-sunken', 'border', 'border-strong', 'hairline', 'radius-md', 'radius-full',
    'space-2', 'font-mono', 'font-size-sm', 'font-size-md', 'font-size-lg',
    'control-height-sm', 'control-height-md', 'control-height-lg',
    'text', 'focus-ring', 'accent-soft', 'danger-border', 'danger-solid', 'danger-soft',
    'glass-regular', 'glass-border', 'blur-sm', 'glass-saturate', 'glass-highlight',
    'duration-fast', 'ease-out',
  ],
  a11y: {
    focusable: true,
    notes: [
      'One real text input carries focus, editing, and autocomplete="one-time-code", so SMS and password-manager code autofill work natively.',
      'The visual cells are aria-hidden presentation; the input value is the single source of truth.',
      'The input is named by aria-label, defaulting to the localized "One-time code"; error mirrors into aria-invalid.',
      'The cell row is pinned dir="ltr" because codes read left to right in every locale.',
    ],
  },
  motion: {
    description: 'The caret blinks in the next empty cell; the blink is disabled under reduced motion.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
