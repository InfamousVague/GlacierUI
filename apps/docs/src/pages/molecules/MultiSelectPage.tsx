import { Field, Heading, MultiSelect, type MultiSelectOption, Size, Stack, Text, TextTone, useT } from '@glacier/react';
import { useState } from 'react';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { m } from '../../i18n.ts';

/**
 * A controlled MultiSelect demo. `value`/`onValueChange` and
 * `inputValue`/`onInputValueChange` are lifted into local state so each
 * comparison pane owns its own selection and query — the render function runs
 * once per pane and cannot itself hold hooks. `K` is the platform kit (the DOM
 * kit or the RN kit) the demo renders through.
 */
function ControlledMultiSelect({ K, options }: { K: PlatformKit; options: MultiSelectOption[] }) {
  const t = useT();
  const [value, setValue] = useState<string[]>(['apple']);
  const [query, setQuery] = useState('');
  return (
    <Stack gap={3} width="full" maxWidth="md">
      <K.MultiSelect
        aria-label={t(m.multiselectFruit)}
        placeholder={t(m.msPhSearchFruit)}
        options={options}
        value={value}
        onValueChange={setValue}
        inputValue={query}
        onInputValueChange={setQuery}
        fullWidth
      />
      <Text size={Size.Small} tone={TextTone.Muted}>
        {t(m.multiselectSelected)} <code>{value.join(', ') || 'none'}</code> {t(m.multiselectQuery)} <code>{query || 'empty'}</code>
      </Text>
    </Stack>
  );
}

export function MultiSelectPage() {
  const t = useT();

  const FRUIT = [
    { value: 'apple', label: t(m.multiselectApple), description: t(m.multiselectCrispAndSweet) },
    { value: 'banana', label: t(m.multiselectBanana), description: t(m.multiselectSoftTropicalFruit) },
    { value: 'cherry', label: t(m.multiselectCherry), description: t(m.multiselectStoneFruit), disabled: true },
    { value: 'plum', label: t(m.multiselectPlum), description: t(m.multiselectJuicySummerFruit) },
  ];

  return (
    <>
      <Heading level={1}>{t(m.msName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.msLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.msAnatomyIntro)}</Text>
      <ComponentBlueprint specId="multi-select" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.msEx1Desc)}
        component="MultiSelect"
        render={(K) => (
          <div style={{ width: '20rem' }}>
            <K.MultiSelect aria-label={t(m.multiselectFruit)} placeholder={t(m.msPhSearchFruit)} options={FRUIT} />
          </div>
        )}
        code={`import { MultiSelect } from '@glacier/react';

<MultiSelect
  aria-label="Fruit"
  placeholder="Search fruit"
  options={[
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'plum', label: 'Plum' },
  ]}
/>`}
      />

      <Example
        title={t(m.msEx2Title)}
        description={t(m.msEx2Desc)}
        component="MultiSelect"
        render={(K) => <ControlledMultiSelect K={K} options={FRUIT} />}
        code={`const [value, setValue] = useState(['apple']);
const [query, setQuery] = useState('');

<MultiSelect
  aria-label="Fruit"
  options={options}
  value={value}
  onValueChange={setValue}
  inputValue={query}
  onInputValueChange={setQuery}
/>`}
      />

      <Example
        title={t(m.msEx3Title)}
        description={t(m.msEx3Desc)}
        code={`<Field label="Favorite fruit" hint="Choose every fruit you enjoy.">
  <MultiSelect name="fruit" options={options} placeholder="Choose fruit" fullWidth />
</Field>`}
      >
        <div style={{ width: '20rem' }}>
          <Field label={t(m.msFieldLabel)} hint={t(m.msFieldHint)}>
            <MultiSelect name="fruit" options={FRUIT} placeholder={t(m.msPhChooseFruit)} fullWidth />
          </Field>
        </div>
      </Example>

      <Example
        title={t(m.msEx4Title)}
        description={t(m.msEx4Desc)}
        component="MultiSelect"
        render={(K) => (
          <Stack gap={4} width="full" maxWidth="xs">
            <K.MultiSelect aria-label={t(m.msAriaLoadingFruit)} options={[]} loading fullWidth />
            <K.MultiSelect
              aria-label={t(m.msAriaFruitSearch)}
              placeholder={t(m.msPhNoMatch)}
              options={FRUIT}
              emptyState={t(m.msEmptyState)}
              fullWidth
            />
          </Stack>
        )}
        code={`<MultiSelect aria-label="Loading fruit" options={[]} loading />
<MultiSelect
  aria-label="Fruit"
  options={options}
  emptyState="No fruit matches this search."
/>`}
      />

      <Example
        title={t(m.msEx5Title)}
        description={t(m.msEx5Desc)}
        component="MultiSelect"
        render={(K) => (
          <Stack gap={3} width="full" maxWidth="md">
            <K.MultiSelect size={Size.Small} aria-label={t(m.multiselectSmall)} options={FRUIT} defaultValue={['apple']} fullWidth />
            <K.MultiSelect size={Size.Medium} aria-label={t(m.multiselectMedium)} options={FRUIT} defaultValue={['apple']} fullWidth />
            <K.MultiSelect size={Size.Large} aria-label={t(m.multiselectLarge)} options={FRUIT} defaultValue={['apple']} fullWidth />
            <K.MultiSelect skeleton options={FRUIT} fullWidth />
          </Stack>
        )}
        code={`<MultiSelect size={Size.Small} aria-label="Small" options={options} defaultValue={['apple']} />
<MultiSelect size={Size.Medium} aria-label="Medium" options={options} defaultValue={['apple']} />
<MultiSelect size={Size.Large} aria-label="Large" options={options} defaultValue={['apple']} />
<MultiSelect skeleton options={options} />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'options', type: 'MultiSelectOption[]', description: t(m.msPropOptions) },
          { name: 'value', type: 'string[]', description: t(m.msPropValue) },
          { name: 'defaultValue', type: 'string[]', description: t(m.msPropDefaultValue) },
          { name: 'onValueChange', type: '(value: string[]) => void', description: t(m.msPropOnValueChange) },
          { name: 'inputValue', type: 'string', description: t(m.msPropInputValue) },
          { name: 'onInputValueChange', type: '(value: string) => void', description: t(m.msPropOnInputValueChange) },
          { name: 'filter', type: '(option, inputValue) => boolean', description: t(m.msPropFilter) },
          { name: 'emptyState', type: 'ReactNode', description: t(m.msPropEmptyState) },
          { name: 'loading', type: 'boolean', default: 'false', description: t(m.msPropLoading) },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t(m.msPropSize) },
          { name: 'name', type: 'string', description: t(m.msPropName) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.msA11y1))}</li>
        <li>{prose(t(m.msA11y2))}</li>
        <li>{prose(t(m.msA11y3))}</li>
        <li>{prose(t(m.msA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.msUse1))}</li>
        <li>{prose(t(m.msUse2))}</li>
        <li>{prose(t(m.msUse3))}</li>
      </ul>
    </>
  );
}
