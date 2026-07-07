import { Button, Field, IconButton, Input, Popover, Row, SidebarItem, Stack, Text } from '@perfect/react';
import { useState } from 'react';
import { Example, PropsTable } from '../docs-ui.tsx';

export function PopoverPage() {
  const [controlledOpen, setControlledOpen] = useState(false);

  return (
    <>
      <h1>Popover</h1>
      <p className="lede">
        Popover is a floating panel anchored to a trigger. Use it for menus, filters, and rich
        tooltips that need real content instead of a single line of text.
      </p>

      <h2>Examples</h2>

      <Example
        title="Basic"
        description="Pass the trigger as a single element. Its ref, click, and aria attributes are wired for you, and the panel holds any content you like."
        code={`import { Button, Popover, Stack, Text } from '@perfect/react';

<Popover
  aria-label="About this release"
  trigger={<Button>What's new</Button>}
>
  <Stack gap={2}>
    <Text weight="semibold">Version 2.4</Text>
    <Text tone="muted">
      Fluid spacing and a hover step on every color ramp.
    </Text>
  </Stack>
</Popover>`}
      >
        <Popover aria-label="About this release" trigger={<Button>What's new</Button>}>
          <Stack gap={2}>
            <Text weight="semibold">Version 2.4</Text>
            <Text tone="muted">Fluid spacing and a hover step on every color ramp.</Text>
          </Stack>
        </Popover>
      </Example>

      <Example
        title="Placements"
        description="The placement prop sets the side the panel opens from. Each panel still flips and clamps if it would run past the edge of the screen."
        code={`<Popover placement="bottom" aria-label="Opens below" trigger={<Button>Bottom</Button>}>
  <Text>Opens below the trigger.</Text>
</Popover>
<Popover placement="top" aria-label="Opens above" trigger={<Button>Top</Button>}>
  <Text>Opens above the trigger.</Text>
</Popover>
<Popover placement="right" aria-label="Opens to the right" trigger={<Button>Right</Button>}>
  <Text>Opens to the right.</Text>
</Popover>
<Popover placement="left" aria-label="Opens to the left" trigger={<Button>Left</Button>}>
  <Text>Opens to the left.</Text>
</Popover>`}
      >
        <Row gap={3} wrap>
          <Popover placement="bottom" aria-label="Opens below" trigger={<Button>Bottom</Button>}>
            <Text>Opens below the trigger.</Text>
          </Popover>
          <Popover placement="top" aria-label="Opens above" trigger={<Button>Top</Button>}>
            <Text>Opens above the trigger.</Text>
          </Popover>
          <Popover placement="right" aria-label="Opens to the right" trigger={<Button>Right</Button>}>
            <Text>Opens to the right.</Text>
          </Popover>
          <Popover placement="left" aria-label="Opens to the left" trigger={<Button>Left</Button>}>
            <Text>Opens to the left.</Text>
          </Popover>
        </Row>
      </Example>

      <Example
        title="Menu"
        description="A panel of SidebarItem rows makes a compact action menu. Because the panel portals to the body, it opens over anything, including a scrolling list."
        code={`<Popover
  aria-label="Row actions"
  trigger={<IconButton aria-label="Open actions">...</IconButton>}
>
  <Stack gap={0}>
    <SidebarItem>Rename</SidebarItem>
    <SidebarItem>Duplicate</SidebarItem>
    <SidebarItem>Move to folder</SidebarItem>
    <SidebarItem>Delete</SidebarItem>
  </Stack>
</Popover>`}
      >
        <Popover aria-label="Row actions" trigger={<IconButton aria-label="Open actions">•••</IconButton>}>
          <Stack gap={0}>
            <SidebarItem>Rename</SidebarItem>
            <SidebarItem>Duplicate</SidebarItem>
            <SidebarItem>Move to folder</SidebarItem>
            <SidebarItem>Delete</SidebarItem>
          </Stack>
        </Popover>
      </Example>

      <Example
        title="Form"
        description="A small form fits inside the panel with no extra wiring. Field and Input work exactly as they do on a page."
        code={`<Popover
  aria-label="Rename item"
  trigger={<Button variant="outline">Rename</Button>}
>
  <Stack gap={3} style={{ minWidth: 240 }}>
    <Field label="Name" hint="Up to 60 characters.">
      <Input defaultValue="Untitled" />
    </Field>
    <Button>Save</Button>
  </Stack>
</Popover>`}
      >
        <Popover aria-label="Rename item" trigger={<Button variant="outline">Rename</Button>}>
          <Stack gap={3} style={{ minWidth: 240 }}>
            <Field label="Name" hint="Up to 60 characters.">
              <Input defaultValue="Untitled" />
            </Field>
            <Button>Save</Button>
          </Stack>
        </Popover>
      </Example>

      <Example
        title="Controlled"
        description="Drive the open state yourself with open and onOpenChange. Here the trigger label reflects the current state, and outside press and Escape still update it."
        code={`const [open, setOpen] = useState(false);

<Popover
  open={open}
  onOpenChange={setOpen}
  aria-label="Filters"
  trigger={<Button>{open ? 'Close filters' : 'Open filters'}</Button>}
>
  <Stack gap={2}>
    <Text weight="semibold">Filters</Text>
    <Text tone="muted">The trigger label tracks the open state.</Text>
    <Button variant="ghost" onClick={() => setOpen(false)}>
      Done
    </Button>
  </Stack>
</Popover>`}
      >
        <Popover
          open={controlledOpen}
          onOpenChange={setControlledOpen}
          aria-label="Filters"
          trigger={<Button>{controlledOpen ? 'Close filters' : 'Open filters'}</Button>}
        >
          <Stack gap={2}>
            <Text weight="semibold">Filters</Text>
            <Text tone="muted">The trigger label tracks the open state.</Text>
            <Button variant="ghost" onClick={() => setControlledOpen(false)}>
              Done
            </Button>
          </Stack>
        </Popover>
      </Example>

      <h2>Props</h2>
      <PropsTable
        props={[
          {
            name: 'trigger',
            type: 'ReactElement',
            description:
              'The single element that toggles the panel. Its ref, click handler, and aria-haspopup, aria-expanded, and aria-controls are wired automatically.',
          },
          {
            name: 'placement',
            type: "Side | `${Side}-${Alignment}`",
            default: "'bottom-start'",
            description:
              'Side and alignment the panel opens from, such as top, right, or bottom-end. The panel flips and clamps if it would leave the viewport.',
          },
          {
            name: 'open',
            type: 'boolean',
            description: 'Controlled open state. Pair with onOpenChange to drive it yourself.',
          },
          {
            name: 'defaultOpen',
            type: 'boolean',
            default: 'false',
            description: 'Initial open state when the popover is uncontrolled.',
          },
          {
            name: 'onOpenChange',
            type: '(open: boolean) => void',
            description:
              'Called whenever the open state changes, including outside press and Escape. Update your state here in the controlled case.',
          },
          {
            name: 'aria-label',
            type: 'string',
            description: 'Accessible name for the panel. Set it when the panel has no heading of its own.',
          },
          {
            name: 'children',
            type: 'ReactNode',
            description: 'The content rendered inside the floating panel.',
          },
          {
            name: 'className',
            type: 'string',
            description: 'Extra class applied to the panel.',
          },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>
          The panel renders with <code>role="dialog"</code> and is named by the{' '}
          <code>aria-label</code> you pass.
        </li>
        <li>
          The trigger gets <code>aria-haspopup="dialog"</code>, <code>aria-expanded</code> that
          tracks the open state, and <code>aria-controls</code> pointing at the panel while it is
          open.
        </li>
        <li>Focus moves into the panel when it opens so the keyboard lands on the content.</li>
        <li>
          Escape closes the panel and returns focus to the trigger, and a press outside the panel
          closes it too.
        </li>
        <li>
          Under <code>prefers-reduced-motion</code> the panel fades in place instead of scaling.
        </li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>
          Reach for Popover as the base for menus, filters, and rich tooltips. It is the
          anchored-overlay bone that those patterns build on.
        </li>
        <li>
          The panel portals to the body, so it never gets clipped by an overflow-hidden ancestor
          like a card or a scrolling list.
        </li>
        <li>Pass a single element as the trigger. Wrapping it in a fragment or extra div breaks the ref and aria wiring.</li>
        <li>
          Give every panel an <code>aria-label</code> unless it starts with its own visible
          heading.
        </li>
        <li>
          Keep the panel focused on one task. For a full form or a destructive confirm, use Modal
          instead.
        </li>
      </ul>
    </>
  );
}
