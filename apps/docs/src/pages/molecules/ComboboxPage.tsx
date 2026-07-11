import { Combobox, Field, Heading, Size, Stack, Text, TextTone } from '@glacier/react';
import { useState } from 'react';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { Example, PropsTable } from '../../docs-ui.tsx';

const FRUIT = [
  { value: 'apple', label: 'Apple', description: 'Crisp and sweet' },
  { value: 'banana', label: 'Banana', description: 'Soft tropical fruit' },
  { value: 'cherry', label: 'Cherry', description: 'Stone fruit', disabled: true },
  { value: 'plum', label: 'Plum', description: 'Juicy summer fruit' },
];

export function ComboboxPage() {
  const [fruit, setFruit] = useState('');
  const [query, setQuery] = useState('');

  return (
    <>
      <Heading level={1}>Combobox</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        Combobox combines a real text input with a filtered listbox. Type to narrow a large set
        of options, then use the keyboard or pointer to commit one value.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>A schematic of the editable input, suggestion list, and option rows.</Text>
      <ComponentBlueprint specId="combobox" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Basic"
        description="Focus or type in the input to open suggestions. The default filter matches each option's label or textValue."
        code={`import { Combobox } from '@glacier/react';

<Combobox
  aria-label="Fruit"
  placeholder="Search fruit"
  options={[
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'plum', label: 'Plum' },
  ]}
/>`}
      >
        <div style={{ width: '18rem' }}>
          <Combobox aria-label="Fruit" placeholder="Search fruit" options={FRUIT} />
        </div>
      </Example>

      <Example
        title="Controlled selection and query"
        description="Keep the committed value and editable query in parent state when selections need to drive the rest of the interface."
        code={`const [value, setValue] = useState('');
const [query, setQuery] = useState('');

<Combobox
  aria-label="Fruit"
  options={options}
  value={value}
  onValueChange={setValue}
  inputValue={query}
  onInputValueChange={setQuery}
/>`}
      >
        <Stack gap={3} width="full" maxWidth="xs">
          <Combobox
            aria-label="Fruit"
            placeholder="Search fruit"
            options={FRUIT}
            value={fruit}
            onValueChange={setFruit}
            inputValue={query}
            onInputValueChange={setQuery}
            fullWidth
          />
          <Text size={Size.Small} tone={TextTone.Muted}>
            Selected: <code>{fruit || 'none'}</code> · Query: <code>{query || 'empty'}</code>
          </Text>
        </Stack>
      </Example>

      <Example
        title="In a Field"
        description="Inside Field, Combobox inherits its label, hint id, and invalid state just like Input and Select."
        code={`<Field label="Favorite fruit" hint="Start typing to search." error={error}>
  <Combobox options={options} placeholder="Choose fruit" fullWidth />
</Field>`}
      >
        <div style={{ width: '18rem' }}>
          <Field label="Favorite fruit" hint="Start typing to search.">
            <Combobox options={FRUIT} placeholder="Choose fruit" fullWidth />
          </Field>
        </div>
      </Example>

      <Example
        title="Loading and empty states"
        description="Use loading while remote suggestions are in flight, and provide an actionable empty state when a query has no result."
        code={`<Combobox aria-label="Loading fruit" options={[]} loading />
<Combobox
  aria-label="Fruit"
  options={options}
  emptyState="No fruit matches this search."
/>`}
      >
        <Stack gap={4} width="full" maxWidth="xs">
          <Combobox aria-label="Loading fruit" options={[]} loading fullWidth />
          <Combobox
            aria-label="Fruit search"
            placeholder="Try a search with no match"
            options={FRUIT}
            emptyState="No fruit matches this search."
            fullWidth
          />
        </Stack>
      </Example>

      <Example
        title="Sizes and skeleton"
        description="The three control sizes share the same metrics as Input, Select, and Button. Skeleton preserves the loaded control's height."
        code={`<Combobox size={Size.Small} aria-label="Small" options={options} />
<Combobox size={Size.Medium} aria-label="Medium" options={options} />
<Combobox size={Size.Large} aria-label="Large" options={options} />
<Combobox skeleton options={options} />`}
      >
        <Stack gap={3} width="full" maxWidth="xs">
          <Combobox size={Size.Small} aria-label="Small" options={FRUIT} fullWidth />
          <Combobox size={Size.Medium} aria-label="Medium" options={FRUIT} fullWidth />
          <Combobox size={Size.Large} aria-label="Large" options={FRUIT} fullWidth />
          <Combobox skeleton options={FRUIT} fullWidth />
        </Stack>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'options', type: 'ComboboxOption[]', description: 'Options available to filter and select.' },
          { name: 'value', type: 'string', description: 'Controlled selected option value.' },
          { name: 'defaultValue', type: 'string', description: 'Initial selected option in uncontrolled usage.' },
          { name: 'onValueChange', type: '(value: string) => void', description: 'Called when an option is committed.' },
          { name: 'inputValue', type: 'string', description: 'Controlled editable query text.' },
          { name: 'onInputValueChange', type: '(value: string) => void', description: 'Called as the user types.' },
          { name: 'filter', type: '(option, inputValue) => boolean', description: 'Optional custom filter predicate.' },
          { name: 'emptyState', type: 'ReactNode', description: 'Content shown when the current query matches no options.' },
          { name: 'loading', type: 'boolean', default: 'false', description: 'Marks the listbox busy and shows Loading.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Shared control size.' },
          { name: 'name', type: 'string', description: 'Adds a hidden form input for the committed value.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>The editable input uses <code>role="combobox"</code> and keeps focus while arrows move the active listbox option.</li>
        <li><code>aria-activedescendant</code> identifies the active option, while Enter commits and Escape closes without changing the selection.</li>
        <li>Disabled options remain visible but are skipped by keyboard navigation and cannot be committed.</li>
        <li>The portaled listbox tracks the input on scroll and resize, then closes when the user presses Tab or clicks outside.</li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Use Combobox when users need to type to narrow a sizable list. Use Select for a short, stable set of options.</li>
        <li>Supply <code>textValue</code> whenever an option label is not a plain string, so filtering stays predictable.</li>
        <li>Keep committed values stable and serialize them through <code>name</code> when a native form submits the field.</li>
      </ul>
    </>
  );
}