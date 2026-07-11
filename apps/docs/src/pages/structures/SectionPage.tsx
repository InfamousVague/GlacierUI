import { Box, Button, Heading, Section, Size, Text, TextTone, Variant } from '@glacier/react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

function ContentBlock({ lines }: { lines: string[] }) {
  return (
    <Box width="full" border radius="lg" padding={4}>
      <div style={{ display: 'grid', gap: 'var(--glacier-space-2)' }}>
        {lines.map((line) => (
          <Text key={line} size={Size.Small} tone={TextTone.Muted}>
            {line}
          </Text>
        ))}
      </div>
    </Box>
  );
}

export function SectionPage() {
  return (
    <>
      <Heading level={1}>Section</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A titled page region: a heading row with an optional description and end-aligned actions, a
        token-driven rhythm gap before the content, and an optional hairline divider for stacking
        sections down a page. With a <code>title</code> it becomes a labelled landmark region.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the figure.</Text>
      <ComponentBlueprint specId="section" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Titled section"
        description="The title labels the section, the description sits muted under it, and actions hug the end of the heading row. On narrow widths the actions wrap below the title."
        code={`<Section
  title="Team members"
  description="Everyone with access to this project."
  actions={<Button size={Size.Small}>Invite</Button>}
>
  {content}
</Section>`}
      >
        <Box width="full">
          <Section
            title="Team members"
            description="Everyone with access to this project."
            actions={<Button size={Size.Small}>Invite</Button>}
          >
            <ContentBlock lines={['Ada Lovelace, Owner', 'Grace Hopper, Admin', 'Alan Turing, Member']} />
          </Section>
        </Box>
      </Example>

      <Example
        title="Stacked sections with dividers"
        description="Turn on divider for every section after the first: each draws a hairline top rule with a leading offset, so a long page separates into clean regions. Nested sections drop to headingLevel 3 to keep the outline sequential."
        code={`<Section title="Profile" headingLevel={3} description="Name, avatar, and public details.">
  {content}
</Section>
<Section title="Notifications" headingLevel={3} divider description="What we email you about.">
  {content}
</Section>
<Section
  title="Danger zone"
  headingLevel={3}
  divider
  actions={<Button variant={Variant.Ghost} size={Size.Small}>Delete project</Button>}
>
  {content}
</Section>`}
      >
        <Box width="full">
          <div style={{ display: 'grid', gap: 'var(--glacier-space-6)' }}>
            <Section title="Profile" headingLevel={3} description="Name, avatar, and public details.">
              <ContentBlock lines={['Display name', 'Avatar']} />
            </Section>
            <Section title="Notifications" headingLevel={3} divider description="What we email you about.">
              <ContentBlock lines={['Mentions', 'Weekly digest']} />
            </Section>
            <Section
              title="Danger zone"
              headingLevel={3}
              divider
              actions={<Button variant={Variant.Ghost} size={Size.Small}>Delete project</Button>}
            >
              <ContentBlock lines={['Deleting a project is permanent.']} />
            </Section>
          </div>
        </Box>
      </Example>

      <Example
        title="Compact density"
        description="Compact trims every gap one step down the space scale (and shortens the divider offset), for dashboards and admin pages where vertical space is scarce."
        code={`<Section title="Activity" headingLevel={3} density="compact" description="The last 30 days.">
  {content}
</Section>
<Section title="Storage" headingLevel={3} density="compact" divider>
  {content}
</Section>`}
      >
        <Box width="full">
          <div style={{ display: 'grid', gap: 'var(--glacier-space-4)' }}>
            <Section title="Activity" headingLevel={3} density="compact" description="The last 30 days.">
              <ContentBlock lines={['128 commits', '12 reviews']} />
            </Section>
            <Section title="Storage" headingLevel={3} density="compact" divider>
              <ContentBlock lines={['4.2 GB of 10 GB used']} />
            </Section>
          </div>
        </Box>
      </Example>

      <Example
        title="Gap steps"
        description="gap sets the rhythm between the header block and the content: sm (space-3), md (space-5, the default), and lg (space-8)."
        code={`<Section title="Small" gap="sm">{content}</Section>
<Section title="Medium" gap="md">{content}</Section>
<Section title="Large" gap="lg">{content}</Section>`}
      >
        <Box width="full">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: 'var(--glacier-space-6)' }}>
            <Section title="Small" headingLevel={3} gap="sm">
              <ContentBlock lines={['space-3 above me']} />
            </Section>
            <Section title="Medium" headingLevel={3} gap="md">
              <ContentBlock lines={['space-5 above me']} />
            </Section>
            <Section title="Large" headingLevel={3} gap="lg">
              <ContentBlock lines={['space-8 above me']} />
            </Section>
          </div>
        </Box>
      </Example>

      <Example
        title="Skeleton"
        description="skeleton renders an aria-hidden placeholder with the exact geometry: a heading line at the headingLevel type size, a description line, and text lines standing in for the content."
        code={`<Section skeleton />`}
      >
        <Box width="full">
          <Section skeleton />
        </Box>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'title', type: 'ReactNode', description: 'Section heading; when present the section is labelled by it through aria-labelledby.' },
          { name: 'description', type: 'ReactNode', description: 'Muted supporting content under the title.' },
          { name: 'actions', type: 'ReactNode', description: 'Content aligned to the end of the heading row, such as actions.' },
          { name: 'headingLevel', type: '2 | 3', default: '2', description: 'Semantic heading level for the title: h2 for page sections, h3 for nested sections.' },
          { name: 'gap', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Vertical rhythm between the header block and the content (space-3, space-5, or space-8).' },
          { name: 'divider', type: 'boolean', default: 'false', description: 'Draws a hairline top rule with a leading offset, for stacking sections.' },
          { name: 'density', type: "'comfortable' | 'compact'", default: "'comfortable'", description: 'Section rhythm; compact trims every gap one step down the scale.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: 'Renders a placeholder with the component exact geometry.' },
          { name: 'children', type: 'ReactNode', description: 'The section content.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          With a <code>title</code>, the <code>section</code> element carries{' '}
          <code>aria-labelledby</code> pointing at the generated heading id, so assistive tech
          exposes it as a named region landmark.
        </li>
        <li>
          Without a title the section is not a named landmark: pass <code>aria-label</code> when an
          untitled section should still announce as a region, otherwise it stays a plain container.
        </li>
        <li>
          <code>headingLevel</code> switches between <code>h2</code> and <code>h3</code>. Pick the
          level that keeps the page outline sequential (h2 for top-level page sections, h3 for
          sections nested under an h2) and do not skip levels.
        </li>
        <li>
          Give icon-only controls in <code>actions</code> an <code>aria-label</code>; the section
          adds no labels to its slots.
        </li>
        <li>The divider is decorative separation between stacked sections; it carries no semantics.</li>
        <li>The skeleton placeholder is <code>aria-hidden</code>; mark the loading region itself with <code>aria-busy</code> at the app level.</li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Use Section to give long pages a consistent rhythm: one Section per major region, with the same gap step throughout the page.</li>
        <li>Turn on <code>divider</code> for every section after the first in a stack, so regions separate without extra chrome.</li>
        <li>Keep the actions slot to one or two controls and put the primary action last; move larger toolbars into the content.</li>
        <li>Reach for compact density on dashboards and admin pages; keep comfortable for settings and marketing pages.</li>
        <li>Prefer <code>FormSection</code> inside long forms (its content rhythm is tuned for Fieldsets); use Section for general page structure.</li>
      </ul>
    </>
  );
}
