import { Field, Input, Text, Toggle } from '@perfect/react';
import { useState } from 'react';
import { ComponentBlueprint } from '../Blueprint.tsx';
import { Example, PropsTable } from '../docs-ui.tsx';

const EyeIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M1.75 8s2.25-4.25 6.25-4.25S14.25 8 14.25 8 12 12.25 8 12.25 1.75 8 1.75 8Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="8" cy="8" r="1.75" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const GridIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const ListIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export function TogglePage() {
  return (
    <>
      <h1>Toggle</h1>
      <p className="lede">
        A press-state button for stateful actions like password reveal, view modes, and formatting
        controls. Toggle answers "is this mode active". For an on or off setting, use Switch.
      </p>

      <h2>Anatomy</h2>
      <p>An inspection with the exact spec measurements labelled on the box.</p>
      <ComponentBlueprint specId="toggle" />

      <h2>Examples</h2>

      <Example
        title="Basic"
        description="Pressed renders in the accent soft tint and exposes aria-pressed. Any other native button props are forwarded."
        code={`import { Toggle } from '@perfect/react';

<Toggle>Reveal</Toggle>
<Toggle defaultPressed>Pinned</Toggle>
<Toggle disabled>Locked</Toggle>`}
      >
        <Toggle>Reveal</Toggle>
        <Toggle defaultPressed>Pinned</Toggle>
        <Toggle disabled>Locked</Toggle>
      </Example>

      <Example
        title="Icon-only view switcher"
        description="iconOnly makes the toggle square, like IconButton. Give each one an aria-label."
        code={`<Toggle iconOnly aria-label="Grid view" defaultPressed>{GridIcon}</Toggle>
<Toggle iconOnly aria-label="List view">{ListIcon}</Toggle>`}
      >
        <Toggle iconOnly aria-label="Grid view" defaultPressed>
          {GridIcon}
        </Toggle>
        <Toggle iconOnly aria-label="List view">
          {ListIcon}
        </Toggle>
      </Example>

      <Example
        title="Password reveal"
        description="An icon-only Toggle overlaid on an Input flips the input type. Pair it with a Meter for strength on the Meter page."
        code={`const [visible, setVisible] = useState(false);

<Field label="Password">
  <div style={{ position: 'relative' }}>
    <Input type={visible ? 'text' : 'password'} defaultValue="hunter2" style={{ paddingInlineEnd: '3.25rem' }} />
    <Toggle
      iconOnly
      size="sm"
      aria-label="Show password"
      pressed={visible}
      onPressedChange={setVisible}
      style={{ position: 'absolute', top: '50%', right: '0.375rem', translate: '0 -50%' }}
    >
      {EyeIcon}
    </Toggle>
  </div>
</Field>`}
      >
        <RevealDemo />
      </Example>

      <Example
        title="Skeleton"
        description="The skeleton prop renders a placeholder with the toggle's exact geometry, square when iconOnly."
        code={`<Toggle skeleton />
<Toggle skeleton iconOnly />`}
      >
        <Toggle defaultPressed>Pinned</Toggle>
        <Toggle skeleton />
        <Toggle skeleton iconOnly />
      </Example>

      <h2>Props</h2>
      <PropsTable
        props={[
          { name: 'pressed', type: 'boolean', description: 'Controlled pressed state.' },
          { name: 'defaultPressed', type: 'boolean', default: 'false', description: 'Initial state when uncontrolled.' },
          { name: 'onPressedChange', type: '(pressed: boolean) => void', description: 'Called with the next state on every toggle.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Control size, shared with Button.' },
          { name: 'iconOnly', type: 'boolean', default: 'false', description: 'Square layout for a single icon.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: "Renders a placeholder with the component's exact geometry." },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the control.' },
          { name: 'aria-label', type: 'string', description: 'Accessible name. Required for icon-only toggles.' },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>
          Toggle is a real button with <code>aria-pressed</code>, so screen readers announce it as
          a toggle button with its current state.
        </li>
        <li>Icon-only toggles need an accessible name via aria-label.</li>
        <li>The press micro-animation collapses under prefers-reduced-motion.</li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>Toggle answers "is this mode active"; Switch answers "is this setting on". Pick by the question.</li>
        <li>Use Toggle for reveal buttons, view-mode switches, and formatting controls in toolbars.</li>
        <li>For a group of mutually exclusive view modes, reach for SegmentedControl instead.</li>
        <li>Toggle stays presentation-only: it reports the new state, and the app decides what it means.</li>
      </ul>
    </>
  );
}

function RevealDemo() {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ width: '20rem' }}>
      <Field label="Password">
        <div style={{ position: 'relative' }}>
          <Input
            type={visible ? 'text' : 'password'}
            defaultValue="hunter2"
            style={{ paddingInlineEnd: '3.25rem' }}
          />
          <Toggle
            iconOnly
            size="sm"
            aria-label="Show password"
            pressed={visible}
            onPressedChange={setVisible}
            style={{ position: 'absolute', top: '50%', right: '0.375rem', translate: '0 -50%' }}
          >
            {EyeIcon}
          </Toggle>
        </div>
      </Field>
      <Text size="xs" tone="subtle" style={{ marginTop: 'var(--perfect-space-2)' }}>
        Showing: <Text as="span" size="xs" mono>{visible ? 'text' : 'password'}</Text>
      </Text>
    </div>
  );
}
