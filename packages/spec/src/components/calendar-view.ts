import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** How the calendar is showing its range. */
export const calendarViewModes = ['month', 'week', 'agenda'] as const;

/** The colour families an event can carry. */
export const calendarEventTones = ['accent', 'success', 'warning', 'danger', 'info', 'neutral'] as const;

export const calendarViewSpec: ComponentSpec = {
  name: 'CalendarView',
  id: 'calendar-view',
  category: 'organism',
  status: 'draft',
  summary:
    'A scheduler surface: events laid over a month grid, a week, or an agenda list, with one header that pages the range and switches between them.',
  element: 'div',
  anatomy: [
    { name: 'header', description: 'The title of the current range, the previous/next/today controls, and the view switch.', required: true },
    { name: 'title', description: 'The range in words - the month and year, or the span a week or agenda covers.', required: true },
    { name: 'nav', description: 'Previous, today, and next. Today is a separate control rather than a keyboard secret.' },
    { name: 'switch', description: 'The month/week/agenda segmented control.' },
    { name: 'weekdays', description: 'The weekday header row, in the order the week starts on.' },
    { name: 'grid', description: 'The month grid: six rows of seven day cells.', required: true },
    { name: 'day', description: 'One day cell: its number, and the events that touch it.', required: true },
    { name: 'event', description: 'One event chip, tinted by its tone.', required: true },
    { name: 'overflow', description: 'The "+N more" line a cell shows when its events outnumber its slots.' },
    { name: 'empty', description: 'What an agenda shows for a range with nothing in it.' },
  ],
  props: [
    { name: 'events', type: 'array', required: true, item: { type: 'object', description: 'An event: id, start, title, and optional end, tone, and allDay.' }, description: 'Everything to lay over the range. Events outside it are ignored, so a whole year can be passed to a one-week view.' },
    { name: 'mode', type: 'enum', values: calendarViewModes, description: 'Controlled view mode.' },
    { name: 'defaultMode', type: 'enum', values: calendarViewModes, default: 'month', description: 'Initial view mode when uncontrolled.' },
    { name: 'onModeChange', type: 'handler', description: 'Called with the new mode when the view switch is used.' },
    { name: 'date', type: 'string', description: 'Controlled anchor date; the range shown is the one containing it.' },
    { name: 'defaultDate', type: 'string', description: 'Initial anchor when uncontrolled. Defaults to today.' },
    { name: 'onDateChange', type: 'handler', description: 'Called with the new anchor as the user pages the range.' },
    { name: 'weekStartsOn', type: 'enum', values: ['0', '1'], default: '0', description: 'Which weekday a week starts on: 0 for Sunday, 1 for Monday.' },
    { name: 'selected', type: 'string', description: 'Controlled selected day; the cell is marked and reported back.' },
    { name: 'onSelectDay', type: 'handler', description: 'Called with the day a user presses. Omit it and day cells are not pressable.' },
    { name: 'onSelectEvent', type: 'handler', description: 'Called with the event a user presses. Omit it and event chips are not pressable.' },
    { name: 'today', type: 'string', description: 'Which day to mark as today. Injectable so a screenshot or a test is not clock-dependent.' },
    { name: 'agendaDays', type: 'number', default: 7, description: 'How many days the agenda lists.' },
    { name: 'formatTime', type: 'handler', description: 'Formats an event time. Defaults to the locale short time.' },
    { name: 'emptyLabel', type: 'node', description: 'Shown when an agenda range holds no events.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact grid geometry.' },
  ],
  defaults: { defaultMode: 'month', weekStartsOn: '0', agendaDays: 7, skeleton: false },
  dimensions: {
    radius: token('radius-lg'),
    gap: token('space-1'),
    cellPadding: token('space-2'),
    border: token('hairline'),
  },
  states: [
    { name: 'default', description: 'The current month, today marked, with events laid into their days.' },
    {
      name: 'active',
      description: 'Today. Marked on its number rather than by filling the whole cell, so it reads as a date and not as a selection.',
      tokens: { background: token('accent-solid'), text: token('accent-contrast') },
    },
    {
      name: 'selected',
      description: 'The day the user pressed. Tints the cell, which is what distinguishes it from today marking only its number.',
      tokens: { background: token('accent-soft'), border: token('accent-border') },
    },
    {
      name: 'muted',
      description: 'The leading and trailing days borrowed from adjacent months. Dimmed rather than blanked, because their events are still real.',
      tokens: { text: token('text-subtle') },
    },
    {
      name: 'empty',
      description: 'An agenda range with nothing in it, said in one quiet line rather than an empty box.',
      tokens: { text: token('text-subtle') },
    },
    { name: 'skeleton', description: 'The grid keeps its exact six-by-seven geometry while loading, so nothing reflows when the events land.' },
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
    'accent-solid', 'accent-soft', 'accent-border', 'accent-contrast', 'accent-text',
    'success-soft', 'success-text', 'warning-soft', 'warning-text',
    'danger-soft', 'danger-text', 'info-soft', 'info-text',
    'space-1', 'space-2', 'space-3', 'radius-lg', 'radius-sm', 'hairline',
    'font-size-sm', 'font-size-xs', 'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'grid',
    focusable: true,
    keyboard: [
      { keys: 'Arrows', action: 'Moves the focused day by one day, or one week vertically.' },
      { keys: 'Home, End', action: 'Jumps to the first or last day of the focused week.' },
      { keys: 'PageUp, PageDown', action: 'Pages the range back or forward.' },
      { keys: 'Enter, Space', action: 'Selects the focused day.' },
    ],
    notes: [
      'The month grid is a real grid: rows are weeks and cells are days, so a screen reader can navigate it two-dimensionally instead of as one long list.',
      'Only one day cell is tabbable at a time; the arrows move focus within the grid. Tab therefore leaves the calendar rather than walking 42 cells.',
      'Each cell names its full date, not just its number, so "15" is announced as the date it is rather than a bare digit.',
      'The agenda view is a list, not a grid - it has no second axis to navigate, and pretending otherwise would announce a structure that is not there.',
    ],
  },
  motion: {
    description: 'Paging swaps the range without animating the cells: at six rows of seven, any transition reads as the whole page flickering.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
