import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/**
 * How new messages reach assistive technology. Mirrors `TranscriptAnnounce` in
 * @glacier/logic; declared here so a non-JS port derives the same enum.
 */
export const messageListAnnounceModes = ['count', 'messages', 'off'] as const;

export const messageListSpec: ComponentSpec = {
  name: 'MessageList',
  id: 'message-list',
  category: 'organism',
  status: 'draft',
  summary:
    'The transcript: a bottom-anchored scrolling log of message groups with day and unread separators woven through it, holding the reader\'s place when history loads above and following the conversation only while they are already at the end.',
  element: 'div',
  anatomy: [
    { name: 'root', description: 'The positioning context, so the floating jump control can sit over the viewport.', required: true },
    { name: 'viewport', description: 'The scroll container itself: the element that owns scrollTop, and the sticky positioning ancestor for day separators.', required: true },
    { name: 'rows', description: 'The column of sequence rows, gapped once so no row carries its own margin.', required: true },
    { name: 'header', description: 'Above the first row: the load-older affordance, the start-of-conversation note.' },
    { name: 'footer', description: 'Below the last row: the typing indicator, which must scroll with the tail rather than float over it.' },
    { name: 'row', description: 'One ChatSequenceItem, keyed by the key commons assigned it.', required: true },
    { name: 'jump', description: 'The ScrollToLatest affordance, floating over the viewport\'s trailing bottom corner.' },
    { name: 'status', description: 'The visually hidden polite live region that carries the coalesced arrival count.', required: true },
  ],
  props: [
    { name: 'items', type: 'array', required: true, item: { type: 'object', description: 'A ChatSequenceItem from insertSeparators: a group, a day row, or the unread rule.' }, description: 'The rendered sequence, built by groupMessages + insertSeparators. The list never regroups and never re-derives the unread anchor.' },
    { name: 'renderGroup', type: 'handler', required: true, description: 'Renders one author run, given the MessageGroup and its row context. The list holds no opinion about what a message looks like.' },
    { name: 'renderDay', type: 'handler', description: 'Renders a day separator. Defaults to DateSeparator.' },
    { name: 'renderUnread', type: 'handler', description: 'Renders the unread rule. Defaults to UnreadDivider.' },
    { name: 'renderItem', type: 'handler', description: 'Renders any row, overriding all three renderers. The escape hatch, and the exact function signature a windowing list calls.' },
    { name: 'header', type: 'node', description: 'Content above the first row, inside the scroll content.' },
    { name: 'footer', type: 'node', description: 'Content below the last row, inside the scroll content.' },
    { name: 'now', type: 'number', description: 'Instant the day labels are read against; injectable so a transcript renders deterministically.' },
    { name: 'locale', type: 'string', description: 'BCP-47 tag for the day formatter.' },
    { name: 'labels', type: 'object', description: 'Translated strings, merged over the shared English defaults.' },
    { name: 'stickyDays', type: 'boolean', default: true, description: 'Pins the current day separator to the top edge while its day scrolls past.' },
    { name: 'onScrollStateChange', type: 'handler', description: 'Called with { atBottom, distanceFromBottom, unreadBelow, showScrollToLatest } whenever any of them changes, so surrounding chrome can react.' },
    { name: 'onReachTop', type: 'handler', description: 'Called once each time the reader scrolls within reachTopOffset of the start, for paging older history. Re-arms only after they scroll away again.' },
    { name: 'reachTopOffset', type: 'number', default: 240, description: 'How close to the start counts as reaching the top, in pixels.' },
    { name: 'loadingOlder', type: 'boolean', default: false, description: 'A page of older history is in flight; suppresses further onReachTop calls.' },
    { name: 'unreadCount', type: 'number', description: 'Overrides the unread tally the list derives from the divider, for apps whose read state lives on the server.' },
    { name: 'scrollToLatest', type: 'boolean', default: true, description: 'Renders the built-in floating jump control. Turn it off to place your own from the reported scroll state.' },
    { name: 'announce', type: 'enum', values: messageListAnnounceModes, default: 'count', description: 'How arrivals are announced: a coalesced count in a polite status region, each message body via a live log, or nothing.' },
    { name: 'initialItemKey', type: 'string', description: 'Row to open on instead of the bottom — normally the unread divider\'s key, so a returning reader lands where they left off.' },
    { name: 'estimateRowHeight', type: 'handler', description: 'Reserved: an initial height guess per row. Not read yet; declared now so dropping a windowing list in later is not an API change.' },
    { name: 'maxHeight', type: 'string', description: 'Caps the viewport height. Omit inside a flex column, where the list simply fills what is left.' },
  ],
  defaults: { stickyDays: true, reachTopOffset: 240, loadingOlder: false, scrollToLatest: true, announce: 'count' },
  dimensions: {
    gap: token('space-2'),
    paddingInline: token('space-4'),
    paddingBlock: token('space-3'),
    jumpOffset: token('space-4'),
  },
  states: [
    { name: 'default', description: 'Scrolled to the end, following the conversation.' },
    {
      name: 'scrolled',
      description:
        'The reader has moved up. Arrivals no longer move the viewport, the jump control appears past the reveal distance, and any unread tally rides on it. Behaviour only: the transcript itself does not repaint, because a log that changed colour when you scrolled would be absurd.',
      behavioral: true,
    },
    {
      name: 'anchored',
      description:
        'A page of older history landed above the viewport and the scroll offset was corrected before paint, so the row the reader was looking at did not move. Behaviour only; nothing repaints.',
      behavioral: true,
    },
    {
      name: 'loading-older',
      description: 'Older history is in flight; the header slot carries the affordance and further paging is suppressed. Behaviour only.',
      behavioral: true,
    },
  ],
  // The rows carry the paint. A transcript is a window onto content, and giving
  // it a fill of its own would fight whatever surface the app sits it in.
  paint: {},
  focusRing: { ring: token('focus-ring'), offset: '-2px' },
  tokens: [
    'space-2', 'space-3', 'space-4',
    'text', 'font-sans', 'focus-ring', 'border-strong',
  ],
  a11y: {
    role: 'log',
    focusable: true,
    keyboard: [
      { keys: 'Tab', action: 'Focuses the viewport, then moves into the rows.' },
      { keys: 'Arrows, Page Up/Down', action: 'Scroll the transcript when the viewport holds focus.' },
      { keys: 'Home, End', action: 'Jump to the start or the end of the loaded transcript.' },
    ],
    notes: [
      'The viewport is role="log" so a screen reader can navigate the transcript as a unit, but its aria-live is explicitly off in the default announce mode. A live log on a busy channel interrupts itself on every arrival, so the reader hears first syllables and never a sentence.',
      'Arrivals are instead coalesced into one visually hidden polite status region that reports a count ("3 new messages"), at most once every two seconds. Message bodies are never announced by the list itself — they are already in the log, where the reader can read them at their own pace.',
      'announce="messages" moves aria-live onto the log for a quiet one-to-one thread; announce="off" hands the job to the app.',
      'Each row carries aria-setsize and aria-posinset against the FULL sequence length, so the count stays truthful when a windowing list mounts only part of it.',
      'The unread divider is never sticky and never re-derived: it is placed against a pinned message id, so it cannot walk down the screen while it is being read.',
    ],
  },
  motion: {
    description:
      'The transcript itself never animates its scroll on arrival — a smooth-scrolled transcript is one the reader cannot catch, and smooth scrolling also defeats the anchoring correction, which must land before paint. Only the jump control animates, on enter and exit.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
