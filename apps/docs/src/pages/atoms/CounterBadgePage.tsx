import { CounterBadge, Row, Heading, Text, Size, TextTone, Tone, useT } from '@glacier/react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

export function CounterBadgePage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.cntName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.cntLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntroBox)}</Text>
      <ComponentBlueprint specId="counter-badge" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.cntEx1Desc)}
        component="CounterBadge"
        render={(K) => (
          <Row gap={3} wrap>
            <K.CounterBadge count={3} />
            <K.CounterBadge count={12} />
          </Row>
        )}
        code={`import { CounterBadge } from '@glacier/react';

<CounterBadge count={3} />
<CounterBadge count={12} />`}
      />

      <Example
        title={t(m.cntEx2Title)}
        description={t(m.cntEx2Desc)}
        component="CounterBadge"
        render={(K) => (
          <Row gap={3} wrap>
            <K.CounterBadge count={128} />
            <K.CounterBadge count={12} max={9} />
          </Row>
        )}
        code={`<CounterBadge count={128} />
<CounterBadge count={12} max={9} />`}
      />

      <Example
        title={t(m.secTones)}
        description={t(m.cntEx3Desc)}
        component="CounterBadge"
        render={(K) => (
          <Row gap={3} wrap>
            <K.CounterBadge count={5} tone={Tone.Danger} />
            <K.CounterBadge count={5} tone={Tone.Accent} />
            <K.CounterBadge count={5} tone={Tone.Neutral} />
            <K.CounterBadge count={5} tone={Tone.Success} />
          </Row>
        )}
        code={`<CounterBadge count={5} tone={Tone.Danger} />
<CounterBadge count={5} tone={Tone.Accent} />
<CounterBadge count={5} tone={Tone.Neutral} />
<CounterBadge count={5} tone={Tone.Success} />`}
      />

      <Example
        title={t(m.cntEx4Title)}
        description={t(m.cntEx4Desc)}
        code={`<CounterBadge count={0} dot aria-label="Unread messages" />
<CounterBadge count={0} dot tone={Tone.Accent} aria-label="New activity" />`}
      >
        <Row gap={3} wrap>
          <CounterBadge count={0} dot aria-label={t(m.counterbadgeUnreadMessages)} />
          <CounterBadge count={0} dot tone={Tone.Accent} aria-label={t(m.counterbadgeNewActivity)} />
        </Row>
      </Example>

      <Example
        title={t(m.exSkeleton)}
        description={t(m.cntEx5Desc)}
        component="CounterBadge"
        render={(K) => (
          <Row gap={3} wrap>
            <K.CounterBadge count={0} skeleton />
            <K.CounterBadge count={5} />
          </Row>
        )}
        code={`<CounterBadge count={0} skeleton />
<CounterBadge count={5} />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'count', type: 'number', description: t(m.cntPropCount) },
          { name: 'max', type: 'number', default: '99', description: t(m.cntPropMax) },
          { name: 'tone', type: "'danger' | 'accent' | 'neutral' | 'success'", default: "'danger'", description: t(m.cntPropTone) },
          { name: 'dot', type: 'boolean', default: 'false', description: t(m.cntPropDot) },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: t(m.cntPropSize) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.cntPropSkeleton) },
          { name: 'aria-label', type: 'string', description: t(m.cntPropAriaLabel) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.cntA11y1))}</li>
        <li>{prose(t(m.cntA11y2))}</li>
        <li>{prose(t(m.cntA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.cntUse1))}</li>
        <li>{prose(t(m.cntUse2))}</li>
        <li>{prose(t(m.cntUse3))}</li>
      </ul>
    </>
  );
}
