import { Banner, Box, Button, Stack, Heading, Text, Size, TextTone, Tone, Variant, useT } from '@glacier/react';
import { TriangleAlert } from '@glacier/icons';
import { useState } from 'react';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { m } from '../../i18n.ts';

export function BannerPage() {
  const t = useT();
  const [dismissed, setDismissed] = useState(false);
  return (
    <>
      <Heading level={1}>{t(m.bnName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.bnLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntroBox)}</Text>
      <ComponentBlueprint specId="banner" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.secTones)}
        description={prose(t(m.bnEx1Desc))}
        component="Banner"
        render={(K) => (
          <Stack gap={3} style={{ width: '100%', maxWidth: '38rem' }}>
            <K.Banner tone={Tone.Info}>{t(m.bnDemoNewVersion)}</K.Banner>
            <K.Banner tone={Tone.Neutral}>{t(m.bnDemoReadOnly)}</K.Banner>
            <K.Banner tone={Tone.Accent}>{t(m.bnDemoEarlyAccess)}</K.Banner>
            <K.Banner tone={Tone.Success}>{t(m.bnDemoPublished)}</K.Banner>
            <K.Banner tone={Tone.Warning}>{t(m.bnDemoTrial)}</K.Banner>
            <K.Banner tone={Tone.Danger}>{t(m.bnDemoServer)}</K.Banner>
          </Stack>
        )}
        code={`import { Banner } from '@glacier/react';

<Banner tone={Tone.Info}>A new version is available.</Banner>
<Banner tone={Tone.Neutral}>Read-only mode is on.</Banner>
<Banner tone={Tone.Accent}>You are on the early access plan.</Banner>
<Banner tone={Tone.Success}>Your changes were published.</Banner>
<Banner tone={Tone.Warning}>Your trial ends in three days.</Banner>
<Banner tone={Tone.Danger}>We could not reach the server.</Banner>`}
      />

      <Example
        title={t(m.bnEx2Title)}
        description={prose(t(m.bnEx2Desc))}
        component="Banner"
        render={(K) => (
          <Box style={{ width: '100%', maxWidth: '38rem' }}>
            <K.Banner tone={Tone.Warning} icon={<TriangleAlert size={18} />}>
              {t(m.bnDemoTrial)}
            </K.Banner>
          </Box>
        )}
        code={`<Banner tone={Tone.Warning} icon={<TriangleAlert size={18} />}>
  Your trial ends in three days.
</Banner>`}
      />

      <Example
        title={t(m.bnEx3Title)}
        description={prose(t(m.bnEx3Desc))}
        code={`<Banner tone={Tone.Info} action={<Button size={Size.Small} variant={Variant.Soft}>Update</Button>}>
  A new version is available.
</Banner>`}
      >
        <Box style={{ width: '100%', maxWidth: '38rem' }}>
          <Banner
            tone={Tone.Info}
            action={
              <Button size={Size.Small} variant={Variant.Soft}>
                {t(m.bannerUpdate)}
              </Button>
            }
          >
            {t(m.bnDemoNewVersion)}
          </Banner>
        </Box>
      </Example>

      <Example
        title={t(m.bnEx4Title)}
        description={prose(t(m.bnEx4Desc))}
        code={`const [dismissed, setDismissed] = useState(false);

{!dismissed && (
  <Banner tone={Tone.Success} onDismiss={() => setDismissed(true)}>
    Your changes were published.
  </Banner>
)}`}
      >
        <Box style={{ width: '100%', maxWidth: '38rem', minHeight: '3rem' }}>
          {dismissed ? (
            <Button size={Size.Small} variant={Variant.Ghost} onClick={() => setDismissed(false)}>
              {t(m.bnDemoRestore)}
            </Button>
          ) : (
            <Banner tone={Tone.Success} onDismiss={() => setDismissed(true)}>
              {t(m.bnDemoPublished)}
            </Banner>
          )}
        </Box>
      </Example>

      <Example
        title={t(m.exSkeleton)}
        description={prose(t(m.bnEx5Desc))}
        code={`<Banner skeleton />
<Banner tone={Tone.Info}>Loaded content.</Banner>`}
      >
        <Stack gap={3} style={{ width: '100%', maxWidth: '38rem' }}>
          <Banner skeleton />
          <Banner tone={Tone.Info}>{t(m.bnDemoLoaded)}</Banner>
        </Stack>
      </Example>

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          {
            name: 'tone',
            type: "'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'",
            default: "'info'",
            description: t(m.bnPropTone),
          },
          {
            name: 'icon',
            type: 'ReactNode',
            description: t(m.bnPropIcon),
          },
          {
            name: 'action',
            type: 'ReactNode',
            description: t(m.bnPropAction),
          },
          {
            name: 'onDismiss',
            type: '() => void',
            description: t(m.bnPropOnDismiss),
          },
          {
            name: 'children',
            type: 'ReactNode',
            description: t(m.bnPropChildren),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.bnPropSkeleton),
          },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.bnA11y1))}</li>
        <li>{prose(t(m.bnA11y2))}</li>
        <li>{prose(t(m.bnA11y3))}</li>
        <li>{prose(t(m.bnA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.bnUse1))}</li>
        <li>{prose(t(m.bnUse2))}</li>
        <li>{prose(t(m.bnUse3))}</li>
      </ul>
    </>
  );
}
