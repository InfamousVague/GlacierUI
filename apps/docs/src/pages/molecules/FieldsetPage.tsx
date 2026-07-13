import { useState } from 'react';
import {
  Button,
  Field,
  Fieldset,
  Heading,
  Input,
  Size,
  Stack,
  Switch,
  Text,
  TextTone,
  Variant,
  useT,
} from '@glacier/react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { m } from '../../i18n.ts';

function DisabledCascade({ K }: { K: PlatformKit }) {
  const t = useT();
  const [locked, setLocked] = useState(true);
  return (
    <Stack gap={5} maxWidth="xs" width="full">
      <Switch label={t(m.fsSwitchLock)} checked={locked} onCheckedChange={setLocked} />
      <K.Fieldset
        legend={t(m.fsLegendShipping)}
        description={t(m.fsDescShipping)}
        disabled={locked}
      >
        <Field label={t(m.fsLabelStreet)}>
          <Input placeholder={t(m.fieldsetX123FjordLane)} />
        </Field>
        <Field label={t(m.fsLabelCity)}>
          <Input placeholder={t(m.fieldsetReykjavik)} />
        </Field>
      </K.Fieldset>
    </Stack>
  );
}

export function FieldsetPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.fsName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.fsLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.fsAnatomyIntro)}</Text>
      <ComponentBlueprint specId="fieldset" />
      <ComponentBlueprint specId="form-section" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.fsEx1Desc)}
        code={`import { Fieldset, Field, Input } from '@glacier/react';

<Fieldset legend="Contact" description="How we reach you about your order.">
  <Field label="Email" hint="Used for receipts.">
    <Input type="email" placeholder="you@example.com" />
  </Field>
  <Field label="Phone">
    <Input type="tel" placeholder="+354 555 0100" />
  </Field>
</Fieldset>`}
        component="Fieldset"
        render={(K) => (
          <Stack gap={4} maxWidth="xs" width="full">
            <K.Fieldset legend={t(m.fsLegendContact)} description={t(m.fsDescContact)}>
              <Field label={t(m.fsLabelEmail)} hint={t(m.fsHintReceipts)}>
                <Input type="email" placeholder={t(m.fieldsetYouExampleCom)} />
              </Field>
              <Field label={t(m.fsLabelPhone)}>
                <Input type="tel" placeholder="+354 555 0100" />
              </Field>
            </K.Fieldset>
          </Stack>
        )}
      />

      <Example
        title={t(m.fsEx2Title)}
        description={t(m.fsEx2Desc)}
        code={`<Fieldset bordered legend="Billing" description="Charged at the end of each cycle.">
  <Field label="Cardholder">
    <Input autoComplete="cc-name" />
  </Field>
</Fieldset>`}
        component="Fieldset"
        render={(K) => (
          <Stack gap={4} maxWidth="xs" width="full">
            <K.Fieldset bordered legend={t(m.fsLegendBilling)} description={t(m.fsDescBilling)}>
              <Field label={t(m.fsLabelCardholder)}>
                <Input autoComplete="cc-name" />
              </Field>
            </K.Fieldset>
          </Stack>
        )}
      />

      <Example
        title={t(m.fsEx3Title)}
        description={t(m.fsEx3Desc)}
        code={`const [locked, setLocked] = useState(true);

<Switch label="Lock shipping details" checked={locked} onCheckedChange={setLocked} />
<Fieldset legend="Shipping address" disabled={locked}>
  <Field label="Street">
    <Input placeholder="123 Fjord Lane" />
  </Field>
  <Field label="City">
    <Input placeholder="Reykjavik" />
  </Field>
</Fieldset>`}
        component="Fieldset"
        render={(K) => <DisabledCascade K={K} />}
      />

      <Example
        title={t(m.fsEx4Title)}
        description={t(m.fsEx4Desc)}
        code={`import { FormSection, Fieldset, Field, Input, Button, Variant } from '@glacier/react';

<FormSection
  title="Profile"
  description="How you appear across the workspace."
  actions={<Button variant={Variant.Outline} size={Size.Small}>Reset</Button>}
>
  <Field label="Display name">
    <Input placeholder="Ada Lovelace" />
  </Field>
</FormSection>

<FormSection divider title="Notifications" description="What we send and where.">
  <Fieldset legend="Email">
    <Field label="Address">
      <Input type="email" />
    </Field>
  </Fieldset>
</FormSection>`}
        component="FormSection"
        render={(K) => (
          <Stack gap={8} maxWidth="sm" width="full">
            <K.FormSection
              title={t(m.fsTitleProfile)}
              description={t(m.fsDescProfile)}
              actions={
                <Button variant={Variant.Outline} size={Size.Small}>
                  {t(m.fsReset)}
                </Button>
              }
            >
              <Field label={t(m.fsLabelDisplayName)}>
                <Input placeholder={t(m.fieldsetAdaLovelace)} />
              </Field>
            </K.FormSection>
            <K.FormSection divider title={t(m.fsTitleNotifications)} description={t(m.fsDescNotifications)}>
              <Fieldset legend={t(m.fsLabelEmail)}>
                <Field label={t(m.fsLabelAddress)}>
                  <Input type="email" placeholder={t(m.fieldsetYouExampleCom)} />
                </Field>
              </Fieldset>
            </K.FormSection>
          </Stack>
        )}
      />

      <Example
        title={t(m.exSkeleton)}
        description={t(m.fsEx5Desc)}
        code={`<FormSection skeleton title="Profile" description="How you appear across the workspace.">
  <Fieldset skeleton legend="Contact" description="How we reach you.">
    <Field skeleton label="Email" hint="Used for receipts.">
      <Input skeleton />
    </Field>
  </Fieldset>
</FormSection>`}
        component="FormSection"
        render={(K) => (
          <Stack gap={4} maxWidth="xs" width="full">
            <K.FormSection skeleton title={t(m.fsTitleProfile)} description={t(m.fsDescProfile)}>
              <Fieldset skeleton legend={t(m.fsLegendContact)} description={t(m.fsDescReach)}>
                <Field skeleton label={t(m.fsLabelEmail)} hint={t(m.fsHintReceipts)}>
                  <Input skeleton />
                </Field>
              </Fieldset>
            </K.FormSection>
          </Stack>
        )}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>

      <Heading level={3}>{t(m.fsPropsFieldset)}</Heading>
      <PropsTable
        props={[
          {
            name: 'legend',
            type: 'ReactNode',
            description: t(m.fsPropLegend),
          },
          {
            name: 'description',
            type: 'ReactNode',
            description: t(m.fsPropDescription),
          },
          {
            name: 'actions',
            type: 'ReactNode',
            description: t(m.fsPropActions),
          },
          {
            name: 'disabled',
            type: 'boolean',
            default: 'false',
            description: t(m.fsPropDisabled),
          },
          {
            name: 'bordered',
            type: 'boolean',
            default: 'false',
            description: t(m.fsPropBordered),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.fsPropSkeleton),
          },
          {
            name: 'children',
            type: 'ReactNode',
            description: t(m.fsPropChildren),
          },
        ]}
      />

      <Heading level={3}>{t(m.fsPropsFormSection)}</Heading>
      <PropsTable
        props={[
          {
            name: 'title',
            type: 'ReactNode',
            description: t(m.fsPropTitle),
          },
          {
            name: 'level',
            type: '1 | 2 | 3 | 4 | 5 | 6',
            default: '3',
            description: t(m.fsPropLevel),
          },
          {
            name: 'description',
            type: 'ReactNode',
            description: t(m.fsPropFsDescription),
          },
          {
            name: 'actions',
            type: 'ReactNode',
            description: t(m.fsPropFsActions),
          },
          {
            name: 'divider',
            type: 'boolean',
            default: 'false',
            description: t(m.fsPropDivider),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.fsPropSkeleton),
          },
          {
            name: 'children',
            type: 'ReactNode',
            description: t(m.fsPropFsChildren),
          },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.fsA11y1))}</li>
        <li>{prose(t(m.fsA11y2))}</li>
        <li>{prose(t(m.fsA11y3))}</li>
        <li>{prose(t(m.fsA11y4))}</li>
        <li>{prose(t(m.fsA11y5))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{t(m.fsUse1)}</li>
        <li>{t(m.fsUse2)}</li>
        <li>{prose(t(m.fsUse3))}</li>
        <li>{prose(t(m.fsUse4))}</li>
        <li>{prose(t(m.fsUse5))}</li>
      </ul>
    </>
  );
}
