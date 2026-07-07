import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const radioSpec: ComponentSpec = {
  name: 'Radio',
  id: 'radio',
  category: 'atom',
  status: 'stable',
  summary: 'A single radio button with an optional inline label; group by shared name for a one-of-many choice.',
  element: 'label',
  anatomy: [
    { name: 'indicator', description: 'The round dot control: a hairline ring that fills with an accent dot when checked.', required: true },
    { name: 'label', description: 'Optional inline text trailing the indicator.' },
  ],
  props: [
    { name: 'label', type: 'node', description: 'Inline label trailing the indicator.' },
    { name: 'checked', type: 'boolean', description: 'Controlled selected state; when set, the dot pop is animated.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Dims the control and blocks interaction.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'glass', type: 'boolean', default: false, description: 'Renders the frosted glass material instead of a solid surface.' },
  ],
  defaults: { disabled: false, skeleton: false, glass: false },
  dimensions: {
    diameter: '1.375rem',
    dotSize: '0.5rem',
    radius: token('radius-full'),
    gap: token('space-2'),
    border: token('hairline'),
  },
  states: [
    { name: 'checked', description: 'Border shifts to accent and the inner dot scales in.', tokens: { border: token('accent-solid'), dot: token('accent-solid') } },
    { name: 'focus-visible', description: 'A 2px accent focus ring blooms outward from the indicator.', tokens: { ring: token('focus-ring') } },
    { name: 'disabled', description: 'Halved opacity and not-allowed cursor.' },
  ],
  tokens: [
    'space-2', 'font-sans', 'font-size-sm', 'text', 'hairline', 'border-strong', 'surface',
    'radius-full', 'accent-solid', 'focus-ring', 'duration-fast', 'ease-out', 'ease-spring',
  ],
  a11y: {
    role: 'radio',
    focusable: true,
    keyboard: [
      { keys: 'Space', action: 'Selects the focused radio.' },
      { keys: 'Arrow keys', action: 'Moves selection within the shared-name group (native).' },
    ],
    notes: [
      'Wraps a visually hidden native radio input; the label element makes the whole control clickable.',
      'The indicator is aria-hidden; the native input carries the accessible state.',
    ],
  },
  motion: {
    description: 'The inner dot springs in on check and fades out on uncheck; respects reduced motion. Controlled radios animate via Motion, uncontrolled via CSS on the input state.',
    transition: { speed: 'fast', ease: 'spring' },
  },
};
