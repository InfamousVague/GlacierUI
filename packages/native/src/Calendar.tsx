/**
 * @glacier/native — Calendar.
 *
 * The React Native binding of @glacier/react's Calendar: an inline month grid
 * for picking a single date or a from/to range. The web kit delegates its grid
 * math, keyboard model, and ARIA to react-day-picker (a DOM-only library that
 * cannot run here); this binding reimplements the month grid from scratch with
 * View/Text/Pressable, doing every date computation with date-fns (pure JS) and
 * localizing month/weekday names through date-fns/locale. Paint (accent-solid
 * selection disc, accent-soft range band, accent-text today) and geometry (the
 * space-8 day cell, control-radius disc, card padding/border/radius) are read
 * from the calendar spec through the shared resolvers plus the DatePicker
 * day-cell tokens, so the resting grid is visually identical to the web kit and
 * cannot drift from it. Selection is controlled/uncontrolled through the shared
 * useControlled hook, exactly like the web.
 *
 * Parity approximations (web/device follow-ups, documented):
 * - No react-day-picker means no roving-tabindex keyboard model (arrows,
 *   PageUp/PageDown, Home/End) and no live-region caption announcement; taps
 *   select and the month buttons navigate. Grid ARIA is approximated with
 *   accessibilityRole/accessibilityState rather than a true role="grid".
 * - The web reads its kit locale from LocaleProvider; there is no provider on
 *   native, so the app passes a date-fns `locale` (default enUS), overridable
 *   per instance with `dateFnsLocale` exactly like the web.
 * - Range-band corner rounding is LTR-only (the web's logical inline-start/end
 *   flips under RTL). Day-paint transitions, the reduced-motion branch, and
 *   hover washes are resting-state only — the pressed state stands in for hover.
 * - `className` is a DOM concept with no native owner and is accepted-but-noop.
 */
import { useState } from 'react';
import { View, Text, Pressable, type ViewProps } from 'react-native';
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isBefore,
  isAfter,
  format,
} from 'date-fns';
import { enUS, type Locale } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from '@glacier/icons';
import { calendarModes, calendarSpec } from '@glacier/spec';
import { useControlled, paintFor, dimensionsFor } from '@glacier/commons';
import { t } from './tokens.ts';
import { Skeleton } from './Skeleton.tsx';

// Derived from the spec so the mode union cannot drift from the web kit.
export type CalendarMode = (typeof calendarModes)[number];

/** A possibly half-open date range, as reported while a range is being picked. */
export interface CalendarRange {
  from?: Date;
  to?: Date;
}

export interface CalendarProps extends Omit<ViewProps, 'children'> {
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
  /** Overrides the app locale for month and weekday names. */
  dateFnsLocale?: Locale;
  /**
   * The date-fns locale that renders month/weekday names. The web derives this
   * from LocaleProvider; there is no provider on native, so the app passes it
   * here (defaults to enUS). `dateFnsLocale` overrides it per instance.
   */
  locale?: Locale;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Drops the card chrome, for hosts that already frame the grid (DatePicker's panel). */
  bare?: boolean;
  'aria-label'?: string;
  /** Web-only escape hatch; accepted for parity and ignored on native. */
  className?: string;
}

// Size-independent metrics read once from the spec: the radius-lg card radius,
// space-4 padding, hairline border, space-8 day cell, control-radius day disc,
// and the space-2 caption gap.
const DIMS = dimensionsFor(calendarSpec);
const DAY_CELL = t(DIMS.dayCell ?? 'space-8');
const DAY_RADIUS = t(DIMS.dayRadius ?? 'control-radius');

// The base text paint (`{ text: $text }`) lives on the spec's top-level `paint`;
// strip the leading `$` exactly as the shared resolvers do so it cannot drift.
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);
const BASE = (calendarSpec.paint ?? {}) as { text?: string };
const BASE_TEXT = t(bare(BASE.text) ?? 'text');

// State paints read from the spec's `states` group so the tokens stay in sync
// with DatePicker.module.css.
const SELECTED = paintFor(calendarSpec, 'states', 'selected'); //     { background: accent-solid, text: accent-contrast }
const RANGE_MIDDLE = paintFor(calendarSpec, 'states', 'range-middle'); // { background: accent-soft, text: accent-text }
const TODAY = paintFor(calendarSpec, 'states', 'today'); //           { text: accent-text }
const HOVER = paintFor(calendarSpec, 'states', 'hover'); //           { background: hover }

const SELECTED_BG = t(SELECTED.background ?? 'accent-solid');
const SELECTED_TEXT = t(SELECTED.text ?? 'accent-contrast');
// The `.daySelected .dayButton:hover` accent-solid-hover (in the spec token list,
// not a state paint); the pressed disc uses it.
const SELECTED_HOVER = t('accent-solid-hover');
const RANGE_BG = t(RANGE_MIDDLE.background ?? 'accent-soft');
const RANGE_TEXT = t(RANGE_MIDDLE.text ?? 'accent-text');
const TODAY_TEXT = t(TODAY.text ?? 'accent-text');
const HOVER_BG = t(HOVER.background ?? 'hover');

// Untokenized in both kits: the DatePicker.module.css nav/weekday/day tones.
const TEXT_SUBTLE = t('text-subtle');
const TEXT_MUTED = t('text-muted');
const TEXT_DISABLED = t('text-disabled');
const FONT_SANS = t('font-sans');

// Chunk a flat day list into calendar weeks of seven.
function toWeeks(days: Date[]): Date[][] {
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

/**
 * The Glacier Calendar, rendered with React Native primitives. See the file
 * header for the reimplementation notes and parity contract; the resting grid is
 * visually matched to @glacier/react's Calendar.
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
  locale,
  skeleton = false,
  bare: bareChrome = false,
  className: _className,
  'aria-label': ariaLabel,
  style,
  ...rest
}: CalendarProps) {
  const activeLocale = dateFnsLocale ?? locale ?? enUS;

  const [single, setSingle] = useControlled<Date | undefined>({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const [range, setRange] = useControlled<CalendarRange>({
    value: rangeValue,
    defaultValue: defaultRangeValue ?? {},
    onChange: onRangeChange,
  });

  // The visible month is local state seeded from the selected value (the web's
  // uncontrolled defaultMonth), so navigation does not lift into the parent.
  const [cursor, setCursor] = useState<Date>(() =>
    startOfMonth((mode === 'range' ? range.from : single) ?? new Date()),
  );

  if (skeleton) {
    // Same geometry the web Skeleton renders: 7 day columns plus the card
    // padding, and a caption row + weekday row + up to 6 week rows.
    const pad = t(DIMS.padding ?? 'space-4');
    // The native Skeleton owns its own geometry and takes no style passthrough
    // (unlike the web, which forwards className); the width/height carry the grid.
    return (
      <Skeleton
        width={`calc(${DAY_CELL} * 7 + ${pad} * 2)`}
        height={`calc(${DAY_CELL} * 8 + ${pad} * 2)`}
        radius={t(DIMS.radius ?? 'radius-lg')}
      />
    );
  }

  const today = startOfDay(new Date());
  const monthStart = startOfMonth(cursor);
  const gridStart = startOfWeek(monthStart, { locale: activeLocale });
  const gridEnd = endOfWeek(endOfMonth(cursor), { locale: activeLocale });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const weeks = toWeeks(days);
  // Week-start-aware weekday names: the localized short form of the first row.
  const weekdayNames = days.slice(0, 7).map((d) => format(d, 'EEEEEE', { locale: activeLocale }));

  // Navigation stops at the min/max month (the web's startMonth/endMonth).
  const prevDisabled = disabled || (min ? !isAfter(monthStart, startOfMonth(min)) : false);
  const nextDisabled = disabled || (max ? !isBefore(monthStart, startOfMonth(max)) : false);

  function isDisabled(day: Date): boolean {
    if (disabled) return true;
    if (min && isBefore(startOfDay(day), startOfDay(min))) return true;
    if (max && isAfter(startOfDay(day), startOfDay(max))) return true;
    return disabledDates?.(day) ?? false;
  }

  function selectSingle(day: Date) {
    // Clicking the selected day unpicks it (the web reports undefined).
    setSingle(single && isSameDay(single, day) ? undefined : day);
  }

  function selectRange(day: Date) {
    const { from, to } = range;
    let next: CalendarRange;
    // Start a fresh range when there is none or the last one is complete;
    // otherwise close it, ordering the endpoints so `from` precedes `to`.
    if (!from || to) next = { from: day, to: undefined };
    else if (isBefore(day, from)) next = { from: day, to: from };
    else next = { from, to: day };
    setRange(next);
  }

  // Normalized range endpoints for painting the band (from may be picked after
  // to during selection; the visual band always runs low → high).
  let lo: Date | undefined;
  let hi: Date | undefined;
  if (range.from && range.to) {
    [lo, hi] = isAfter(range.from, range.to) ? [range.to, range.from] : [range.from, range.to];
  } else {
    lo = range.from;
  }

  function renderDay(day: Date) {
    const key = day.getTime();
    const dayDisabled = isDisabled(day);
    const outside = !isSameMonth(day, cursor);
    const isToday = isSameDay(day, today);

    // Selection: a solid accent disc for the single value / range endpoints, a
    // soft band for the days strictly between them.
    let solidDisc = false;
    let inBand = false; // sits on the accent-soft band
    let roundStart = false;
    let roundEnd = false;

    if (mode === 'single') {
      solidDisc = !!single && isSameDay(day, single);
    } else if (lo && hi && !isSameDay(lo, hi)) {
      const isStart = isSameDay(day, lo);
      const isEnd = isSameDay(day, hi);
      const between = isAfter(startOfDay(day), startOfDay(lo)) && isBefore(startOfDay(day), startOfDay(hi));
      solidDisc = isStart || isEnd;
      inBand = isStart || isEnd || between;
      roundStart = isStart;
      roundEnd = isEnd;
    } else if (lo) {
      // A single picked endpoint (or a one-day range) is just the solid disc.
      solidDisc = isSameDay(day, lo);
    }

    // Text tone, following DatePicker.module.css source order (later wins):
    // today < outside < range-middle < selected, all under disabled.
    let color = BASE_TEXT;
    let weight = 'font-weight-regular';
    if (dayDisabled) {
      color = TEXT_DISABLED;
    } else if (solidDisc) {
      color = SELECTED_TEXT;
      weight = 'font-weight-medium';
    } else if (inBand) {
      color = RANGE_TEXT;
    } else if (outside) {
      color = TEXT_SUBTLE;
    } else if (isToday) {
      color = TODAY_TEXT;
      weight = 'font-weight-semibold';
    }

    // The band's leading/trailing corners round only at the endpoints (LTR).
    const bandRadius = {
      borderTopLeftRadius: roundStart ? DAY_RADIUS : 0,
      borderBottomLeftRadius: roundStart ? DAY_RADIUS : 0,
      borderTopRightRadius: roundEnd ? DAY_RADIUS : 0,
      borderBottomRightRadius: roundEnd ? DAY_RADIUS : 0,
    };

    return (
      <Pressable
        key={key}
        accessibilityRole="button"
        aria-label={format(day, 'PPPP', { locale: activeLocale })}
        accessibilityState={{ disabled: dayDisabled, selected: solidDisc || inBand }}
        disabled={dayDisabled}
        onPress={() => (mode === 'range' ? selectRange(day) : selectSingle(day))}
        style={{
          width: DAY_CELL,
          height: DAY_CELL,
          alignItems: 'center',
          justifyContent: 'center',
          // The accent-soft band spans the whole cell so adjacent cells connect.
          backgroundColor: inBand ? RANGE_BG : 'transparent',
          ...bandRadius,
        }}
      >
        {({ pressed }) => (
          <View
            style={{
              width: DAY_CELL,
              height: DAY_CELL,
              borderRadius: DAY_RADIUS,
              alignItems: 'center',
              justifyContent: 'center',
              // The solid disc for selection/endpoints; the pressed state stands
              // in for the web hover wash on an otherwise plain day.
              backgroundColor: solidDisc
                ? pressed
                  ? SELECTED_HOVER
                  : SELECTED_BG
                : pressed && !dayDisabled && !inBand
                  ? HOVER_BG
                  : 'transparent',
            }}
          >
            <Text
              style={{
                color,
                fontSize: t('font-size-sm'),
                fontWeight: t(weight) as never,
                fontFamily: FONT_SANS,
              }}
            >
              {format(day, 'd', { locale: activeLocale })}
            </Text>
          </View>
        )}
      </Pressable>
    );
  }

  const navButtonStyle = {
    width: DAY_CELL,
    height: DAY_CELL,
    borderRadius: t('control-radius'),
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  return (
    <View
      {...rest}
      aria-label={ariaLabel}
      // `style` is applied LAST as an array so a caller's layout style augments
      // the root without wiping its paint, and `...rest` cannot clobber it.
      style={[
        {
          alignSelf: 'flex-start',
          opacity: disabled ? 0.5 : 1,
          ...(bareChrome
            ? null
            : {
                padding: t(DIMS.padding ?? 'space-4'),
                borderWidth: t(DIMS.border ?? 'hairline'),
                borderStyle: 'solid' as const,
                borderColor: t('border'),
                borderRadius: t(DIMS.radius ?? 'radius-lg'),
                backgroundColor: t('surface'),
              }),
        },
        style as never,
      ]}
    >
      {/* Header: prev button, centered month/year label, next button. */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: DAY_CELL,
          marginBottom: t(DIMS.captionGap ?? 'space-2'),
        }}
      >
        <Pressable
          accessibilityRole="button"
          aria-label="Previous month"
          accessibilityState={{ disabled: prevDisabled }}
          disabled={prevDisabled}
          onPress={() => setCursor((c) => subMonths(c, 1))}
          style={navButtonStyle}
        >
          <ChevronLeft size={18} color={prevDisabled ? TEXT_DISABLED : TEXT_MUTED} />
        </Pressable>
        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            color: BASE_TEXT,
            fontSize: t('font-size-sm'),
            fontWeight: t('font-weight-semibold') as never,
            fontFamily: FONT_SANS,
          }}
        >
          {format(cursor, 'LLLL yyyy', { locale: activeLocale })}
        </Text>
        <Pressable
          accessibilityRole="button"
          aria-label="Next month"
          accessibilityState={{ disabled: nextDisabled }}
          disabled={nextDisabled}
          onPress={() => setCursor((c) => addMonths(c, 1))}
          style={navButtonStyle}
        >
          <ChevronRight size={18} color={nextDisabled ? TEXT_DISABLED : TEXT_MUTED} />
        </Pressable>
      </View>

      {/* Weekday header: localized, week-start-aware short names. */}
      <View style={{ flexDirection: 'row' }}>
        {weekdayNames.map((name, i) => (
          <View
            key={i}
            style={{ width: DAY_CELL, alignItems: 'center', paddingVertical: t('space-1') }}
          >
            <Text
              style={{
                color: TEXT_SUBTLE,
                fontSize: t('font-size-xs'),
                fontWeight: t('font-weight-medium') as never,
                fontFamily: FONT_SANS,
              }}
            >
              {name}
            </Text>
          </View>
        ))}
      </View>

      {/* Day grid: the weeks of the visible month. */}
      {weeks.map((week, wi) => (
        <View key={wi} style={{ flexDirection: 'row' }}>
          {week.map(renderDay)}
        </View>
      ))}
    </View>
  );
}
