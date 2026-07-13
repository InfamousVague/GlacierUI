import { StatTile, Pill, Heading, Text, Size, TextTone, Tone, useT } from '@glacier/react';
import { DollarSign, TrendingUp, Users } from '@glacier/icons';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

const usersIcon = <Users size={18} />;
const revenueIcon = <DollarSign size={18} />;
const bounceIcon = <TrendingUp size={18} />;

export function StatTilePage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.sttName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.sttLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntro)}</Text>
      <ComponentBlueprint specId="stat-tile" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.sttEx1Desc)}
        component="StatTile"
        render={(K) => <K.StatTile value="12,480" label={t(m.stattileTotalUsers)} />}
        code={`import { StatTile } from '@glacier/react';

<StatTile value="12,480" label="Total users" />`}
      />

      <Example
        title={t(m.sttEx2Title)}
        description={t(m.sttEx2Desc)}
        component="StatTile"
        render={(K) => <K.StatTile icon={usersIcon} value="12,480" label={t(m.stattileTotalUsers)} />}
        code={`<StatTile icon={usersIcon} value="12,480" label="Total users" />`}
      />

      <Example
        title={t(m.sttEx3Title)}
        description={t(m.sttEx3Desc)}
        component="StatTile"
        render={(K) => (
          <K.StatTile
            icon={revenueIcon}
            value="$48.2k"
            label={t(m.stattileRevenueThisMonth)}
            hint={<Pill tone={Tone.Success} size={Size.Small}>↑ 12%</Pill>}
          />
        )}
        code={`<StatTile
  icon={revenueIcon}
  value="$48.2k"
  label="Revenue this month"
  hint={<Pill tone={Tone.Success} size={Size.Small}>↑ 12%</Pill>}
/>`}
      />

      <Example
        title={t(m.sttEx4Title)}
        description={t(m.sttEx4Desc)}
        component="StatTile"
        render={(K) => (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--glacier-space-4)' }}>
            <K.StatTile icon={usersIcon} value="12,480" label={t(m.stattileUsers)} hint={<Pill tone={Tone.Success} size={Size.Small}>↑ 4%</Pill>} />
            <K.StatTile icon={revenueIcon} value="$48.2k" label={t(m.stattileRevenue)} hint={<Pill tone={Tone.Success} size={Size.Small}>↑ 12%</Pill>} />
            <K.StatTile icon={bounceIcon} value="38%" label={t(m.stattileBounceRate)} hint={<Pill tone={Tone.Danger} size={Size.Small}>↑ 2%</Pill>} />
          </div>
        )}
        code={`<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--glacier-space-4)' }}>
  <StatTile icon={usersIcon} value="12,480" label="Users" hint={<Pill tone={Tone.Success} size={Size.Small}>↑ 4%</Pill>} />
  <StatTile icon={revenueIcon} value="$48.2k" label="Revenue" hint={<Pill tone={Tone.Success} size={Size.Small}>↑ 12%</Pill>} />
  <StatTile icon={bounceIcon} value="38%" label="Bounce rate" hint={<Pill tone={Tone.Danger} size={Size.Small}>↑ 2%</Pill>} />
</div>`}
      />

      <Example
        title={t(m.exGlass)}
        description={t(m.sttEx5Desc)}
        component="StatTile"
        render={(K) => <K.StatTile glass icon={usersIcon} value="12,480" label={t(m.stattileTotalUsers)} />}
        code={`<StatTile glass icon={usersIcon} value="12,480" label="Total users" />`}
      />

      <Example
        title={t(m.sttEx6Title)}
        description={t(m.sttEx6Desc)}
        component="StatTile"
        render={(K) => (
          <div style={{ display: 'grid', gap: 'var(--glacier-space-4)', maxWidth: '16rem' }}>
            <K.StatTile skeleton icon={usersIcon} hint="+12%" value="" label="" />
            <K.StatTile skeleton value="" label="" />
          </div>
        )}
        code={`<StatTile skeleton icon={usersIcon} hint="+12%" value="" label="" />
<StatTile skeleton value="" label="" />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'value', type: 'ReactNode', description: t(m.sttPropValue) },
          { name: 'label', type: 'ReactNode', description: t(m.sttPropLabel) },
          { name: 'icon', type: 'ReactNode', description: t(m.sttPropIcon) },
          { name: 'hint', type: 'ReactNode', description: t(m.sttPropHint) },
          { name: 'glass', type: 'boolean', default: 'false', description: t(m.sttPropGlass) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.sttPropSkeleton) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.sttA11y1))}</li>
        <li>{prose(t(m.sttA11y2))}</li>
        <li>{prose(t(m.sttA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.sttUse1))}</li>
        <li>{prose(t(m.sttUse2))}</li>
        <li>{prose(t(m.sttUse3))}</li>
      </ul>
    </>
  );
}
