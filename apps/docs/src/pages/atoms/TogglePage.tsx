import { Field, Input, Text, Toggle, Heading, Size, TextTone } from '@glacier/react';
import { Eye, Grid2x2, List } from '@glacier/icons';
import { useState } from 'react';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { Example, PropsTable } from '../../docs-ui.tsx';

const EyeIcon = <Eye size={16} />;
const GridIcon = <Grid2x2 size={16} />;
const ListIcon = <List size={16} />;

export function TogglePage() {
  return (
    <>
      <Heading level={1}>Toggle</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A press-state button for stateful actions like password reveal, view modes, and formatting
        controls. Toggle answers "is this mode active". For an on or off setting, use Switch.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the box.</Text>
      <ComponentBlueprint specId="toggle" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Basic"
        description="Pressed renders in the accent soft tint and exposes aria-pressed. Any other native button props are forwarded."
        code={`import { Toggle } from '@glacier/react';

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
      size={Size.Small}
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

      <Heading level={2}>Props</Heading>
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

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          Toggle is a real button with <code>aria-pressed</code>, so screen readers announce it as
          a toggle button with its current state.
        </li>
        <li>Icon-only toggles need an accessible name via aria-label.</li>
        <li>The press micro-animation collapses under prefers-reduced-motion.</li>
      </ul>

      <Heading level={2}>Usage</Heading>
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
            size={Size.Small}
            aria-label="Show password"
            pressed={visible}
            onPressedChange={setVisible}
            style={{ position: 'absolute', top: '50%', right: '0.375rem', translate: '0 -50%' }}
          >
            {EyeIcon}
          </Toggle>
        </div>
      </Field>
      <Text size={Size.XSmall} tone={TextTone.Subtle} style={{ marginTop: 'var(--glacier-space-2)' }}>
        Showing: <Text as="span" size={Size.XSmall} mono>{visible ? 'text' : 'password'}</Text>
      </Text>
    </div>
  );
}
