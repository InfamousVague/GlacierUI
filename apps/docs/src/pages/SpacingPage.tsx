import { SPACE_STEPS, space } from '@perfect/tokens';
import { Box, Row } from '@perfect/react';

export function SpacingPage() {
  return (
    <>
      <h1>Spacing</h1>
      <p className="lede">
        One fluid scale for every margin, padding, and gap. Each step is 1 unit = 4px at a 320px
        viewport, growing linearly to 5px at 1536px via <code>clamp()</code>. Resize the window to
        see the bars change size. Everything shares the scale, so everything stays aligned.
      </p>

      <h2>Scale</h2>
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
                <code>--perfect-space-{n}</code>
              </td>
              <td style={{ whiteSpace: 'nowrap', color: 'var(--perfect-text-subtle)' }}>
                {space[n].min * 16}px → {space[n].max * 16}px
              </td>
              <td>
                <div
                  style={{
                    width: `calc(var(--perfect-space-${n}) * 4)`,
                    height: 'var(--perfect-space-4)',
                    background: 'var(--perfect-accent-solid)',
                    borderRadius: 'var(--perfect-radius-xs)',
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Alignment in practice</h2>
      <p>
        Controls of the same size share heights and horizontal rhythm, so mixed rows line up
        without manual adjustment:
      </p>
      <Box padding={8} background="glass" radius="xl" border>
        <Row gap={4} wrap>
          <div
            style={{
              height: 'var(--perfect-control-height-md)',
              display: 'inline-flex',
              alignItems: 'center',
              paddingInline: 'var(--perfect-space-4)',
              background: 'var(--perfect-accent-soft)',
              borderRadius: 'var(--perfect-radius-md)',
              color: 'var(--perfect-accent-text)',
            }}
          >
            control-height-md
          </div>
          <div
            style={{
              height: 'var(--perfect-control-height-md)',
              display: 'inline-flex',
              alignItems: 'center',
              paddingInline: 'var(--perfect-space-4)',
              border: 'var(--perfect-hairline) solid var(--perfect-border)',
              borderRadius: 'var(--perfect-radius-md)',
            }}
          >
            same height
          </div>
          <div
            style={{
              height: 'var(--perfect-control-height-md)',
              width: 'var(--perfect-control-height-md)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--perfect-surface-sunken)',
              borderRadius: 'var(--perfect-radius-md)',
            }}
          >
            1:1
          </div>
        </Row>
      </Box>
    </>
  );
}
