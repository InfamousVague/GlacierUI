import { StatTile, Pill } from '@perfect/react';
import { Example, PropsTable } from '../docs-ui.tsx';

const usersIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6.5" cy="6" r="2.5" />
    <path d="M2.5 15c0-2.2 1.8-4 4-4s4 1.8 4 4" />
    <path d="M11.5 4.2a2.5 2.5 0 0 1 0 4.6M12 11.2c1.8.3 3.5 1.9 3.5 3.8" />
  </svg>
);
const revenueIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 2.5v13" />
    <path d="M12 5.5c0-1.4-1.3-2-3-2s-3 .8-3 2.3S7.5 8 9 8s3 .5 3 2.2-1.3 2.3-3 2.3-3-.6-3-2" />
  </svg>
);
const bounceIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 12.5 6 8l3 2.5 6-6.5" />
    <path d="M11 4h4v4" />
  </svg>
);

export function StatTilePage() {
  return (
    <>
      <h1>StatTile</h1>
      <p className="lede">
        A compact stat micro-card: an optional leading icon, a prominent value, and a muted label,
        with an optional trailing delta or hint. Sits in rows and grids on the card surface tokens so
        a dashboard of tiles reads as one consistent panel.
      </p>

      <h2>Examples</h2>

      <Example
        title="Basic"
        description="A prominent value over a muted label. That is the whole tile."
        code={`import { StatTile } from '@perfect/react';

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
        description="A hint sits on the value baseline — a Pill reads well as a change chip. Pair direction with a glyph or sign, not color alone."
        code={`<StatTile
  icon={revenueIcon}
  value="$48.2k"
  label="Revenue this month"
  hint={<Pill tone="success" size="sm">↑ 12%</Pill>}
/>`}
      >
        <StatTile
          icon={revenueIcon}
          value="$48.2k"
          label="Revenue this month"
          hint={<Pill tone="success" size="sm">↑ 12%</Pill>}
        />
      </Example>

      <Example
        title="Row of tiles"
        description="Tiles line up in a flex or grid row; each keeps the same rhythm so the row reads as one panel."
        code={`<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--perfect-space-4)' }}>
  <StatTile icon={usersIcon} value="12,480" label="Users" hint={<Pill tone="success" size="sm">↑ 4%</Pill>} />
  <StatTile icon={revenueIcon} value="$48.2k" label="Revenue" hint={<Pill tone="success" size="sm">↑ 12%</Pill>} />
  <StatTile icon={bounceIcon} value="38%" label="Bounce rate" hint={<Pill tone="danger" size="sm">↑ 2%</Pill>} />
</div>`}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--perfect-space-4)' }}>
          <StatTile icon={usersIcon} value="12,480" label="Users" hint={<Pill tone="success" size="sm">↑ 4%</Pill>} />
          <StatTile icon={revenueIcon} value="$48.2k" label="Revenue" hint={<Pill tone="success" size="sm">↑ 12%</Pill>} />
          <StatTile icon={bounceIcon} value="38%" label="Bounce rate" hint={<Pill tone="danger" size="sm">↑ 2%</Pill>} />
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
        description="The skeleton holds the tile's geometry — a value line and a label line — while data loads."
        code={`<StatTile skeleton value="" label="" />`}
      >
        <StatTile skeleton value="" label="" />
      </Example>

      <h2>Props</h2>
      <PropsTable
        props={[
          { name: 'value', type: 'ReactNode', description: 'Required. The prominent value — a number, currency, or short string.' },
          { name: 'label', type: 'ReactNode', description: 'Required. The muted label naming what the value measures.' },
          { name: 'icon', type: 'ReactNode', description: 'Decorative leading glyph rendered in a muted disc; the disc is omitted when unset.' },
          { name: 'hint', type: 'ReactNode', description: 'Trailing delta or hint aligned to the value baseline, e.g. a Pill change chip.' },
          { name: 'glass', type: 'boolean', default: 'false', description: 'Renders the frosted glass material instead of a solid card.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: 'Renders a placeholder with the exact geometry.' },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>
          The tile is a presentational container with no role of its own; the value and label are read
          in source order, so keep the label a short, literal phrase.
        </li>
        <li>
          The leading icon disc is decorative and marked <code>aria-hidden</code>, so it is not
          announced — the value and label carry the meaning.
        </li>
        <li>
          When a hint conveys direction, do not rely on color alone: include a glyph or sign (↑ / ↓, +
          / −) so the change is legible without color.
        </li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>Use a StatTile for a single at-a-glance metric; line several up in a row or grid for a dashboard summary.</li>
        <li>Keep the value short — abbreviate large numbers (48.2k, 1.2M) so the tile stays compact.</li>
        <li>Reach for a Pill as the hint to show a delta, and match its tone to the direction of the change.</li>
      </ul>
    </>
  );
}
