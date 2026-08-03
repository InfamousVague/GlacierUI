import { describe, expect, it } from 'vitest';
import {
  addDays,
  addMonths,
  bucketEvents,
  buildAgenda,
  buildMonthGrid,
  buildWeek,
  dayKey,
  sameDay,
  splitOverflow,
  startOfDay,
  startOfWeek,
  stepCalendar,
  weekdayOrder,
  MONTH_ROWS,
  type CalendarEvent,
} from '../src/calendar-view.ts';

// A fixed clock, so nothing here depends on the day the suite happens to run.
const TODAY = new Date(2026, 6, 15); // Wed 15 July 2026
const d = (y: number, m: number, day: number, h = 0) => new Date(y, m, day, h);

describe('date arithmetic', () => {
  it('startOfDay drops the time', () => {
    expect(startOfDay(d(2026, 6, 15, 23)).getHours()).toBe(0);
  });

  it('addDays crosses a month boundary', () => {
    expect(dayKey(addDays(d(2026, 6, 31), 1))).toBe('2026-08-01');
  });

  it('addDays crosses a year boundary', () => {
    expect(dayKey(addDays(d(2026, 11, 31), 1))).toBe('2027-01-01');
  });

  it('addDays goes backwards', () => {
    expect(dayKey(addDays(d(2026, 0, 1), -1))).toBe('2025-12-31');
  });

  it('addMonths anchors to the 1st rather than overflowing', () => {
    // From Jan 31, keeping the day-of-month would land in March and skip
    // February entirely.
    expect(dayKey(addMonths(d(2026, 0, 31), 1))).toBe('2026-02-01');
  });

  it('addMonths crosses a year boundary', () => {
    expect(dayKey(addMonths(d(2026, 11, 5), 1))).toBe('2027-01-01');
  });

  it('dayKey pads to a sortable form', () => {
    expect(dayKey(d(2026, 0, 5))).toBe('2026-01-05');
  });

  it('dayKey reports the local date, not the UTC one', () => {
    // Late-evening local time is already tomorrow in UTC for western zones and
    // yesterday for eastern ones; a calendar must use the local day.
    const late = new Date(2026, 6, 15, 23, 30);
    expect(dayKey(late)).toBe('2026-07-15');
    expect(late.getDate()).toBe(15);
  });

  it('sameDay ignores the time', () => {
    expect(sameDay(d(2026, 6, 15, 1), d(2026, 6, 15, 23))).toBe(true);
    expect(sameDay(d(2026, 6, 15), d(2026, 6, 16))).toBe(false);
  });

  it('startOfWeek respects a Sunday start', () => {
    expect(dayKey(startOfWeek(TODAY, 0))).toBe('2026-07-12');
  });

  it('startOfWeek respects a Monday start', () => {
    expect(dayKey(startOfWeek(TODAY, 1))).toBe('2026-07-13');
  });

  it('startOfWeek is idempotent on a week boundary', () => {
    const sunday = startOfWeek(TODAY, 0);
    expect(dayKey(startOfWeek(sunday, 0))).toBe(dayKey(sunday));
  });

  it('weekdayOrder rotates for a Monday start', () => {
    expect(weekdayOrder(0)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(weekdayOrder(1)).toEqual([1, 2, 3, 4, 5, 6, 0]);
  });
});

describe('buildMonthGrid', () => {
  const grid = buildMonthGrid(TODAY, { today: TODAY });

  it('is always six rows of seven, so paging does not change its height', () => {
    expect(grid).toHaveLength(MONTH_ROWS);
    for (const week of grid) expect(week).toHaveLength(7);
  });

  it('starts on the week containing the 1st', () => {
    // 1 July 2026 is a Wednesday, so a Sunday-start grid opens on 28 June.
    expect(grid[0]?.[0]?.key).toBe('2026-06-28');
  });

  it('marks the borrowed leading days as out of month', () => {
    expect(grid[0]?.[0]?.inMonth).toBe(false);
    expect(grid[0]?.[3]?.inMonth).toBe(true); // Wed 1 July
  });

  it('marks today, and only today', () => {
    const flat = grid.flat();
    expect(flat.filter((day) => day.isToday).map((day) => day.key)).toEqual(['2026-07-15']);
  });

  it('marks weekends', () => {
    const week = grid[1]!;
    expect(week.map((day) => day.isWeekend)).toEqual([true, false, false, false, false, false, true]);
  });

  it('shifts by one for a Monday start', () => {
    const monday = buildMonthGrid(TODAY, { today: TODAY, weekStartsOn: 1 });
    expect(monday[0]?.[0]?.key).toBe('2026-06-29');
  });

  it('still fills six rows for a short month', () => {
    // February 2027 is exactly four weeks and starts on a Monday - the case a
    // five-row grid would collapse on.
    const feb = buildMonthGrid(d(2027, 1, 10), { today: TODAY, weekStartsOn: 1 });
    expect(feb).toHaveLength(MONTH_ROWS);
    expect(feb[0]?.[0]?.key).toBe('2027-02-01');
  });

  it('covers the whole month', () => {
    const inMonth = buildMonthGrid(TODAY, { today: TODAY }).flat().filter((day) => day.inMonth);
    expect(inMonth).toHaveLength(31);
  });
});

describe('buildWeek', () => {
  it('returns seven consecutive days from the week start', () => {
    const week = buildWeek(TODAY, { today: TODAY });
    expect(week).toHaveLength(7);
    expect(week[0]?.key).toBe('2026-07-12');
    expect(week[6]?.key).toBe('2026-07-18');
  });

  it('treats every day as in-month, since there is no month to be out of', () => {
    // A week spanning two months would otherwise render half of itself dimmed.
    const week = buildWeek(d(2026, 6, 1), { today: TODAY });
    expect(week.every((day) => day.inMonth)).toBe(true);
  });
});

describe('buildAgenda', () => {
  it('lists n consecutive days from the anchor', () => {
    const days = buildAgenda(TODAY, 3, { today: TODAY });
    expect(days.map((day) => day.key)).toEqual(['2026-07-15', '2026-07-16', '2026-07-17']);
  });

  it('returns nothing for a non-positive count', () => {
    expect(buildAgenda(TODAY, 0, { today: TODAY })).toEqual([]);
    expect(buildAgenda(TODAY, -5, { today: TODAY })).toEqual([]);
  });
});

describe('bucketEvents', () => {
  const days = buildAgenda(TODAY, 5, { today: TODAY });
  const events: CalendarEvent[] = [
    { id: 'standup', title: 'Standup', start: d(2026, 6, 15, 9) },
    { id: 'review', title: 'Review', start: d(2026, 6, 15, 14) },
    { id: 'offsite', title: 'Offsite', start: d(2026, 6, 16), end: d(2026, 6, 18), allDay: true },
    { id: 'past', title: 'Last week', start: d(2026, 6, 1) },
  ];

  it('files an event under its day', () => {
    expect(bucketEvents(events, days).get('2026-07-15')?.map((e) => e.id)).toEqual(['standup', 'review']);
  });

  it('files a multi-day event under every day it spans', () => {
    // Checking your Wednesday should show the conference that runs through it.
    const buckets = bucketEvents(events, days);
    expect(buckets.get('2026-07-16')?.map((e) => e.id)).toEqual(['offsite']);
    expect(buckets.get('2026-07-17')?.map((e) => e.id)).toEqual(['offsite']);
    expect(buckets.get('2026-07-18')?.map((e) => e.id)).toEqual(['offsite']);
  });

  it('does not file it beyond its end', () => {
    expect(bucketEvents(events, days).get('2026-07-19')).toBeUndefined();
  });

  it('drops events outside the requested days', () => {
    const keys = [...bucketEvents(events, days).keys()];
    expect(keys).not.toContain('2026-07-01');
  });

  it('sorts all-day events above timed ones', () => {
    const sameDayEvents: CalendarEvent[] = [
      { id: 'late', title: 'Late', start: d(2026, 6, 15, 16) },
      { id: 'holiday', title: 'Holiday', start: d(2026, 6, 15), allDay: true },
      { id: 'early', title: 'Early', start: d(2026, 6, 15, 8) },
    ];
    const bucket = bucketEvents(sameDayEvents, days).get('2026-07-15');
    expect(bucket?.map((e) => e.id)).toEqual(['holiday', 'early', 'late']);
  });

  it('breaks a start-time tie by title, so the order is stable', () => {
    const tied: CalendarEvent[] = [
      { id: 'b', title: 'Beta', start: d(2026, 6, 15, 9) },
      { id: 'a', title: 'Alpha', start: d(2026, 6, 15, 9) },
    ];
    expect(bucketEvents(tied, days).get('2026-07-15')?.map((e) => e.id)).toEqual(['a', 'b']);
  });

  it('treats a backwards range as a single day rather than looping', () => {
    const backwards: CalendarEvent[] = [{ id: 'x', title: 'Typo', start: d(2026, 6, 16), end: d(2026, 6, 14) }];
    const buckets = bucketEvents(backwards, days);
    expect(buckets.get('2026-07-16')?.map((e) => e.id)).toEqual(['x']);
    expect(buckets.size).toBe(1);
  });

  it('returns nothing for no events', () => {
    expect(bucketEvents([], days).size).toBe(0);
  });
});

describe('stepCalendar', () => {
  it('moves a month view by a month', () => {
    expect(dayKey(stepCalendar(TODAY, 'month', 1))).toBe('2026-08-01');
    expect(dayKey(stepCalendar(TODAY, 'month', -1))).toBe('2026-06-01');
  });

  it('moves a week view by a week', () => {
    expect(dayKey(stepCalendar(TODAY, 'week', 1))).toBe('2026-07-22');
    expect(dayKey(stepCalendar(TODAY, 'week', -1))).toBe('2026-07-08');
  });

  it('moves an agenda by a week too', () => {
    expect(dayKey(stepCalendar(TODAY, 'agenda', 1))).toBe('2026-07-22');
  });
});

describe('splitOverflow', () => {
  const make = (n: number): CalendarEvent[] =>
    Array.from({ length: n }, (_, i) => ({ id: `e${i}`, title: `E${i}`, start: TODAY }));

  it('shows everything when it fits', () => {
    expect(splitOverflow(make(3))).toEqual({ shown: make(3), hidden: 0 });
  });

  it('leaves a slot for the overflow line rather than growing the cell', () => {
    // Four events into a three-slot cell: two shown, and "+2 more" in the third.
    const { shown, hidden } = splitOverflow(make(4));
    expect(shown).toHaveLength(2);
    expect(hidden).toBe(2);
    expect(shown.length + 1).toBe(3);
  });

  it('accounts for every event', () => {
    const { shown, hidden } = splitOverflow(make(9));
    expect(shown.length + hidden).toBe(9);
  });

  it('handles an empty day', () => {
    expect(splitOverflow([])).toEqual({ shown: [], hidden: 0 });
  });
});
