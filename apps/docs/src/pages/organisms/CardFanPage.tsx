import { Heading, Size, Text, TextTone, useT } from '@glacier/react';
import { useState } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

interface Card {
  id: string;
  label: string;
}

function hand(size: number): Card[] {
  return Array.from({ length: size }, (_, i) => ({ id: `c${i}`, label: String(i + 1) }));
}

/**
 * The card body is the caller's. The fan owns only where each one sits, how far
 * it leans, and which one is magnified - so a demo can draw whatever it likes
 * inside and still get the same spread.
 */
/**
 * A blueprint card back: the same navy, dot grid and cyan line work the
 * component drawings use.
 *
 * One face for every card, deliberately. Six tints made the demo a colour
 * chart, and the eye read the colours as meaning something - but the component
 * being shown is the *placement*, and a uniform back is what lets you see the
 * spread, the lean and the overlap instead of the deck.
 */
function FanCard({ card }: { card: Card }) {
  return (
    <div
      style={{
        aspectRatio: '1 / 1.4',
        display: 'grid',
        placeItems: 'center',
        borderRadius: 'var(--glacier-radius-lg)',
        border: 'var(--glacier-hairline) solid var(--glacier-accent-border)',
        background: 'var(--glacier-accent-soft)',
        // The blueprints' 16px dot lattice, as a background rather than an SVG
        // pattern so a card costs one element.
        backgroundImage:
          'radial-gradient(circle at 1px 1px, var(--glacier-accent-border) 0.75px, transparent 0.75px)',
        backgroundSize: '16px 16px',
        boxShadow: 'var(--glacier-shadow-2)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* An inset rule, the way a blueprint frames its subject. */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: '6px',
          border: 'var(--glacier-hairline) solid var(--glacier-accent-border)',
          borderRadius: 'var(--glacier-radius-md)',
        }}
      />
      <span
        style={{
          position: 'relative',
          color: 'var(--glacier-accent-text)',
          fontFamily: 'var(--glacier-font-mono)',
          fontSize: 'var(--glacier-font-size-lg)',
        }}
      >
        {card.label}
      </span>
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
// distributed across it by weight, so the fan cannot overflow - it just
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
