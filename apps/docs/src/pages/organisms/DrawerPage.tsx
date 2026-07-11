import { Button, Drawer, Field, Heading, Input, Row, Size, Stack, Text, TextTone, Variant } from '@glacier/react';
import { useState } from 'react';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { Example, PropsTable } from '../../docs-ui.tsx';

export function DrawerPage() {
  const [basicOpen, setBasicOpen] = useState(false);
  const [floatingOpen, setFloatingOpen] = useState(false);
  const [side, setSide] = useState<'left' | 'right' | 'bottom' | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [filterName, setFilterName] = useState('');

  return (
    <>
      <Heading level={1}>Drawer</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        Drawer is a modal sheet for supporting work that benefits from preserving page context. It
        enters from a viewport edge, locks background scrolling, traps focus, and restores the
        opener when it closes.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>A schematic of the modal sheet, header, scrollable body, and optional action footer.</Text>
      <ComponentBlueprint specId="drawer" />

      <Heading level={2}>Examples</Heading>
      <Example
        title="Basic"
        description="The default right-side sheet suits filters, inspectors, and secondary workflows that need more space than a Popover."
        code={`import { Button, Drawer, Text } from '@glacier/react';

const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Open filters</Button>
<Drawer
  open={open}
  onClose={() => setOpen(false)}
  title="Filters"
  description="Narrow the visible results."
  footer={<Button onClick={() => setOpen(false)}>Apply filters</Button>}
>
  <Text>Drawer content scrolls independently from the page.</Text>
</Drawer>`}
      >
        <Button onClick={() => setBasicOpen(true)}>Open filters</Button>
        <Drawer
          open={basicOpen}
          onClose={() => setBasicOpen(false)}
          title="Filters"
          description="Narrow the visible results."
          footer={<Button onClick={() => setBasicOpen(false)}>Apply filters</Button>}
        >
          <Text>Drawer content scrolls independently from the page beneath the sheet.</Text>
        </Drawer>
      </Example>

      <Example
        title="Floating"
        description="With the docs' Floating layout preference (the default) every drawer already floats: a gutter on all edges and all corners rounded. The floating prop forces the mode per drawer regardless of the app layout; in the Full layout, drawers sit flush unless forced."
        code={`<Drawer floating open={open} onClose={() => setOpen(false)} title="Filters">
  <Text>The same sheet, floated off the edges.</Text>
</Drawer>`}
      >
        <Button onClick={() => setFloatingOpen(true)}>Open floating</Button>
        <Drawer
          floating
          open={floatingOpen}
          onClose={() => setFloatingOpen(false)}
          title="Filters"
          description="Narrow the visible results."
          footer={<Button onClick={() => setFloatingOpen(false)}>Apply filters</Button>}
        >
          <Text>The same sheet, floated off the edges with a gutter all around.</Text>
        </Drawer>
      </Example>

      <Example
        title="Sides"
        description="Use left or right for navigation and detail. Bottom creates a full-width mobile-friendly sheet with a capped height."
        code={`const [side, setSide] = useState<'left' | 'right' | 'bottom' | null>(null);

<Button onClick={() => setSide('left')}>Left</Button>
<Button onClick={() => setSide('right')}>Right</Button>
<Button onClick={() => setSide('bottom')}>Bottom</Button>
<Drawer open={side !== null} onClose={() => setSide(null)} side={side ?? 'right'} title="Panel">
  <Text>Content</Text>
</Drawer>`}
      >
        <Row gap={4} wrap>
          <Button variant={Variant.Outline} onClick={() => setSide('left')}>Left</Button>
          <Button variant={Variant.Outline} onClick={() => setSide('right')}>Right</Button>
          <Button variant={Variant.Outline} onClick={() => setSide('bottom')}>Bottom</Button>
          <Drawer open={side !== null} onClose={() => setSide(null)} side={side ?? 'right'} title="Panel">
            <Text>Choose the edge that preserves the most useful context for the work at hand.</Text>
          </Drawer>
        </Row>
      </Example>

      <Example
        title="Form workflow"
        description="The footer remains reachable beneath a scrollable body. Pair a ghost cancel action with the primary action on the right."
        code={`<Drawer
  open={open}
  onClose={() => setOpen(false)}
  title="Save filter"
  footer={
    <>
      <Button variant={Variant.Ghost} onClick={() => setOpen(false)}>Cancel</Button>
      <Button onClick={() => setOpen(false)}>Save filter</Button>
    </>
  }
>
  <Field label="Filter name"><Input /></Field>
</Drawer>`}
      >
        <Button onClick={() => setFormOpen(true)}>Save a filter</Button>
        <Drawer
          open={formOpen}
          onClose={() => setFormOpen(false)}
          title="Save filter"
          description="Name this view so the team can reuse it."
          footer={
            <>
              <Button variant={Variant.Ghost} onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button onClick={() => setFormOpen(false)}>Save filter</Button>
            </>
          }
        >
          <Field label="Filter name" hint="Visible to everyone with access to this project.">
            <Input value={filterName} onChange={(event) => setFilterName(event.target.value)} placeholder="Open issues" />
          </Field>
        </Drawer>
      </Example>

      <Example
        title="Persistent workflow"
        description="Set dismissible to false only when leaving would lose work or violate a workflow rule. Always provide a clear internal way forward."
        code={`<Drawer open={open} onClose={() => setOpen(false)} dismissible={false} title="Finish setup">
  <Button onClick={() => setOpen(false)}>Continue</Button>
</Drawer>`}
      >
        <PersistentDrawerExample />
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'open', type: 'boolean', description: 'Whether the sheet is mounted and shown.' },
          { name: 'onClose', type: '() => void', description: 'Called by permitted dismissal paths and the close action.' },
          { name: 'title', type: 'ReactNode', description: 'Heading that names the dialog.' },
          { name: 'description', type: 'ReactNode', description: 'Supporting text linked through aria-describedby.' },
          { name: 'side', type: "'left' | 'right' | 'bottom'", default: "'right'", description: 'Viewport edge from which the sheet enters.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Maximum width for left and right sheets.' },
          { name: 'floating', type: 'boolean', description: 'Forces the floating card per drawer. Unset, drawers follow the app layout via a root data-layout=\'floating\' attribute.' },
          { name: 'footer', type: 'ReactNode', description: 'Action row below the scrollable body.' },
          { name: 'dismissible', type: 'boolean', default: 'true', description: 'Enables Escape, backdrop press, and the close action.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>Drawer uses <code>role="dialog"</code> and <code>aria-modal="true"</code>, labelled by its title when present.</li>
        <li>Focus moves into the sheet, Tab remains trapped, document scroll locks, and focus returns to the opener after close.</li>
        <li>A persistent drawer ignores Escape and backdrop presses and omits the close action.</li>
        <li>Entry motion becomes instant for users who prefer reduced motion.</li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Use Drawer for secondary work that benefits from retaining page context. Use Modal for a short centered decision.</li>
        <li>Do not stack drawers or combine a Drawer with another modal layer.</li>
        <li>Keep persistent drawers rare and always give people a clearly named action inside the sheet.</li>
      </ul>
    </>
  );
}

function PersistentDrawerExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open required setup</Button>
      <Drawer open={open} onClose={() => setOpen(false)} dismissible={false} title="Finish setup">
        <Stack gap={4} width="full">
          <Text>Complete the required step to continue. Escape and the backdrop cannot close this sheet.</Text>
          <Button onClick={() => setOpen(false)}>Continue</Button>
        </Stack>
      </Drawer>
    </>
  );
}