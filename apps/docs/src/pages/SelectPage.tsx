import { Field, Select } from '@perfect/react';
import { useState } from 'react';
import { Example, PropsTable } from '../docs-ui.tsx';

const FRUIT = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'plum', label: 'Plum' },
];

export function SelectPage() {
  const [region, setRegion] = useState('eu');

  return (
    <>
      <h1>Select</h1>
      <p className="lede">
        A styled replacement for the native select. The trigger shares Input metrics so it lines
        up in forms, and the dropdown is a glass panel that animates open. This site uses it for
        the theme, density, and accent pickers in the top bar.
      </p>

      <h2>Examples</h2>

      <Example
        title="Basic"
        description="Pass options and an aria-label. Without a value or defaultValue the trigger shows the placeholder."
        code={`import { Select } from '@perfect/react';

<Select
  aria-label="Fruit"
  placeholder="Pick a fruit"
  options={[
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
  ]}
/>`}
      >
        <Select aria-label="Fruit" placeholder="Pick a fruit" options={FRUIT} />
      </Example>

      <Example
        title="Controlled"
        description="Drive the value with state through value and onValueChange."
        code={`const [region, setRegion] = useState('eu');

<Select
  aria-label="Region"
  value={region}
  onValueChange={setRegion}
  options={[
    { value: 'us', label: 'United States' },
    { value: 'eu', label: 'Europe' },
    { value: 'apac', label: 'Asia Pacific' },
  ]}
/>`}
      >
        <Select
          aria-label="Region"
          value={region}
          onValueChange={setRegion}
          options={[
            { value: 'us', label: 'United States' },
            { value: 'eu', label: 'Europe' },
            { value: 'apac', label: 'Asia Pacific' },
          ]}
        />
        <span>
          Selected: <code>{region}</code>
        </span>
      </Example>

      <Example
        title="Sizes"
        description="Three sizes share the control height scale, so a Select next to an Input or Button of the same size aligns exactly."
        code={`<Select size="sm" aria-label="Small" options={options} defaultValue="apple" />
<Select size="md" aria-label="Medium" options={options} defaultValue="apple" />
<Select size="lg" aria-label="Large" options={options} defaultValue="apple" />`}
      >
        <Select size="sm" aria-label="Small" options={FRUIT} defaultValue="apple" />
        <Select size="md" aria-label="Medium" options={FRUIT} defaultValue="apple" />
        <Select size="lg" aria-label="Large" options={FRUIT} defaultValue="apple" />
      </Example>

      <Example
        title="In a Field"
        description="Inside a Field the trigger picks up the label, hint, and error wiring automatically, like Input does."
        code={`<Field label="Favorite fruit" hint="You can change this later.">
  <Select placeholder="Pick one" options={options} fullWidth />
</Field>`}
      >
        <div style={{ width: '18rem' }}>
          <Field label="Favorite fruit" hint="You can change this later.">
            <Select placeholder="Pick one" options={FRUIT} fullWidth />
          </Field>
        </div>
      </Example>

      <Example
        title="Disabled"
        description="Disable single options or the whole control."
        code={`<Select
  aria-label="Plan"
  defaultValue="pro"
  options={[
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
    { value: 'team', label: 'Team', disabled: true },
  ]}
/>
<Select aria-label="Locked" options={options} defaultValue="apple" disabled />`}
      >
        <Select
          aria-label="Plan"
          defaultValue="pro"
          options={[
            { value: 'free', label: 'Free' },
            { value: 'pro', label: 'Pro' },
            { value: 'team', label: 'Team', disabled: true },
          ]}
        />
        <Select aria-label="Locked" options={FRUIT} defaultValue="apple" disabled />
      </Example>

      <Example
        title="Skeleton"
        description="Set skeleton to render a silent placeholder with the trigger's exact geometry: control height by size, the Input radius, and 11rem wide unless fullWidth. No menu, no button role."
        code={`<Select skeleton options={options} />
<Select aria-label="Fruit" options={options} defaultValue="apple" />`}
      >
        <Select skeleton options={FRUIT} />
        <Select aria-label="Fruit" options={FRUIT} defaultValue="apple" />
      </Example>

      <h2>Props</h2>
      <h3>Select</h3>
      <PropsTable
        props={[
          { name: 'options', type: 'SelectOption[]', description: 'The choices to render in the dropdown.' },
          { name: 'value', type: 'string', description: 'Controlled selected value.' },
          { name: 'defaultValue', type: 'string', description: 'Initial value for uncontrolled usage.' },
          { name: 'onValueChange', type: '(value: string) => void', description: 'Called with the new value when an option is committed.' },
          { name: 'placeholder', type: 'string', default: "'Select…'", description: 'Trigger text while nothing is selected.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Control size, shared with Input and Button.' },
          { name: 'fullWidth', type: 'boolean', default: 'false', description: 'Stretches the trigger to fill its container.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the whole control.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: "Renders a placeholder with the component's exact geometry." },
          { name: 'name', type: 'string', description: 'Renders a hidden input so the value submits with forms.' },
          { name: 'aria-label', type: 'string', description: 'Accessible name. Not needed inside a Field with a label.' },
        ]}
      />
      <h3>options entries</h3>
      <PropsTable
        props={[
          { name: 'value', type: 'string', description: 'Unique value reported through onValueChange.' },
          { name: 'label', type: 'ReactNode', description: 'Content shown in the trigger and the dropdown row.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Renders the option but prevents selecting it.' },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>
          Follows the WAI-ARIA listbox pattern: the trigger is a button with{' '}
          <code>aria-haspopup="listbox"</code> and <code>aria-expanded</code>, the dropdown is a{' '}
          <code>role="listbox"</code> with <code>aria-activedescendant</code> tracking the
          highlighted option.
        </li>
        <li>
          Arrow keys open the menu from the trigger and move the highlight inside it, skipping
          disabled options. Home and End jump to the extremes. Enter or Space commits, Escape
          closes and returns focus to the trigger.
        </li>
        <li>Clicking outside closes the menu without changing the value.</li>
        <li>Inside a Field, the trigger inherits the label, hint id, and invalid state.</li>
        <li>The open and close animations collapse to instant under prefers-reduced-motion.</li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>Use Select for 4 to 15 options. Below that, a SegmentedControl or Radios show every choice at once.</li>
        <li>Keep option labels short so the trigger never truncates the selected value.</li>
        <li>Set fullWidth inside forms so the trigger spans the Field like an Input.</li>
        <li>The dropdown positions below the trigger. Leave room in cramped layouts or scrollable panels.</li>
      </ul>
    </>
  );
}
