import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/**
 * MemberRow is a ListItem with a person in it, not a new row.
 *
 * Everything structural — the leading slot, the title and supporting line, the
 * trailing slot, the selected and disabled treatments, and the anchor/button
 * switch — is `list-item`'s and is not restated here. What this spec adds is the
 * person: an avatar with its presence pinned to the corner, a role pill, and the
 * rule that keeps the presence out of the row's decorative leading slot and in
 * its accessible name.
 *
 * There is deliberately no RoleBadge component. A role badge is a small soft
 * Pill with the role in it; the only thing that needed a home was which tone a
 * given role takes, which lives in @glacier/logic so both bindings agree.
 */
export const memberRowSpec: ComponentSpec = {
  name: 'MemberRow',
  id: 'member-row',
  category: 'molecule',
  status: 'draft',
  summary:
    'A person in a list: their avatar with presence pinned to it, their name, an optional second line, an optional role pill, and a slot for row actions.',
  element: 'li',
  anatomy: [
    { name: 'row', description: 'The list-item row this composes; it owns the layout, the hover and selected paint, and the anchor/button switch.', required: true },
    { name: 'avatar', description: 'The person’s Avatar in the row’s leading slot.', required: true },
    { name: 'presence', description: 'A PresenceDot pinned to the avatar’s trailing-bottom corner, ringed so its edge survives the photo behind it.' },
    { name: 'name', description: 'The person’s name, the row’s title.', required: true },
    { name: 'secondary', description: 'An optional supporting line: a handle, a title, what they are working on.' },
    { name: 'role', description: 'An optional Pill naming the person’s role, in the trailing slot ahead of the actions.' },
    { name: 'actions', description: 'An optional trailing slot for row controls.' },
  ],
  props: [
    { name: 'name', type: 'node', required: true, description: 'The person’s name.' },
    { name: 'secondary', type: 'node', description: 'An optional supporting line under the name.' },
    { name: 'src', type: 'string', description: 'Avatar image URL; falls back to the initials of name.' },
    { name: 'avatarName', type: 'string', description: 'Overrides the name used for the initials fallback and the image alt, for when name is not a plain string.' },
    { name: 'avatarSize', type: 'enum', values: ['sm', 'md', 'lg', 'xl'], default: 'md', description: 'Avatar size step; the presence dot steps with it.' },
    { name: 'status', type: 'enum', values: ['online', 'away', 'busy', 'offline', 'invisible'], description: 'The person’s presence. Omit it and no dot is drawn — an absent dot means unknown, not offline.' },
    { name: 'role', type: 'node', description: 'The person’s role, rendered as a small soft Pill.' },
    { name: 'roleTone', type: 'string', description: 'Overrides the pill tone; a string role otherwise resolves its own through the shared role-tone table.' },
    { name: 'actions', type: 'node', description: 'Trailing row controls, after the role pill.' },
    // Row density is deliberately absent: a list-item takes it from the List it
    // sits in, and a per-row override would let one row disagree with its list.
    { name: 'selected', type: 'boolean', default: false, description: 'Paints the row with the accent-soft selected treatment.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Dims the row and blocks activation.' },
    { name: 'href', type: 'string', description: 'Renders the row as a native anchor.' },
    { name: 'onClick', type: 'handler', description: 'Renders the row as a native button.' },
    { name: 'labels', type: 'object', description: 'Overrides the presence names used in the row’s accessible name.', fields: [{ name: 'online', type: 'string', description: 'Reachable now.' }, { name: 'away', type: 'string', description: 'Signed in but idle.' }, { name: 'busy', type: 'string', description: 'Do not disturb.' }, { name: 'offline', type: 'string', description: 'Not signed in.' }, { name: 'invisible', type: 'string', description: 'Signed in, appearing offline.' }] },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder holding the row’s exact layout.' },
  ],
  defaults: { avatarSize: 'md', selected: false, disabled: false, skeleton: false },
  dimensions: {
    /** Between the role pill and the actions in the trailing slot. */
    gap: token('space-2'),
    radius: token('radius-lg'),
    /** How far the presence dot is pulled into the avatar's corner. */
    presenceInset: token('space-0'),
  },
  states: [
    {
      name: 'selected',
      description: 'Inherited from the list-item: the accent-soft surface with accent text.',
      tokens: { background: token('accent-soft'), text: token('accent-text') },
    },
    { name: 'disabled', description: 'Inherited from the list-item: disabled text, and an actionable row stops responding.' },
    { name: 'skeleton', description: 'The avatar, the name, and the second line each load as their own placeholder, so the row holds the layout it will settle into.' },
  ],
  // The list-item row, the avatar, the dot, and the pill each carry their paint.
  paint: {},
  tokens: ['space-2', 'radius-lg', 'accent-soft', 'accent-text', 'text', 'text-muted', 'font-size-xs'],
  a11y: {
    role: 'listitem',
    focusable: false,
    notes: [
      'The row’s accessible name is the person’s name followed by their presence ("Ada Lovelace, Do not disturb"). The presence cannot ride on the dot itself: a list-item’s leading slot is decorative and hidden from assistive tech, so a dot placed there would be colour-only.',
      'The DOM binding puts the presence in the title as visually hidden text, which names the row whether it renders as a div, an anchor, or a button; the native binding passes the same string as the row’s aria-label.',
      'The role pill is decorative — its text is already in the row.',
      'Placing another control in the actions slot of an actionable row nests two interactive elements; give the row actions or a row handler, not both.',
    ],
  },
  motion: { description: 'Inherited from the list-item: the row’s hover and selected colours ease, nothing else moves.', transition: { speed: 'fast', ease: 'out' } },
};
