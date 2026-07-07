import type { ComponentSpec } from '../schema.ts';
import { controlSize, controlSizes, token } from '../vocab.ts';

export const toggleSpec: ComponentSpec = {
  name: 'Toggle',
  id: 'toggle',
  category: 'atom',
  status: 'stable',
  summary: 'A press-state button (aria-pressed) for stateful actions, tinting to accent soft when pressed.',
  element: 'button',
  anatomy: [{ name: 'label', description: 'The toggle text or icon content.', required: true }],
  props: [
    { name: 'pressed', type: 'boolean', description: 'Controlled pressed state.' },
    { name: 'defaultPressed', type: 'boolean', default: false, description: 'Initial pressed state when uncontrolled.' },
    { name: 'onPressedChange', type: 'handler', description: 'Fires with the next pressed value on toggle.' },
    { name: 'size', type: 'enum', values: controlSizes, default: 'md', description: 'Control size step.' },
    { name: 'iconOnly', type: 'boolean', default: false, description: 'Square icon-only layout, like IconButton.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'disabled', type: 'boolean', description: 'Dims the toggle and blocks interaction.' },
    { name: 'aria-label', type: 'string', description: 'Required when the content is icon-only.' },
    { name: 'children', type: 'node', description: 'Toggle label or icon content.' },
  ],
  sizes: [
    controlSize('sm', { paddingInline: token('space-3') }),
    controlSize('md', { paddingInline: token('space-4') }),
    controlSize('lg', { paddingInline: token('space-5') }),
  ],
  defaults: { defaultPressed: false, size: 'md', iconOnly: false, skeleton: false },
  dimensions: { radius: token('control-radius'), gap: token('space-2'), border: token('hairline') },
  states: [
    { name: 'hover', description: 'Unpressed lifts to the hover background and full-strength text.', tokens: { background: token('hover'), text: token('text') } },
    { name: 'pressed', description: 'aria-pressed=true paints accent soft with an accent border and text.', tokens: { background: token('accent-soft'), border: token('accent-border'), text: token('accent-text') } },
    { name: 'pressed-hover', description: 'A pressed toggle deepens to the accent soft hover fill.', tokens: { background: token('accent-soft-hover') } },
    { name: 'focus-visible', description: 'A 2px accent focus ring blooms outward.', tokens: { ring: token('focus-ring') } },
    { name: 'disabled', description: 'Halved opacity and not-allowed cursor.' },
  ],
  tokens: [
    'space-2', 'space-3', 'space-4', 'space-5', 'control-height-sm', 'control-height-md', 'control-height-lg',
    'control-radius', 'hairline', 'font-sans', 'font-weight-medium', 'font-size-xs', 'font-size-sm', 'font-size-md',
    'text-muted', 'text', 'hover', 'accent-soft', 'accent-soft-hover', 'accent-border', 'accent-text', 'focus-ring',
    'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'button',
    focusable: true,
    keyboard: [{ keys: 'Enter, Space', action: 'Toggles the pressed state.' }],
    notes: [
      'Sets aria-pressed to the current pressed state.',
      'Icon-only toggles need an aria-label for their accessible name.',
    ],
  },
  motion: {
    description: 'Presses inward on tap and eases its colors on hover; both respect reduced motion.',
    press: true,
    transition: { speed: 'fast', ease: 'out' },
  },
};
