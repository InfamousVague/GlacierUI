import { ramps, rampSteps, type Theme } from '@glacier/tokens';
import { Select, Text, Row, Stack, Heading, Size, TextTone } from '@glacier/react';
import { useState } from 'react';

const STEP_ROLES = [
  'app bg',
  'subtle bg',
  'component bg',
  'hover bg',
  'active bg',
  'subtle border',
  'border',
  'strong border',
  'solid',
  'solid hover',
  'text low',
  'text high',
];

const SEMANTIC_TOKENS = [
  'bg',
  'surface',
  'surface-raised',
  'surface-sunken',
  'hover',
  'active',
  'border-subtle',
  'border',
  'border-strong',
  'text',
  'text-muted',
  'text-subtle',
  'accent-solid',
  'accent-soft',
  'accent-text',
  'focus-ring',
  'danger-solid',
  'success-solid',
  'warning-solid',
  'info-solid',
];

/** The theme applied to <html> right now: data-theme, or the system setting. */
function currentTheme(): Theme {
  if (typeof document !== 'undefined') {
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'light' || attr === 'dark') return attr;
  }
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function ColorsPage() {
  // default the ramp preview to the theme in use; the Select still overrides it
  const [theme, setTheme] = useState<Theme>(currentTheme);

  return (
    <>
      <Heading level={1}>Colors & Tints</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        Eight 12-step ramps generated in OKLCH, so every hue keeps the same apparent lightness at
        the same step. Step numbers have fixed roles, which is why the semantic layer never changes
        between themes.
      </Text>

      <Heading level={2}>Ramps</Heading>
      <Row gap={4} wrap style={{ marginBottom: 'var(--glacier-space-4)' }}>
        <Text as="span" tone={TextTone.Muted}>
          Preview ramp values for:
        </Text>
        <Select
          aria-label="Ramp theme"
          size={Size.Small}
          value={theme}
          onValueChange={(v) => setTheme(v as Theme)}
          options={[
            { value: 'light', label: 'Light theme' },
            { value: 'dark', label: 'Dark theme' },
          ]}
        />
      </Row>
      <Stack gap={4}>
        <div className="swatchGrid" aria-hidden="true">
          <span />
          {STEP_ROLES.map((role, i) => (
            <span key={i} className="stepHead">
              <strong>{i + 1}</strong>
              <small>{role}</small>
            </span>
          ))}
        </div>
        {ramps.map((ramp) => (
          <div className="swatchGrid" key={ramp.name}>
            <span className="rampName">{ramp.name}</span>
            {rampSteps(ramp, theme).map((color, i) => (
              <div key={i} className="swatch" style={{ background: color }} title={`--glacier-${ramp.name}-${i + 1}: ${color}`} />
            ))}
          </div>
        ))}
      </Stack>

      <Heading level={2}>Semantic layer</Heading>
      <Text tone={TextTone.Muted}>
        Components consume these aliases instead of ramp steps. The swatches render from the live
        CSS variables, so they follow the theme toggle in the top bar.
      </Text>
      <table className="tokenTable">
        <thead>
          <tr>
            <th>Token</th>
            <th>Swatch</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {SEMANTIC_TOKENS.map((name) => (
            <tr key={name}>
              <td>
                <code>--glacier-{name}</code>
              </td>
              <td>
                <div
                  className="swatch"
                  style={{ background: `var(--glacier-${name})`, width: '3.5rem' }}
                />
              </td>
              <td style={{ color: 'var(--glacier-text-subtle)' }}>
                <ResolvedValue name={`--glacier-${name}`} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function ResolvedValue({ name }: { name: string }) {
  const value =
    typeof window !== 'undefined'
      ? getComputedStyle(document.documentElement).getPropertyValue(name).trim()
      : '';
  return <code>{value || 'n/a'}</code>;
}
