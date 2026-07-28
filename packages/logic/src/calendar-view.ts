/**
 * Calendar view logic — the grid building, event bucketing, and navigation
 * behind a scheduler surface. All of it is arithmetic rather than pixels, so
 * both bindings lay out the same month from the same inputs.
 *
 * Deliberately dependency-free. Every step here uses the local-date
 * constructor (`new Date(y, m, d)`) rather than adding milliseconds, because
 * a day is not always 24 hours: on a DST boundary "+86400000" lands on the
 * same calendar day or skips one, and a calendar that loses a day twice a year
 * is worse than no calendar.
 */

/** How the calendar is showing its range. */
export type CalendarViewMode = 'month' | 'week' | 'agenda';

/** Which weekday a week starts on. Sunday in the US, Monday most elsewhere. */
export type WeekStart = 0 | 1;

/** The colour families an event can carry, matching the kit's tone vocabulary. */
export type CalendarTone = 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

/** One scheduled thing. */
export interface CalendarEvent {
  /** Stable identity; also what selection handlers report back. */
  id: string;
  /** When it starts. */
  start: Date;
  /** When it ends. Omitted means it occupies only its start day. */
  end?: Date;
  /** The line the user reads. */
  title: string;
  /** Colour family; defaults to accent at the binding. */
  tone?: CalendarTone;
  /** Shown without a time, and sorted above timed events on its day. */
  allDay?: boolean;
}

/** One cell in a grid: a date plus everything the cell needs to paint itself. */
export interface CalendarDay {
  date: Date;
  /** `YYYY-MM-DD` in local time — the bucket key, and a stable React key. */
  key: string;
  /** False for the leading and trailing days borrowed from adjacent months. */
  inMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

/** Midnight on the given date, in local time. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** `n` days after `date` (negative to go back), at midnight. */
export function addDays(date: Date, n: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
}

/**
 * `n` months after `date`, anchored to the 1st.
 *
 * Anchoring matters: stepping from January 31st by one month with the day-of-
 * month intact overflows into March 3rd, so a user paging forward would skip
 * February entirely.
 */
export function addMonths(date: Date, n: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

/** `YYYY-MM-DD` in local time. Never `toISOString`, which converts to UTC and so shifts the date for anyone east or west of Greenwich. */
export function dayKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Whether two dates fall on the same calendar day. */
export function sameDay(a: Date, b: Date): boolean {
  return dayKey(a) === dayKey(b);
}

/** The weekday numbers in display order, e.g. `[1,2,3,4,5,6,0]` for a Monday start. */
export function weekdayOrder(weekStartsOn: WeekStart = 0): number[] {
  return [0, 1, 2, 3, 4, 5, 6].map((i) => (i + weekStartsOn) % 7);
}

/** The first day of the week `date` falls in. */
export function startOfWeek(date: Date, weekStartsOn: WeekStart = 0): Date {
  const day = date.getDay();
  const back = (day - weekStartsOn + 7) % 7;
  return addDays(date, -back);
}

interface GridOptions {
  weekStartsOn?: WeekStart;
  /** Which day to mark as today. Injectable so tests are not clock-dependent. */
  today?: Date;
}

function toDay(date: Date, month: number, today: Date): CalendarDay {
  const weekday = date.getDay();
  return {
    date,
    key: dayKey(date),
    inMonth: date.getMonth() === month,
    isToday: sameDay(date, today),
    isWeekend: weekday === 0 || weekday === 6,
  };
}

/** How many rows a month grid always has. */
export const MONTH_ROWS = 6;

/**
 * The month `anchor` falls in, as six rows of seven days.
 *
 * Always six rows, even when five would hold the month. A grid that changes
 * height as you page through the year makes everything below it jump, and the
 * cost is one mostly-empty row in the months that do not need it.
 */
export function buildMonthGrid(anchor: Date, options: GridOptions = {}): CalendarDay[][] {
  const { weekStartsOn = 0, today = new Date() } = options;
  const month = anchor.getMonth();
  const first = new Date(anchor.getFullYear(), month, 1);
  const start = startOfWeek(first, weekStartsOn);

  const weeks: CalendarDay[][] = [];
  for (let row = 0; row < MONTH_ROWS; row += 1) {
    const week: CalendarDay[] = [];
    for (let col = 0; col < 7; col += 1) week.push(toDay(addDays(start, row * 7 + col), month, today));
    weeks.push(week);
  }
  return weeks;
}

/**
 * The week `anchor` falls in, as seven days.
 *
 * Every day is `inMonth: true` — a week view has no adjacent month to borrow
 * from, so dimming the days that happen to fall outside the anchor's month
 * would only make the week look broken.
 */
export function buildWeek(anchor: Date, options: GridOptions = {}): CalendarDay[] {
  const { weekStartsOn = 0, today = new Date() } = options;
  const start = startOfWeek(anchor, weekStartsOn);
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    return { ...toDay(date, date.getMonth(), today), inMonth: true };
  });
}

/** `count` consecutive days from `anchor`, the range an agenda lists. */
export function buildAgenda(anchor: Date, count: number, options: GridOptions = {}): CalendarDay[] {
  const { today = new Date() } = options;
  const start = startOfDay(anchor);
  return Array.from({ length: Math.max(0, count) }, (_, i) => {
    const date = addDays(start, i);
    return { ...toDay(date, date.getMonth(), today), inMonth: true };
  });
}

/**
 * Sorts the events of a single day into reading order: all-day first, then by
 * start time, then by title so the order is stable rather than dependent on
 * whatever order the caller happened to pass.
 */
function byDayOrder(a: CalendarEvent, b: CalendarEvent): number {
  if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
  const delta = a.start.getTime() - b.start.getTime();
  if (delta !== 0) return delta;
  return a.title.localeCompare(b.title);
}

/**
 * Groups events by the day key of every day they touch.
 *
 * A multi-day event is filed under each day it spans, not only its first — a
 * conference that runs Tuesday to Thursday should appear on Wednesday, which is
 * the day someone checking their Wednesday actually looks at.
 *
 * Events outside the requested days are skipped, so passing a whole year's
 * events to a one-week view costs a scan and nothing else.
 */
export function bucketEvents(events: CalendarEvent[], days: CalendarDay[]): Map<string, CalendarEvent[]> {
  const wanted = new Set(days.map((d) => d.key));
  const buckets = new Map<string, CalendarEvent[]>();

  for (const event of events) {
    const from = startOfDay(event.start);
    const to = startOfDay(event.end ?? event.start);
    // A backwards range would loop forever; treat it as a single day instead.
    const span = Math.max(0, Math.round((to.getTime() - from.getTime()) / 86_400_000));

    for (let i = 0; i <= span; i += 1) {
      const key = dayKey(addDays(from, i));
      if (!wanted.has(key)) continue;
      const bucket = buckets.get(key);
      if (bucket) bucket.push(event);
      else buckets.set(key, [event]);
    }
  }

  for (const bucket of buckets.values()) bucket.sort(byDayOrder);
  return buckets;
}

/**
 * Where paging forward or back lands, given the mode.
 *
 * Each mode steps by what it shows: a month view moves a month, and week and
 * agenda views move a week, so the range the user is looking at is replaced
 * rather than scrolled.
 */
export function stepCalendar(anchor: Date, mode: CalendarViewMode, delta: number): Date {
  if (mode === 'month') return addMonths(anchor, delta);
  return addDays(startOfDay(anchor), delta * 7);
}

/** How many events a month cell shows before collapsing the rest into a "+N" line. */
export const MONTH_CELL_LIMIT = 3;

/**
 * Splits a day's events into the ones a month cell shows and a count of the
 * rest. Shared so both bindings overflow at the same point — a cell that shows
 * three on one platform and four on the other is a layout that cannot be
 * designed against.
 */
export function splitOverflow(
  events: CalendarEvent[],
  limit: number = MONTH_CELL_LIMIT,
): { shown: CalendarEvent[]; hidden: number } {
  if (events.length <= limit) return { shown: events, hidden: 0 };
  // Show one fewer than the limit, because the "+N more" line occupies a slot
  // of its own — otherwise the cell is one row taller than it was measured for.
  const shown = events.slice(0, Math.max(0, limit - 1));
  return { shown, hidden: events.length - shown.length };
}
