import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/**
 * How tightly a conversation row is packed. Deliberately the same two words the
 * app-wide density vocabulary uses for its middle steps rather than `sm`/`md`,
 * because a chat sidebar row is a piece of furniture, not a control: its height
 * is set by how much of the conversation you want to see, not by a control
 * scale.
 */
export const conversationDensities = ['compact', 'comfortable'] as const;

/**
 * The markers a row can carry, in precedence order. This order is the contract:
 * both bindings read it, and it is what decides which annotation wins a slot
 * when several are true at once.
 */
export const conversationMarkerOrder = ['failed', 'draft', 'unread', 'muted', 'pinned'] as const;

/** The section buckets the list groups into. */
export const conversationSections = ['pinned', 'all'] as const;

export const conversationListItemSpec: ComponentSpec = {
  name: 'ConversationListItem',
  id: 'conversation-list-item',
  category: 'molecule',
  status: 'draft',
  summary:
    'One conversation in a chat sidebar: who it is with, what was said last, when, and the unread, muted, pinned, draft, and failed markers — each in its own slot so they never fight for the same space.',
  element: 'li',
  anatomy: [
    { name: 'row', description: 'The option surface: a two-column grid of avatar and copy.', required: true },
    { name: 'avatar', description: 'The correspondent\'s avatar, or an avatar group slot for a group chat.' },
    { name: 'name', description: 'Who the conversation is with. Bolds when unread, so the state is not carried by colour alone.', required: true },
    { name: 'timestamp', description: 'When the last message landed, on the trailing edge of the name line.' },
    { name: 'meta', description: 'The quiet state glyphs beside the timestamp: pinned, then muted.' },
    { name: 'snippet', description: 'The last message, collapsed to one line and truncated.' },
    { name: 'prefix', description: 'The annotation that replaces the snippet\'s meaning: the failed or draft marker.' },
    { name: 'badge', description: 'The unread CounterBadge on the trailing edge of the snippet line.' },
  ],
  props: [
    { name: 'id', type: 'string', required: true, description: 'Stable conversation id; the list keys selection and keyboard focus off it.' },
    { name: 'name', type: 'string', required: true, description: 'Who the conversation is with. A plain string, because it is also the row\'s accessible name.' },
    { name: 'avatar', type: 'node', description: 'Avatar, or an avatar group for a group chat. A slot, so the row never has to know which.' },
    { name: 'snippet', type: 'string', description: 'The last message body. Collapsed to one line and truncated by the shared rule.' },
    { name: 'sender', type: 'string', description: 'Who sent the last message, prefixed to the snippet in a group chat. Survives truncation; the body is what gets cut.' },
    { name: 'timestamp', type: 'number', description: 'When the last message landed, as epoch milliseconds.' },
    { name: 'unreadCount', type: 'number', default: 0, description: 'Unread messages. Rendered as a counter badge, capped at 99+.' },
    { name: 'muted', type: 'boolean', default: false, description: 'Notifications are silenced. Demotes the unread badge to neutral rather than hiding it.' },
    { name: 'pinned', type: 'boolean', default: false, description: 'Kept at the top of the list. Shown as a glyph even when the list is grouped, so an ungrouped row still says so.' },
    { name: 'draft', type: 'boolean', default: false, description: 'An unsent draft is waiting. Replaces the snippet prefix.' },
    { name: 'failed', type: 'boolean', default: false, description: 'The last outgoing message did not send. Outranks a draft for the prefix slot.' },
    { name: 'selected', type: 'boolean', default: false, description: 'This is the open conversation.' },
    { name: 'density', type: 'enum', values: conversationDensities, default: 'comfortable', description: 'How tightly the row is packed.' },
    { name: 'onSelect', type: 'handler', description: 'Called with the conversation id when the row is activated.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the row\'s exact geometry.' },
  ],
  defaults: {
    unreadCount: 0,
    muted: false,
    pinned: false,
    draft: false,
    failed: false,
    selected: false,
    density: 'comfortable',
    skeleton: false,
  },
  sizes: [
    {
      name: 'compact',
      height: token('control-height-lg'),
      paddingInline: token('space-3'),
      paddingBlock: token('space-2'),
      gap: token('space-2'),
      fontSize: token('font-size-sm'),
      radius: token('radius-lg'),
      iconSize: '0.75rem',
    },
    {
      name: 'comfortable',
      height: token('size-4xl'),
      paddingInline: token('space-3'),
      paddingBlock: token('space-3'),
      gap: token('space-3'),
      fontSize: token('font-size-sm'),
      radius: token('radius-lg'),
      iconSize: '0.875rem',
    },
  ],
  dimensions: {
    radius: token('radius-lg'),
    gap: token('space-3'),
    /** Between the two copy lines. */
    lineGap: token('space-1'),
    /** Between the timestamp and the quiet marker glyphs beside it. */
    metaGap: token('space-1'),
  },
  // the row is transparent at rest; only its text is painted
  paint: { text: token('text') },
  focusRing: { ring: token('focus-ring'), offset: '0' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  states: [
    { name: 'default', description: 'Read, unselected, unmarked: a transparent row with a muted snippet.' },
    { name: 'hover', description: 'The hover wash, so a pointer knows the whole row is the target.', paint: { background: token('hover') } },
    {
      name: 'selected',
      description: 'The open conversation. The accent-soft fill is the primary signal and the row also reports aria-selected, so selection never rests on colour alone.',
      paint: { background: token('accent-soft'), text: token('accent-text') },
    },
    {
      name: 'unread',
      description:
        'The name goes semibold and the snippet stops being muted, so an unread row is legible as unread in greyscale; the badge is a second, redundant signal rather than the only one.',
      tokens: { name: token('text'), snippet: token('text'), badge: token('danger-solid') },
    },
    {
      name: 'muted',
      description:
        'A bell-off glyph joins the timestamp and the unread badge drops to neutral. Muting quiets a conversation, it does not hide that it has messages waiting.',
      tokens: { marker: token('text-subtle'), badge: token('gray-9') },
    },
    {
      name: 'pinned',
      description: 'A pin glyph leads the timestamp. Quiet, because in a grouped list the section header already says it.',
      tokens: { marker: token('text-subtle') },
    },
    {
      name: 'draft',
      description: 'An unsent draft takes the snippet prefix, tinted warning: it is a thing you left undone, not an error.',
      tokens: { prefix: token('warning-text') },
    },
    {
      name: 'failed',
      description: 'A message that did not send takes the snippet prefix in danger and outranks a draft — an undelivered message needs attention before an unfinished one.',
      tokens: { prefix: token('danger-text') },
    },
    {
      name: 'skeleton',
      description:
        'Every part loads as its own placeholder — avatar disc, name line, timestamp, snippet line, badge — each at the size the real thing will take, so the row does not shift when the conversation arrives.',
    },
  ],
  tokens: [
    'space-1', 'space-2', 'space-3', 'control-height-lg', 'size-4xl',
    'radius-lg', 'hover', 'accent-soft', 'accent-text', 'focus-ring',
    'danger-solid', 'danger-text', 'warning-text', 'gray-9',
    'text', 'text-muted', 'text-subtle',
    'font-size-xs', 'font-size-sm', 'font-weight-semibold', 'leading-sm',
    'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'option',
    focusable: true,
    keyboard: [
      { keys: 'Enter, Space', action: 'Opens the focused conversation.' },
    ],
    notes: [
      'The row is an option inside a listbox, so it must not contain a nested button or link — the row itself is the target. That is why it is not built on ListItem, whose row becomes a button or anchor as soon as it is actionable.',
      'Unread is announced, not just painted: the row carries a visually hidden "N unread" phrase, and the name goes semibold, so the state survives greyscale and a screen reader alike.',
      'Muted, pinned, draft, and failed each add their own hidden phrase; the glyphs themselves are decorative.',
      'The timestamp is rendered from a shared formatter and repeated in full in the hidden phrase, since "Tue" alone is ambiguous out of context.',
    ],
  },
  motion: {
    description: 'Only the row background eases, on hover and selection. The copy never animates — a list that reflows while you read it is unusable.',
    press: true,
    transition: { speed: 'fast', ease: 'out' },
  },
};

export const conversationListSpec: ComponentSpec = {
  name: 'ConversationList',
  id: 'conversation-list',
  category: 'organism',
  status: 'draft',
  summary:
    'The chat sidebar: a single-select listbox of conversations, grouped into Pinned and All, with roving-tabindex keyboard navigation and a windowing seam for long lists.',
  element: 'div',
  anatomy: [
    { name: 'root', description: 'The listbox. Owns selection and the keyboard model.', required: true },
    { name: 'section', description: 'One group of rows — Pinned or All — labelled by its header.' },
    { name: 'header', description: 'The section label. Decorative: the group already carries the name.' },
    { name: 'rows', description: 'The list of conversation rows inside a section.', required: true },
    { name: 'spacer', description: 'The leading and trailing struts a windowing strategy inflates to hold the scroll height of rows it is not rendering.' },
    { name: 'empty', description: 'What shows when there are no conversations.' },
  ],
  props: [
    { name: 'items', type: 'array', item: { type: 'object', description: 'One conversation summary.' }, description: 'The conversations, in the order they should read within their section. Data, not children — so the list knows its full row count without touching the DOM, which is what makes windowing a drop-in.' },
    { name: 'value', type: 'string', description: 'Controlled id of the open conversation.' },
    { name: 'defaultValue', type: 'string', description: 'Initially open conversation when uncontrolled.' },
    { name: 'onValueChange', type: 'handler', description: 'Called with the id when a different conversation is opened.' },
    { name: 'grouped', type: 'boolean', default: true, description: 'Splits pinned conversations into their own section. Off renders one flat run in the order given.' },
    { name: 'density', type: 'enum', values: conversationDensities, default: 'comfortable', description: 'How tightly the rows are packed; forwarded to every row.' },
    { name: 'selectionFollowsFocus', type: 'boolean', default: false, description: 'Opens each conversation as the arrows move through them. Off by default: opening a thread is expensive, so it should take a deliberate Enter.' },
    { name: 'maxHeight', type: 'string', description: 'Caps the list and wraps it in a ScrollArea. That viewport is the scroll host a windowing strategy would attach to.' },
    { name: 'empty', type: 'node', description: 'Rendered in place of the sections when there is nothing to list.' },
    { name: 'labels', type: 'object', description: 'Translated strings for the list label, section headers, and marker phrases.' },
  ],
  defaults: { grouped: true, density: 'comfortable', selectionFollowsFocus: false },
  dimensions: {
    gap: token('space-1'),
    /** Between one section and the next. */
    sectionGap: token('space-4'),
    /** Around the section header. */
    headerPaddingInline: token('space-3'),
    headerPaddingBlock: token('space-2'),
  },
  paint: {},
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  states: [
    {
      name: 'grouped',
      description: 'Pinned conversations lift into their own labelled group above the rest.',
      tokens: { header: token('text-subtle') },
    },
    { name: 'empty', description: 'Nothing to list; the empty slot takes the whole area.', tokens: { text: token('text-muted') } },
  ],
  tokens: [
    'space-1', 'space-2', 'space-3', 'space-4',
    'text-subtle', 'text-muted', 'font-size-xs', 'font-weight-semibold',
    'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'listbox',
    focusable: false,
    keyboard: [
      { keys: 'Down, Up', action: 'Moves focus to the next or previous row, crossing section boundaries in visual order.' },
      { keys: 'Home, End', action: 'Moves focus to the first or last row in the whole list.' },
      { keys: 'Enter, Space', action: 'Opens the focused conversation.' },
      { keys: 'Tab', action: 'Enters at the open conversation, or the first row when none is open, and leaves the list in one press.' },
    ],
    notes: [
      'A listbox of options rather than a list of links: exactly one conversation is open at a time, and that is what aria-selected means.',
      'Roving tabindex, not aria-activedescendant, so the focused row is the real focused element and browser scroll-into-view works for free.',
      'Sections are groups inside the listbox, which keeps the header out of the option sequence while still naming the rows it covers.',
      'Every row reports aria-posinset and aria-setsize against the full flattened list, so the announcement stays correct when only a window of rows is in the DOM.',
      'Arrow keys move focus without opening by default; selectionFollowsFocus opts into the mail-client behaviour where they do.',
    ],
  },
  motion: {
    description: 'Nothing in the list animates position. Rows are re-ordered by the data, and a sidebar that slides its rows around loses the user\'s place.',
    transition: { speed: 'fast', ease: 'out' },
  },
};

export const conversationSkeletonSpec: ComponentSpec = {
  name: 'ConversationSkeleton',
  id: 'conversation-skeleton',
  category: 'molecule',
  status: 'draft',
  summary:
    'The chat sidebar while it loads: a run of rows holding the exact geometry the real list will settle into, each part its own placeholder rather than one grey slab.',
  element: 'ul',
  anatomy: [
    { name: 'root', description: 'The placeholder list, hidden from assistive tech and marked busy by the region around it.', required: true },
    { name: 'row', description: 'One placeholder row at the real row\'s height.', required: true },
    { name: 'avatar', description: 'A disc at the avatar\'s exact diameter.' },
    { name: 'name', description: 'A line at the name\'s line box.' },
    { name: 'timestamp', description: 'A short bone on the trailing edge, the width of a formatted timestamp.' },
    { name: 'snippet', description: 'A line at the snippet\'s line box.' },
  ],
  props: [
    { name: 'count', type: 'number', default: 6, description: 'How many placeholder rows to draw. Enough to fill the viewport, not the whole list — a list of bones is noise.' },
    { name: 'density', type: 'enum', values: conversationDensities, default: 'comfortable', description: 'Matches the density the real list will use, so the rows are the right height.' },
  ],
  defaults: { count: 6, density: 'comfortable' },
  dimensions: { gap: token('space-1') },
  paint: {},
  states: [
    {
      name: 'skeleton',
      description:
        'Each part is its own placeholder at the size the real thing will take — disc, name line, timestamp, snippet line — so the arriving list does not shift anything.',
    },
  ],
  tokens: ['space-1', 'space-2', 'space-3', 'control-height-lg', 'size-4xl', 'radius-lg'],
  a11y: {
    role: 'presentation',
    focusable: false,
    notes: [
      'Placeholders are decorative and hidden from assistive tech; mark the region around the list aria-busy so the wait is announced once rather than six times.',
    ],
  },
  motion: {
    description: 'Only the shared Skeleton shimmer, which becomes an opacity pulse under prefers-reduced-motion.',
    transition: { speed: 'slow', ease: 'in-out' },
  },
};
