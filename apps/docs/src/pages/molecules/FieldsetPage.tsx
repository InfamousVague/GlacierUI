import { useState } from 'react';
import {
  Button,
  Field,
  Fieldset,
  FormSection,
  Heading,
  Input,
  Size,
  Stack,
  Switch,
  Text,
  TextTone,
  Variant,
} from '@glacier/react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

function DisabledCascade() {
  const [locked, setLocked] = useState(true);
  return (
    <Stack gap={5} maxWidth="xs" width="full">
      <Switch label="Lock shipping details" checked={locked} onCheckedChange={setLocked} />
      <Fieldset
        legend="Shipping address"
        description="One disabled attribute on the fieldset disables every control inside."
        disabled={locked}
      >
        <Field label="Street">
          <Input placeholder="123 Fjord Lane" />
        </Field>
        <Field label="City">
          <Input placeholder="Reykjavik" />
        </Field>
      </Fieldset>
    </Stack>
  );
}

export function FieldsetPage() {
  return (
    <>
      <Heading level={1}>Fieldset &amp; Form Section</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        Fieldset groups related Fields under a styled native <code>legend</code>, and because it is
        a real <code>fieldset</code> element, its <code>disabled</code> attribute disables every
        nested control for free. FormSection is the heavier page-level grouping for settings and
        long forms; a FormSection often contains Fieldsets.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>A schematic of the anatomy with the exact spec measurements labelled.</Text>
      <ComponentBlueprint specId="fieldset" />
      <ComponentBlueprint specId="form-section" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Basic"
        description="A borderless group: the legend names the group, the description is announced with it through aria-describedby, and the Fields stack with an even token gap."
        code={`import { Fieldset, Field, Input } from '@glacier/react';

<Fieldset legend="Contact" description="How we reach you about your order.">
  <Field label="Email" hint="Used for receipts.">
    <Input type="email" placeholder="you@example.com" />
  </Field>
  <Field label="Phone">
    <Input type="tel" placeholder="+354 555 0100" />
  </Field>
</Fieldset>`}
      >
        <Stack gap={4} maxWidth="xs" width="full">
          <Fieldset legend="Contact" description="How we reach you about your order.">
            <Field label="Email" hint="Used for receipts.">
              <Input type="email" placeholder="you@example.com" />
            </Field>
            <Field label="Phone">
              <Input type="tel" placeholder="+354 555 0100" />
            </Field>
          </Fieldset>
        </Stack>
      </Example>

      <Example
        title="Bordered"
        description="The bordered variant draws the classic hairline box with the legend floating on the border. The borderless default reads better in modern single-column forms; reach for the box when groups sit side by side."
        code={`<Fieldset bordered legend="Billing" description="Charged at the end of each cycle.">
  <Field label="Cardholder">
    <Input autoComplete="cc-name" />
  </Field>
</Fieldset>`}
      >
        <Stack gap={4} maxWidth="xs" width="full">
          <Fieldset bordered legend="Billing" description="Charged at the end of each cycle.">
            <Field label="Cardholder">
              <Input autoComplete="cc-name" />
            </Field>
          </Fieldset>
        </Stack>
      </Example>

      <Example
        title="Native disabled cascade"
        description="Toggle the Switch: the fieldset's native disabled attribute removes every nested control from the tab order and blocks interaction, with no per-control wiring. This is the whole point of using the real element."
        code={`const [locked, setLocked] = useState(true);

<Switch label="Lock shipping details" checked={locked} onCheckedChange={setLocked} />
<Fieldset legend="Shipping address" disabled={locked}>
  <Field label="Street">
    <Input placeholder="123 Fjord Lane" />
  </Field>
  <Field label="City">
    <Input placeholder="Reykjavik" />
  </Field>
</Fieldset>`}
      >
        <DisabledCascade />
      </Example>

      <Example
        title="Form sections"
        description="FormSection is the page-level tier: a labelled section with a title row, optional actions aligned to it, and a divider prop that separates stacked sections. Its content is often one or more Fieldsets."
        code={`import { FormSection, Fieldset, Field, Input, Button, Variant } from '@glacier/react';

<FormSection
  title="Profile"
  description="How you appear across the workspace."
  actions={<Button variant={Variant.Outline} size={Size.Small}>Reset</Button>}
>
  <Field label="Display name">
    <Input placeholder="Ada Lovelace" />
  </Field>
</FormSection>

<FormSection divider title="Notifications" description="What we send and where.">
  <Fieldset legend="Email">
    <Field label="Address">
      <Input type="email" />
    </Field>
  </Fieldset>
</FormSection>`}
      >
        <Stack gap={8} maxWidth="sm" width="full">
          <FormSection
            title="Profile"
            description="How you appear across the workspace."
            actions={
              <Button variant={Variant.Outline} size={Size.Small}>
                Reset
              </Button>
            }
          >
            <Field label="Display name">
              <Input placeholder="Ada Lovelace" />
            </Field>
          </FormSection>
          <FormSection divider title="Notifications" description="What we send and where.">
            <Fieldset legend="Email">
              <Field label="Address">
                <Input type="email" placeholder="you@example.com" />
              </Field>
            </Fieldset>
          </FormSection>
        </Stack>
      </Example>

      <Example
        title="Skeleton"
        description="Set skeleton on the group to swap the legend, title, and description for shimmer lines; nested Fields and Inputs render their own skeletons, so nothing shifts when data arrives."
        code={`<FormSection skeleton title="Profile" description="How you appear across the workspace.">
  <Fieldset skeleton legend="Contact" description="How we reach you.">
    <Field skeleton label="Email" hint="Used for receipts.">
      <Input skeleton />
    </Field>
  </Fieldset>
</FormSection>`}
      >
        <Stack gap={4} maxWidth="xs" width="full">
          <FormSection skeleton title="Profile" description="How you appear across the workspace.">
            <Fieldset skeleton legend="Contact" description="How we reach you.">
              <Field skeleton label="Email" hint="Used for receipts.">
                <Input skeleton />
              </Field>
            </Fieldset>
          </FormSection>
        </Stack>
      </Example>

      <Heading level={2}>Props</Heading>

      <Heading level={3}>Fieldset</Heading>
      <PropsTable
        props={[
          {
            name: 'legend',
            type: 'ReactNode',
            description: 'Required. The group label, rendered as a native legend element.',
          },
          {
            name: 'description',
            type: 'ReactNode',
            description:
              'Muted supporting line under the legend, tied to the group through aria-describedby.',
          },
          {
            name: 'actions',
            type: 'ReactNode',
            description: 'Actions pinned to the end of the legend line.',
          },
          {
            name: 'disabled',
            type: 'boolean',
            default: 'false',
            description:
              'The native fieldset attribute: the browser disables every nested control, no per-control wiring.',
          },
          {
            name: 'bordered',
            type: 'boolean',
            default: 'false',
            description:
              'Draws the classic hairline box with the legend floating on the border. Borderless by default.',
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
          {
            name: 'children',
            type: 'ReactNode',
            description: 'The grouped controls, usually Fields.',
          },
        ]}
      />

      <Heading level={3}>FormSection</Heading>
      <PropsTable
        props={[
          {
            name: 'title',
            type: 'ReactNode',
            description: 'Required. The section title, rendered as a Heading that labels the section.',
          },
          {
            name: 'level',
            type: '1 | 2 | 3 | 4 | 5 | 6',
            default: '3',
            description: 'Semantic heading level for the title.',
          },
          {
            name: 'description',
            type: 'ReactNode',
            description: 'Muted supporting line under the title.',
          },
          {
            name: 'actions',
            type: 'ReactNode',
            description: 'Actions aligned to the end of the title row.',
          },
          {
            name: 'divider',
            type: 'boolean',
            default: 'false',
            description: 'Draws a hairline Divider above the section, for stacking multiple sections.',
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
          {
            name: 'children',
            type: 'ReactNode',
            description: 'The section content, often Fieldsets.',
          },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          Fieldset renders a real <code>fieldset</code> with a native <code>legend</code>, so
          screen readers announce the group name when focus enters any nested control.
        </li>
        <li>
          The Fieldset description has a generated id referenced from the fieldset through{' '}
          <code>aria-describedby</code>; a consumer-supplied <code>aria-describedby</code> is
          merged, not replaced.
        </li>
        <li>
          <code>disabled</code> is the native attribute: nested controls leave the tab order and
          block interaction without touching each control.
        </li>
        <li>
          The actions slot renders outside the <code>legend</code>, so button text never pollutes
          the group's accessible name.
        </li>
        <li>
          FormSection is a <code>section</code> with <code>aria-labelledby</code> pointing at its
          Heading, so each section is a named landmark region.
        </li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Use Fieldset to group a handful of related Fields that share one label, such as an
          address or a card. Use FormSection for the page-level tier above it; a section often
          contains several fieldsets.</li>
        <li>Prefer the borderless default in single-column forms; the bordered box earns its ink
          when groups sit next to unrelated content.</li>
        <li>Disable a whole group with the fieldset's <code>disabled</code> prop instead of
          disabling each control; the browser does the cascade for you.</li>
        <li>Pick the <code>level</code> that fits the page outline rather than the size you want;
          the visual size follows the level.</li>
        <li>Set <code>divider</code> on every stacked FormSection after the first so long settings
          pages separate cleanly.</li>
      </ul>
    </>
  );
}
