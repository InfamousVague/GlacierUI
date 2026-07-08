import { Row, Slider, Stack, Text, Heading, Size, TextTone } from '@glacier/react';
import { useState, type CSSProperties } from 'react';

// A busy, colourful backdrop so the glass has something to blur and saturate -
// glass over a flat surface shows almost nothing.
const STAGE: CSSProperties = {
  position: 'relative',
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--glacier-space-4)',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '18rem',
  padding: 'var(--glacier-space-6)',
  borderRadius: 'var(--glacier-radius-xl)',
  overflow: 'hidden',
  border: 'var(--glacier-hairline) solid var(--glacier-border-subtle)',
  background:
    'radial-gradient(26rem 26rem at 12% 16%, oklch(0.72 0.19 20 / 0.95), transparent 60%),' +
    'radial-gradient(24rem 24rem at 88% 10%, oklch(0.82 0.16 95 / 0.95), transparent 60%),' +
    'radial-gradient(30rem 30rem at 72% 94%, oklch(0.66 0.2 300 / 0.95), transparent 62%),' +
    'radial-gradient(22rem 22rem at 22% 90%, oklch(0.74 0.16 200 / 0.95), transparent 60%),' +
    'linear-gradient(120deg, oklch(0.5 0.2 265), oklch(0.62 0.17 195))',
};

export function MaterialsPage() {
  const [frost, setFrost] = useState(1);

  // The preview computes its blur straight from the slider - the same trick the
  // Shape page uses for radius-scale, because the --glacier-blur-* tokens
  // resolve their scale at :root and a local override would not reach here.
  const glass = (elevation: number): CSSProperties => ({
    display: 'grid',
    gap: 'var(--glacier-space-2)',
    padding: 'var(--glacier-space-5)',
    borderRadius: 'var(--glacier-radius-lg)',
    background: 'var(--glacier-glass-regular)',
    border: 'var(--glacier-hairline) solid var(--glacier-glass-border)',
    backdropFilter: `blur(${(20 * frost).toFixed(1)}px) saturate(1.8)`,
    WebkitBackdropFilter: `blur(${(20 * frost).toFixed(1)}px) saturate(1.8)`,
    boxShadow: `inset 0 1px 0 var(--glacier-glass-highlight), var(--glacier-shadow-${elevation})`,
    color: 'var(--glacier-text)',
  });

  return (
    <>
      <Heading level={1}>Glass</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        The kit&rsquo;s glass surfaces are a lightweight CSS material - a translucent tint over a blurred,
        saturated backdrop, with a hairline border and a thin top highlight. The{' '}
        <code>--glacier-glass-blur-scale</code> token tunes the frostedness live across every surface at
        once.
      </Text>

      <Heading level={2}>Frostedness</Heading>
      <Text tone={TextTone.Muted}>
        Drag to preview the glass at another blur. The Preferences dialog in the top bar sets the real
        knob for the whole site.
      </Text>
      <Row gap={6} wrap align="center" style={{ marginBottom: 'var(--glacier-space-5)' }}>
        <Row gap={3} align="center">
          <Text as="span" size={Size.Small} tone={TextTone.Muted}>
            Frostedness
          </Text>
          <div style={{ width: '14rem' }}>
            <Slider
              aria-label="Frostedness preview"
              min={0}
              max={2}
              step={0.05}
              value={frost}
              onValueChange={setFrost}
            />
          </div>
          <Text as="span" size={Size.Small} weight="semibold" mono>
            {frost.toFixed(2)}×
          </Text>
        </Row>
      </Row>

      <div style={STAGE}>
        <div style={{ ...glass(4), maxWidth: '17rem' }}>
          <Text as="span" weight="semibold">
            Now playing
          </Text>
          <Text size={Size.Small} tone={TextTone.Muted}>
            Drag the slider to thin or thicken the frost on the panel.
          </Text>
        </div>
        <div style={{ ...glass(3), placeItems: 'center', textAlign: 'center', minWidth: '9rem' }}>
          <Text as="span" size={Size.Small} weight="semibold">
            Glass tile
          </Text>
        </div>
      </div>

      <Stack gap={4} style={{ marginTop: 'var(--glacier-space-5)' }}>
        <Text tone={TextTone.Muted}>
          The Preferences dialog sets the frostedness for the whole site, so every glass surface - the
          toolbar, menus, popovers, cards - thickens together. This preview drives its own panels locally
          so you can compare without changing your settings.
        </Text>
      </Stack>

      <Heading level={2}>Tokens</Heading>
      <div className="propsTableWrap">
        <table className="tokenTable">
          <thead>
            <tr>
              <th>Token</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>--glacier-glass-blur-scale</code>
              </td>
              <td>
                <code>1</code>
              </td>
              <td>Frostedness. Every blur token is multiplied by it, so all glass thins or thickens at once.</td>
            </tr>
            <tr>
              <td>
                <code>--glacier-glass-saturate</code>
              </td>
              <td>
                <code>1.8</code>
              </td>
              <td>Saturation boost applied to the backdrop so colour reads through the glass.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
