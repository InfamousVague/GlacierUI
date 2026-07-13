import { Card, Row, Stack, Surface, Heading, Text, Size, TextTone, Variant, useT } from '@glacier/react';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { m } from '../../i18n.ts';

const label: React.CSSProperties = {
  display: 'block',
  marginTop: '0.5rem',
  textAlign: 'center',
};

export function SurfacesPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.surfName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.surfLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.surfAnatomyIntro)}</Text>
      <ComponentBlueprint specId="card" />
      <ComponentBlueprint specId="surface" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.surfEx1Title)}
        description={t(m.surfEx1Desc)}
        component="Card"
        render={(K) => (
          <Row gap={4} wrap>
            {([0, 1, 2, 3] as const).map((level) => (
              <div key={level}>
                <K.Card elevation={level} style={{ width: '9rem', padding: '1.25rem' }}>
                  {t(m.surfacesContent)}
                </K.Card>
                <code style={label}>elevation={level}</code>
              </div>
            ))}
          </Row>
        )}
        code={`import { Card } from '@glacier/react';

<Row gap={4}>
  <Card elevation={0}>Elevation 0</Card>
  <Card elevation={1}>Elevation 1</Card>
  <Card elevation={2}>Elevation 2</Card>
  <Card elevation={3}>Elevation 3</Card>
</Row>`}
      />

      <Example
        title={t(m.surfEx2Title)}
        description={t(m.surfEx2Desc)}
        code={`<Card interactive elevation={1} onClick={() => console.log('open')}>
  <strong>Quarterly report</strong>
  <p>Updated 2 hours ago</p>
</Card>`}
      >
        <Card
          interactive
          elevation={1}
          style={{ width: '16rem', padding: '1.25rem', cursor: 'pointer' }}
        >
          <strong>{t(m.surfacesQuarterlyReport)}</strong>
          <Text style={{ margin: '0.25rem 0 0', color: 'var(--glacier-text-secondary)' }}>
            {t(m.surfacesUpdated2HoursAgo)}
          </Text>
        </Card>
      </Example>

      <Example
        title={t(m.exGlass)}
        description={t(m.surfEx3Desc)}
        code={`<div style={{ position: 'relative' }}>
  <img src="/artwork.jpg" alt="" />
  <Card variant={Variant.Glass} elevation={2} style={{ position: 'absolute', inset: '2rem' }}>
    Now playing
  </Card>
</div>`}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '24rem',
            height: '11rem',
            borderRadius: 'var(--glacier-radius-lg)',
            overflow: 'hidden',
            background:
              'radial-gradient(circle at 20% 30%, oklch(0.7 0.19 300), transparent 55%), radial-gradient(circle at 80% 20%, oklch(0.75 0.17 200), transparent 55%), radial-gradient(circle at 60% 90%, oklch(0.72 0.18 25), transparent 55%), var(--glacier-surface)',
          }}
        >
          <Card
            variant={Variant.Glass}
            elevation={2}
            style={{
              position: 'absolute',
              inset: '1.75rem',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            {t(m.surfacesNowPlaying)}
          </Card>
        </div>
      </Example>

      <Example
        title={t(m.surfEx4Title)}
        description={t(m.surfEx4Desc)}
        component="Surface"
        render={(K) => (
          <Stack gap={4} style={{ width: '100%', maxWidth: '22rem' }}>
            {([0, 1, 2, 'sunken'] as const).map((level) => (
              <K.Surface
                key={String(level)}
                level={level}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--glacier-radius-md)',
                  border: 'var(--glacier-hairline) solid var(--glacier-border-subtle)',
                }}
              >
                <code>level={typeof level === 'string' ? `"${level}"` : `{${level}}`}</code>
              </K.Surface>
            ))}
          </Stack>
        )}
        code={`import { Surface } from '@glacier/react';

<Surface level={0}>App background</Surface>
<Surface level={1}>Surface</Surface>
<Surface level={2}>Raised</Surface>
<Surface level="sunken">Sunken well</Surface>`}
      />

      <Example
        title={t(m.exSkeleton)}
        description={t(m.surfEx5Desc)}
        code={`<Card skeleton elevation={1} />
<Card elevation={1}>
  <strong>Quarterly report</strong>
  <p>Updated 2 hours ago</p>
</Card>
<Surface skeleton />`}
      >
        <Row gap={4} align="stretch">
          <div style={{ width: '16rem' }}>
            <Card skeleton elevation={1} />
          </div>
          <Card elevation={1} style={{ width: '16rem' }}>
            <strong>{t(m.surfacesQuarterlyReport)}</strong>
            <Text style={{ margin: '0.25rem 0 0', color: 'var(--glacier-text-secondary)' }}>
              {t(m.surfacesUpdated2HoursAgo)}
            </Text>
          </Card>
        </Row>
        <div style={{ width: '100%', maxWidth: '22rem' }}>
          <Surface skeleton />
        </div>
      </Example>

      <Heading level={2}>{t(m.secProps)}</Heading>

      <Heading level={3}>{t(m.surfSubCard)}</Heading>
      <PropsTable
        props={[
          {
            name: 'elevation',
            type: '0 | 1 | 2 | 3 | 4 | 5',
            default: '1',
            description: t(m.surfPropElevation),
          },
          {
            name: 'interactive',
            type: 'boolean',
            default: 'false',
            description: t(m.surfPropInteractive),
          },
          {
            name: 'variant',
            type: "'solid' | 'glass'",
            default: "'solid'",
            description: t(m.surfPropVariant),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.surfPropSkeletonCard),
          },
          {
            name: 'children',
            type: 'ReactNode',
            description: t(m.surfPropChildrenCard),
          },
        ]}
      />

      <Heading level={3}>{t(m.surfSubSurface)}</Heading>
      <PropsTable
        props={[
          {
            name: 'level',
            type: "0 | 1 | 2 | 'sunken'",
            default: '1',
            description: t(m.surfPropLevel),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.surfPropSkeletonSurface),
          },
          {
            name: '...div props',
            type: "ComponentProps<'div'>",
            description: t(m.surfPropDivProps),
          },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.surfA11y1))}</li>
        <li>{prose(t(m.surfA11y2))}</li>
        <li>{prose(t(m.surfA11y3))}</li>
        <li>{prose(t(m.surfA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.surfUse1))}</li>
        <li>{prose(t(m.surfUse2))}</li>
        <li>{prose(t(m.surfUse3))}</li>
        <li>{prose(t(m.surfUse4))}</li>
        <li>{prose(t(m.surfUse5))}</li>
        <li>{prose(t(m.surfUse6))}</li>
      </ul>
    </>
  );
}
