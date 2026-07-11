import type { ComponentSpec } from '../schema.ts';
import { controlSize, controlSizes, token } from '../vocab.ts';

/** Control size steps, exported so the React kit derives its union from here. */
export const selectSizes = controlSizes;

export const selectSpec: ComponentSpec = {
  name: 'Select',
  id: 'select',
  category: 'molecule',
  status: 'stable',
  summary:
    'A styled replacement for the native select: an Input-metric trigger and a portaled glass listbox that animates open.',
  element: 'div',
  anatomy: [
    { name: 'root', description: 'Relative wrapper that anchors the portaled menu to the trigger.' },
    { name: 'trigger', description: 'The button that shows the current value and toggles the menu.', required: true },
    { name: 'value', description: 'The selected option label, or the placeholder when nothing is chosen.' },
    { name: 'chevrons', description: 'The trailing up/down chevron glyph.' },
    { name: 'menu', description: 'The portaled listbox of options, positioned above or below the trigger.' },
    { name: 'option', description: 'A single selectable row with a leading check slot.' },
    { name: 'check', description: 'Leading indicator that marks the selected option.' },
    { name: 'hiddenInput', description: 'A hidden input that submits the value with forms when name is set.' },
  ],
  props: [
    { name: 'options', type: 'node', required: true, description: 'The list of { value, label, disabled } options to choose from.' },
    { name: 'value', type: 'string', description: 'Controlled selected value.' },
    { name: 'defaultValue', type: 'string', description: 'Uncontrolled initial value.' },
    { name: 'onValueChange', type: 'handler', description: 'Fires with the new value when a selection is committed.' },
    { name: 'placeholder', type: 'string', default: 'Select…', description: 'Shown on the trigger when no option is selected.' },
    { name: 'size', type: 'enum', values: selectSizes, default: 'md', description: 'Control size step.' },
    { name: 'fullWidth', type: 'boolean', default: false, description: 'Stretches the trigger to the container width.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Dims the trigger and blocks opening the menu.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'glass', type: 'boolean', default: false, description: 'Renders the frosted glass material on the trigger instead of a solid surface.' },
    { name: 'name', type: 'string', description: 'Submitted with forms via a hidden input when set.' },
    { name: 'id', type: 'string', description: 'Id for the trigger; falls back to the field context id.' },
    { name: 'aria-label', type: 'string', description: 'Accessible name for the trigger and listbox.' },
    { name: 'className', type: 'string', description: 'Extra class names on the root.' },
  ],
  sizes: [
    controlSize('sm', { paddingInline: token('space-3') }),
    controlSize('md', { paddingInline: token('space-4') }),
    controlSize('lg', { paddingInline: token('space-5') }),
  ],
  defaults: { placeholder: 'Select…', size: 'md', fullWidth: false, disabled: false, skeleton: false, glass: false },
  // trigger radius and menu geometry that do not vary with control size
  dimensions: {
    radius: token('radius-lg'),
    optionRadius: token('radius-md'),
    gap: token('space-3'),
    border: token('hairline'),
    menuPadding: token('space-1'),
  },
  states: [
    { name: 'hover', description: 'Trigger border strengthens on hover.', tokens: { border: token('border-strong') } },
    {
      name: 'open',
      description: 'Trigger border turns to the focus ring with a soft accent glow while the menu is open.',
      tokens: { border: token('focus-ring'), ring: token('accent-soft') },
    },
    {
      name: 'focus-visible',
      description: 'Keyboard focus paints the same accent ring as the open state.',
      tokens: { border: token('focus-ring'), ring: token('accent-soft') },
    },
    { name: 'disabled', description: 'Halved opacity, sunken fill, and not-allowed cursor.', tokens: { background: token('surface-sunken') } },
    { name: 'invalid', description: 'Danger border when the field context reports an error.', tokens: { border: token('danger-border') } },
    { name: 'placeholder', description: 'The value text dims when no option is selected.', tokens: { text: token('text-subtle') } },
    { name: 'active', description: 'The highlighted option (hovered or arrow-navigated) fills with the accent.', tokens: { background: token('accent-solid'), text: token('accent-contrast') } },
    { name: 'selected', description: 'The chosen option shows a leading check that inherits the option text color (accent-contrast while the option is active).', tokens: { check: token('text') } },
    { name: 'option-disabled', description: 'A non-selectable option dims and shows a not-allowed cursor.', tokens: { text: token('text-disabled') } },
  ],
  // a 3px accent-soft glow hugging the trigger border, which itself turns focus-ring (shared by focus-visible and open)
  focusRing: { ring: token('accent-soft'), offset: '0' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'font-sans', 'space-1', 'space-2', 'space-3', 'space-4', 'space-5',
    'control-height-sm', 'control-height-md', 'control-height-lg',
    'font-size-xs', 'font-size-sm', 'font-size-md', 'leading-sm',
    'radius-md', 'radius-lg', 'hairline',
    'border', 'border-strong', 'focus-ring', 'danger-border',
    'surface', 'surface-sunken', 'text', 'text-subtle', 'text-disabled',
    'accent-solid', 'accent-soft', 'accent-contrast',
    'glass-regular', 'glass-thick', 'glass-border', 'glass-highlight', 'glass-saturate', 'blur-sm', 'blur-lg', 'shadow-4',
    'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'listbox',
    focusable: true,
    keyboard: [
      { keys: 'ArrowDown, ArrowUp', action: 'Opens the menu from the trigger, or moves the active option when open.' },
      { keys: 'Home, End', action: 'Moves to the first or last enabled option.' },
      { keys: 'Enter, Space', action: 'Selects the active option and closes the menu.' },
      { keys: 'Escape', action: 'Closes the menu and returns focus to the trigger.' },
      { keys: 'Tab', action: 'Closes the menu without refocusing the trigger.' },
    ],
    notes: [
      'Trigger is a button with aria-haspopup=listbox and aria-expanded.',
      'Follows the WAI-ARIA listbox pattern with aria-activedescendant; the listbox itself holds focus while open.',
      'The menu portals to document.body with fixed positioning to escape overflow-clipping ancestors and stacking contexts.',
      'Selected option carries aria-selected; disabled options carry aria-disabled and are skipped by keyboard navigation.',
      'Outside pointer presses close the menu; aria-describedby and aria-invalid come from the surrounding field context.',
    ],
  },
  motion: {
    description: 'The menu fades and scales in from the trigger edge on open and closes instantly; respects reduced motion.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
