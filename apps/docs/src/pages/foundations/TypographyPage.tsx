import { typeScale, TYPE_RATIO_MIN, TYPE_RATIO_MAX } from '@glacier/tokens';
import { Stack, Heading, Text, Size, TextTone, useT } from '@glacier/react';
import { m } from '../../i18n.ts';

export function TypographyPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.typoName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.typoLede, { min: TYPE_RATIO_MIN, max: TYPE_RATIO_MAX })}
      </Text>

      <Heading level={2}>{t(m.typoSecScale)}</Heading>
      <table className="tokenTable">
        <thead>
          <tr>
            <th>{t(m.typoColToken)}</th>
            <th>{t(m.typoColRange)}</th>
            <th>{t(m.typoColSample)}</th>
          </tr>
        </thead>
        <tbody>
          {[...typeScale].reverse().map((step) => (
            <tr key={step.name}>
              <td>
                <code>--glacier-font-size-{step.name}</code>
              </td>
              <td style={{ whiteSpace: 'nowrap', color: 'var(--glacier-text-subtle)' }}>
                {(step.size.min * 16).toFixed(1)}{t(m.typographyPx)} {(step.size.max * 16).toFixed(1)}{t(m.typographyPx2)}
              </td>
              <td>
                <span
                  style={{
                    fontSize: `var(--glacier-font-size-${step.name})`,
                    lineHeight: `var(--glacier-leading-${step.name})`,
                    letterSpacing: `var(--glacier-tracking-${step.name})`,
                    fontWeight:
                      step.step > 0 ? 'var(--glacier-font-weight-semibold)' : undefined,
                  }}
                >
                  {t(m.typoSample)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Heading level={2}>{t(m.typoSecWeights)}</Heading>
      <Stack gap={4} padding={8} background="glass" radius="xl" border>
        <span style={{ fontWeight: 'var(--glacier-font-weight-regular)' }}>
          {t(m.typoWeightRegular)}
        </span>
        <span style={{ fontWeight: 'var(--glacier-font-weight-medium)' }}>
          {t(m.typoWeightMedium)}
        </span>
        <span style={{ fontWeight: 'var(--glacier-font-weight-semibold)' }}>
          {t(m.typoWeightSemibold)}
        </span>
        <span style={{ fontWeight: 'var(--glacier-font-weight-bold)' }}>
          {t(m.typoWeightBold)}
        </span>
        <span style={{ fontFamily: 'var(--glacier-font-mono)' }}>
          {t(m.typoWeightMono)}
        </span>
      </Stack>
    </>
  );
}
