import {
  Box,
  Card,
  Heading,
  Pill,
  Size,
  Stack,
  StatTile,
  Text,
  TextTone,
  Tone,
  useT,
} from '@glacier/react';
import { DollarSign, TrendingUp, Users } from '@glacier/icons';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

const usersIcon = <Users size={18} />;
const revenueIcon = <DollarSign size={18} />;
const trendIcon = <TrendingUp size={18} />;

function DemoCard({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <Stack gap={1}>
        <Text weight="semibold">{title}</Text>
        <Text size={Size.Small} tone={TextTone.Muted}>
          {body}
        </Text>
      </Stack>
    </Card>
  );
}

export function CardGroupPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.cgName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.cgLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntro)}</Text>
      <ComponentBlueprint specId="card-group" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.cgEx1Title)}
        description={t(m.cgEx1Desc)}
        component="CardGroup"
        render={(K) => (
          <Box width="full">
            <K.CardGroup>
              <StatTile icon={usersIcon} value="12,480" label={t(m.cardgroupUsers)} hint={<Pill tone={Tone.Success} size={Size.Small}>↑ 4%</Pill>} />
              <StatTile icon={revenueIcon} value="$48.2k" label={t(m.cardgroupRevenue)} hint={<Pill tone={Tone.Success} size={Size.Small}>↑ 12%</Pill>} />
              <StatTile icon={trendIcon} value="38%" label={t(m.cardgroupBounceRate)} hint={<Pill tone={Tone.Danger} size={Size.Small}>↑ 2%</Pill>} />
              <StatTile value="4m 12s" label={t(m.cardgroupAvgSession)} />
            </K.CardGroup>
          </Box>
        )}
        code={`import { CardGroup, Pill, Size, StatTile, Tone } from '@glacier/react';

<CardGroup>
  <StatTile icon={usersIcon} value="12,480" label="Users" hint={<Pill tone={Tone.Success} size={Size.Small}>↑ 4%</Pill>} />
  <StatTile icon={revenueIcon} value="$48.2k" label="Revenue" hint={<Pill tone={Tone.Success} size={Size.Small}>↑ 12%</Pill>} />
  <StatTile icon={trendIcon} value="38%" label="Bounce rate" hint={<Pill tone={Tone.Danger} size={Size.Small}>↑ 2%</Pill>} />
  <StatTile value="4m 12s" label="Avg. session" />
</CardGroup>`}
      />

      <Example
        title={t(m.cgEx2Title)}
        description={t(m.cgEx2Desc)}
        component="CardGroup"
        render={(K) => (
          <Box width="full">
            <K.CardGroup mode="list">
              <DemoCard title={t(m.cgCard1Title)} body={t(m.cgCard1Body)} />
              <DemoCard title={t(m.cgCard2Title)} body={t(m.cgCard2Body)} />
              <DemoCard title={t(m.cgCard3Title)} body={t(m.cgCard3Body)} />
            </K.CardGroup>
          </Box>
        )}
        code={`<CardGroup mode="list">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</CardGroup>`}
      />

      <Example
        title={t(m.cgEx3Title)}
        description={t(m.cgEx3Desc)}
        component="CardGroup"
        render={(K) => (
          <Stack gap={6} width="full">
            <Stack gap={2}>
              <Text size={Size.Small} tone={TextTone.Muted}>{prose(t(m.cgGapComfortable))}</Text>
              <K.CardGroup gap="lg" minItemWidth="12rem">
                <DemoCard title={t(m.cardgroupAlpha)} body={t(m.cgCardFirst)} />
                <DemoCard title={t(m.cardgroupBeta)} body={t(m.cgCardSecond)} />
                <DemoCard title={t(m.cardgroupGamma)} body={t(m.cgCardThird)} />
              </K.CardGroup>
            </Stack>
            <Stack gap={2}>
              <Text size={Size.Small} tone={TextTone.Muted}>{prose(t(m.cgGapCompact))}</Text>
              <K.CardGroup gap="lg" density="compact" minItemWidth="12rem">
                <DemoCard title={t(m.cardgroupAlpha)} body={t(m.cgCardFirst)} />
                <DemoCard title={t(m.cardgroupBeta)} body={t(m.cgCardSecond)} />
                <DemoCard title={t(m.cardgroupGamma)} body={t(m.cgCardThird)} />
              </K.CardGroup>
            </Stack>
          </Stack>
        )}
        code={`<CardGroup gap="lg">...</CardGroup>
<CardGroup gap="lg" density="compact">...</CardGroup>`}
      />

      <Example
        title={t(m.cgEx4Title)}
        description={t(m.cgEx4Desc)}
        component="CardGroup"
        render={(K) => (
          <Box width="full">
            <K.CardGroup minItemWidth="24rem">
              <DemoCard title={t(m.cgCard4Title)} body={t(m.cgCard4Body)} />
              <DemoCard title={t(m.cgCard5Title)} body={t(m.cgCard5Body)} />
              <DemoCard title={t(m.cgCard6Title)} body={t(m.cgCard6Body)} />
            </K.CardGroup>
          </Box>
        )}
        code={`<CardGroup minItemWidth="24rem">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</CardGroup>`}
      />

      <Example
        title={t(m.exSkeleton)}
        description={t(m.cgEx5Desc)}
        component="CardGroup"
        render={(K) => (
          <Box width="full">
            <K.CardGroup skeleton skeletonCount={6} />
          </Box>
        )}
        code={`<CardGroup skeleton skeletonCount={6} />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'mode', type: "'grid' | 'list'", default: "'grid'", description: t(m.cgPropMode) },
          { name: 'minItemWidth', type: 'string', default: "'16rem'", description: t(m.cgPropMinItemWidth) },
          { name: 'gap', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t(m.cgPropGap) },
          { name: 'density', type: "'comfortable' | 'compact'", default: "'comfortable'", description: t(m.cgPropDensity) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.cgPropSkeleton) },
          { name: 'skeletonCount', type: 'number', default: '6', description: t(m.cgPropSkeletonCount) },
          { name: 'children', type: 'ReactNode', description: t(m.cgPropChildren) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.cgA11y1))}</li>
        <li>{prose(t(m.cgA11y2))}</li>
        <li>{prose(t(m.cgA11y3))}</li>
        <li>{prose(t(m.cgA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.cgUse1))}</li>
        <li>{prose(t(m.cgUse2))}</li>
        <li>{prose(t(m.cgUse3))}</li>
        <li>{prose(t(m.cgUse4))}</li>
        <li>{prose(t(m.cgUse5))}</li>
      </ul>
    </>
  );
}
