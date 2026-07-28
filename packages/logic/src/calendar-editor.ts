/**
 * Calendar event editing — the draft model behind the editor popover.
 *
 * An editor cannot work on a `CalendarEvent` directly: its `start` is a single
 * `Date`, while the form has separate date, start-time, and end-time fields
 * that are each independently half-typed as the user works. A draft holds those
 * as the strings the inputs actually own, and only becomes an event once it
 * parses.
 *
 * Every conversion here uses local-time construction for the same reason
 * `dayKey` does: `toISOString` and `Date.parse('YYYY-MM-DD')` both go through
 * UTC, which shifts the day for anyone not on Greenwich. An editor that moved
 * an event to the previous day for half the planet would be worse than no
 * editor.
 */

import { dayKey, type CalendarEvent, type CalendarTone } from './calendar-view.ts';

/** The editor's working copy: what the form fields hold, as they hold it. */
export interface CalendarEventDraft {
  /** Absent for a new event; the existing id when editing one. */
  id?: string;
  title: string;
  /** `YYYY-MM-DD`, local. */
  date: string;
  /** `HH:MM`, local. Ignored when `allDay`. */
  start: string;
  /** `HH:MM`, local. Empty means the event has no explicit end. */
  end: string;
  allDay: boolean;
  tone: CalendarTone;
}

/** Which fields a draft cannot be saved with, keyed by field name. */
export interface DraftErrors {
  title?: 'required';
  date?: 'invalid';
  start?: 'invalid';
  end?: 'invalid' | 'before-start';
}

const TIME = /^(\d{1,2}):(\d{2})$/;
const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** `HH:MM` in local time, zero-padded so the field never shows `9:5`. */
export function timeString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Builds a Date from a local `YYYY-MM-DD` and `HH:MM`, or null if either is
 * malformed. Constructed field by field rather than parsed from a string, so
 * the result is the local day the user typed.
 */
export function parseLocal(date: string, time: string): Date | null {
  const d = DATE.exec(date.trim());
  if (!d) return null;
  const year = Number(d[1]);
  const month = Number(d[2]);
  const day = Number(d[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  let hours = 0;
  let minutes = 0;
  if (time.trim()) {
    const t = TIME.exec(time.trim());
    if (!t) return null;
    hours = Number(t[1]);
    minutes = Number(t[2]);
    if (hours > 23 || minutes > 59) return null;
  }

  const result = new Date(year, month - 1, day, hours, minutes);
  // Rolls over on an impossible date (31 February), which the field checks
  // above cannot catch.
  if (result.getMonth() !== month - 1 || result.getDate() !== day) return null;
  return result;
}

/** The draft for editing an event that already exists. */
export function draftFromEvent(event: CalendarEvent): CalendarEventDraft {
  return {
    id: event.id,
    title: event.title,
    date: dayKey(event.start),
    start: event.allDay ? '' : timeString(event.start),
    // Only a same-day end is expressible in this form; a multi-day event keeps
    // its end untouched unless the user edits the time, which is better than
    // silently truncating it to the start day.
    end: event.end && !event.allDay ? timeString(event.end) : '',
    allDay: event.allDay ?? false,
    tone: event.tone ?? 'accent',
  };
}

/** A blank draft for a new event on a given day. */
export function draftForDate(date: Date, defaults: Partial<CalendarEventDraft> = {}): CalendarEventDraft {
  return {
    title: '',
    date: dayKey(date),
    start: '',
    end: '',
    allDay: false,
    tone: 'accent',
    ...defaults,
  };
}

/**
 * What is wrong with a draft, as field errors rather than one message, so the
 * form can mark the field the user has to fix.
 *
 * An empty end is valid — plenty of events have no stated finish. An end
 * *before* its start is not, and is the one mistake a time field invites.
 */
export function validateDraft(draft: CalendarEventDraft): DraftErrors {
  const errors: DraftErrors = {};
  if (!draft.title.trim()) errors.title = 'required';

  const start = parseLocal(draft.date, draft.allDay ? '' : draft.start);
  if (!DATE.test(draft.date.trim())) errors.date = 'invalid';
  else if (!start) {
    if (!draft.allDay && draft.start.trim()) errors.start = 'invalid';
    else errors.date = 'invalid';
  }

  if (!draft.allDay && draft.end.trim()) {
    const end = parseLocal(draft.date, draft.end);
    if (!end) errors.end = 'invalid';
    else if (start && end.getTime() < start.getTime()) errors.end = 'before-start';
  }

  return errors;
}

/** Whether a draft can be saved. */
export function draftIsValid(draft: CalendarEventDraft): boolean {
  return Object.keys(validateDraft(draft)).length === 0;
}

/**
 * Turns a draft into an event, or null when it does not validate.
 *
 * `id` is the caller's to supply for a new event: this package has no id
 * strategy and inventing one here would bury a random value inside a pure
 * function, which is also untestable.
 */
export function eventFromDraft(draft: CalendarEventDraft, id: string): CalendarEvent | null {
  if (!draftIsValid(draft)) return null;
  const start = parseLocal(draft.date, draft.allDay ? '' : draft.start);
  if (!start) return null;

  const event: CalendarEvent = {
    id: draft.id ?? id,
    title: draft.title.trim(),
    start,
    tone: draft.tone,
  };
  if (draft.allDay) event.allDay = true;

  if (!draft.allDay && draft.end.trim()) {
    const end = parseLocal(draft.date, draft.end);
    if (end) event.end = end;
  }
  return event;
}

/**
 * Replaces an event in a list, or appends it when the id is new — the whole
 * update a host has to perform when the editor reports a save.
 *
 * Returns a new array; the input is never mutated, so a caller holding the
 * previous list for undo still has it.
 */
export function upsertEvent(events: CalendarEvent[], event: CalendarEvent): CalendarEvent[] {
  const index = events.findIndex((candidate) => candidate.id === event.id);
  if (index === -1) return [...events, event];
  const next = events.slice();
  next[index] = event;
  return next;
}

/** Removes an event by id, returning a new array. */
export function removeEvent(events: CalendarEvent[], id: string): CalendarEvent[] {
  return events.filter((event) => event.id !== id);
}

/**
 * The one-line summary a hover preview shows under the title: the time range,
 * or the all-day word. Times come from the caller's formatter so the preview
 * speaks the same clock as the rest of the calendar.
 */
export function eventTimeSummary(
  event: CalendarEvent,
  format: (date: Date) => string,
  allDayLabel: string,
): string {
  if (event.allDay) return allDayLabel;
  const start = format(event.start);
  if (!event.end) return start;
  return `${start} – ${format(event.end)}`;
}
