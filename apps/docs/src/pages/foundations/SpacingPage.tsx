import { SPACE_STEPS, space } from '@glacier/tokens';
import { Box, Row, Heading, Text, Size, TextTone } from '@glacier/react';

export function SpacingPage() {
  return (
    <>
      <Heading level={1}>Spacing</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        One fluid scale for every margin, padding, and gap. Each step is 1 unit = 4px at a 320px
        viewport, growing linearly to 5px at 1536px via <code>clamp()</code>. Resize the window to
        see the bars change size. Everything shares the scale, so everything stays aligned.
      </Text>

      <Heading level={2}>Scale</Heading>
      <table className="tokenTable">
        <thead>
          <tr>
            <th>Token</th>
            <th>Range</th>
            <th style={{ width: '55%' }}>Live size</th>
          </tr>
        </thead>
        <tbody>
          {SPACE_STEPS.filter((n) => n > 0).map((n) => (
            <tr key={n}>
              <td>
                <code>--glacier-space-{n}</code>
              </td>
              <td style={{ whiteSpace: 'nowrap', color: 'var(--glacier-text-subtle)' }}>
                {space[n].min * 16}px → {space[n].max * 16}px
              </td>
              <td>
                <div
                  style={{
                    width: `calc(var(--glacier-space-${n}) * 4)`,
                    height: 'var(--glacier-space-4)',
                    background: 'var(--glacier-accent-solid)',
                    borderRadius: 'var(--glacier-radius-xs)',
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Heading level={2}>Alignment in practice</Heading>
      <Text tone={TextTone.Muted}>
        Controls of the same size share heights and horizontal rhythm, so mixed rows line up
        without manual adjustment:
      </Text>
      <Box padding={8} background="glass" radius="xl" border>
        <Row gap={4} wrap>
          <div
            style={{
              height: 'var(--glacier-control-height-md)',
              display: 'inline-flex',
              alignItems: 'center',
              paddingInline: 'var(--glacier-space-4)',
              background: 'var(--glacier-accent-soft)',
              borderRadius: 'var(--glacier-radius-md)',
              color: 'var(--glacier-accent-text)',
            }}
          >
            control-height-md
          </div>
          <div
            style={{
              height: 'var(--glacier-control-height-md)',
              display: 'inline-flex',
              alignItems: 'center',
              paddingInline: 'var(--glacier-space-4)',
              border: 'var(--glacier-hairline) solid var(--glacier-border)',
              borderRadius: 'var(--glacier-radius-md)',
            }}
          >
            same height
          </div>
          <div
            style={{
              height: 'var(--glacier-control-height-md)',
              width: 'var(--glacier-control-height-md)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--glacier-surface-sunken)',
              borderRadius: 'var(--glacier-radius-md)',
            }}
          >
            1:1
          </div>
        </Row>
      </Box>
    </>
  );
}
