import { Button, Divider, Row, Stack, Text, Heading, Size, TextTone, Variant, useT } from '@glacier/react';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { m } from '../../i18n.ts';

export function DividerPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.divName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.divLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntroBox)}</Text>
      <ComponentBlueprint specId="divider" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.divEx1Title)}
        description={prose(t(m.divEx1Desc))}
        component="Divider"
        render={(K) => (
          <Stack gap={4} style={{ maxWidth: 420, width: '100%' }}>
            <Text>{t(m.divDemoTokens)}</Text>
            <K.Divider />
            <Text tone={TextTone.Muted}>{t(m.divDemoOverride)}</Text>
          </Stack>
        )}
        code={`import { Divider } from '@glacier/react';

<Text>Tokens are generated from the OKLCH ramps at build time.</Text>
<Divider />
<Text tone={TextTone.Muted}>Override any token per theme with a CSS custom property.</Text>`}
      />

      <Example
        title={t(m.divEx2Title)}
        description={prose(t(m.divEx2Desc))}
        code={`<Stack gap={4} style={{ maxWidth: 280 }}>
  <Button fullWidth>Create account</Button>
  <Divider label="or" />
  <Button variant={Variant.Soft} fullWidth>Sign in</Button>
</Stack>`}
      >
        <Stack gap={4} style={{ maxWidth: 280, width: '100%' }}>
          <Button fullWidth>{t(m.divDemoCreate)}</Button>
          <Divider label={t(m.dividerOr)} />
          <Button variant={Variant.Soft} fullWidth>
            {t(m.divDemoSignIn)}
          </Button>
        </Stack>
      </Example>

      <Example
        title={t(m.divEx3Title)}
        description={prose(t(m.divEx3Desc))}
        component="Divider"
        render={(K) => (
          <Row gap={4} wrap>
            <Text as="span" size={Size.Small}>
              {t(m.dividerDocs)}
            </Text>
            <K.Divider orientation="vertical" />
            <Text as="span" size={Size.Small}>
              {t(m.dividerChangelog)}
            </Text>
            <K.Divider orientation="vertical" />
            <Text as="span" size={Size.Small}>
              {t(m.dividerSupport)}
            </Text>
          </Row>
        )}
        code={`<Row gap={4}>
  <Text as="span" size={Size.Small}>Docs</Text>
  <Divider orientation="vertical" />
  <Text as="span" size={Size.Small}>Changelog</Text>
  <Divider orientation="vertical" />
  <Text as="span" size={Size.Small}>Support</Text>
</Row>`}
      />

      <Example
        title={t(m.exSkeleton)}
        description={t(m.divEx4Desc)}
        code={`<Divider skeleton />`}
      >
        <Stack gap={4} style={{ maxWidth: 420, width: '100%' }}>
          <Text>{t(m.divDemoLoading)}</Text>
          <Divider skeleton />
          <Text tone={TextTone.Muted}>{t(m.divDemoMore)}</Text>
        </Stack>
      </Example>

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          {
            name: 'orientation',
            type: "'horizontal' | 'vertical'",
            default: "'horizontal'",
            description: t(m.divPropOrientation),
          },
          {
            name: 'label',
            type: 'ReactNode',
            description: t(m.divPropLabel),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.divPropSkeleton),
          },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.divA11y1))}</li>
        <li>{prose(t(m.divA11y2))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.divUse1))}</li>
        <li>{prose(t(m.divUse2))}</li>
        <li>{prose(t(m.divUse3))}</li>
      </ul>
    </>
  );
}
