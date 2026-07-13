import { DeviceFrame, Heading, Text, Size, TextTone, useT } from '@glacier/react';
import type { CSSProperties } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

const previewStyle: CSSProperties = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  padding: '1.5rem',
  textAlign: 'center',
  background: 'linear-gradient(160deg, var(--glacier-accent-soft), var(--glacier-surface))',
  color: 'var(--glacier-text)',
  fontFamily: 'var(--glacier-font-sans)',
};

function DemoScreen({ label }: { label: string }) {
  const t = useT();
  return (
    <div style={previewStyle}>
      <strong style={{ fontSize: 'var(--glacier-font-size-lg)' }}>{label}</strong>
      <span style={{ color: 'var(--glacier-text-muted)', fontSize: 'var(--glacier-font-size-sm)' }}>
        {t(m.dfrPreviewHere)}
      </span>
    </div>
  );
}

export function DeviceFramePage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.dfrName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.dfrLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntro)}</Text>
      <ComponentBlueprint specId="device-frame" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.dfrEx1Desc)}
        component="DeviceFrame"
        render={(K) => (
          <K.DeviceFrame aria-label={t(m.dfrAriaAppPreview)}>
            <DemoScreen label={t(m.deviceframeHome)} />
          </K.DeviceFrame>
        )}
        code={`import { DeviceFrame } from '@glacier/react';

<DeviceFrame aria-label="App preview">
  <MyPreview />
</DeviceFrame>`}
      />

      <Example
        title={t(m.secSizes)}
        description={t(m.dfrEx2Desc)}
        component="DeviceFrame"
        render={(K) => (
          <>
            <K.DeviceFrame size={Size.Small} aria-label={t(m.deviceframeSmall)}>
              <DemoScreen label={t(m.deviceframeSm)} />
            </K.DeviceFrame>
            <K.DeviceFrame size={Size.Medium} aria-label={t(m.deviceframeMedium)}>
              <DemoScreen label={t(m.deviceframeMd)} />
            </K.DeviceFrame>
            <K.DeviceFrame size={Size.Large} aria-label={t(m.deviceframeLarge)}>
              <DemoScreen label={t(m.deviceframeLg)} />
            </K.DeviceFrame>
          </>
        )}
        code={`<DeviceFrame size={Size.Small}>…</DeviceFrame>
<DeviceFrame size={Size.Medium}>…</DeviceFrame>
<DeviceFrame size={Size.Large}>…</DeviceFrame>`}
      />

      <Example
        title={t(m.dfrEx3Title)}
        description={t(m.dfrEx3Desc)}
        component="DeviceFrame"
        render={(K) => (
          <K.DeviceFrame width={240} aspect="3 / 4" aria-label={t(m.dfrAriaTablet)}>
            <DemoScreen label="3 / 4" />
          </K.DeviceFrame>
        )}
        code={`<DeviceFrame width={240} aspect="3 / 4">…</DeviceFrame>`}
      />

      <Example
        title={t(m.dfrEx4Title)}
        description={t(m.dfrEx4Desc)}
        component="DeviceFrame"
        render={(K) => (
          <K.DeviceFrame hideNotch aria-label={t(m.dfrAriaFullBleed)}>
            <DemoScreen label={t(m.deviceframeFullBleed)} />
          </K.DeviceFrame>
        )}
        code={`<DeviceFrame hideNotch>…</DeviceFrame>`}
      />

      <Example
        title={t(m.dfrEx5Title)}
        description={t(m.dfrEx5Desc)}
        component="DeviceFrame"
        render={(K) => (
          <K.DeviceFrame aria-label={t(m.dfrAriaLiveSite)}>
            <DemoScreen label={t(m.deviceframeIframe)} />
          </K.DeviceFrame>
        )}
        code={`<DeviceFrame aria-label="Live site">
  <iframe title="Example site" src="https://example.com" />
</DeviceFrame>`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t(m.dfrPropSize) },
          { name: 'width', type: 'string | number', description: t(m.dfrPropWidth) },
          { name: 'aspect', type: 'string | number', default: "'9 / 19.5'", description: t(m.dfrPropAspect) },
          { name: 'hideNotch', type: 'boolean', default: 'false', description: t(m.dfrPropHideNotch) },
          { name: 'aria-label', type: 'string', description: t(m.dfrPropAriaLabel) },
          { name: 'children', type: 'ReactNode', description: t(m.dfrPropChildren) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.dfrA11y1))}</li>
        <li>{prose(t(m.dfrA11y2))}</li>
        <li>{prose(t(m.dfrA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.dfrUse1))}</li>
        <li>{prose(t(m.dfrUse2))}</li>
        <li>{prose(t(m.dfrUse3))}</li>
      </ul>
    </>
  );
}
