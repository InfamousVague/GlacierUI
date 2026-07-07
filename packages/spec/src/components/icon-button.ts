import type { ComponentSpec } from '../schema.ts';
import { controlSizes, token } from '../vocab.ts';

/**
 * Visual style families, shared with Button. Exported so the React kit derives
 * its union from here rather than redeclaring it.
 */
export const iconButtonVariants = ['solid', 'soft', 'outline', 'ghost', 'glass', 'danger'] as const;

export const iconButtonSpec: ComponentSpec = {
  name: 'IconButton',
  id: 'icon-button',
  category: 'atom',
  status: 'stable',
  summary: 'A square, icon-only button in six variants and three sizes; ghost by default and always labelled.',
  element: 'button',
  anatomy: [{ name: 'icon', description: 'The single centered glyph; the control has no visible text.', required: true }],
  props: [
    { name: 'aria-label', type: 'string', required: true, description: 'Accessible name; required since there is no visible text.' },
    { name: 'variant', type: 'enum', values: iconButtonVariants, default: 'ghost', description: 'Visual style family.' },
    { name: 'size', type: 'enum', values: controlSizes, default: 'md', description: 'Control size step.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Dims the button and blocks interaction.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'children', type: 'node', required: true, description: 'The icon glyph.' },
  ],
  variants: [
    { name: 'solid', description: 'Filled with the accent, for the primary action.', tokens: { background: token('accent-solid'), text: token('accent-contrast'), hover: token('accent-solid-hover') } },
    { name: 'soft', description: 'Tinted accent, for a secondary emphasis.', tokens: { background: token('accent-soft'), text: token('accent-text'), hover: token('accent-soft-hover') } },
    { name: 'outline', description: 'Hairline border on a transparent fill.', tokens: { border: token('border-strong'), text: token('text'), hover: token('hover') } },
    { name: 'ghost', description: 'No fill until hovered, for low-emphasis actions.', tokens: { text: token('text'), hover: token('hover') } },
    { name: 'glass', description: 'Frosted glass material for chrome over content.', tokens: { background: token('glass-regular'), border: token('glass-border'), text: token('text') } },
    { name: 'danger', description: 'Filled with the danger color for destructive actions.', tokens: { background: token('danger-solid'), text: token('danger-contrast'), hover: token('danger-solid-hover') } },
  ],
  sizes: [
    { name: 'sm', height: token('control-height-sm'), diameter: token('control-height-sm'), fontSize: token('font-size-xs'), paddingInline: '0' },
    { name: 'md', height: token('control-height-md'), diameter: token('control-height-md'), fontSize: token('font-size-sm'), paddingInline: '0' },
    { name: 'lg', height: token('control-height-lg'), diameter: token('control-height-lg'), fontSize: token('font-size-md'), paddingInline: '0' },
  ],
  defaults: { variant: 'ghost', size: 'md', disabled: false, skeleton: false },
  dimensions: { radius: token('control-radius'), gap: token('space-2'), border: token('hairline') },
  states: [
    { name: 'hover', description: 'Background lifts to the variant hover token.' },
    { name: 'active', description: 'Ghost presses to the active token; others rely on the tap scale.' },
    { name: 'focus-visible', description: 'A 2px accent focus ring blooms outward.', tokens: { ring: token('focus-ring') } },
    { name: 'disabled', description: 'Halved opacity and not-allowed cursor.' },
  ],
  tokens: [
    'space-2', 'space-4', 'space-5', 'space-6', 'control-height-sm', 'control-height-md', 'control-height-lg',
    'control-radius', 'hairline', 'font-sans', 'font-weight-medium', 'font-size-xs', 'font-size-sm', 'font-size-md',
    'accent-solid', 'accent-solid-hover', 'accent-contrast', 'accent-soft', 'accent-soft-hover', 'accent-text',
    'border-strong', 'text', 'hover', 'active', 'danger-solid', 'danger-solid-hover', 'danger-contrast',
    'glass-regular', 'glass-thick', 'glass-border', 'glass-highlight', 'blur-sm', 'glass-saturate', 'shadow-1', 'shadow-2', 'focus-ring',
    'duration-fast', 'duration-normal', 'ease-out',
  ],
  a11y: {
    role: 'button',
    focusable: true,
    keyboard: [{ keys: 'Enter, Space', action: 'Activates the button.' }],
    notes: [
      'aria-label is required; the icon carries no accessible name on its own.',
      'A disabled button is removed from the tab order and blocks activation.',
    ],
  },
  motion: {
    description: 'Presses inward to 0.94 on tap and eases its colors on hover; both respect reduced motion.',
    press: true,
    transition: { speed: 'fast', ease: 'out' },
  },
};
