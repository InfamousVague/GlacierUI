import { Combobox, type ComboboxOption, Field, Heading, Size, Stack, Text, TextTone, useT } from '@glacier/react';
import { useState } from 'react';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { m } from '../../i18n.ts';

/**
 * A controlled combobox demo. The committed value and the input query are
 * component-local, so each comparison pane drives its own selection — `render`
 * is called once per pane and cannot hold hooks itself. `K` is the platform kit
 * (the DOM kit or the RN kit) the demo renders through.
 */
function ControlledCombobox({
  K,
  options,
  ariaLabel,
  placeholder,
}: {
  K: PlatformKit;
  options: ComboboxOption[];
  ariaLabel: string;
  placeholder: string;
}) {
  const t = useT();
  const [fruit, setFruit] = useState('');
  const [query, setQuery] = useState('');
  return (
    <Stack gap={3} width="full" maxWidth="xs">
      <K.Combobox
        aria-label={ariaLabel}
        placeholder={placeholder}
        options={options}
        value={fruit}
        onValueChange={setFruit}
        inputValue={query}
        onInputValueChange={setQuery}
        fullWidth
      />
      <Text size={Size.Small} tone={TextTone.Muted}>
        {t(m.cmbSelectedLabel)} <code>{fruit || 'none'}</code> · {t(m.cmbQueryLabel)} <code>{query || 'empty'}</code>
      </Text>
    </Stack>
  );
}

export function ComboboxPage() {
  const t = useT();

  const FRUIT = [
    { value: 'apple', label: t(m.comboboxApple), description: t(m.comboboxCrispAndSweet) },
    { value: 'banana', label: t(m.comboboxBanana), description: t(m.comboboxSoftTropicalFruit) },
    { value: 'cherry', label: t(m.comboboxCherry), description: t(m.comboboxStoneFruit), disabled: true },
    { value: 'plum', label: t(m.comboboxPlum), description: t(m.comboboxJuicySummerFruit) },
  ];

  return (
    <>
      <Heading level={1}>{t(m.cmbName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.cmbLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.cmbAnatomyIntro)}</Text>
      <ComponentBlueprint specId="combobox" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.cmbEx1Desc)}
        component="Combobox"
        render={(K) => (
          <div style={{ width: '18rem' }}>
            <K.Combobox aria-label={t(m.cmbAriaFruit)} placeholder={t(m.cmbPlaceholderSearch)} options={FRUIT} />
          </div>
        )}
        code={`import { Combobox } from '@glacier/react';

<Combobox
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
        title={t(m.cmbEx2Title)}
        description={t(m.cmbEx2Desc)}
        component="Combobox"
        render={(K) => (
          <ControlledCombobox
            K={K}
            options={FRUIT}
            ariaLabel={t(m.cmbAriaFruit)}
            placeholder={t(m.cmbPlaceholderSearch)}
          />
        )}
        code={`const [value, setValue] = useState('');
const [query, setQuery] = useState('');

<Combobox
  aria-label="Fruit"
  options={options}
  value={value}
  onValueChange={setValue}
  inputValue={query}
  onInputValueChange={setQuery}
/>`}
      />

      <Example
        title={t(m.cmbEx3Title)}
        description={t(m.cmbEx3Desc)}
        code={`<Field label="Favorite fruit" hint="Start typing to search." error={error}>
  <Combobox options={options} placeholder="Choose fruit" fullWidth />
</Field>`}
      >
        <div style={{ width: '18rem' }}>
          <Field label={t(m.cmbFieldLabel)} hint={t(m.cmbFieldHint)}>
            <Combobox options={FRUIT} placeholder={t(m.cmbPlaceholderChoose)} fullWidth />
          </Field>
        </div>
      </Example>

      <Example
        title={t(m.cmbEx4Title)}
        description={t(m.cmbEx4Desc)}
        component="Combobox"
        render={(K) => (
          <Stack gap={4} width="full" maxWidth="xs">
            <K.Combobox aria-label={t(m.cmbAriaLoading)} options={[]} loading fullWidth />
            <K.Combobox
              aria-label={t(m.cmbAriaFruitSearch)}
              placeholder={t(m.cmbPlaceholderNoMatch)}
              options={FRUIT}
              emptyState={t(m.cmbEmptyState)}
              fullWidth
            />
          </Stack>
        )}
        code={`<Combobox aria-label="Loading fruit" options={[]} loading />
<Combobox
  aria-label="Fruit"
  options={options}
  emptyState="No fruit matches this search."
/>`}
      />

      <Example
        title={t(m.cmbEx5Title)}
        description={t(m.cmbEx5Desc)}
        component="Combobox"
        render={(K) => (
          <Stack gap={3} width="full" maxWidth="xs">
            <K.Combobox size={Size.Small} aria-label={t(m.comboboxSmall)} options={FRUIT} fullWidth />
            <K.Combobox size={Size.Medium} aria-label={t(m.comboboxMedium)} options={FRUIT} fullWidth />
            <K.Combobox size={Size.Large} aria-label={t(m.comboboxLarge)} options={FRUIT} fullWidth />
            <K.Combobox skeleton options={FRUIT} fullWidth />
          </Stack>
        )}
        code={`<Combobox size={Size.Small} aria-label="Small" options={options} />
<Combobox size={Size.Medium} aria-label="Medium" options={options} />
<Combobox size={Size.Large} aria-label="Large" options={options} />
<Combobox skeleton options={options} />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'options', type: 'ComboboxOption[]', description: t(m.cmbPropOptions) },
          { name: 'value', type: 'string', description: t(m.cmbPropValue) },
          { name: 'defaultValue', type: 'string', description: t(m.cmbPropDefaultValue) },
          { name: 'onValueChange', type: '(value: string) => void', description: t(m.cmbPropOnValueChange) },
          { name: 'inputValue', type: 'string', description: t(m.cmbPropInputValue) },
          { name: 'onInputValueChange', type: '(value: string) => void', description: t(m.cmbPropOnInputValueChange) },
          { name: 'filter', type: '(option, inputValue) => boolean', description: t(m.cmbPropFilter) },
          { name: 'emptyState', type: 'ReactNode', description: t(m.cmbPropEmptyState) },
          { name: 'loading', type: 'boolean', default: 'false', description: t(m.cmbPropLoading) },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t(m.cmbPropSize) },
          { name: 'name', type: 'string', description: t(m.cmbPropName) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.cmbA11y1))}</li>
        <li>{prose(t(m.cmbA11y2))}</li>
        <li>{t(m.cmbA11y3)}</li>
        <li>{t(m.cmbA11y4)}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{t(m.cmbUse1)}</li>
        <li>{prose(t(m.cmbUse2))}</li>
        <li>{prose(t(m.cmbUse3))}</li>
      </ul>
    </>
  );
}
