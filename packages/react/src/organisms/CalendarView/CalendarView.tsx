import { Size, TextTone, Variant } from '@glacier/spec';
import {
  bucketEvents,
  buildAgenda,
  buildMonthGrid,
  buildWeek,
  dayKey,
  sameDay,
  splitOverflow,
  startOfDay,
  stepCalendar,
  useControlled,
  weekdayOrder,
  type CalendarDay,
  type CalendarEvent,
  type CalendarViewMode,
  type WeekStart,
} from '@glacier/logic';
import { useMemo, useRef, useState, type ComponentProps, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { useLocale, useT } from '../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../i18n/messages.ts';
import { IconButton } from '../../atoms/inputs/Button/IconButton.tsx';
import { Button } from '../../atoms/inputs/Button/Button.tsx';
import { SegmentedControl } from '../../molecules/Segmented/SegmentedControl.tsx';
import { Text } from '../../atoms/display/Typography/Text.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import styles from './CalendarView.module.css';

export type { CalendarEvent, CalendarViewMode, WeekStart } from '@glacier/logic';

export interface CalendarViewProps extends Omit<ComponentProps<'div'>, 'onSelect'> {
  /** Everything to lay over the range. Events outside it are ignored. */
  events: CalendarEvent[];
  mode?: CalendarViewMode;
  defaultMode?: CalendarViewMode;
  onModeChange?: (mode: CalendarViewMode) => void;
  /** Controlled anchor date; the range shown is the one containing it. */
  date?: Date;
  defaultDate?: Date;
  onDateChange?: (date: Date) => void;
  /** 0 for Sunday, 1 for Monday. */
  weekStartsOn?: WeekStart;
  selected?: Date;
  /** Omit to leave day cells unpressable. */
  onSelectDay?: (date: Date) => void;
  /** Omit to leave event chips unpressable. */
  onSelectEvent?: (event: CalendarEvent) => void;
  /** Which day to mark as today; injectable so a test is not clock-dependent. */
  today?: Date;
  /** How many days the agenda lists. */
  agendaDays?: number;
  formatTime?: (date: Date) => string;
  emptyLabel?: ReactNode;
  skeleton?: boolean;
}

const Chevron = ({ back }: { back?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path
      d={back ? 'M9 2L4 7l5 5' : 'M5 2l5 5-5 5'}
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * A scheduler surface: events laid over a month grid, a week, or an agenda.
 *
 * Distinct from `DatePicker`, which is an input — this one shows what is
 * *scheduled*, and its day cells are content rather than choices. All the date
 * arithmetic, bucketing, and paging live in @glacier/logic, so the native
 * calendar builds the same grid from the same inputs.
 *
 * Month and week are one `role="grid"` with roving focus: exactly one cell is
 * tabbable and the arrows move within, so Tab leaves the calendar rather than
 * walking forty-two cells. Agenda is a plain list, because it has no second
 * axis and announcing a grid there would describe a structure that is not
 * present.
 */
export function CalendarView({
  events,
  mode: modeProp,
  defaultMode = 'month',
  onModeChange,
  date: dateProp,
  defaultDate,
  onDateChange,
  weekStartsOn = 0,
  selected,
  onSelectDay,
  onSelectEvent,
  today: todayProp,
  agendaDays = 7,
  formatTime,
  emptyLabel,
  skeleton = false,
  className,
  ...rest
}: CalendarViewProps) {
  const t = useT();
  const locale = useLocale();

  // Resolved once per render so every comparison in this pass agrees, even if
  // the render straddles midnight.
  const today = todayProp ?? new Date();

  const [mode, setMode] = useControlled<CalendarViewMode>({
    value: modeProp,
    defaultValue: defaultMode,
    onChange: onModeChange,
  });
  const [anchor, setAnchor] = useControlled<Date>({
    value: dateProp,
    defaultValue: defaultDate ?? today,
    onChange: onDateChange,
  });

  // The cell the arrows are moving, kept apart from `selected`: moving focus
  // through a month should not fire a selection on every keystroke.
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const days = useMemo(() => {
    if (mode === 'month') return buildMonthGrid(anchor, { weekStartsOn, today }).flat();
    if (mode === 'week') return buildWeek(anchor, { weekStartsOn, today });
    return buildAgenda(anchor, agendaDays, { today });
  }, [mode, anchor, weekStartsOn, agendaDays, today]);

  const buckets = useMemo(() => bucketEvents(events, days), [events, days]);

  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    [locale],
  );
  const weekdayFmt = useMemo(() => new Intl.DateTimeFormat(locale, { weekday: 'short' }), [locale]);
  const timeFmt = useMemo(() => new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }), [locale]);
  const showTime = formatTime ?? ((d: Date) => timeFmt.format(d));

  // The range in words. A month says its month; a week or agenda says its span,
  // collapsing the repeated month when both ends share one.
  const title = useMemo(() => {
    if (mode === 'month') {
      return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(anchor);
    }
    const first = days[0]?.date;
    const last = days[days.length - 1]?.date;
    if (!first || !last) return '';
    const sameMonth = first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear();
    const left = new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      year: sameMonth ? undefined : 'numeric',
    }).format(first);
    const right = new Intl.DateTimeFormat(locale, {
      month: sameMonth ? undefined : 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(last);
    return `${left} – ${right}`;
  }, [mode, anchor, days, locale]);

  const page = (delta: number) => {
    setAnchor(stepCalendar(anchor, mode, delta));
    // The focused cell belongs to the range that just left; dropping it hands
    // the roving tab stop back to the new range's default.
    setFocusedKey(null);
  };

  const goToday = () => {
    setAnchor(startOfDay(today));
    setFocusedKey(dayKey(today));
  };

  // The roving tab stop: the focused cell, else the selected one, else today if
  // it is in range, else the first day. Exactly one cell is ever tabbable.
  const tabbableKey =
    days.find((d) => d.key === focusedKey)?.key ??
    (selected ? days.find((d) => sameDay(d.date, selected))?.key : undefined) ??
    days.find((d) => d.isToday)?.key ??
    days[0]?.key;

  const moveFocus = (from: CalendarDay, delta: number) => {
    const index = days.indexOf(from);
    const next = days[index + delta];
    if (!next) {
      // Off the end of the range: page, and let the new range seat its own
      // default tab stop rather than guessing which cell should carry it.
      page(delta > 0 ? 1 : -1);
      return;
    }
    setFocusedKey(next.key);
    // Focus follows the roving tab stop, so the browser's focus and the grid's
    // idea of the current cell cannot disagree.
    requestAnimationFrame(() => {
      gridRef.current?.querySelector<HTMLElement>(`[data-day="${next.key}"]`)?.focus();
    });
  };

  const onGridKeyDown = (event: KeyboardEvent, day: CalendarDay) => {
    const week = mode === 'month' ? 7 : 1;
    const moves: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: week,
      ArrowUp: -week,
    };
    const delta = moves[event.key];
    if (delta !== undefined) {
      event.preventDefault();
      moveFocus(day, delta);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const index = days.indexOf(day);
      const rowStart = mode === 'month' ? index - (index % 7) : 0;
      const target = event.key === 'Home' ? rowStart : rowStart + (mode === 'month' ? 6 : days.length - 1);
      const next = days[target];
      if (next) {
        setFocusedKey(next.key);
        requestAnimationFrame(() => {
          gridRef.current?.querySelector<HTMLElement>(`[data-day="${next.key}"]`)?.focus();
        });
      }
    } else if (event.key === 'PageDown' || event.key === 'PageUp') {
      event.preventDefault();
      page(event.key === 'PageDown' ? 1 : -1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelectDay?.(day.date);
    }
  };

  const renderEvent = (event: CalendarEvent, compact: boolean) => {
    const label = event.allDay ? event.title : `${showTime(event.start)} ${event.title}`;
    const chip = (
      <span className={styles.chipBody} title={label}>
        {!event.allDay && <span className={styles.chipTime}>{showTime(event.start)}</span>}
        <span className={styles.chipTitle}>{event.title}</span>
      </span>
    );
    return onSelectEvent ? (
      <button
        key={event.id}
        type="button"
        className={cx(styles.chip, compact && styles.chipCompact)}
        data-tone={event.tone ?? 'accent'}
        onClick={(e) => {
          // A chip sits inside its day cell; a press on it is a press on the
          // event, not on the day underneath.
          e.stopPropagation();
          onSelectEvent(event);
        }}
      >
        {chip}
      </button>
    ) : (
      <span key={event.id} className={cx(styles.chip, compact && styles.chipCompact)} data-tone={event.tone ?? 'accent'}>
        {chip}
      </span>
    );
  };

  const renderDayCell = (day: CalendarDay) => {
    const dayEvents = buckets.get(day.key) ?? [];
    const { shown, hidden } = mode === 'month' ? splitOverflow(dayEvents) : { shown: dayEvents, hidden: 0 };
    const isSelected = selected ? sameDay(day.date, selected) : false;

    return (
      <div
        key={day.key}
        role="gridcell"
        data-day={day.key}
        // Only the roving tab stop is reachable by Tab; the rest are reached
        // with the arrows.
        tabIndex={day.key === tabbableKey ? 0 : -1}
        // The number alone would be announced as a bare digit.
        aria-label={dateFmt.format(day.date)}
        aria-selected={onSelectDay ? isSelected : undefined}
        aria-current={day.isToday ? 'date' : undefined}
        className={styles.cell}
        data-outside={!day.inMonth || undefined}
        data-today={day.isToday || undefined}
        data-selected={isSelected || undefined}
        data-weekend={day.isWeekend || undefined}
        data-pressable={onSelectDay ? '' : undefined}
        onClick={onSelectDay ? () => onSelectDay(day.date) : undefined}
        onFocus={() => setFocusedKey(day.key)}
        onKeyDown={(event) => onGridKeyDown(event, day)}
      >
        <span className={styles.dayNumber}>{day.date.getDate()}</span>
        <div className={styles.events}>
          {shown.map((event) => renderEvent(event, true))}
          {hidden > 0 && <span className={styles.overflow}>{t(kitMessages.calendarMore, { n: hidden })}</span>}
        </div>
      </div>
    );
  };

  const weekdays = weekdayOrder(weekStartsOn).map((weekday) => {
    // Any week works for naming the days; 4 Jan 2026 is a Sunday, so offsetting
    // from it gives each weekday's own name in the active locale.
    const sample = new Date(2026, 0, 4 + weekday);
    return { weekday, label: weekdayFmt.format(sample) };
  });

  if (skeleton) {
    return (
      <div className={cx(styles.root, className)} {...rest}>
        <div className={styles.header}>
          <Skeleton width="10rem" height="1.5rem" />
          <Skeleton width="12rem" height="2rem" radius="var(--glacier-radius-lg)" />
        </div>
        <div className={styles.weekdays} aria-hidden="true">
          {weekdays.map((w) => (
            <span key={w.weekday} className={styles.weekday}>
              {w.label}
            </span>
          ))}
        </div>
        {/* The exact six-by-seven geometry, so nothing reflows when the real
            events land. */}
        <div className={styles.grid} aria-hidden="true">
          {Array.from({ length: 42 }, (_, i) => (
            <div key={i} className={styles.cell}>
              <Skeleton width="1.25rem" height="0.875rem" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isAgenda = mode === 'agenda';

  return (
    <div className={cx(styles.root, className)} data-mode={mode} {...rest}>
      <div className={styles.header}>
        <div className={styles.nav}>
          <IconButton aria-label={t(kitMessages.calendarPrevious)} size={Size.Small} onClick={() => page(-1)}>
            <Chevron back />
          </IconButton>
          <Button variant={Variant.Ghost} size={Size.Small} onClick={goToday}>
            {t(kitMessages.calendarToday)}
          </Button>
          <IconButton aria-label={t(kitMessages.calendarNext)} size={Size.Small} onClick={() => page(1)}>
            <Chevron />
          </IconButton>
        </div>
        {/* A heading, so the range is a landmark a screen reader can jump to
            rather than loose text above a grid. */}
        <h3 className={styles.title}>{title}</h3>
        <SegmentedControl
          size={Size.Small}
          aria-label={t(kitMessages.calendarViewLabel)}
          value={mode}
          onValueChange={(next) => setMode(next as CalendarViewMode)}
          options={[
            { value: 'month', label: t(kitMessages.calendarMonth) },
            { value: 'week', label: t(kitMessages.calendarWeek) },
            { value: 'agenda', label: t(kitMessages.calendarAgenda) },
          ]}
        />
      </div>

      {isAgenda ? (
        <div className={styles.agenda}>
          {days.every((day) => !buckets.get(day.key)?.length) ? (
            <div className={styles.empty}>
              <Text tone={TextTone.Subtle} size={Size.Small}>
                {emptyLabel ?? t(kitMessages.calendarEmpty)}
              </Text>
            </div>
          ) : (
            days
              .filter((day) => buckets.get(day.key)?.length)
              .map((day) => (
                <div key={day.key} className={styles.agendaDay} data-today={day.isToday || undefined}>
                  <div className={styles.agendaDate}>
                    <Text size={Size.Small} tone={day.isToday ? TextTone.Default : TextTone.Muted}>
                      {new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short' }).format(
                        day.date,
                      )}
                    </Text>
                  </div>
                  <div className={styles.agendaEvents}>
                    {(buckets.get(day.key) ?? []).map((event) => renderEvent(event, false))}
                  </div>
                </div>
              ))
          )}
        </div>
      ) : (
        <>
          <div className={styles.weekdays} aria-hidden="true">
            {weekdays.map((w) => (
              <span key={w.weekday} className={styles.weekday}>
                {w.label}
              </span>
            ))}
          </div>
          <div
            ref={gridRef}
            role="grid"
            aria-label={title}
            className={styles.grid}
            data-rows={mode === 'month' ? 6 : 1}
          >
            {mode === 'month'
              ? // Rows are weeks, so the grid can be navigated on two axes.
                Array.from({ length: 6 }, (_, row) => (
                  <div key={row} role="row" className={styles.row}>
                    {days.slice(row * 7, row * 7 + 7).map(renderDayCell)}
                  </div>
                ))
              : (
                <div role="row" className={styles.row}>
                  {days.map(renderDayCell)}
                </div>
              )}
          </div>
        </>
      )}
    </div>
  );
}
