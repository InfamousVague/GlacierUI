import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';
import { popoverPlacements } from './popover.ts';

export const menuSpec: ComponentSpec = {
  name: 'Menu',
  id: 'menu',
  category: 'organism',
  status: 'stable',
  summary:
    'A dropdown list of actions anchored to a trigger: keyboard-navigable menu items with optional icons, shortcuts, separators, section labels, flyout submenus, and a pointer-summoned context-menu form, on a glass panel.',
  element: 'div',
  anatomy: [
    { name: 'trigger', description: 'The element that toggles the menu; it gains aria-haspopup="menu", aria-expanded, and aria-controls.', required: true },
    { name: 'menu', description: 'The portalled role="menu" panel that flips and clamps on screen.', required: true },
    { name: 'item', description: 'A role="menuitem" action row with an optional leading icon and trailing shortcut.' },
    { name: 'separator', description: 'A role="separator" divider between groups of items.' },
    { name: 'label', description: 'A non-interactive section heading.' },
    { name: 'submenu', description: 'A MenuSub row - a menuitem with aria-haspopup="menu", aria-expanded, and a trailing chevron - whose child panel flies out right-start of the row and flips to left-start near the viewport edge. Submenus nest.' },
    { name: 'context-target', description: 'The ContextMenu wrapper (no box of its own) around arbitrary content; right-click or a touch long-press summons the same menu panel at the pointer coordinates via a zero-size virtual anchor.' },
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
  states: [
    { name: 'open', description: 'The panel scales and fades in: a glass-thick surface with a glass border, glass highlight, and shadow-4.', tokens: { background: token('glass-thick'), border: token('glass-border'), highlight: token('glass-highlight'), shadow: token('shadow-4') } },
    { name: 'hover', description: 'A hovered enabled item fills with the hover wash.', tokens: { background: token('hover') } },
    { name: 'focus-visible', description: 'The keyboard-focused item fills with the same hover wash instead of drawing an outline ring.', tokens: { background: token('hover') } },
    { name: 'danger', description: 'A danger item recolors its text and icon; its hover and focus fill turns danger-soft.', paint: { text: token('danger-text') }, tokens: { hover: token('danger-soft') } },
    { name: 'submenu-open', description: 'A MenuSub row keeps the hover fill while its flyout is open (aria-expanded).', tokens: { background: token('hover') } },
    { name: 'disabled', description: 'Halved opacity, not-allowed cursor, and skipped by arrow navigation.' },
  ],
  // keyboard focus paints the item with the hover fill; there is no outline
  // ring inside the panel (the menu suppresses its own outline)
  focusRing: { ring: token('hover'), offset: '0' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  a11y: {
    role: 'menu',
    focusable: true,
    keyboard: [
      { keys: 'ArrowDown, ArrowUp', action: 'Moves focus between items, wrapping around the ends.' },
      { keys: 'Home, End', action: 'Jumps to the first or last item.' },
      { keys: 'Enter, Space', action: 'Activates the focused item and closes the menu; on a submenu row, opens the flyout and focuses its first item.' },
      { keys: 'ArrowRight', action: 'On a submenu row, opens the flyout and focuses its first item.' },
      { keys: 'ArrowLeft', action: 'Inside a flyout, closes it and returns focus to its parent row.' },
      { keys: 'Escape', action: 'Closes the menu - the whole stack when flyouts are open - and returns focus to the trigger (or, for a context menu, to the element focused before it opened).' },
    ],
    notes: [
      'Opens as a role="menu" of role="menuitem" rows; the first enabled item is focused on open.',
      'Disabled items carry aria-disabled and are skipped by arrow navigation.',
      'ContextMenu opens the same panel at the pointer coordinates on contextmenu (default prevented) or a ~500ms touch long-press, cancelled when the pointer lifts or moves more than 8px. It dismisses on Escape, outside press, or scrolling away, and restores focus on close.',
      'A submenu row carries aria-haspopup="menu" and aria-expanded, and opens on hover with an intent delay (~120ms), plus a close delay so diagonal travel into the flyout does not shut it.',
    ],
  },
  motion: {
    description: 'The panel scales and fades in from the trigger edge; flyout panels do the same from the row edge; respects reduced motion.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
