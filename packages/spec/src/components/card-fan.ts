import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** How wide each item is drawn, which sets the fan's whole scale. */
export const cardFanSizes = ['sm', 'md', 'lg'] as const;

export const cardFanSpec: ComponentSpec = {
  name: 'CardFan',
  id: 'card-fan',
  category: 'organism',
  status: 'draft',
  summary:
    'A hand of cards spread along a fixed arc, dense at its ends and opening up around the pointer — so forty items occupy the same strip as seven and stay separable.',
  element: 'ul',
  anatomy: [
    { name: 'fan', description: 'The track. A fixed length that the items are distributed across, which is what stops the fan overflowing however many it holds.', required: true },
    { name: 'item', description: 'One card: placed by fraction along the track, leaned and bowed by its place in the fan.', required: true },
    { name: 'content', description: 'The card body, rendered by the caller.', required: true },
    { name: 'lift', description: 'The inner layer the magnification raises, so the card grows out of the fan without moving its footprint.' },
  ],
  props: [
    { name: 'items', type: 'array', required: true, item: { type: 'object', description: 'A card: id, and whatever else the renderer needs.' }, description: 'The cards, in the order they sit along the fan.' },
    { name: 'renderItem', type: 'handler', required: true, description: 'Renders one card\'s content. The placement, lean and magnification are the fan\'s.' },
    { name: 'getLabel', type: 'handler', description: 'The name announced for a card. Defaults to its id, which is rarely what a person wants read aloud.' },
    { name: 'selected', type: 'string', description: 'The id of the raised card, for a fan that holds a choice.' },
    { name: 'onSelect', type: 'handler', description: 'Called with a card\'s id when it is chosen, by pointer or from the keyboard.' },
    { name: 'size', type: 'enum', values: cardFanSizes, default: 'md', description: 'Card width, which scales the arc with it.' },
    { name: 'spread', type: 'number', default: 1, description: 'Multiplies how far the fan leans and bows. 0 lays it flat into a row.' },
    { name: 'magnify', type: 'boolean', default: true, description: 'Grows the card under the pointer and its near neighbours.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Freezes the fan and drops its cards from the tab order.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders placeholder cards at the exact geometry.' },
  ],
  defaults: { size: 'md', spread: 1, magnify: true, disabled: false, skeleton: false },
  dimensions: {
    radius: token('radius-lg'),
    gap: token('space-2'),
    border: token('hairline'),
    // Card widths, written as CSS lengths and passed through verbatim by both
    // bindings. Not `sizes`: that carries the schema's control measures —
    // height, padding, and the like — and a card's width is not one of them.
    // The fan scales its whole arc from this, so the three are the size scale.
    widthSm: '5rem',
    widthMd: '8.25rem',
    widthLg: '11rem',
  },
  states: [
    { name: 'default', description: 'At rest: evenly weighted, so the density falls at the ends and the middle carries the room.' },
    {
      name: 'hover',
      description: 'The fan opens around the pointer. The focused card claims more track and grows; the rest keep their weight but have less track left, so they bunch toward the far side.',
      tokens: { shadow: token('shadow-3') },
    },
    {
      name: 'selected',
      description: 'A chosen card stays raised after the pointer leaves, so the fan can hold a decision rather than only reacting.',
      tokens: { border: token('accent-border'), shadow: token('shadow-3') },
    },
    { name: 'disabled', description: 'Halved opacity; cards leave the tab order entirely rather than being focusable and inert.' },
    { name: 'skeleton', description: 'Cards keep their exact placement, so the fan does not reshape when the real content lands.' },
  ],
  paint: {
    background: token('surface'),
    text: token('text'),
    border: token('border'),
  },
  focusRing: { ring: token('accent-soft'), offset: '2px' },
  transition: { duration: token('duration-normal'), ease: token('ease-out') },
  tokens: [
    'surface', 'surface-raised', 'border', 'border-strong',
    'text', 'text-muted',
    'accent-soft', 'accent-border', 'shadow-2', 'shadow-3',
    'space-1', 'space-2', 'radius-lg', 'hairline',
    'font-size-sm', 'duration-normal', 'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'listbox',
    focusable: true,
    keyboard: [
      { keys: 'Tab', action: 'Moves into the fan, landing on the selected card or the first one.' },
      { keys: 'ArrowLeft, ArrowRight', action: 'Moves along the fan one card, clamped at both ends.' },
      { keys: 'Home, End', action: 'Jumps to the near or the far end.' },
      { keys: 'Space, Enter', action: 'Chooses the focused card.' },
    ],
    notes: [
      'A fan is a list of choices, so it is a listbox rather than a decorative stack: each card is an option with a name, and the selected one is reported as such.',
      'Roving focus — one card is tabbable and the arrows move within, so Tab leaves the fan rather than walking forty cards.',
      'The keyboard moves the focus and the fan opens around it, so the same spreading that helps a pointer helps someone who has none.',
      'Magnification is suppressed under reduced motion; the layout still opens, because the spread is what makes a large fan legible rather than an embellishment on it.',
    ],
  },
  motion: {
    description:
      'Cards settle into their place along the track rather than snapping, and the magnification eases separately. The two are kept apart on purpose: placement animates the track position while the transform stays free for the lean, the bow and any drag. Under reduced motion both are dropped and cards move straight to their placements — the spread itself stays, because it is what makes a large fan legible rather than an embellishment on it.',
    transition: { speed: 'normal', ease: 'out' },
  },
};
