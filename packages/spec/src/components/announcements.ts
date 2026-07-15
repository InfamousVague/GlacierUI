import type { ComponentSpec, PaintSpec, TokenRef } from '../schema.ts';
import { toneSpecs, token } from '../vocab.ts';

/** Tone families, exported so every framework binding derives the same union. */
export const announcementTones = ['neutral', 'accent', 'success', 'warning', 'danger', 'info'] as const;

const tonePaint: Record<string, { paint: PaintSpec; tokens?: Record<string, TokenRef> }> = {
  neutral: { paint: { background: token('hover'), border: token('border-subtle'), text: token('text-muted') } },
  accent: { paint: { background: token('accent-soft'), border: token('accent-border'), text: token('text-muted') } },
  success: { paint: { background: token('success-soft'), border: token('success-border'), text: token('text-muted') } },
  warning: { paint: { background: token('warning-soft'), border: token('warning-border'), text: token('text-muted') } },
  danger: { paint: { background: token('danger-soft'), border: token('danger-border'), text: token('text-muted') } },
  info: { paint: { background: token('info-soft'), border: token('info-border'), text: token('text-muted') } },
};

export const announcementsSpec: ComponentSpec = {
  name: 'Announcements',
  id: 'announcements',
  category: 'atom',
  status: 'stable',
  summary:
    'A compact application-chrome ticker that displays one short update at a time, sliding through a supplied update list with manual previous, next, and pause controls.',
  element: 'section',
  anatomy: [
    { name: 'viewport', description: 'Clipped flexible area containing the current announcement message.', required: true },
    { name: 'label', description: 'Optional short category preceding the announcement content.' },
    { name: 'content', description: 'The current announcement message, single-line truncated when needed.', required: true },
    { name: 'controls', description: 'Previous, position, pause/resume, and next controls when more than one update exists.' },
  ],
  props: [
    {
      name: 'items', type: 'array', required: true,
      description: 'Ordered updates to display. At least one item is required.',
      item: {
        type: 'object', description: 'One announcement update.', fields: [
          { name: 'id', type: 'string', required: true, description: 'Stable identity used for the current-item transition and position.' },
          { name: 'label', type: 'node', description: 'Optional short category displayed before the content.' },
          { name: 'content', type: 'node', required: true, description: 'Announcement message content.' },
        ],
      },
    },
    { name: 'tone', type: 'enum', values: [...announcementTones], default: 'info', description: 'Semantic color family for the soft strip surface and border.' },
    { name: 'index', type: 'number', description: 'Controlled zero-based index of the visible update.' },
    { name: 'defaultIndex', type: 'number', default: 0, description: 'Initially visible zero-based index in uncontrolled use.' },
    { name: 'onIndexChange', type: 'handler', description: 'Called with the next zero-based index after automatic or manual navigation.' },
    { name: 'autoPlay', type: 'boolean', default: true, description: 'Rotates updates automatically until paused or the user interacts with the strip.' },
    { name: 'interval', type: 'number', default: 7000, description: 'Milliseconds between automatic updates.' },
    { name: 'aria-label', type: 'string', default: 'Announcements', description: 'Accessible name for the announcements region.' },
  ],
  tones: toneSpecs(announcementTones).map((tone) => ({ ...tone, ...(tonePaint[tone.name] ?? {}) })),
  defaults: { tone: 'info', defaultIndex: 0, autoPlay: true, interval: 7000, 'aria-label': 'Announcements' },
  dimensions: {
    minHeight: token('control-height-md'),
    radius: token('radius-lg'),
    gap: token('space-3'),
    border: token('hairline'),
    paddingInlineStart: token('space-4'),
    paddingInlineEnd: token('space-3'),
    paddingBlock: token('space-2'),
    viewportPaddingInline: token('space-1'),
    controlSize: token('control-height-sm'),
  },
  states: [
    { name: 'default', description: 'Current update rests in a soft tone surface with its short label emphasized over muted message text.' },
    { name: 'rotating', description: 'A new update slides in from inline-end and fades up after each interval.', behavioral: true },
    { name: 'paused', description: 'Automatic rotation stops and the control switches from pause to resume.', behavioral: true },
    { name: 'interacting', description: 'Automatic rotation pauses while the region is hovered or contains focus.', behavioral: true },
  ],
  focusRing: { ring: token('focus-ring'), offset: '2px' },
  transition: { duration: token('duration-normal'), ease: token('ease-out') },
  tokens: [
    'control-height-md', 'control-height-sm', 'space-1', 'space-2', 'space-3', 'space-4',
    'hairline', 'radius-lg', 'radius-md', 'font-sans', 'font-size-sm', 'font-weight-semibold',
    'leading-md', 'text', 'text-muted', 'text-subtle', 'hover', 'focus-ring', 'duration-normal', 'ease-out',
    'border-subtle', 'accent-soft', 'accent-border', 'success-soft', 'success-border',
    'warning-soft', 'warning-border', 'danger-soft', 'danger-border', 'info-soft', 'info-border',
  ],
  a11y: {
    role: 'region',
    focusable: false,
    keyboard: [
      { keys: 'Enter, Space', action: 'Activates the focused previous, next, or pause/resume control.' },
    ],
    notes: [
      'The strip is a labelled region, and the update content is aria-live="off" so automatic rotation does not interrupt assistive technology.',
      'The position text is a polite live region, announcing the current position after a user moves through the updates.',
      'Automatic movement pauses on hover and focus. A pause/resume control remains available whenever there is more than one update.',
      'Keep update content short and self-contained; the message is visually truncated to a single line on narrow layouts.',
    ],
  },
  motion: {
    description: 'Each changed update fades and slides in from inline-end over the normal duration. The transition is removed under reduced motion.',
    transition: { speed: 'normal', ease: 'out' },
  },
};