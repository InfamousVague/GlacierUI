import { Text, Heading, Label, Link, Kbd, Input, Stack, Size, TextTone, useT } from '@glacier/react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

export function TextPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.txtName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.txtLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.txtAnatomyIntro)}</Text>
      <ComponentBlueprint specId="text" />
      <ComponentBlueprint specId="heading" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.txtEx1Title)}
        description={prose(t(m.txtEx1Desc))}
        component="Text"
        render={(K) => (
          <Stack gap={4}>
            <K.Text size={Size.Large}>{t(m.textLargeBodyTextForIntros)}</K.Text>
            <K.Text>{t(m.textDefaultBodyTextAtThe)}</K.Text>
            <K.Text size={Size.Small} tone={TextTone.Muted}>
              {t(m.textSmallMutedTextForSecondary)}
            </K.Text>
            <K.Text size={Size.XSmall} tone={TextTone.Subtle}>
              {t(m.textExtraSmallSubtleTextFor)}
            </K.Text>
            <K.Text tone={TextTone.Accent}>{t(m.textAccentToneForEmphasis)}</K.Text>
            <K.Text tone={TextTone.Danger}>{t(m.textDangerToneForErrors)}</K.Text>
            <K.Text tone={TextTone.Success}>{t(m.textSuccessToneForConfirmations)}</K.Text>
            <K.Text tone={TextTone.Warning}>{t(m.textWarningToneForCautions)}</K.Text>
          </Stack>
        )}
        code={`import { Text, Heading, Label, Link, Kbd, Input } from '@glacier/react';

<Text size={Size.Large}>Large body text for intros.</Text>
<Text>Default body text at the base size.</Text>
<Text size={Size.Small} tone={TextTone.Muted}>Small muted text for secondary copy.</Text>
<Text size={Size.XSmall} tone={TextTone.Subtle}>Extra small subtle text for fine print.</Text>
<Text tone={TextTone.Accent}>Accent tone for emphasis.</Text>
<Text tone={TextTone.Danger}>Danger tone for errors.</Text>
<Text tone={TextTone.Success}>Success tone for confirmations.</Text>
<Text tone={TextTone.Warning}>Warning tone for cautions.</Text>`}
      />

      <Example
        title={t(m.txtEx2Title)}
        description={prose(t(m.txtEx2Desc))}
        code={`<Text weight="regular">Regular is the default weight.</Text>
<Text weight="medium">Medium adds gentle emphasis.</Text>
<Text weight="semibold">Semibold suits inline labels.</Text>
<Text as="strong" weight="bold">Bold renders a strong element here.</Text>`}
      >
        <Stack gap={4}>
          <Text weight="regular">{t(m.textRegularIsTheDefaultWeight)}</Text>
          <Text weight="medium">{t(m.textMediumAddsGentleEmphasis)}</Text>
          <Text weight="semibold">{t(m.textSemiboldSuitsInlineLabels)}</Text>
          <Text as="strong" weight="bold">
            {t(m.textBoldRendersAStrongElement)}
          </Text>
        </Stack>
      </Example>

      <Example
        title={t(m.txtEx3Title)}
        description={prose(t(m.txtEx3Desc))}
        component="Heading"
        render={(K) => (
          <Stack gap={4}>
            <K.Heading level={1}>{t(m.textHeadingOne)}</K.Heading>
            <K.Heading level={2}>{t(m.textHeadingTwo)}</K.Heading>
            <K.Heading level={3}>{t(m.textHeadingThree)}</K.Heading>
            <K.Heading level={4}>{t(m.textHeadingFour)}</K.Heading>
            <K.Heading level={5}>{t(m.textHeadingFive)}</K.Heading>
            <K.Heading level={6}>{t(m.textHeadingSixEyebrow)}</K.Heading>
          </Stack>
        )}
        code={`<Heading level={1}>Heading one</Heading>
<Heading level={2}>Heading two</Heading>
<Heading level={3}>Heading three</Heading>
<Heading level={4}>Heading four</Heading>
<Heading level={5}>Heading five</Heading>
<Heading level={6}>Heading six eyebrow</Heading>`}
      />

      <Example
        title={t(m.txtEx4Title)}
        description={prose(t(m.txtEx4Desc))}
        component="Heading"
        render={(K) => (
          <Stack gap={4}>
            <K.Heading level={3} visualLevel={1}>
              {t(m.textAnH3ThatDisplaysAt)}
            </K.Heading>
            <K.Heading level={3} visualLevel={6}>
              {t(m.textAnH3StyledAsAn)}
            </K.Heading>
          </Stack>
        )}
        code={`<Heading level={3} visualLevel={1}>
  An h3 that displays at h1 size
</Heading>
<Heading level={3} visualLevel={6}>
  An h3 styled as an eyebrow
</Heading>`}
      />

      <Example
        title={t(m.txtEx5Title)}
        description={prose(t(m.txtEx5Desc))}
        code={`<Label htmlFor="email" required>
  Email address
</Label>
<Input id="email" type="email" placeholder="you@example.com" />`}
      >
        <Stack gap={4} maxWidth="xs" width="full">
          <Label htmlFor="email" required>
            {t(m.textEmailAddress)}
          </Label>
          <Input id="email" type="email" placeholder={t(m.textYouExampleCom)} />
        </Stack>
      </Example>

      <Example
        title={t(m.txtEx6Title)}
        description={prose(t(m.txtEx6Desc))}
        code={`<Text>
  Read the <Link href="#">release notes</Link>, then press{' '}
  <Kbd>Cmd</Kbd> <Kbd>K</Kbd> to open the command palette.
</Text>
<Text size={Size.Small} tone={TextTone.Muted}>
  Undo with <Kbd>Cmd</Kbd> <Kbd>Z</Kbd> at any time.
</Text>`}
      >
        <Stack gap={4}>
          <Text>
            {t(m.textReadThe)} <Link href="#">{t(m.textReleaseNotes)}</Link>{t(m.textThenPress)} <Kbd>Cmd</Kbd> <Kbd>K</Kbd> {t(m.textToOpenTheCommandPalette)}
          </Text>
          <Text size={Size.Small} tone={TextTone.Muted}>
            {t(m.textUndoWith)} <Kbd>Cmd</Kbd> <Kbd>Z</Kbd> {t(m.textAtAnyTime)}
          </Text>
        </Stack>
      </Example>

      <Example
        title={t(m.exSkeleton)}
        description={prose(t(m.txtEx7Desc))}
        code={`<Heading level={3} skeleton />
<Heading level={3}>Release notes</Heading>
<Text skeleton />
<Text>Default body text at the base size.</Text>
<Label skeleton />
<Label>Email address</Label>
<Text>
  Press <Kbd skeleton /> or read the <Link skeleton />.
</Text>`}
      >
        <Stack gap={4}>
          <Heading level={3} skeleton />
          <Heading level={3}>{t(m.textReleaseNotes2)}</Heading>
          <Text skeleton />
          <Text>{t(m.textDefaultBodyTextAtThe)}</Text>
          <Label skeleton />
          <Label>{t(m.textEmailAddress)}</Label>
          <Text>
            {t(m.textPress)} <Kbd skeleton /> {t(m.textOrReadThe)} <Link skeleton />.
          </Text>
        </Stack>
      </Example>

      <Heading level={2}>{t(m.secProps)}</Heading>

      <Heading level={3}>{t(m.txtSubText)}</Heading>
      <PropsTable
        props={[
          {
            name: 'as',
            type: "'p' | 'span' | 'div' | 'strong' | 'em' | 'small'",
            default: "'p'",
            description: t(m.txtPropAs),
          },
          {
            name: 'size',
            type: "'xs' | 'sm' | 'md' | 'lg'",
            default: "'md'",
            description: t(m.txtPropSize),
          },
          {
            name: 'tone',
            type: "'default' | 'muted' | 'subtle' | 'accent' | 'danger' | 'success' | 'warning'",
            default: "'default'",
            description: t(m.txtPropTone),
          },
          {
            name: 'weight',
            type: "'regular' | 'medium' | 'semibold' | 'bold'",
            default: "'regular'",
            description: t(m.txtPropWeight),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.txtPropSkeleton),
          },
          {
            name: 'native props',
            type: "ComponentProps<'p'>",
            description: t(m.txtPropNative),
          },
        ]}
      />

      <Heading level={3}>{t(m.txtSubHeading)}</Heading>
      <PropsTable
        props={[
          {
            name: 'level',
            type: '1 | 2 | 3 | 4 | 5 | 6',
            default: '2',
            description: t(m.txtPropLevel),
          },
          {
            name: 'visualLevel',
            type: '1 | 2 | 3 | 4 | 5 | 6',
            description: t(m.txtPropVisualLevel),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.txtPropHeadingSkeleton),
          },
          {
            name: 'native props',
            type: "ComponentProps<'h2'>",
            description: t(m.txtPropHeadingNative),
          },
        ]}
      />

      <Heading level={3}>{t(m.txtSubLabel)}</Heading>
      <PropsTable
        props={[
          {
            name: 'required',
            type: 'boolean',
            default: 'false',
            description: t(m.txtPropRequired),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.txtPropLabelSkeleton),
          },
          {
            name: 'native props',
            type: "ComponentProps<'label'>",
            description: t(m.txtPropLabelNative),
          },
        ]}
      />

      <Heading level={3}>{t(m.txtSubLink)}</Heading>
      <PropsTable
        props={[
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.txtPropLinkSkeleton),
          },
          {
            name: 'native props',
            type: "ComponentProps<'a'>",
            description: t(m.txtPropLinkNative),
          },
        ]}
      />

      <Heading level={3}>{t(m.txtSubKbd)}</Heading>
      <PropsTable
        props={[
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.txtPropKbdSkeleton),
          },
          {
            name: 'native props',
            type: "ComponentProps<'kbd'>",
            description: t(m.txtPropKbdNative),
          },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.txtA11y1))}</li>
        <li>{prose(t(m.txtA11y2))}</li>
        <li>{prose(t(m.txtA11y3))}</li>
        <li>{prose(t(m.txtA11y4))}</li>
        <li>{prose(t(m.txtA11y5))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.txtUse1))}</li>
        <li>{prose(t(m.txtUse2))}</li>
        <li>{prose(t(m.txtUse3))}</li>
        <li>{prose(t(m.txtUse4))}</li>
        <li>{prose(t(m.txtUse5))}</li>
      </ul>
    </>
  );
}
