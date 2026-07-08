import { typeScale, TYPE_RATIO_MIN, TYPE_RATIO_MAX } from '@glacier/tokens';
import { Stack, Heading, Text, Size, TextTone } from '@glacier/react';

export function TypographyPage() {
  return (
    <>
      <Heading level={1}>Typography</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A modular scale: minor third ({TYPE_RATIO_MIN}) at 320px, growing to major third (
        {TYPE_RATIO_MAX}) at 1536px. Headings get more room on large screens while body text stays
        steady. Line-height and tracking tighten as sizes grow.
      </Text>

      <Heading level={2}>Scale</Heading>
      <table className="tokenTable">
        <thead>
          <tr>
            <th>Token</th>
            <th>Range</th>
            <th>Sample</th>
          </tr>
        </thead>
        <tbody>
          {[...typeScale].reverse().map((step) => (
            <tr key={step.name}>
              <td>
                <code>--glacier-font-size-{step.name}</code>
              </td>
              <td style={{ whiteSpace: 'nowrap', color: 'var(--glacier-text-subtle)' }}>
                {(step.size.min * 16).toFixed(1)}px → {(step.size.max * 16).toFixed(1)}px
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
                  Perfectly measured
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Heading level={2}>Weights & families</Heading>
      <Stack gap={4} padding={8} background="glass" radius="xl" border>
        <span style={{ fontWeight: 'var(--glacier-font-weight-regular)' }}>
          Regular 400 for body text and long-form reading
        </span>
        <span style={{ fontWeight: 'var(--glacier-font-weight-medium)' }}>
          Medium 500 for labels, buttons, and emphasis
        </span>
        <span style={{ fontWeight: 'var(--glacier-font-weight-semibold)' }}>
          Semibold 600 for headings and section titles
        </span>
        <span style={{ fontWeight: 'var(--glacier-font-weight-bold)' }}>
          Bold 700 for display text
        </span>
        <span style={{ fontFamily: 'var(--glacier-font-mono)' }}>
          Mono for code, tokens, and tabular data
        </span>
      </Stack>
    </>
  );
}
