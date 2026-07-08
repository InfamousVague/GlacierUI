import { Box, Center, Container, Grid, Row, Spacer, Stack, Text, Heading, Size, TextTone } from '@glacier/react';
import { Example, PropsTable } from '../../docs-ui.tsx';

const Swatch = ({ label }: { label: string }) => (
  <Box padding={4} background="surfaceSunken" radius="md" border>
    <Text size={Size.Small} tone={TextTone.Muted}>
      {label}
    </Text>
  </Box>
);

export function LayoutPage() {
  return (
    <>
      <Heading level={1}>Layout</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A small set of primitives that own every spacing decision. All rhythm comes from gap, all
        values come from the space scale, and there are no margins. Build a screen from these and it
        cannot drift off the system or overflow its container.
      </Text>

      <Heading level={2}>Examples</Heading>

      <Example
        title="Stack"
        description="A vertical flow. Children sit at an even token gap with no margins. This is the default container for anything that reads top to bottom."
        code={`import { Stack } from '@glacier/react';

<Stack gap={4}>
  <div>First</div>
  <div>Second</div>
  <div>Third</div>
</Stack>`}
      >
        <Box width="full">
          <Stack gap={4}>
            <Swatch label="First" />
            <Swatch label="Second" />
            <Swatch label="Third" />
          </Stack>
        </Box>
      </Example>

      <Example
        title="Row"
        description="A horizontal flow, centered on the cross axis by default. Add a Spacer to push groups to opposite ends without a single margin."
        code={`import { Row, Spacer, Button } from '@glacier/react';

<Row gap={3}>
  <Button variant={Variant.Soft}>Back</Button>
  <Spacer />
  <Button>Continue</Button>
</Row>`}
      >
        <Box width="full">
          <Row gap={3}>
            <Swatch label="Back" />
            <Spacer />
            <Swatch label="Continue" />
          </Row>
        </Box>
      </Example>

      <Example
        title="Grid that reflows on its own"
        description="Give a Grid a minChildWidth and it fits as many equal columns as the space allows, reflowing with no media queries. Resize the window to watch it."
        code={`<Grid minChildWidth="12rem" gap={4}>
  <Card>A</Card>
  <Card>B</Card>
  <Card>C</Card>
  <Card>D</Card>
</Grid>`}
      >
        <Box width="full">
          <Grid minChildWidth="10rem" gap={4}>
            <Swatch label="A" />
            <Swatch label="B" />
            <Swatch label="C" />
            <Swatch label="D" />
          </Grid>
        </Box>
      </Example>

      <Example
        title="Fixed and responsive columns"
        description="Pass a column count for a fixed grid, or an object to change it per breakpoint."
        code={`<Grid columns={{ base: 2, md: 4 }} gap={3}>
  {items}
</Grid>`}
      >
        <Box width="full">
          <Grid columns={{ base: 2, md: 4 }} gap={3}>
            <Swatch label="1" />
            <Swatch label="2" />
            <Swatch label="3" />
            <Swatch label="4" />
          </Grid>
        </Box>
      </Example>

      <Example
        title="Box as a surface"
        description="Box carries token padding, background, radius, border, and elevation, so a card is one element with no bespoke CSS."
        code={`<Box padding={5} background="surfaceRaised" radius="lg" elevation={2}>
  <Stack gap={2}>
    <Text weight="semibold">Weekly report</Text>
    <Text size={Size.Small} tone={TextTone.Muted}>Ready to review.</Text>
  </Stack>
</Box>`}
      >
        <Box padding={5} background="surfaceRaised" radius="lg" elevation={2} maxWidth="xs" width="full">
          <Stack gap={2}>
            <Text weight="semibold">Weekly report</Text>
            <Text size={Size.Small} tone={TextTone.Muted}>
              Ready to review.
            </Text>
          </Stack>
        </Box>
      </Example>

      <Example
        title="Center"
        description="Centers its children on both axes. Give it a height for a hero or an empty state."
        code={`<Center height="auto" padding={8} background="surfaceSunken" radius="lg">
  <Text tone={TextTone.Muted}>Nothing here yet</Text>
</Center>`}
      >
        <Box width="full">
          <Center padding={8} background="surfaceSunken" radius="lg">
            <Text tone={TextTone.Muted}>Nothing here yet</Text>
          </Center>
        </Box>
      </Example>

      <Heading level={2}>Props</Heading>
      <Heading level={3}>Box style props (shared by every primitive)</Heading>
      <PropsTable
        props={[
          { name: 'padding', type: 'SpaceStep | Responsive', description: 'Padding on all sides. paddingX, paddingY, and the four edges are also available.' },
          { name: 'background', type: "'surface' | 'surfaceRaised' | 'surfaceSunken' | 'accent' | 'accentSoft' | 'glass' | 'bg'", description: 'Fill from the semantic surface tokens.' },
          { name: 'radius', type: "'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'", description: 'Corner radius from the ramp.' },
          { name: 'border', type: "boolean | 'subtle' | 'strong' | 'accent'", description: 'A token hairline border.' },
          { name: 'elevation', type: '0 | 1 | 2 | 3 | 4 | 5', description: 'Shadow depth.' },
          { name: 'maxWidth', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'prose' | 'full'", description: 'Cap width to a container token.' },
          { name: 'grow', type: 'boolean', description: 'Fill the main axis of a parent Row or Stack.' },
        ]}
      />
      <Heading level={3}>Stack, Row, Grid</Heading>
      <PropsTable
        props={[
          { name: 'gap', type: 'SpaceStep | Responsive', default: 'Stack 4, Row 3, Grid 4', description: 'Space between children, from the scale.' },
          { name: 'align', type: "'start' | 'center' | 'end' | 'stretch' | 'baseline'", description: 'Cross-axis alignment.' },
          { name: 'justify', type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'", description: 'Main-axis distribution.' },
          { name: 'wrap', type: 'boolean', description: 'Row only. Flow onto new lines when narrow.' },
          { name: 'columns', type: 'number | Responsive', description: 'Grid only. Fixed column count.' },
          { name: 'minChildWidth', type: 'string', description: 'Grid only. Auto-fit equal columns at this minimum width.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>Every primitive renders a plain div by default and takes an <code>as</code> prop for the right element, so structure stays semantic.</li>
        <li>Spacer is decorative and marked aria-hidden.</li>
        <li>AppShell exposes the sidebar as a labeled landmark and closes its mobile drawer on Escape, backdrop press, and navigation.</li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Reach for Stack first. Most vertical UI is a Stack of Stacks.</li>
        <li>Use gap for all spacing. Never add a margin; that is what keeps rhythm even.</li>
        <li>Use Grid with minChildWidth for card grids so they reflow without breakpoints.</li>
        <li>Wrap pages in a Container to cap the reading width, and the whole app in AppShell.</li>
        <li>Pass only scale keys. The types reject off-scale values, so a build cannot look inconsistent.</li>
      </ul>
    </>
  );
}
