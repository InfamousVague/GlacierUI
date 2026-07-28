import { Button, Heading, Size, Text, TextTone, Variant, useT, type VirtualListHandle } from '@glacier/react';
import { useRef, useState } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

const COUNT = 100_000;

/**
 * The demo reports the window it is rendering, which is the whole point being
 * made: a hundred thousand rows, and never more than about twenty in the DOM.
 */
function VirtualDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const [visible, setVisible] = useState({ start: 0, end: 0 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--glacier-space-2)', width: '100%' }}>
      <K.VirtualList
        count={COUNT}
        itemSize={40}
        height={320}
        aria-label="Items"
        onVisibleChange={(start: number, end: number) => setVisible({ start, end })}
        renderItem={(index: number) => <Text size={Size.Small}>{t(m.vlRowLabel, { n: index + 1 })}</Text>}
      />
      <Text tone={TextTone.Muted} size={Size.Small} mono>
        {t(m.vlShowing, {
          start: visible.start + 1,
          end: visible.end + 1,
          total: COUNT.toLocaleString(),
        })}
      </Text>
    </div>
  );
}

function ScrollToDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const ref = useRef<VirtualListHandle>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--glacier-space-3)', width: '100%' }}>
      <Button variant={Variant.Soft} size={Size.Small} onClick={() => ref.current?.scrollToIndex(49_999, 'center')}>
        {t(m.vlJumpTo)}
      </Button>
      <K.VirtualList
        ref={ref}
        count={COUNT}
        itemSize={40}
        height={280}
        aria-label="Items"
        renderItem={(index: number) => <Text size={Size.Small}>{t(m.vlRowLabel, { n: index + 1 })}</Text>}
      />
    </div>
  );
}

export function VirtualListPage() {
  const t = useT();

  return (
    <>
      <Heading level={1}>{t(m.vlName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.vlLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.vlAnatomy)}</Text>
      <ComponentBlueprint specId="virtual-list" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.vlExBasicDesc)}
        component="VirtualList"
        render={(K) => <VirtualDemo K={K} />}
        code={`import { VirtualList } from '@glacier/react';

<VirtualList
  count={100_000}
  itemSize={40}
  height={320}
  aria-label="Items"
  renderItem={(index) => <Text size="sm">Item {index + 1}</Text>}
/>`}
      />

      <Example
        title={t(m.vlExScrollToTitle)}
        description={t(m.vlExScrollToDesc)}
        component="VirtualList"
        render={(K) => <ScrollToDemo K={K} />}
        code={`const ref = useRef<VirtualListHandle>(null);

<Button onClick={() => ref.current?.scrollToIndex(49_999, 'center')}>
  Jump to item 50,000
</Button>

<VirtualList ref={ref} count={100_000} itemSize={40} renderItem={…} />

// align: 'auto' (nearest edge, moves as little as possible)
//        'start' | 'center' | 'end'
// Returns without scrolling when the row is already fully visible.`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'count', type: 'number', description: t(m.vlPropCount) },
          { name: 'itemSize', type: 'number', description: t(m.vlPropItemSize) },
          { name: 'renderItem', type: '(index: number) => ReactNode', description: t(m.vlPropRenderItem) },
          { name: 'height', type: 'string | number', description: t(m.vlPropCount) },
          { name: 'overscan', type: 'number', default: '3', description: t(m.vlPropOverscan) },
          { name: 'onVisibleChange', type: '(start: number, end: number) => void', description: t(m.vlPropOnVisibleChange) },
          { name: 'getKey', type: '(index: number) => string | number', description: t(m.vlPropGetKey) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.vlA11y1))}</li>
        <li>{prose(t(m.vlA11y2))}</li>
        <li>{prose(t(m.vlA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.vlUse1))}</li>
        <li>{prose(t(m.vlUse2))}</li>
        <li>{prose(t(m.vlUse3))}</li>
      </ul>
    </>
  );
}
