import type { ComponentSpec, PaintSpec, TokenRef } from '../schema.ts';
import { toneSpecs, token } from '../vocab.ts';

/** Tone families, exported so the React kit derives its union from here. */
export const bannerTones = ['neutral', 'accent', 'success', 'warning', 'danger', 'info'] as const;

/**
 * Per-tone paint, transcribed from Banner.module.css. The message text stays
 * text-muted in every tone; the icon and the dismiss control's hover tint
 * carry the tone color.
 */
const bannerTonePaint: Record<string, { paint: PaintSpec; tokens: Record<string, TokenRef> }> = {
  neutral: {
    paint: { background: token('hover'), border: token('border-subtle'), text: token('text-muted') },
    tokens: { icon: token('text-muted') },
  },
  accent: {
    paint: { background: token('accent-soft'), border: token('accent-border'), text: token('text-muted') },
    tokens: { icon: token('accent-text'), dismissHover: token('accent-soft-hover') },
  },
  success: {
    paint: { background: token('success-soft'), border: token('success-border'), text: token('text-muted') },
    tokens: { icon: token('success-text'), dismissHover: token('success-soft-hover') },
  },
  warning: {
    paint: { background: token('warning-soft'), border: token('warning-border'), text: token('text-muted') },
    tokens: { icon: token('warning-text'), dismissHover: token('warning-soft-hover') },
  },
  danger: {
    paint: { background: token('danger-soft'), border: token('danger-border'), text: token('text-muted') },
    tokens: { icon: token('danger-text'), dismissHover: token('danger-soft-hover') },
  },
  info: {
    paint: { background: token('info-soft'), border: token('info-border'), text: token('text-muted') },
    tokens: { icon: token('info-text'), dismissHover: token('info-soft-hover') },
  },
};

export const bannerSpec: ComponentSpec = {
  name: 'Banner',
  id: 'banner',
  category: 'atom',
  status: 'stable',
  summary:
    'A full-width inline alert strip in every tone, laying a leading icon, a flexible message, and a trailing action or dismiss control across one horizontal row on a soft tone surface.',
  element: 'div',
  anatomy: [
    { name: 'icon', description: 'Optional leading glyph, vertically centered with the message and tinted by the tone.' },
    { name: 'message', description: 'The message content, flexing to fill the remaining width and clipping its own overflow.', required: true },
    { name: 'action', description: 'Optional trailing slot for a Button or link, sitting to the right of the message.' },
    { name: 'dismiss', description: 'Optional trailing close control, a small ghost IconButton shown only when onDismiss is set.' },
  ],
  props: [
    { name: 'tone', type: 'enum', values: [...bannerTones], default: 'info', description: 'Semantic color family; warning and danger also switch the ARIA role to alert.' },
    { name: 'icon', type: 'node', description: 'Leading glyph, rendered in the icon slot and tinted by the tone.' },
    { name: 'action', type: 'node', description: 'Trailing slot for a Button or link, rendered after the message.' },
    { name: 'onDismiss', type: 'handler', description: 'When set, renders a trailing close IconButton (aria-label "Dismiss") that calls this on press.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a full-width placeholder with the banner geometry instead of content.' },
    { name: 'children', type: 'node', description: 'Banner message content, placed in the message slot.' },
  ],
  tones: toneSpecs(bannerTones).map((tone) => ({ ...tone, ...(bannerTonePaint[tone.name] ?? {}) })),
  defaults: { tone: 'info', skeleton: false },
  dimensions: {
    radius: token('radius-lg'),
    gap: token('space-3'),
    border: token('hairline'),
    paddingInline: token('space-4'),
    paddingBlock: token('space-3'),
    dismissOffset: token('space-1'),
    fontSize: token('font-size-sm'),
  },
  states: [
    { name: 'default', description: 'Resting strip: a soft tone-tinted surface behind a hairline tone border, message text in the secondary color.' },
    { name: 'skeleton', description: 'Loading placeholder: a full-width, 3rem-tall block at radius-lg standing in for the strip, replacing all content.' },
  ],
  tokens: [
    'space-1', 'space-3', 'space-4', 'hairline', 'radius-lg',
    'font-sans', 'font-size-sm', 'leading-md',
    'hover', 'text-muted', 'border-subtle',
    'accent-soft', 'accent-soft-hover', 'accent-border', 'accent-text',
    'success-soft', 'success-soft-hover', 'success-border', 'success-text',
    'warning-soft', 'warning-soft-hover', 'warning-border', 'warning-text',
    'danger-soft', 'danger-soft-hover', 'danger-border', 'danger-text',
    'info-soft', 'info-soft-hover', 'info-border', 'info-text',
  ],
  a11y: {
    role: 'status',
    focusable: false,
    keyboard: [
      { keys: 'Enter, Space', action: 'Activates the trailing dismiss control when it holds focus, matching a pointer press.' },
    ],
    notes: [
      'A warning or danger banner uses role="alert" (assertive live region); all other tones use role="status" (polite live region).',
      'The banner strip itself is not focusable; only the trailing dismiss control and any action content take focus.',
      'When onDismiss is set, the close control is a ghost IconButton carrying aria-label="Dismiss".',
      'Do not rely on tone color alone to carry meaning; the message text should state it on its own.',
    ],
  },
  motion: {
    description: 'The banner strip does not animate; only the trailing dismiss IconButton presses inward (scale 0.94 on tap), and that press is suppressed under reduced motion.',
    press: true,
    transition: { speed: 'fast', ease: 'out' },
  },
};
