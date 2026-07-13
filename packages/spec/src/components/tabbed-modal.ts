import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const tabbedModalSpec: ComponentSpec = {
  name: 'TabbedModal',
  id: 'tabbed-modal',
  category: 'organism',
  status: 'stable',
  summary:
    'A settings-style dialog: a fixed left nav rail of sections beside a scrollable right pane that shows the active one. Composes Modal and lays out a vertical tablist and tabpanel.',
  element: 'div',
  anatomy: [
    { name: 'modal', description: 'The underlying Modal: a portalled role="dialog" with focus trap, scroll lock, and dismiss-on-Escape/overlay.', required: true },
    { name: 'rail', description: 'The fixed, non-scrolling role="tablist" of section entries down the left edge.', required: true },
    { name: 'railItem', description: 'A role="tab" entry with an optional leading icon; the selected one carries the sliding pill.' },
    { name: 'pane', description: 'The scrollable role="tabpanel" that shows the active section content (overflow: auto).', required: true },
  ],
  props: [
    { name: 'open', type: 'boolean', required: true, description: 'Whether the dialog is shown.' },
    { name: 'onClose', type: 'handler', required: true, description: 'Called when the user dismisses via Escape, the close button, or the overlay.' },
    { name: 'sections', type: 'node', required: true, description: 'The sections { id, label, icon?, content, disabled? } listed in the rail; the active one fills the pane.' },
    { name: 'value', type: 'string', description: 'Controlled active section id.' },
    { name: 'defaultValue', type: 'string', description: 'Initial active section id when uncontrolled.' },
    { name: 'onValueChange', type: 'handler', description: 'Called with the next active section id.' },
    { name: 'title', type: 'node', description: 'Heading shown above the two panes.' },
    { name: 'footer', type: 'node', description: 'Action row passed through to the underlying Modal, rendered below both panes.' },
  ],
  defaults: {},
  dimensions: {
    radius: token('radius-2xl'),
    gap: token('space-6'),
    rail: token('space-4'),
  },
  states: [
    { name: 'hover', description: 'A hovered, enabled, non-active rail item washes with the hover token and strengthens its label from text-muted to text.', paint: { background: token('hover'), text: token('text') } },
    {
      name: 'selected',
      description: 'The active rail item recolors to accent-text at medium weight and carries the sliding accent-soft pill behind its content.',
      paint: { text: token('accent-text') },
      tokens: { indicator: token('accent-soft') },
    },
    { name: 'disabled', description: 'A disabled rail item dims to half opacity (opacity: 0.5, a literal - no token) with a not-allowed cursor and is skipped by arrow navigation.' },
  ],
  // .railItem:focus-visible draws a 2px focus-ring outline inset by 2px
  // (outline-offset: -2px); the pane rings outward instead
  // (.pane:focus-visible, offset 2px) so its ring clears the scroll box.
  // composed of Modal chrome around a rail and pane
  paint: {},
  focusRing: { ring: token('focus-ring'), offset: '-2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'space-2', 'space-3', 'space-4', 'space-6',
    'hairline', 'border-subtle', 'radius-md', 'radius-sm',
    'hover', 'text', 'text-muted', 'accent-text', 'accent-soft',
    'font-sans', 'font-size-sm', 'font-weight-medium', 'leading-sm', 'leading-md',
    'focus-ring', 'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'dialog',
    focusable: true,
    keyboard: [
      { keys: 'ArrowDown, ArrowUp', action: 'Moves and activates the rail selection, wrapping and skipping disabled sections.' },
      { keys: 'Home, End', action: 'Jumps to the first or last section.' },
      { keys: 'Tab', action: 'Cycles focusable elements within the trapped dialog.' },
      { keys: 'Escape', action: 'Closes the dialog and restores focus to the opener.' },
    ],
    notes: [
      'The left rail is a vertical role="tablist" of role="tab" entries; the right pane is the matching role="tabpanel".',
      'Only the selected tab is in the tab order (roving tabindex); arrow keys move between the rest.',
      'Inherits the Modal dialog semantics: role="dialog", aria-modal, labelled by the title, focus trap, and scroll lock.',
    ],
  },
  motion: {
    description: 'The dialog springs open via Modal; the rail pill slides between sections and the pane cross-fades on change. Respects reduced motion.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
