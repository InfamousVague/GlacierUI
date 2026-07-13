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
    { name: 'orientation', type: 'enum', values: ['horizontal', 'vertical'], default: 'horizontal', description: 'Vertical stands the rail up and fills bottom-to-top; set the length with the --slider-length custom property.' },
    { name: 'hapticStep', type: 'number', default: 10, description: 'Percent of the min-max range between haptic ticks: a selection tick fires when the value crosses a bucket boundary during drags or arrow keys, and a medium bump fires once on landing at min or max. 0 or less disables the ticks.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Dims the slider and blocks interaction.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
  ],
  defaults: { min: 0, max: 100, step: 1, orientation: 'horizontal', hapticStep: 10, disabled: false, skeleton: false },
  dimensions: {
    height: '1.375rem',
    trackHeight: '0.375rem',
    thumbDiameter: '1.25rem',
    verticalLength: '8rem',
    radius: token('radius-full'),
  },
  states: [
    { name: 'active', description: 'The thumb scales to 1.1 while pressed, springing there on the fast duration.', tokens: { duration: token('duration-fast'), ease: token('ease-spring') } },
    { name: 'haptic', description: 'While the user drags or keys, a selection tick fires each time the value crosses a hapticStep-percent bucket boundary and a medium bump fires once on landing at min or max (re-armed after leaving the edge); data-haptic="none" opts the slider out.', behavioral: true },
    { name: 'focus-visible', description: 'The thumb gains a 3px soft accent halo with a 1px focus ring hugging its outside edge.', tokens: { halo: token('accent-soft'), ring: token('focus-ring') } },
    { name: 'disabled', description: 'Halved opacity and not-allowed cursor.' },
  ],
  // a 3px accent-soft halo around the thumb, edged by a 1px focus-ring line (box-shadow layers at 3px and 4px)
  // the track, fill, and thumb children carry the paint
  paint: {},
  focusRing: { ring: token('focus-ring'), offset: '3px' },
  transition: { duration: token('duration-fast'), ease: token('ease-spring') },
  tokens: [
    'radius-full', 'accent-solid', 'accent-soft', 'segment-track', 'slider-thumb', 'hairline',
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
      'orientation="vertical" sets aria-orientation and fills from the bottom up; Arrow Up/Down still nudge the value.',
    ],
  },
  motion: {
    description: 'The thumb springs to a larger scale on press; respects reduced motion.',
    press: true,
    transition: { speed: 'fast', ease: 'spring' },
  },
};
