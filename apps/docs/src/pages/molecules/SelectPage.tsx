import { Field, Select, Heading, Text, Size, TextTone, useT } from '@glacier/react';
import { useState } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

/**
 * A controlled Select demo. The selected value is lifted into state so the demo
 * has no hooks in the render callback (which runs once per comparison pane) and
 * each pane manages its own selection, mirroring the web kit's controlled
 * example. `K` is the platform kit (the DOM kit or the RN kit) the demo renders
 * through.
 */
function SelectRegionDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const [region, setRegion] = useState('eu');
  return (
    <>
      <K.Select
        aria-label={t(m.selectRegion)}
        value={region}
        onValueChange={setRegion}
        options={[
          { value: 'us', label: t(m.selectUnitedStates) },
          { value: 'eu', label: t(m.selectEurope) },
          { value: 'apac', label: t(m.selectAsiaPacific) },
        ]}
      />
      <span>
        {t(m.selectSelected)} <code>{region}</code>
      </span>
    </>
  );
}

export function SelectPage() {
  const t = useT();

  const FRUIT = [
    { value: 'apple', label: t(m.selectApple) },
    { value: 'banana', label: t(m.selectBanana) },
    { value: 'cherry', label: t(m.selectCherry) },
    { value: 'plum', label: t(m.selectPlum) },
  ];

  return (
    <>
      <Heading level={1}>{t(m.selName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.selLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.selAnatomyIntro)}</Text>
      <ComponentBlueprint specId="select" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.selEx1Desc)}
        component="Select"
        render={(K) => <K.Select aria-label={t(m.selectFruit)} placeholder={t(m.selPhPickFruit)} options={FRUIT} />}
        code={`import { Select } from '@glacier/react';

<Select
  aria-label="Fruit"
  placeholder="Pick a fruit"
  options={[
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
  ]}
/>`}
      />

      <Example
        title={t(m.selEx2Title)}
        description={t(m.selEx2Desc)}
        component="Select"
        render={(K) => <SelectRegionDemo K={K} />}
        code={`const [region, setRegion] = useState('eu');

<Select
  aria-label="Region"
  value={region}
  onValueChange={setRegion}
  options={[
    { value: 'us', label: 'United States' },
    { value: 'eu', label: 'Europe' },
    { value: 'apac', label: 'Asia Pacific' },
  ]}
/>`}
      />

      <Example
        title={t(m.secSizes)}
        description={t(m.selEx3Desc)}
        component="Select"
        render={(K) => (
          <>
            <K.Select size={Size.Small} aria-label={t(m.selectSmall)} options={FRUIT} defaultValue="apple" />
            <K.Select size={Size.Medium} aria-label={t(m.selectMedium)} options={FRUIT} defaultValue="apple" />
            <K.Select size={Size.Large} aria-label={t(m.selectLarge)} options={FRUIT} defaultValue="apple" />
          </>
        )}
        code={`<Select size={Size.Small} aria-label="Small" options={options} defaultValue="apple" />
<Select size={Size.Medium} aria-label="Medium" options={options} defaultValue="apple" />
<Select size={Size.Large} aria-label="Large" options={options} defaultValue="apple" />`}
      />

      <Example
        title={t(m.selEx4Title)}
        description={t(m.selEx4Desc)}
        code={`<Field label="Favorite fruit" hint="You can change this later.">
  <Select placeholder="Pick one" options={options} fullWidth />
</Field>`}
      >
        <div style={{ width: '18rem' }}>
          <Field label={t(m.selFieldLabel)} hint={t(m.selFieldHint)}>
            <Select placeholder={t(m.selPhPickOne)} options={FRUIT} fullWidth />
          </Field>
        </div>
      </Example>

      <Example
        title={t(m.selEx5Title)}
        description={t(m.selEx5Desc)}
        component="Select"
        render={(K) => (
          <>
            <K.Select
              aria-label={t(m.selectPlan)}
              defaultValue="pro"
              options={[
                { value: 'free', label: t(m.selectFree) },
                { value: 'pro', label: t(m.selectPro) },
                { value: 'team', label: t(m.selectTeam), disabled: true },
              ]}
            />
            <K.Select aria-label={t(m.selectLocked)} options={FRUIT} defaultValue="apple" disabled />
          </>
        )}
        code={`<Select
  aria-label="Plan"
  defaultValue="pro"
  options={[
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
    { value: 'team', label: 'Team', disabled: true },
  ]}
/>
<Select aria-label="Locked" options={options} defaultValue="apple" disabled />`}
      />

      <Example
        title={t(m.exSkeleton)}
        description={t(m.selEx6Desc)}
        component="Select"
        render={(K) => (
          <>
            <K.Select skeleton options={FRUIT} />
            <K.Select aria-label={t(m.selectFruit)} options={FRUIT} defaultValue="apple" />
          </>
        )}
        code={`<Select skeleton options={options} />
<Select aria-label="Fruit" options={options} defaultValue="apple" />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <Heading level={3}>{t(m.selectSelect)}</Heading>
      <PropsTable
        props={[
          { name: 'options', type: 'SelectOption[]', description: t(m.selPropOptions) },
          { name: 'value', type: 'string', description: t(m.selPropValue) },
          { name: 'defaultValue', type: 'string', description: t(m.selPropDefaultValue) },
          { name: 'onValueChange', type: '(value: string) => void', description: t(m.selPropOnValueChange) },
          { name: 'placeholder', type: 'string', default: "'Select…'", description: t(m.selPropPlaceholder) },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t(m.selPropSize) },
          { name: 'fullWidth', type: 'boolean', default: 'false', description: t(m.selPropFullWidth) },
          { name: 'disabled', type: 'boolean', default: 'false', description: t(m.selPropDisabled) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.selPropSkeleton) },
          { name: 'name', type: 'string', description: t(m.selPropName) },
          { name: 'aria-label', type: 'string', description: t(m.selPropAriaLabel) },
        ]}
      />
      <Heading level={3}>{t(m.selOptionsEntries)}</Heading>
      <PropsTable
        props={[
          { name: 'value', type: 'string', description: t(m.selOptValue) },
          { name: 'label', type: 'ReactNode', description: t(m.selOptLabel) },
          { name: 'disabled', type: 'boolean', default: 'false', description: t(m.selOptDisabled) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.selA11y1))}</li>
        <li>{prose(t(m.selA11y2))}</li>
        <li>{prose(t(m.selA11y3))}</li>
        <li>{prose(t(m.selA11y4))}</li>
        <li>{prose(t(m.selA11y5))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.selUse1))}</li>
        <li>{prose(t(m.selUse2))}</li>
        <li>{prose(t(m.selUse3))}</li>
        <li>{prose(t(m.selUse4))}</li>
      </ul>
    </>
  );
}
