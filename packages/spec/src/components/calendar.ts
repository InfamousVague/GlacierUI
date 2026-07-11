import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const calendarModes = ['single', 'range'] as const;

export const calendarSpec: ComponentSpec = {
  name: 'Calendar',
  id: 'calendar',
  category: 'molecule',
  status: 'draft',
  summary:
    'An inline month grid for picking a single date or a date range, delegating date math, keyboard navigation, and grid ARIA to react-day-picker and restyling every surface with kit tokens.',
  element: 'div',
  anatomy: [
    { name: 'nav', description: 'The month navigation row floating over the caption: previous at inline-start, next at inline-end.', required: true },
    { name: 'navButton', description: 'A circular icon button that steps one month back or forward; disabled at the min/max bounds.' },
    { name: 'caption', description: 'The centered month-and-year label, announced politely when the month changes.', required: true },
    { name: 'grid', description: 'The role="grid" month table: a weekday header row and up to six week rows.', required: true },
    { name: 'weekday', description: 'A column header cell with the localized short weekday name.' },
    { name: 'day', description: 'A gridcell holding one day button; carries the selected, range, today, outside, and disabled states.', required: true },
    { name: 'dayButton', description: 'The focusable button inside a day cell; a roving tab index keeps exactly one in the tab order.' },
  ],
  props: [
    { name: 'mode', type: 'enum', values: calendarModes, default: 'single', description: 'Pick one date or a from/to range.' },
    { name: 'value', type: 'object', description: 'Controlled selected date (a Date), in single mode.' },
    { name: 'defaultValue', type: 'object', description: 'Uncontrolled initial date, in single mode.' },
    { name: 'onValueChange', type: 'handler', description: 'Called with the next date, or nothing when the selected day is unpicked.' },
    {
      name: 'rangeValue',
      type: 'object',
      description: 'Controlled selected range, in range mode.',
      fields: [
        { name: 'from', type: 'object', description: 'Range start date.' },
        { name: 'to', type: 'object', description: 'Range end date; unset while only the start is picked.' },
      ],
    },
    { name: 'defaultRangeValue', type: 'object', description: 'Uncontrolled initial range, in range mode.' },
    { name: 'onRangeChange', type: 'handler', description: 'Called with the next range; from is set first, then to.' },
    { name: 'min', type: 'object', description: 'Earliest selectable date; earlier days are disabled and navigation stops at its month.' },
    { name: 'max', type: 'object', description: 'Latest selectable date; later days are disabled and navigation stops at its month.' },
    { name: 'disabledDates', type: 'handler', description: 'Predicate (date) => boolean; matching dates render disabled and cannot be selected.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Disables every day and the month navigation.' },
    { name: 'dateFnsLocale', type: 'object', description: 'date-fns locale override for month and weekday names; defaults to the mapped kit locale.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the grid geometry.' },
    { name: 'bare', type: 'boolean', default: false, description: 'Drops the card chrome, for hosts that already frame the grid (the DatePicker panel).' },
    { name: 'aria-label', type: 'string', description: 'Accessible name for the calendar root; the month grid labels itself with the visible month.' },
  ],
  defaults: { mode: 'single', disabled: false, skeleton: false, bare: false },
  dimensions: {
    radius: token('radius-lg'),
    padding: token('space-4'),
    border: token('hairline'),
    dayCell: token('space-8'),
    dayRadius: token('control-radius'),
    captionGap: token('space-2'),
  },
  states: [
    { name: 'hover', description: 'A hoverable day paints the hover wash.', tokens: { background: token('hover') } },
    { name: 'focus', description: 'The focused day button shows the accent-soft ring.', tokens: { ring: token('accent-soft') } },
    { name: 'selected', description: 'The selected day (and both range endpoints) fill with the solid accent.', paint: { background: token('accent-solid'), text: token('accent-contrast') } },
    { name: 'range-middle', description: 'Days between the range endpoints sit on a soft accent band.', paint: { background: token('accent-soft'), text: token('accent-text') } },
    { name: 'today', description: 'Today renders in the accent text tone at semibold weight.', tokens: { text: token('accent-text') } },
    { name: 'disabled', description: 'Disabled and out-of-bounds days dim to the disabled text tone and cannot be picked.' },
  ],
  focusRing: { ring: token('accent-soft'), offset: '0' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'font-sans', 'space-1', 'space-2', 'space-4', 'space-6', 'space-8',
    'font-size-xs', 'font-size-sm', 'font-weight-regular', 'font-weight-medium', 'font-weight-semibold',
    'radius-lg', 'control-radius', 'hairline', 'size-md',
    'border', 'surface', 'hover',
    'text', 'text-muted', 'text-subtle', 'text-disabled',
    'accent-solid', 'accent-solid-hover', 'accent-soft', 'accent-contrast', 'accent-text',
    'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'grid',
    focusable: true,
    keyboard: [
      { keys: 'ArrowLeft, ArrowRight, ArrowUp, ArrowDown', action: 'Moves focus by one day or one week, crossing month boundaries.' },
      { keys: 'PageUp, PageDown', action: 'Moves focus to the same day of the previous or next month.' },
      { keys: 'Shift+PageUp, Shift+PageDown', action: 'Moves focus to the same day of the previous or next year.' },
      { keys: 'Home, End', action: 'Moves focus to the first or last day of the week.' },
      { keys: 'Enter, Space', action: 'Selects the focused day (or extends the range in range mode).' },
    ],
    notes: [
      'The month table is role="grid" labelled with the visible month; each day is a gridcell wrapping a button, with aria-selected on selected cells and aria-multiselectable in range mode.',
      'A roving tab index keeps exactly one day button in the tab order; the caption is a polite live region so month changes are announced.',
      'The grid semantics and keyboard map come from react-day-picker; the kit only restyles them.',
    ],
  },
  motion: {
    description: 'Static: month changes swap content without animation; day paint transitions use the fast/out pair. The DatePicker panel provides the pop-in.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
