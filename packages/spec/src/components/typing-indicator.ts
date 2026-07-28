import type { ComponentSpec } from '../schema.ts';
import { compactSizes, token } from '../vocab.ts';

/**
 * How the row speaks to assistive tech. The union lives here so both bindings
 * derive it; the reasoning for the default is in `@glacier/logic`'
 * `TypingAnnounce`.
 */
export const typingAnnounceModes = ['start', 'always', 'never'] as const;

export const typingIndicatorSpec: ComponentSpec = {
  name: 'TypingIndicator',
  id: 'typing-indicator',
  category: 'atom',
  status: 'draft',
  summary:
    'Three travelling dots and a line naming who is typing, announced once at the start of a lull rather than every time someone pauses.',
  element: 'div',
  anatomy: [
    { name: 'dots', description: 'Three dots riding a staggered wave. Decorative: hidden from assistive tech, and still at rest under reduced motion.', required: true },
    { name: 'label', description: 'Who is typing, spelled by the caller’s catalog from the structured state @glacier/logic resolves.' },
    { name: 'live', description: 'A visually hidden polite live region holding the sentence captured when typing began; empty the rest of the time.' },
  ],
  props: [
    { name: 'names', type: 'array', item: { type: 'string', description: 'One typist’s display name.' }, description: 'Who is typing, in the order they should be listed. Blank names are dropped rather than rendered as a gap.' },
    { name: 'max', type: 'number', default: 2, description: 'How many names the row has room for. On overflow one slot is given back to the “and N others” phrase.' },
    { name: 'label', type: 'node', description: 'Overrides the sentence entirely, for a caller with its own formatter.' },
    { name: 'announce', type: 'enum', values: typingAnnounceModes, default: 'start', description: 'When the row speaks: once at the rising edge, on every change, or never.' },
    { name: 'size', type: 'enum', values: compactSizes, default: 'md', description: 'Compact size step; the dots and the label scale together.' },
    { name: 'dotsOnly', type: 'boolean', default: false, description: 'Drops the label and shows only the dots, for a bubble-shaped indicator inside a transcript.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
  ],
  defaults: { max: 2, announce: 'start', size: 'md', dotsOnly: false, skeleton: false },
  sizes: [
    { name: 'sm', fontSize: token('font-size-xs'), gap: token('space-1'), diameter: token('size-2xs') },
    { name: 'md', fontSize: token('font-size-sm'), gap: token('space-2'), diameter: token('size-xs') },
  ],
  dimensions: {
    radius: token('radius-full'),
    /** Between the dots themselves, tighter than the gap to the label. */
    dotGap: token('space-1'),
    /** One loop of the wave. */
    cycle: token('duration-slower'),
    /** How far each dot lags the one before it; multiplied by whole steps in commons. */
    stagger: token('duration-fast'),
  },
  paint: { text: token('text-muted') },
  states: [
    {
      name: 'typing',
      description: 'Someone is typing: the dots ride the wave and the label names them.',
      tokens: { dot: token('text-subtle') },
    },
    {
      name: 'reduced-motion',
      description: 'The wave stops and the dots rest at full opacity. The row still says who is typing, so nothing is lost — the words were always the content and the motion was always decoration.',
      tokens: { dot: token('text-subtle') },
    },
    { name: 'skeleton', description: 'A short text placeholder at the exact line box; the dots are not drawn, since a placeholder that animates is two loading states at once.' },
  ],
  tokens: [
    'space-1', 'space-2', 'size-2xs', 'size-xs', 'radius-full',
    'text-muted', 'text-subtle', 'font-size-xs', 'font-size-sm',
    'duration-fast', 'duration-slower', 'ease-in-out',
  ],
  a11y: {
    role: 'status',
    focusable: false,
    notes: [
      'The live region announces on the RISING EDGE only by default: typing flips on and off every few seconds, and a region wired straight to it narrates the same name for the length of a conversation.',
      'The sentence captured when typing began is held for as long as anyone is typing, so a second person joining changes the visible text without re-firing the region.',
      'Stopping is silent. Emptying a live region announces nothing, and "Ana stopped typing" is an interruption that reports the absence of news.',
      'The dots are aria-hidden. They carry no information the label does not, and three animated elements inside a live region is how a transcript starts stuttering.',
      'announce="always" is the opt-in for a one-to-one chat where every change matters; announce="never" is for a surface that already speaks the state some other way.',
    ],
  },
  motion: {
    description:
      'Three dots on a staggered wave, each lagging the last by one motion step. Disabled under reduced motion, where the dots hold still and the label alone carries the state — a loop that runs for the whole time someone is composing is exactly what that setting is for.',
    transition: { speed: 'slower', ease: 'in-out' },
  },
};
