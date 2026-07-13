import { SPACE_STEPS, space } from '@glacier/tokens';
import { Box, Row, Heading, Text, Size, TextTone, useT } from '@glacier/react';
import { prose } from '../../docs-ui.tsx';
import { m } from '../../i18n.ts';

export function SpacingPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.spcName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.spcLede))}
      </Text>

      <Heading level={2}>{t(m.spcSecScale)}</Heading>
      <table className="tokenTable">
        <thead>
          <tr>
            <th>{t(m.spcThToken)}</th>
            <th>{t(m.spcThRange)}</th>
            <th style={{ width: '55%' }}>{t(m.spcThLiveSize)}</th>
          </tr>
        </thead>
        <tbody>
          {SPACE_STEPS.filter((n) => n > 0).map((n) => (
            <tr key={n}>
              <td>
                <code>--glacier-space-{n}</code>
              </td>
              <td style={{ whiteSpace: 'nowrap', color: 'var(--glacier-text-subtle)' }}>
                {space[n].min * 16}{t(m.spacingPx)} {space[n].max * 16}{t(m.spacingPx2)}
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

      <Heading level={2}>{t(m.spcSecAlignment)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.spcAlignmentDesc)}</Text>
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
            {t(m.spacingControlHeightMd)}
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
            {t(m.spcSameHeight)}
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
