import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** Which family the leading rule and the author line paint. */
export const quotedMessageTones = ['accent', 'neutral'] as const;

export const quotedMessageSpec: ComponentSpec = {
  name: 'QuotedMessage',
  id: 'quoted-message',
  category: 'molecule',
  status: 'draft',
  summary:
    'The reply context block: who is being answered, a truncated line of what they said, an accent rule down the leading edge, and a press target that jumps to the original.',
  element: 'button',
  anatomy: [
    { name: 'block', description: 'The quote itself. A button when a jump handler is given, an inert box when it is not.', required: true },
    { name: 'rule', description: 'The bar down the leading edge. Logical, not physical: it follows the writing direction, because a quote rule marks where the text begins.', required: true },
    { name: 'author', description: 'Who is being quoted, in the tone’s text colour and one weight up, so the eye lands on the name first.', required: true },
    { name: 'snippet', description: 'What they said: whitespace collapsed to one string, cut on a word boundary at 100 characters, then clamped to two lines.' },
    { name: 'preview', description: 'A thumbnail for a quoted image or file, on the trailing edge so it never pushes the author line off.' },
  ],
  props: [
    { name: 'author', type: 'node', required: true, description: 'Who is being quoted.' },
    { name: 'text', type: 'string', description: 'What they said. Truncated by the shared quoted-snippet rule, so both bindings cut at the same character.' },
    { name: 'placeholder', type: 'node', description: 'Stands in for a quote with no text — “Photo”, “Voice message”. The caller supplies the wording, since only it knows what was attached.' },
    { name: 'preview', type: 'node', description: 'A thumbnail of the quoted attachment.' },
    { name: 'tone', type: 'enum', values: quotedMessageTones, default: 'accent', description: 'Which family the rule and author line paint. Neutral is for a quote inside an already-accented bubble, where a second accent would fight the first.' },
    { name: 'onPress', type: 'handler', description: 'Jumps to the original. Omit it and the block renders inert, with no focus stop and no hover.' },
    { name: 'label', type: 'string', description: 'Overrides the accessible name of the jump target; defaults to naming the author and the snippet.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
  ],
  defaults: { tone: 'accent', skeleton: false },
  variants: [
    {
      name: 'accent',
      description: 'The default: an accent rule and an accent author line over a soft accent wash.',
      paint: { background: token('accent-soft'), text: token('text-muted'), border: token('accent-solid') },
      tokens: { author: token('accent-text') },
    },
    {
      name: 'neutral',
      description: 'For a quote nested inside an accented bubble, where a second accent would fight the first: the rule drops to the strong border grey and the author to plain text.',
      paint: { background: token('surface-sunken'), text: token('text-muted'), border: token('border-strong') },
      tokens: { author: token('text') },
    },
  ],
  dimensions: {
    gap: token('space-1'),
    paddingBlock: token('space-2'),
    paddingInline: token('space-3'),
    radius: token('radius-md'),
    /** The leading rule's thickness. */
    border: token('space-px'),
    rule: '0.1875rem',
  },
  states: [
    {
      name: 'hover',
      description: 'Only when it can jump: the wash deepens a step. An inert quote never lights up, so a block that cannot be pressed never looks like it can.',
      paint: { background: token('accent-soft-hover') },
    },
    {
      name: 'focus-visible',
      description: 'The kit focus ring, offset clear of the leading rule so the two do not read as one thick bar.',
      tokens: { ring: token('focus-ring') },
    },
    { name: 'skeleton', description: 'Two placeholder lines — a short one for the author, a long one for the snippet — behind the same rule, so the bubble holds its height.' },
  ],
  focusRing: { ring: token('focus-ring'), offset: '2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'space-px', 'space-1', 'space-2', 'space-3', 'radius-md',
    'accent-soft', 'accent-soft-hover', 'accent-solid', 'accent-text',
    'surface-sunken', 'border-strong', 'text', 'text-muted',
    'font-size-xs', 'font-size-sm', 'font-weight-semibold', 'focus-ring',
    'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'button',
    focusable: true,
    keyboard: [
      { keys: 'Tab', action: 'Reaches the quote only when it can jump; an inert quote is not a focus stop.' },
      { keys: 'Space, Enter', action: 'Jumps to the quoted message.' },
    ],
    notes: [
      'The accessible name names the author and the snippet, so a screen reader user hears what they are jumping to rather than "button".',
      'A quote with no handler renders as a plain box: putting a focus stop in a transcript that does nothing when activated is worse than no affordance at all.',
      'The snippet is truncated in the STRING, not only by CSS, so what a screen reader reads matches what the eye sees — a visually clipped line still reads out in full.',
      'The leading rule is a logical inline-start border, so it moves to the right edge under RTL along with the text it marks.',
    ],
  },
  motion: {
    press: true,
    description: 'A compact press dip and a one-step wash change on hover, both only when the quote can jump.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
