import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** Panel width steps, matching the Modal's vocabulary. */
export const commandPaletteSizes = ['sm', 'md', 'lg'] as const;

export const commandPaletteSpec: ComponentSpec = {
  name: 'CommandPalette',
  id: 'command-palette',
  category: 'organism',
  status: 'draft',
  summary:
    'A ⌘K overlay that searches every action in the app: type to narrow a grouped list, arrow to a command, Enter to run it.',
  element: 'div',
  anatomy: [
    { name: 'overlay', description: 'The scrim behind the panel, dismissing it on press.', required: true },
    { name: 'panel', description: 'The floating surface holding the query and the list.', required: true },
    { name: 'query', description: 'The single text field; it holds focus for the whole life of the palette.', required: true },
    { name: 'list', description: 'The results, in the caller\'s order, sectioned by group.', required: true },
    { name: 'group', description: 'A heading over a run of commands sharing a group.' },
    { name: 'option', description: 'One command row: its label, an optional matched keyword, and its shortcut hint.', required: true },
    { name: 'shortcut', description: 'The key hint on a row\'s trailing edge.' },
    { name: 'empty', description: 'What shows when the query matches nothing.' },
    { name: 'footer', description: 'A hint strip naming the movement keys.' },
  ],
  props: [
    { name: 'open', type: 'boolean', required: true, description: 'Whether the palette is shown.' },
    { name: 'onOpenChange', type: 'handler', required: true, description: 'Called with false when the user dismisses via Escape, the scrim, or running a command.' },
    { name: 'commands', type: 'array', required: true, item: { type: 'object', description: 'A command: id, label, and optional group, keywords, shortcut, and disabled.' }, description: 'Every command the palette can run, in the order they should be offered. Priority is the caller\'s to decide.' },
    { name: 'onRun', type: 'handler', required: true, description: 'Called with the chosen command\'s id. The palette closes itself first, so a command that opens a dialog does not fight the overlay.' },
    { name: 'query', type: 'string', description: 'Controlled query text.' },
    { name: 'defaultQuery', type: 'string', default: '', description: 'Initial query when uncontrolled. Reset to this each time the palette opens.' },
    { name: 'onQueryChange', type: 'handler', description: 'Called as the user types.' },
    { name: 'placeholder', type: 'string', description: 'Prompt shown in the empty query field.' },
    { name: 'emptyLabel', type: 'node', description: 'Shown in place of the list when nothing matches.' },
    { name: 'footer', type: 'node', description: 'Replaces the default key-hint strip. Pass null to drop it.' },
    { name: 'size', type: 'enum', values: commandPaletteSizes, default: 'md', description: 'Panel width step.' },
    { name: 'shortcut', type: 'boolean', default: true, description: 'Binds ⌘K / Ctrl+K globally to open the palette. Turn it off to own the chord yourself.' },
  ],
  defaults: { defaultQuery: '', size: 'md', shortcut: true },
  dimensions: {
    radius: token('radius-2xl'),
    gap: token('space-2'),
    padding: token('space-2'),
    rowRadius: token('radius-md'),
    // Written as CSS lengths and passed through verbatim by both bindings.
    // Earlier attempts to re-express these natively went wrong twice: a
    // percentage padding resolves against the parent's WIDTH, and a pixel
    // max-width cannot follow the text-size preference the rem-based
    // stylesheet does. Handing both sides the same string avoids restating it.
    topOffset: '12vh',
    maxHeight: 'min(28rem, 70vh)',
    // The `size` prop steps the PANEL's width, not a control's box, so these
    // live here rather than in `sizes` - that field describes control heights
    // and paddings, and this component's a11y role is a combobox, so declaring
    // them there made the auditor rightly ask for a height no panel has.
    //
    // rem, like the stylesheet: both follow the reader's text-size preference.
    widthSm: '24rem',
    widthMd: '32rem',
    widthLg: '40rem',
  },
  states: [
    { name: 'default', description: 'Open with an empty query, showing the full command list from the top.' },
    {
      name: 'active',
      description: 'The row under the cursor, reached by arrow keys or hover. Exactly one row carries it, and it is always the row Enter would run.',
      tokens: { background: token('hover'), text: token('text') },
    },
    {
      name: 'disabled',
      description: 'A command listed but not runnable - shown so its absence is not mysterious, but the cursor steps over it and it cannot be pressed.',
      tokens: { text: token('text-subtle') },
    },
    {
      name: 'empty',
      description: 'The query matched nothing; the list is replaced by a single quiet line rather than collapsing the panel, so the field does not jump under the user\'s hands mid-search.',
      tokens: { text: token('text-subtle') },
    },
  ],
  // The palette is a floating dialog, so it wears the same glass as Modal and
  // Drawer rather than a solid surface. Declared here rather than left to each
  // binding: the DOM kit had been painting glass while this spec said
  // `surface-raised`, so the native palette faithfully rendered a solid panel
  // and the two drifted apart.
  paint: {
    background: token('glass-thick'),
    text: token('text'),
    border: token('glass-border'),
  },
  // The query field is the only focusable thing in the palette, so the ring is
  // the field's own - matching SearchField, which is what actually renders here.
  focusRing: { ring: token('accent-soft'), offset: '0' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'glass-thick', 'glass-border', 'glass-highlight', 'glass-saturate',
    'overlay', 'blur-sm', 'blur-lg', 'shadow-5', 'hairline',
    'hover', 'border', 'text', 'text-muted', 'text-subtle',
    'space-1', 'space-2', 'space-3', 'space-6', 'radius-2xl', 'radius-md',
    'font-size-sm', 'font-size-xs', 'duration-fast', 'ease-out', 'accent-soft',
  ],
  a11y: {
    role: 'combobox',
    focusable: true,
    keyboard: [
      { keys: '⌘K, Ctrl+K', action: 'Opens the palette from anywhere.' },
      { keys: 'ArrowDown, ArrowUp', action: 'Moves the cursor, skipping disabled rows and wrapping at both ends.' },
      { keys: 'Home, End', action: 'Jumps to the first or last runnable command.' },
      { keys: 'Enter', action: 'Runs the command under the cursor.' },
      { keys: 'Escape', action: 'Closes the palette.' },
    ],
    notes: [
      'The field is the combobox and the list is its listbox; focus never leaves the field, so typing and arrowing are the same gesture.',
      'The active row is named by aria-activedescendant rather than being focused, which is what lets one field drive the whole list.',
      'Group headings are presentational - the option order already carries the grouping for a screen reader reading top to bottom.',
      'A disabled command is announced with aria-disabled instead of being hidden, so it can be found and its state understood.',
    ],
  },
  motion: {
    description: 'The panel fades and lifts on open. The cursor itself never animates between rows: at typing speed an easing highlight lags the key it is following.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
