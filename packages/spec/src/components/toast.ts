import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** Tone families, exported so the React kit derives its union from here. */
export const toastTones = ['neutral', 'info', 'success', 'warning', 'danger'] as const;

export const toastSpec: ComponentSpec = {
  name: 'Toast',
  id: 'toast',
  category: 'molecule',
  status: 'stable',
  summary:
    'A single-slot, latest-wins notification pill portalled to the bottom center, with an auto-dismiss timer, an optional icon, and a dismiss control.',
  element: 'div',
  anatomy: [
    { name: 'viewport', description: 'The fixed, bottom-center region the provider portals the current toast into.' },
    { name: 'pill', description: 'The rounded surface holding the icon, message, and dismiss control.', required: true },
    { name: 'icon', description: 'Optional leading glyph, vertically centered with the message.' },
    { name: 'message', description: 'The notification text.', required: true },
    { name: 'dismiss', description: 'An optional trailing close control, shown when the toast is dismissible.' },
  ],
  props: [
    { name: 'tone', type: 'enum', values: toastTones, default: 'neutral', description: 'Semantic color family; danger announces as an alert.' },
    { name: 'message', type: 'node', required: true, description: 'The notification content.' },
    { name: 'icon', type: 'node', description: 'Optional leading glyph.' },
    { name: 'duration', type: 'number', description: 'Auto-dismiss delay in milliseconds; defaults by tone, 0 disables auto-dismiss.' },
    { name: 'dismissible', type: 'boolean', default: true, description: 'Whether a trailing close control is shown.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'glass', type: 'boolean', default: false, description: 'Renders the frosted glass material instead of a solid surface.' },
  ],
  tones: [
    { name: 'neutral', description: 'The default, low-emphasis surface.', tokens: { background: token('surface-raised'), border: token('border-subtle'), text: token('text') } },
    { name: 'info', description: 'Neutral-informational tint.', tokens: { background: token('info-soft'), border: token('info-border'), text: token('info-text') } },
    { name: 'success', description: 'Positive or complete states.', tokens: { background: token('success-soft'), border: token('success-border'), text: token('success-text') } },
    { name: 'warning', description: 'Caution states.', tokens: { background: token('warning-soft'), border: token('warning-border'), text: token('warning-text') } },
    { name: 'danger', description: 'Errors and destructive states, announced as an alert.', tokens: { background: token('danger-soft'), border: token('danger-border'), text: token('danger-text') } },
  ],
  defaults: { tone: 'neutral', dismissible: true, skeleton: false, glass: false },
  dimensions: {
    radius: token('radius-full'),
    gap: token('space-3'),
    border: token('hairline'),
    paddingInline: token('space-5'),
    paddingBlock: token('space-3'),
    viewportInset: token('space-6'),
    maxWidth: '28rem',
    fontSize: token('font-size-sm'),
  },
  states: [
    { name: 'enter', description: 'The pill slides up and fades in from y 12 on a snappy spring.' },
    { name: 'exit', description: 'The pill fades and drops away as it is replaced or dismissed.' },
    { name: 'replaced', description: 'A new toast takes the single slot immediately; there is no queue, latest wins.' },
  ],
  tokens: [
    'space-2', 'space-3', 'space-4', 'space-5', 'space-6',
    'hairline', 'radius-full', 'shadow-4',
    'font-sans', 'font-size-sm', 'line-height-normal', 'font-weight-medium',
    'surface-raised', 'border-subtle', 'text', 'text-muted',
    'glass-regular', 'glass-border', 'glass-highlight', 'glass-saturate', 'blur-sm',
    'info-soft', 'info-border', 'info-text',
    'success-soft', 'success-border', 'success-text',
    'warning-soft', 'warning-border', 'warning-text',
    'danger-soft', 'danger-border', 'danger-text',
  ],
  a11y: {
    role: 'status',
    focusable: false,
    keyboard: [{ keys: 'Enter, Space', action: 'Dismisses the toast when it holds focus, matching a pointer press.' }],
    notes: [
      'A danger toast uses role="alert" with aria-live="assertive"; other tones use role="status" with aria-live="polite".',
      'The pill is portalled to document.body so it escapes any clipping or stacking context.',
      'Only one toast exists at a time; a new toast replaces the current one rather than stacking.',
      'The dismiss control carries aria-label="Dismiss"; the whole pill is also clickable to dismiss.',
      'Do not rely on tone color alone to carry meaning; the message text should state it on its own.',
    ],
  },
  motion: {
    description: 'The pill springs up from y 12 on entry and fades down on exit via AnimatePresence; both respect reduced motion.',
    press: true,
    transition: { spring: 'snappy' },
  },
};
