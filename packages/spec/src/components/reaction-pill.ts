import type { ComponentSpec } from '../schema.ts';
import { compactSizes, token } from '../vocab.ts';

/**
 * What pressing a pill is asking the server to do. Exported as a const array so
 * the spec, commons, and both bindings derive one enum instead of each spelling
 * the same two words.
 */
export const reactionIntents = ['add', 'remove'] as const;

export const reactionPillSpec: ComponentSpec = {
  name: 'ReactionPill',
  id: 'reaction-pill',
  category: 'atom',
  status: 'draft',
  summary:
    'One emoji and its tally on a message, as a toggle: pressing it adds or removes the viewer\'s own reaction, and the "you reacted" state paints the accent tint the rest of the kit uses for an engaged toggle.',
  element: 'button',
  anatomy: [
    {
      name: 'body',
      description:
        'The single child holding the glyph and the count. One child, not two, so the host chip\'s own gap never lands between an emoji and the number that belongs to it.',
      required: true,
    },
    { name: 'emoji', description: 'The glyph, hidden from assistive tech — the pill\'s accessible name already names it.', required: true },
    { name: 'count', description: 'How many people reacted, in tabular figures so a bar does not jitter as counts tick.', required: true },
  ],
  props: [
    { name: 'emoji', type: 'string', required: true, description: 'The glyph, compared as-is; the caller owns any normalisation.' },
    { name: 'count', type: 'number', required: true, description: 'How many people reacted with this emoji.' },
    {
      name: 'reactedByViewer',
      type: 'boolean',
      default: false,
      description: 'The viewer is one of them. Paints the engaged state and decides whether a press adds or removes.',
    },
    {
      name: 'pending',
      type: 'boolean',
      default: false,
      description:
        'An add or remove is in flight. Lowers the pill\'s emphasis without changing its geometry, and never disables it.',
    },
    { name: 'size', type: 'enum', values: compactSizes, default: 'md', description: 'Compact size step, shared with FilterChip.' },
    { name: 'label', type: 'string', description: 'The accessible name, e.g. "👍, 3 reactions, you reacted". Built by the caller from the shared templates.' },
    { name: 'actors', type: 'array', item: { type: 'string', description: 'One display name.' }, description: 'Who reacted, first-seen order; the hover tooltip\'s list.' },
    { name: 'onToggle', type: 'handler', description: 'Called with the emoji and the intent (add or remove) the press is asking for.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Dims the pill and blocks toggling. Not what `pending` uses.' },
  ],
  defaults: { reactedByViewer: false, pending: false, size: 'md', disabled: false },
  sizes: [
    { name: 'sm', height: '1.375rem', paddingInline: token('space-1'), fontSize: token('font-size-xs') },
    { name: 'md', height: '1.75rem', paddingInline: token('space-2'), fontSize: token('font-size-sm') },
  ],
  dimensions: {
    radius: token('radius-full'),
    /** Between the glyph and its count, inside the body. */
    gap: token('space-1'),
    border: token('hairline'),
  },
  // Rest paint is FilterChip's unselected chip: a hairline outline on nothing.
  // The pill IS a FilterChip in the DOM binding, so these must stay in step.
  paint: { text: token('text-muted'), border: token('border-strong') },
  states: [
    { name: 'default', description: 'Nobody the viewer knows about reacted with this emoji yet; a quiet outlined capsule.' },
    { name: 'hover', description: 'Lifts to the hover wash and full-strength text, so the whole capsule reads as the target.', tokens: { background: token('hover'), text: token('text') } },
    {
      name: 'reacted',
      description:
        'The viewer reacted. aria-pressed is true and the capsule fills with the accent soft tint — the same paint an engaged FilterChip carries, so "mine" reads the same everywhere in the kit.',
      tokens: { background: token('accent-soft'), border: token('accent-border'), text: token('accent-text') },
    },
    { name: 'reacted-hover', description: 'A reacted pill deepens to the accent soft hover fill.', tokens: { background: token('accent-soft-hover') } },
    {
      name: 'pending',
      description:
        'An add or remove is in flight: the label and hairline drop to their quiet tokens and the glyph dims. Emphasis only — no spinner, no size change — because the bar must not reflow while an acknowledgement lands. aria-pressed already shows the OPTIMISTIC outcome, so a screen reader hears what the user asked for rather than the stale truth.',
      tokens: { text: token('text-subtle'), border: token('border-subtle') },
    },
    { name: 'focus-visible', description: 'A 2px focus ring blooms outward, offset clear of the capsule.', tokens: { ring: token('focus-ring') } },
    { name: 'disabled', description: 'Halved opacity and a not-allowed cursor; presses are ignored.' },
  ],
  focusRing: { ring: token('focus-ring'), offset: '2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'space-1', 'space-2', 'radius-full', 'hairline', 'font-sans', 'font-weight-medium',
    'font-size-xs', 'font-size-sm', 'duration-fast', 'ease-out',
    'border-strong', 'border-subtle', 'text-muted', 'text', 'text-subtle', 'hover',
    'accent-soft', 'accent-soft-hover', 'accent-border', 'accent-text', 'focus-ring',
  ],
  a11y: {
    role: 'button',
    focusable: true,
    keyboard: [
      { keys: 'Enter, Space', action: 'Adds the viewer\'s reaction, or removes it when they already reacted.' },
      { keys: 'Arrows', action: 'Handled by the ReactionBar toolbar around it, not by the pill.' },
    ],
    notes: [
      'The accessible name is the whole state — glyph, tally, and whether the viewer reacted — not just the emoji: "👍, 3 reactions, you reacted". A pill named only "👍" tells a screen-reader user nothing about what pressing it will do.',
      'The visible glyph and count are aria-hidden, because the label already spells both; without that they would be announced a second time as raw text.',
      'aria-pressed carries the viewer\'s own state, so the toggle is machine-readable rather than only painted.',
      'A pending pill is never `disabled`: disabling the element under the user\'s finger drops focus and strands a keyboard user mid-row.',
    ],
  },
  motion: {
    description: 'Presses dip by the shared compact press scale; the fill crossfades. Counts never animate — a number sliding is a number you cannot read.',
    press: true,
    transition: { speed: 'fast', ease: 'out' },
  },
};
