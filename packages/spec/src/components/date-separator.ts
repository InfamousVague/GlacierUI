import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** How a day separator sits in the transcript. */
export const dateSeparatorVariants = ['rule', 'chip'] as const;

export const dateSeparatorSpec: ComponentSpec = {
  name: 'DateSeparator',
  id: 'date-separator',
  category: 'molecule',
  status: 'draft',
  summary:
    'The day divider in a transcript: a quiet label naming the day, either centred on a hairline rule or floating as a chip that sticks to the top edge while its day scrolls past.',
  element: 'div',
  anatomy: [
    { name: 'root', description: 'The row, and the sticky element when pinning is on.', required: true },
    { name: 'rule', description: 'The hairline running out to each edge. Dropped in the chip variant.' },
    { name: 'label', description: 'The day, spelled by the caller\'s locale.', required: true },
  ],
  props: [
    { name: 'label', type: 'node', description: 'The spelled day. Supply it, or supply `at` and let the separator spell it.' },
    { name: 'at', type: 'number', description: 'The day, as epoch millis. Spelled through transcriptDayLabel when no label is given.' },
    { name: 'now', type: 'number', description: 'Instant `at` is read against; injectable so the row renders deterministically.' },
    { name: 'locale', type: 'string', description: 'BCP-47 tag for the date formatter.' },
    { name: 'labels', type: 'object', description: 'Translated "Today" and "Yesterday", merged over the shared English defaults.' },
    { name: 'variant', type: 'enum', values: dateSeparatorVariants, default: 'rule', description: 'Rule sits the label on a hairline; chip floats it as a pill, which is what a pinned separator wants so the content can pass underneath.' },
    { name: 'sticky', type: 'boolean', default: false, description: 'Pins the row to the viewport\'s top edge while its day scrolls past. Web only — see the native binding\'s header.' },
  ],
  defaults: { variant: 'rule', sticky: false },
  dimensions: {
    gap: token('space-3'),
    paddingBlock: token('space-2'),
    chipPaddingInline: token('space-3'),
    chipPaddingBlock: token('space-1'),
    radius: token('radius-full'),
    thickness: token('hairline'),
  },
  variants: [
    {
      name: 'rule',
      description: 'A muted label centred on a hairline that runs to both edges — the resting form, when the row scrolls with the content.',
      paint: { text: token('text-muted'), border: token('border') },
    },
    {
      name: 'chip',
      description: 'A raised pill with no rule, so content passing beneath a pinned separator stays legible instead of being crossed out by a line.',
      paint: { background: token('surface-raised'), text: token('text-muted'), border: token('border-subtle') },
    },
  ],
  states: [
    { name: 'default', description: 'Scrolling with the transcript.' },
    {
      name: 'stuck',
      description: 'Pinned at the top edge while its day scrolls past. The chip gains a shadow so it reads as floating above the messages rather than sitting among them.',
      tokens: { shadow: token('shadow-1') },
    },
  ],
  tokens: [
    'space-1', 'space-2', 'space-3', 'radius-full', 'hairline',
    'text-muted', 'border', 'border-subtle', 'surface-raised', 'shadow-1',
    'font-size-xs', 'font-weight-medium',
  ],
  a11y: {
    role: 'separator',
    focusable: false,
    notes: [
      'A separator with an accessible name: the visible text is aria-hidden and the day is carried on aria-label, because a screen reader reading the contents of a role="separator" is not something the role guarantees.',
      'It is not a heading. A transcript can hold hundreds of these, and filling a reader\'s heading list with dates buries the headings the surrounding page actually has.',
      'Pinning is purely visual. The row keeps its position in the reading order whether or not it is stuck, so the transcript still reads in order.',
    ],
  },
  motion: {
    description: 'No entrance. A day row appears because the reader scrolled to a new day, and animating it would draw the eye to the least interesting thing on screen.',
  },
};
