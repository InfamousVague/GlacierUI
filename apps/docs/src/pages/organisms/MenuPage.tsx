import { Button, Card, ContextMenu, Menu, MenuItem, MenuSeparator, MenuSub, Kbd, Heading, Text, Size, TextTone, useT } from '@glacier/react';
import { Pencil, Copy, Trash2, Share2, Mail, Link } from '@glacier/icons';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

const editIcon = <Pencil size={16} />;
const copyIcon = <Copy size={16} />;
const trashIcon = <Trash2 size={16} />;
const shareIcon = <Share2 size={16} />;
const mailIcon = <Mail size={16} />;
const linkIcon = <Link size={16} />;

export function MenuPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.menuName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.menuLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.menuAnatomy)}</Text>
      <ComponentBlueprint specId="menu" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.menuExBasicDesc)}
        component="Menu"
        render={(K) => (
          <K.Menu trigger={<K.Button>{t(m.menuActions)}</K.Button>}>
            <K.MenuItem onSelect={() => {}}>{t(m.menuRename)}</K.MenuItem>
            <K.MenuItem onSelect={() => {}}>{t(m.menuDuplicate)}</K.MenuItem>
            <K.MenuItem onSelect={() => {}}>{t(m.menuArchive)}</K.MenuItem>
          </K.Menu>
        )}
        code={`import { Button, Menu, MenuItem } from '@glacier/react';

<Menu trigger={<Button>Actions</Button>}>
  <MenuItem onSelect={() => rename()}>Rename</MenuItem>
  <MenuItem onSelect={() => duplicate()}>Duplicate</MenuItem>
  <MenuItem onSelect={() => archive()}>Archive</MenuItem>
</Menu>`}
      />

      <Example
        title={t(m.menuExIconsTitle)}
        description={t(m.menuExIconsDesc)}
        component="Menu"
        render={(K) => (
          <K.Menu trigger={<K.Button>{t(m.menuEdit)}</K.Button>}>
            <K.MenuItem icon={editIcon} shortcut={<Kbd>⌘E</Kbd>} onSelect={() => {}}>
              {t(m.menuEdit)}
            </K.MenuItem>
            <K.MenuItem icon={copyIcon} shortcut={<Kbd>⌘C</Kbd>} onSelect={() => {}}>
              {t(m.menuCopy)}
            </K.MenuItem>
          </K.Menu>
        )}
        code={`<Menu trigger={<Button>Edit</Button>}>
  <MenuItem icon={editIcon} shortcut={<Kbd>⌘E</Kbd>} onSelect={edit}>Edit</MenuItem>
  <MenuItem icon={copyIcon} shortcut={<Kbd>⌘C</Kbd>} onSelect={copy}>Copy</MenuItem>
</Menu>`}
      />

      <Example
        title={t(m.menuExSectionsTitle)}
        description={t(m.menuExSectionsDesc)}
        component="Menu"
        render={(K) => (
          <K.Menu trigger={<K.Button>{t(m.menuOptions)}</K.Button>}>
            <K.MenuLabel>{t(m.menuEdit)}</K.MenuLabel>
            <K.MenuItem icon={editIcon} onSelect={() => {}}>
              {t(m.menuRename)}
            </K.MenuItem>
            <K.MenuItem icon={copyIcon} onSelect={() => {}}>
              {t(m.menuDuplicate)}
            </K.MenuItem>
            <K.MenuSeparator />
            <K.MenuItem icon={trashIcon} danger onSelect={() => {}}>
              {t(m.menuDelete)}
            </K.MenuItem>
          </K.Menu>
        )}
        code={`<Menu trigger={<Button>Options</Button>}>
  <MenuLabel>Edit</MenuLabel>
  <MenuItem icon={editIcon} onSelect={rename}>Rename</MenuItem>
  <MenuItem icon={copyIcon} onSelect={duplicate}>Duplicate</MenuItem>
  <MenuSeparator />
  <MenuItem icon={trashIcon} danger onSelect={remove}>Delete</MenuItem>
</Menu>`}
      />

      <Example
        title={t(m.menuExDisabledTitle)}
        description={t(m.menuExDisabledDesc)}
        component="Menu"
        render={(K) => (
          <K.Menu trigger={<K.Button>{t(m.menuMore)}</K.Button>}>
            <K.MenuItem onSelect={() => {}}>{t(m.menuShare)}</K.MenuItem>
            <K.MenuItem disabled>{t(m.menuExportPro)}</K.MenuItem>
          </K.Menu>
        )}
        code={`<Menu trigger={<Button>More</Button>}>
  <MenuItem onSelect={share}>Share</MenuItem>
  <MenuItem disabled>Export (Pro)</MenuItem>
</Menu>`}
      />

      <Example
        title={t(m.menuExContextTitle)}
        description={t(m.menuExContextDesc)}
        code={`import { ContextMenu, MenuItem, MenuSeparator } from '@glacier/react';

<ContextMenu
  aria-label="Canvas actions"
  content={
    <>
      <MenuItem icon={copyIcon} onSelect={copy}>Copy</MenuItem>
      <MenuItem icon={editIcon} onSelect={rename}>Rename</MenuItem>
      <MenuSeparator />
      <MenuItem icon={trashIcon} danger onSelect={remove}>Delete</MenuItem>
    </>
  }
>
  <Card>Right-click or long-press this area</Card>
</ContextMenu>`}
      >
        <ContextMenu
          aria-label={t(m.menuCanvasActions)}
          content={
            <>
              <MenuItem icon={copyIcon} onSelect={() => {}}>
                {t(m.menuCopy)}
              </MenuItem>
              <MenuItem icon={editIcon} onSelect={() => {}}>
                {t(m.menuRename)}
              </MenuItem>
              <MenuSeparator />
              <MenuItem icon={trashIcon} danger onSelect={() => {}}>
                {t(m.menuDelete)}
              </MenuItem>
            </>
          }
        >
          <Card>{t(m.menuCardHint)}</Card>
        </ContextMenu>
      </Example>

      <Example
        title={t(m.menuExFlyoutTitle)}
        description={t(m.menuExFlyoutDesc)}
        code={`import { Menu, MenuItem, MenuSub } from '@glacier/react';

<Menu trigger={<Button>Actions</Button>}>
  <MenuItem icon={editIcon} onSelect={rename}>Rename</MenuItem>
  <MenuSub label="Share" icon={shareIcon}>
    <MenuItem icon={mailIcon} onSelect={email}>Email</MenuItem>
    <MenuItem icon={linkIcon} onSelect={copyLink}>Copy link</MenuItem>
  </MenuSub>
</Menu>`}
      >
        <Menu trigger={<Button>{t(m.menuActions)}</Button>}>
          <MenuItem icon={editIcon} onSelect={() => {}}>
            {t(m.menuRename)}
          </MenuItem>
          <MenuSub label={t(m.menuShare)} icon={shareIcon}>
            <MenuItem icon={mailIcon} onSelect={() => {}}>
              {t(m.menuEmail)}
            </MenuItem>
            <MenuItem icon={linkIcon} onSelect={() => {}}>
              {t(m.menuCopyLink)}
            </MenuItem>
          </MenuSub>
        </Menu>
      </Example>

      <Example
        title={t(m.menuExNestedTitle)}
        description={t(m.menuExNestedDesc)}
        code={`<Menu trigger={<Button>Export</Button>}>
  <MenuSub label="Export as">
    <MenuItem onSelect={pdf}>PDF</MenuItem>
    <MenuSub label="Image">
      <MenuItem onSelect={png}>PNG</MenuItem>
      <MenuItem onSelect={jpeg}>JPEG</MenuItem>
    </MenuSub>
  </MenuSub>
</Menu>`}
      >
        <Menu trigger={<Button>{t(m.menuExport)}</Button>}>
          <MenuSub label={t(m.menuExportAs)}>
            <MenuItem onSelect={() => {}}>{t(m.menuPdf)}</MenuItem>
            <MenuSub label={t(m.menuImage)}>
              <MenuItem onSelect={() => {}}>{t(m.menuPng)}</MenuItem>
              <MenuItem onSelect={() => {}}>{t(m.menuJpeg)}</MenuItem>
            </MenuSub>
          </MenuSub>
        </Menu>
      </Example>

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'trigger', type: 'ReactElement', description: t(m.menuPropTrigger) },
          { name: 'placement', type: 'Placement', default: "'bottom-start'", description: t(m.menuPropPlacement) },
          { name: 'open', type: 'boolean', description: t(m.menuPropOpen) },
          { name: 'defaultOpen', type: 'boolean', default: 'false', description: t(m.menuPropDefaultOpen) },
          { name: 'onOpenChange', type: '(open: boolean) => void', description: t(m.menuPropOnOpenChange) },
          { name: 'aria-label', type: 'string', description: t(m.menuPropAriaLabel) },
        ]}
      />
      <Heading level={3}>{t(m.menuMenuitem)}</Heading>
      <PropsTable
        props={[
          { name: 'onSelect', type: '() => void', description: t(m.menuItemPropOnSelect) },
          { name: 'icon', type: 'ReactNode', description: t(m.menuItemPropIcon) },
          { name: 'shortcut', type: 'ReactNode', description: t(m.menuItemPropShortcut) },
          { name: 'danger', type: 'boolean', default: 'false', description: t(m.menuItemPropDanger) },
          { name: 'disabled', type: 'boolean', default: 'false', description: t(m.menuItemPropDisabled) },
        ]}
      />
      <Heading level={3}>{t(m.menuContextmenu)}</Heading>
      <PropsTable
        props={[
          { name: 'content', type: 'ReactNode', description: t(m.menuCtxPropContent) },
          { name: 'children', type: 'ReactNode', description: t(m.menuCtxPropChildren) },
          { name: 'onOpenChange', type: '(open: boolean) => void', description: t(m.menuPropOnOpenChange) },
          { name: 'aria-label', type: 'string', description: t(m.menuCtxPropAriaLabel) },
          { name: 'menuClassName', type: 'string', description: t(m.menuCtxPropMenuClassName) },
        ]}
      />
      <Heading level={3}>{t(m.menuMenusub)}</Heading>
      <PropsTable
        props={[
          { name: 'label', type: 'ReactNode', description: t(m.menuSubPropLabel) },
          { name: 'icon', type: 'ReactNode', description: t(m.menuItemPropIcon) },
          { name: 'disabled', type: 'boolean', default: 'false', description: t(m.menuSubPropDisabled) },
          { name: 'children', type: 'ReactNode', description: t(m.menuSubPropChildren) },
          { name: 'menuClassName', type: 'string', description: t(m.menuSubPropMenuClassName) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.menuA11y1))}</li>
        <li>{prose(t(m.menuA11y2))}</li>
        <li>{prose(t(m.menuA11y3))}</li>
        <li>{prose(t(m.menuA11y4))}</li>
        <li>{prose(t(m.menuA11y5))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.menuUse1))}</li>
        <li>{prose(t(m.menuUse2))}</li>
        <li>{prose(t(m.menuUse3))}</li>
        <li>{prose(t(m.menuUse4))}</li>
        <li>{prose(t(m.menuUse5))}</li>
      </ul>
    </>
  );
}
