import { useState } from 'react';
import { Calendar, DatePicker, Field, Heading, Size, Stack, Text, TextTone, useT } from '@glacier/react';
import { fr } from 'date-fns/locale';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { m } from '../../i18n.ts';

// Controlled range calendar, rendered by whichever kit K is (its own state per
// pane), since a render={(K)=>...} closure cannot hold hooks itself.
function ControlledRange({ K }: { K: PlatformKit }) {
  const t = useT();
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({});
  const label = (d?: Date) => (d ? d.toLocaleDateString() : 'unset');
  return (
    <Stack gap={3}>
      <K.Calendar mode="range" aria-label={t(m.dpAriaStayDates)} rangeValue={range} onRangeChange={setRange} />
      <Text size={Size.Small} tone={TextTone.Muted}>
        {t(m.dpFromLabel)} <code>{label(range.from)}</code> · {t(m.dpToLabel)} <code>{label(range.to)}</code>
      </Text>
    </Stack>
  );
}

// Controlled single-date picker, per-pane state.
function DueDatePicker({ K }: { K: PlatformKit }) {
  const t = useT();
  const [due, setDue] = useState<Date | undefined>(undefined);
  return (
    <Stack gap={3}>
      <K.DatePicker aria-label={t(m.dpAriaDueDate)} value={due} onValueChange={setDue} />
      <Text size={Size.Small} tone={TextTone.Muted}>
        {t(m.dpSelectedLabel)} <code>{due ? due.toLocaleDateString() : 'none'}</code>
      </Text>
    </Stack>
  );
}

export function DatePickerPage() {
  const t = useT();

  return (
    <>
      <Heading level={1}>{t(m.dpName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.dpLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.dpAnatomyIntro)}</Text>
      <ComponentBlueprint specId="date-picker" />
      <ComponentBlueprint specId="calendar" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.dpEx1Title)}
        description={t(m.dpEx1Desc)}
        component="Calendar"
        render={(K) => <K.Calendar aria-label={t(m.dpAriaPickDay)} defaultValue={new Date()} />}
        code={`import { Calendar } from '@glacier/react';

<Calendar
  aria-label="Pick a day"
  defaultValue={new Date()}
  onValueChange={(date) => console.log(date)}
/>`}
      />

      <Example
        title={t(m.dpEx2Title)}
        description={t(m.dpEx2Desc)}
        component="Calendar"
        render={(K) => <ControlledRange K={K} />}
        code={`const [range, setRange] = useState({});

<Calendar
  mode="range"
  aria-label="Stay dates"
  rangeValue={range}
  onRangeChange={setRange}
/>`}
      />

      <Example
        title={t(m.dpEx3Title)}
        description={t(m.dpEx3Desc)}
        component="DatePicker"
        render={(K) => <DueDatePicker K={K} />}
        code={`import { DatePicker } from '@glacier/react';

const [due, setDue] = useState();

<DatePicker aria-label="Due date" value={due} onValueChange={setDue} />`}
      />

      <Example
        title={t(m.dpEx4Title)}
        description={t(m.dpEx4Desc)}
        code={`<Field label="Delivery date" hint="Weekends are not available.">
  <DatePicker name="delivery" fullWidth />
</Field>`}
      >
        <div style={{ width: '18rem' }}>
          <Field label={t(m.dpFieldLabel)} hint={t(m.dpFieldHint)}>
            <DatePicker name="delivery" fullWidth />
          </Field>
        </div>
      </Example>

      <Example
        title={t(m.dpEx5Title)}
        description={t(m.dpEx5Desc)}
        component="DatePicker"
        render={(K) => (
          <K.DatePicker
            aria-label={t(m.dpAriaAppointment)}
            min={new Date()}
            disabledDates={(date) => date.getDay() === 0 || date.getDay() === 6}
          />
        )}
        code={`<DatePicker
  aria-label="Appointment"
  min={new Date()}
  disabledDates={(date) => date.getDay() === 0 || date.getDay() === 6}
/>`}
      />

      <Example
        title={t(m.dpEx6Title)}
        description={t(m.dpEx6Desc)}
        component="Calendar"
        render={(K) => (
          <K.Calendar aria-label={t(m.datepickerChoisirUneDate)} dateFnsLocale={fr} defaultValue={new Date()} />
        )}
        code={`import { fr } from 'date-fns/locale';

<Calendar aria-label="Choisir une date" dateFnsLocale={fr} />`}
      />

      <Example
        title={t(m.dpEx7Title)}
        description={t(m.dpEx7Desc)}
        component="DatePicker"
        render={(K) => (
          <Stack gap={3}>
            <K.DatePicker size={Size.Small} aria-label={t(m.datepickerSmall)} />
            <K.DatePicker size={Size.Medium} aria-label={t(m.datepickerMedium)} />
            <K.DatePicker size={Size.Large} aria-label={t(m.datepickerLarge)} glass />
            <K.DatePicker skeleton />
            <K.Calendar skeleton />
          </Stack>
        )}
        code={`<DatePicker size={Size.Small} aria-label="Small" />
<DatePicker size={Size.Medium} aria-label="Medium" />
<DatePicker size={Size.Large} aria-label="Large" glass />
<DatePicker skeleton />
<Calendar skeleton />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <Heading level={3}>{t(m.dpPropsCalendar)}</Heading>
      <PropsTable
        props={[
          { name: 'mode', type: "'single' | 'range'", default: "'single'", description: t(m.dpPropMode) },
          { name: 'value', type: 'Date', description: t(m.dpPropValue) },
          { name: 'defaultValue', type: 'Date', description: t(m.dpPropDefaultValue) },
          { name: 'onValueChange', type: '(date: Date | undefined) => void', description: t(m.dpPropOnValueChange) },
          { name: 'rangeValue', type: '{ from?: Date; to?: Date }', description: t(m.dpPropRangeValue) },
          { name: 'defaultRangeValue', type: '{ from?: Date; to?: Date }', description: t(m.dpPropDefaultRangeValue) },
          { name: 'onRangeChange', type: '(range) => void', description: t(m.dpPropOnRangeChange) },
          { name: 'min', type: 'Date', description: t(m.dpPropMin) },
          { name: 'max', type: 'Date', description: t(m.dpPropMax) },
          { name: 'disabledDates', type: '(date: Date) => boolean', description: t(m.dpPropDisabledDates) },
          { name: 'disabled', type: 'boolean', default: 'false', description: t(m.dpPropDisabled) },
          { name: 'dateFnsLocale', type: 'Locale', description: t(m.dpPropDateFnsLocale) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.dpPropSkeleton) },
          { name: 'bare', type: 'boolean', default: 'false', description: t(m.dpPropBare) },
        ]}
      />
      <Heading level={3}>{t(m.dpPropsDatePicker)}</Heading>
      <PropsTable
        props={[
          { name: 'value', type: 'Date', description: t(m.dpPropDpValue) },
          { name: 'defaultValue', type: 'Date', description: t(m.dpPropDpDefaultValue) },
          { name: 'onValueChange', type: '(date: Date | undefined) => void', description: t(m.dpPropDpOnValueChange) },
          { name: 'placeholder', type: 'string', description: t(m.dpPropDpPlaceholder) },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t(m.dpPropDpSize) },
          { name: 'fullWidth', type: 'boolean', default: 'false', description: t(m.dpPropDpFullWidth) },
          { name: 'disabled', type: 'boolean', default: 'false', description: t(m.dpPropDpDisabled) },
          { name: 'glass', type: 'boolean', default: 'false', description: t(m.dpPropDpGlass) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.dpPropDpSkeleton) },
          { name: 'min', type: 'Date', description: t(m.dpPropDpMin) },
          { name: 'max', type: 'Date', description: t(m.dpPropDpMax) },
          { name: 'disabledDates', type: '(date: Date) => boolean', description: t(m.dpPropDpDisabledDates) },
          { name: 'dateFnsLocale', type: 'Locale', description: t(m.dpPropDpDateFnsLocale) },
          { name: 'name', type: 'string', description: t(m.dpPropDpName) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.dpA11y1))}</li>
        <li>{t(m.dpA11y2)}</li>
        <li>{prose(t(m.dpA11y3))}</li>
        <li>{prose(t(m.dpA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{t(m.dpUse1)}</li>
        <li>{prose(t(m.dpUse2))}</li>
        <li>{prose(t(m.dpUse3))}</li>
      </ul>
    </>
  );
}
