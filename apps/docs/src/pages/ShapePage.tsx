import { radii, SCALED_RADII, type RadiusStep } from '@perfect/tokens';
import { Slider, Text, Row } from '@perfect/react';
import { useState } from 'react';

const ELEVATIONS = [0, 1, 2, 3, 4, 5];

export function ShapePage() {
  const [scale, setScale] = useState(1);

  return (
    <>
      <h1>Shape & Elevation</h1>
      <p className="lede">
        A radius ramp with a single global knob: every step except <code>none</code> and{' '}
        <code>full</code> multiplies by <code>--perfect-radius-scale</code>, so the entire kit
        sharpens or softens together.
      </p>

      <h2>Radius ramp</h2>
      <Row gap={4} wrap style={{ marginBottom: 'var(--perfect-space-5)' }}>
        <Text as="span" size="sm" tone="muted">
          radius-scale:
        </Text>
        <Text as="span" size="sm" weight="semibold" mono>
          {scale.toFixed(2)}
        </Text>
        <div style={{ width: '14rem' }}>
          <Slider
            aria-label="Radius scale preview"
            min={0}
            max={2}
            step={0.05}
            value={scale}
            onValueChange={setScale}
          />
        </div>
      </Row>
      <p>
        Drag to preview the ramp at another scale. The Preferences dialog in the top bar sets the
        real knob for the whole site.
      </p>
      <Row gap={4} wrap>
        {(Object.keys(radii) as RadiusStep[]).map((name) => (
          <div key={name} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '5rem',
                height: '5rem',
                background: 'var(--perfect-accent-soft)',
                border: 'var(--perfect-hairline) solid var(--perfect-accent-border)',
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
      </Row>

      <h2>Elevation</h2>
      <p>
        Six shadow levels, tuned separately per theme. Dark mode uses stronger shadows and lighter
        surface steps to show elevation.
      </p>
      <Row gap={4} wrap>
        {ELEVATIONS.map((level) => (
          <div
            key={level}
            style={{
              width: '8rem',
              height: '6rem',
              display: 'grid',
              placeItems: 'center',
              background: 'var(--perfect-surface-raised)',
              border: 'var(--perfect-hairline) solid var(--perfect-border-subtle)',
              borderRadius: 'var(--perfect-radius-lg)',
              boxShadow: `var(--perfect-shadow-${level})`,
            }}
          >
            <code>shadow-{level}</code>
          </div>
        ))}
      </Row>
    </>
  );
}
