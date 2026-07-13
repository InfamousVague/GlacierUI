import type { ComponentSpec } from '../schema.ts';
import { controlSize, controlSizes, token } from '../vocab.ts';

export const numberInputSpec: ComponentSpec = {
  name: 'NumberInput',
  id: 'number-input',
  category: 'atom',
  status: 'stable',
  summary: 'A numeric stepper: a minus button, a centered tabular number field, and a plus button in a bordered group.',
  element: 'div',
  anatomy: [
    { name: 'decrement', description: 'The minus step button; disables at min.', required: true },
    { name: 'input', description: 'The centered native number input with tabular figures.', required: true },
    { name: 'increment', description: 'The plus step button; disables at max.', required: true },
  ],
  props: [
    { name: 'value', type: 'number', description: 'Controlled value.' },
    { name: 'defaultValue', type: 'number', default: 0, description: 'Initial value in uncontrolled mode.' },
    { name: 'min', type: 'number', description: 'Lower bound; results clamp to it and decrement disables at it.' },
    { name: 'max', type: 'number', description: 'Upper bound; results clamp to it and increment disables at it.' },
    { name: 'step', type: 'number', default: 1, description: 'Amount added or subtracted per button press.' },
    { name: 'onValueChange', type: 'handler', description: 'Fires with the clamped value on every change.' },
    { name: 'size', type: 'enum', values: controlSizes, default: 'md', description: 'Control size step.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Dims the group and blocks interaction.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'glass', type: 'boolean', default: false, description: 'Renders the frosted glass material instead of a solid surface.' },
    { name: 'aria-label', type: 'string', description: 'Accessible label for the number input.' },
  ],
  sizes: [
    controlSize('sm', { paddingInline: token('space-2') }),
    controlSize('md', { paddingInline: token('space-3') }),
    controlSize('lg', { paddingInline: token('space-4') }),
  ],
  defaults: { defaultValue: 0, step: 1, size: 'md', disabled: false, skeleton: false, glass: false },
  dimensions: { radius: token('radius-lg'), border: token('hairline') },
  states: [
    { name: 'hover', description: 'Border strengthens to border-strong when not focused or disabled.', tokens: { border: token('border-strong') } },
    { name: 'focus-within', description: 'Border switches to the focus ring with a 3px accent-soft bloom.', tokens: { border: token('focus-ring'), ring: token('accent-soft') } },
    { name: 'disabled', description: 'Halved opacity on a sunken surface; both step buttons and the input are blocked.', tokens: { background: token('surface-sunken') } },
    { name: 'at-min', description: 'The decrement button disables when the value reaches min: its glyph dims to the subtle text color and the cursor turns not-allowed.', paint: { text: token('text-subtle') } },
    { name: 'at-max', description: 'The increment button disables when the value reaches max: its glyph dims to the subtle text color and the cursor turns not-allowed.', paint: { text: token('text-subtle') } },
    { name: 'holding', description: 'Pressing and holding a step button steps once, pauses, then auto-repeats on an accelerating interval until release or a bound.', behavioral: true },
    { name: 'haptic', description: 'Every committed step fires a selection tick, whether from a button tap, each hold-repeat step, or ArrowUp/ArrowDown in the field, all riding the existing step amount; a step that clamps at min or max bumps medium once (re-armed after leaving the bound); typed digits are silent and their blur-commit fires one light; data-haptic="none" opts the stepper out.', behavioral: true },
  ],
  // a 3px accent-soft glow hugging the group border, which itself turns focus-ring on :focus-within
  paint: { background: '$surface', text: '$text', border: '$border' },
  focusRing: { ring: token('accent-soft'), offset: '0' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'hairline', 'border', 'border-strong', 'radius-lg', 'surface', 'surface-sunken', 'text', 'text-muted', 'text-subtle',
    'font-sans', 'font-size-xs', 'font-size-sm', 'font-size-md', 'font-size-lg', 'font-size-xl',
    'control-height-sm', 'control-height-md', 'control-height-lg', 'space-2', 'space-3', 'space-4',
    'focus-ring', 'accent-soft', 'hover', 'duration-fast', 'ease-out',
  ],
  a11y: {
    focusable: true,
    keyboard: [
      { keys: 'Up, Down', action: 'Increments or decrements the native number input by step.' },
      { keys: 'Enter, Space', action: 'Activates the focused minus or plus button.' },
    ],
    notes: [
      'The step buttons carry Decrease and Increase aria-labels; their glyphs are aria-hidden.',
      'The input takes aria-label, and inherits id, aria-describedby, and aria-invalid from an enclosing field.',
    ],
  },
  motion: {
    description: 'Border color and box shadow ease on hover and focus; step button backgrounds ease on hover.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
