import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** How tightly the bar is packed. Two steps, matching the conversation list. */
export const chatHeaderDensities = ['compact', 'comfortable'] as const;

/**
 * ChatHeader is a sibling of PageHeader, not a preset of it.
 *
 * PageHeader is a page masthead: a 2xl title that wraps, generous block padding,
 * and an actions group that DROPS BELOW the title on narrow widths. Every one of
 * those is wrong for a conversation bar. A chat header is a fixed-height strip
 * at the top of a live surface where the title is one truncating line (thread
 * names are long and arbitrary), the trailing actions are the call buttons and
 * must stay reachable at every width rather than reflowing the transcript below
 * them, and the leading edge holds an avatar — a slot PageHeader has no place
 * for, since putting it inside the title would fold a photograph into the
 * heading's accessible name.
 *
 * The two do share their vocabulary (title, subtitle line, trailing actions) and
 * are meant to look like one family, which is why the type ramp and the actions
 * gap are read from the same tokens.
 */
export const chatHeaderSpec: ComponentSpec = {
  name: 'ChatHeader',
  id: 'chat-header',
  category: 'structure',
  status: 'draft',
  summary:
    'The bar above a conversation: an avatar, who you are talking to, a presence or status line under it, and the trailing actions — a fixed-height strip whose title truncates rather than wrapping.',
  element: 'header',
  anatomy: [
    { name: 'bar', description: 'The strip itself: one row, fixed height, with a bottom hairline separating it from the transcript.', required: true },
    { name: 'back', description: 'A leading control for narrow layouts, where the conversation replaces the list rather than sitting beside it.' },
    { name: 'avatar', description: 'Who you are talking to, as a slot — an Avatar for a person, an AvatarGroup for a group.' },
    { name: 'title', description: 'The conversation name, on one line, truncated. It is the surface’s heading.', required: true },
    { name: 'subtitle', description: 'Presence, member count, or “typing…”, in the muted colour on a second line. Compose a PresenceDot or a TypingIndicator into it.' },
    { name: 'actions', description: 'The trailing slot: call buttons, search, the conversation menu. Pinned to the trailing edge and never wrapped.' },
  ],
  props: [
    { name: 'title', type: 'node', required: true, description: 'Who or what the conversation is with.' },
    { name: 'subtitle', type: 'node', description: 'A second line: presence, member count, or a typing indicator.' },
    { name: 'avatar', type: 'node', description: 'Leading avatar slot.' },
    { name: 'actions', type: 'node', description: 'Trailing actions, typically call buttons.' },
    { name: 'onBack', type: 'handler', description: 'Renders a leading back control. Omit it and no control is drawn, so the same bar serves a split layout and a narrow one.' },
    { name: 'backLabel', type: 'string', description: 'The back control’s accessible name; defaults to the kit’s translated “Back”.' },
    { name: 'onTitlePress', type: 'handler', description: 'Opens the conversation details. Renders the title as a button inside its heading, so the surface keeps the heading it is navigated by and gains exactly one tab stop.' },
    { name: 'headingLevel', type: 'enum', values: ['1', '2', '3'], default: '2', description: 'The heading element for the title. Two by default: a chat surface is usually a pane inside a page that already owns the h1.' },
    { name: 'density', type: 'enum', values: chatHeaderDensities, default: 'comfortable', description: 'How tightly the bar is packed.' },
    { name: 'border', type: 'boolean', default: true, description: 'The bottom hairline separating the bar from the transcript.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the bar’s exact geometry.' },
  ],
  defaults: { headingLevel: '2', density: 'comfortable', border: true, skeleton: false },
  sizes: [
    { name: 'compact', height: token('control-height-lg'), paddingInline: token('space-3'), gap: token('space-2'), fontSize: token('font-size-sm') },
    { name: 'comfortable', height: token('space-16'), paddingInline: token('space-4'), gap: token('space-3'), fontSize: token('font-size-md') },
  ],
  dimensions: {
    border: token('hairline'),
    actionsGap: token('space-1'),
    subtitleFontSize: token('font-size-xs'),
  },
  paint: { background: token('surface'), text: token('text'), border: token('border-subtle') },
  states: [
    {
      name: 'pressable',
      description: 'With a details handler the title underlines on hover and takes the kit focus ring; without one it is inert text and never lights up.',
      paint: { text: token('text') },
      tokens: { ring: token('focus-ring'), hover: token('hover') },
    },
    { name: 'skeleton', description: 'A circle where the avatar goes and two text lines where the title and subtitle go, at the bar’s exact height, so nothing shifts when the conversation loads.' },
  ],
  focusRing: { ring: token('focus-ring'), offset: '2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'space-1', 'space-2', 'space-3', 'space-4', 'space-16', 'control-height-lg', 'hairline',
    'surface', 'hover', 'text', 'text-muted', 'border-subtle', 'focus-ring',
    'font-size-xs', 'font-size-sm', 'font-size-md', 'font-weight-semibold',
    'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'banner',
    focusable: false,
    keyboard: [
      { keys: 'Tab', action: 'Back, then the title block when it can be pressed, then each trailing action in reading order.' },
      { keys: 'Space, Enter', action: 'Activates the focused control.' },
    ],
    notes: [
      'The title is a real heading (h2 by default), so a screen reader can jump to it and knows what the transcript below belongs to.',
      'The avatar is decorative: the title beside it already names the conversation, and an image with the same alt text makes every jump to the heading read the name twice.',
      'When a details handler is given, the button goes INSIDE the heading (h2 > button) rather than around the identity block: a button may only contain phrasing content, and wrapping the block would swallow the heading a screen reader user navigates by. One tab stop, named by the conversation.',
      'The subtitle is plain text, never a live region. Presence and typing both change constantly, and this bar sits above a transcript that is already announcing messages.',
      'role="banner" applies when the header is the top-level bar of the surface; a chat pane nested inside an app shell that already has a banner should pass role="none" or a section label instead.',
    ],
  },
  motion: {
    press: true,
    description: 'Only the controls move: the title block dips on press when it can be pressed, and the bar itself never animates — a header that slides while a transcript scrolls under it is two things moving at once.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
