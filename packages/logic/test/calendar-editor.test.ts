import { describe, expect, it } from 'vitest';
import {
  draftForDate,
  draftFromEvent,
  draftIsValid,
  eventFromDraft,
  eventTimeSummary,
  parseLocal,
  removeEvent,
  timeString,
  upsertEvent,
  validateDraft,
  type CalendarEventDraft,
} from '../src/calendar-editor.ts';
import type { CalendarEvent } from '../src/calendar-view.ts';

const base: CalendarEventDraft = {
  title: 'Standup',
  date: '2026-07-15',
  start: '09:15',
  end: '',
  allDay: false,
  tone: 'accent',
};

describe('timeString', () => {
  it('zero-pads, so a field never shows 9:5', () => {
    expect(timeString(new Date(2026, 6, 15, 9, 5))).toBe('09:05');
  });

  it('is 24-hour', () => {
    expect(timeString(new Date(2026, 6, 15, 17, 30))).toBe('17:30');
  });
});

describe('parseLocal', () => {
  it('builds the local day that was typed', () => {
    const d = parseLocal('2026-07-15', '09:15')!;
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(6);
    expect(d.getDate()).toBe(15);
    expect(d.getHours()).toBe(9);
  });

  it('does not shift the day through UTC', () => {
    // Date.parse('2026-07-15') is midnight UTC, which is 14 July for anyone
    // west of Greenwich. Field-by-field construction cannot do that.
    const d = parseLocal('2026-07-15', '')!;
    expect(d.getDate()).toBe(15);
    expect(d.getHours()).toBe(0);
  });

  it('treats an empty time as midnight', () => {
    expect(parseLocal('2026-07-15', '')!.getHours()).toBe(0);
  });

  it('rejects a malformed date', () => {
    expect(parseLocal('15/07/2026', '09:00')).toBeNull();
    expect(parseLocal('2026-7-15', '09:00')).toBeNull();
    expect(parseLocal('', '09:00')).toBeNull();
  });

  it('rejects a malformed time', () => {
    expect(parseLocal('2026-07-15', '9am')).toBeNull();
    expect(parseLocal('2026-07-15', '25:00')).toBeNull();
    expect(parseLocal('2026-07-15', '09:99')).toBeNull();
  });

  it('rejects a date that does not exist', () => {
    // Month/day range checks pass for 31 February; only the rollover catches it.
    expect(parseLocal('2026-02-31', '')).toBeNull();
    expect(parseLocal('2026-13-01', '')).toBeNull();
  });

  it('accepts a real leap day and rejects a fake one', () => {
    expect(parseLocal('2028-02-29', '')).not.toBeNull();
    expect(parseLocal('2027-02-29', '')).toBeNull();
  });
});

describe('draftFromEvent', () => {
  it('splits an event into its form fields', () => {
    const event: CalendarEvent = {
      id: 'a',
      title: 'Review',
      start: new Date(2026, 6, 15, 14, 0),
      end: new Date(2026, 6, 15, 15, 30),
      tone: 'success',
    };
    expect(draftFromEvent(event)).toEqual({
      id: 'a',
      title: 'Review',
      date: '2026-07-15',
      start: '14:00',
      end: '15:30',
      allDay: false,
      tone: 'success',
    });
  });

  it('leaves the times blank for an all-day event', () => {
    const draft = draftFromEvent({ id: 'x', title: 'Holiday', start: new Date(2026, 6, 15), allDay: true });
    expect(draft.allDay).toBe(true);
    expect(draft.start).toBe('');
    expect(draft.end).toBe('');
  });

  it('defaults an untoned event to accent', () => {
    expect(draftFromEvent({ id: 'x', title: 'T', start: new Date(2026, 6, 15) }).tone).toBe('accent');
  });

  it('round-trips through an event unchanged', () => {
    const event: CalendarEvent = {
      id: 'a', title: 'Review', start: new Date(2026, 6, 15, 14, 0), end: new Date(2026, 6, 15, 15, 30), tone: 'success',
    };
    const back = eventFromDraft(draftFromEvent(event), 'unused')!;
    expect(back.id).toBe('a');
    expect(back.title).toBe('Review');
    expect(back.start.getTime()).toBe(event.start.getTime());
    expect(back.end!.getTime()).toBe(event.end!.getTime());
  });
});

describe('draftForDate', () => {
  it('is blank on the given day', () => {
    const draft = draftForDate(new Date(2026, 6, 20));
    expect(draft).toEqual({ title: '', date: '2026-07-20', start: '', end: '', allDay: false, tone: 'accent' });
  });

  it('has no id, which is what marks it as new', () => {
    expect(draftForDate(new Date(2026, 6, 20)).id).toBeUndefined();
  });

  it('accepts defaults', () => {
    expect(draftForDate(new Date(2026, 6, 20), { tone: 'danger', allDay: true }).tone).toBe('danger');
  });
});

describe('validateDraft', () => {
  it('accepts a good draft', () => {
    expect(validateDraft(base)).toEqual({});
    expect(draftIsValid(base)).toBe(true);
  });

  it('requires a title', () => {
    expect(validateDraft({ ...base, title: '' }).title).toBe('required');
    expect(validateDraft({ ...base, title: '   ' }).title).toBe('required');
  });

  it('accepts an empty end, since plenty of events have no stated finish', () => {
    expect(validateDraft({ ...base, end: '' })).toEqual({});
  });

  it('rejects an end before its start', () => {
    expect(validateDraft({ ...base, start: '14:00', end: '13:00' }).end).toBe('before-start');
  });

  it('accepts an end equal to its start', () => {
    expect(validateDraft({ ...base, start: '14:00', end: '14:00' }).end).toBeUndefined();
  });

  it('rejects a malformed time', () => {
    expect(validateDraft({ ...base, start: 'noon' }).start).toBe('invalid');
    expect(validateDraft({ ...base, end: '99:99' }).end).toBe('invalid');
  });

  it('rejects a malformed date', () => {
    expect(validateDraft({ ...base, date: 'tomorrow' }).date).toBe('invalid');
  });

  it('ignores the times entirely when all-day', () => {
    // The fields keep whatever they held, but an all-day event has no clock.
    expect(validateDraft({ ...base, allDay: true, start: 'nonsense', end: 'also nonsense' })).toEqual({});
  });

  it('reports every broken field at once, not just the first', () => {
    const errors = validateDraft({ ...base, title: '', end: '99:99' });
    expect(errors.title).toBe('required');
    expect(errors.end).toBe('invalid');
  });
});

describe('eventFromDraft', () => {
  it('builds an event', () => {
    const event = eventFromDraft(base, 'new-1')!;
    expect(event.id).toBe('new-1');
    expect(event.title).toBe('Standup');
    expect(event.start.getHours()).toBe(9);
    expect(event.allDay).toBeUndefined();
  });

  it('keeps an existing id rather than taking the supplied one', () => {
    expect(eventFromDraft({ ...base, id: 'existing' }, 'new-1')!.id).toBe('existing');
  });

  it('trims the title', () => {
    expect(eventFromDraft({ ...base, title: '  Standup  ' }, 'x')!.title).toBe('Standup');
  });

  it('marks an all-day event and gives it no end', () => {
    const event = eventFromDraft({ ...base, allDay: true, end: '17:00' }, 'x')!;
    expect(event.allDay).toBe(true);
    expect(event.end).toBeUndefined();
  });

  it('sets the end when one is given', () => {
    expect(eventFromDraft({ ...base, end: '10:00' }, 'x')!.end!.getHours()).toBe(10);
  });

  it('returns null for an invalid draft rather than a half-built event', () => {
    expect(eventFromDraft({ ...base, title: '' }, 'x')).toBeNull();
    expect(eventFromDraft({ ...base, end: '08:00' }, 'x')).toBeNull();
  });
});

describe('upsertEvent', () => {
  const a: CalendarEvent = { id: 'a', title: 'A', start: new Date(2026, 6, 1) };
  const b: CalendarEvent = { id: 'b', title: 'B', start: new Date(2026, 6, 2) };

  it('appends a new event', () => {
    expect(upsertEvent([a], b).map((e) => e.id)).toEqual(['a', 'b']);
  });

  it('replaces an existing one in place', () => {
    const edited = { ...a, title: 'A edited' };
    const next = upsertEvent([a, b], edited);
    expect(next.map((e) => e.id)).toEqual(['a', 'b']);
    expect(next[0]!.title).toBe('A edited');
  });

  it('does not mutate the input, so a caller holding it for undo still has it', () => {
    const list = [a, b];
    upsertEvent(list, { ...a, title: 'changed' });
    expect(list[0]!.title).toBe('A');
  });
});

describe('removeEvent', () => {
  const a: CalendarEvent = { id: 'a', title: 'A', start: new Date(2026, 6, 1) };
  const b: CalendarEvent = { id: 'b', title: 'B', start: new Date(2026, 6, 2) };

  it('drops the matching event', () => {
    expect(removeEvent([a, b], 'a').map((e) => e.id)).toEqual(['b']);
  });

  it('is a no-op for an unknown id', () => {
    expect(removeEvent([a, b], 'zzz')).toHaveLength(2);
  });

  it('does not mutate the input', () => {
    const list = [a, b];
    removeEvent(list, 'a');
    expect(list).toHaveLength(2);
  });
});

describe('eventTimeSummary', () => {
  const fmt = (d: Date) => timeString(d);

  it('shows a range when there is an end', () => {
    const event: CalendarEvent = {
      id: 'a', title: 'A', start: new Date(2026, 6, 1, 9, 0), end: new Date(2026, 6, 1, 10, 30),
    };
    expect(eventTimeSummary(event, fmt, 'All day')).toBe('09:00 – 10:30');
  });

  it('shows just the start when there is no end', () => {
    expect(eventTimeSummary({ id: 'a', title: 'A', start: new Date(2026, 6, 1, 9, 0) }, fmt, 'All day')).toBe('09:00');
  });

  it('says the all-day word instead of a clock', () => {
    expect(eventTimeSummary({ id: 'a', title: 'A', start: new Date(2026, 6, 1), allDay: true }, fmt, 'All day')).toBe(
      'All day',
    );
  });
});
