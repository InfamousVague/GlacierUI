import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const unreadDividerSpec: ComponentSpec = {
  name: 'UnreadDivider',
  id: 'unread-divider',
  category: 'molecule',
  status: 'draft',
  summary:
    'The "new messages" rule in a transcript: an accent-tinted line with a semibold label marking where the reader left off, deliberately louder than a date row and deliberately never sticky.',
  element: 'div',
  anatomy: [
    { name: 'root', description: 'The row.', required: true },
    { name: 'rule', description: 'The accent hairline, running out to each edge.', required: true },
    { name: 'label', description: 'The "New messages" phrase, optionally with a count.', required: true },
  ],
  props: [
    { name: 'label', type: 'node', description: 'The phrase on the rule. Defaults to the shared "New messages" string.' },
    { name: 'count', type: 'number', description: 'How many messages are unread from here down. Shown as a badge when greater than zero.' },
    { name: 'labels', type: 'object', description: 'Translated strings, merged over the shared English defaults.' },
    { name: 'align', type: 'enum', values: ['start', 'center', 'end'], default: 'center', description: 'Where the label sits on the rule. Centre reads as a boundary; start reads as a heading for what follows.' },
  ],
  defaults: { align: 'center' },
  dimensions: {
    gap: token('space-3'),
    paddingBlock: token('space-2'),
    thickness: token('hairline'),
  },
  // No variant axis on purpose: this row means exactly one thing, and the moment
  // it has a quiet variant someone will use it where a date row belongs and the
  // one line in the transcript that must be unmistakable stops being so.
  paint: { text: token('accent-text'), border: token('accent-border') },
  states: [
    { name: 'default', description: 'The rule and its label, with no count.' },
    {
      name: 'counted',
      description: 'Carrying a tally of what is unread below. The count rides in a soft accent badge rather than a danger one: this is a bookmark, not an error.',
      tokens: { badge: token('accent-soft'), badgeText: token('accent-text') },
    },
  ],
  tokens: [
    'space-1', 'space-2', 'space-3', 'hairline', 'radius-full',
    'accent-text', 'accent-border', 'accent-soft',
    'font-size-xs', 'font-weight-semibold', 'tracking-xs',
  ],
  a11y: {
    role: 'separator',
    focusable: false,
    notes: [
      'A named separator, like the day row, but with a distinct accessible name so the two are never confused when read aloud — the same distinction the accent tint makes visually.',
      'It must not be sticky, and the binding does not offer the option. Its whole purpose is to mark a fixed point in the transcript; a divider that followed the top edge would be marking the viewport instead, which is the reader\'s position, not their place.',
      'It is placed against a pinned message id by insertSeparators, so it does not move as the client marks messages read. Only its count grows.',
      'Colour is never the only signal: the label spells out that these are new messages, and the count is a number rather than a dot.',
    ],
  },
  motion: {
    description: 'No entrance, and no exit when the messages below it are read. A divider that faded out while the reader was looking at it would take away the one landmark they were using.',
  },
};
