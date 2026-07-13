import { Box, Button, IconButton, Text, Toolbar, Heading, Size, TextTone, Variant, useT } from '@glacier/react';
import { Menu } from '@glacier/icons';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { m } from '../../i18n.ts';

const menuIcon = <Menu size={16} />;

export function ToolbarPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.tlbrName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.tlbrLede))}
      </Text>

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.tlbrEx1Title)}
        description={prose(t(m.tlbrEx1Desc))}
        component="Toolbar"
        render={(K) => (
          <Box width="full" border radius="lg">
            <K.Toolbar
              end={
                <>
                  <Button variant={Variant.Ghost}>{t(m.toolbarCancel)}</Button>
                  <Button>{t(m.toolbarSave)}</Button>
                </>
              }
            >
              <Text weight="semibold">{t(m.toolbarProjectSettings)}</Text>
            </K.Toolbar>
          </Box>
        )}
        code={`import { Box, Button, Text, Toolbar } from '@glacier/react';

<Box width="full" border radius="lg">
  <Toolbar
    end={
      <>
        <Button variant={Variant.Ghost}>Cancel</Button>
        <Button>Save</Button>
      </>
    }
  >
    <Text weight="semibold">Project settings</Text>
  </Toolbar>
</Box>`}
      />

      <Example
        title={t(m.tlbrEx2Title)}
        description={prose(t(m.tlbrEx2Desc))}
        component="Toolbar"
        render={(K) => (
          <Box width="full" border radius="lg">
            <K.Toolbar
              start={<IconButton aria-label={t(m.tlbrAriaOpenMenu)}>{menuIcon}</IconButton>}
              end={<Button variant={Variant.Soft}>{t(m.toolbarShare)}</Button>}
            >
              <Text weight="semibold">{t(m.toolbarInbox)}</Text>
            </K.Toolbar>
          </Box>
        )}
        code={`import { Menu } from '@glacier/icons';

<Box width="full" border radius="lg">
  <Toolbar
    start={<IconButton aria-label="Open menu"><Menu size={16} /></IconButton>}
    end={<Button variant={Variant.Soft}>Share</Button>}
  >
    <Text weight="semibold">Inbox</Text>
  </Toolbar>
</Box>`}
      />

      <Example
        title={t(m.tlbrEx3Title)}
        description={prose(t(m.tlbrEx3Desc))}
        component="Toolbar"
        render={(K) => (
          <Box width="full" border radius="lg">
            <K.Toolbar border surface end={<Button variant={Variant.Soft}>{t(m.toolbarSignIn)}</Button>}>
              <Text weight="semibold">{t(m.toolbarGlacierui)}</Text>
            </K.Toolbar>
          </Box>
        )}
        code={`<Box width="full" border radius="lg">
  <Toolbar
    border
    surface
    end={<Button variant={Variant.Soft}>Sign in</Button>}
  >
    <Text weight="semibold">GlacierUI</Text>
  </Toolbar>
</Box>`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          {
            name: 'start',
            type: 'ReactNode',
            description: t(m.tlbrPropStart),
          },
          {
            name: 'end',
            type: 'ReactNode',
            description: t(m.tlbrPropEnd),
          },
          {
            name: 'children',
            type: 'ReactNode',
            description: t(m.tlbrPropChildren),
          },
          {
            name: 'sticky',
            type: 'boolean',
            default: 'false',
            description: t(m.tlbrPropSticky),
          },
          {
            name: 'border',
            type: 'boolean',
            default: 'false',
            description: t(m.tlbrPropBorder),
          },
          {
            name: 'surface',
            type: 'boolean',
            default: 'false',
            description: t(m.tlbrPropSurface),
          },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.tlbrA11y1))}</li>
        <li>{prose(t(m.tlbrA11y2))}</li>
        <li>{prose(t(m.tlbrA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.tlbrUse1))}</li>
        <li>{prose(t(m.tlbrUse2))}</li>
        <li>{prose(t(m.tlbrUse3))}</li>
        <li>{prose(t(m.tlbrUse4))}</li>
      </ul>
    </>
  );
}
