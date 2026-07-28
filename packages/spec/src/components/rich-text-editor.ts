import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** The inline marks the toolbar offers. */
export const richTextMarks = ['bold', 'italic', 'code', 'strike'] as const;

/** The block forms the toolbar offers. */
export const richTextBlocks = ['heading', 'quote', 'bullet', 'number'] as const;

export const richTextEditorSpec: ComponentSpec = {
  name: 'RichTextEditor',
  id: 'rich-text-editor',
  category: 'organism',
  status: 'draft',
  summary:
    'A markdown editor with a formatting toolbar: the writable counterpart to CodeBlock, storing plain text rather than a document tree.',
  element: 'div',
  anatomy: [
    { name: 'toolbar', description: 'The formatting controls, each showing whether its mark is already applied at the caret.', required: true },
    { name: 'mark', description: 'One inline control: bold, italic, code, strike.', required: true },
    { name: 'block', description: 'One block control: heading, quote, bullet, numbered.' },
    { name: 'editor', description: 'The text area itself. A plain textarea, not a contenteditable surface.', required: true },
    { name: 'counter', description: 'The character count, when a limit is set.' },
  ],
  props: [
    { name: 'value', type: 'string', description: 'Controlled markdown text.' },
    { name: 'defaultValue', type: 'string', default: '', description: 'Initial markdown when uncontrolled.' },
    { name: 'onValueChange', type: 'handler', description: 'Called with the new markdown as the user types or formats.' },
    { name: 'placeholder', type: 'string', description: 'Prompt shown while the editor is empty.' },
    { name: 'marks', type: 'array', item: { type: 'string', description: 'A mark name.' }, description: 'Which inline controls to offer. Defaults to all four.' },
    { name: 'blocks', type: 'array', item: { type: 'string', description: 'A block name.' }, description: 'Which block controls to offer. Defaults to all four.' },
    { name: 'rows', type: 'number', default: 8, description: 'Visible height of the editor, in text rows.' },
    { name: 'maxLength', type: 'number', description: 'Character limit. Shows a counter and stops accepting input at the limit.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Freezes the text and the toolbar.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
  ],
  defaults: { defaultValue: '', rows: 8, disabled: false, skeleton: false },
  dimensions: {
    radius: token('radius-lg'),
    gap: token('space-1'),
    padding: token('space-3'),
    border: token('hairline'),
  },
  states: [
    { name: 'default', description: 'Resting, with no mark active at the caret.' },
    {
      name: 'active',
      description: 'A toolbar control whose mark is already applied around the caret or selection, so the toolbar reads the document rather than only writing to it.',
      tokens: { background: token('accent-soft'), text: token('accent-text') },
    },
    {
      name: 'focus',
      description: 'The editor holds focus; the frame takes the accent border so the whole control reads as one field rather than a toolbar next to a box.',
      tokens: { border: token('accent-border') },
    },
    { name: 'disabled', description: 'Halved opacity; the text is not editable and every control leaves the tab order.' },
    { name: 'skeleton', description: 'A toolbar row of placeholder buttons over a placeholder text area at the real height.' },
  ],
  paint: {
    background: token('surface'),
    text: token('text'),
    border: token('border'),
  },
  focusRing: { ring: token('accent-soft'), offset: '0' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'surface', 'surface-raised', 'surface-hover', 'border', 'border-strong',
    'text', 'text-muted', 'text-subtle',
    'accent-soft', 'accent-border', 'accent-text',
    'space-1', 'space-2', 'space-3', 'radius-lg', 'radius-md', 'hairline',
    'font-size-sm', 'font-mono', 'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'textbox',
    focusable: true,
    keyboard: [
      { keys: '⌘B, Ctrl+B', action: 'Toggles bold around the selection.' },
      { keys: '⌘I, Ctrl+I', action: 'Toggles italic.' },
      { keys: '⌘E, Ctrl+E', action: 'Toggles inline code.' },
      { keys: 'Tab', action: 'Moves out of the editor rather than inserting a tab, so the field is escapable.' },
    ],
    notes: [
      'The editor is a real textarea, so it inherits the platform\'s own editing, selection, spellcheck, dictation, and undo rather than reimplementing them badly.',
      'Toolbar controls report their state with aria-pressed, which is what makes the toolbar readable rather than merely operable.',
      'The toolbar is a group labelled as formatting controls, so it is skippable — someone typing does not want to Tab through eight buttons first.',
      'Tab leaves the field. Trapping Tab to insert an indent makes a form impossible to complete from the keyboard.',
    ],
  },
  motion: {
    description: 'Only the toolbar controls animate, on press and hover. The text never moves under the caret.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
