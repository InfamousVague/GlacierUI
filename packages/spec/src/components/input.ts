import type { ComponentSpec } from '../schema.ts';
import { controlSize, controlSizes, token } from '../vocab.ts';

/** Control size steps, exported so the React kit derives its union from here. */
export const inputSizes = controlSizes;

export const inputSpec: ComponentSpec = {
  name: 'Input',
  id: 'input',
  category: 'atom',
  status: 'stable',
  summary: 'A single-line text field in three control sizes, wired to the surrounding Field for id, description, and validity.',
  element: 'input',
  props: [
    { name: 'size', type: 'enum', values: controlSizes, default: 'md', description: 'Control size step.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Dims the field and blocks input (native input attribute).' },
    { name: 'id', type: 'string', description: 'Field id; falls back to the id from the surrounding Field.' },
    { name: 'className', type: 'string', description: 'Extra class names merged onto the input.' },
  ],
  sizes: [
    controlSize('sm', { paddingInline: token('space-3') }),
    controlSize('md', { paddingInline: token('space-4') }),
    controlSize('lg', { paddingInline: token('space-5') }),
  ],
  defaults: { size: 'md', skeleton: false, disabled: false },
  dimensions: { radius: token('radius-lg'), border: token('hairline') },
  states: [
    { name: 'hover', description: 'Border strengthens when not focused or disabled.', tokens: { border: token('border-strong') } },
    { name: 'focus', description: 'Border shifts to the focus ring color with a 3px accent-soft glow.', tokens: { border: token('focus-ring'), ring: token('accent-soft') } },
    { name: 'disabled', description: 'Halved opacity, sunken surface, not-allowed cursor.', tokens: { background: token('surface-sunken') } },
    { name: 'invalid', description: 'aria-invalid recolors the border to danger; on focus the ring turns danger.', tokens: { border: token('danger-border'), ring: token('danger-soft') } },
  ],
  tokens: [
    'hairline', 'border', 'border-strong', 'radius-lg', 'surface', 'surface-sunken', 'text', 'text-subtle',
    'font-sans', 'control-height-sm', 'control-height-md', 'control-height-lg',
    'space-3', 'space-4', 'space-5', 'font-size-xs', 'font-size-sm', 'font-size-md',
    'focus-ring', 'accent-soft', 'danger-border', 'danger-solid', 'danger-soft',
    'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'textbox',
    focusable: true,
    notes: [
      'Reads its id, aria-describedby, and aria-invalid from the surrounding Field when present.',
      'A native disabled input is removed from the tab order.',
    ],
  },
  motion: {
    description: 'Eases border, box-shadow, and background color on state change; respects reduced motion.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
