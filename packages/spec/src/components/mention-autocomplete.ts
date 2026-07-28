import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/**
 * The characters that open the popup and what each means.
 *
 * They are one mechanism, not two: an @-mention and a /-command differ only in
 * the trigger character and what the list holds, so both are matched by the
 * command palette's matcher in @glacier/logic rather than by a second,
 * subtly different filter written for chat.
 */
export const mentionTriggers = ['@', '#', '/'] as const;

export const mentionAutocompleteSpec: ComponentSpec = {
  name: 'MentionAutocomplete',
  id: 'mention-autocomplete',
  category: 'molecule',
  status: 'draft',
  summary:
    'The popup over a compose bar that completes an @-mention, a #-channel, or a /-command from the token being typed at the caret.',
  element: 'div',
  anatomy: [
    { name: 'popup', description: 'The floating panel, anchored above the input so it never covers what is being typed.', required: true },
    { name: 'list', description: 'The candidate rows, in the order the caller supplied them.', required: true },
    { name: 'option', description: 'One candidate: an avatar or glyph, the display name, and the handle.' },
    { name: 'empty', description: 'The line shown when the token matches nothing — the popup stays open so the user can keep typing rather than having it blink out.' },
  ],
  props: [
    { name: 'open', type: 'boolean', required: true, description: 'Whether the popup is showing. Driven by mentionQuery finding an active token at the caret.' },
    { name: 'query', type: 'string', default: '', description: 'The text after the trigger character. Empty right after the trigger, which lists everything.' },
    { name: 'trigger', type: 'enum', values: mentionTriggers, default: '@', description: 'Which token opened the popup; it selects the candidate list and the row shape.' },
    {
      name: 'candidates',
      type: 'array',
      required: true,
      description: 'Everyone (or everything) completable, in priority order. Matching never reorders across the caller\'s priority except to lift prefix hits above mid-word ones.',
      item: {
        type: 'object',
        description: 'One completable candidate.',
        fields: [
          { name: 'id', type: 'string', required: true, description: 'Stable identity, reported back on choose.' },
          { name: 'label', type: 'string', required: true, description: 'The display name the user reads.' },
          { name: 'keywords', type: 'string', description: 'The handle and any aliases; matched but not displayed as the primary line.' },
          { name: 'group', type: 'string', description: 'A heading, e.g. "In this channel".' },
          { name: 'disabled', type: 'boolean', description: 'Listed but not choosable; the cursor skips it.' },
        ],
      },
    },
    { name: 'cursor', type: 'number', required: true, description: 'Index of the highlighted row in the flat match order.' },
    { name: 'onCursorChange', type: 'handler', description: 'Called with the next index as the pointer or the arrow keys move the cursor.' },
    { name: 'onChoose', type: 'handler', required: true, description: 'Called with the chosen candidate id.' },
    { name: 'emptyLabel', type: 'node', description: 'Replaces the default no-matches line.' },
    { name: 'listId', type: 'string', description: 'Id for the listbox, so the input can point aria-controls and aria-activedescendant at it.' },
  ],
  defaults: { query: '', trigger: '@' },
  dimensions: {
    radius: token('radius-lg'),
    gap: token('space-1'),
    border: token('hairline'),
    padding: token('space-1'),
    optionRadius: token('radius-md'),
    optionPaddingBlock: token('space-2'),
    optionPaddingInline: token('space-2'),
    maxHeight: '16rem',
  },
  states: [
    { name: 'active', description: 'The row under the cursor: an accent-soft wash, moved by the arrow keys and by hover alike so there is only ever one row Enter and a click agree on.', paint: { background: token('accent-soft'), text: token('accent-text') } },
    { name: 'disabled', description: 'A listed but unchoosable row reads in subtle text and the cursor steps over it.', paint: { text: token('text-subtle') } },
    { name: 'empty', description: 'No candidate matched: one subtle line, and the popup stays open.', paint: { text: token('text-subtle') } },
  ],
  paint: { background: token('surface-raised'), text: token('text'), border: token('border') },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'surface-raised', 'border', 'hairline', 'radius-lg', 'radius-md',
    'space-1', 'space-2', 'accent-soft', 'accent-text', 'text', 'text-muted', 'text-subtle',
    'font-size-sm', 'font-size-xs', 'shadow-3', 'duration-fast', 'ease-out',
  ],
  a11y: {
    focusable: false,
    keyboard: [
      { keys: 'ArrowUp, ArrowDown', action: 'Moves the cursor, wrapping at both ends and skipping disabled rows.' },
      { keys: 'Enter, Tab', action: 'Completes the token with the highlighted candidate.' },
      { keys: 'Escape', action: 'Closes the popup and leaves the typed token exactly as it is.' },
    ],
    notes: [
      'Focus never leaves the input. The popup is a listbox the input owns through aria-controls and aria-activedescendant — moving focus into it would close the software keyboard mid-mention on a phone.',
      'Matching, grouping, and cursor movement are the command palette\'s (matchCommands, moveCommandCursor, firstCommandCursor) with one addition: prefix hits are lifted above mid-word ones, because typing "an" should offer Ana before Bryan.',
      'The popup sits above the input rather than below it, so it never covers the token being typed or the send control.',
    ],
  },
  motion: {
    description: 'Fades and lifts in at the fast duration. The cursor highlight does not animate between rows — arrowing through a list is a discrete move, and a sliding highlight lags fast keyboard travel.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
