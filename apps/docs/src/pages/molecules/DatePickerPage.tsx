import { useState } from 'react';
import { Calendar, DatePicker, Field, Heading, Size, Stack, Text, TextTone } from '@glacier/react';
import { fr } from 'date-fns/locale';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

function ControlledRange() {
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({});
  const label = (d?: Date) => (d ? d.toLocaleDateString() : 'unset');
  return (
    <Stack gap={3}>
      <Calendar mode="range" aria-label="Stay dates" rangeValue={range} onRangeChange={setRange} />
      <Text size={Size.Small} tone={TextTone.Muted}>
        From: <code>{label(range.from)}</code> · To: <code>{label(range.to)}</code>
      </Text>
    </Stack>
  );
}

export function DatePickerPage() {
  const [due, setDue] = useState<Date | undefined>(undefined);

  return (
    <>
      <Heading level={1}>Date Picker</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        Two pieces for picking dates. <code>Calendar</code> is an inline month grid for a single
        date or a range; <code>DatePicker</code> wraps a single-date Calendar in an Input-metric
        trigger with an anchored panel. Grid math, keyboard navigation, and ARIA come from a
        proven date engine; every visible surface is painted with kit tokens.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>The trigger, anchored panel, and month grid with the spec measurements labelled.</Text>
      <ComponentBlueprint specId="date-picker" />
      <ComponentBlueprint specId="calendar" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Inline Calendar"
        description="The bare month grid. Arrows move the focused day, PageUp and PageDown change the month, Home and End jump within the week, and Enter selects."
        code={`import { Calendar } from '@glacier/react';

<Calendar
  aria-label="Pick a day"
  defaultValue={new Date()}
  onValueChange={(date) => console.log(date)}
/>`}
      >
        <Calendar aria-label="Pick a day" defaultValue={new Date()} />
      </Example>

      <Example
        title="Range selection"
        description="Range mode keeps both endpoints visible while the range is picked: the first click sets from, the second sets to, and the days between sit on a soft accent band. This is why the popover DatePicker stays single-date, ranges belong inline."
        code={`const [range, setRange] = useState({});

<Calendar
  mode="range"
  aria-label="Stay dates"
  rangeValue={range}
  onRangeChange={setRange}
/>`}
      >
        <ControlledRange />
      </Example>

      <Example
        title="DatePicker"
        description="An Input-metric trigger opens the calendar in an anchored glass panel. Picking a day commits the value, closes the panel, and restores focus; Escape or an outside press dismisses without changes."
        code={`import { DatePicker } from '@glacier/react';

const [due, setDue] = useState();

<DatePicker aria-label="Due date" value={due} onValueChange={setDue} />`}
      >
        <Stack gap={3}>
          <DatePicker aria-label="Due date" value={due} onValueChange={setDue} />
          <Text size={Size.Small} tone={TextTone.Muted}>
            Selected: <code>{due ? due.toLocaleDateString() : 'none'}</code>
          </Text>
        </Stack>
      </Example>

      <Example
        title="In a Field"
        description="Inside Field, the trigger inherits the label id, hint description, and invalid state like Input and Select. With name set, a hidden input submits the ISO yyyy-MM-dd value with native forms."
        code={`<Field label="Delivery date" hint="Weekends are not available.">
  <DatePicker name="delivery" fullWidth />
</Field>`}
      >
        <div style={{ width: '18rem' }}>
          <Field label="Delivery date" hint="Weekends are not available.">
            <DatePicker name="delivery" fullWidth />
          </Field>
        </div>
      </Example>

      <Example
        title="Bounds and disabled dates"
        description="min and max bound both selection and month navigation; disabledDates is a predicate that marks matching days unselectable, here every weekend."
        code={`<DatePicker
  aria-label="Appointment"
  min={new Date()}
  disabledDates={(date) => date.getDay() === 0 || date.getDay() === 6}
/>`}
      >
        <DatePicker
          aria-label="Appointment"
          min={new Date()}
          disabledDates={(date) => date.getDay() === 0 || date.getDay() === 6}
        />
      </Example>

      <Example
        title="Locale"
        description="Month and weekday names follow the kit locale automatically, and the trigger formats its value with Intl.DateTimeFormat. Pass dateFnsLocale to pin one instance to a specific locale."
        code={`import { fr } from 'date-fns/locale';

<Calendar aria-label="Choisir une date" dateFnsLocale={fr} />`}
      >
        <Calendar aria-label="Choisir une date" dateFnsLocale={fr} defaultValue={new Date()} />
      </Example>

      <Example
        title="Sizes, glass, and skeleton"
        description="The trigger shares the three control heights with Input and Select, offers the frosted glass material, and the skeletons preserve the loaded geometry."
        code={`<DatePicker size={Size.Small} aria-label="Small" />
<DatePicker size={Size.Medium} aria-label="Medium" />
<DatePicker size={Size.Large} aria-label="Large" glass />
<DatePicker skeleton />
<Calendar skeleton />`}
      >
        <Stack gap={3}>
          <DatePicker size={Size.Small} aria-label="Small" />
          <DatePicker size={Size.Medium} aria-label="Medium" />
          <DatePicker size={Size.Large} aria-label="Large" glass />
          <DatePicker skeleton />
          <Calendar skeleton />
        </Stack>
      </Example>

      <Heading level={2}>Props</Heading>
      <Heading level={3}>Calendar</Heading>
      <PropsTable
        props={[
          { name: 'mode', type: "'single' | 'range'", default: "'single'", description: 'Pick one date or a from/to range.' },
          { name: 'value', type: 'Date', description: 'Controlled selected date, in single mode.' },
          { name: 'defaultValue', type: 'Date', description: 'Uncontrolled initial date, in single mode.' },
          { name: 'onValueChange', type: '(date: Date | undefined) => void', description: 'Called with the next date, or undefined when the selected day is unpicked.' },
          { name: 'rangeValue', type: '{ from?: Date; to?: Date }', description: 'Controlled selected range, in range mode.' },
          { name: 'defaultRangeValue', type: '{ from?: Date; to?: Date }', description: 'Uncontrolled initial range, in range mode.' },
          { name: 'onRangeChange', type: '(range) => void', description: 'Called with the next range; from is set first, then to.' },
          { name: 'min', type: 'Date', description: 'Earliest selectable date; navigation stops at its month.' },
          { name: 'max', type: 'Date', description: 'Latest selectable date; navigation stops at its month.' },
          { name: 'disabledDates', type: '(date: Date) => boolean', description: 'Predicate marking matching dates disabled and unselectable.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables every day and the month navigation.' },
          { name: 'dateFnsLocale', type: 'Locale', description: 'date-fns locale override; defaults to the mapped kit locale.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: 'Renders a placeholder with the grid geometry.' },
          { name: 'bare', type: 'boolean', default: 'false', description: 'Drops the card chrome, for hosts that already frame the grid.' },
        ]}
      />
      <Heading level={3}>DatePicker</Heading>
      <PropsTable
        props={[
          { name: 'value', type: 'Date', description: 'Controlled selected date.' },
          { name: 'defaultValue', type: 'Date', description: 'Uncontrolled initial date.' },
          { name: 'onValueChange', type: '(date: Date | undefined) => void', description: 'Called with the next date.' },
          { name: 'placeholder', type: 'string', description: 'Hint while no date is selected; defaults to the localized prompt.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Control height, shared with Input and Select.' },
          { name: 'fullWidth', type: 'boolean', default: 'false', description: 'Stretches the trigger to its container width.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Blocks opening the panel.' },
          { name: 'glass', type: 'boolean', default: 'false', description: 'Frosted glass material on the trigger.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: 'Renders a placeholder with the control geometry.' },
          { name: 'min', type: 'Date', description: 'Earliest selectable date.' },
          { name: 'max', type: 'Date', description: 'Latest selectable date.' },
          { name: 'disabledDates', type: '(date: Date) => boolean', description: 'Predicate marking matching dates unselectable in the panel.' },
          { name: 'dateFnsLocale', type: 'Locale', description: 'date-fns locale override for the panel.' },
          { name: 'name', type: 'string', description: 'Adds a hidden input submitting the ISO yyyy-MM-dd value.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          The month grid is <code>role="grid"</code> labelled with the visible month; a roving tab
          index keeps exactly one day button in the tab order, and selected cells carry{' '}
          <code>aria-selected</code>.
        </li>
        <li>
          Arrows move the focused day by one day or week, PageUp and PageDown by a month (a year
          with Shift), Home and End to the edges of the week, and Enter or Space selects.
        </li>
        <li>
          The DatePicker trigger is a button with <code>aria-haspopup="dialog"</code> and{' '}
          <code>aria-expanded</code>; the portaled panel is a labelled <code>role="dialog"</code>{' '}
          that closes on Escape or an outside press and restores focus to the trigger.
        </li>
        <li>
          Inside a Field the trigger inherits the label, <code>aria-describedby</code>, and{' '}
          <code>aria-invalid</code>.
        </li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>
          Use DatePicker in forms where a single date is one field among several. Use an inline
          Calendar when the date is the point of the screen, or whenever a range is picked: a
          range needs visible month context across both endpoints while it is being chosen.
        </li>
        <li>
          Prefer <code>min</code>, <code>max</code>, and <code>disabledDates</code> over
          validating after the fact, so impossible dates cannot be picked at all.
        </li>
        <li>
          Let the kit locale drive month names and value formatting; reach for{' '}
          <code>dateFnsLocale</code> only when one instance must diverge from the page locale.
        </li>
      </ul>
    </>
  );
}
