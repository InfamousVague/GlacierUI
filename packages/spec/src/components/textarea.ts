import type { ComponentSpec } from '../schema.ts';
import { controlSizes, token } from '../vocab.ts';

/** Size steps, exported so the React kit derives its union from here. */
export const textareaSizes = controlSizes;

export const textareaSpec: ComponentSpec = {
  name: 'Textarea',
  id: 'textarea',
  category: 'atom',
  status: 'stable',
  summary: 'A multi-line text field in three sizes, vertically resizable, wired to the surrounding Field for id, description, and validity.',
  element: 'textarea',
  props: [
    { name: 'size', type: 'enum', values: controlSizes, default: 'md', description: 'Size step; sets inline padding and font size.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Dims the field and blocks input (native textarea attribute).' },
    { name: 'id', type: 'string', description: 'Field id; falls back to the id from the surrounding Field.' },
    { name: 'className', type: 'string', description: 'Extra class names merged onto the textarea.' },
  ],
  sizes: [
    { name: 'sm', paddingBlock: token('space-3'), paddingInline: token('space-3'), fontSize: token('font-size-xs') },
    { name: 'md', paddingBlock: token('space-3'), paddingInline: token('space-4'), fontSize: token('font-size-sm') },
    { name: 'lg', paddingBlock: token('space-3'), paddingInline: token('space-5'), fontSize: token('font-size-md') },
  ],
  defaults: { size: 'md', skeleton: false, disabled: false },
  dimensions: { radius: token('radius-lg'), border: token('hairline'), minHeight: '5rem' },
  states: [
    { name: 'hover', description: 'Border strengthens when not focused or disabled.', tokens: { border: token('border-strong') } },
    { name: 'focus', description: 'Border shifts to the focus ring color with a 3px accent-soft glow.', tokens: { border: token('focus-ring'), ring: token('accent-soft') } },
    { name: 'disabled', description: 'Halved opacity, sunken surface, not-allowed cursor.', tokens: { background: token('surface-sunken') } },
    { name: 'invalid', description: 'aria-invalid recolors the border to danger; on focus the ring turns danger.', tokens: { border: token('danger-border'), ring: token('danger-soft') } },
  ],
  tokens: [
    'hairline', 'border', 'border-strong', 'radius-lg', 'surface', 'surface-sunken', 'text', 'text-subtle',
    'font-sans', 'leading-md', 'font-size-xs', 'font-size-sm', 'font-size-md',
    'space-3', 'space-4', 'space-5',
    'focus-ring', 'accent-soft', 'danger-border', 'danger-solid', 'danger-soft',
    'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'textbox',
    focusable: true,
    notes: [
      'Reads its id, aria-describedby, and aria-invalid from the surrounding Field when present.',
      'Resizes vertically only; a native disabled textarea is removed from the tab order.',
    ],
  },
  motion: {
    description: 'Eases border, box-shadow, and background color on state change; respects reduced motion.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
