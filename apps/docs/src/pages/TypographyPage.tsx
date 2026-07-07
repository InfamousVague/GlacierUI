import { typeScale, TYPE_RATIO_MIN, TYPE_RATIO_MAX } from '@perfect/tokens';
import { Stack } from '@perfect/react';

export function TypographyPage() {
  return (
    <>
      <h1>Typography</h1>
      <p className="lede">
        A modular scale: minor third ({TYPE_RATIO_MIN}) at 320px, growing to major third (
        {TYPE_RATIO_MAX}) at 1536px. Headings get more room on large screens while body text stays
        steady. Line-height and tracking tighten as sizes grow.
      </p>

      <h2>Scale</h2>
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
                <code>--perfect-font-size-{step.name}</code>
              </td>
              <td style={{ whiteSpace: 'nowrap', color: 'var(--perfect-text-subtle)' }}>
                {(step.size.min * 16).toFixed(1)}px → {(step.size.max * 16).toFixed(1)}px
              </td>
              <td>
                <span
                  style={{
                    fontSize: `var(--perfect-font-size-${step.name})`,
                    lineHeight: `var(--perfect-leading-${step.name})`,
                    letterSpacing: `var(--perfect-tracking-${step.name})`,
                    fontWeight:
                      step.step > 0 ? 'var(--perfect-font-weight-semibold)' : undefined,
                  }}
                >
                  Perfectly measured
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Weights & families</h2>
      <Stack gap={4} padding={8} background="glass" radius="xl" border>
        <span style={{ fontWeight: 'var(--perfect-font-weight-regular)' }}>
          Regular 400 for body text and long-form reading
        </span>
        <span style={{ fontWeight: 'var(--perfect-font-weight-medium)' }}>
          Medium 500 for labels, buttons, and emphasis
        </span>
        <span style={{ fontWeight: 'var(--perfect-font-weight-semibold)' }}>
          Semibold 600 for headings and section titles
        </span>
        <span style={{ fontWeight: 'var(--perfect-font-weight-bold)' }}>
          Bold 700 for display text
        </span>
        <span style={{ fontFamily: 'var(--perfect-font-mono)' }}>
          Mono for code, tokens, and tabular data
        </span>
      </Stack>
    </>
  );
}
