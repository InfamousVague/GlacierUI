import { Heading, Size, Text, TextTone, useT } from '@glacier/react';
import { useState } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

interface Row {
  id: string;
  name: string;
}

/**
 * The list is controlled, so each demo owns the order in its own state - which
 * is also the point being demonstrated: nothing moves unless the caller takes
 * the array the list hands back.
 */
function SortableDemo({ K, size, showOrder }: { K: PlatformKit; size?: 'sm' | 'md' | 'lg'; showOrder?: boolean }) {
  const t = useT();
  const [items, setItems] = useState<Row[]>([
    { id: 'inbox', name: t(m.slItemInbox) },
    { id: 'starred', name: t(m.slItemStarred) },
    { id: 'drafts', name: t(m.slItemDrafts) },
    { id: 'archive', name: t(m.slItemArchive) },
    { id: 'spam', name: t(m.slItemSpam) },
  ]);

  return (
    // width:100% because this wrapper is a flex item in the example pane; left
    // to `auto` it sizes to its content and the list inside asking for 100% of
    // it becomes circular.
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--glacier-space-3)', width: '100%' }}>
      <K.SortableList
        items={items}
        onReorder={setItems}
        renderItem={(item: Row) => item.name}
        getLabel={(item: Row) => item.name}
        size={size}
      />
      {showOrder && (
        <Text tone={TextTone.Muted} size={Size.Small} mono>
          {t(m.slOrderIs, { order: items.map((i) => i.id).join(' → ') })}
        </Text>
      )}
    </div>
  );
}

export function SortableListPage() {
  const t = useT();

  return (
    <>
      <Heading level={1}>{t(m.slName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.slLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.slAnatomy)}</Text>
      <ComponentBlueprint specId="sortable-list" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.slExBasicDesc)}
        component="SortableList"
        render={(K) => <SortableDemo K={K} showOrder />}
        code={`import { SortableList } from '@glacier/react';

const [items, setItems] = useState([
  { id: 'inbox', name: 'Inbox' },
  { id: 'starred', name: 'Starred' },
]);

<SortableList
  items={items}
  onReorder={setItems}
  renderItem={(item) => item.name}
  getLabel={(item) => item.name}
/>`}
      />

      <Example
        title={t(m.slExKeyboardTitle)}
        description={t(m.slExKeyboardDesc)}
        component="SortableList"
        render={(K) => <SortableDemo K={K} />}
        code={`// Tab to a grip, then:
//   Space / Enter  lift, and drop once lifted
//   ArrowUp/Down   move one slot, clamped at both ends
//   Home / End     send to the top or the bottom
//   Escape         cancel and put it back

// Every move is announced in a polite live region, naming the
// row and its new position.
<SortableList items={items} onReorder={setItems} renderItem={…} getLabel={(i) => i.name} />`}
      />

      <Example
        title={t(m.secSizes)}
        description={t(m.slExSizesDesc)}
        component="SortableList"
        render={(K) => <SortableDemo K={K} size="sm" />}
        code={`<SortableList size="sm" … />
<SortableList size="md" … />
<SortableList size="lg" … />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'items', type: 'T[]', description: t(m.slPropItems) },
          { name: 'onReorder', type: '(items: T[]) => void', description: t(m.slPropOnReorder) },
          { name: 'renderItem', type: '(item: T, index: number) => ReactNode', description: t(m.slPropRenderItem) },
          { name: 'getLabel', type: '(item: T) => string', description: t(m.slPropGetLabel) },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t(m.slPropSize) },
          { name: 'disabled', type: 'boolean', default: 'false', description: t(m.slPropDisabled) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.slA11y1))}</li>
        <li>{prose(t(m.slA11y2))}</li>
        <li>{prose(t(m.slA11y3))}</li>
        <li>{prose(t(m.slA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.slUse1))}</li>
        <li>{prose(t(m.slUse2))}</li>
        <li>{prose(t(m.slUse3))}</li>
      </ul>
    </>
  );
}
