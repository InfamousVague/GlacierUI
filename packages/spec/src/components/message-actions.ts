import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/**
 * The actions a message row offers, in the order they read.
 *
 * The order is the contract: both bindings render it, and it is what decides
 * which actions stay inline and which fold into the overflow menu when the
 * cluster is capped. React comes first because it is the one action a reader
 * takes without leaving the transcript.
 */
export const messageActionOrder = ['react', 'reply', 'thread', 'more'] as const;

/**
 * How the same action set is rendered.
 *
 * Two layouts rather than two components, because the touch story depends on
 * them being fed identical props: the host wraps the bubble in a ContextMenu
 * whose content is `<MessageActions layout="menu" …>` with the very same
 * `actions` array the hover cluster gets, so a long-press can never offer a
 * different set of actions than a mouse does.
 */
export const messageActionLayouts = ['cluster', 'menu'] as const;

/**
 * When the cluster is visible at rest.
 *
 * `hover` is the default on a fine pointer and silently becomes `always` where
 * there is no hover to wait for — see the a11y notes, which are the whole point
 * of this component.
 */
export const messageActionReveals = ['hover', 'always'] as const;

export const messageActionsSpec: ComponentSpec = {
  name: 'MessageActions',
  id: 'message-actions',
  category: 'molecule',
  status: 'draft',
  summary:
    'The react / reply / thread / more cluster on a message row: hover-revealed on a mouse, always visible on touch, and always keyboard reachable as a single roving-tabindex toolbar that reveals itself on focus.',
  element: 'div',
  anatomy: [
    {
      name: 'cluster',
      description:
        'The toolbar of actions. It takes no position of its own — the message row is what pins it to a bubble\'s trailing corner, floats it above the row, or leaves it inline, and a component that positioned itself would have to be fought off every one of those.',
      required: true,
    },
    { name: 'action', description: 'One IconButton per action.', required: true },
    { name: 'overflow', description: 'The trailing "more" control, which opens the actions past the inline cap as a Menu.' },
  ],
  props: [
    {
      name: 'actions',
      type: 'array',
      item: {
        type: 'object',
        description: 'One offered action.',
        fields: [
          { name: 'id', type: 'string', required: true, description: 'Stable id; also the render key. The known ids order themselves by the shared action order.' },
          { name: 'label', type: 'string', required: true, description: 'The accessible name, and the row label in the menu layout.' },
          { name: 'icon', type: 'node', description: 'The glyph. Required in the cluster layout, optional in the menu.' },
          { name: 'danger', type: 'boolean', description: 'Paints the danger tone in the menu layout.' },
          { name: 'onSelect', type: 'handler', description: 'Called when the action is chosen.' },
          { name: 'disabled', type: 'boolean', description: 'Dims the action and blocks it.' },
        ],
      },
      required: true,
      description: 'What this message offers. Data, not children, so the cluster and the long-press menu are provably the same set.',
    },
    { name: 'layout', type: 'enum', values: messageActionLayouts, default: 'cluster', description: 'The floating toolbar, or the same actions as menu rows for a host ContextMenu.' },
    { name: 'reveal', type: 'enum', values: messageActionReveals, default: 'hover', description: 'Whether the cluster rests hidden. Ignored where the pointer is coarse.' },
    { name: 'visible', type: 'boolean', description: 'Host-driven reveal, for a host that tracks its own row hover or long-press. Wins over `reveal`.' },
    { name: 'inlineCap', type: 'number', default: 3, description: 'How many actions stay inline before the rest fold into the overflow menu.' },
    { name: 'size', type: 'enum', values: ['sm', 'md'], default: 'sm', description: 'Control size for each action button.' },
    { name: 'labels', type: 'object', description: 'Translated strings for the toolbar and the overflow control; merged over the shared English defaults.' },
  ],
  defaults: { layout: 'cluster', reveal: 'hover', inlineCap: 3, size: 'sm' },
  dimensions: {
    gap: token('space-0'),
    radius: token('radius-lg'),
    padding: token('space-1'),
    border: token('hairline'),
  },
  paint: { background: token('surface-raised'), border: token('border-subtle') },
  states: [
    {
      name: 'default',
      description:
        'At rest on a fine pointer the cluster is transparent and does not hit-test — but it is still in the DOM and still focusable. That distinction is the component: `display:none` or `visibility:hidden` would take it out of the tab order and make every action unreachable without a mouse.',
    },
    { name: 'visible', description: 'Revealed: the raised surface fades up over the bubble\'s trailing corner and starts hit-testing.', paint: { background: token('surface-raised'), border: token('border-subtle') } },
    {
      name: 'focus-within',
      description:
        'A keyboard user has tabbed in. Identical to `visible` and reached without any pointer, so the cluster appears the moment it can be operated.',
      tokens: { background: token('surface-raised'), ring: token('focus-ring') },
    },
    {
      name: 'coarse-pointer',
      description:
        'Where `hover: none` matches there is nothing to hover, so the cluster is always visible. A long-press-only affordance would be invisible until discovered by accident.',
      tokens: { background: token('surface-raised') },
    },
    { name: 'hover', description: 'An individual action washes with the hover fill.', tokens: { background: token('hover') } },
  ],
  focusRing: { ring: token('focus-ring'), offset: '2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'space-0', 'space-1', 'radius-lg', 'hairline', 'surface-raised', 'border-subtle',
    'hover', 'focus-ring', 'shadow-2', 'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'toolbar',
    focusable: false,
    keyboard: [
      { keys: 'Tab', action: 'Enters the cluster at its first action and leaves it entirely. One tab stop for the whole cluster.' },
      { keys: 'ArrowLeft, ArrowRight', action: 'Moves between actions, wrapping at the ends. Inverted under RTL.' },
      { keys: 'Home, End', action: 'Jumps to the first or last action.' },
      { keys: 'Enter, Space', action: 'Runs the focused action.' },
      { keys: 'Escape', action: 'Closes the overflow menu and returns focus to the "more" control.' },
    ],
    notes: [
      'THE RULE: an action that exists only on hover does not exist. The cluster is always rendered and always in the tab order; `reveal: hover` only makes it transparent and non-hit-testing, never `display:none`, `visibility:hidden`, or `hidden` — all three of which drop it out of the tab order and hide it from a screen reader as well as from a mouse.',
      'It reveals itself on :focus-within, so a keyboard user sees the cluster at the exact moment it becomes operable; hit-testing is restored at the same time, so a pointer user who tabbed in can also click.',
      'On a coarse pointer (`@media (hover: none)`) it is always visible. Touch has no hover, and hiding the only path to reply behind an undocumented long-press is the single most common way a chat UI locks out its own users.',
      'Long-press is offered IN ADDITION, never instead: the host wraps the bubble in a ContextMenu whose content is this same component in the `menu` layout with the same `actions`, so both paths are provably the same set.',
      'A roving tabindex, so a transcript of fifty messages costs fifty tab stops rather than two hundred.',
    ],
  },
  motion: {
    description: 'The cluster crossfades in; it never slides or scales, because it sits over text the reader is mid-sentence in and movement there reads as the message itself moving.',
    press: true,
    transition: { speed: 'fast', ease: 'out' },
  },
};
