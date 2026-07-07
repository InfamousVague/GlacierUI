import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** Tone families, exported so the React kit derives its union from here. */
export const calloutTones = ['note', 'info', 'success', 'warning', 'danger'] as const;

export const calloutSpec: ComponentSpec = {
  name: 'Callout',
  id: 'callout',
  category: 'atom',
  status: 'stable',
  summary: 'A bordered message block in five tones, with an optional leading icon and bold title.',
  element: 'div',
  anatomy: [
    { name: 'icon', description: 'Optional leading glyph, top-aligned with the first line.' },
    { name: 'title', description: 'Optional bold heading above the body.' },
    { name: 'body', description: 'The message content.', required: true },
  ],
  props: [
    { name: 'tone', type: 'enum', values: calloutTones, default: 'note', description: 'Semantic color family.' },
    { name: 'title', type: 'node', description: 'Bold heading above the body.' },
    { name: 'icon', type: 'node', description: 'Leading glyph.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'glass', type: 'boolean', default: false, description: 'Renders the frosted glass material instead of a solid surface.' },
    { name: 'children', type: 'node', description: 'Callout body content.' },
  ],
  tones: [
    { name: 'note', description: 'Neutral, sunken surface, the default.', tokens: { background: token('surface-sunken'), border: token('border-subtle'), title: token('text') } },
    { name: 'info', description: 'Neutral-informational tint.', tokens: { background: token('info-soft'), border: token('info-border'), title: token('info-text') } },
    { name: 'success', description: 'Positive or complete states.', tokens: { background: token('success-soft'), border: token('success-border'), title: token('success-text') } },
    { name: 'warning', description: 'Caution states, rendered as an alert.', tokens: { background: token('warning-soft'), border: token('warning-border'), title: token('warning-text') } },
    { name: 'danger', description: 'Errors and destructive states, rendered as an alert.', tokens: { background: token('danger-soft'), border: token('danger-border'), title: token('danger-text') } },
  ],
  defaults: { tone: 'note', skeleton: false, glass: false },
  dimensions: {
    radius: token('radius-lg'),
    gap: token('space-3'),
    border: token('hairline'),
    paddingInline: token('space-5'),
    paddingBlock: token('space-4'),
    bodyGap: token('space-1'),
    fontSize: token('font-size-sm'),
  },
  tokens: [
    'space-1', 'space-3', 'space-4', 'space-5', 'hairline', 'radius-lg',
    'border-subtle', 'surface-sunken', 'font-sans', 'font-size-sm', 'line-height-normal',
    'font-weight-semibold', 'text', 'text-secondary',
    'info-soft', 'info-border', 'info-text',
    'success-soft', 'success-border', 'success-text',
    'warning-soft', 'warning-border', 'warning-text',
    'danger-soft', 'danger-border', 'danger-text',
  ],
  a11y: {
    role: 'note',
    focusable: false,
    notes: ['A warning or danger callout uses role="alert"; other tones use role="note".'],
  },
};
