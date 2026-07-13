import { Avatar, Row, Heading, Text, Size, TextTone, useT } from '@glacier/react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

export function AvatarPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.avName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.avLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntroBox)}</Text>
      <ComponentBlueprint specId="avatar" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.avEx1Title)}
        description={prose(t(m.avEx1Desc))}
        component="Avatar"
        render={(K) => (
          <Row gap={4} wrap>
            <K.Avatar name="Ada Lovelace" />
            <K.Avatar name="Grace Hopper" />
            <K.Avatar name="Katherine Johnson" />
          </Row>
        )}
        code={`import { Avatar } from '@glacier/react';

<Avatar src="/ada.jpg" name="Ada Lovelace" />
<Avatar name="Ada Lovelace" />
<Avatar name="Grace Hopper" />`}
      />

      <Example
        title={t(m.secSizes)}
        description={prose(t(m.avEx2Desc))}
        component="Avatar"
        render={(K) => (
          <Row gap={4} wrap>
            <K.Avatar size={Size.Small} name="Ada Lovelace" />
            <K.Avatar size={Size.Medium} name="Ada Lovelace" />
            <K.Avatar size={Size.Large} name="Ada Lovelace" />
            <K.Avatar size={Size.XLarge} name="Ada Lovelace" />
          </Row>
        )}
        code={`<Avatar size={Size.Small} name="Ada Lovelace" />
<Avatar size={Size.Medium} name="Ada Lovelace" />
<Avatar size={Size.Large} name="Ada Lovelace" />
<Avatar size={Size.XLarge} name="Ada Lovelace" />`}
      />

      <Example
        title={t(m.avEx3Title)}
        description={prose(t(m.avEx3Desc))}
        component="Avatar"
        render={(K) => (
          <Row gap={4} wrap>
            <K.Avatar shape="circle" name="Ada Lovelace" />
            <K.Avatar shape="rounded" name="GlacierUI Team" />
          </Row>
        )}
        code={`<Avatar shape="circle" name="Ada Lovelace" />
<Avatar shape="rounded" name="GlacierUI Team" />`}
      />

      <Example
        title={t(m.avEx4Title)}
        description={prose(t(m.avEx4Desc))}
        component="Avatar"
        render={(K) => (
          <Row gap={4} wrap>
            <K.Avatar />
            <K.Avatar shape="rounded" />
          </Row>
        )}
        code={`<Avatar />
<Avatar shape="rounded" />`}
      />

      <Example
        title={t(m.exSkeleton)}
        description={prose(t(m.avEx5Desc))}
        component="Avatar"
        render={(K) => (
          <Row gap={4} wrap>
            <K.Avatar skeleton size={Size.Small} />
            <K.Avatar skeleton />
            <K.Avatar skeleton size={Size.Large} />
            <K.Avatar skeleton shape="rounded" size={Size.Large} />
          </Row>
        )}
        code={`<Avatar skeleton size={Size.Small} />
<Avatar skeleton />
<Avatar skeleton size={Size.Large} />
<Avatar skeleton shape="rounded" size={Size.Large} />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          {
            name: 'src',
            type: 'string',
            description: t(m.avPropSrc),
          },
          {
            name: 'alt',
            type: 'string',
            description: t(m.avPropAlt),
          },
          {
            name: 'name',
            type: 'string',
            description: t(m.avPropName),
          },
          {
            name: 'size',
            type: "'sm' | 'md' | 'lg' | 'xl'",
            default: "'md'",
            description: t(m.avPropSize),
          },
          {
            name: 'shape',
            type: "'circle' | 'rounded'",
            default: "'circle'",
            description: t(m.avPropShape),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.avPropSkeleton),
          },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.avA11y1))}</li>
        <li>{prose(t(m.avA11y2))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.avUse1))}</li>
        <li>{prose(t(m.avUse2))}</li>
        <li>{prose(t(m.avUse3))}</li>
      </ul>
    </>
  );
}
