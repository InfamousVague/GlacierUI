import { Field, Input, Meter, Stack, Text, Heading, Size, TextTone, Tone, useT } from '@glacier/react';
import { useState } from 'react';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { m } from '../../i18n.ts';

function scorePassword(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return password.length === 0 ? 0 : Math.max(1, score);
}

export function MeterPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.mtrName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.mtrLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntroBox)}</Text>
      <ComponentBlueprint specId="meter" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.mtrEx1Title)}
        description={t(m.mtrEx1Desc)}
        component="Meter"
        render={(K) => (
          <Stack gap={4} style={{ width: '16rem' }}>
            <K.Meter aria-label={t(m.mtrDemoStrength1)} value={1} />
            <K.Meter aria-label={t(m.mtrDemoStrength2)} value={2} />
            <K.Meter aria-label={t(m.mtrDemoStrength4)} value={4} />
          </Stack>
        )}
        code={`import { Meter } from '@glacier/react';

<Meter aria-label="Strength" value={1} />
<Meter aria-label="Strength" value={2} />
<Meter aria-label="Strength" value={4} />`}
      />

      <Example
        title={t(m.mtrEx2Title)}
        description={t(m.mtrEx2Desc)}
        component="Meter"
        render={(K) => (
          <Stack gap={4} style={{ width: '16rem' }}>
            <K.Meter aria-label={t(m.mtrDemoStorage)} value={35} max={100} segments={10} tone={Tone.Accent} />
            <K.Meter aria-label={t(m.mtrDemoBattery)} value={90} max={100} segments={5} tone={Tone.Success} size={Size.Small} />
          </Stack>
        )}
        code={`<Meter aria-label="Storage used" value={35} max={100} segments={10} tone={Tone.Accent} />
<Meter aria-label="Battery" value={90} max={100} segments={5} tone={Tone.Success} size={Size.Small} />`}
      />

      <Example
        title={t(m.mtrPwStrength)}
        description={t(m.mtrEx3Desc)}
        code={`const [password, setPassword] = useState('');
const score = scorePassword(password);

<Field label="Password" hint="Use at least 8 characters.">
  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
</Field>
<Meter aria-label="Password strength" value={score} />`}
      >
        <PasswordStrengthDemo />
      </Example>

      <Example
        title={t(m.exSkeleton)}
        description={t(m.mtrEx4Desc)}
        component="Meter"
        render={(K) => (
          <Stack gap={4} style={{ width: '16rem' }}>
            <K.Meter aria-label={t(m.mtrDemoStrength2)} value={2} />
            <K.Meter skeleton value={0} />
            <K.Meter skeleton value={0} segments={10} size={Size.Small} />
          </Stack>
        )}
        code={`<Meter skeleton value={0} />
<Meter skeleton value={0} segments={10} size={Size.Small} />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'value', type: 'number', description: t(m.mtrPropValue) },
          { name: 'max', type: 'number', default: 'segments', description: t(m.mtrPropMax) },
          { name: 'segments', type: 'number', default: '4', description: t(m.mtrPropSegments) },
          { name: 'tone', type: "'auto' | 'accent' | 'success' | 'warning' | 'danger'", default: "'auto'", description: t(m.mtrPropTone) },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: t(m.mtrPropSize) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.mtrPropSkeleton) },
          { name: 'aria-label', type: 'string', description: t(m.mtrPropAriaLabel) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.mtrA11y1))}</li>
        <li>{prose(t(m.mtrA11y2))}</li>
        <li>{prose(t(m.mtrA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.mtrUse1))}</li>
        <li>{prose(t(m.mtrUse2))}</li>
        <li>{prose(t(m.mtrUse3))}</li>
        <li>{prose(t(m.mtrUse4))}</li>
      </ul>
    </>
  );
}

function PasswordStrengthDemo() {
  const t = useT();
  const [password, setPassword] = useState('');
  const score = scorePassword(password);
  return (
    <Stack gap={4} style={{ width: '20rem' }}>
      <Field label={t(m.meterPassword)} hint={t(m.mtrDemoPwHint)}>
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </Field>
      <Meter aria-label={t(m.mtrPwStrength)} value={score} />
      <Text size={Size.XSmall} tone={TextTone.Subtle}>
        {t(m.mtrDemoStrengthLabel)} <Text as="span" size={Size.XSmall} mono>{score}/4</Text>
      </Text>
    </Stack>
  );
}
