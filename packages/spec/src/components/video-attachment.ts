import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** Where the duration badge sits over the poster. */
export const videoBadgePlacements = ['start', 'end'] as const;

export const videoAttachmentSpec: ComponentSpec = {
  name: 'VideoAttachment',
  id: 'video-attachment',
  category: 'molecule',
  status: 'draft',
  summary:
    'A video sent in a message, at rest: the poster frame in a reserved box, a duration badge, and one play affordance. Playback belongs to the app, which is handed onPlay.',
  element: 'div',
  anatomy: [
    { name: 'frame', description: 'The reserved aspect-ratio box holding the poster.', required: true },
    { name: 'poster', description: 'The still frame, an ImageAttachment in fill mode.' },
    { name: 'play', description: 'The centred play control; the whole frame activates it.', required: true },
    { name: 'duration', description: 'The running time, over the poster, in tabular figures.' },
  ],
  props: [
    {
      name: 'attachment',
      type: 'object',
      required: true,
      description: 'The ChatAttachment: its intrinsic size, file name, and durationMs.',
      fields: [
        { name: 'id', type: 'string', required: true, description: 'Stable identity and render key.' },
        { name: 'fileName', type: 'string', description: 'The fallback accessible name.' },
        { name: 'width', type: 'number', description: 'Intrinsic pixel width, used to reserve the box.' },
        { name: 'height', type: 'number', description: 'Intrinsic pixel height, used to reserve the box.' },
        { name: 'durationMs', type: 'number', description: 'Running time, shown as the badge.' },
      ],
    },
    { name: 'poster', type: 'string', description: 'Poster frame URL. Without one the frame is a muted film-slate placeholder rather than a hole.' },
    { name: 'alt', type: 'string', description: 'What the sender said the video is; falls back to the file name, then the localized kind word.' },
    { name: 'onPlay', type: 'handler', description: 'Called when the play affordance is activated. Playback itself is out of scope.' },
    { name: 'badge', type: 'enum', values: videoBadgePlacements, default: 'end', description: 'Which bottom corner the duration badge sits in.' },
    { name: 'loading', type: 'boolean', default: false, description: 'The poster is still on its way; the box is already reserved.' },
    { name: 'maxWidth', type: 'string', description: 'Caps the frame width, e.g. a bubble\'s content width.' },
    { name: 'labels', type: 'object', description: 'Localized strings for the control and the kind fallback.', fields: [
      { name: 'video', type: 'string', description: 'Spoken when there is neither alt text nor a file name, e.g. "Video".' },
      { name: 'play', type: 'string', description: 'The play action, with a {name} slot, e.g. "Play {name}".' },
    ] },
  ],
  defaults: { badge: 'end', loading: false },
  dimensions: {
    radius: token('radius-lg'),
    badgeRadius: token('radius-full'),
    badgeInset: token('space-2'),
    badgePaddingInline: token('space-2'),
  },
  states: [
    {
      name: 'hover',
      description: 'The play control brightens to its solid accent; the poster itself never dims, so the frame does not flicker under a moving pointer.',
      tokens: { play: token('accent-solid-hover') },
    },
    {
      name: 'loading',
      description: 'The reserved box with a shimmer in it, at the final geometry.',
      tokens: { background: token('surface-sunken') },
    },
  ],
  paint: { background: '$surface-sunken' },
  focusRing: { ring: token('focus-ring'), offset: '2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'surface-sunken', 'focus-ring', 'radius-lg', 'radius-full',
    'space-2', 'glass-thick', 'text', 'accent-solid', 'accent-solid-hover', 'accent-contrast',
    'font-size-xs', 'font-mono', 'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'button',
    focusable: true,
    keyboard: [{ keys: 'Enter, Space', action: 'Plays the video.' }],
    notes: [
      'The frame is one button, not a poster with a separate play glyph on it: a play triangle floating over a clickable image is two targets for one intent.',
      'Its name is the play action over the attachment\'s name, so a screen reader hears what will play rather than "button".',
      'The duration badge is decorative — it is folded into the button\'s name, so it is not announced twice.',
    ],
  },
  motion: {
    description: 'The play control eases its fill on hover and dips on press; the poster never animates.',
    press: true,
    transition: { speed: 'fast', ease: 'out' },
  },
};
