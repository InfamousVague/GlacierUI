import { Box, Button, IconButton, SearchField, Text, TitleBar, Heading, Size, TextTone, Variant, useT } from '@glacier/react';
import { PanelLeft, Share } from '@glacier/icons';
import type { ReactNode } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

const panelIcon = <PanelLeft size={16} />;
const shareIcon = <Share size={16} />;

// A mock desktop window so each example reads as the strip at the very top of
// a Tauri or Electron window, sitting over a pane of content.
function Window({ children, trafficLights = false }: { children: ReactNode; trafficLights?: boolean }) {
  const line = (width: string) => (
    <div
      style={{
        width,
        height: '0.6rem',
        borderRadius: 'var(--glacier-radius-full)',
        background: 'var(--glacier-surface-sunken)',
      }}
    />
  );
  const dot = (color: string) => (
    <span
      style={{
        width: '12px',
        height: '12px',
        borderRadius: 'var(--glacier-radius-full)',
        background: color,
      }}
    />
  );
  return (
    <Box border radius="lg" width="full" style={{ overflow: 'hidden', position: 'relative' }}>
      {trafficLights && (
        // Stands in for the macOS window controls the OS paints over an
        // overlay title bar; the real buttons are not DOM at all.
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            insetInlineStart: '20px',
            insetBlockStart: 0,
            height: '3.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 1,
          }}
        >
          {dot('var(--glacier-danger-solid)')}
          {dot('var(--glacier-warning-solid)')}
          {dot('var(--glacier-success-solid)')}
        </div>
      )}
      {children}
      <div
        aria-hidden="true"
        style={{
          padding: 'var(--glacier-space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--glacier-space-4)',
        }}
      >
        {line('38%')}
        {line('86%')}
        {line('72%')}
      </div>
    </Box>
  );
}

export function TitleBarPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.tbName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.tbLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.tbAnatomyIntro)}</Text>
      <ComponentBlueprint specId="title-bar" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.tbEx1Title)}
        description={t(m.tbEx1Desc)}
        component="TitleBar"
        render={(K) => (
          <Window>
            <K.TitleBar title={t(m.titlebarUntitledMd)} />
          </Window>
        )}
        code={`import { TitleBar } from '@glacier/react';

<TitleBar title="Untitled.md" />`}
      />

      <Example
        title={t(m.tbEx2Title)}
        description={t(m.tbEx2Desc)}
        code={`import { PanelLeft, Share } from '@glacier/icons';

<TitleBar
  trafficLightInset
  title="Quarterly notes"
  start={<IconButton variant={Variant.Ghost} aria-label="Toggle sidebar"><PanelLeft size={16} /></IconButton>}
  end={<Button size={Size.Small} variant={Variant.Soft}>Share</Button>}
/>`}
      >
        <Window trafficLights>
          <TitleBar
            trafficLightInset
            title={t(m.titlebarQuarterlyNotes)}
            start={
              <IconButton variant={Variant.Ghost} aria-label={t(m.tbAriaToggleSidebar)}>
                {panelIcon}
              </IconButton>
            }
            end={
              <Button size={Size.Small} variant={Variant.Soft}>
                {t(m.titlebarShare)}
              </Button>
            }
          />
        </Window>
      </Example>

      <Example
        title={t(m.tbEx3Title)}
        description={t(m.tbEx3Desc)}
        code={`<TitleBar
  trafficLightInset
  end={<IconButton variant={Variant.Ghost} aria-label="Share"><Share size={16} /></IconButton>}
>
  <SearchField size={Size.Small} aria-label="Search library" style={{ width: '18rem' }} />
</TitleBar>`}
      >
        <Window trafficLights>
          <TitleBar
            trafficLightInset
            end={
              <IconButton variant={Variant.Ghost} aria-label={t(m.tbAriaShare)}>
                {shareIcon}
              </IconButton>
            }
          >
            <SearchField size={Size.Small} aria-label={t(m.tbAriaSearchLibrary)} style={{ width: '18rem' }} />
          </TitleBar>
        </Window>
      </Example>

      <Example
        title={t(m.exSkeleton)}
        description={t(m.tbEx4Desc)}
        component="TitleBar"
        render={(K) => (
          <Window trafficLights>
            <K.TitleBar skeleton trafficLightInset />
          </Window>
        )}
        code={`<TitleBar skeleton trafficLightInset />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          {
            name: 'title',
            type: 'ReactNode',
            description: t(m.tbPropTitle),
          },
          {
            name: 'start',
            type: 'ReactNode',
            description: t(m.tbPropStart),
          },
          {
            name: 'end',
            type: 'ReactNode',
            description: t(m.tbPropEnd),
          },
          {
            name: 'children',
            type: 'ReactNode',
            description: t(m.tbPropChildren),
          },
          {
            name: 'trafficLightInset',
            type: 'boolean',
            default: 'false',
            description: t(m.tbPropTrafficLightInset),
          },
          {
            name: 'surface',
            type: 'boolean',
            default: 'true',
            description: t(m.tbPropSurface),
          },
          {
            name: 'border',
            type: 'boolean',
            default: 'true',
            description: t(m.tbPropBorder),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.tbPropSkeleton),
          },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.tbA11y1))}</li>
        <li>{prose(t(m.tbA11y2))}</li>
        <li>{prose(t(m.tbA11y3))}</li>
        <li>{prose(t(m.tbA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.tbUse1))}</li>
        <li>{prose(t(m.tbUse2))}</li>
        <li>{prose(t(m.tbUse3))}</li>
        <li>{prose(t(m.tbUse4))}</li>
      </ul>
    </>
  );
}
