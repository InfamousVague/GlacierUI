import { radii, SCALED_RADII, type RadiusStep } from '@glacier/tokens';
import { Slider, Text, Row, Heading, Size, TextTone, useT } from '@glacier/react';
import { useState } from 'react';
import { prose } from '../../docs-ui.tsx';
import { m } from '../../i18n.ts';

const ELEVATIONS = [0, 1, 2, 3, 4, 5];

export function ShapePage() {
  const t = useT();
  const [scale, setScale] = useState(1);

  return (
    <>
      <Heading level={1}>{t(m.shpName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.shpLede))}
      </Text>

      <Heading level={2}>{t(m.shpSecRadius)}</Heading>
      <Row gap={4} wrap style={{ marginBottom: 'var(--glacier-space-5)' }}>
        <Text as="span" size={Size.Small} tone={TextTone.Muted}>
          {t(m.shapeRadiusScale)}
        </Text>
        <Text as="span" size={Size.Small} weight="semibold" mono>
          {scale.toFixed(2)}
        </Text>
        <div style={{ width: '14rem' }}>
          <Slider
            aria-label={t(m.shpRadiusSliderLabel)}
            min={0}
            max={2}
            step={0.05}
            value={scale}
            onValueChange={setScale}
          />
        </div>
      </Row>
      <Text tone={TextTone.Muted}>{t(m.shpRadiusHint)}</Text>
      <Row gap={4} wrap>
        {(Object.keys(radii) as RadiusStep[]).map((name) => (
          <div key={name} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '5rem',
                height: '5rem',
                background: 'var(--glacier-accent-soft)',
                border: 'var(--glacier-hairline) solid var(--glacier-accent-border)',
                // radius tokens resolve their scale at :root, so the preview
                // multiplies the raw step values locally instead
                borderRadius: SCALED_RADII.includes(name)
                  ? `calc(${radii[name]} * ${scale})`
                  : radii[name],
              }}
            />
            <code>{name}</code>
          </div>
        ))}
        <div style={{ textAlign: 'center' }}>
          <div
            className="squircle"
            style={{
              width: '5rem',
              height: '5rem',
              background: 'var(--glacier-accent-soft)',
              border: 'var(--glacier-hairline) solid var(--glacier-accent-border)',
              borderRadius: `calc(${radii['2xl']} * ${scale})`,
            }}
          />
          <code>squircle</code>
        </div>
      </Row>
      <Text tone={TextTone.Muted}>{prose(t(m.shpSquircleDesc))}</Text>

      <Heading level={2}>{t(m.shpSecElevation)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.shpElevationDesc)}</Text>
      <Row gap={4} wrap>
        {ELEVATIONS.map((level) => (
          <div
            key={level}
            style={{
              width: '8rem',
              height: '6rem',
              display: 'grid',
              placeItems: 'center',
              background: 'var(--glacier-surface-raised)',
              border: 'var(--glacier-hairline) solid var(--glacier-border-subtle)',
              borderRadius: 'var(--glacier-radius-lg)',
              boxShadow: `var(--glacier-shadow-${level})`,
            }}
          >
            <code>shadow-{level}</code>
          </div>
        ))}
      </Row>
    </>
  );
}
