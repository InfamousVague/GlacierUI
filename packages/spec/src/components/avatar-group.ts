import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** Which end of the stack sits on top. */
export const avatarStackDirections = ['first-on-top', 'last-on-top'] as const;

/**
 * The item shape both the group and the read-receipt row take. Declared once
 * here so a non-React port reads one roster contract rather than two.
 */
const avatarStackItem = {
  type: 'object' as const,
  description: 'One person in the stack.',
  fields: [
    { name: 'name', type: 'string' as const, description: 'Person name; the source of the initials fallback and of the item’s accessible name.' },
    { name: 'src', type: 'string' as const, description: 'Avatar image URL; falls back to initials then a blank placeholder.' },
    { name: 'alt', type: 'string' as const, description: 'Image alt text; defaults to name.' },
  ],
};

export const avatarGroupSpec: ComponentSpec = {
  name: 'AvatarGroup',
  id: 'avatar-group',
  category: 'molecule',
  status: 'draft',
  summary:
    'A row of Avatars overlapped into one object, capped at a maximum and trailed by a "+N" count for everyone who did not fit.',
  element: 'span',
  anatomy: [
    { name: 'avatar', description: 'One Avatar per shown person, each pulled back over the one before it by the overlap fraction.', required: true },
    { name: 'ring', description: 'The surface-coloured ring around each avatar that keeps overlapping edges apart.' },
    { name: 'count', description: 'The trailing "+N" chip standing for the people past the cap, at the same geometry as an avatar.' },
  ],
  props: [
    { name: 'avatars', type: 'array', required: true, item: avatarStackItem, description: 'The roster, in the order it should read.' },
    { name: 'max', type: 'number', default: 4, description: 'How many avatars are drawn. The count chip is extra rather than the last slot, so a roster of exactly max shows every face and no chip.' },
    { name: 'size', type: 'enum', values: ['sm', 'md', 'lg', 'xl'], default: 'md', description: 'Avatar size step; forwarded to every Avatar and to the count chip, whose geometry is read from the avatar spec.' },
    { name: 'shape', type: 'enum', values: ['circle', 'rounded'], default: 'circle', description: 'Avatar shape; forwarded to every Avatar and to the count chip.' },
    { name: 'overlap', type: 'number', default: 0.32, description: 'How much of a diameter each avatar covers of the one before it. A fraction, not a length, so the stack holds its proportions at every size step. Clamped to 0.66.' },
    { name: 'direction', type: 'enum', values: avatarStackDirections, default: 'first-on-top', description: 'Which end of the stack paints on top.' },
    { name: 'ring', type: 'boolean', default: true, description: 'Draws a surface-coloured ring around each avatar so overlapping edges separate.' },
    { name: 'label', type: 'string', description: 'Accessible name for the group; defaults to naming everyone it shows.' },
    { name: 'labels', type: 'object', description: 'Overrides for the built-in English strings (the count chip’s "N more").', fields: [{ name: 'more', type: 'string', description: 'Template for the count chip’s label, with {n} standing for the hidden count.' }] },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders placeholders with the exact stack geometry.' },
  ],
  defaults: { max: 4, size: 'md', shape: 'circle', overlap: 0.32, direction: 'first-on-top', ring: true, skeleton: false },
  // Per-size geometry is deliberately absent: every measurement that varies with
  // size (diameter, font size) is the Avatar's, read from the avatar spec through
  // the shared resolvers. Restating it here would be the same numbers in two
  // contracts, free to drift.
  dimensions: { radius: token('radius-full') },
  states: [
    {
      name: 'overflow',
      description: 'The trailing chip standing for everyone past the cap: an avatar-shaped "+N" on the hover fill.',
      paint: { background: token('hover'), text: token('text-muted') },
    },
    {
      name: 'ring',
      description: 'Each avatar sits on a surface-coloured pad, so two overlapping faces never bleed into one silhouette.',
      tokens: { ring: token('surface') },
    },
    { name: 'skeleton', description: 'Each slot loads as a placeholder at the exact avatar geometry, so the stack holds its width.' },
  ],
  // The avatars and the count chip carry the paint; the row itself is transparent.
  paint: {},
  tokens: ['radius-full', 'surface', 'hover', 'text-muted', 'font-sans', 'font-weight-semibold'],
  a11y: {
    focusable: false,
    notes: [
      'The row is a group named either by the caller or by the people it shows, so a screen reader hears "Ada, Grace, Katherine and 2 more" instead of four unlabelled images.',
      'Each avatar inside is decorative; the group’s name carries the roster, since reading four separate images in a row is noise.',
      'The count chip is decorative: the group’s own name already ends in the count it stands for, and labelling the chip too would announce the number twice.',
    ],
  },
  motion: { description: 'Static. A roster that reshuffles on load is harder to read, not livelier.' },
};

export const readReceiptStackSpec: ComponentSpec = {
  name: 'ReadReceiptStack',
  id: 'read-receipt-stack',
  category: 'molecule',
  status: 'draft',
  summary:
    'Who has read up to this point: the AvatarGroup stack at its smallest step, tighter and capped lower, sized to sit under a message rather than beside a heading.',
  element: 'span',
  anatomy: [
    { name: 'stack', description: 'An AvatarGroup with the read-receipt preset; every part is the group’s.', required: true },
  ],
  props: [
    { name: 'readers', type: 'array', required: true, item: avatarStackItem, description: 'Who has read up to this point, in the order they should read.' },
    { name: 'max', type: 'number', default: 3, description: 'How many faces are drawn before the count takes over. Lower than the group’s, because a receipt is a hint and must not outweigh the message above it.' },
    { name: 'overlap', type: 'number', default: 0.46, description: 'Tighter than the group’s: at this size the row should read as one mark, not a queue.' },
    { name: 'label', type: 'string', description: 'Accessible name; defaults to "Read by" followed by the readers it shows.' },
    { name: 'labels', type: 'object', description: 'Overrides for the built-in English strings.', fields: [{ name: 'readBy', type: 'string', description: 'Template for the row’s label, with {names} standing for the reader list.' }, { name: 'more', type: 'string', description: 'Template for the count chip’s label, with {n} standing for the hidden count.' }] },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders placeholders with the exact stack geometry.' },
  ],
  defaults: { max: 3, overlap: 0.46, skeleton: false },
  // Everything geometric is the group's preset; nothing is redeclared here.
  dimensions: { radius: token('radius-full') },
  states: [
    { name: 'skeleton', description: 'Each slot loads as a placeholder at the exact avatar geometry.' },
  ],
  paint: {},
  tokens: ['radius-full', 'surface', 'hover', 'text-muted'],
  a11y: {
    focusable: false,
    notes: [
      'A receipt is a footnote to the message above it, so the whole row is one labelled group ("Read by Ada, Grace and 2 more") rather than a set of images a reader has to assemble.',
      'It is not a live region: receipts arrive constantly, and announcing each one would bury the conversation.',
    ],
  },
  motion: { description: 'Static, for the same reason as the group it presets.' },
};
