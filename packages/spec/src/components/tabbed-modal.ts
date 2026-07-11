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
