import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const codeBlockSpec: ComponentSpec = {
  name: 'CodeBlock',
  id: 'code-block',
  category: 'atom',
  status: 'stable',
  summary: 'A framed, scrollable code panel with an optional header carrying a filename, language, and copy button.',
  element: 'div',
  anatomy: [
    { name: 'header', description: 'Optional top bar; renders when copy is on or a filename or language is set.' },
    { name: 'filename', description: 'Monospace filename in the header, truncated with an ellipsis when it overflows.' },
    { name: 'language', description: 'Uppercase monospace language label in the header.' },
    { name: 'copy', description: 'A button that copies the code and flips to "Copied" for 1.5s.' },
    { name: 'pre', description: 'The scrollable monospace code area, holding either the plain source or the highlighted markup.', required: true },
    { name: 'gutter', description: 'Optional line-number column, one number per line via CSS counters on the line spans.' },
  ],
  props: [
    { name: 'code', type: 'string', required: true, description: 'The source text: the accessible content, what copy copies, and the plain fallback.' },
    { name: 'children', type: 'node', description: 'Pre-highlighted markup for the code, supplied by the app; the kit ships no highlighter. Falls back to plain code when absent.' },
    { name: 'language', type: 'string', description: 'Language label shown in the header.' },
    { name: 'filename', type: 'string', description: 'Filename shown in the header.' },
    { name: 'showCopy', type: 'boolean', default: true, description: 'Shows the copy button in the header.' },
    { name: 'lineNumbers', type: 'boolean', default: false, description: 'Renders a line-number gutter down the left edge.' },
    { name: 'attached', type: 'boolean', default: false, description: 'Drops the top border and top corners so the block docks beneath the element above it.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'glass', type: 'boolean', default: false, description: 'Renders the frosted glass material instead of a solid surface.' },
  ],
  defaults: { showCopy: true, lineNumbers: false, attached: false, skeleton: false, glass: false },
  dimensions: {
    radius: token('radius-lg'),
    gap: token('space-3'),
    border: token('hairline'),
    headerPaddingBlock: token('space-2'),
    headerPaddingInline: token('space-3'),
    prePadding: token('space-4'),
    copyRadius: token('radius-sm'),
    copyPaddingBlock: token('space-1'),
    copyPaddingInline: token('space-2'),
  },
  states: [
    { name: 'copy-hover', description: 'The copy button fills with the hover token.', tokens: { background: token('hover') } },
    // a label swap on a 1.5s timer; the button's paint does not change
    { name: 'copied', description: 'After a successful copy the button reads "Copied" for 1.5s, then resets to "Copy".', behavioral: true },
  ],
  paint: { background: '$surface-sunken', border: '$border-subtle' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'hairline', 'radius-lg', 'radius-sm', 'surface-sunken', 'border-subtle',
    'space-1', 'space-2', 'space-3', 'space-4',
    'font-sans', 'font-mono', 'font-size-xs', 'leading-md',
    'text', 'text-muted', 'text-subtle',
    'hover', 'duration-fast', 'ease-out',
  ],
  a11y: {
    focusable: false,
    keyboard: [{ keys: 'Enter, Space', action: 'Activates the copy button when it holds focus.' }],
    notes: ['The copy button is the only focusable part; the code itself is static text.'],
  },
  motion: {
    description: 'The copy button eases its background on hover; respects reduced motion.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
