import { RadioCard, Row, Stack } from '@perfect/react';
import { ComponentBlueprint } from '../Blueprint.tsx';
import { Example, PropsTable } from '../docs-ui.tsx';

export function RadioCardPage() {
  return (
    <>
      <h1>RadioCard</h1>
      <p className="lede">
        A selectable card with radio semantics. RadioCard turns a one-of-many choice into a preview
        tile with a title, description, and icon, so options like a theme or a provider read as
        pickable surfaces rather than a plain list of dots.
      </p>

      <h2>Anatomy</h2>
      <p>An inspection with the exact spec measurements labelled on the box.</p>
      <ComponentBlueprint specId="radio-card" />

      <h2>Examples</h2>

      <Example
        title="A radio group"
        description={
          <>
            Give every card the same <code>name</code> to group them into one radio set. The browser
            keeps a single card selected and moves the choice with the arrow keys. Selecting a card
            tints its surface and drops a check into the corner.
          </>
        }
        code={`import { RadioCard } from '@perfect/react';

<RadioCard
  name="theme"
  value="light"
  defaultChecked
  icon={<span aria-hidden>☀️</span>}
  title="Light"
  description="Bright surfaces for well-lit rooms."
/>
<RadioCard
  name="theme"
  value="dark"
  icon={<span aria-hidden>🌙</span>}
  title="Dark"
  description="Dim surfaces that are easy on the eyes."
/>
<RadioCard
  name="theme"
  value="system"
  icon={<span aria-hidden>🖥️</span>}
  title="System"
  description="Follow the operating system setting."
/>`}
      >
        <Row wrap gap={3} style={{ width: '100%' }}>
          <RadioCard
            name="theme"
            value="light"
            defaultChecked
            icon={<span aria-hidden>☀️</span>}
            title="Light"
            description="Bright surfaces for well-lit rooms."
            style={{ flex: '1 1 12rem' }}
          />
          <RadioCard
            name="theme"
            value="dark"
            icon={<span aria-hidden>🌙</span>}
            title="Dark"
            description="Dim surfaces that are easy on the eyes."
            style={{ flex: '1 1 12rem' }}
          />
          <RadioCard
            name="theme"
            value="system"
            icon={<span aria-hidden>🖥️</span>}
            title="System"
            description="Follow the operating system setting."
            style={{ flex: '1 1 12rem' }}
          />
        </Row>
      </Example>

      <Example
        title="Title only"
        description="The description and icon are optional. A bare title makes a compact tile for short, self-explanatory options."
        code={`<RadioCard name="plan" value="monthly" title="Monthly" />
<RadioCard name="plan" value="yearly" defaultChecked title="Yearly" />`}
      >
        <Row wrap gap={3}>
          <RadioCard name="plan" value="monthly" title="Monthly" style={{ flex: '1 1 10rem' }} />
          <RadioCard
            name="plan"
            value="yearly"
            defaultChecked
            title="Yearly"
            style={{ flex: '1 1 10rem' }}
          />
        </Row>
      </Example>

      <Example
        title="Disabled"
        description="A disabled card dims and blocks interaction while still holding its place in the group."
        code={`<RadioCard name="tier" value="pro" title="Pro" description="Everything, unlimited." />
<RadioCard name="tier" value="enterprise" disabled title="Enterprise" description="Contact sales." />`}
      >
        <Row wrap gap={3} style={{ width: '100%' }}>
          <RadioCard
            name="tier"
            value="pro"
            defaultChecked
            title="Pro"
            description="Everything, unlimited."
            style={{ flex: '1 1 12rem' }}
          />
          <RadioCard
            name="tier"
            value="enterprise"
            disabled
            title="Enterprise"
            description="Contact sales."
            style={{ flex: '1 1 12rem' }}
          />
        </Row>
      </Example>

      <Example
        title="Skeleton"
        description={
          <>
            <code>skeleton</code> renders a shimmer block at the card's radius and a representative
            height, so the grid holds its shape while options load.
          </>
        }
        code={`<RadioCard skeleton title="" />
<RadioCard skeleton title="" />`}
      >
        <Row wrap gap={3} style={{ width: '100%' }}>
          <RadioCard skeleton title="" style={{ flex: '1 1 12rem' }} />
          <RadioCard skeleton title="" style={{ flex: '1 1 12rem' }} />
        </Row>
      </Example>

      <h2>Props</h2>
      <PropsTable
        props={[
          {
            name: 'title',
            type: 'ReactNode',
            description: 'The card heading, the primary label of the choice. Required.',
          },
          {
            name: 'description',
            type: 'ReactNode',
            description: 'Optional secondary line under the title.',
          },
          {
            name: 'icon',
            type: 'ReactNode',
            description: 'Optional leading glyph or preview swatch above the title.',
          },
          {
            name: 'checked',
            type: 'boolean',
            description: 'Controlled selected state. Pair with onCheckedChange.',
          },
          {
            name: 'defaultChecked',
            type: 'boolean',
            default: 'false',
            description: 'Initial selected state when uncontrolled.',
          },
          {
            name: 'onCheckedChange',
            type: '(checked: boolean) => void',
            description: 'Called with the next checked state when the card is selected.',
          },
          {
            name: 'value',
            type: 'string',
            description: 'The native radio value submitted with the form.',
          },
          {
            name: 'name',
            type: 'string',
            description: 'Groups cards into one radio set; only one card per name is selected.',
          },
          {
            name: 'disabled',
            type: 'boolean',
            default: 'false',
            description: 'Dims the card and blocks interaction.',
          },
          {
            name: 'children',
            type: 'ReactNode',
            description: 'Extra content rendered below the description.',
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>
          Each card wraps a visually hidden native <code>{'<input type="radio">'}</code> inside its{' '}
          <code>{'<label>'}</code>, so the whole card is clickable and the input carries the
          accessible state and role.
        </li>
        <li>
          Group related cards with a shared <code>name</code>. The browser then keeps one card
          selected per group and moves the choice with the arrow keys, exactly like native radios.
        </li>
        <li>
          The corner check is <code>aria-hidden</code>. Do not rely on the accent tint alone to signal
          selection; the title text names each option on its own.
        </li>
        <li>
          Focus lands on the hidden input, which draws a focus ring around the whole card so keyboard
          users can see the active choice.
        </li>
      </ul>

      <h2>Usage</h2>
      <Stack as="ul" gap={2}>
        <li>
          Reach for RadioCard when each option benefits from a preview: a theme swatch, a plan, a
          provider logo. For a plain one-of-many list, the smaller <code>Radio</code> is enough.
        </li>
        <li>
          Keep the set small. A handful of cards reads as a comparison; a dozen becomes a wall. For
          long lists, use a <code>Select</code> instead.
        </li>
        <li>
          Lay cards out in a responsive row or grid and let them share width, so the group reads as a
          set of equals rather than a ranked list.
        </li>
        <li>
          Keep titles short and descriptions to a single line. The card is a chooser, not a place for
          long-form copy.
        </li>
      </Stack>
    </>
  );
}
