import { Field, Heading, MultiSelect, Size, Stack, Text, TextTone } from '@glacier/react';
import { useState } from 'react';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { Example, PropsTable } from '../../docs-ui.tsx';

const FRUIT = [
  { value: 'apple', label: 'Apple', description: 'Crisp and sweet' },
  { value: 'banana', label: 'Banana', description: 'Soft tropical fruit' },
  { value: 'cherry', label: 'Cherry', description: 'Stone fruit', disabled: true },
  { value: 'plum', label: 'Plum', description: 'Juicy summer fruit' },
];

export function MultiSelectPage() {
  const [fruit, setFruit] = useState<string[]>(['apple']);
  const [query, setQuery] = useState('');

  return (
    <>
      <Heading level={1}>MultiSelect</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        MultiSelect combines an editable search input with removable selected-value tags. It is for
        a set of choices that users may narrow by typing and revise without reopening a separate
        control for every removal.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>A schematic of the tag-bearing control, editable input, and portaled multi-select listbox.</Text>
      <ComponentBlueprint specId="multi-select" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Basic"
        description="Focus or type to open suggestions. Each click toggles an option and leaves the list open for the next selection."
        code={`import { MultiSelect } from '@glacier/react';

<MultiSelect
  aria-label="Fruit"
  placeholder="Search fruit"
  options={[
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'plum', label: 'Plum' },
  ]}
/>`}
      >
        <div style={{ width: '20rem' }}>
          <MultiSelect aria-label="Fruit" placeholder="Search fruit" options={FRUIT} />
        </div>
      </Example>

      <Example
        title="Controlled selection and query"
        description="Use a controlled string array when selections drive filters, permissions, assignments, or any other parent state."
        code={`const [value, setValue] = useState(['apple']);
const [query, setQuery] = useState('');

<MultiSelect
  aria-label="Fruit"
  options={options}
  value={value}
  onValueChange={setValue}
  inputValue={query}
  onInputValueChange={setQuery}
/>`}
      >
        <Stack gap={3} width="full" maxWidth="md">
          <MultiSelect
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
            Selected: <code>{fruit.join(', ') || 'none'}</code> · Query: <code>{query || 'empty'}</code>
          </Text>
        </Stack>
      </Example>

      <Example
        title="In a Field and native form"
        description="Field supplies label and validation wiring. A name produces one hidden input per selected value for ordinary form submission."
        code={`<Field label="Favorite fruit" hint="Choose every fruit you enjoy.">
  <MultiSelect name="fruit" options={options} placeholder="Choose fruit" fullWidth />
</Field>`}
      >
        <div style={{ width: '20rem' }}>
          <Field label="Favorite fruit" hint="Choose every fruit you enjoy.">
            <MultiSelect name="fruit" options={FRUIT} placeholder="Choose fruit" fullWidth />
          </Field>
        </div>
      </Example>

      <Example
        title="Loading and empty states"
        description="Use loading while remote suggestions are in flight, and provide a next step when a query has no result."
        code={`<MultiSelect aria-label="Loading fruit" options={[]} loading />
<MultiSelect
  aria-label="Fruit"
  options={options}
  emptyState="No fruit matches this search."
/>`}
      >
        <Stack gap={4} width="full" maxWidth="xs">
          <MultiSelect aria-label="Loading fruit" options={[]} loading fullWidth />
          <MultiSelect
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
        description="Tags wrap within the shared control-height scale. Skeleton preserves the unloaded control footprint."
        code={`<MultiSelect size={Size.Small} aria-label="Small" options={options} defaultValue={['apple']} />
<MultiSelect size={Size.Medium} aria-label="Medium" options={options} defaultValue={['apple']} />
<MultiSelect size={Size.Large} aria-label="Large" options={options} defaultValue={['apple']} />
<MultiSelect skeleton options={options} />`}
      >
        <Stack gap={3} width="full" maxWidth="md">
          <MultiSelect size={Size.Small} aria-label="Small" options={FRUIT} defaultValue={['apple']} fullWidth />
          <MultiSelect size={Size.Medium} aria-label="Medium" options={FRUIT} defaultValue={['apple']} fullWidth />
          <MultiSelect size={Size.Large} aria-label="Large" options={FRUIT} defaultValue={['apple']} fullWidth />
          <MultiSelect skeleton options={FRUIT} fullWidth />
        </Stack>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'options', type: 'MultiSelectOption[]', description: 'Options available to filter and toggle.' },
          { name: 'value', type: 'string[]', description: 'Controlled selected option values.' },
          { name: 'defaultValue', type: 'string[]', description: 'Initial selected values in uncontrolled usage.' },
          { name: 'onValueChange', type: '(value: string[]) => void', description: 'Called whenever the selected array changes.' },
          { name: 'inputValue', type: 'string', description: 'Controlled editable query text.' },
          { name: 'onInputValueChange', type: '(value: string) => void', description: 'Called as the user types.' },
          { name: 'filter', type: '(option, inputValue) => boolean', description: 'Optional custom filter predicate.' },
          { name: 'emptyState', type: 'ReactNode', description: 'Content shown when the current query matches no options.' },
          { name: 'loading', type: 'boolean', default: 'false', description: 'Marks the listbox busy and shows Loading.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Shared control size.' },
          { name: 'name', type: 'string', description: 'Adds one hidden input for each selected form value.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>The editable input uses <code>role="combobox"</code> and keeps focus while arrows move the active suggestion.</li>
        <li>The suggestion panel is a <code>listbox</code> with <code>aria-multiselectable="true"</code>; every selected option exposes <code>aria-selected="true"</code>.</li>
        <li>Enter toggles the active enabled option, Backspace removes the final tag when the query is empty, and each tag has a labelled remove button.</li>
        <li>Escape closes the portaled listbox without changing selection, while Tab closes it and continues normal navigation.</li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Use MultiSelect for a moderately large set of independent choices. Use Checkbox groups when every option should remain visible.</li>
        <li>Use a stable machine-readable <code>value</code> and one <code>name</code> to submit repeated values in a native form.</li>
        <li>Provide <code>textValue</code> whenever an option label is not plain text, so filtering remains predictable.</li>
      </ul>
    </>
  );
}