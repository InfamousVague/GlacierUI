import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const sliderSpec: ComponentSpec = {
  name: 'Slider',
  id: 'slider',
  category: 'atom',
  status: 'stable',
  summary: 'A styled native range input with a filled leading track and an iOS-style thumb.',
  element: 'input',
  anatomy: [
    { name: 'track', description: 'The full-width rail; the leading portion up to the value paints in the accent, the rest in the segment track.' },
    { name: 'thumb', description: 'The round draggable handle.', required: true },
  ],
  props: [
    { name: 'value', type: 'number', description: 'Controlled value.' },
    { name: 'defaultValue', type: 'number', description: 'Initial value when uncontrolled; falls back to min.' },
    { name: 'min', type: 'number', default: 0, description: 'Lower bound.' },
    { name: 'max', type: 'number', default: 100, description: 'Upper bound.' },
    { name: 'step', type: 'number', default: 1, description: 'Increment between stops.' },
    { name: 'onValueChange', type: 'handler', description: 'Called with the new number as the user drags or keys.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Dims the slider and blocks interaction.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
  ],
  defaults: { min: 0, max: 100, step: 1, disabled: false, skeleton: false },
  dimensions: {
    height: '1.375rem',
    trackHeight: '0.375rem',
    thumbDiameter: '1.25rem',
    radius: token('radius-full'),
  },
  states: [
    { name: 'active', description: 'The thumb scales to 1.1 while pressed.' },
    { name: 'focus-visible', description: 'The thumb gains a soft accent halo and focus ring.', tokens: { halo: token('accent-soft'), ring: token('focus-ring') } },
    { name: 'disabled', description: 'Halved opacity and not-allowed cursor.' },
  ],
  tokens: [
    'radius-full', 'accent-solid', 'accent-soft', 'segment-track', 'slider-thumb',
    'glass-highlight', 'shadow-2', 'focus-ring', 'duration-fast', 'ease-spring',
  ],
  a11y: {
    role: 'slider',
    focusable: true,
    keyboard: [
      { keys: 'ArrowLeft, ArrowDown', action: 'Decreases the value by one step.' },
      { keys: 'ArrowRight, ArrowUp', action: 'Increases the value by one step.' },
      { keys: 'Home', action: 'Jumps to min.' },
      { keys: 'End', action: 'Jumps to max.' },
    ],
    notes: [
      'Native range semantics: screen readers announce the value, min, and max.',
      'Reads its id and aria-describedby from a surrounding Field when present.',
    ],
  },
  motion: {
    description: 'The thumb springs to a larger scale on press; respects reduced motion.',
    press: true,
    transition: { speed: 'fast', ease: 'spring' },
  },
};
