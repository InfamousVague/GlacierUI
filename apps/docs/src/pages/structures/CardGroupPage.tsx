import {
  Box,
  Card,
  CardGroup,
  Heading,
  Pill,
  Size,
  Stack,
  StatTile,
  Text,
  TextTone,
  Tone,
} from '@glacier/react';
import { DollarSign, TrendingUp, Users } from '@glacier/icons';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

const usersIcon = <Users size={18} />;
const revenueIcon = <DollarSign size={18} />;
const trendIcon = <TrendingUp size={18} />;

function DemoCard({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <Stack gap={1}>
        <Text weight="semibold">{title}</Text>
        <Text size={Size.Small} tone={TextTone.Muted}>
          {body}
        </Text>
      </Stack>
    </Card>
  );
}

export function CardGroupPage() {
  return (
    <>
      <Heading level={1}>CardGroup</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A layout shelf for repeated surfaces such as <code>Card</code> and <code>StatTile</code>. In
        grid mode it lays cards on auto-fill columns that keep a stable minimum width and wrap as
        the container narrows; in list mode it stacks them in a single column. Purely layout: it
        renders a plain <code>div</code> and adds no semantics of its own.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the figure.</Text>
      <ComponentBlueprint specId="card-group" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Responsive stat grid"
        description="The default mode: as many columns as fit at the 16rem minimum, each sharing the leftover space. Resize the page and the tiles wrap on their own, no media queries."
        code={`import { CardGroup, Pill, Size, StatTile, Tone } from '@glacier/react';

<CardGroup>
  <StatTile icon={usersIcon} value="12,480" label="Users" hint={<Pill tone={Tone.Success} size={Size.Small}>↑ 4%</Pill>} />
  <StatTile icon={revenueIcon} value="$48.2k" label="Revenue" hint={<Pill tone={Tone.Success} size={Size.Small}>↑ 12%</Pill>} />
  <StatTile icon={trendIcon} value="38%" label="Bounce rate" hint={<Pill tone={Tone.Danger} size={Size.Small}>↑ 2%</Pill>} />
  <StatTile value="4m 12s" label="Avg. session" />
</CardGroup>`}
      >
        <Box width="full">
          <CardGroup>
            <StatTile icon={usersIcon} value="12,480" label="Users" hint={<Pill tone={Tone.Success} size={Size.Small}>↑ 4%</Pill>} />
            <StatTile icon={revenueIcon} value="$48.2k" label="Revenue" hint={<Pill tone={Tone.Success} size={Size.Small}>↑ 12%</Pill>} />
            <StatTile icon={trendIcon} value="38%" label="Bounce rate" hint={<Pill tone={Tone.Danger} size={Size.Small}>↑ 2%</Pill>} />
            <StatTile value="4m 12s" label="Avg. session" />
          </CardGroup>
        </Box>
      </Example>

      <Example
        title="List mode"
        description="mode='list' stacks the same children in a single full-width column with the same gap, for narrow panes or when top-to-bottom order carries meaning."
        code={`<CardGroup mode="list">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</CardGroup>`}
      >
        <Box width="full">
          <CardGroup mode="list">
            <DemoCard title="Getting started" body="Install the kit and render your first page." />
            <DemoCard title="Theming" body="Swap the accent ramp and the whole kit follows." />
            <DemoCard title="Tokens" body="Every design value resolves through the token scale." />
          </CardGroup>
        </Box>
      </Example>

      <Example
        title="Gap and density"
        description="gap picks the space step between cards (sm, md, lg) and density='compact' tightens the chosen gap one step, so a dashboard can breathe or pack without leaving the scale."
        code={`<CardGroup gap="lg">...</CardGroup>
<CardGroup gap="lg" density="compact">...</CardGroup>`}
      >
        <Stack gap={6} width="full">
          <Stack gap={2}>
            <Text size={Size.Small} tone={TextTone.Muted}>gap="lg", comfortable</Text>
            <CardGroup gap="lg" minItemWidth="12rem">
              <DemoCard title="Alpha" body="First surface." />
              <DemoCard title="Beta" body="Second surface." />
              <DemoCard title="Gamma" body="Third surface." />
            </CardGroup>
          </Stack>
          <Stack gap={2}>
            <Text size={Size.Small} tone={TextTone.Muted}>gap="lg", compact</Text>
            <CardGroup gap="lg" density="compact" minItemWidth="12rem">
              <DemoCard title="Alpha" body="First surface." />
              <DemoCard title="Beta" body="Second surface." />
              <DemoCard title="Gamma" body="Third surface." />
            </CardGroup>
          </Stack>
        </Stack>
      </Example>

      <Example
        title="Custom minimum width"
        description="minItemWidth sets the floor each card defends before the row wraps. Wider floors mean fewer, wider columns; the min(100%) clamp keeps a card from overflowing a container narrower than the floor."
        code={`<CardGroup minItemWidth="24rem">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</CardGroup>`}
      >
        <Box width="full">
          <CardGroup minItemWidth="24rem">
            <DemoCard title="Wide card" body="Defends a 24rem floor before wrapping." />
            <DemoCard title="Another wide card" body="Columns split the leftover space evenly." />
            <DemoCard title="Third card" body="Wraps to its own row once two no longer fit." />
          </CardGroup>
        </Box>
      </Example>

      <Example
        title="Skeleton"
        description="skeleton renders skeletonCount rounded placeholder cards in the same tracks, so the columns and gaps hold steady while real cards load. Match skeletonCount to the expected item count."
        code={`<CardGroup skeleton skeletonCount={6} />`}
      >
        <Box width="full">
          <CardGroup skeleton skeletonCount={6} />
        </Box>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'mode', type: "'grid' | 'list'", default: "'grid'", description: 'grid lays cards on responsive auto-fill columns; list stacks them in a single column.' },
          { name: 'minItemWidth', type: 'string', default: "'16rem'", description: 'Minimum card width in grid mode, as a CSS length. Ignored in list mode.' },
          { name: 'gap', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Space between cards, from the token scale: sm space-3, md space-4, lg space-6.' },
          { name: 'density', type: "'comfortable' | 'compact'", default: "'comfortable'", description: 'compact tightens the chosen gap one space step.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: 'Render placeholder cards instead of children, keeping the grid geometry.' },
          { name: 'skeletonCount', type: 'number', default: '6', description: 'How many placeholder cards the skeleton renders.' },
          { name: 'children', type: 'ReactNode', description: 'The cards, or any repeated surfaces.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          CardGroup renders a plain <code>div</code> with no role: it is purely visual layout and
          adds nothing to the accessibility tree beyond its children.
        </li>
        <li>
          When the content is semantically a list, add the semantics yourself: put{' '}
          <code>role="list"</code> on the group and <code>role="listitem"</code> on each child, or
          render list markup inside. CardGroup never assumes it.
        </li>
        <li>
          Reading order and keyboard order follow source order in both modes; grid mode only wraps
          rows, it never reorders cards visually against the DOM.
        </li>
        <li>
          The skeleton branch is <code>aria-hidden</code>. Mark the surrounding region{' '}
          <code>aria-busy</code> at the app level while data loads.
        </li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>
          Reach for CardGroup when the children are peers of the same kind (stat tiles, article
          cards, settings panels); use the lower-level <code>Grid</code> for arbitrary page layout.
        </li>
        <li>
          Pick <code>minItemWidth</code> as the smallest width at which one card still reads well;
          the grid handles every container width from there.
        </li>
        <li>
          Use list mode in narrow panes and sidebars, or when scanning top to bottom matters more
          than density.
        </li>
        <li>
          Prefer <code>density="compact"</code> over a smaller gap step in data-dense dashboards,
          so the group tightens consistently with compact tables around it.
        </li>
        <li>
          Set <code>skeletonCount</code> to the number of cards you expect, so nothing shifts when
          the data lands.
        </li>
      </ul>
    </>
  );
}
