import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/**
 * When the bar offers its own "add a reaction" affordance.
 *
 * `auto` is the default and the interesting one: the chip appears only once a
 * message already carries a reaction. On a bare message the MessageActions
 * cluster already owns the react affordance, and a second permanent plus under
 * every message in the transcript is visual noise competing with it — but on a
 * message that already has pills, the cluster may be hidden (hover) while the
 * bar is not, so the bar has to carry its own way in.
 */
export const reactionBarAddModes = ['auto', 'always', 'never'] as const;

export const reactionBarSpec: ComponentSpec = {
  name: 'ReactionBar',
  id: 'reaction-bar',
  category: 'molecule',
  status: 'draft',
  summary:
    'The row of reaction pills under a message, plus its add-a-reaction chip: one toolbar tab stop, wrapping rather than scrolling, capped before it can grow taller than the message it belongs to.',
  element: 'div',
  anatomy: [
    { name: 'bar', description: 'The wrapping toolbar. Renders nothing at all — not an empty box — when there is nothing to show.', required: true },
    { name: 'pill', description: 'One ReactionPill per emoji, in first-appearance order.', required: true },
    { name: 'overflow', description: 'The "+N" chip standing in for the pills past the cap. Pressing it expands the bar in place.' },
    { name: 'add', description: 'The add-a-reaction chip that opens the picker.' },
  ],
  props: [
    {
      name: 'reactions',
      type: 'array',
      item: {
        type: 'object',
        description: 'One person\'s one reaction, as the server stores it.',
        fields: [
          { name: 'emoji', type: 'string', required: true, description: 'The glyph.' },
          { name: 'actorId', type: 'string', required: true, description: 'Who reacted.' },
          { name: 'at', type: 'number', description: 'When, epoch millis. Deliberately unused for ordering.' },
        ],
      },
      description: 'The raw records. Tallied through the shared aggregate so the bar cannot count differently from anything else in the suite.',
    },
    { name: 'viewerId', type: 'string', description: 'Who is looking, so their own reactions paint as engaged.' },
    {
      name: 'pending',
      type: 'array',
      item: {
        type: 'object',
        description: 'An add or remove the server has not acknowledged yet.',
        fields: [
          { name: 'emoji', type: 'string', required: true, description: 'The glyph being added or removed.' },
          { name: 'intent', type: 'enum', values: ['add', 'remove'], required: true, description: 'What was asked for.' },
        ],
      },
      description: 'In-flight toggles, folded into the tally so the bar shows the outcome the user asked for immediately.',
    },
    { name: 'cap', type: 'number', description: 'How many pills show before the rest collapse into the overflow chip. Defaults to the shared display cap.' },
    { name: 'expanded', type: 'boolean', description: 'Controlled: the overflow has been opened and every pill shows.' },
    { name: 'defaultExpanded', type: 'boolean', default: false, description: 'Initial expansion when uncontrolled.' },
    { name: 'onExpandedChange', type: 'handler', description: 'Called when the overflow chip is pressed.' },
    { name: 'add', type: 'enum', values: reactionBarAddModes, default: 'auto', description: 'When the add-a-reaction chip is offered.' },
    { name: 'onAdd', type: 'handler', description: 'Called when the add chip is pressed. Omit it and the chip is never rendered, whatever `add` says.' },
    { name: 'onToggle', type: 'handler', description: 'Called with the emoji and the intent when a pill is pressed.' },
    { name: 'size', type: 'enum', values: ['sm', 'md'], default: 'md', description: 'Forwarded to every pill.' },
    { name: 'labels', type: 'object', description: 'Translated strings; merged over the shared English defaults.' },
    { name: 'resolveActor', type: 'handler', description: 'Turns an actorId into a display name for the tooltip. Defaults to the id itself.' },
  ],
  defaults: { defaultExpanded: false, add: 'auto', size: 'md' },
  dimensions: {
    /** Between pills on one line. */
    gap: token('space-1'),
    /** Between wrapped lines; the same step, so the grid reads as a grid. */
    rowGap: token('space-1'),
    /** Clears the bubble above it. */
    marginBlockStart: token('space-1'),
  },
  // The bar paints nothing of its own: every pill is its own surface, and a
  // background here would box the row against the transcript.
  paint: {},
  states: [
    { name: 'default', description: 'One or more pills, wrapped onto as many lines as they need, up to the cap.' },
    {
      name: 'empty',
      description:
        'No reactions and no add chip: the component returns nothing. Not an empty div — a zero-height box still eats the message stack\'s row gap, which is how a transcript ends up with mysterious extra space under half its messages.',
      behavioral: true,
    },
    {
      name: 'overflow',
      description:
        'More emoji than the cap. The first `cap` pills stay exactly where they were and the tail collapses into a "+N" chip; pressing it expands in place rather than opening anything.',
      behavioral: true,
    },
  ],
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: ['space-1', 'duration-fast', 'ease-out'],
  a11y: {
    role: 'toolbar',
    focusable: false,
    keyboard: [
      { keys: 'Tab', action: 'Enters the bar at the pill that last had focus, and leaves it entirely. One tab stop, not one per pill.' },
      { keys: 'ArrowLeft, ArrowRight', action: 'Moves between pills, wrapping at the ends. Inverted under RTL.' },
      { keys: 'Home, End', action: 'Jumps to the first or last pill.' },
      { keys: 'Enter, Space', action: 'Toggles the focused pill.' },
    ],
    notes: [
      'A roving tabindex, not one tab stop per pill: a transcript with fifty messages and six reactions each would otherwise be three hundred tab stops between the reader and the composer.',
      'Labelled as a toolbar named "Reactions", so the group is announced before its contents rather than as a loose run of buttons.',
      'The cap never reorders. A viewer\'s own reaction past the cap stays past the cap — hoisting it would break the first-appearance invariant that keeps a chip from moving out from under a finger.',
    ],
  },
  motion: {
    description:
      'Pills fade in where they land and never slide: first-appearance order means a new emoji only ever appends, so there is no reflow to animate and nothing to chase.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
