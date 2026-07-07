import type { ComponentSpec } from '../schema.ts';
import { toneSpecs, token } from '../vocab.ts';
import type { Tone } from '../vocab.ts';

/** Plot shapes, exported so the React kit derives its union from here. */
export const sparklineVariants = ['line', 'bar'] as const;

/** The tones a Sparkline paints with, a subset of the shared tone list. */
export const sparklineTones = ['accent', 'success', 'warning', 'danger'] as const satisfies readonly Tone[];

export const sparklineSpec: ComponentSpec = {
  name: 'Sparkline',
  id: 'sparkline',
  category: 'atom',
  status: 'stable',
  summary: 'A minimal inline chart: a compact trend line or bar series with no axes, labels, or grid.',
  element: 'svg',
  props: [
    { name: 'data', type: 'number', required: true, description: 'The series to plot; empty or single-point data renders gracefully.' },
    { name: 'variant', type: 'enum', values: sparklineVariants, default: 'line', description: 'line draws a polyline; bar draws evenly spaced columns.' },
    { name: 'width', type: 'number', default: 120, description: 'SVG width in pixels; also the viewBox width.' },
    { name: 'height', type: 'number', default: 32, description: 'SVG height in pixels; also the viewBox height.' },
    { name: 'tone', type: 'enum', values: sparklineTones, default: 'accent', description: 'Semantic color family for the stroke or fill.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'aria-label', type: 'string', default: 'Sparkline', description: 'Accessible name for the chart.' },
  ],
  variants: [
    { name: 'line', description: 'A 2px polyline through the points, round caps and joins.', tokens: { stroke: token('accent-solid') } },
    { name: 'bar', description: 'Evenly spaced filled columns, one per point.', tokens: { fill: token('accent-solid') } },
  ],
  tones: toneSpecs(sparklineTones),
  defaults: { variant: 'line', width: 120, height: 32, tone: 'accent', skeleton: false, 'aria-label': 'Sparkline' },
  dimensions: {
    // Raw SVG geometry, off the token scale: 2px stroke, 2px bar gap, 1px cap inset.
    strokeWidth: '2',
    barGap: '2',
    lineInset: '1',
  },
  tokens: ['accent-solid', 'success-solid', 'warning-solid', 'danger-solid'],
  a11y: {
    role: 'img',
    focusable: false,
    notes: [
      'The series carries no text, so give it an aria-label; it defaults to "Sparkline".',
      'Rendered as role="img" with the aria-label as its accessible name.',
    ],
  },
};
