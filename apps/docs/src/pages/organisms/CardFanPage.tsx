import { Heading, Size, Text, TextTone, useT } from '@glacier/react';
import { useState } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

interface Card {
  id: string;
  label: string;
  tone: string;
}

const TONES = ['accent', 'success', 'warning', 'danger', 'info', 'neutral'];

/** A hand of plain coloured cards — the fan is the component, not the card. */
function hand(size: number): Card[] {
  return Array.from({ length: size }, (_, i) => ({
    id: `c${i}`,
    label: String(i + 1),
    tone: TONES[i % TONES.length]!,
  }));
}

/**
 * The card body is the caller's. The fan owns only where each one sits, how far
 * it leans, and which one is magnified — so a demo can draw whatever it likes
 * inside and still get the same spread.
 */
function FanCard({ card }: { card: Card }) {
  return (
    <div
      style={{
        aspectRatio: '1 / 1.4',
        display: 'grid',
        placeItems: 'center',
        borderRadius: 'var(--glacier-radius-lg)',
        border: 'var(--glacier-hairline) solid var(--glacier-border)',
        background: `var(--glacier-${card.tone}-soft)`,
        color: `var(--glacier-${card.tone}-text)`,
        fontFamily: 'var(--glacier-font-mono)',
        fontSize: 'var(--glacier-font-size-lg)',
        boxShadow: 'var(--glacier-shadow-2)',
      }}
    >
      {card.label}
    </div>
  );
}

function FanDemo({ K, count = 7, ...props }: { K: PlatformKit; count?: number } & Record<string, unknown>) {
  const [selected, setSelected] = useState<string | undefined>();
  const cards = hand(count);
  return (
    // The fan places every card absolutely, so it has no intrinsic width to
    // give a shrink-to-fit example pane. The demo states one.
    <div style={{ width: '100%', minWidth: '22rem' }}>
      <K.CardFan
        items={cards}
        renderItem={(card: Card) => <FanCard card={card} />}
        getLabel={(card: Card) => card.label}
        selected={selected}
        onSelect={setSelected}
        {...props}
      />
    </div>
  );
}

export function CardFanPage() {
  const t = useT();

  return (
    <>
      <Heading level={1}>{t(m.cfName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.cfLede)}
      </Text>
      <Text tone={TextTone.Muted}>{prose(t(m.cfWhySlinky))}</Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.cfAnatomy)}</Text>
      <ComponentBlueprint specId="card-fan" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.cfExBasicDesc)}
        component="CardFan"
        platformLayout="stacked"
        render={(K) => <FanDemo K={K} />}
        code={`<CardFan
  items={cards}
  renderItem={(card) => <Card {...card} />}
  getLabel={(card) => card.name}
  onSelect={setSelected}
/>`}
      />

      <Example
        title={t(m.cfExScaleTitle)}
        description={t(m.cfExScaleDesc)}
        component="CardFan"
        platformLayout="stacked"
        render={(K) => <FanDemo K={K} count={40} />}
        code={`// The same strip, forty cards. The track is fixed and the cards are
// distributed across it by weight, so the fan cannot overflow — it just
// gets denser, and opens up wherever the pointer is.
<CardFan items={fortyCards} renderItem={renderCard} />`}
      />

      <Example
        title={t(m.cfExFlatTitle)}
        description={t(m.cfExFlatDesc)}
        component="CardFan"
        platformLayout="stacked"
        render={(K) => <FanDemo K={K} count={9} spread={0} />}
        code={`// spread={0} keeps the slinky spacing but lays the arc flat, for a
// strip of thumbnails rather than a hand of cards.
<CardFan items={items} renderItem={renderItem} spread={0} />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'items', type: 'T[]', description: t(m.cfPropItems) },
          { name: 'renderItem', type: '(item: T, index: number) => ReactNode', description: t(m.cfPropRenderItem) },
          { name: 'getLabel', type: '(item: T) => string', description: t(m.cfPropGetLabel) },
          { name: 'selected', type: 'string', description: t(m.cfPropSelected) },
          { name: 'onSelect', type: '(id: string) => void', description: t(m.cfPropOnSelect) },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t(m.cfPropSize) },
          { name: 'spread', type: 'number', default: '1', description: t(m.cfPropSpread) },
          { name: 'magnify', type: 'boolean', default: 'true', description: t(m.cfPropMagnify) },
          { name: 'disabled', type: 'boolean', default: 'false', description: t(m.cfPropDisabled) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.cfPropSkeleton) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.cfA11y1))}</li>
        <li>{prose(t(m.cfA11y2))}</li>
        <li>{prose(t(m.cfA11y3))}</li>
      </ul>
    </>
  );
}
