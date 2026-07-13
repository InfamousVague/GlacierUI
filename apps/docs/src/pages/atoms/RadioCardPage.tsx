import { useState, type CSSProperties, type ReactNode } from 'react';
import { Heading, Text, Size, TextTone, useT } from '@glacier/react';
import { Monitor, Moon, Sun } from '@glacier/icons';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { m } from '../../i18n.ts';

// Equal-width radio cards: auto-fit columns each stretch to fill their track, so
// every card is the same width and wraps to a new row when it no longer fits.
// The cards fill their grid cell on both bindings (grid items stretch by
// default), so the Web and Native panes line up identically.
const CARD_GRID: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))',
  gap: 'var(--glacier-space-3)',
  width: '100%',
};

interface DemoCard {
  value: string;
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

/**
 * A controlled radio-card group. A native radio group has no `name`-based DOM
 * owner to enforce single-select, so exclusivity is driven by lifting the
 * selected value into state and passing `checked`/`onCheckedChange` to every
 * card — the parent-owned-group path the web kit documents. Each comparison pane
 * renders its own instance, so Web and Native each manage their own selection.
 * `K` is the platform kit (the DOM kit or the RN kit) the demo renders through.
 */
function RadioCardGroup({
  K,
  name,
  initial,
  cards,
}: {
  K: PlatformKit;
  name: string;
  initial: string;
  cards: DemoCard[];
}) {
  const [selected, setSelected] = useState(initial);
  return (
    <div style={CARD_GRID}>
      {cards.map((c) => (
        <K.RadioCard
          key={c.value}
          name={name}
          value={c.value}
          checked={selected === c.value}
          onCheckedChange={() => setSelected(c.value)}
          icon={c.icon}
          title={c.title}
          description={c.description}
          disabled={c.disabled}
        />
      ))}
    </div>
  );
}

export function RadioCardPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.rcName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.rcLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.rcAnatomyIntro)}</Text>
      <ComponentBlueprint specId="radio-card" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.rcEx1Title)}
        description={prose(t(m.rcEx1Desc))}
        component="RadioCard"
        render={(K) => (
          <RadioCardGroup
            K={K}
            name="theme"
            initial="light"
            cards={[
              { value: 'light', icon: <Sun size={20} />, title: t(m.radiocardLight), description: t(m.rcDemoLightDesc) },
              { value: 'dark', icon: <Moon size={20} />, title: t(m.radiocardDark), description: t(m.rcDemoDarkDesc) },
              { value: 'system', icon: <Monitor size={20} />, title: t(m.radiocardSystem), description: t(m.rcDemoSystemDesc) },
            ]}
          />
        )}
        code={`import { RadioCard } from '@glacier/react';
import { Sun, Moon, Monitor } from '@glacier/icons';

<RadioCard
  name="theme"
  value="light"
  defaultChecked
  icon={<Sun size={20} />}
  title="Light"
  description="Bright surfaces for well-lit rooms."
/>
<RadioCard
  name="theme"
  value="dark"
  icon={<Moon size={20} />}
  title="Dark"
  description="Dim surfaces that are easy on the eyes."
/>
<RadioCard
  name="theme"
  value="system"
  icon={<Monitor size={20} />}
  title="System"
  description="Follow the operating system setting."
/>`}
      />

      <Example
        title={t(m.rcEx2Title)}
        description={t(m.rcEx2Desc)}
        component="RadioCard"
        render={(K) => (
          <RadioCardGroup
            K={K}
            name="plan"
            initial="yearly"
            cards={[
              { value: 'monthly', title: t(m.radiocardMonthly) },
              { value: 'yearly', title: t(m.radiocardYearly) },
            ]}
          />
        )}
        code={`<RadioCard name="plan" value="monthly" title="Monthly" />
<RadioCard name="plan" value="yearly" defaultChecked title="Yearly" />`}
      />

      <Example
        title={t(m.rcEx3Title)}
        description={t(m.rcEx3Desc)}
        component="RadioCard"
        render={(K) => (
          <RadioCardGroup
            K={K}
            name="tier"
            initial="pro"
            cards={[
              { value: 'pro', title: t(m.radiocardPro), description: t(m.rcDemoProDesc) },
              { value: 'enterprise', disabled: true, title: t(m.radiocardEnterprise), description: t(m.rcDemoEnterpriseDesc) },
            ]}
          />
        )}
        code={`<RadioCard name="tier" value="pro" title="Pro" description="Everything, unlimited." />
<RadioCard name="tier" value="enterprise" disabled title="Enterprise" description="Contact sales." />`}
      />

      <Example
        title={t(m.exSkeleton)}
        description={prose(t(m.rcEx4Desc))}
        component="RadioCard"
        render={(K) => (
          <div style={CARD_GRID}>
            <K.RadioCard skeleton title="" />
            <K.RadioCard skeleton title="" />
          </div>
        )}
        code={`<RadioCard skeleton title="" />
<RadioCard skeleton title="" />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          {
            name: 'title',
            type: 'ReactNode',
            description: t(m.rcPropTitle),
          },
          {
            name: 'description',
            type: 'ReactNode',
            description: t(m.rcPropDescription),
          },
          {
            name: 'icon',
            type: 'ReactNode',
            description: t(m.rcPropIcon),
          },
          {
            name: 'checked',
            type: 'boolean',
            description: t(m.rcPropChecked),
          },
          {
            name: 'defaultChecked',
            type: 'boolean',
            default: 'false',
            description: t(m.rcPropDefaultChecked),
          },
          {
            name: 'onCheckedChange',
            type: '(checked: boolean) => void',
            description: t(m.rcPropOnCheckedChange),
          },
          {
            name: 'value',
            type: 'string',
            description: t(m.rcPropValue),
          },
          {
            name: 'name',
            type: 'string',
            description: t(m.rcPropName),
          },
          {
            name: 'disabled',
            type: 'boolean',
            default: 'false',
            description: t(m.rcPropDisabled),
          },
          {
            name: 'children',
            type: 'ReactNode',
            description: t(m.rcPropChildren),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.rcPropSkeleton),
          },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.rcA11y1))}</li>
        <li>{prose(t(m.rcA11y2))}</li>
        <li>{prose(t(m.rcA11y3))}</li>
        <li>{prose(t(m.rcA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.rcUse1))}</li>
        <li>{prose(t(m.rcUse2))}</li>
        <li>{prose(t(m.rcUse3))}</li>
        <li>{prose(t(m.rcUse4))}</li>
      </ul>
    </>
  );
}
