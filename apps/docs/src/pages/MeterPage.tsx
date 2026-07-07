import { Field, Input, Meter, Stack, Text } from '@perfect/react';
import { useState } from 'react';
import { ComponentBlueprint } from '../Blueprint.tsx';
import { Example, PropsTable } from '../docs-ui.tsx';

function scorePassword(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return password.length === 0 ? 0 : Math.max(1, score);
}

export function MeterPage() {
  return (
    <>
      <h1>Meter</h1>
      <p className="lede">
        A segmented level indicator, a health bar for how good or full something currently is, such
        as password strength or remaining quota. For how far along a task is, use ProgressBar.
      </p>

      <h2>Anatomy</h2>
      <p>An inspection with the exact spec measurements labelled on the box.</p>
      <ComponentBlueprint specId="meter" />

      <h2>Examples</h2>

      <Example
        title="Auto tone"
        description="Discrete segments fill from the left. The default auto tone grades from danger through warning to success as the level rises."
        code={`import { Meter } from '@perfect/react';

<Meter aria-label="Strength" value={1} />
<Meter aria-label="Strength" value={2} />
<Meter aria-label="Strength" value={4} />`}
      >
        <Stack gap={4} style={{ width: '16rem' }}>
          <Meter aria-label="Strength one of four" value={1} />
          <Meter aria-label="Strength two of four" value={2} />
          <Meter aria-label="Strength four of four" value={4} />
        </Stack>
      </Example>

      <Example
        title="Fixed tone and custom scale"
        description="Set tone to pin a color, and decouple max from the segment count for quota-style meters."
        code={`<Meter aria-label="Storage used" value={35} max={100} segments={10} tone="accent" />
<Meter aria-label="Battery" value={90} max={100} segments={5} tone="success" size="sm" />`}
      >
        <Stack gap={4} style={{ width: '16rem' }}>
          <Meter aria-label="Storage used" value={35} max={100} segments={10} tone="accent" />
          <Meter aria-label="Battery" value={90} max={100} segments={5} tone="success" size="sm" />
        </Stack>
      </Example>

      <Example
        title="Password strength"
        description="Feed a Meter a score derived from the input. The auto tone means weak input reads as danger with no extra logic. Add a reveal Toggle from the Toggle page for the full field."
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
        title="Skeleton"
        description="The skeleton prop keeps one pip per segment at the same thickness, so the row holds its space while data loads."
        code={`<Meter skeleton value={0} />
<Meter skeleton value={0} segments={10} size="sm" />`}
      >
        <Stack gap={4} style={{ width: '16rem' }}>
          <Meter aria-label="Strength two of four" value={2} />
          <Meter skeleton value={0} />
          <Meter skeleton value={0} segments={10} size="sm" />
        </Stack>
      </Example>

      <h2>Props</h2>
      <PropsTable
        props={[
          { name: 'value', type: 'number', description: 'Current level, clamped to 0 through max.' },
          { name: 'max', type: 'number', default: 'segments', description: 'Upper bound. Defaults to the segment count for 1:1 scoring.' },
          { name: 'segments', type: 'number', default: '4', description: 'Number of discrete pips.' },
          { name: 'tone', type: "'auto' | 'accent' | 'success' | 'warning' | 'danger'", default: "'auto'", description: 'auto grades by level; the rest pin a color.' },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Segment thickness.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: "Renders a placeholder with the component's exact geometry." },
          { name: 'aria-label', type: 'string', description: 'Accessible name for the meter.' },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>
          Meter renders <code>role="meter"</code> with <code>aria-valuemin</code>,{' '}
          <code>aria-valuemax</code>, and <code>aria-valuenow</code>.
        </li>
        <li>It needs an accessible name via aria-label, since the pips carry no text.</li>
        <li>State is conveyed by fill count as well as color, so it survives color-blindness.</li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>Use Meter for how good or full something is; use ProgressBar for how far along a task is.</li>
        <li>Keep the auto tone for strength meters so weak input reads as danger without extra logic.</li>
        <li>Pin a tone with the tone prop when the color has fixed meaning, like a green battery.</li>
        <li>Meter stays presentation-only: scoring logic, like the password scorer here, belongs to the app.</li>
      </ul>
    </>
  );
}

function PasswordStrengthDemo() {
  const [password, setPassword] = useState('');
  const score = scorePassword(password);
  return (
    <Stack gap={4} style={{ width: '20rem' }}>
      <Field label="Password" hint="Use at least 8 characters.">
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </Field>
      <Meter aria-label="Password strength" value={score} />
      <Text size="xs" tone="subtle">
        Strength: <Text as="span" size="xs" mono>{score}/4</Text>
      </Text>
    </Stack>
  );
}
