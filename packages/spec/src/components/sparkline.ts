import type { ComponentSpec } from '../schema.ts';
import { controlSizes, token } from '../vocab.ts';

/** Mark shapes, exported so the React kit derives its union from here. */
export const sparklineShapes = ['line', 'area', 'bars'] as const;

/** Ink tones, exported so the React kit derives its union from here. */
export const sparklineTones = ['accent', 'neutral', 'success', 'warning', 'danger', 'info'] as const;

export const sparklineSpec: ComponentSpec = {
  name: 'Sparkline',
  id: 'sparkline',
  category: 'atom',
  status: 'draft',
  summary:
    'A word-sized trend graphic: a single series drawn as a thin line, a soft-filled area, or micro bars, for table cells, stat tiles, and dense monitoring rows. It carries no axes or labels - the surrounding text does the naming.',
  element: 'span',
  anatomy: [
    { name: 'mark', description: 'The series ink: the line path, filled area, or bar run.', required: true },
    { name: 'baseline', description: 'Optional dashed reference line at a fixed value, e.g. a limit or average.' },
    { name: 'point', description: 'Optional emphasis dot on the final sample, for live feeds.' },
  ],
  props: [
    {
      name: 'data',
      type: 'array',
      required: true,
      item: { type: 'number', description: 'One sample; samples are spaced evenly along the inline axis in array order.' },
      description: 'The series, oldest first. The sparkline renders whatever slice it is given; window the data yourself.',
    },
    { name: 'min', type: 'number', description: 'Fixed lower bound of the value domain. Defaults to the data minimum.' },
    { name: 'max', type: 'number', description: 'Fixed upper bound of the value domain. Defaults to the data maximum. Pin min/max (e.g. 0-100 for percentages) so rows in a column share one scale.' },
    { name: 'baseline', type: 'number', description: 'Draws a dashed reference line at this value when it sits inside the domain.' },
    { name: 'shape', type: 'enum', values: sparklineShapes, default: 'line', description: 'How the series is marked: a thin line, a line over a soft fill, or micro bars.' },
    { name: 'tone', type: 'enum', values: sparklineTones, default: 'accent', description: 'Ink family for the mark.' },
    { name: 'size', type: 'enum', values: controlSizes, default: 'md', description: 'Height step; the width is fluid and follows the container.' },
    { name: 'endPoint', type: 'boolean', default: false, description: 'Marks the newest sample with an emphasis dot.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'aria-label', type: 'string', required: true, description: 'Accessible name; describe the trend, not the pixels (e.g. "CPU, last 5 minutes").' },
  ],
  tones: [
    { name: 'accent', description: 'The brand accent family.', paint: { text: token('accent-solid') }, tokens: { fill: token('accent-soft') } },
    { name: 'neutral', description: 'Low-emphasis gray, for secondary rows.', paint: { text: token('text-subtle') }, tokens: { fill: token('surface-sunken') } },
    { name: 'success', description: 'Positive or healthy trends.', paint: { text: token('success-solid') }, tokens: { fill: token('success-soft') } },
    { name: 'warning', description: 'Caution trends.', paint: { text: token('warning-solid') }, tokens: { fill: token('warning-soft') } },
    { name: 'danger', description: 'Errors and over-limit trends.', paint: { text: token('danger-solid') }, tokens: { fill: token('danger-soft') } },
    { name: 'info', description: 'Neutral-informational series.', paint: { text: token('info-solid') }, tokens: { fill: token('info-soft') } },
  ],
  sizes: [
    { name: 'sm', height: '1rem', thickness: '1.5px' },
    { name: 'md', height: '1.5rem', thickness: '1.5px' },
    { name: 'lg', height: '2.25rem', thickness: '2px' },
  ],
  defaults: { shape: 'line', tone: 'accent', size: 'md', endPoint: false, skeleton: false },
  dimensions: {
    barGap: '1px',
    baselineWidth: '1px',
    pointDiameter: '0.375rem',
  },
  states: [
    { name: 'default', description: 'The mark paints with the tone ink; area and bars fill with the tone soft.' },
    { name: 'empty', description: 'With fewer than two samples the mark is omitted and the box keeps its geometry.', behavioral: true },
    { name: 'skeleton', description: 'A pulse placeholder with the exact height of the chosen size.' },
  ],
  tokens: [
    'accent-solid', 'accent-soft', 'text-subtle', 'surface-sunken',
    'success-solid', 'success-soft', 'warning-solid', 'warning-soft',
    'danger-solid', 'danger-soft', 'info-solid', 'info-soft',
  ],
  a11y: {
    role: 'img',
    focusable: false,
    notes: [
      'The drawing is a single img-role graphic named by the required aria-label; individual samples are not exposed.',
      'A sparkline is an impression, not a reading: pair it with a text value (the StatTile value, a table cell number) that carries the actual figure.',
      'The mark never encodes meaning in color alone - the paired text or a tone-independent shape must carry it too.',
    ],
  },
  motion: {
    description: 'Static by default: new data redraws without animation, so streaming rows never shimmer. No reduced-motion concerns.',
  },
};
