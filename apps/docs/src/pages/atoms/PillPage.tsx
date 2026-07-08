import { useState } from 'react';
import { Button, Pill, Row, Stack, Text, Heading, Size, TextTone, Tone, Variant } from '@glacier/react';
import { BookOpen, Hash } from '@glacier/icons';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

const GENRES = ['Fiction', 'History', 'Sci-Fi', 'Poetry'];

function RemovableTags() {
  const [tags, setTags] = useState(GENRES);
  return (
    <Row gap={4} wrap>
      {tags.map((tag) => (
        <Pill key={tag} tone={Tone.Accent} onRemove={() => setTags((prev) => prev.filter((t) => t !== tag))}>
          {tag}
        </Pill>
      ))}
      {tags.length === 0 && (
        <Button variant={Variant.Ghost} size={Size.Small} onClick={() => setTags(GENRES)}>
          Reset
        </Button>
      )}
    </Row>
  );
}

export function PillPage() {
  return (
    <>
      <Heading level={1}>Pill</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A small inline label for statuses, counts, and categories, with an optional leading icon and
        an optional remove button that turns it into a dismissible tag. Non-interactive by default -
        for anything the user activates on its own, use a Button.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the box.</Text>
      <ComponentBlueprint specId="pill" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Tones"
        description={
          <>
            Six tones map to the semantic color ramps. <code>neutral</code> is the default and fits
            most metadata. The others carry meaning: <code>success</code>, <code>warning</code>, and{' '}
            <code>danger</code> report state, <code>accent</code> and <code>info</code> highlight and
            annotate.
          </>
        }
        code={`import { Pill } from '@glacier/react';

<Pill>Neutral</Pill>
<Pill tone={Tone.Accent}>Accent</Pill>
<Pill tone={Tone.Success}>Success</Pill>
<Pill tone={Tone.Warning}>Warning</Pill>
<Pill tone={Tone.Danger}>Danger</Pill>
<Pill tone={Tone.Info}>Info</Pill>`}
      >
        <Row gap={4} wrap>
          <Pill>Neutral</Pill>
          <Pill tone={Tone.Accent}>Accent</Pill>
          <Pill tone={Tone.Success}>Success</Pill>
          <Pill tone={Tone.Warning}>Warning</Pill>
          <Pill tone={Tone.Danger}>Danger</Pill>
          <Pill tone={Tone.Info}>Info</Pill>
        </Row>
      </Example>

      <Example
        title="Variants"
        description={
          <>
            Three variants set the emphasis. <code>soft</code> is the default tinted fill,{' '}
            <code>solid</code> uses the full tone color, and <code>outline</code> keeps only a
            border. Every variant works with every tone.
          </>
        }
        code={`<Pill tone={Tone.Accent} variant={Variant.Soft}>Soft</Pill>
<Pill tone={Tone.Accent} variant={Variant.Solid}>Solid</Pill>
<Pill tone={Tone.Accent} variant={Variant.Outline}>Outline</Pill>

<Pill tone={Tone.Danger} variant={Variant.Soft}>Soft</Pill>
<Pill tone={Tone.Danger} variant={Variant.Solid}>Solid</Pill>
<Pill tone={Tone.Danger} variant={Variant.Outline}>Outline</Pill>`}
      >
        <Stack gap={4}>
          <Row gap={4} wrap>
            <Pill tone={Tone.Accent} variant={Variant.Soft}>
              Soft
            </Pill>
            <Pill tone={Tone.Accent} variant={Variant.Solid}>
              Solid
            </Pill>
            <Pill tone={Tone.Accent} variant={Variant.Outline}>
              Outline
            </Pill>
          </Row>
          <Row gap={4} wrap>
            <Pill tone={Tone.Danger} variant={Variant.Soft}>
              Soft
            </Pill>
            <Pill tone={Tone.Danger} variant={Variant.Solid}>
              Solid
            </Pill>
            <Pill tone={Tone.Danger} variant={Variant.Outline}>
              Outline
            </Pill>
          </Row>
        </Stack>
      </Example>

      <Example
        title="Sizes"
        description={
          <>
            Two sizes. <code>md</code> is the default. Use <code>sm</code> inside table rows, list
            items, and other tight lines of text.
          </>
        }
        code={`<Pill size={Size.Small} tone={Tone.Info}>sm</Pill>
<Pill size={Size.Medium} tone={Tone.Info}>md</Pill>
<Pill size={Size.Small} tone={Tone.Accent} variant={Variant.Solid}>3 new</Pill>`}
      >
        <Row gap={4} wrap>
          <Pill size={Size.Small} tone={Tone.Info}>
            sm
          </Pill>
          <Pill size={Size.Medium} tone={Tone.Info}>
            md
          </Pill>
          <Pill size={Size.Small} tone={Tone.Accent} variant={Variant.Solid}>
            3 new
          </Pill>
        </Row>
      </Example>

      <Example
        title="Icon"
        description={
          <>
            Add a leading <code>icon</code> to categorize a pill. The icon is decorative and hidden
            from assistive tech, so the label still carries the meaning.
          </>
        }
        code={`import { Hash, BookOpen } from '@glacier/icons';

<Pill icon={<Hash size={12} />} tone={Tone.Info}>Tagged</Pill>
<Pill icon={<BookOpen size={12} />} tone={Tone.Accent}>Fiction</Pill>`}
      >
        <Row gap={4} wrap>
          <Pill icon={<Hash size={12} />} tone={Tone.Info}>
            Tagged
          </Pill>
          <Pill icon={<BookOpen size={12} />} tone={Tone.Accent}>
            Fiction
          </Pill>
        </Row>
      </Example>

      <Example
        title="Removable tags"
        description={
          <>
            Set <code>onRemove</code> to render a trailing dismiss button, turning a pill into a
            removable tag. Wire it to state to build an editable set.
          </>
        }
        code={`const [tags, setTags] = useState(genres);

{tags.map((tag) => (
  <Pill key={tag} tone={Tone.Accent} onRemove={() => setTags((p) => p.filter((t) => t !== tag))}>
    {tag}
  </Pill>
))}`}
      >
        <RemovableTags />
      </Example>

      <Example
        title="Status row"
        description={
          <>
            The most common composition: a name, a pill that reports state, and muted detail text.
            The pill label carries the meaning, so the row stays readable without color.
          </>
        }
        code={`<Row gap={4} wrap>
  <Text as="span" weight="medium">api-server</Text>
  <Pill tone={Tone.Success} size={Size.Small}>Build passing</Pill>
  <Text as="span" size={Size.Small} tone={TextTone.Muted}>Deployed 4 minutes ago</Text>
</Row>`}
      >
        <Stack gap={4}>
          <Row gap={4} wrap>
            <Text as="span" weight="medium">
              api-server
            </Text>
            <Pill tone={Tone.Success} size={Size.Small}>
              Build passing
            </Pill>
            <Text as="span" size={Size.Small} tone={TextTone.Muted}>
              Deployed 4 minutes ago
            </Text>
          </Row>
          <Row gap={4} wrap>
            <Text as="span" weight="medium">
              worker-queue
            </Text>
            <Pill tone={Tone.Warning} size={Size.Small}>
              Degraded
            </Pill>
            <Text as="span" size={Size.Small} tone={TextTone.Muted}>
              Retrying 3 jobs
            </Text>
          </Row>
        </Stack>
      </Example>

      <Example
        title="Skeleton"
        description={
          <>
            <code>skeleton</code> renders a shimmer placeholder with the pill's height and full
            radius, sized per <code>size</code>, so surrounding text does not shift when the label
            loads.
          </>
        }
        code={`<Pill skeleton size={Size.Small} />
<Pill size={Size.Small} tone={Tone.Success}>Build passing</Pill>
<Pill skeleton />
<Pill tone={Tone.Info}>In review</Pill>`}
      >
        <Row gap={4} wrap>
          <Pill skeleton size={Size.Small} />
          <Pill size={Size.Small} tone={Tone.Success}>
            Build passing
          </Pill>
          <Pill skeleton />
          <Pill tone={Tone.Info}>In review</Pill>
        </Row>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          {
            name: 'tone',
            type: "'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'",
            default: "'neutral'",
            description: 'Semantic color of the pill.',
          },
          {
            name: 'variant',
            type: "'soft' | 'solid' | 'outline'",
            default: "'soft'",
            description: 'Fill style: tinted background, full tone color, or border only.',
          },
          {
            name: 'size',
            type: "'sm' | 'md'",
            default: "'md'",
            description: 'Text size and padding. All other native span props are forwarded.',
          },
          {
            name: 'icon',
            type: 'ReactNode',
            description: 'Leading glyph, hidden from assistive tech.',
          },
          {
            name: 'onRemove',
            type: '() => void',
            description:
              'When set, renders a trailing remove button that calls this on click, turning the pill into a removable tag.',
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
          Pill renders a plain <code>span</code> with no implicit role. Screen readers announce only
          its text, so the label must state the status on its own. Do not rely on tone color to
          carry meaning.
        </li>
        <li>
          The pill itself is not focusable. Wrap content in a <code>Button</code> instead of adding a
          click handler to the whole pill.
        </li>
        <li>
          When <code>onRemove</code> is set, the remove control is a real <code>button</code> labeled
          from the kit's translatable Dismiss message, focusable and operable with Enter and Space.
        </li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>
          Use pills for statuses, counts, and categories. Add <code>onRemove</code> only when the
          user can actually remove the item. For anything the user activates, use a{' '}
          <code>Button</code>.
        </li>
        <li>
          Prefer <code>soft</code> in dense UI such as tables and lists. Reserve <code>solid</code>{' '}
          for the one state per view that must stand out.
        </li>
        <li>
          Keep pill labels to one or two words. Move detail into adjacent <code>Text</code>, as in
          the status row example.
        </li>
      </ul>
    </>
  );
}
