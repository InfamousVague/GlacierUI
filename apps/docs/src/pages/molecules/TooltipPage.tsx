import { Button, IconButton, Kbd, Row, Tooltip, Heading, Text, Size, TextTone, Variant, useT } from '@glacier/react';
import { Link2 } from '@glacier/icons';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

export function TooltipPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.tipName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.tipLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.tipAnatomyIntro)}</Text>
      <ComponentBlueprint specId="tooltip" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.tipEx1Desc)}
        component="Tooltip"
        render={(K) => (
          <K.Tooltip content={t(m.tipContentSaved)}>
            <K.Button>{t(m.tooltipSave)}</K.Button>
          </K.Tooltip>
        )}
        code={`import { Button, Tooltip } from '@glacier/react';

<Tooltip content="Saved to your library">
  <Button>Save</Button>
</Tooltip>`}
      />

      <Example
        title={t(m.tipEx2Title)}
        description={t(m.tipEx2Desc)}
        component="Tooltip"
        render={(K) => (
          <Row gap={3} wrap>
            <K.Tooltip content={t(m.tipContentTop)} placement="top">
              <K.Button>{t(m.tooltipTop)}</K.Button>
            </K.Tooltip>
            <K.Tooltip content={t(m.tipContentBottom)} placement="bottom">
              <K.Button>{t(m.tooltipBottom)}</K.Button>
            </K.Tooltip>
            <K.Tooltip content={t(m.tipContentLeft)} placement="left">
              <K.Button>{t(m.tooltipLeft)}</K.Button>
            </K.Tooltip>
            <K.Tooltip content={t(m.tipContentRight)} placement="right">
              <K.Button>{t(m.tooltipRight)}</K.Button>
            </K.Tooltip>
          </Row>
        )}
        code={`<Tooltip content="Opens above" placement="top">
  <Button>Top</Button>
</Tooltip>
<Tooltip content="Opens below" placement="bottom">
  <Button>Bottom</Button>
</Tooltip>
<Tooltip content="Opens to the left" placement="left">
  <Button>Left</Button>
</Tooltip>
<Tooltip content="Opens to the right" placement="right">
  <Button>Right</Button>
</Tooltip>`}
      />

      <Example
        title={t(m.tipEx3Title)}
        description={t(m.tipEx3Desc)}
        component="Tooltip"
        render={(K) => (
          <K.Tooltip content={t(m.tipContentCopyLink)}>
            <K.IconButton aria-label={t(m.tipContentCopyLink)}><Link2 size={18} /></K.IconButton>
          </K.Tooltip>
        )}
        code={`<Tooltip content="Copy link">
  <IconButton aria-label="Copy link"><Link2 size={18} /></IconButton>
</Tooltip>`}
      />

      <Example
        title={t(m.tipEx4Title)}
        description={t(m.tipEx4Desc)}
        code={`<Tooltip
  content={
    <span>
      Open the palette <Kbd>⌘K</Kbd>
    </span>
  }
>
  <Button variant={Variant.Outline}>Commands</Button>
</Tooltip>`}
      >
        <Tooltip
          content={
            <span>
              {t(m.tooltipOpenThePalette)} <Kbd>⌘K</Kbd>
            </span>
          }
        >
          <Button variant={Variant.Outline}>{t(m.tooltipCommands)}</Button>
        </Tooltip>
      </Example>

      <Example
        title={t(m.tipEx5Title)}
        description={t(m.tipEx5Desc)}
        component="Tooltip"
        render={(K) => (
          <K.Tooltip content={t(m.tipContentNoWait)} delay={0}>
            <K.Button variant={Variant.Ghost}>{t(m.tooltipInstant)}</K.Button>
          </K.Tooltip>
        )}
        code={`<Tooltip content="No wait" delay={0}>
  <Button variant={Variant.Ghost}>Instant</Button>
</Tooltip>`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          {
            name: 'content',
            type: 'ReactNode',
            description: t(m.tipPropContent),
          },
          {
            name: 'children',
            type: 'ReactElement',
            description: t(m.tipPropChildren),
          },
          {
            name: 'placement',
            type: 'Side | `${Side}-${Alignment}`',
            default: "'top'",
            description: t(m.tipPropPlacement),
          },
          {
            name: 'delay',
            type: 'number',
            default: '300',
            description: t(m.tipPropDelay),
          },
          {
            name: 'disabled',
            type: 'boolean',
            default: 'false',
            description: t(m.tipPropDisabled),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.tipPropSkeleton),
          },
          {
            name: 'className',
            type: 'string',
            description: t(m.tipPropClassName),
          },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.tipA11y1))}</li>
        <li>{prose(t(m.tipA11y2))}</li>
        <li>{prose(t(m.tipA11y3))}</li>
        <li>{prose(t(m.tipA11y4))}</li>
        <li>{prose(t(m.tipA11y5))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.tipUse1))}</li>
        <li>{prose(t(m.tipUse2))}</li>
        <li>{prose(t(m.tipUse3))}</li>
        <li>{prose(t(m.tipUse4))}</li>
        <li>{prose(t(m.tipUse5))}</li>
      </ul>
    </>
  );
}
