import { useState } from 'react';
import { OtpField, Text, Heading, Size, TextTone } from '@glacier/react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

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
  return (
    <>
      <Heading level={1}>OtpField</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A one-time passcode entry. One real text input is stretched invisibly across the visual
        cells, so typing, backspace, paste, and platform code autofill all behave natively; the
        caret blinks in the next empty cell. Codes read left to right in every locale, so the row
        never mirrors under RTL.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the figure.</Text>
      <ComponentBlueprint specId="otp-field" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Basic"
        description="Six numeric cells by default. Focus the field and type; paste a full code and it distributes across the cells."
        code={`import { OtpField } from '@glacier/react';

<OtpField onComplete={(code) => verify(code)} />`}
      >
        <OtpField />
      </Example>

      <Example
        title="Controlled with completion"
        description="Drive the value from state; onComplete fires once when the last cell fills."
        code={`const [code, setCode] = useState('');

<OtpField value={code} onValueChange={setCode} onComplete={verify} />`}
      >
        <ControlledCode />
      </Example>

      <Example
        title="Groups and length"
        description="groupSize draws a dash between digit groups; length sets the cell count."
        code={`<OtpField length={6} groupSize={3} defaultValue="123" />
<OtpField length={4} />`}
      >
        <div style={{ display: 'grid', gap: 'var(--glacier-space-4)', justifyItems: 'start' }}>
          <OtpField length={6} groupSize={3} defaultValue="123" />
          <OtpField length={4} />
        </div>
      </Example>

      <Example
        title="Alphanumeric and masked"
        description="type widens the accepted characters; masked renders dots for codes that should stay private."
        code={`<OtpField type="alphanumeric" defaultValue="A7" />
<OtpField masked defaultValue="4207" length={4} />`}
      >
        <div style={{ display: 'grid', gap: 'var(--glacier-space-4)', justifyItems: 'start' }}>
          <OtpField type="alphanumeric" defaultValue="A7" />
          <OtpField masked defaultValue="4207" length={4} />
        </div>
      </Example>

      <Example
        title="Sizes"
        description="Three cell sizes on the control heights."
        code={`<OtpField size="sm" length={4} />
<OtpField size="md" length={4} />
<OtpField size="lg" length={4} />`}
      >
        <div style={{ display: 'grid', gap: 'var(--glacier-space-4)', justifyItems: 'start' }}>
          <OtpField size={Size.Small} length={4} />
          <OtpField size={Size.Medium} length={4} />
          <OtpField size={Size.Large} length={4} />
        </div>
      </Example>

      <Example
        title="States"
        description="error paints the invalid treatment and sets aria-invalid; disabled dims the cells and blocks input; glass swaps the solid surface for the frosted material."
        code={`<OtpField error defaultValue="99" length={4} />
<OtpField disabled defaultValue="12" length={4} />
<OtpField glass length={4} />`}
      >
        <div style={{ display: 'grid', gap: 'var(--glacier-space-4)', justifyItems: 'start' }}>
          <OtpField error defaultValue="99" length={4} />
          <OtpField disabled defaultValue="12" length={4} />
          <OtpField glass length={4} />
        </div>
      </Example>

      <Example
        title="Skeleton"
        description="The loading placeholder keeps the exact cell geometry."
        code={`<OtpField skeleton length={6} />`}
      >
        <OtpField skeleton length={6} />
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'length', type: 'number', default: '6', description: 'Number of code characters.' },
          { name: 'value', type: 'string', description: 'Controlled code value.' },
          { name: 'defaultValue', type: 'string', description: 'Initial value when uncontrolled.' },
          { name: 'onValueChange', type: '(value: string) => void', description: 'Called with the sanitized code on every change.' },
          { name: 'onComplete', type: '(value: string) => void', description: 'Called with the full code when the last cell fills.' },
          { name: 'type', type: "'numeric' | 'alphanumeric'", default: "'numeric'", description: 'Which characters the code accepts; everything else is stripped.' },
          { name: 'masked', type: 'boolean', default: 'false', description: 'Renders dots instead of the entered characters.' },
          { name: 'groupSize', type: 'number', description: 'Draws a separator dash after every N cells.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Cell size step.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Blocks input and dims the cells.' },
          { name: 'error', type: 'boolean', default: 'false', description: 'Paints the invalid treatment and sets aria-invalid.' },
          { name: 'autoFocus', type: 'boolean', default: 'false', description: 'Focuses the field on mount.' },
          { name: 'glass', type: 'boolean', default: 'false', description: 'Renders the frosted glass material.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: 'Renders placeholders with the exact geometry.' },
          { name: 'aria-label', type: 'string', description: 'Accessible name; defaults to the localized "One-time code".' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          One real text input owns focus and editing, with{' '}
          <code>autocomplete="one-time-code"</code> so SMS and password-manager autofill work
          natively on every platform.
        </li>
        <li>
          The visual cells are <code>aria-hidden</code> presentation; assistive tech reads and
          edits the single input, named by <code>aria-label</code> (localized default).
        </li>
        <li>
          <code>error</code> mirrors into <code>aria-invalid</code>; the caret blink is disabled
          under reduced motion.
        </li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Verify on <code>onComplete</code> rather than a submit button when the code length is fixed; keep a button fallback for assistive flows.</li>
        <li>Use <code>groupSize</code> to match how the code is printed in the email or SMS (123-456 reads faster than 123456).</li>
        <li>Reach for <code>masked</code> only when codes are long-lived secrets; short-lived SMS codes are easier to confirm unmasked.</li>
      </ul>
    </>
  );
}
