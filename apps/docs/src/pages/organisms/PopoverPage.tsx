import { Button, Field, IconButton, Input, Popover, Row, SidebarItem, Stack, Text, Heading, Size, TextTone, Variant, useT } from '@glacier/react';
import { useState } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

export function PopoverPage() {
  const t = useT();
  const [controlledOpen, setControlledOpen] = useState(false);

  return (
    <>
      <Heading level={1}>{t(m.popName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.popLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.popAnatomy)}</Text>
      <ComponentBlueprint specId="popover" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.popExBasicDesc)}
        code={`import { Button, Popover, Stack, Text } from '@glacier/react';

<Popover
  aria-label="About this release"
  trigger={<Button>What's new</Button>}
>
  <Stack gap={2}>
    <Text weight="semibold">Version 2.4</Text>
    <Text tone={TextTone.Muted}>
      Fluid spacing and a hover step on every color ramp.
    </Text>
  </Stack>
</Popover>`}
      >
        <Popover aria-label={t(m.popoverAboutThisRelease)} trigger={<Button>{t(m.popWhatsNew)}</Button>}>
          <Stack gap={2}>
            <Text weight="semibold">{t(m.popVersion24)}</Text>
            <Text tone={TextTone.Muted}>{t(m.popBasicBody)}</Text>
          </Stack>
        </Popover>
      </Example>

      <Example
        title={t(m.popExPlacementsTitle)}
        description={t(m.popExPlacementsDesc)}
        code={`<Popover placement="bottom" aria-label="Opens below" trigger={<Button>Bottom</Button>}>
  <Text>Opens below the trigger.</Text>
</Popover>
<Popover placement="top" aria-label="Opens above" trigger={<Button>Top</Button>}>
  <Text>Opens above the trigger.</Text>
</Popover>
<Popover placement="right" aria-label="Opens to the right" trigger={<Button>Right</Button>}>
  <Text>Opens to the right.</Text>
</Popover>
<Popover placement="left" aria-label="Opens to the left" trigger={<Button>Left</Button>}>
  <Text>Opens to the left.</Text>
</Popover>`}
      >
        <Row gap={3} wrap>
          <Popover placement="bottom" aria-label={t(m.popoverOpensBelow)} trigger={<Button>{t(m.popoverBottom)}</Button>}>
            <Text>{t(m.popOpensBelow)}</Text>
          </Popover>
          <Popover placement="top" aria-label={t(m.popoverOpensAbove)} trigger={<Button>{t(m.popoverTop)}</Button>}>
            <Text>{t(m.popOpensAbove)}</Text>
          </Popover>
          <Popover placement="right" aria-label={t(m.popoverOpensToTheRight)} trigger={<Button>{t(m.popoverRight)}</Button>}>
            <Text>{t(m.popOpensRight)}</Text>
          </Popover>
          <Popover placement="left" aria-label={t(m.popoverOpensToTheLeft)} trigger={<Button>{t(m.popoverLeft)}</Button>}>
            <Text>{t(m.popOpensLeft)}</Text>
          </Popover>
        </Row>
      </Example>

      <Example
        title={t(m.popExMenuTitle)}
        description={t(m.popExMenuDesc)}
        code={`<Popover
  aria-label="Row actions"
  trigger={<IconButton aria-label="Open actions">...</IconButton>}
>
  <Stack gap={0}>
    <SidebarItem>Rename</SidebarItem>
    <SidebarItem>Duplicate</SidebarItem>
    <SidebarItem>Move to folder</SidebarItem>
    <SidebarItem>Delete</SidebarItem>
  </Stack>
</Popover>`}
      >
        <Popover aria-label={t(m.popoverRowActions)} trigger={<IconButton aria-label={t(m.popoverOpenActions)}>•••</IconButton>}>
          <Stack gap={0}>
            <SidebarItem>{t(m.popoverRename)}</SidebarItem>
            <SidebarItem>{t(m.popoverDuplicate)}</SidebarItem>
            <SidebarItem>{t(m.popoverMoveToFolder)}</SidebarItem>
            <SidebarItem>{t(m.popoverDelete)}</SidebarItem>
          </Stack>
        </Popover>
      </Example>

      <Example
        title={t(m.popExFormTitle)}
        description={t(m.popExFormDesc)}
        code={`<Popover
  aria-label="Rename item"
  trigger={<Button variant={Variant.Outline}>Rename</Button>}
>
  <Stack gap={3} style={{ minWidth: 240 }}>
    <Field label="Name" hint="Up to 60 characters.">
      <Input defaultValue="Untitled" />
    </Field>
    <Button>Save</Button>
  </Stack>
</Popover>`}
      >
        <Popover aria-label={t(m.popoverRenameItem)} trigger={<Button variant={Variant.Outline}>{t(m.popoverRename)}</Button>}>
          <Stack gap={3} style={{ minWidth: 240 }}>
            <Field label={t(m.popFieldName)} hint={t(m.popHint60Chars)}>
              <Input defaultValue="Untitled" />
            </Field>
            <Button>{t(m.popoverSave)}</Button>
          </Stack>
        </Popover>
      </Example>

      <Example
        title={t(m.popExControlledTitle)}
        description={t(m.popExControlledDesc)}
        code={`const [open, setOpen] = useState(false);

<Popover
  open={open}
  onOpenChange={setOpen}
  aria-label="Filters"
  trigger={<Button>{open ? 'Close filters' : 'Open filters'}</Button>}
>
  <Stack gap={2}>
    <Text weight="semibold">Filters</Text>
    <Text tone={TextTone.Muted}>The trigger label tracks the open state.</Text>
    <Button variant={Variant.Ghost} onClick={() => setOpen(false)}>
      Done
    </Button>
  </Stack>
</Popover>`}
      >
        <Popover
          open={controlledOpen}
          onOpenChange={setControlledOpen}
          aria-label={t(m.popoverFilters)}
          trigger={<Button>{controlledOpen ? t(m.popCloseFilters) : t(m.popOpenFilters)}</Button>}
        >
          <Stack gap={2}>
            <Text weight="semibold">{t(m.popFiltersHeading)}</Text>
            <Text tone={TextTone.Muted}>{t(m.popControlledBody)}</Text>
            <Button variant={Variant.Ghost} onClick={() => setControlledOpen(false)}>
              {t(m.popoverDone)}
            </Button>
          </Stack>
        </Popover>
      </Example>

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'trigger', type: 'ReactElement', description: t(m.popPropTrigger) },
          { name: 'placement', type: "Side | `${Side}-${Alignment}`", default: "'bottom-start'", description: t(m.popPropPlacement) },
          { name: 'open', type: 'boolean', description: t(m.popPropOpen) },
          { name: 'defaultOpen', type: 'boolean', default: 'false', description: t(m.popPropDefaultOpen) },
          { name: 'onOpenChange', type: '(open: boolean) => void', description: t(m.popPropOnOpenChange) },
          { name: 'aria-label', type: 'string', description: t(m.popPropAriaLabel) },
          { name: 'children', type: 'ReactNode', description: t(m.popPropChildren) },
          { name: 'className', type: 'string', description: t(m.popPropClassName) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.popA11y1))}</li>
        <li>{prose(t(m.popA11y2))}</li>
        <li>{prose(t(m.popA11y3))}</li>
        <li>{prose(t(m.popA11y4))}</li>
        <li>{prose(t(m.popA11y5))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.popUse1))}</li>
        <li>{prose(t(m.popUse2))}</li>
        <li>{prose(t(m.popUse3))}</li>
        <li>{prose(t(m.popUse4))}</li>
        <li>{prose(t(m.popUse5))}</li>
      </ul>
    </>
  );
}
