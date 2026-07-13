import { Button, Field, Input, Row, Stack, Heading, Text, Size, TextTone, useT } from '@glacier/react';
import { useState } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

export function FieldPage() {
  const t = useT();
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const validateUsername = () => {
    if (!username) return setUsernameError(t(m.fldErrRequired));
    if (!/^[a-zA-Z0-9]+$/.test(username)) return setUsernameError(t(m.fldHintUsername));
    setUsernameError(null);
  };

  return (
    <>
      <Heading level={1}>{t(m.fldName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.fldLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.fldAnatomyIntro)}</Text>
      <ComponentBlueprint specId="field" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.fldEx1Desc)}
        component="Field"
        render={(K) => (
          <Stack gap={4} maxWidth="xs" width="full">
            <K.Field label={t(m.fldLabelEmail)} hint={t(m.fldHintEmail)}>
              <Input type="email" placeholder={t(m.fieldYouExampleCom)} />
            </K.Field>
          </Stack>
        )}
        code={`import { Field, Input } from '@glacier/react';

<Field label="Email" hint="Used for receipts and account recovery.">
  <Input type="email" placeholder="you@example.com" />
</Field>`}
      />

      <Example
        title={t(m.fldEx2Title)}
        description={t(m.fldEx2Desc)}
        code={`const [value, setValue] = useState('');
const [error, setError] = useState<string | null>(null);

const validate = () => {
  if (!value) return setError('Username is required.');
  if (!/^[a-zA-Z0-9]+$/.test(value)) return setError('Letters and numbers only.');
  setError(null);
};

<Field label="Username" hint="Letters and numbers only." error={error}>
  <Input
    value={value}
    placeholder="octocat"
    onChange={(e) => {
      setValue(e.target.value);
      setError(null);
    }}
  />
</Field>
<Button onClick={validate}>Validate</Button>`}
      >
        <Stack gap={4} maxWidth="xs" width="full">
          <Field label={t(m.fldLabelUsername)} hint={t(m.fldHintUsername)} error={usernameError}>
            <Input
              value={username}
              placeholder={t(m.fieldOctocat)}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameError(null);
              }}
            />
          </Field>
          <Row gap={4} wrap>
            <Button onClick={validateUsername}>{t(m.fldValidate)}</Button>
          </Row>
        </Stack>
      </Example>

      <Example
        title={t(m.fldEx3Title)}
        description={t(m.fldEx3Desc)}
        component="Field"
        render={(K) => (
          <Stack gap={4} maxWidth="xs" width="full">
            <K.Field label={t(m.fldLabelFullName)} required>
              <Input required autoComplete="name" />
            </K.Field>
          </Stack>
        )}
        code={`<Field label="Full name" required>
  <Input required autoComplete="name" />
</Field>`}
      />

      <Example
        title={t(m.secSizes)}
        description={t(m.fldEx4Desc)}
        component="Field"
        render={(K) => (
          <Stack gap={4} maxWidth="xs" width="full">
            <K.Field label={t(m.fieldSmall)}>
              <Input size={Size.Small} placeholder={t(m.fieldSm)} />
            </K.Field>
            <K.Field label={t(m.fieldMedium)}>
              <Input size={Size.Medium} placeholder={t(m.fieldMd)} />
            </K.Field>
            <K.Field label={t(m.fieldLarge)}>
              <Input size={Size.Large} placeholder={t(m.fieldLg)} />
            </K.Field>
          </Stack>
        )}
        code={`<Field label="Small">
  <Input size={Size.Small} placeholder="sm" />
</Field>
<Field label="Medium">
  <Input size={Size.Medium} placeholder="md" />
</Field>
<Field label="Large">
  <Input size={Size.Large} placeholder="lg" />
</Field>`}
      />

      <Example
        title={t(m.fldEx5Title)}
        description={t(m.fldEx5Desc)}
        component="Field"
        render={(K) => (
          <Stack gap={4} maxWidth="xs" width="full">
            <K.Field label={t(m.fldLabelPlan)} hint={t(m.fldHintPlan)}>
              <Input disabled value="Pro (annual)" readOnly />
            </K.Field>
          </Stack>
        )}
        code={`<Field label="Plan" hint="Contact support to change your plan.">
  <Input disabled value="Pro (annual)" readOnly />
</Field>`}
      />

      <Example
        title={t(m.fldEx6Title)}
        description={t(m.fldEx6Desc)}
        code={`<label htmlFor="doc-search">Search</label>
<Input id="doc-search" type="search" placeholder="Search docs" />`}
      >
        <Stack gap={4} maxWidth="xs" width="full">
          <label htmlFor="doc-search">{t(m.fldBareLabel)}</label>
          <Input id="doc-search" type="search" placeholder={t(m.fldPlaceholderSearch)} />
        </Stack>
      </Example>

      <Example
        title={t(m.exSkeleton)}
        description={t(m.fldEx7Desc)}
        component="Field"
        render={(K) => (
          <Stack gap={4} maxWidth="xs" width="full">
            <K.Field skeleton label={t(m.fldLabelEmail)} hint={t(m.fldHintEmail)}>
              <Input skeleton />
            </K.Field>
            <K.Field label={t(m.fldLabelEmail)} hint={t(m.fldHintEmail)}>
              <Input type="email" placeholder={t(m.fieldYouExampleCom)} />
            </K.Field>
          </Stack>
        )}
        code={`<Field skeleton label="Email" hint="Used for receipts and account recovery.">
  <Input skeleton />
</Field>
<Field label="Email" hint="Used for receipts and account recovery.">
  <Input type="email" placeholder="you@example.com" />
</Field>`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>

      <Heading level={3}>{t(m.fldPropsField)}</Heading>
      <PropsTable
        props={[
          {
            name: 'label',
            type: 'ReactNode',
            description: t(m.fldPropLabel),
          },
          {
            name: 'hint',
            type: 'ReactNode',
            description: t(m.fldPropHint),
          },
          {
            name: 'error',
            type: 'ReactNode',
            description: t(m.fldPropError),
          },
          {
            name: 'required',
            type: 'boolean',
            default: 'false',
            description: t(m.fldPropRequired),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.fldPropSkeleton),
          },
          {
            name: 'className',
            type: 'string',
            description: t(m.fldPropClassName),
          },
          {
            name: 'children',
            type: 'ReactNode',
            description: t(m.fldPropChildren),
          },
        ]}
      />

      <Heading level={3}>{t(m.fldPropsInput)}</Heading>
      <PropsTable
        props={[
          {
            name: 'size',
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: t(m.fldPropInputSize),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.fldPropSkeleton),
          },
          {
            name: 'id',
            type: 'string',
            description: t(m.fldPropInputId),
          },
          {
            name: '...props',
            type: "ComponentProps<'input'>",
            description: t(m.fldPropInputRest),
          },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.fldA11y1))}</li>
        <li>{prose(t(m.fldA11y2))}</li>
        <li>{prose(t(m.fldA11y3))}</li>
        <li>{prose(t(m.fldA11y4))}</li>
        <li>{prose(t(m.fldA11y5))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{t(m.fldUse1)}</li>
        <li>{t(m.fldUse2)}</li>
        <li>{t(m.fldUse3)}</li>
        <li>{prose(t(m.fldUse4))}</li>
        <li>{t(m.fldUse5)}</li>
      </ul>
    </>
  );
}
