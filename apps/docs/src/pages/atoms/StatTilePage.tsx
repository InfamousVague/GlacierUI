import { StatTile, Pill, Heading, Text, Size, TextTone, Tone } from '@glacier/react';
import { DollarSign, TrendingUp, Users } from '@glacier/icons';
import { Example, PropsTable } from '../../docs-ui.tsx';

const usersIcon = <Users size={18} />;
const revenueIcon = <DollarSign size={18} />;
const bounceIcon = <TrendingUp size={18} />;

export function StatTilePage() {
  return (
    <>
      <Heading level={1}>StatTile</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A compact stat micro-card: an optional leading icon, a prominent value, and a muted label,
        with an optional trailing delta or hint. Sits in rows and grids on the card surface tokens so
        a dashboard of tiles reads as one consistent panel.
      </Text>

      <Heading level={2}>Examples</Heading>

      <Example
        title="Basic"
        description="A prominent value over a muted label. That is the whole tile."
        code={`import { StatTile } from '@glacier/react';

<StatTile value="12,480" label="Total users" />`}
      >
        <StatTile value="12,480" label="Total users" />
      </Example>

      <Example
        title="Leading icon"
        description="Pass an icon and it renders in a muted, sunken disc to the left of the value."
        code={`<StatTile icon={usersIcon} value="12,480" label="Total users" />`}
      >
        <StatTile icon={usersIcon} value="12,480" label="Total users" />
      </Example>

      <Example
        title="Trailing hint"
        description="A hint sits on the value baseline - a Pill reads well as a change chip. Pair direction with a glyph or sign, not color alone."
        code={`<StatTile
  icon={revenueIcon}
  value="$48.2k"
  label="Revenue this month"
  hint={<Pill tone={Tone.Success} size={Size.Small}>↑ 12%</Pill>}
/>`}
      >
        <StatTile
          icon={revenueIcon}
          value="$48.2k"
          label="Revenue this month"
          hint={<Pill tone={Tone.Success} size={Size.Small}>↑ 12%</Pill>}
        />
      </Example>

      <Example
        title="Row of tiles"
        description="Tiles line up in a flex or grid row; each keeps the same rhythm so the row reads as one panel."
        code={`<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--glacier-space-4)' }}>
  <StatTile icon={usersIcon} value="12,480" label="Users" hint={<Pill tone={Tone.Success} size={Size.Small}>↑ 4%</Pill>} />
  <StatTile icon={revenueIcon} value="$48.2k" label="Revenue" hint={<Pill tone={Tone.Success} size={Size.Small}>↑ 12%</Pill>} />
  <StatTile icon={bounceIcon} value="38%" label="Bounce rate" hint={<Pill tone={Tone.Danger} size={Size.Small}>↑ 2%</Pill>} />
</div>`}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--glacier-space-4)' }}>
          <StatTile icon={usersIcon} value="12,480" label="Users" hint={<Pill tone={Tone.Success} size={Size.Small}>↑ 4%</Pill>} />
          <StatTile icon={revenueIcon} value="$48.2k" label="Revenue" hint={<Pill tone={Tone.Success} size={Size.Small}>↑ 12%</Pill>} />
          <StatTile icon={bounceIcon} value="38%" label="Bounce rate" hint={<Pill tone={Tone.Danger} size={Size.Small}>↑ 2%</Pill>} />
        </div>
      </Example>

      <Example
        title="Glass"
        description="Over imagery or a gradient, the glass material frosts the tile instead of painting a solid card."
        code={`<StatTile glass icon={usersIcon} value="12,480" label="Total users" />`}
      >
        <StatTile glass icon={usersIcon} value="12,480" label="Total users" />
      </Example>

      <Example
        title="Loading"
        description="The skeleton holds the tile's geometry - a value line and a label line - while data loads."
        code={`<StatTile skeleton value="" label="" />`}
      >
        <StatTile skeleton value="" label="" />
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'value', type: 'ReactNode', description: 'Required. The prominent value - a number, currency, or short string.' },
          { name: 'label', type: 'ReactNode', description: 'Required. The muted label naming what the value measures.' },
          { name: 'icon', type: 'ReactNode', description: 'Decorative leading glyph rendered in a muted disc; the disc is omitted when unset.' },
          { name: 'hint', type: 'ReactNode', description: 'Trailing delta or hint aligned to the value baseline, e.g. a Pill change chip.' },
          { name: 'glass', type: 'boolean', default: 'false', description: 'Renders the frosted glass material instead of a solid card.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: 'Renders a placeholder with the exact geometry.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          The tile is a presentational container with no role of its own; the value and label are read
          in source order, so keep the label a short, literal phrase.
        </li>
        <li>
          The leading icon disc is decorative and marked <code>aria-hidden</code>, so it is not
          announced - the value and label carry the meaning.
        </li>
        <li>
          When a hint conveys direction, do not rely on color alone: include a glyph or sign (↑ / ↓, +
          / −) so the change is legible without color.
        </li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Use a StatTile for a single at-a-glance metric; line several up in a row or grid for a dashboard summary.</li>
        <li>Keep the value short - abbreviate large numbers (48.2k, 1.2M) so the tile stays compact.</li>
        <li>Reach for a Pill as the hint to show a delta, and match its tone to the direction of the change.</li>
      </ul>
    </>
  );
}
