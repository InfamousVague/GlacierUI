import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const tabStripSpec: ComponentSpec = {
  name: 'TabStrip',
  id: 'tab-strip',
  category: 'organism',
  status: 'stable',
  summary:
    'A horizontal strip of closable document tabs - like editor or browser tabs - with a springing active indicator, horizontal overflow scrolling, and a per-tab close button.',
  element: 'div',
  anatomy: [
    { name: 'strip', description: 'The role="tablist" container that scrolls horizontally when its tabs overflow.', required: true },
    { name: 'tab', description: 'A role="tab" button with an optional leading icon, a label, and a trailing close control.', required: true },
    { name: 'icon', description: 'Optional leading glyph inside a tab.' },
    { name: 'close', description: 'The per-tab close (×) control inside the tab; clicking it reports the tab id to onClose.' },
    { name: 'indicator', description: 'The shared springing underline under the active tab.' },
  ],
  props: [
    { name: 'tabs', type: 'node', required: true, description: 'The tab descriptors: { id, label, icon? }.' },
    { name: 'value', type: 'string', description: 'Controlled active tab id.' },
    { name: 'defaultValue', type: 'string', description: 'Initial active tab id when uncontrolled; defaults to the first tab.' },
    { name: 'onValueChange', type: 'handler', description: 'Called with the id of the tab that becomes active.' },
    { name: 'onClose', type: 'handler', description: 'Called with the id of the tab whose close button is pressed.' },
    { name: 'spring', type: 'enum', values: ['snappy', 'smooth', 'bouncy', 'gentle'], default: 'snappy', description: 'Spring preset for the active indicator.' },
    { name: 'showScrollbar', type: 'boolean', default: false, description: 'Shows the horizontal scrollbar beneath overflowing tabs; hidden by default so the baseline hairline stays flush.' },
    { name: 'aria-label', type: 'string', description: 'Accessible name for the strip.' },
  ],
  defaults: { spring: 'snappy', showScrollbar: false },
  dimensions: {
    radius: token('radius-md'),
    gap: token('space-1'),
    paddingInline: token('space-3'),
    paddingBlock: token('space-2'),
  },
  states: [
    { name: 'hover', description: 'A hovered tab washes to the hover background and full text color; the hovered close control washes to the active background.', paint: { background: token('hover'), text: token('text') } },
    { name: 'selected', description: 'The active tab keeps a transparent fill but takes the full text color, lifts its icon to text-muted, and carries the 2px accent-solid underline indicator.', paint: { text: token('text') }, tokens: { icon: token('text-muted'), indicator: token('accent-solid') } },
    { name: 'close-hover', description: 'The per-tab close control washes to the active background with full text color on hover.', paint: { background: token('active'), text: token('text') } },
    { name: 'overflowing', description: 'With showScrollbar, an overflowing strip reserves a space-2 band beneath the tabs, hides its real border-bottom, and repaints the baseline hairline as a border-subtle gradient at the tab baseline; the scrollbar thumb is border, border-strong on hover.', tokens: { baseline: token('border-subtle'), thumb: token('border'), 'thumb-hover': token('border-strong') } },
  ],
  // 2px focus-ring outline inset into the tab (outline-offset: -2px)
  focusRing: { ring: token('focus-ring'), offset: '-2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'space-1', 'space-2', 'space-3', 'hairline', 'border-subtle', 'border', 'border-strong',
    'font-sans', 'font-size-sm', 'font-weight-medium',
    'radius-md', 'radius-sm', 'radius-full',
    'text', 'text-muted', 'text-subtle', 'hover', 'active', 'accent-solid',
    'focus-ring', 'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'tablist',
    focusable: true,
    keyboard: [
      { keys: 'ArrowLeft, ArrowRight', action: 'Moves the active tab to the previous or next tab, wrapping around the ends.' },
      { keys: 'Home, End', action: 'Activates the first or last tab.' },
      { keys: 'Delete, Backspace', action: 'Closes the focused tab, reporting its id to onClose.' },
    ],
    notes: [
      'The strip is a role="tablist" of role="tab" buttons; only the active tab is in the tab order (roving tabindex).',
      'The per-tab close control is a non-focusable role="button" labelled "Close <label>"; its click is stopped from also activating the tab. Keyboard users close the focused tab with Delete or Backspace.',
      'Reordering tabs by drag is out of scope for v1.',
    ],
  },
  motion: {
    description: 'The active-tab underline is a shared layout element that springs between tabs; respects reduced motion.',
    transition: { spring: 'snappy' },
  },
};
