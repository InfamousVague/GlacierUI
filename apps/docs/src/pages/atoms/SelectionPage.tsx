import { useState } from 'react';
import { Card, Checkbox, Radio, Row, Stack, Switch, Heading, Text, Size, TextTone, useT } from '@glacier/react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { m } from '../../i18n.ts';

/**
 * A controlled radio group. A native radio has no `name`-based DOM owner to
 * enforce single-select, so exclusivity is driven by lifting the selected value
 * into state and passing `checked`/`onCheckedChange` to every radio — the
 * parent-owned-group path. Each comparison pane renders its own instance.
 */
function RadioGroup({
  K,
  name,
  ariaLabel,
  initial,
  options,
}: {
  K: PlatformKit;
  name: string;
  ariaLabel: string;
  initial: string;
  options: { value: string; label: string }[];
}) {
  const [selected, setSelected] = useState(initial);
  return (
    <Stack gap={4} role="radiogroup" aria-label={ariaLabel}>
      {options.map((o) => (
        <K.Radio
          key={o.value}
          name={name}
          value={o.value}
          label={o.label}
          checked={selected === o.value}
          onChange={() => setSelected(o.value)}
        />
      ))}
    </Stack>
  );
}

export function SelectionPage() {
  const t = useT();
  const [subscribed, setSubscribed] = useState(true);

  return (
    <>
      <Heading level={1}>{t(m.selName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.selLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.selAnatomyIntro)}</Text>
      <ComponentBlueprint specId="checkbox" />
      <ComponentBlueprint specId="radio" />
      <ComponentBlueprint specId="switch" fixedSize="md" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.selEx1Title)}
        description={t(m.selEx1Desc)}
        component="Checkbox"
        render={(K) => (
          <Stack gap={4}>
            <K.Checkbox label={t(m.selectionUnchecked)} />
            <K.Checkbox label={t(m.selectionCheckedByDefault)} defaultChecked />
            <K.Checkbox label={t(m.selectionDisabled)} disabled />
            <K.Checkbox label={t(m.selectionDisabledAndChecked)} defaultChecked disabled />
          </Stack>
        )}
        code={`import { Checkbox, Radio, Switch, Card } from '@glacier/react';

<Checkbox label="Unchecked" />
<Checkbox label="Checked by default" defaultChecked />
<Checkbox label="Disabled" disabled />
<Checkbox label="Disabled and checked" defaultChecked disabled />`}
      />

      <Example
        title={t(m.selEx2Title)}
        description={t(m.selEx2Desc)}
        code={`const [subscribed, setSubscribed] = useState(true);

<Checkbox
  label="Email me release notes"
  checked={subscribed}
  onCheckedChange={setSubscribed}
/>
<p>{subscribed ? 'Subscribed' : 'Not subscribed'}</p>`}
      >
        <Stack gap={4}>
          <Checkbox
            label={t(m.selectionEmailMeReleaseNotes)}
            checked={subscribed}
            onCheckedChange={setSubscribed}
          />
          <Text tone={TextTone.Muted}>{subscribed ? 'Subscribed' : 'Not subscribed'}</Text>
        </Stack>
      </Example>

      <Example
        title={t(m.selEx3Title)}
        description={t(m.selEx3Desc)}
        component="Radio"
        render={(K) => (
          <RadioGroup
            K={K}
            name="plan"
            ariaLabel={t(m.selectionBillingPlan)}
            initial="hobby"
            options={[
              { value: 'hobby', label: t(m.selectionHobby) },
              { value: 'pro', label: t(m.selectionPro) },
              { value: 'team', label: t(m.selectionTeam) },
            ]}
          />
        )}
        code={`<Stack gap={4} role="radiogroup" aria-label="Billing plan">
  <Radio name="plan" value="hobby" label="Hobby" defaultChecked />
  <Radio name="plan" value="pro" label="Pro" />
  <Radio name="plan" value="team" label="Team" />
</Stack>`}
      />

      <Example
        title={t(m.selEx4Title)}
        description={t(m.selEx4Desc)}
        component="Switch"
        render={(K) => (
          <Stack gap={4}>
            <K.Switch label={t(m.selectionWiFi)} defaultChecked />
            <K.Switch label={t(m.selectionBluetooth)} />
            <K.Switch label={t(m.selectionAirplaneMode)} disabled />
          </Stack>
        )}
        code={`<Switch label="Wi-Fi" defaultChecked />
<Switch label="Bluetooth" />
<Switch label="Airplane mode" disabled />`}
      />

      <Example
        title={t(m.selEx5Title)}
        description={t(m.selEx5Desc)}
        component="Switch"
        render={(K) => (
          <Card
            elevation={2}
            style={{ padding: '1.25rem', display: 'grid', gap: '0.875rem', minWidth: '18rem' }}
          >
            {[
              { name: 'Notifications', on: true },
              { name: 'Sound effects', on: true },
              { name: 'Analytics', on: false },
            ].map((setting) => (
              <Row key={setting.name} gap={8} justify="between">
                <span>{setting.name}</span>
                <K.Switch aria-label={setting.name} defaultChecked={setting.on} />
              </Row>
            ))}
          </Card>
        )}
        code={`const row: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '2rem',
};

<Card elevation={2} style={{ padding: '1.25rem', display: 'grid', gap: '0.875rem' }}>
  <div style={row}>
    <span>Notifications</span>
    <Switch aria-label="Notifications" defaultChecked />
  </div>
  <div style={row}>
    <span>Sound effects</span>
    <Switch aria-label="Sound effects" defaultChecked />
  </div>
  <div style={row}>
    <span>Analytics</span>
    <Switch aria-label="Analytics" />
  </div>
</Card>`}
      />

      <Example
        title={t(m.exSkeleton)}
        description={t(m.selEx6Desc)}
        code={`<Checkbox skeleton label="Email me release notes" />
<Radio skeleton label="Hobby" />
<Switch skeleton label="Wi-Fi" />`}
      >
        <Row gap={12} wrap>
          <Stack gap={4}>
            <Checkbox label={t(m.selectionEmailMeReleaseNotes)} defaultChecked />
            <Radio name="skeleton-demo" label={t(m.selectionHobby)} defaultChecked />
            <Switch label={t(m.selectionWiFi)} defaultChecked />
          </Stack>
          <Stack gap={4}>
            <Checkbox skeleton label={t(m.selectionEmailMeReleaseNotes)} />
            <Radio skeleton label={t(m.selectionHobby)} />
            <Switch skeleton label={t(m.selectionWiFi)} />
          </Stack>
        </Row>
      </Example>

      <Heading level={2}>{t(m.secProps)}</Heading>

      <Heading level={3}>{t(m.selChkHeading)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(m.selChkIntro))}</Text>
      <PropsTable
        props={[
          {
            name: 'label',
            type: 'ReactNode',
            description: t(m.selChkPropLabel),
          },
          {
            name: 'checked',
            type: 'boolean',
            description: t(m.selChkPropChecked),
          },
          {
            name: 'defaultChecked',
            type: 'boolean',
            default: 'false',
            description: t(m.selChkPropDefaultChecked),
          },
          {
            name: 'onCheckedChange',
            type: '(checked: boolean) => void',
            description: t(m.selChkPropOnCheckedChange),
          },
          {
            name: 'disabled',
            type: 'boolean',
            default: 'false',
            description: t(m.selPropDisabled),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.selPropSkeleton),
          },
        ]}
      />

      <Heading level={3}>{t(m.selRadioHeading)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(m.selRadioIntro))}</Text>
      <PropsTable
        props={[
          {
            name: 'label',
            type: 'ReactNode',
            description: t(m.selRadioPropLabel),
          },
          {
            name: 'name',
            type: 'string',
            description: t(m.selRadioPropName),
          },
          {
            name: 'value',
            type: 'string',
            description: t(m.selRadioPropValue),
          },
          {
            name: 'defaultChecked',
            type: 'boolean',
            default: 'false',
            description: t(m.selRadioPropDefaultChecked),
          },
          {
            name: 'disabled',
            type: 'boolean',
            default: 'false',
            description: t(m.selPropDisabled),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.selPropSkeleton),
          },
        ]}
      />

      <Heading level={3}>{t(m.selSwitchHeading)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.selSwitchIntro)}</Text>
      <PropsTable
        props={[
          {
            name: 'label',
            type: 'ReactNode',
            description: t(m.selSwitchPropLabel),
          },
          {
            name: 'checked',
            type: 'boolean',
            description: t(m.selSwitchPropChecked),
          },
          {
            name: 'defaultChecked',
            type: 'boolean',
            default: 'false',
            description: t(m.selChkPropDefaultChecked),
          },
          {
            name: 'onCheckedChange',
            type: '(checked: boolean) => void',
            description: t(m.selSwitchPropOnCheckedChange),
          },
          {
            name: 'size',
            type: "'sm' | 'md'",
            default: "'md'",
            description: t(m.selSwitchPropSize),
          },
          {
            name: 'disabled',
            type: 'boolean',
            default: 'false',
            description: t(m.selPropDisabled),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.selPropSkeleton),
          },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{t(m.selA11y1)}</li>
        <li>{prose(t(m.selA11y2))}</li>
        <li>{t(m.selA11y3)}</li>
        <li>{t(m.selA11y4)}</li>
        <li>{prose(t(m.selA11y5))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{t(m.selUse1)}</li>
        <li>{t(m.selUse2)}</li>
        <li>{t(m.selUse3)}</li>
        <li>{prose(t(m.selUse4))}</li>
        <li>{prose(t(m.selUse5))}</li>
        <li>{prose(t(m.selUse6))}</li>
      </ul>
    </>
  );
}
