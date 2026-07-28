import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/**
 * Why the composer is not writing a fresh message.
 *
 * All three are one component, not three: they are the same strip — a lead
 * label, the quoted context, and a dismiss — differing only in glyph, tint, and
 * what dismissing means. Three components would be three chances for the strip
 * above the input to be a different height in each.
 */
export const composeContextModes = ['reply', 'edit', 'forward'] as const;

export const composeContextBannerSpec: ComponentSpec = {
  name: 'ComposeContextBanner',
  id: 'compose-context-banner',
  category: 'molecule',
  status: 'draft',
  summary:
    'The strip above a compose bar saying why this message is not a fresh one: replying to, editing, or forwarding — each with the context it refers to and a dismiss.',
  element: 'div',
  anatomy: [
    { name: 'banner', description: 'The strip, with a mode-tinted rule on its leading edge.', required: true },
    { name: 'icon', description: 'The mode glyph: a reply arrow, a pencil, a forward arrow.' },
    { name: 'lead', description: 'The localized mode line — "Replying to Ada", "Editing message", "Forwarding".', required: true },
    { name: 'preview', description: 'One clamped line of the message being answered, edited, or forwarded.' },
    { name: 'dismiss', description: 'Drops the context. What that means is the mode\'s: it abandons a reply, cancels an edit, or drops a forward.', required: true },
  ],
  props: [
    { name: 'mode', type: 'enum', values: composeContextModes, required: true, description: 'Which of the three this is.' },
    { name: 'author', type: 'node', description: 'Who the referenced message is from; named in the lead line where the mode uses it.' },
    { name: 'preview', type: 'node', description: 'The referenced text, clamped to one line.' },
    { name: 'onDismiss', type: 'handler', required: true, description: 'Called when the strip is dismissed. Always present: a context the user cannot leave is a trap.' },
    { name: 'count', type: 'number', description: 'How many messages are being forwarded; the forward lead pluralizes on it.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the strip geometry.' },
  ],
  defaults: { skeleton: false },
  variants: [
    {
      name: 'reply',
      description: 'Answering a specific message. Accent-tinted, the everyday case.',
      paint: { background: token('accent-soft'), text: token('text'), border: token('accent-solid') },
    },
    {
      name: 'edit',
      description: 'Rewriting a message already sent. Warning-tinted, because dismissing it discards the rewrite rather than just the context.',
      paint: { background: token('warning-soft'), text: token('text'), border: token('warning-solid') },
    },
    {
      name: 'forward',
      description: 'Carrying messages into this conversation. Info-tinted, and the only mode that counts.',
      paint: { background: token('info-soft'), text: token('text'), border: token('info-solid') },
    },
  ],
  dimensions: {
    gap: token('space-2'),
    radius: token('radius-md'),
    paddingBlock: token('space-2'),
    paddingInline: token('space-3'),
    rule: '3px',
  },
  states: [
    { name: 'hover', description: 'Only the dismiss control reacts; the strip itself is not a target.', tokens: { dismiss: token('text') } },
  ],
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'accent-soft', 'accent-solid', 'warning-soft', 'warning-solid', 'info-soft', 'info-solid',
    'text', 'text-muted', 'radius-md', 'space-1', 'space-2', 'space-3',
    'font-size-xs', 'font-size-sm', 'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'status',
    focusable: false,
    keyboard: [
      { keys: 'Tab', action: 'Reaches the dismiss control.' },
      { keys: 'Escape', action: 'Dismisses the context when the compose bar owns the key.' },
    ],
    notes: [
      'A status region: appearing above the input while the user is typing has to be announced, but not urgently enough to interrupt.',
      'The preview is quoted context, not a control — it is never focusable, and it is clamped rather than scrolled.',
      'The dismiss names the mode ("Cancel reply", "Cancel edit"), because "Close" does not say what will be lost.',
    ],
  },
  motion: {
    description: 'Slides down and fades in above the input at the fast duration, so the input is seen to move rather than jumping.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
