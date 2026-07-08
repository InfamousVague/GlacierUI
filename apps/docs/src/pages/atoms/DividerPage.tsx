import { Button, Divider, Row, Stack, Text, Heading, Size, TextTone, Variant } from '@glacier/react';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { Example, PropsTable } from '../../docs-ui.tsx';

export function DividerPage() {
  return (
    <>
      <Heading level={1}>Divider</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A hairline break between groups of content, horizontally, vertically, or with a centered
        label. Reach for it only when spacing alone does not separate two groups clearly enough.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the box.</Text>
      <ComponentBlueprint specId="divider" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Horizontal"
        description={
          <>
            The default orientation renders a native <code>hr</code> as a one pixel hairline. Place
            it between blocks that need a firmer break than spacing provides.
          </>
        }
        code={`import { Divider } from '@glacier/react';

<Text>Tokens are generated from the OKLCH ramps at build time.</Text>
<Divider />
<Text tone={TextTone.Muted}>Override any token per theme with a CSS custom property.</Text>`}
      >
        <Stack gap={4} style={{ maxWidth: 420, width: '100%' }}>
          <Text>Tokens are generated from the OKLCH ramps at build time.</Text>
          <Divider />
          <Text tone={TextTone.Muted}>Override any token per theme with a CSS custom property.</Text>
        </Stack>
      </Example>

      <Example
        title="Labeled"
        description={
          <>
            <code>label</code> renders a centered caption between two hairlines, useful for alternate
            paths in forms such as an "or" between sign up and sign in.
          </>
        }
        code={`<Stack gap={4} style={{ maxWidth: 280 }}>
  <Button fullWidth>Create account</Button>
  <Divider label="or" />
  <Button variant={Variant.Soft} fullWidth>Sign in</Button>
</Stack>`}
      >
        <Stack gap={4} style={{ maxWidth: 280, width: '100%' }}>
          <Button fullWidth>Create account</Button>
          <Divider label="or" />
          <Button variant={Variant.Soft} fullWidth>
            Sign in
          </Button>
        </Stack>
      </Example>

      <Example
        title="Vertical"
        description={
          <>
            <code>orientation="vertical"</code> separates inline items in a flex row and stretches to
            the row height.
          </>
        }
        code={`<Row gap={4}>
  <Text as="span" size={Size.Small}>Docs</Text>
  <Divider orientation="vertical" />
  <Text as="span" size={Size.Small}>Changelog</Text>
  <Divider orientation="vertical" />
  <Text as="span" size={Size.Small}>Support</Text>
</Row>`}
      >
        <Row gap={4} wrap>
          <Text as="span" size={Size.Small}>
            Docs
          </Text>
          <Divider orientation="vertical" />
          <Text as="span" size={Size.Small}>
            Changelog
          </Text>
          <Divider orientation="vertical" />
          <Text as="span" size={Size.Small}>
            Support
          </Text>
        </Row>
      </Example>

      <Example
        title="Skeleton"
        description="A skeleton Divider keeps the same hairline geometry, so surrounding blocks do not shift while content loads."
        code={`<Divider skeleton />`}
      >
        <Stack gap={4} style={{ maxWidth: 420, width: '100%' }}>
          <Text>Loading section</Text>
          <Divider skeleton />
          <Text tone={TextTone.Muted}>More to come</Text>
        </Stack>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          {
            name: 'orientation',
            type: "'horizontal' | 'vertical'",
            default: "'horizontal'",
            description:
              'Direction of the line. Vertical dividers stretch to the height of their flex row.',
          },
          {
            name: 'label',
            type: 'ReactNode',
            description:
              'Centered caption between two hairlines. When set, orientation is ignored and the divider is always horizontal.',
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          An unlabeled horizontal <code>Divider</code> renders a native <code>hr</code>, which
          exposes the separator role by default.
        </li>
        <li>
          Labeled and vertical dividers render a <code>div</code> with <code>role="separator"</code>.
          The vertical form also sets <code>aria-orientation="vertical"</code>.
        </li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>
          Add a divider only when spacing alone fails to separate two groups. If a gap already reads
          as a break, the extra line is noise.
        </li>
        <li>
          Use the labeled form for alternate paths, for example <code>label="or"</code> between a
          sign up action and a sign in action.
        </li>
        <li>Reach for vertical dividers to separate inline items in a toolbar or meta row.</li>
      </ul>
    </>
  );
}
