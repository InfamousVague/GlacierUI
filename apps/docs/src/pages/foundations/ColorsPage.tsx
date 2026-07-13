import { ramps, rampSteps, type Theme } from '@glacier/tokens';
import { Select, Text, Row, Stack, Heading, Size, TextTone, useT } from '@glacier/react';
import { useState } from 'react';
import { m } from '../../i18n.ts';

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
  const t = useT();
  const STEP_ROLES = [
    t(m.colRoleAppBg),
    t(m.colRoleSubtleBg),
    t(m.colRoleComponentBg),
    t(m.colRoleHoverBg),
    t(m.colRoleActiveBg),
    t(m.colRoleSubtleBorder),
    t(m.colRoleBorder),
    t(m.colRoleStrongBorder),
    t(m.colRoleSolid),
    t(m.colRoleSolidHover),
    t(m.colRoleTextLow),
    t(m.colRoleTextHigh),
  ];

  // default the ramp preview to the theme in use; the Select still overrides it
  const [theme, setTheme] = useState<Theme>(currentTheme);

  return (
    <>
      <Heading level={1}>{t(m.colName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.colLede)}
      </Text>

      <Heading level={2}>{t(m.colRamps)}</Heading>
      <Row gap={4} wrap style={{ marginBottom: 'var(--glacier-space-4)' }}>
        <Text as="span" tone={TextTone.Muted}>
          {t(m.colPreviewRampValues)}
        </Text>
        <Select
          aria-label={t(m.colRampThemeAria)}
          size={Size.Small}
          value={theme}
          onValueChange={(v) => setTheme(v as Theme)}
          options={[
            { value: 'light', label: t(m.colOptLight) },
            { value: 'dark', label: t(m.colOptDark) },
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

      <Heading level={2}>{t(m.colSemanticLayer)}</Heading>
      <Text tone={TextTone.Muted}>
        {t(m.colSemanticIntro)}
      </Text>
      <table className="tokenTable">
        <thead>
          <tr>
            <th>{t(m.colThToken)}</th>
            <th>{t(m.colThSwatch)}</th>
            <th>{t(m.colThValue)}</th>
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
