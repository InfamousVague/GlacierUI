import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';
import { popoverPlacements } from './popover.ts';

export const menuSpec: ComponentSpec = {
  name: 'Menu',
  id: 'menu',
  category: 'organism',
  status: 'stable',
  summary:
    'A dropdown list of actions anchored to a trigger: keyboard-navigable menu items with optional icons, shortcuts, separators, and section labels, on a glass panel.',
  element: 'div',
  anatomy: [
    { name: 'trigger', description: 'The element that toggles the menu; it gains aria-haspopup="menu", aria-expanded, and aria-controls.', required: true },
    { name: 'menu', description: 'The portalled role="menu" panel that flips and clamps on screen.', required: true },
    { name: 'item', description: 'A role="menuitem" action row with an optional leading icon and trailing shortcut.' },
    { name: 'separator', description: 'A role="separator" divider between groups of items.' },
    { name: 'label', description: 'A non-interactive section heading.' },
  ],
  props: [
    { name: 'trigger', type: 'node', required: true, description: 'Element that opens the menu; its ref and click are wired up.' },
    { name: 'placement', type: 'enum', values: popoverPlacements, default: 'bottom-start', description: 'Menu position relative to the trigger.' },
    { name: 'open', type: 'boolean', description: 'Controlled open state.' },
    { name: 'defaultOpen', type: 'boolean', default: false, description: 'Initial open state when uncontrolled.' },
    { name: 'onOpenChange', type: 'handler', description: 'Called with the next open state.' },
    { name: 'aria-label', type: 'string', description: 'Accessible name for the menu.' },
  ],
  defaults: { placement: 'bottom-start', defaultOpen: false },
  dimensions: {
    radius: token('radius-lg'),
    gap: token('space-1'),
  },
  a11y: {
    role: 'menu',
    focusable: true,
    keyboard: [
      { keys: 'ArrowDown, ArrowUp', action: 'Moves focus between items, wrapping around the ends.' },
      { keys: 'Home, End', action: 'Jumps to the first or last item.' },
      { keys: 'Enter, Space', action: 'Activates the focused item and closes the menu.' },
      { keys: 'Escape', action: 'Closes the menu and returns focus to the trigger.' },
    ],
    notes: [
      'Opens as a role="menu" of role="menuitem" rows; the first enabled item is focused on open.',
      'Disabled items carry aria-disabled and are skipped by arrow navigation.',
    ],
  },
  motion: {
    description: 'The panel scales and fades in from the trigger edge; respects reduced motion.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
