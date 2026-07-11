import type { ComponentSpec } from '../schema.ts';
import { controlSize, controlSizes, token } from '../vocab.ts';

/** Visual style families, exported so the React kit derives its union from here. */
export const buttonVariants = ['solid', 'soft', 'outline', 'ghost', 'glass', 'danger'] as const;

export const buttonSpec: ComponentSpec = {
  name: 'Button',
  id: 'button',
  category: 'atom',
  status: 'stable',
  summary: 'The primary action control: a labelled, optionally icon-led button in six variants and three sizes.',
  element: 'button',
  anatomy: [
    { name: 'leadingIcon', description: 'Optional icon before the label, passed as part of children.' },
    { name: 'spinner', description: 'A leading Spinner shown before the label while loading.' },
    { name: 'label', description: 'The button text or icon content.', required: true },
    { name: 'trailingIcon', description: 'Optional icon after the label, passed as part of children.' },
  ],
  props: [
    { name: 'variant', type: 'enum', values: buttonVariants, default: 'solid', description: 'Visual style family.' },
    { name: 'size', type: 'enum', values: controlSizes, default: 'md', description: 'Control size step.' },
    { name: 'loading', type: 'boolean', default: false, description: 'Shows a spinner and blocks interaction.' },
    { name: 'fullWidth', type: 'boolean', default: false, description: 'Stretches to the container width.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Dims the button and blocks interaction.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'children', type: 'node', required: true, description: 'Button label, and any leading or trailing icon.' },
  ],
  variants: [
    { name: 'solid', description: 'Filled with the accent, for the primary action.', paint: { background: token('accent-solid'), text: token('accent-contrast') }, tokens: { hover: token('accent-solid-hover') } },
    { name: 'soft', description: 'Tinted accent, for a secondary emphasis.', paint: { background: token('accent-soft'), text: token('accent-text') }, tokens: { hover: token('accent-soft-hover') } },
    { name: 'outline', description: 'Hairline border on a transparent fill.', paint: { border: token('border-strong'), text: token('text') }, tokens: { hover: token('hover') } },
    { name: 'ghost', description: 'No fill until hovered, for low-emphasis actions.', paint: { text: token('text') }, tokens: { hover: token('hover') } },
    { name: 'glass', description: 'Frosted glass material for chrome over content.', paint: { background: token('glass-regular'), border: token('glass-border'), text: token('text') }, tokens: { hover: token('glass-thick') } },
    { name: 'danger', description: 'Filled with the danger color for destructive actions.', paint: { background: token('danger-solid'), text: token('danger-contrast') }, tokens: { hover: token('danger-solid-hover') } },
  ],
  sizes: [
    controlSize('sm', { paddingInline: token('space-4') }),
    controlSize('md', { paddingInline: token('space-5') }),
    controlSize('lg', { paddingInline: token('space-6') }),
  ],
  defaults: { variant: 'solid', size: 'md', loading: false, fullWidth: false, disabled: false, skeleton: false },
  dimensions: { radius: token('control-radius'), gap: token('space-2'), border: token('hairline') },
  states: [
    {
      name: 'hover',
      description: 'Background lifts to the variant hover token.',
      tokens: {
        solid: token('accent-solid-hover'),
        soft: token('accent-soft-hover'),
        outline: token('hover'),
        ghost: token('hover'),
        glass: token('glass-thick'),
        danger: token('danger-solid-hover'),
      },
    },
    { name: 'active', description: 'Ghost presses to the active token; others rely on the tap scale.', tokens: { ghost: token('active') } },
    { name: 'focus-visible', description: 'A 2px accent focus ring blooms outward.', tokens: { ring: token('focus-ring') } },
    { name: 'disabled', description: 'Halved opacity and not-allowed cursor.' },
    { name: 'loading', description: 'A leading spinner shows and pointer input is blocked.' },
  ],
  focusRing: { ring: token('focus-ring'), offset: '2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'space-2', 'space-4', 'space-5', 'space-6', 'control-height-sm', 'control-height-md', 'control-height-lg',
    'control-radius', 'hairline', 'font-sans', 'font-weight-medium', 'font-size-xs', 'font-size-sm', 'font-size-md',
    'accent-solid', 'accent-solid-hover', 'accent-contrast', 'accent-soft', 'accent-soft-hover', 'accent-text',
    'border-strong', 'text', 'hover', 'active', 'danger-solid', 'danger-solid-hover', 'danger-contrast',
    'glass-regular', 'glass-thick', 'glass-border', 'glass-highlight', 'blur-sm', 'glass-saturate', 'shadow-1', 'shadow-2', 'focus-ring',
    'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'button',
    focusable: true,
    keyboard: [{ keys: 'Enter, Space', action: 'Activates the button.' }],
    notes: ['A disabled or loading button is removed from the tab order and blocks activation.'],
  },
  motion: {
    description: 'Presses inward on tap and eases its colors on hover; both respect reduced motion.',
    press: true,
    transition: { speed: 'fast', ease: 'out' },
  },
};
