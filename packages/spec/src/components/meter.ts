import type { ComponentSpec } from '../schema.ts';
import { compactSizes, token } from '../vocab.ts';

/** Fill tones, exported so the React kit derives its union from here. */
export const meterTones = ['auto', 'accent', 'success', 'warning', 'danger'] as const;

export const meterSpec: ComponentSpec = {
  name: 'Meter',
  id: 'meter',
  category: 'atom',
  status: 'stable',
  summary: 'A segmented level indicator: discrete pips that fill from the left to show how full or good something currently is.',
  element: 'div',
  anatomy: [{ name: 'segment', description: 'One discrete pip; fills when its index is below the filled count.', required: true }],
  props: [
    { name: 'value', type: 'number', required: true, description: 'Current level, 0 to max.' },
    { name: 'max', type: 'number', description: 'Upper bound. Defaults to the segment count, so value maps 1:1 to segments.' },
    { name: 'segments', type: 'number', default: 4, description: 'Number of discrete segments.' },
    { name: 'tone', type: 'enum', values: meterTones, default: 'auto', description: "Fill color. 'auto' grades by level: bottom third danger, middle warning, top success." },
    { name: 'size', type: 'enum', values: compactSizes, default: 'md', description: 'Compact size step.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'aria-label', type: 'string', description: 'Accessible name for the meter.' },
  ],
  tones: [
    // each tone's paint is the filled-segment fill; empty segments always paint the track
    {
      name: 'auto',
      description: 'Grades by level, so it has no single rest fill: the bottom third paints danger, the middle third warning, the top third success.',
      paint: {},
      tokens: { 'low-background': token('danger-solid'), 'mid-background': token('warning-solid'), 'high-background': token('success-solid') },
    },
    { name: 'accent', description: 'The brand accent family.', paint: { background: token('accent-solid') } },
    { name: 'success', description: 'Positive or complete states.', paint: { background: token('success-solid') } },
    { name: 'warning', description: 'Caution states.', paint: { background: token('warning-solid') } },
    { name: 'danger', description: 'Errors and low states.', paint: { background: token('danger-solid') } },
  ],
  sizes: [
    { name: 'sm', height: '0.25rem' },
    { name: 'md', height: '0.375rem' },
  ],
  defaults: { segments: 4, tone: 'auto', size: 'md', skeleton: false },
  dimensions: { radius: token('radius-full'), gap: token('space-1') },
  states: [
    { name: 'filled', description: 'A segment below the filled count paints with the resolved tone solid.', tokens: { background: token('accent-solid') } },
    { name: 'empty', description: 'A segment at or above the filled count paints the track.', tokens: { background: token('segment-track') } },
  ],
  transition: { duration: token('duration-normal'), ease: token('ease-out') },
  tokens: [
    'space-1', 'radius-full', 'segment-track',
    'accent-solid', 'danger-solid', 'warning-solid', 'success-solid',
    'duration-normal', 'ease-out',
  ],
  a11y: {
    role: 'meter',
    focusable: false,
    notes: [
      'Sets aria-valuemin=0, aria-valuemax to the bound, and aria-valuenow to the clamped value.',
      'Pass aria-label to name the meter.',
    ],
  },
  motion: {
    description: 'Each segment eases its fill color when the level changes; respects reduced motion.',
    transition: { speed: 'normal', ease: 'out' },
  },
};
