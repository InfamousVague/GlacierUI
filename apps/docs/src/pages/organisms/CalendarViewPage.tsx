import { Heading, Size, Text, TextTone, useT, type CalendarEvent } from '@glacier/react';
import { removeEvent, upsertEvent } from '@glacier/logic';
import { useState } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

/**
 * A fixed "today" for every demo on this page.
 *
 * The calendar takes `today` as a prop precisely so a page like this is not
 * clock-dependent: pinning it means the screenshots, the visual-regression
 * pass, and anyone reading the docs all see the same month with the same
 * events in the same cells, rather than a demo that quietly empties out as the
 * weeks go by.
 */
const TODAY = new Date(2026, 6, 15); // Wed 15 July 2026

function useDemoEvents(): CalendarEvent[] {
  const t = useT();
  return [
    { id: 'standup', title: t(m.cvEvStandup), start: new Date(2026, 6, 13, 9, 15) },
    { id: 'review', title: t(m.cvEvReview), start: new Date(2026, 6, 15, 14, 0), tone: 'success' },
    // Deliberately not `info`: the kit's accent and info ramps share hue 228,
    // so their soft fills resolve to the same colour and two "different" tones
    // would look identical in the demo.
    { id: 'oneonone', title: t(m.cvEvOneOnOne), start: new Date(2026, 6, 15, 16, 30), tone: 'neutral' },
    { id: 'standup2', title: t(m.cvEvStandup), start: new Date(2026, 6, 15, 9, 15) },
    { id: 'offsite', title: t(m.cvEvOffsite), start: new Date(2026, 6, 20), end: new Date(2026, 6, 22), allDay: true },
    { id: 'deadline', title: t(m.cvEvDeadline), start: new Date(2026, 6, 24, 17, 0), tone: 'warning' },
    { id: 'release', title: t(m.cvEvRelease), start: new Date(2026, 6, 29, 11, 0), tone: 'danger' },
  ];
}

function CalendarDemo({ K, ...props }: { K: PlatformKit } & Record<string, unknown>) {
  const events = useDemoEvents();
  return <K.CalendarView events={events} today={TODAY} defaultDate={TODAY} {...props} />;
}

/**
 * The editing demo owns its event list, which is the whole point of the
 * contract: the calendar reports what the user did and re-renders from what it
 * is handed back. `upsertEvent` and `removeEvent` do that update.
 */
function EditableCalendarDemo({ K }: { K: PlatformKit }) {
  const seed = useDemoEvents();
  const [events, setEvents] = useState<CalendarEvent[]>(seed);

  return (
    <div style={{ width: '100%' }}>
      <K.CalendarView
        events={events}
        today={TODAY}
        defaultDate={TODAY}
        editable
        onEventCreate={(event: CalendarEvent) => setEvents((list) => upsertEvent(list, event))}
        onEventChange={(event: CalendarEvent) => setEvents((list) => upsertEvent(list, event))}
        onEventDelete={(id: string) => setEvents((list) => removeEvent(list, id))}
      />
    </div>
  );
}

/**
 * Selection is stateful, so it lives in its own wrapper the render callback
 * mounts once per pane — a callback cannot hold hooks.
 */
function SelectableCalendarDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const events = useDemoEvents();
  const [selected, setSelected] = useState<Date | undefined>(new Date(2026, 6, 20));

  return (
    // width:100% because this wrapper is a flex item in the example pane: left
    // to `auto` it sizes to its content, and the calendar inside asking for
    // 100% of it makes that circular — which resolves to max-content and spills
    // out of the pane.
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--glacier-space-3)', width: '100%' }}>
      <K.CalendarView
        events={events}
        today={TODAY}
        defaultDate={TODAY}
        selected={selected}
        onSelectDay={setSelected}
        onSelectEvent={() => {}}
      />
      {selected && (
        <Text tone={TextTone.Muted} size={Size.Small}>
          {t(m.cvSelectedDay, { day: selected.toLocaleDateString() })}
        </Text>
      )}
    </div>
  );
}

export function CalendarViewPage() {
  const t = useT();

  return (
    <>
      <Heading level={1}>{t(m.cvName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.cvLede)}
      </Text>
      <Text tone={TextTone.Muted}>{prose(t(m.cvVsDatePicker))}</Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.cvAnatomy)}</Text>
      <ComponentBlueprint specId="calendar-view" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.cvExBasicDesc)}
        component="CalendarView"
        platformLayout="stacked"
        render={(K) => <CalendarDemo K={K} />}
        code={`import { CalendarView } from '@glacier/react';

const events = [
  { id: 'review', title: 'Design review', start: new Date(2026, 6, 15, 14, 0), tone: 'success' },
  // A multi-day event appears on every day it spans.
  { id: 'offsite', title: 'Team offsite', start: new Date(2026, 6, 20), end: new Date(2026, 6, 22), allDay: true },
];

<CalendarView events={events} />`}
      />

      <Example
        title={t(m.cvExEditTitle)}
        description={t(m.cvExEditDesc)}
        component="CalendarView"
        platformLayout="stacked"
        render={(K) => <EditableCalendarDemo K={K} />}
        code={`const [events, setEvents] = useState(initial);

<CalendarView
  events={events}
  editable
  // Right-click (or long-press) a day or an event for the menu;
  // double-press empty day space to add; press an event to edit.
  onEventCreate={(event) => setEvents((list) => upsertEvent(list, event))}
  onEventChange={(event) => setEvents((list) => upsertEvent(list, event))}
  // Omit onEventDelete to hide every delete control.
  onEventDelete={(id) => setEvents((list) => removeEvent(list, id))}
/>`}
      />

      <Example
        title={t(m.cvExViewsTitle)}
        description={t(m.cvExViewsDesc)}
        component="CalendarView"
        platformLayout="stacked"
        render={(K) => <CalendarDemo K={K} defaultMode="agenda" />}
        code={`// Uncontrolled: the header's switch drives it.
<CalendarView events={events} defaultMode="agenda" />

// Or controlled, to keep the mode in your own state.
<CalendarView events={events} mode={mode} onModeChange={setMode} />`}
      />

      <Example
        title={t(m.cvExSelectTitle)}
        description={t(m.cvExSelectDesc)}
        component="CalendarView"
        platformLayout="stacked"
        render={(K) => <SelectableCalendarDemo K={K} />}
        code={`const [selected, setSelected] = useState<Date>();

<CalendarView
  events={events}
  selected={selected}
  onSelectDay={setSelected}
  // A press on a chip reports the event, not the day underneath it.
  onSelectEvent={(event) => open(event.id)}
/>`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'events', type: 'CalendarEvent[]', description: t(m.cvPropEvents) },
          { name: 'mode', type: "'month' | 'week' | 'agenda'", description: t(m.cvPropMode) },
          { name: 'defaultMode', type: "'month' | 'week' | 'agenda'", default: "'month'", description: t(m.cvPropMode) },
          { name: 'date', type: 'Date', description: t(m.cvPropDate) },
          { name: 'weekStartsOn', type: '0 | 1', default: '0', description: t(m.cvPropWeekStart) },
          { name: 'selected', type: 'Date', description: t(m.cvPropSelected) },
          { name: 'onSelectDay', type: '(date: Date) => void', description: t(m.cvPropOnSelectDay) },
          { name: 'onSelectEvent', type: '(event: CalendarEvent) => void', description: t(m.cvPropOnSelectEvent) },
          { name: 'today', type: 'Date', description: t(m.cvPropToday) },
          { name: 'agendaDays', type: 'number', default: '7', description: t(m.cvPropAgendaDays) },
          { name: 'editable', type: 'boolean', default: 'false', description: t(m.cvPropEditable) },
          { name: 'onEventCreate', type: '(event: CalendarEvent) => void', description: t(m.cvPropOnEventCreate) },
          { name: 'onEventChange', type: '(event: CalendarEvent) => void', description: t(m.cvPropOnEventChange) },
          { name: 'onEventDelete', type: '(id: string) => void', description: t(m.cvPropOnEventDelete) },
          { name: 'newEventId', type: '() => string', description: t(m.cvPropNewEventId) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.cvA11y1))}</li>
        <li>{prose(t(m.cvA11y2))}</li>
        <li>{prose(t(m.cvA11y3))}</li>
        <li>{prose(t(m.cvA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.cvUse1))}</li>
        <li>{prose(t(m.cvUse2))}</li>
        <li>{prose(t(m.cvUse3))}</li>
        <li>{prose(t(m.cvUse4))}</li>
      </ul>
    </>
  );
}
