import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/**
 * What a system line reports. The union and the glyph table live in
 * @glacier/logic (`SystemMessageKind`); the names are repeated here so the
 * contract reads on its own in the generated JSON.
 */
export const systemMessageKinds = ['info', 'join', 'leave', 'topic', 'call'] as const;

export const systemMessageSpec: ComponentSpec = {
  name: 'SystemMessage',
  id: 'system-message',
  category: 'atom',
  status: 'draft',
  summary:
    'The transcript narrating itself: a centred, quiet line for joins, leaves, topic changes, and ended calls, shaped so it reads as chrome rather than as somebody speaking.',
  element: 'div',
  anatomy: [
    { name: 'row', description: 'The centred line. Capped well short of the transcript width so a long notice wraps into a block rather than spanning the column like a message.', required: true },
    { name: 'icon', description: 'A small leading glyph naming the kind of event. Decorative — the sentence already says what happened.' },
    { name: 'text', description: 'What happened, in the caller’s own words.', required: true },
    { name: 'timestamp', description: 'When it happened, in the same subtle colour, appended inline rather than pinned to an edge.' },
  ],
  props: [
    { name: 'kind', type: 'enum', values: systemMessageKinds, default: 'info', description: 'What the line reports. Chooses the default glyph; the wording is always the caller’s.' },
    { name: 'icon', type: 'node', description: 'Overrides the kind’s glyph. Pass null to drop it.' },
    { name: 'timestamp', type: 'node', description: 'When it happened, appended after the text.' },
    { name: 'children', type: 'node', required: true, description: 'What happened.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
  ],
  defaults: { kind: 'info', skeleton: false },
  dimensions: {
    gap: token('space-2'),
    paddingBlock: token('space-2'),
    paddingInline: token('space-4'),
    radius: token('radius-full'),
    /** The line stops here rather than at the transcript edge; see the anatomy note. */
    maxWidth: token('container-sm'),
  },
  paint: { text: token('text-subtle') },
  states: [
    { name: 'skeleton', description: 'A centred text placeholder at the exact line box.' },
  ],
  tokens: [
    'space-2', 'space-4', 'radius-full', 'container-sm',
    'text-subtle', 'font-size-xs', 'leading-xs', 'size-sm',
  ],
  a11y: {
    focusable: false,
    notes: [
      'No role and no live region. A system line is ordinary content in the reading order: it is already in the transcript at the point it happened, and announcing it out of band would read it twice.',
      'Deliberately NOT a separator, even though it looks like a labelled divider. role="separator" makes a screen reader say "separator" and then skip past the sentence, which is exactly backwards — the words are the content and the centring is the decoration.',
      'The icon is aria-hidden: the sentence already names the event, and a glyph that repeats it turns "Ana joined" into "user plus Ana joined".',
      'It reads as chrome by being smaller, subtler, centred, and narrower than a message — never by being hidden from anyone.',
    ],
  },
  motion: { description: 'Static. A join notice that animates is a notification; this is a record.' },
};
