import { useState } from 'react';
import { OtpField, Text, Heading, Size, TextTone, useT } from '@glacier/react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

function ControlledCode() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'done'>('idle');
  return (
    <div style={{ display: 'grid', gap: 'var(--glacier-space-3)', justifyItems: 'start' }}>
      <OtpField
        value={code}
        onValueChange={(next) => {
          setCode(next);
          setStatus('idle');
        }}
        onComplete={() => setStatus('done')}
      />
      <Text size={Size.Small} tone={status === 'done' ? TextTone.Default : TextTone.Subtle} mono>
        {status === 'done' ? `verified ${code}` : `${code.length}/6`}
      </Text>
    </div>
  );
}

export function OtpFieldPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.otpName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.otpLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntro)}</Text>
      <ComponentBlueprint specId="otp-field" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.otpEx1Desc)}
        component="OtpField"
        render={(K) => <K.OtpField />}
        code={`import { OtpField } from '@glacier/react';

<OtpField onComplete={(code) => verify(code)} />`}
      />

      <Example
        title={t(m.otpEx2Title)}
        description={t(m.otpEx2Desc)}
        code={`const [code, setCode] = useState('');

<OtpField value={code} onValueChange={setCode} onComplete={verify} />`}
      >
        <ControlledCode />
      </Example>

      <Example
        title={t(m.otpEx3Title)}
        description={t(m.otpEx3Desc)}
        component="OtpField"
        render={(K) => (
          <div style={{ display: 'grid', gap: 'var(--glacier-space-4)', justifyItems: 'start' }}>
            <K.OtpField length={6} groupSize={3} defaultValue="123" />
            <K.OtpField length={4} />
          </div>
        )}
        code={`<OtpField length={6} groupSize={3} defaultValue="123" />
<OtpField length={4} />`}
      />

      <Example
        title={t(m.otpEx4Title)}
        description={t(m.otpEx4Desc)}
        component="OtpField"
        render={(K) => (
          <div style={{ display: 'grid', gap: 'var(--glacier-space-4)', justifyItems: 'start' }}>
            <K.OtpField type="alphanumeric" defaultValue="A7" />
            <K.OtpField masked defaultValue="4207" length={4} />
          </div>
        )}
        code={`<OtpField type="alphanumeric" defaultValue="A7" />
<OtpField masked defaultValue="4207" length={4} />`}
      />

      <Example
        title={t(m.secSizes)}
        description={t(m.otpEx5Desc)}
        component="OtpField"
        render={(K) => (
          <div style={{ display: 'grid', gap: 'var(--glacier-space-4)', justifyItems: 'start' }}>
            <K.OtpField size={Size.Small} length={4} />
            <K.OtpField size={Size.Medium} length={4} />
            <K.OtpField size={Size.Large} length={4} />
          </div>
        )}
        code={`<OtpField size="sm" length={4} />
<OtpField size="md" length={4} />
<OtpField size="lg" length={4} />`}
      />

      <Example
        title={t(m.secStates)}
        description={t(m.otpEx6Desc)}
        component="OtpField"
        render={(K) => (
          <div style={{ display: 'grid', gap: 'var(--glacier-space-4)', justifyItems: 'start' }}>
            <K.OtpField error defaultValue="99" length={4} />
            <K.OtpField disabled defaultValue="12" length={4} />
            <K.OtpField glass length={4} />
          </div>
        )}
        code={`<OtpField error defaultValue="99" length={4} />
<OtpField disabled defaultValue="12" length={4} />
<OtpField glass length={4} />`}
      />

      <Example
        title={t(m.exSkeleton)}
        description={t(m.otpEx7Desc)}
        component="OtpField"
        render={(K) => <K.OtpField skeleton length={6} />}
        code={`<OtpField skeleton length={6} />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'length', type: 'number', default: '6', description: t(m.otpPropLength) },
          { name: 'value', type: 'string', description: t(m.otpPropValue) },
          { name: 'defaultValue', type: 'string', description: t(m.otpPropDefaultValue) },
          { name: 'onValueChange', type: '(value: string) => void', description: t(m.otpPropOnValueChange) },
          { name: 'onComplete', type: '(value: string) => void', description: t(m.otpPropOnComplete) },
          { name: 'type', type: "'numeric' | 'alphanumeric'", default: "'numeric'", description: t(m.otpPropType) },
          { name: 'masked', type: 'boolean', default: 'false', description: t(m.otpPropMasked) },
          { name: 'groupSize', type: 'number', description: t(m.otpPropGroupSize) },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t(m.otpPropSize) },
          { name: 'disabled', type: 'boolean', default: 'false', description: t(m.otpPropDisabled) },
          { name: 'error', type: 'boolean', default: 'false', description: t(m.otpPropError) },
          { name: 'autoFocus', type: 'boolean', default: 'false', description: t(m.otpPropAutoFocus) },
          { name: 'glass', type: 'boolean', default: 'false', description: t(m.otpPropGlass) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.otpPropSkeleton) },
          { name: 'aria-label', type: 'string', description: t(m.otpPropAriaLabel) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.otpA11y1))}</li>
        <li>{prose(t(m.otpA11y2))}</li>
        <li>{prose(t(m.otpA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.otpUse1))}</li>
        <li>{prose(t(m.otpUse2))}</li>
        <li>{prose(t(m.otpUse3))}</li>
      </ul>
    </>
  );
}
