/**
 * @glacier/native - CalendarView.
 *
 * The React Native binding of @glacier/react's CalendarView: a scheduler
 * surface showing events over a month grid, a week, or an agenda. Every date
 * decision - which days a range covers, which day an event belongs to, where
 * paging lands - comes from @glacier/logic, so this calendar builds the same
 * grid from the same inputs as the web one. Paint and geometry are read from
 * the calendar-view spec through the shared resolvers.
 *
 * Web-parity notes:
 * - The month grid is drawn as six rows of seven, matching the web exactly, so
 *   paging never changes the surface's height.
 * - Roving arrow-key focus is a pointer/keyboard affordance with no touch
 *   equivalent; on device a day is selected by pressing it. The grid's shape,
 *   selection, today marking, and overflow all match.
 * - Event chips carry the same tone tints, resolved from the same tokens.
 * - Intl.DateTimeFormat is used for the weekday, month, and time names, so the
 *   calendar speaks the device locale rather than a bundled English list.
 */
import { useMemo, type ReactNode } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { calendarViewSpec } from '@glacier/spec';
import {
  bucketEvents,
  buildAgenda,
  buildMonthGrid,
  buildWeek,
  sameDay,
  splitOverflow,
  startOfDay,
  stepCalendar,
  useControlled,
  weekdayOrder,
  type CalendarDay,
  type CalendarEvent,
  type CalendarTone,
  type CalendarViewMode,
  type WeekStart,
} from '@glacier/logic';
import { t } from '../tokens.ts';
import { dimensionsFor } from '../resolve.ts';
import { Text, type TextToneName } from '../atoms/display/Text.tsx';
import { Button } from '../atoms/inputs/Button.tsx';
import { IconButton } from '../atoms/inputs/IconButton.tsx';
import { SegmentedControl } from './SegmentedControl.tsx';
import { Skeleton } from '../atoms/feedback/Skeleton.tsx';
import { Svg, Path } from 'react-native-svg';

export type { CalendarEvent, CalendarViewMode, WeekStart } from '@glacier/logic';

export interface CalendarViewProps {
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
  onSelectDay?: (date: Date) => void;
  onSelectEvent?: (event: CalendarEvent) => void;
  /** Which day to mark as today; injectable so a test is not clock-dependent. */
  today?: Date;
  agendaDays?: number;
  formatTime?: (date: Date) => string;
  emptyLabel?: ReactNode;
  skeleton?: boolean;
  /** Web-only escape hatch; accepted for parity and ignored here. */
  className?: string;
}

const BOX = dimensionsFor(calendarViewSpec);
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);

/** The soft fill and text token each event tone paints with, mirroring the web. */
/**
 * The fixed height of a month row, and of the single week row.
 *
 * Fixed rather than a floor, mirroring the web. A month grid whose height
 * tracks its busiest day changes size as you page, so everything below it
 * moves. `splitOverflow` caps a cell at MONTH_CELL_LIMIT lines and chips never
 * wrap, so the tallest a cell can be is knowable: padding, the date, a gap,
 * then three slots. These are the px equivalents of the web's derived value.
 */
const MONTH_ROW_HEIGHT = 109;
const WEEK_ROW_HEIGHT = 192;

const TONE_TOKENS: Record<CalendarTone, { bg: string; text: TextToneName }> = {
  accent: { bg: 'accent-soft', text: 'accent' },
  success: { bg: 'success-soft', text: 'success' },
  warning: { bg: 'warning-soft', text: 'warning' },
  danger: { bg: 'danger-soft', text: 'danger' },
  // Text has no `info` tone, and none is missing: info and accent resolve to
  // the same colour in this kit, which is what the web chip paints too.
  info: { bg: 'info-soft', text: 'accent' },
  neutral: { bg: 'surface-hover', text: 'muted' },
};

/** The labels the web kit routes through kitMessages; mirrored here. */
const LABELS = {
  previous: 'Previous period',
  next: 'Next period',
  today: 'Today',
  view: 'Calendar view',
  month: 'Month',
  week: 'Week',
  agenda: 'Agenda',
  empty: 'Nothing scheduled',
};

const Chevron = ({ back }: { back?: boolean }) => (
  <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
    <Path
      d={back ? 'M9 2L4 7l5 5' : 'M5 2l5 5-5 5'}
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * The Glacier CalendarView, rendered with React Native primitives. See the file
 * header for the parity contract.
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
}: CalendarViewProps) {
  // Resolved once per render so every comparison in this pass agrees.
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

  const days = useMemo(() => {
    if (mode === 'month') return buildMonthGrid(anchor, { weekStartsOn, today }).flat();
    if (mode === 'week') return buildWeek(anchor, { weekStartsOn, today });
    return buildAgenda(anchor, agendaDays, { today });
  }, [mode, anchor, weekStartsOn, agendaDays, today]);

  const buckets = useMemo(() => bucketEvents(events, days), [events, days]);

  const weekdayFmt = useMemo(() => new Intl.DateTimeFormat(undefined, { weekday: 'short' }), []);
  const timeFmt = useMemo(() => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }), []);
  const showTime = formatTime ?? ((d: Date) => timeFmt.format(d));

  const title = useMemo(() => {
    if (mode === 'month') return new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(anchor);
    const first = days[0]?.date;
    const last = days[days.length - 1]?.date;
    if (!first || !last) return '';
    const sameMonth = first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear();
    const left = new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: sameMonth ? undefined : 'numeric',
    }).format(first);
    const right = new Intl.DateTimeFormat(undefined, {
      month: sameMonth ? undefined : 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(last);
    return `${left} – ${right}`;
  }, [mode, anchor, days]);

  const radius = t(bare(BOX.radius) ?? 'radius-lg');
  const gap = t(bare(BOX.gap) ?? 'space-1');
  const cellPadding = t(bare(BOX.cellPadding) ?? 'space-2');
  const border = t(bare(BOX.border) ?? 'hairline');

  const weekdays = weekdayOrder(weekStartsOn).map((weekday) => ({
    weekday,
    // Any week works for naming the days; 4 Jan 2026 is a Sunday.
    label: weekdayFmt.format(new Date(2026, 0, 4 + weekday)),
  }));

  const page = (delta: number) => setAnchor(stepCalendar(anchor, mode, delta));

  const renderChip = (event: CalendarEvent, compact: boolean) => {
    const tone = TONE_TOKENS[event.tone ?? 'accent'] ?? TONE_TOKENS.accent;
    // The web sets `font-size` once on the chip and both spans inherit it, so
    // the time and the title are always the same size. Sizing them separately
    // here is what made the agenda row read as misaligned: a `sm` title next to
    // an `xs` time have different cap heights and no shared baseline.
    const textSize = compact ? 'xs' : 'sm';
    // flexShrink is explicit throughout this file: React Native defaults it to
    // 0, where CSS gives it 1, so anything not told to shrink pushes its
    // container wider than the pane instead of truncating inside it.
    const body = (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          columnGap: t('space-1'),
          flexShrink: 1,
          minWidth: 0,
        }}
      >
        {!event.allDay && (
          // `Text` takes no style, so the web's `.chipTime { flex: none;
          // opacity: 0.75 }` has to live on a wrapper.
          <View style={{ flexShrink: 0, opacity: 0.75 }}>
            <Text size={textSize} tone={tone.text} numberOfLines={1}>
              {showTime(event.start)}
            </Text>
          </View>
        )}
        <View style={{ flexShrink: 1, minWidth: 0 }}>
          <Text size={textSize} tone={tone.text} numberOfLines={1}>
            {event.title}
          </Text>
        </View>
      </View>
    );
    const style = {
      flexShrink: 1,
      paddingVertical: compact ? 1 : t('space-1'),
      paddingHorizontal: compact ? t('space-1') : t('space-2'),
      borderRadius: t('radius-sm'),
      backgroundColor: t(tone.bg),
      minWidth: 0,
      // Mirrors the web chip. Both are no-ops on a touch device and only take
      // effect where there is a cursor to shape - react-native-web, macOS,
      // Windows - which is exactly where the caret was showing up.
      cursor: 'pointer' as const,
      userSelect: 'none' as const,
    };
    return onSelectEvent ? (
      <Pressable key={event.id} accessibilityRole="button" onPress={() => onSelectEvent(event)} style={style}>
        {body}
      </Pressable>
    ) : (
      <View key={event.id} style={style}>
        {body}
      </View>
    );
  };

  const renderCell = (day: CalendarDay) => {
    const dayEvents = buckets.get(day.key) ?? [];
    const { shown, hidden } = mode === 'month' ? splitOverflow(dayEvents) : { shown: dayEvents, hidden: 0 };
    const isSelected = selected ? sameDay(day.date, selected) : false;

    const inner = (
      <>
        {/* Today marks only its number; selection tints the whole cell. That is
            what keeps "the date it is" and "the date you picked" distinct. */}
        <View
          style={{
            alignSelf: 'flex-start',
            minWidth: 22,
            paddingVertical: 1,
            paddingHorizontal: t('space-1'),
            borderRadius: t('radius-full'),
            backgroundColor: day.isToday ? t('accent-solid') : 'transparent',
          }}
        >
          <Text
            size="xs"
            align="center"
            tone={day.isToday ? undefined : day.inMonth ? undefined : 'subtle'}
            weight={day.isToday ? 'semibold' : undefined}
          >
            {String(day.date.getDate())}
          </Text>
        </View>
        <View style={{ rowGap: 2, minWidth: 0 }}>
          {shown.map((event) => renderChip(event, true))}
          {hidden > 0 && (
            <Text size="xs" tone="subtle">
              {`+${hidden} more`}
            </Text>
          )}
        </View>
      </>
    );

    const style = {
      flex: 1,
      minWidth: 0,
      rowGap: gap,
      padding: cellPadding,
      borderWidth: border,
      borderStyle: 'solid' as const,
      borderColor: isSelected ? t('accent-border') : t('border'),
      borderRadius: radius,
      backgroundColor: isSelected
        ? t('accent-soft')
        : day.isWeekend
          ? t('surface-raised')
          : t('surface'),
      overflow: 'hidden' as const,
    };

    return onSelectDay ? (
      <Pressable
        key={day.key}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        onPress={() => onSelectDay(day.date)}
        style={style}
      >
        {inner}
      </Pressable>
    ) : (
      <View key={day.key} style={style}>
        {inner}
      </View>
    );
  };

  if (skeleton) {
    return (
      <View style={{ width: '100%', rowGap: t('space-2'), alignSelf: 'stretch' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: t('space-3') }}>
          <Skeleton width={160} height={24} />
          <Skeleton width={192} height={32} radius={t('radius-lg')} />
        </View>
        {/* The exact six-by-seven geometry, so nothing reflows when the real
            events land. */}
        {Array.from({ length: 6 }, (_, row) => (
          <View key={row} style={{ flexDirection: 'row', columnGap: gap, height: MONTH_ROW_HEIGHT }}>
            {Array.from({ length: 7 }, (_, col) => (
              <View key={col} style={{ flex: 1, padding: cellPadding, borderRadius: radius }}>
                <Skeleton width={20} height={14} />
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  }

  const rows = mode === 'month' ? 6 : 1;

  return (
    // width AND alignSelf: a View is width:auto by default, so inside a
    // non-flex parent alignSelf does nothing and the root shrink-to-fits its
    // widest row - which is how the header ran off the pane.
    <View style={{ width: '100%', rowGap: t('space-2'), alignSelf: 'stretch', overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: t('space-3'), flexWrap: 'wrap' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: t('space-1') }}>
          <IconButton aria-label={LABELS.previous} size="sm" onPress={() => page(-1)}>
            <Chevron back />
          </IconButton>
          <Button variant="ghost" size="sm" onPress={() => setAnchor(startOfDay(today))}>
            {LABELS.today}
          </Button>
          <IconButton aria-label={LABELS.next} size="sm" onPress={() => page(1)}>
            <Chevron />
          </IconButton>
        </View>
        <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 }}>
          <Text size="md" weight="semibold" numberOfLines={1}>
            {title}
          </Text>
        </View>
        <SegmentedControl
          size="sm"
          aria-label={LABELS.view}
          value={mode}
          onValueChange={(next: string) => setMode(next as CalendarViewMode)}
          options={[
            { value: 'month', label: LABELS.month },
            { value: 'week', label: LABELS.week },
            { value: 'agenda', label: LABELS.agenda },
          ]}
        />
      </View>

      {mode === 'agenda' ? (
        days.every((day) => !buckets.get(day.key)?.length) ? (
          <View style={{ paddingVertical: t('space-8'), alignItems: 'center' }}>
            <Text tone="subtle" size="sm">
              {emptyLabel ?? LABELS.empty}
            </Text>
          </View>
        ) : (
          <ScrollView>
            {days
              .filter((day) => buckets.get(day.key)?.length)
              .map((day) => (
                <View
                  key={day.key}
                  style={{
                    flexDirection: 'row',
                    columnGap: t('space-3'),
                    paddingVertical: t('space-2'),
                    borderTopWidth: border,
                    borderTopColor: t('border'),
                    borderStyle: 'solid',
                  }}
                >
                  {/* A fixed date column, so titles line up down the list. */}
                  <View style={{ width: 112 }}>
                    <Text size="sm" tone={day.isToday ? undefined : 'muted'}>
                      {new Intl.DateTimeFormat(undefined, {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      }).format(day.date)}
                    </Text>
                  </View>
                  <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, rowGap: t('space-1'), minWidth: 0 }}>
                    {(buckets.get(day.key) ?? []).map((event) => renderChip(event, false))}
                  </View>
                </View>
              ))}
          </ScrollView>
        )
      ) : (
        <>
          <View style={{ flexDirection: 'row', columnGap: gap }}>
            {weekdays.map((w) => (
              <View key={w.weekday} style={{ flex: 1, paddingVertical: t('space-1') }}>
                <Text size="xs" tone="subtle" align="center">
                  {w.label}
                </Text>
              </View>
            ))}
          </View>
          <View style={{ rowGap: gap }}>
            {Array.from({ length: rows }, (_, row) => (
              <View
                key={row}
                style={{ flexDirection: 'row', columnGap: gap, height: mode === 'month' ? MONTH_ROW_HEIGHT : WEEK_ROW_HEIGHT }}
              >
                {(mode === 'month' ? days.slice(row * 7, row * 7 + 7) : days).map(renderCell)}
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}
