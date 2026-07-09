import { useState } from 'react';
import { FilterChip, Heading, Text, Size, TextTone } from '@glacier/react';
import { Star } from '@glacier/icons';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

const starIcon = <Star size={14} />;

function ControlledFilters() {
  const [active, setActive] = useState<Record<string, boolean>>({ open: true });
  const toggle = (key: string) => (next: boolean) => setActive((prev) => ({ ...prev, [key]: next }));
  return (
    <div style={{ display: 'flex', gap: 'var(--glacier-space-2)', flexWrap: 'wrap' }}>
      <FilterChip selected={active.open} onSelectedChange={toggle('open')} count={12}>
        Open
      </FilterChip>
      <FilterChip selected={active.closed} onSelectedChange={toggle('closed')} count={48}>
        Closed
      </FilterChip>
      <FilterChip selected={active.mine} onSelectedChange={toggle('mine')} count={3}>
        Assigned to me
      </FilterChip>
    </div>
  );
}

export function FilterChipPage() {
  return (
    <>
      <Heading level={1}>FilterChip</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A toggleable filter pill for faceted filtering. It renders as a button with{' '}
        <code>aria-pressed</code>; the selected state paints the accent soft tint, with an optional
        leading icon and a trailing count. Controlled <code>selected</code> +{' '}
        <code>onSelectedChange</code>, like the kit's other toggles.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the figure.</Text>
      <ComponentBlueprint specId="filter-chip" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Basic"
        description="An uncontrolled chip toggles its own selected state. Selected fills with the accent soft tint."
        code={`import { FilterChip } from '@glacier/react';

<FilterChip defaultSelected>Available</FilterChip>
<FilterChip>On sale</FilterChip>`}
      >
        <div style={{ display: 'flex', gap: 'var(--glacier-space-2)' }}>
          <FilterChip defaultSelected>Available</FilterChip>
          <FilterChip>On sale</FilterChip>
        </div>
      </Example>

      <Example
        title="Icon and count"
        description="Add a leading icon and a trailing count. The count is a CounterBadge that follows the accent tone when the chip is selected."
        code={`<FilterChip icon={starIcon} count={7} defaultSelected>Featured</FilterChip>
<FilterChip count={24}>Archived</FilterChip>`}
      >
        <div style={{ display: 'flex', gap: 'var(--glacier-space-2)' }}>
          <FilterChip icon={starIcon} count={7} defaultSelected>
            Featured
          </FilterChip>
          <FilterChip count={24}>Archived</FilterChip>
        </div>
      </Example>

      <Example
        title="Controlled group"
        description="Drive selection from state to build a filter bar. Each chip reports the next state through onSelectedChange."
        code={`const [active, setActive] = useState({ open: true });

<FilterChip selected={active.open} onSelectedChange={(v) => setActive((p) => ({ ...p, open: v }))} count={12}>
  Open
</FilterChip>`}
      >
        <ControlledFilters />
      </Example>

      <Example
        title="Sizes and disabled"
        description="Two compact sizes match Pill; a disabled chip is dimmed and cannot be toggled."
        code={`<FilterChip size={Size.Small} count={4}>Small</FilterChip>
<FilterChip size={Size.Medium} count={4}>Medium</FilterChip>
<FilterChip disabled count={0}>Disabled</FilterChip>`}
      >
        <div style={{ display: 'flex', gap: 'var(--glacier-space-2)', alignItems: 'center' }}>
          <FilterChip size={Size.Small} count={4}>
            Small
          </FilterChip>
          <FilterChip size={Size.Medium} count={4}>
            Medium
          </FilterChip>
          <FilterChip disabled>Disabled</FilterChip>
        </div>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'selected', type: 'boolean', description: 'Controlled selected state.' },
          { name: 'defaultSelected', type: 'boolean', default: 'false', description: 'Initial selected state when uncontrolled.' },
          { name: 'onSelectedChange', type: '(selected: boolean) => void', description: 'Called with the next selected state when the chip is toggled.' },
          { name: 'icon', type: 'ReactNode', description: 'Leading glyph, hidden from assistive tech.' },
          { name: 'count', type: 'number', description: 'Trailing count, rendered as a CounterBadge; hidden when 0 or less.' },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Compact size step.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Dims the chip and blocks toggling.' },
          { name: 'children', type: 'ReactNode', description: 'Required. Chip label.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          The chip is a <code>button</code> with <code>aria-pressed</code> reflecting the selected
          state, so assistive tech announces it as a toggle.
        </li>
        <li>Enter and Space toggle the chip; it participates in the tab order like any button.</li>
        <li>
          The leading icon is <code>aria-hidden</code>; the trailing count is a{' '}
          <code>role="status"</code> CounterBadge that announces its value.
        </li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Use FilterChips for a row of togglable filters or facets; reach for a Segmented control when the options are mutually exclusive.</li>
        <li>Keep labels to a noun or short phrase and add a count when the number of matches is useful.</li>
        <li>Drive a group from state with <code>selected</code> + <code>onSelectedChange</code> so the active set is a single source of truth.</li>
      </ul>
    </>
  );
}
