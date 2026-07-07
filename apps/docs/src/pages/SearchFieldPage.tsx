import { Kbd, SearchField } from '@perfect/react';
import { useState } from 'react';
import { Example, PropsTable } from '../docs-ui.tsx';

export function SearchFieldPage() {
  const [query, setQuery] = useState('');

  return (
    <>
      <h1>SearchField</h1>
      <p className="lede">
        A search input with a leading magnifier, a clear button that appears once there is a value,
        and an optional slot for a keyboard shortcut hint.
      </p>

      <h2>Examples</h2>

      <Example
        title="Basic"
        description="A search box with the default placeholder. Type to reveal the clear button."
        code={`import { SearchField } from '@perfect/react';

<SearchField aria-label="Search" />`}
      >
        <div style={{ width: '22rem' }}>
          <SearchField aria-label="Search" />
        </div>
      </Example>

      <Example
        title="Controlled"
        description="Drive it with value and onValueChange. Clearing reports an empty string."
        code={`const [query, setQuery] = useState('');

<SearchField aria-label="Search" value={query} onValueChange={setQuery} />`}
      >
        <div style={{ width: '22rem' }}>
          <SearchField aria-label="Search" value={query} onValueChange={setQuery} />
        </div>
      </Example>

      <Example
        title="With a shortcut hint"
        description="Pass a shortcut node, such as a Kbd, to hint at the key that focuses the field."
        code={`<SearchField aria-label="Search" shortcut={<Kbd>/</Kbd>} />`}
      >
        <div style={{ width: '22rem' }}>
          <SearchField aria-label="Search" shortcut={<Kbd>/</Kbd>} />
        </div>
      </Example>

      <Example
        title="Sizes"
        description="size scales the height and font-size to sm, md, or lg."
        code={`<SearchField aria-label="Small" size="sm" />
<SearchField aria-label="Medium" size="md" />
<SearchField aria-label="Large" size="lg" />`}
      >
        <div className="stack" style={{ width: '22rem' }}>
          <SearchField aria-label="Small" size="sm" />
          <SearchField aria-label="Medium" size="md" />
          <SearchField aria-label="Large" size="lg" />
        </div>
      </Example>

      <Example
        title="Skeleton"
        description="Set skeleton while results load. The placeholder is the full control shape, so the field does not shift when the real input arrives."
        code={`<SearchField skeleton />
<SearchField aria-label="Search" />`}
      >
        <div className="stack" style={{ width: '22rem' }}>
          <SearchField skeleton />
          <SearchField aria-label="Search" />
        </div>
      </Example>

      <h2>Props</h2>
      <PropsTable
        props={[
          { name: 'value', type: 'string', description: 'Controlled value.' },
          {
            name: 'defaultValue',
            type: 'string',
            default: "''",
            description: 'Initial value for uncontrolled usage.',
          },
          {
            name: 'onValueChange',
            type: '(value: string) => void',
            description: 'Called with the current text on every change, and with an empty string when cleared.',
          },
          {
            name: 'placeholder',
            type: 'string',
            default: "'Search'",
            description: 'Placeholder text.',
          },
          {
            name: 'size',
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: 'Scales the height and font-size.',
          },
          {
            name: 'shortcut',
            type: 'ReactNode',
            description: 'Right-aligned slot for a keyboard shortcut hint, e.g. a Kbd.',
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
          {
            name: 'aria-label',
            type: 'string',
            description: 'Accessible name. Not needed inside a Field with a label.',
          },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>
          Renders a native <code>input type="search"</code>, so it exposes the searchbox role. The
          native clear affordance is hidden in favor of the styled clear button.
        </li>
        <li>
          The clear button carries an <code>aria-label</code> of "Clear search" and only mounts when
          there is a value to clear.
        </li>
        <li>The magnifier is decorative and marked aria-hidden.</li>
        <li>
          Give it an <code>aria-label</code> when used on its own, or wrap it in a Field with a
          visible label.
        </li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>Use it for filtering a list or querying results, not for arbitrary short text.</li>
        <li>Add a shortcut hint when a keyboard accelerator focuses the field.</li>
        <li>Read onValueChange to filter as the user types, and treat the empty string as cleared.</li>
      </ul>
    </>
  );
}
