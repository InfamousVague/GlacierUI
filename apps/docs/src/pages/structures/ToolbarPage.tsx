import { Box, Button, IconButton, Text, Toolbar, Heading, Size, TextTone, Variant } from '@glacier/react';
import { Menu } from '@glacier/icons';
import { Example, PropsTable } from '../../docs-ui.tsx';

const menuIcon = <Menu size={16} />;

export function ToolbarPage() {
  return (
    <>
      <Heading level={1}>Toolbar</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A horizontal bar with a <code>start</code> slot, a flexible middle, and an <code>end</code>{' '}
        slot that hugs the trailing edge. Use it for app headers, page toolbars, and card headers.
      </Text>

      <Heading level={2}>Examples</Heading>

      <Example
        title="Page toolbar"
        description={
          <>
            A title in the middle and actions in <code>end</code>. The middle grows, so the actions
            stay pinned to the trailing edge without a margin.
          </>
        }
        code={`import { Box, Button, Text, Toolbar } from '@glacier/react';

<Box width="full" border radius="lg">
  <Toolbar
    end={
      <>
        <Button variant={Variant.Ghost}>Cancel</Button>
        <Button>Save</Button>
      </>
    }
  >
    <Text weight="semibold">Project settings</Text>
  </Toolbar>
</Box>`}
      >
        <Box width="full" border radius="lg">
          <Toolbar
            end={
              <>
                <Button variant={Variant.Ghost}>Cancel</Button>
                <Button>Save</Button>
              </>
            }
          >
            <Text weight="semibold">Project settings</Text>
          </Toolbar>
        </Box>
      </Example>

      <Example
        title="Start, title, and actions"
        description={
          <>
            A menu <code>IconButton</code> in <code>start</code>, the title in the middle, and
            actions in <code>end</code>. Both slots keep the same height as the middle content.
          </>
        }
        code={`import { Menu } from '@glacier/icons';

<Box width="full" border radius="lg">
  <Toolbar
    start={<IconButton aria-label="Open menu"><Menu size={16} /></IconButton>}
    end={<Button variant={Variant.Soft}>Share</Button>}
  >
    <Text weight="semibold">Inbox</Text>
  </Toolbar>
</Box>`}
      >
        <Box width="full" border radius="lg">
          <Toolbar
            start={<IconButton aria-label="Open menu">{menuIcon}</IconButton>}
            end={<Button variant={Variant.Soft}>Share</Button>}
          >
            <Text weight="semibold">Inbox</Text>
          </Toolbar>
        </Box>
      </Example>

      <Example
        title="Surface toolbar"
        description={
          <>
            <code>surface</code> adds the translucent glass background and <code>border</code> adds a
            bottom hairline. Together they read as a fixed app header sitting over content.
          </>
        }
        code={`<Box width="full" border radius="lg">
  <Toolbar
    border
    surface
    end={<Button variant={Variant.Soft}>Sign in</Button>}
  >
    <Text weight="semibold">GlacierUI</Text>
  </Toolbar>
</Box>`}
      >
        <Box width="full" border radius="lg">
          <Toolbar border surface end={<Button variant={Variant.Soft}>Sign in</Button>}>
            <Text weight="semibold">GlacierUI</Text>
          </Toolbar>
        </Box>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          {
            name: 'start',
            type: 'ReactNode',
            description: 'Content pinned to the start, such as a menu button or a back control.',
          },
          {
            name: 'end',
            type: 'ReactNode',
            description: 'Content pinned to the end, such as actions. It hugs the trailing edge.',
          },
          {
            name: 'children',
            type: 'ReactNode',
            description: 'The flexible middle content, such as a title. It grows to fill the bar.',
          },
          {
            name: 'sticky',
            type: 'boolean',
            default: 'false',
            description: 'Sticks the bar to the top of its scroll container.',
          },
          {
            name: 'border',
            type: 'boolean',
            default: 'false',
            description: 'Adds a bottom hairline to separate the bar from content below it.',
          },
          {
            name: 'surface',
            type: 'boolean',
            default: 'false',
            description: 'Adds the translucent glass background, for app and page headers.',
          },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          Toolbar renders a plain <code>div</code> and forwards native props, so add a{' '}
          <code>role</code> and label such as <code>aria-label</code> when the bar groups a set of
          controls.
        </li>
        <li>
          Order in the DOM follows the reading order: <code>start</code>, then the middle, then{' '}
          <code>end</code>, so keyboard focus moves left to right through the bar.
        </li>
        <li>
          Give icon-only controls in <code>start</code> and <code>end</code> an{' '}
          <code>aria-label</code>, since a Toolbar adds no labels of its own.
        </li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>
          Reach for Toolbar when you need a bar: a full-width strip with leading and trailing
          controls.
        </li>
        <li>
          Keep the primary action last in <code>end</code> so it sits at the trailing edge, and
          limit a bar to one primary action.
        </li>
        <li>
          Use <code>surface</code> and <code>sticky</code> together for a header that stays visible
          while content scrolls under its glass background.
        </li>
        <li>
          Put a single title or a compact control in the middle.
        </li>
      </ul>
    </>
  );
}
