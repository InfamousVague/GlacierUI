import { radii, SCALED_RADII, type RadiusStep } from '@glacier/tokens';
import { Slider, Text, Row, Heading, Size, TextTone } from '@glacier/react';
import { useState } from 'react';

const ELEVATIONS = [0, 1, 2, 3, 4, 5];

export function ShapePage() {
  const [scale, setScale] = useState(1);

  return (
    <>
      <Heading level={1}>Shape & Elevation</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A radius ramp with a single global knob: every step except <code>none</code> and{' '}
        <code>full</code> multiplies by <code>--glacier-radius-scale</code>, so the entire kit
        sharpens or softens together.
      </Text>

      <Heading level={2}>Radius ramp</Heading>
      <Row gap={4} wrap style={{ marginBottom: 'var(--glacier-space-5)' }}>
        <Text as="span" size={Size.Small} tone={TextTone.Muted}>
          radius-scale:
        </Text>
        <Text as="span" size={Size.Small} weight="semibold" mono>
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
      <Text tone={TextTone.Muted}>
        Drag to preview the ramp at another scale. The Preferences dialog in the top bar sets the
        real knob for the whole site.
      </Text>
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
      <Text tone={TextTone.Muted}>
        The <code>squircle</code> keeps the same radius but bends the corner into a superellipse
        with <code>corner-shape</code>, for the continuous curve iOS and macOS use. Browsers without{' '}
        <code>corner-shape</code> fall back to a plain rounded corner.
      </Text>

      <Heading level={2}>Elevation</Heading>
      <Text tone={TextTone.Muted}>
        Six shadow levels, tuned separately per theme. Dark mode uses stronger shadows and lighter
        surface steps to show elevation.
      </Text>
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
