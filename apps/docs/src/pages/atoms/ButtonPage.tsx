import { useState } from 'react';
import { Button, IconButton, Row, Stack, Heading, Text, Size, TextTone, Variant, useT } from '@glacier/react';
import { Plus } from '@glacier/icons';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

const plusIcon = <Plus size={16} />;

export function ButtonPage() {
  const t = useT();
  const [saving, setSaving] = useState(false);

  return (
    <>
      <Heading level={1}>{t(m.btnName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.btnLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntroBox)}</Text>
      <ComponentBlueprint specId="button" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.secVariants)}
        description={prose(t(m.btnEx1Desc))}
        component="Button"
        render={(K) => (
          <>
            <K.Button>{t(m.buttonSolid)}</K.Button>
            <K.Button variant={Variant.Soft}>{t(m.buttonSoft)}</K.Button>
            <K.Button variant={Variant.Outline}>{t(m.buttonOutline)}</K.Button>
            <K.Button variant={Variant.Ghost}>{t(m.buttonGhost)}</K.Button>
            <K.Button variant={Variant.Glass}>{t(m.buttonGlass)}</K.Button>
            <K.Button variant={Variant.Danger}>{t(m.buttonDanger)}</K.Button>
          </>
        )}
        code={`import { Button, IconButton } from '@glacier/react';

<Button>Solid</Button>
<Button variant={Variant.Soft}>Soft</Button>
<Button variant={Variant.Outline}>Outline</Button>
<Button variant={Variant.Ghost}>Ghost</Button>
<Button variant={Variant.Glass}>Glass</Button>
<Button variant={Variant.Danger}>Danger</Button>`}
      />

      <Example
        title={t(m.secSizes)}
        description={prose(t(m.btnEx2Desc))}
        component="Button"
        render={(K) => (
          <>
            <K.Button size={Size.Small}>{t(m.buttonSmall)}</K.Button>
            <K.Button size={Size.Medium}>{t(m.buttonMedium)}</K.Button>
            <K.Button size={Size.Large}>{t(m.buttonLarge)}</K.Button>
          </>
        )}
        code={`<Button size={Size.Small}>Small</Button>
<Button size={Size.Medium}>Medium</Button>
<Button size={Size.Large}>Large</Button>`}
      />

      <Example
        title={t(m.btnEx3Title)}
        description={prose(t(m.btnEx3Desc))}
        code={`const [saving, setSaving] = useState(false);

<Button
  loading={saving}
  onClick={() => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  }}
>
  Save changes
</Button>
<Button loading>Loading</Button>
<Button disabled>Disabled</Button>`}
      >
        <Row gap={4} wrap>
          <Button
            loading={saving}
            onClick={() => {
              setSaving(true);
              setTimeout(() => setSaving(false), 1500);
            }}
          >
            {t(m.btnDemoSave)}
          </Button>
          <Button loading>{t(m.buttonLoading)}</Button>
          <Button disabled>{t(m.buttonDisabled)}</Button>
        </Row>
      </Example>

      <Example
        title={t(m.btnEx4Title)}
        description={prose(t(m.btnEx4Desc))}
        code={`<Button fullWidth>Create account</Button>
<Button variant={Variant.Soft} fullWidth>
  Sign in instead
</Button>`}
      >
        <Stack gap={4} maxWidth="xs" width="full">
          <Button fullWidth>{t(m.btnDemoCreate)}</Button>
          <Button variant={Variant.Soft} fullWidth>
            {t(m.btnDemoSignIn)}
          </Button>
        </Stack>
      </Example>

      <Example
        title={t(m.btnIconButton)}
        description={prose(t(m.btnEx5Desc))}
        component="IconButton"
        render={(K) => (
          <Row gap={4} wrap>
            <K.IconButton aria-label={t(m.buttonAddItem)}>{plusIcon}</K.IconButton>
            <K.IconButton aria-label={t(m.buttonAddItem)} variant={Variant.Solid}>
              {plusIcon}
            </K.IconButton>
            <K.IconButton aria-label={t(m.buttonAddItem)} variant={Variant.Outline} size={Size.Small}>
              {plusIcon}
            </K.IconButton>
            <K.IconButton aria-label={t(m.buttonAddItem)} variant={Variant.Soft} size={Size.Large}>
              {plusIcon}
            </K.IconButton>
          </Row>
        )}
        code={`import { Plus } from '@glacier/icons';

<IconButton aria-label="Add item"><Plus size={16} /></IconButton>
<IconButton aria-label="Add item" variant={Variant.Solid}><Plus size={16} /></IconButton>
<IconButton aria-label="Add item" variant={Variant.Outline} size={Size.Small}><Plus size={16} /></IconButton>
<IconButton aria-label="Add item" variant={Variant.Soft} size={Size.Large}><Plus size={16} /></IconButton>`}
      />

      <Example
        title={t(m.exSkeleton)}
        description={t(m.btnEx6Desc)}
        code={`<Button skeleton />
<Button skeleton size={Size.Large} />
<Button skeleton fullWidth />
<IconButton skeleton aria-label="Add item" />`}
      >
        <Button skeleton />
        <Button skeleton size={Size.Large} />
        <IconButton skeleton aria-label={t(m.buttonAddItem)} />
      </Example>

      <Heading level={2}>{t(m.secProps)}</Heading>

      <Heading level={3}>{t(m.btnName)}</Heading>
      <PropsTable
        props={[
          {
            name: 'variant',
            type: "'solid' | 'soft' | 'outline' | 'ghost' | 'glass' | 'danger'",
            default: "'solid'",
            description: t(m.btnPropVariant),
          },
          {
            name: 'size',
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: t(m.btnPropSize),
          },
          {
            name: 'loading',
            type: 'boolean',
            default: 'false',
            description: t(m.btnPropLoading),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.btnPropSkeleton),
          },
          {
            name: 'fullWidth',
            type: 'boolean',
            default: 'false',
            description: t(m.btnPropFullWidth),
          },
          {
            name: 'disabled',
            type: 'boolean',
            default: 'false',
            description: t(m.btnPropDisabled),
          },
        ]}
      />

      <Heading level={3}>{t(m.btnIconButton)}</Heading>
      <PropsTable
        props={[
          {
            name: 'aria-label',
            type: 'string',
            description: t(m.btnIbPropAriaLabel),
          },
          {
            name: 'variant',
            type: "'solid' | 'soft' | 'outline' | 'ghost' | 'glass' | 'danger'",
            default: "'ghost'",
            description: t(m.btnIbPropVariant),
          },
          {
            name: 'size',
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: t(m.btnIbPropSize),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.btnPropSkeleton),
          },
          {
            name: 'disabled',
            type: 'boolean',
            default: 'false',
            description: t(m.btnPropDisabled),
          },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.btnA11y1))}</li>
        <li>{prose(t(m.btnA11y2))}</li>
        <li>{prose(t(m.btnA11y3))}</li>
        <li>{prose(t(m.btnA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.btnUse1))}</li>
        <li>{prose(t(m.btnUse2))}</li>
        <li>{prose(t(m.btnUse3))}</li>
        <li>{prose(t(m.btnUse4))}</li>
        <li>{prose(t(m.btnUse5))}</li>
      </ul>
    </>
  );
}
