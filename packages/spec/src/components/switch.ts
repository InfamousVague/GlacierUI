import type { ComponentSpec } from '../schema.ts';
import { compactSizes, token } from '../vocab.ts';

/** Size steps, exported so the React kit derives its union from here. */
export const switchSizes = compactSizes;

export const switchSpec: ComponentSpec = {
  name: 'Switch',
  id: 'switch',
  category: 'atom',
  status: 'stable',
  summary: 'A toggle switch with a sliding thumb, in two sizes, with an optional trailing label.',
  element: 'label',
  anatomy: [
    { name: 'track', description: 'The pill-shaped rail that tints to accent when on.', required: true },
    { name: 'thumb', description: 'The round knob that slides across the track.', required: true },
    { name: 'label', description: 'Optional trailing text.' },
  ],
  props: [
    { name: 'label', type: 'node', description: 'Trailing label rendered beside the track.' },
    { name: 'checked', type: 'boolean', description: 'Controlled on/off state.' },
    { name: 'defaultChecked', type: 'boolean', default: false, description: 'Initial state when uncontrolled.' },
    { name: 'onCheckedChange', type: 'handler', description: 'Fires with the next boolean state on toggle.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Dims the switch and blocks interaction.' },
    { name: 'size', type: 'enum', values: switchSizes, default: 'md', description: 'Compact size step.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'glass', type: 'boolean', default: false, description: 'Renders the frosted glass material instead of a solid surface.' },
  ],
  sizes: [
    { name: 'sm', diameter: '1rem', height: '1.25rem' },
    { name: 'md', diameter: '1.375rem', height: '1.625rem' },
  ],
  defaults: { defaultChecked: false, disabled: false, size: 'md', skeleton: false, glass: false },
  dimensions: {
    radius: token('radius-full'),
    gap: token('space-2'),
    border: token('hairline'),
    trackWidthSm: '2.25rem',
    trackWidthMd: '2.75rem',
    trackPadding: '0.125rem',
  },
  states: [
    { name: 'checked', description: 'Track fills with accent and the thumb slides to the far edge.', paint: { background: token('accent-solid') }, tokens: { track: token('accent-solid') } },
    { name: 'focus-visible', description: 'A 2px accent outline rings the track.', tokens: { ring: token('focus-ring') } },
    { name: 'disabled', description: 'Halved opacity and not-allowed cursor.' },
  ],
  paint: { border: '$border-strong' },
  focusRing: { ring: token('focus-ring'), offset: '2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'space-2', 'font-sans', 'font-size-sm', 'text', 'hairline', 'border-strong', 'border',
    'radius-full', 'surface', 'accent-solid', 'accent-contrast', 'glass-highlight', 'shadow-2',
    'focus-ring', 'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'switch',
    focusable: true,
    keyboard: [{ keys: 'Space', action: 'Toggles the switch.' }],
    notes: [
      'A native checkbox input carries the state and role="switch"; the track and thumb are aria-hidden.',
      'A disabled switch blocks interaction.',
    ],
  },
  motion: {
    description: 'The thumb slides on a snappy spring; the track color eases on toggle. Both respect reduced motion.',
    transition: { spring: 'snappy', speed: 'fast', ease: 'out' },
  },
};
