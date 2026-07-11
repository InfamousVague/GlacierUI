import type { ComponentSpec } from '../schema.ts';
import { controlSizes, token } from '../vocab.ts';

/** Star size steps the rating supports. */
export const ratingSizes = controlSizes;

export const ratingSpec: ComponentSpec = {
  name: 'Rating',
  id: 'rating',
  category: 'atom',
  status: 'stable',
  summary:
    'A star rating: an interactive native radio group by default, or a read-only display that supports fractional fill.',
  element: 'span',
  anatomy: [
    { name: 'star', description: 'One star cell; its filled portion is clipped to the value.', required: true },
  ],
  props: [
    { name: 'value', type: 'number', description: 'Controlled rating value, 0 to max.' },
    { name: 'defaultValue', type: 'number', description: 'Initial value when uncontrolled.' },
    { name: 'max', type: 'number', default: 5, description: 'Number of stars.' },
    { name: 'onChange', type: 'handler', description: 'Called with the new value when the user picks a star.' },
    { name: 'readOnly', type: 'boolean', default: false, description: 'Display-only; renders fractional fill and no controls.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Dim and disable interaction.' },
    { name: 'size', type: 'enum', values: ratingSizes, default: 'md', description: 'Star size step.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Render a placeholder: one star-shaped shimmer bone per star, in the live size and gap.' },
    { name: 'aria-label', type: 'string', description: 'Accessible name for the rating group.' },
  ],
  sizes: [
    { name: 'sm', fontSize: '0.9375rem' },
    { name: 'md', fontSize: '1.125rem' },
    { name: 'lg', fontSize: '1.5rem' },
  ],
  defaults: { max: 5, readOnly: false, disabled: false, size: 'md', skeleton: false },
  dimensions: { gap: '0.1em' },
  states: [
    { name: 'active', description: 'The pressed star scales to 0.9, easing there on the fast duration.', tokens: { duration: token('duration-fast'), ease: token('ease-out') } },
    { name: 'focus-visible', description: 'Keyboard focus on a star\'s hidden radio draws a 2px accent-solid outline around the cell, rounded to radius-sm, with a 2px offset.', tokens: { ring: token('accent-solid'), radius: token('radius-sm') } },
    { name: 'haptic', description: 'Scrubbing the pointer across the stars fires a selection tick each time the previewed star changes (the preview falling back to the committed value on pointer leave is silent), committing a value with a click fires light, and keyboard arrows tick selection per change; data-haptic="none" opts the rating out.', behavioral: true },
  ],
  // a 2px outline on the focused star cell; it paints accent-solid, not the shared focus-ring token
  focusRing: { ring: token('accent-solid'), offset: '2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: ['warning-solid', 'border-strong', 'accent-solid', 'radius-sm', 'duration-fast', 'ease-out'],
  a11y: {
    role: 'radiogroup',
    focusable: true,
    keyboard: [
      { keys: 'ArrowRight / ArrowUp', action: 'Move to and select the next star.' },
      { keys: 'ArrowLeft / ArrowDown', action: 'Move to and select the previous star.' },
    ],
    notes: [
      'Interactive ratings are a native radio group, so arrow-key selection and form participation come for free.',
      'Provide an aria-label to name the group. Read-only ratings expose role="img" with the value as their label.',
    ],
  },
};
