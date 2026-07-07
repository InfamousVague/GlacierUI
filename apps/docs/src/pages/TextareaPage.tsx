import { Field, Textarea } from '@perfect/react';
import { useState } from 'react';
import { Example, PropsTable } from '../docs-ui.tsx';

export function TextareaPage() {
  const [bio, setBio] = useState('');

  return (
    <>
      <h1>Textarea</h1>
      <p className="lede">
        A multi-line text input that mirrors Input's surface, hairline border, and focus ring. It
        grows on demand and can be resized vertically.
      </p>

      <h2>Examples</h2>

      <Example
        title="Basic"
        description="A plain multi-line field. Drag the bottom edge to resize."
        code={`import { Textarea } from '@perfect/react';

<Textarea aria-label="Message" placeholder="Write a message" />`}
      >
        <div style={{ width: '22rem' }}>
          <Textarea aria-label="Message" placeholder="Write a message" />
        </div>
      </Example>

      <Example
        title="Sizes"
        description="size scales the font-size and padding to sm, md, or lg."
        code={`<Textarea aria-label="Small" size="sm" placeholder="Small" />
<Textarea aria-label="Medium" size="md" placeholder="Medium" />
<Textarea aria-label="Large" size="lg" placeholder="Large" />`}
      >
        <div className="stack" style={{ width: '22rem' }}>
          <Textarea aria-label="Small" size="sm" placeholder="Small" />
          <Textarea aria-label="Medium" size="md" placeholder="Medium" />
          <Textarea aria-label="Large" size="lg" placeholder="Large" />
        </div>
      </Example>

      <Example
        title="Controlled"
        description="Drive the value with state, the same as a native textarea."
        code={`const [bio, setBio] = useState('');

<Textarea
  aria-label="Bio"
  value={bio}
  onChange={(event) => setBio(event.target.value)}
  placeholder="Tell us about yourself"
/>`}
      >
        <div style={{ width: '22rem' }}>
          <Textarea
            aria-label="Bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Tell us about yourself"
          />
        </div>
      </Example>

      <Example
        title="In a Field"
        description="Inside a Field the textarea inherits the label, hint, and invalid wiring."
        code={`<Field label="Feedback" hint="Tell us what could be better.">
  <Textarea placeholder="Your thoughts" />
</Field>`}
      >
        <div style={{ width: '22rem' }}>
          <Field label="Feedback" hint="Tell us what could be better.">
            <Textarea placeholder="Your thoughts" />
          </Field>
        </div>
      </Example>

      <Example
        title="Skeleton"
        description="Set skeleton while the backing value loads. The placeholder matches the field's block height, so nothing shifts when the real control arrives."
        code={`<Textarea skeleton />
<Textarea aria-label="Message" placeholder="Write a message" />`}
      >
        <div className="stack" style={{ width: '22rem' }}>
          <Textarea skeleton />
          <Textarea aria-label="Message" placeholder="Write a message" />
        </div>
      </Example>

      <h2>Props</h2>
      <PropsTable
        props={[
          {
            name: 'size',
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: 'Scales the font-size and padding.',
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
          {
            name: 'value',
            type: 'string',
            description: 'Controlled value. Pair with onChange, as with a native textarea.',
          },
          {
            name: 'disabled',
            type: 'boolean',
            default: 'false',
            description: 'Disables the control.',
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
          Renders a native <code>textarea</code>, so it exposes the textbox role and the multiline
          state without extra wiring.
        </li>
        <li>Inside a Field the control inherits the label, hint, and invalid ids.</li>
        <li>
          Give it an <code>aria-label</code> when used on its own, or wrap it in a Field with a
          visible label.
        </li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>Reach for a Textarea when the answer can run to more than one line: notes, bios, feedback.</li>
        <li>Use a single-line Input for short values like a name or an email.</li>
        <li>Keep the default resize vertical so the layout width stays stable.</li>
      </ul>
    </>
  );
}
