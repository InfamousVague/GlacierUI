import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const threadIndicatorSpec: ComponentSpec = {
  name: 'ThreadIndicator',
  id: 'thread-indicator',
  category: 'molecule',
  status: 'draft',
  summary:
    'The footer that opens a thread: the faces of who replied, how many replies there are, and when the last one landed.',
  element: 'button',
  anatomy: [
    { name: 'row', description: 'The whole strip, a button that opens the thread.', required: true },
    { name: 'faces', description: 'Who took part, as a slot. The stacking itself belongs to AvatarGroup; this component only reserves the space and hides it from assistive tech, since the reply count already says how many people are in there.' },
    { name: 'count', description: 'How many replies, in the accent family — this is the link, and it should read like one.', required: true },
    { name: 'activity', description: 'When the last reply landed, in the subtle colour. It follows the count rather than being pinned to the trailing edge, so the strip stays as wide as its content.' },
  ],
  props: [
    { name: 'count', type: 'number', required: true, description: 'How many replies the thread holds.' },
    { name: 'participants', type: 'node', description: 'The faces, as a slot — compose an AvatarGroup. A node rather than a list of people, because who renders a stack of avatars is not this component’s decision.' },
    { name: 'lastActivityAt', type: 'number', description: 'Epoch milliseconds of the last reply. Spelled by the shared message-timestamp ladder.' },
    { name: 'now', type: 'number', description: 'The moment to measure against. Injected rather than read from the clock, so a screenshot and a test are not time-dependent.' },
    { name: 'label', type: 'node', description: 'Overrides the reply count wording, for a language the two-form catalog cannot spell.' },
    { name: 'activity', type: 'node', description: 'Overrides the formatted last-activity time.' },
    { name: 'onPress', type: 'handler', description: 'Opens the thread.' },
    { name: 'unread', type: 'boolean', default: false, description: 'The thread has replies this reader has not seen: the count goes semibold and keeps the accent, so unread survives greyscale.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
  ],
  defaults: { unread: false, skeleton: false },
  dimensions: {
    gap: token('space-2'),
    paddingBlock: token('space-1'),
    paddingInline: token('space-2'),
    radius: token('radius-md'),
  },
  paint: { text: token('accent-text') },
  states: [
    {
      name: 'hover',
      description: 'A soft accent wash behind the strip and the count underlined, so it reads as the link it is.',
      paint: { background: token('accent-soft') },
    },
    {
      name: 'focus-visible',
      description: 'The kit focus ring around the whole strip, faces included, since the whole strip is one target.',
      tokens: { ring: token('focus-ring') },
    },
    {
      name: 'unread',
      description: 'The count steps up to semibold. Weight rather than a dot, because the strip already carries a number and a badge beside a count is two ways of saying the same thing.',
      tokens: { count: token('accent-text'), weight: token('font-weight-semibold') },
    },
    { name: 'skeleton', description: 'A circle for the faces and a short text line for the count, at the exact geometry.' },
  ],
  focusRing: { ring: token('focus-ring'), offset: '2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'space-1', 'space-2', 'radius-md',
    'accent-text', 'accent-soft', 'text-subtle',
    'font-size-xs', 'font-size-sm', 'font-weight-medium', 'font-weight-semibold',
    'focus-ring', 'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'button',
    focusable: true,
    keyboard: [
      { keys: 'Tab', action: 'One stop for the whole strip — the faces are not separately reachable.' },
      { keys: 'Space, Enter', action: 'Opens the thread.' },
    ],
    notes: [
      'One button, not a row of them. The faces are decorative here: their names are already in the thread, and making each one focusable puts five extra tab stops under every message that has a reply.',
      'The accessible name is the reply count plus the last-activity time, so activating it is an informed choice rather than "button".',
      'The reply count is a real number in the text, never only a badge — a count that exists solely as a coloured pill is a count a screen reader has to guess at.',
      'Unread is carried by font weight as well as colour, so it survives greyscale.',
    ],
  },
  motion: {
    press: true,
    description: 'A compact press dip and a wash on hover. The faces never animate: a stack of avatars that moves on hover is a distraction inside a transcript.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
