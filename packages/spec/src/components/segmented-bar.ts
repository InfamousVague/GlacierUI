import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** Bar thickness steps, exported so the React kit derives its union from here. */
export const segmentedBarSizes = ['sm', 'md'] as const;

/** Slice fill tones, exported so the React kit derives its union from here. */
export const segmentedBarTones = ['accent', 'success', 'warning', 'danger', 'neutral'] as const;

export const segmentedBarSpec: ComponentSpec = {
  name: 'SegmentedBar',
  id: 'segmented-bar',
  category: 'atom',
  status: 'stable',
  summary: 'A single proportional bar split into slices sized by share of the total, for a parts-of-a-whole breakdown.',
  element: 'div',
  anatomy: [
    { name: 'track', description: 'The bar container that clips its slices and paints the empty remainder.', required: true },
    { name: 'slice', description: 'One proportional slice, width set to its share of the total and filled by its tone.' },
  ],
  props: [
    { name: 'data', type: 'node', required: true, description: 'Slices, each a value plus optional tone and label; sized by proportion of the total. Zero-value slices are omitted.' },
    { name: 'size', type: 'enum', values: segmentedBarSizes, default: 'md', description: 'Bar thickness step.' },
    { name: 'rounded', type: 'boolean', default: true, description: 'Rounds the bar ends with a full radius.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'aria-label', type: 'string', description: 'Accessible name for the bar. Falls back to a generated percentage breakdown.' },
  ],
  tones: [
    { name: 'accent', description: 'The brand accent family.', tokens: { background: token('accent-solid') } },
    { name: 'success', description: 'Positive or complete states.', tokens: { background: token('success-solid') } },
    { name: 'warning', description: 'Caution states.', tokens: { background: token('warning-solid') } },
    { name: 'danger', description: 'Errors and low states.', tokens: { background: token('danger-solid') } },
    { name: 'neutral', description: 'Unclassified slices; paints the track color, indistinct from the empty remainder.', tokens: { background: token('segment-track') } },
  ],
  sizes: [
    { name: 'sm', height: '0.375rem' },
    { name: 'md', height: '0.625rem' },
  ],
  defaults: { size: 'md', rounded: true, skeleton: false },
  dimensions: { radius: token('radius-full'), gap: token('hairline') },
  states: [
    { name: 'empty', description: 'The uncovered remainder of the track paints the segment-track color.', tokens: { background: token('segment-track') } },
  ],
  tokens: [
    'hairline', 'radius-full', 'segment-track',
    'accent-solid', 'success-solid', 'warning-solid', 'danger-solid',
  ],
  a11y: {
    role: 'img',
    focusable: false,
    notes: [
      'The whole bar is one img with a text alt; individual slices are decorative.',
      'Pass aria-label to name the bar, or let it fall back to a comma-joined percentage breakdown.',
    ],
  },
};
