import { useState } from 'react';
import { FilterChip, Heading, Text, Size, TextTone, useT } from '@glacier/react';
import { Star } from '@glacier/icons';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

const starIcon = <Star size={14} />;

function ControlledFilters() {
  const t = useT();
  const [active, setActive] = useState<Record<string, boolean>>({ open: true });
  const toggle = (key: string) => (next: boolean) => setActive((prev) => ({ ...prev, [key]: next }));
  return (
    <div style={{ display: 'flex', gap: 'var(--glacier-space-2)', flexWrap: 'wrap' }}>
      <FilterChip selected={active.open} onSelectedChange={toggle('open')} count={12}>
        {t(m.filterchipOpen)}
      </FilterChip>
      <FilterChip selected={active.closed} onSelectedChange={toggle('closed')} count={48}>
        {t(m.filterchipClosed)}
      </FilterChip>
      <FilterChip selected={active.mine} onSelectedChange={toggle('mine')} count={3}>
        {t(m.filterchipAssignedToMe)}
      </FilterChip>
    </div>
  );
}

export function FilterChipPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.fcName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.fcLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntro)}</Text>
      <ComponentBlueprint specId="filter-chip" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.fcEx1Desc)}
        component="FilterChip"
        render={(K) => (
          <div style={{ display: 'flex', gap: 'var(--glacier-space-2)' }}>
            <K.FilterChip defaultSelected>{t(m.filterchipAvailable)}</K.FilterChip>
            <K.FilterChip>{t(m.filterchipOnSale)}</K.FilterChip>
          </div>
        )}
        code={`import { FilterChip } from '@glacier/react';

<FilterChip defaultSelected>Available</FilterChip>
<FilterChip>On sale</FilterChip>`}
      />

      <Example
        title={t(m.fcEx2Title)}
        description={t(m.fcEx2Desc)}
        component="FilterChip"
        render={(K) => (
          <div style={{ display: 'flex', gap: 'var(--glacier-space-2)' }}>
            <K.FilterChip icon={starIcon} count={7} defaultSelected>
              {t(m.filterchipFeatured)}
            </K.FilterChip>
            <K.FilterChip count={24}>{t(m.filterchipArchived)}</K.FilterChip>
          </div>
        )}
        code={`<FilterChip icon={starIcon} count={7} defaultSelected>Featured</FilterChip>
<FilterChip count={24}>Archived</FilterChip>`}
      />

      <Example
        title={t(m.fcEx3Title)}
        description={t(m.fcEx3Desc)}
        code={`const [active, setActive] = useState({ open: true });

<FilterChip selected={active.open} onSelectedChange={(v) => setActive((p) => ({ ...p, open: v }))} count={12}>
  Open
</FilterChip>`}
      >
        <ControlledFilters />
      </Example>

      <Example
        title={t(m.fcEx4Title)}
        description={t(m.fcEx4Desc)}
        component="FilterChip"
        render={(K) => (
          <div style={{ display: 'flex', gap: 'var(--glacier-space-2)', alignItems: 'center' }}>
            <K.FilterChip size={Size.Small} count={4}>
              {t(m.filterchipSmall)}
            </K.FilterChip>
            <K.FilterChip size={Size.Medium} count={4}>
              {t(m.filterchipMedium)}
            </K.FilterChip>
            <K.FilterChip disabled>{t(m.filterchipDisabled)}</K.FilterChip>
          </div>
        )}
        code={`<FilterChip size={Size.Small} count={4}>Small</FilterChip>
<FilterChip size={Size.Medium} count={4}>Medium</FilterChip>
<FilterChip disabled count={0}>Disabled</FilterChip>`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'selected', type: 'boolean', description: t(m.fcPropSelected) },
          { name: 'defaultSelected', type: 'boolean', default: 'false', description: t(m.fcPropDefaultSelected) },
          { name: 'onSelectedChange', type: '(selected: boolean) => void', description: t(m.fcPropOnSelectedChange) },
          { name: 'icon', type: 'ReactNode', description: t(m.fcPropIcon) },
          { name: 'count', type: 'number', description: t(m.fcPropCount) },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: t(m.fcPropSize) },
          { name: 'disabled', type: 'boolean', default: 'false', description: t(m.fcPropDisabled) },
          { name: 'children', type: 'ReactNode', description: t(m.fcPropChildren) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.fcA11y1))}</li>
        <li>{prose(t(m.fcA11y2))}</li>
        <li>{prose(t(m.fcA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.fcUse1))}</li>
        <li>{prose(t(m.fcUse2))}</li>
        <li>{prose(t(m.fcUse3))}</li>
      </ul>
    </>
  );
}
