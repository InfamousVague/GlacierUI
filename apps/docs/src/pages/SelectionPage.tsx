import { useState } from 'react';
import { Card, Checkbox, Radio, Switch } from '@perfect/react';
import { Example, PropsTable } from '../docs-ui.tsx';

export function SelectionPage() {
  const [subscribed, setSubscribed] = useState(true);

  return (
    <>
      <h1>Selection</h1>
      <p className="lede">
        Checkbox, Radio, and Switch are the three standard selection controls. Each one wraps a
        native input, so forms, focus, and keyboard behavior come from the platform.
      </p>

      <h2>Examples</h2>

      <Example
        title="Checkbox states"
        description="A checkbox starts unchecked. Pass defaultChecked for an initial on state, or disabled to lock it. The check mark draws in as an animated path."
        code={`import { Checkbox, Radio, Switch, Card } from '@perfect/react';

<Checkbox label="Unchecked" />
<Checkbox label="Checked by default" defaultChecked />
<Checkbox label="Disabled" disabled />
<Checkbox label="Disabled and checked" defaultChecked disabled />`}
      >
        <div className="stack">
          <Checkbox label="Unchecked" />
          <Checkbox label="Checked by default" defaultChecked />
          <Checkbox label="Disabled" disabled />
          <Checkbox label="Disabled and checked" defaultChecked disabled />
        </div>
      </Example>

      <Example
        title="Controlled checkbox"
        description="Pass checked and onCheckedChange to control the state yourself. The callback receives the next boolean value."
        code={`const [subscribed, setSubscribed] = useState(true);

<Checkbox
  label="Email me release notes"
  checked={subscribed}
  onCheckedChange={setSubscribed}
/>
<p>{subscribed ? 'Subscribed' : 'Not subscribed'}</p>`}
      >
        <div className="stack">
          <Checkbox
            label="Email me release notes"
            checked={subscribed}
            onCheckedChange={setSubscribed}
          />
          <p>{subscribed ? 'Subscribed' : 'Not subscribed'}</p>
        </div>
      </Example>

      <Example
        title="Radio group"
        description="Radios group by their name attribute, exactly like native radios. Wrap the set in an element with role radiogroup and an aria-label so assistive technology announces it as one group."
        code={`<div role="radiogroup" aria-label="Billing plan" className="stack">
  <Radio name="plan" value="hobby" label="Hobby" defaultChecked />
  <Radio name="plan" value="pro" label="Pro" />
  <Radio name="plan" value="team" label="Team" />
</div>`}
      >
        <div role="radiogroup" aria-label="Billing plan" className="stack">
          <Radio name="plan" value="hobby" label="Hobby" defaultChecked />
          <Radio name="plan" value="pro" label="Pro" />
          <Radio name="plan" value="team" label="Team" />
        </div>
      </Example>

      <Example
        title="Switch"
        description="Switch shares its props with Checkbox but renders with role switch and a spring-animated thumb. Use it for settings that apply immediately."
        code={`<Switch label="Wi-Fi" defaultChecked />
<Switch label="Bluetooth" />
<Switch label="Airplane mode" disabled />`}
      >
        <div className="stack">
          <Switch label="Wi-Fi" defaultChecked />
          <Switch label="Bluetooth" />
          <Switch label="Airplane mode" disabled />
        </div>
      </Example>

      <Example
        title="Settings list"
        description="Switches read well as trailing controls in a settings list. Each row keeps its text on the left and the switch on the right inside a Card."
        code={`const row: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '2rem',
};

<Card elevation={2} style={{ padding: '1.25rem', display: 'grid', gap: '0.875rem' }}>
  <div style={row}>
    <span>Notifications</span>
    <Switch aria-label="Notifications" defaultChecked />
  </div>
  <div style={row}>
    <span>Sound effects</span>
    <Switch aria-label="Sound effects" defaultChecked />
  </div>
  <div style={row}>
    <span>Analytics</span>
    <Switch aria-label="Analytics" />
  </div>
</Card>`}
      >
        <Card
          elevation={2}
          style={{ padding: '1.25rem', display: 'grid', gap: '0.875rem', minWidth: '18rem' }}
        >
          {[
            { name: 'Notifications', on: true },
            { name: 'Sound effects', on: true },
            { name: 'Analytics', on: false },
          ].map((setting) => (
            <div
              key={setting.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '2rem',
              }}
            >
              <span>{setting.name}</span>
              <Switch aria-label={setting.name} defaultChecked={setting.on} />
            </div>
          ))}
        </Card>
      </Example>

      <Example
        title="Skeleton"
        description="Every selection control takes a skeleton prop that renders a placeholder with the control's exact indicator geometry, plus a text line when a label is set. Nothing shifts when the loaded control arrives."
        code={`<Checkbox skeleton label="Email me release notes" />
<Radio skeleton label="Hobby" />
<Switch skeleton label="Wi-Fi" />`}
      >
        <div className="row" style={{ gap: '3rem' }}>
          <div className="stack">
            <Checkbox label="Email me release notes" defaultChecked />
            <Radio name="skeleton-demo" label="Hobby" defaultChecked />
            <Switch label="Wi-Fi" defaultChecked />
          </div>
          <div className="stack">
            <Checkbox skeleton label="Email me release notes" />
            <Radio skeleton label="Hobby" />
            <Switch skeleton label="Wi-Fi" />
          </div>
        </div>
      </Example>

      <h2>Props</h2>

      <h3>Checkbox</h3>
      <p>
        Remaining native input props (<code>name</code>, <code>value</code>,{' '}
        <code>aria-label</code>, and so on) are forwarded to the underlying input.
      </p>
      <PropsTable
        props={[
          {
            name: 'label',
            type: 'ReactNode',
            description:
              'Text rendered next to the box. The whole label is the hit target, so clicking it toggles the checkbox.',
          },
          {
            name: 'checked',
            type: 'boolean',
            description: 'Controlled checked state. Pair with onCheckedChange.',
          },
          {
            name: 'defaultChecked',
            type: 'boolean',
            default: 'false',
            description: 'Initial state when uncontrolled.',
          },
          {
            name: 'onCheckedChange',
            type: '(checked: boolean) => void',
            description: 'Called with the next checked state on every toggle.',
          },
          {
            name: 'disabled',
            type: 'boolean',
            default: 'false',
            description: 'Disables the input and dims the control.',
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
        ]}
      />

      <h3>Radio</h3>
      <p>
        Radio is uncontrolled friendly: give each option the same <code>name</code>, a distinct{' '}
        <code>value</code>, and use <code>defaultChecked</code> for the initial selection. All
        native input props pass through.
      </p>
      <PropsTable
        props={[
          {
            name: 'label',
            type: 'ReactNode',
            description: 'Text rendered next to the dot. Clicking it selects the radio.',
          },
          {
            name: 'name',
            type: 'string',
            description: 'Native attribute. Radios with the same name form one group.',
          },
          {
            name: 'value',
            type: 'string',
            description: 'Native attribute. The value this option submits when selected.',
          },
          {
            name: 'defaultChecked',
            type: 'boolean',
            default: 'false',
            description: 'Native attribute. Marks the initially selected option.',
          },
          {
            name: 'disabled',
            type: 'boolean',
            default: 'false',
            description: 'Disables the input and dims the control.',
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
        ]}
      />

      <h3>Switch</h3>
      <p>Switch takes the same props as Checkbox and forwards the rest to its input.</p>
      <PropsTable
        props={[
          {
            name: 'label',
            type: 'ReactNode',
            description: 'Text rendered next to the track. Clicking it toggles the switch.',
          },
          {
            name: 'checked',
            type: 'boolean',
            description: 'Controlled on state. Pair with onCheckedChange.',
          },
          {
            name: 'defaultChecked',
            type: 'boolean',
            default: 'false',
            description: 'Initial state when uncontrolled.',
          },
          {
            name: 'onCheckedChange',
            type: '(checked: boolean) => void',
            description: 'Called with the next on state on every toggle.',
          },
          {
            name: 'size',
            type: "'sm' | 'md'",
            default: "'md'",
            description: 'md matches Apple switch proportions; sm fits dense rows.',
          },
          {
            name: 'disabled',
            type: 'boolean',
            default: 'false',
            description: 'Disables the input and dims the control.',
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>
          All three components render a real native input inside a label element, so focus, form
          submission, and screen reader semantics come from the browser.
        </li>
        <li>
          Switch sets <code>role="switch"</code> on its input, so screen readers announce on and
          off states.
        </li>
        <li>
          Radio groups use native keyboard behavior: Tab moves focus into the group, arrow keys
          move selection between radios that share a name.
        </li>
        <li>
          Space toggles a focused checkbox or switch.
        </li>
        <li>
          Check mark and thumb animations are skipped when <code>prefers-reduced-motion</code> is
          set; state changes still apply instantly.
        </li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>Use Checkbox for independent yes or no options and multi-select lists.</li>
        <li>
          Use Radio when exactly one option must be chosen from a small set. For two to five short
          inline choices, SegmentedControl is usually a better fit.
        </li>
        <li>
          Use Switch for settings that take effect immediately. In a form that is submitted with a
          button, prefer Checkbox.
        </li>
        <li>
          Prefer the <code>label</code> prop over separate text so the text is part of the hit
          target and stays wired to the input.
        </li>
        <li>
          When a Switch has no visible label, as in a settings row with separate text, give it an{' '}
          <code>aria-label</code>.
        </li>
        <li>
          Wrap radio sets in an element with <code>role="radiogroup"</code> and a label unless a
          fieldset with a legend already groups them.
        </li>
      </ul>
    </>
  );
}
