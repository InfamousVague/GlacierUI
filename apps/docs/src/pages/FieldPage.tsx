import { Button, Field, Input } from '@perfect/react';
import { useState } from 'react';
import { Example, PropsTable } from '../docs-ui.tsx';

export function FieldPage() {
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);

  return (
    <>
      <h1>Field &amp; Input</h1>
      <p className="lede">
        Field wraps a form control with a label, an optional hint, and validation messaging. Input
        is the text control itself, and when placed inside a Field it receives its id and aria
        wiring automatically.
      </p>

      <h2>Examples</h2>

      <Example
        title="Basic"
        description="A labeled input with a hint. The hint is linked to the input through aria-describedby."
        code={`import { Field, Input } from '@perfect/react';

<Field label="Email" hint="Used for receipts and account recovery.">
  <Input type="email" placeholder="you@example.com" />
</Field>`}
      >
        <div className="stack" style={{ maxWidth: '20rem' }}>
          <Field label="Email" hint="Used for receipts and account recovery.">
            <Input type="email" placeholder="you@example.com" />
          </Field>
        </div>
      </Example>

      <Example
        title="Validation"
        description="Click Validate with an empty value to set an error. The error replaces the hint, shakes in, and marks the input invalid. Typing clears it."
        code={`const [value, setValue] = useState('');
const [error, setError] = useState<string | null>(null);

<Field label="Username" hint="Letters and numbers only." error={error}>
  <Input
    value={value}
    placeholder="octocat"
    onChange={(e) => {
      setValue(e.target.value);
      setError(null);
    }}
  />
</Field>
<Button onClick={() => setError(value ? null : 'Username is required.')}>
  Validate
</Button>`}
      >
        <div className="stack" style={{ maxWidth: '20rem' }}>
          <Field label="Username" hint="Letters and numbers only." error={usernameError}>
            <Input
              value={username}
              placeholder="octocat"
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameError(null);
              }}
            />
          </Field>
          <div className="row">
            <Button onClick={() => setUsernameError(username ? null : 'Username is required.')}>
              Validate
            </Button>
          </div>
        </div>
      </Example>

      <Example
        title="Required"
        description="The required prop adds an asterisk to the label. Set required on the Input as well so native form validation matches."
        code={`<Field label="Full name" required>
  <Input required autoComplete="name" />
</Field>`}
      >
        <div className="stack" style={{ maxWidth: '20rem' }}>
          <Field label="Full name" required>
            <Input required autoComplete="name" />
          </Field>
        </div>
      </Example>

      <Example
        title="Sizes"
        description="Three control sizes. The size prop lives on the Input, not the Field."
        code={`<Field label="Small">
  <Input size="sm" placeholder="sm" />
</Field>
<Field label="Medium">
  <Input size="md" placeholder="md" />
</Field>
<Field label="Large">
  <Input size="lg" placeholder="lg" />
</Field>`}
      >
        <div className="stack" style={{ maxWidth: '20rem' }}>
          <Field label="Small">
            <Input size="sm" placeholder="sm" />
          </Field>
          <Field label="Medium">
            <Input size="md" placeholder="md" />
          </Field>
          <Field label="Large">
            <Input size="lg" placeholder="lg" />
          </Field>
        </div>
      </Example>

      <Example
        title="Disabled"
        description="Disable the Input with the native attribute. The label and hint stay readable."
        code={`<Field label="Plan" hint="Contact support to change your plan.">
  <Input disabled value="Pro (annual)" readOnly />
</Field>`}
      >
        <div className="stack" style={{ maxWidth: '20rem' }}>
          <Field label="Plan" hint="Contact support to change your plan.">
            <Input disabled value="Pro (annual)" readOnly />
          </Field>
        </div>
      </Example>

      <Example
        title="Bare Input"
        description="Input works outside a Field, but nothing is wired for you. Supply your own label and connect it with htmlFor and id."
        code={`<label htmlFor="doc-search">Search</label>
<Input id="doc-search" type="search" placeholder="Search docs" />`}
      >
        <div className="stack" style={{ maxWidth: '20rem' }}>
          <label htmlFor="doc-search">Search</label>
          <Input id="doc-search" type="search" placeholder="Search docs" />
        </div>
      </Example>

      <Example
        title="Skeleton"
        description="Set skeleton on the Field to swap the label and hint for shimmer lines, and on the Input to swap the control. The placeholder shares the loaded field's geometry, so nothing shifts when data arrives."
        code={`<Field skeleton label="Email" hint="Used for receipts and account recovery.">
  <Input skeleton />
</Field>
<Field label="Email" hint="Used for receipts and account recovery.">
  <Input type="email" placeholder="you@example.com" />
</Field>`}
      >
        <div className="stack" style={{ maxWidth: '20rem' }}>
          <Field skeleton label="Email" hint="Used for receipts and account recovery.">
            <Input skeleton />
          </Field>
          <Field label="Email" hint="Used for receipts and account recovery.">
            <Input type="email" placeholder="you@example.com" />
          </Field>
        </div>
      </Example>

      <h2>Props</h2>

      <h3>Field</h3>
      <PropsTable
        props={[
          {
            name: 'label',
            type: 'ReactNode',
            description: 'Label text. Rendered in a label element wired to the child Input.',
          },
          {
            name: 'hint',
            type: 'ReactNode',
            description:
              'Helper text below the input. Linked to the input through aria-describedby.',
          },
          {
            name: 'error',
            type: 'ReactNode',
            description:
              'Validation message. Replaces the hint, animates in with a shake, and sets aria-invalid on the input.',
          },
          {
            name: 'required',
            type: 'boolean',
            default: 'false',
            description:
              'Adds an asterisk to the label. Purely visual: also set required on the Input for native validation.',
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
          {
            name: 'className',
            type: 'string',
            description: 'Additional class on the wrapper element.',
          },
          {
            name: 'children',
            type: 'ReactNode',
            description: 'The control the field labels. Usually a single Input.',
          },
        ]}
      />

      <h3>Input</h3>
      <PropsTable
        props={[
          {
            name: 'size',
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: 'Control height and text size.',
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
          {
            name: 'id',
            type: 'string',
            description:
              'Overrides the id a surrounding Field would supply. Required when using Input without a Field.',
          },
          {
            name: '...props',
            type: "ComponentProps<'input'>",
            description:
              'All other native input props pass through: type, value, onChange, placeholder, disabled, and so on.',
          },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>
          Field generates an id and renders its label with <code>htmlFor</code> pointing at the
          child Input, so clicking the label focuses the control.
        </li>
        <li>
          The hint or error container has its own id, and the Input references it through{' '}
          <code>aria-describedby</code>.
        </li>
        <li>
          When <code>error</code> is set, the Input gets <code>aria-invalid="true"</code> and the
          message renders with <code>role="alert"</code>, so screen readers announce it
          immediately.
        </li>
        <li>
          The error shake and hint fade respect <code>prefers-reduced-motion</code>.
        </li>
        <li>
          A bare Input has no accessible name of its own. Provide a label element with{' '}
          <code>htmlFor</code>, or an <code>aria-label</code>.
        </li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>Wrap every form control in a Field. Reach for a bare Input only in composed widgets
          such as toolbars or search bars that already provide a label.</li>
        <li>Keep hints to one short sentence. Write error messages that say how to fix the
          problem, not just that it failed.</li>
        <li>Validate on submit or on blur rather than on every keystroke, and clear the error as
          soon as the user edits the value.</li>
        <li>Use <code>md</code> in standard forms, <code>sm</code> in dense tables and filter
          rows, and <code>lg</code> for prominent single-input screens such as sign-in.</li>
        <li>Do not use a placeholder as the only label. Placeholders disappear on input and are
          skipped by many assistive technologies.</li>
      </ul>
    </>
  );
}
