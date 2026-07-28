import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** Corner radius steps an attachment frame supports, from the radius scale. */
export const imageAttachmentRadii = ['none', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

export const imageAttachmentSpec: ComponentSpec = {
  name: 'ImageAttachment',
  id: 'image-attachment',
  category: 'molecule',
  status: 'draft',
  summary:
    'A photo sent in a message: the box is reserved from the intrinsic size before the bytes land, a placeholder holds it, and a very tall or very wide picture is clamped so it cannot take over the transcript.',
  element: 'div',
  anatomy: [
    {
      name: 'frame',
      description:
        'The reserved aspect-ratio box. It exists before the image does, which is what keeps an arriving photo from shifting the messages around it.',
      required: true,
    },
    {
      name: 'placeholder',
      description:
        'The blurhash, thumbhash, or dominant-colour stand-in painted under the image while it loads. Any node; the kit does not decode hashes.',
    },
    { name: 'image', description: 'The Image atom, filling the frame with object-fit cover.', required: true },
    { name: 'trigger', description: 'The full-frame button that opens the photo, present only when onOpen is given.' },
  ],
  props: [
    {
      name: 'attachment',
      type: 'object',
      required: true,
      description: 'The ChatAttachment: its url, intrinsic width and height, and file name.',
      fields: [
        { name: 'id', type: 'string', required: true, description: 'Stable identity and render key.' },
        { name: 'url', type: 'string', description: 'Where the bytes are.' },
        { name: 'fileName', type: 'string', description: 'As the user sees it; the fallback accessible name.' },
        { name: 'width', type: 'number', description: 'Intrinsic pixel width, used to reserve the box.' },
        { name: 'height', type: 'number', description: 'Intrinsic pixel height, used to reserve the box.' },
      ],
    },
    {
      name: 'alt',
      type: 'string',
      description:
        'What the sender said the picture is. Omitted, the file name speaks; with neither, the localized kind fallback does. Never announces nothing.',
    },
    { name: 'placeholder', type: 'node', description: 'Painted under the image until it decodes; replaces the shimmer when given.' },
    { name: 'loading', type: 'boolean', default: false, description: 'The bytes are still on their way; the frame holds its box and shows a placeholder.' },
    {
      name: 'fill',
      type: 'boolean',
      default: false,
      description: 'Fills the parent box instead of reserving its own ratio. How ImageGrid places a tile.',
    },
    { name: 'radius', type: 'enum', values: imageAttachmentRadii, default: 'lg', description: 'Corner radius from the radius scale.' },
    { name: 'maxWidth', type: 'string', description: 'Caps the frame width, e.g. a bubble\'s content width. A number is read as px.' },
    { name: 'onOpen', type: 'handler', description: 'Opens the photo full size. Given, the whole frame becomes one labelled button.' },
    { name: 'labels', type: 'object', description: 'Localized strings: the kind fallback and the open action.', fields: [
      { name: 'image', type: 'string', description: 'Spoken when there is neither alt text nor a file name, e.g. "Photo".' },
      { name: 'open', type: 'string', description: 'The open action, with a {name} slot, e.g. "Open {name}".' },
    ] },
  ],
  defaults: { loading: false, fill: false, radius: 'lg' },
  dimensions: {
    radius: token('radius-lg'),
  },
  states: [
    {
      name: 'loading',
      description: 'The reserved box with the placeholder or the shimmer in it; the geometry is already final, so nothing moves when the image arrives.',
      tokens: { background: token('surface-sunken') },
    },
    {
      name: 'clamped',
      description:
        'The intrinsic ratio was outside the min and max, so the frame crops. Marked in the DOM (data-clamped) so an app can offer "see the whole thing".',
      tokens: { background: token('surface-sunken') },
    },
  ],
  paint: { background: '$surface-sunken' },
  focusRing: { ring: token('focus-ring'), offset: '2px' },
  transition: { duration: token('duration-normal'), ease: token('ease-out') },
  tokens: [
    'surface-sunken', 'focus-ring', 'radius-lg', 'radius-md', 'radius-sm', 'radius-xl', 'radius-2xl', 'radius-none',
    'duration-normal', 'ease-out',
  ],
  a11y: {
    role: 'img',
    focusable: false,
    notes: [
      'An attachment is the message, so its accessible name is never empty: the sender\'s alt text, else the file name, else a localized kind word.',
      'With onOpen the frame is a single button carrying that name, and the image inside goes decorative so the name is not announced twice.',
      'The placeholder and the loading shimmer are decorative and hidden from assistive tech.',
    ],
  },
  motion: {
    description: 'The image cross-fades over the placeholder as it decodes; the frame itself never animates its size, because the box was already final.',
    transition: { speed: 'normal', ease: 'out' },
  },
};
