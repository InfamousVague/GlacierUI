import { Box, Callout, Stack, Heading, Text, Size, TextTone, Tone, useT } from '@glacier/react';
import { Lightbulb } from '@glacier/icons';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { m } from '../../i18n.ts';

export function CalloutPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.coName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.coLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntroBox)}</Text>
      <ComponentBlueprint specId="callout" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.secTones)}
        description={prose(t(m.coEx1Desc))}
        component="Callout"
        render={(K) => (
          <Stack gap={4} style={{ width: '100%', maxWidth: '34rem' }}>
            <K.Callout title={t(m.calloutNote)}>{t(m.coDemoNoteBody)}</K.Callout>
            <K.Callout tone={Tone.Info} title={t(m.calloutInfo)}>
              {t(m.coDemoInfoBody)}
            </K.Callout>
            <K.Callout tone={Tone.Success} title={t(m.calloutSuccess)}>
              {t(m.coDemoSuccessBody)}
            </K.Callout>
            <K.Callout tone={Tone.Warning} title={t(m.calloutWarning)}>
              {t(m.coDemoWarningBody)}
            </K.Callout>
            <K.Callout tone={Tone.Danger} title={t(m.calloutDanger)}>
              {t(m.coDemoDangerBody)}
            </K.Callout>
          </Stack>
        )}
        code={`import { Callout } from '@glacier/react';

<Callout title="Note">A neutral aside on the default surface.</Callout>
<Callout tone={Tone.Info} title="Info">Extra context that is good to know.</Callout>
<Callout tone={Tone.Success} title="Success">Your changes were saved.</Callout>
<Callout tone={Tone.Warning} title="Warning">This will overwrite existing data.</Callout>
<Callout tone={Tone.Danger} title="Danger">This action cannot be undone.</Callout>`}
      />

      <Example
        title={t(m.coEx2Title)}
        description={prose(t(m.coEx2Desc))}
        component="Callout"
        render={(K) => (
          <Box style={{ width: '100%', maxWidth: '34rem' }}>
            <K.Callout tone={Tone.Info} title={t(m.coDemoShortcutTitle)} icon={<Lightbulb size={18} />}>
              {t(m.coDemoShortcutBody)}
            </K.Callout>
          </Box>
        )}
        code={`<Callout tone={Tone.Info} title="Keyboard shortcut" icon={<Lightbulb size={18} />}>
  Press <kbd>⌘K</kbd> anywhere to open the command palette.
</Callout>`}
      />

      <Example
        title={t(m.coEx3Title)}
        description={t(m.coEx3Desc)}
        component="Callout"
        render={(K) => (
          <Box style={{ width: '100%', maxWidth: '34rem' }}>
            <K.Callout tone={Tone.Success}>{t(m.coDemoUpToDate)}</K.Callout>
          </Box>
        )}
        code={`<Callout tone={Tone.Success}>Everything is up to date.</Callout>`}
      />

      <Example
        title={t(m.exSkeleton)}
        description={prose(t(m.coEx4Desc))}
        component="Callout"
        render={(K) => (
          <Stack gap={4} style={{ width: '100%', maxWidth: '34rem' }}>
            <K.Callout skeleton />
            <K.Callout tone={Tone.Info} title={t(m.calloutInfo)}>
              {t(m.coDemoLoaded)}
            </K.Callout>
          </Stack>
        )}
        code={`<Callout skeleton />
<Callout tone={Tone.Info} title="Info">Loaded content.</Callout>`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          {
            name: 'tone',
            type: "'note' | 'info' | 'success' | 'warning' | 'danger'",
            default: "'note'",
            description: t(m.coPropTone),
          },
          {
            name: 'title',
            type: 'ReactNode',
            description: t(m.coPropTitle),
          },
          {
            name: 'icon',
            type: 'ReactNode',
            description: t(m.coPropIcon),
          },
          {
            name: 'children',
            type: 'ReactNode',
            description: t(m.coPropChildren),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.coPropSkeleton),
          },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.coA11y1))}</li>
        <li>{prose(t(m.coA11y2))}</li>
        <li>{prose(t(m.coA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.coUse1))}</li>
        <li>{prose(t(m.coUse2))}</li>
        <li>{prose(t(m.coUse3))}</li>
      </ul>
    </>
  );
}
