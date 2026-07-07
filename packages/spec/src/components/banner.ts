import type { ComponentSpec } from '../schema.ts';
import { toneSpecs, token } from '../vocab.ts';

/** Tone families, exported so the React kit derives its union from here. */
export const bannerTones = ['neutral', 'accent', 'success', 'warning', 'danger', 'info'] as const;

export const bannerSpec: ComponentSpec = {
  name: 'Banner',
  id: 'banner',
  category: 'atom',
  status: 'stable',
  summary:
    'A full-width inline alert strip in every tone, with a leading icon, a message, and trailing action or dismiss controls.',
  element: 'div',
  anatomy: [
    { name: 'icon', description: 'Optional leading glyph, centered with the message.' },
    { name: 'message', description: 'The message content, filling the remaining width.', required: true },
    { name: 'action', description: 'Optional trailing slot for a Button or link.' },
    { name: 'dismiss', description: 'Optional trailing close control, shown when onDismiss is set.' },
  ],
  props: [
    { name: 'tone', type: 'enum', values: [...bannerTones], default: 'info', description: 'Semantic color family.' },
    { name: 'icon', type: 'node', description: 'Leading glyph.' },
    { name: 'action', type: 'node', description: 'Trailing slot for a Button or link.' },
    { name: 'onDismiss', type: 'handler', description: 'When set, renders a trailing close IconButton that calls it.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'children', type: 'node', required: true, description: 'Banner message content.' },
  ],
  tones: toneSpecs(bannerTones),
  defaults: { tone: 'info', skeleton: false },
  dimensions: {
    radius: token('radius-lg'),
    gap: token('space-3'),
    border: token('hairline'),
    paddingInline: token('space-4'),
    paddingBlock: token('space-3'),
    fontSize: token('font-size-sm'),
  },
  states: [
    { name: 'default', description: 'Soft tone surface with a hairline tone border.' },
  ],
  tokens: [
    'space-1', 'space-2', 'space-3', 'space-4', 'hairline', 'radius-lg',
    'font-sans', 'font-size-sm', 'line-height-normal', 'text', 'text-secondary',
    'hover', 'text-muted', 'border-subtle',
    'accent-soft', 'accent-border', 'accent-text',
    'success-soft', 'success-border', 'success-text',
    'warning-soft', 'warning-border', 'warning-text',
    'danger-soft', 'danger-border', 'danger-text',
    'info-soft', 'info-border', 'info-text',
  ],
  a11y: {
    role: 'status',
    focusable: false,
    notes: [
      'A warning or danger banner uses role="alert"; other tones use role="status".',
      'When onDismiss is set, the close control is an IconButton with an accessible label.',
    ],
  },
  motion: {
    description: 'The dismiss control presses; the banner itself does not animate.',
    press: true,
  },
};
