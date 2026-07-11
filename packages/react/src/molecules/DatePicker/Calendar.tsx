import { DayPicker, type DateRange, type DayPickerLocale, type Matcher } from 'react-day-picker';
import { ar, de, enUS, es, fr, ja, pt, zhCN } from 'date-fns/locale';
import type { ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { useLocale } from '../../i18n/LocaleProvider.tsx';
import type { Locale } from '../../i18n/locale.ts';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import styles from './DatePicker.module.css';

export type CalendarMode = 'single' | 'range';

/** A possibly half-open date range, as reported while a range is being picked. */
export interface CalendarRange {
  from?: Date;
  to?: Date;
}

/** The kit locale mapped to the date-fns locale that renders its month and weekday names. */
const dateFnsLocales: Record<Locale, DayPickerLocale> = {
  en: enUS,
  es,
  fr,
  de,
  ja,
  pt,
  zh: zhCN,
  ar,
};

/** react-day-picker's UI element names, each bound to a kit-token class. */
const dayPickerClassNames = {
  root: styles.calendarRoot,
  months: styles.months,
  month: styles.month,
  nav: styles.nav,
  button_previous: styles.navButton,
  button_next: styles.navButton,
  chevron: styles.chevron,
  month_caption: styles.caption,
  caption_label: styles.captionLabel,
  month_grid: styles.monthGrid,
  weekdays: styles.weekdays,
  weekday: styles.weekday,
  weeks: styles.weeks,
  week: styles.week,
  day: styles.day,
  day_button: styles.dayButton,
  selected: styles.daySelected,
  range_start: styles.rangeStart,
  range_middle: styles.rangeMiddle,
  range_end: styles.rangeEnd,
  today: styles.dayToday,
  outside: styles.dayOutside,
  disabled: styles.dayDisabled,
  hidden: styles.dayHidden,
  focused: styles.dayFocused,
};

export interface CalendarProps extends Omit<ComponentProps<'div'>, 'defaultValue' | 'onSelect'> {
  /** Pick one date (default) or a from/to range. */
  mode?: CalendarMode;
  /** Controlled selected date, in single mode. */
  value?: Date;
  /** Uncontrolled initial date, in single mode. */
  defaultValue?: Date;
  /** Called with the next date, or undefined when the selected day is unpicked. */
  onValueChange?: (value: Date | undefined) => void;
  /** Controlled selected range, in range mode. */
  rangeValue?: CalendarRange;
  /** Uncontrolled initial range, in range mode. */
  defaultRangeValue?: CalendarRange;
  /** Called with the next range; from is set first, then to. */
  onRangeChange?: (range: CalendarRange) => void;
  /** Earliest selectable date; navigation stops at its month. */
  min?: Date;
  /** Latest selectable date; navigation stops at its month. */
  max?: Date;
  /** Marks matching dates disabled and unselectable. */
  disabledDates?: (date: Date) => boolean;
  /** Disables every day and the month navigation. */
  disabled?: boolean;
  /** Overrides the date-fns locale derived from the kit locale. */
  dateFnsLocale?: DayPickerLocale;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Drops the card chrome, for hosts that already frame the grid (DatePicker's panel). */
  bare?: boolean;
  'aria-label'?: string;
  className?: string;
}

/**
 * An inline month grid for picking a single date or a date range. All date
 * math, keyboard navigation (arrows, PageUp/PageDown, Home/End), and grid ARIA
 * come from react-day-picker; every visible surface is restyled with kit
 * tokens through its classNames prop. Month and weekday names follow the kit
 * locale, overridable per instance with dateFnsLocale.
 */
export function Calendar({
  mode = 'single',
  value,
  defaultValue,
  onValueChange,
  rangeValue,
  defaultRangeValue,
  onRangeChange,
  min,
  max,
  disabledDates,
  disabled = false,
  dateFnsLocale,
  skeleton = false,
  bare = false,
  className,
  'aria-label': ariaLabel,
  ...rest
}: CalendarProps) {
  const kitLocale = useLocale();
  const [single, setSingle] = useControlled<Date | undefined>(value, defaultValue);
  const [range, setRange] = useControlled<CalendarRange>(rangeValue, defaultRangeValue ?? {});

  // after the hooks so the real Calendar can replace the skeleton in place;
  // geometry mirrors the grid: 7 day columns plus the card padding, and a
  // caption row + weekday row + up to 6 week rows
  if (skeleton) {
    return (
      <Skeleton
        width="calc(var(--glacier-space-8) * 7 + var(--glacier-space-4) * 2)"
        height="calc(var(--glacier-space-8) * 8 + var(--glacier-space-4) * 2)"
        radius="var(--glacier-radius-lg)"
        className={className}
      />
    );
  }

  // min/max become disabled matchers (unselectable) and navigation bounds;
  // `true` disables every day when the whole control is disabled
  const disabledMatchers: Matcher[] = [];
  if (disabled) disabledMatchers.push(true);
  if (min) disabledMatchers.push({ before: min });
  if (max) disabledMatchers.push({ after: max });
  if (disabledDates) disabledMatchers.push(disabledDates);

  const shared = {
    classNames: dayPickerClassNames,
    locale: dateFnsLocale ?? dateFnsLocales[kitLocale],
    disabled: disabledMatchers.length > 0 ? disabledMatchers : undefined,
    disableNavigation: disabled || undefined,
    startMonth: min,
    endMonth: max,
    'aria-label': ariaLabel,
  };

  return (
    <div
      {...rest}
      className={cx(styles.calendar, !bare && styles.calendarCard, disabled && styles.calendarDisabled, className)}
    >
      {mode === 'range' ? (
        <DayPicker
          mode="range"
          selected={range.from || range.to ? (range as DateRange) : undefined}
          defaultMonth={range.from}
          onSelect={(next: DateRange | undefined) => {
            const nextRange: CalendarRange = next ?? {};
            setRange(nextRange);
            onRangeChange?.(nextRange);
          }}
          {...shared}
        />
      ) : (
        <DayPicker
          mode="single"
          selected={single}
          defaultMonth={single}
          onSelect={(next: Date | undefined) => {
            setSingle(next);
            onValueChange?.(next);
          }}
          {...shared}
        />
      )}
    </div>
  );
}
