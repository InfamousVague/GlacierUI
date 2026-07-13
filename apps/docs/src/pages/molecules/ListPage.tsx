import { useState } from 'react';
import { Avatar, CounterBadge, List, ListItem, Pill, Text, Heading, Size, TextTone, useT } from '@glacier/react';
import { ChevronRight, FileText, Folder, Settings } from '@glacier/icons';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

const folderIcon = <Folder size={16} />;
const fileIcon = <FileText size={16} />;
const settingsIcon = <Settings size={16} />;
const chevron = <ChevronRight size={14} />;

/** A selectable project list, so the selected row follows clicks. */
function SelectableList() {
  const t = useT();
  const [active, setActive] = useState('docs');
  const row = (id: string, title: string, description: string) => (
    <ListItem
      title={title}
      description={description}
      leading={folderIcon}
      trailing={active === id ? <Pill tone="accent" size="sm">{t(m.listActive)}</Pill> : chevron}
      selected={active === id}
      onClick={() => setActive(id)}
    />
  );
  return (
    <List aria-label={t(m.listProjects)}>
      {row('docs', 'Documentation', t(m.listRowDocsDesc))}
      {row('kit', 'Component kit', t(m.listRowKitDesc))}
      {row('tokens', 'Tokens', t(m.listRowTokensDesc))}
    </List>
  );
}

export function ListPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.listName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.listLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntro)}</Text>
      <ComponentBlueprint specId="list" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.listEx1Desc)}
        component="List"
        render={(K) => (
          <K.List aria-label={t(m.listFiles)} style={{ maxWidth: '28rem' }}>
            <K.ListItem title={t(m.listReadmeMd)} description={t(m.listItemReadmeDesc)} leading={fileIcon} />
            <K.ListItem title={t(m.listChangelogMd)} description={t(m.listItemChangelogDesc)} leading={fileIcon} />
          </K.List>
        )}
        code={`import { List, ListItem } from '@glacier/react';

<List aria-label="Files">
  <ListItem title="README.md" description="Project overview and setup" />
  <ListItem title="CHANGELOG.md" description="Release history" />
</List>`}
      />

      <Example
        title={t(m.listEx2Title)}
        description={t(m.listEx2Desc)}
        code={`<List aria-label="People">
  <ListItem title="Ada Lovelace" description="Owner" leading={<Avatar name="Ada Lovelace" size="sm" />} trailing={<Pill size="sm">Admin</Pill>} />
  <ListItem title="Inbox" leading={fileIcon} trailing={<CounterBadge count={12} />} />
</List>`}
      >
        <List aria-label={t(m.listPeople)} style={{ maxWidth: '28rem' }}>
          <ListItem
            title={t(m.listAdaLovelace)}
            description={t(m.listOwner)}
            leading={<Avatar name="Ada Lovelace" size="sm" />}
            trailing={<Pill size="sm">{t(m.listAdmin)}</Pill>}
          />
          <ListItem title={t(m.listInbox)} description={t(m.listItemInboxDesc)} leading={fileIcon} trailing={<CounterBadge count={12} />} />
        </List>
      </Example>

      <Example
        title={t(m.listEx3Title)}
        description={t(m.listEx3Desc)}
        code={`<ListItem
  title="Component kit"
  description="The React workspace"
  selected={active === 'kit'}
  onClick={() => setActive('kit')}
/>`}
      >
        <div style={{ maxWidth: '28rem' }}>
          <SelectableList />
        </div>
      </Example>

      <Example
        title={t(m.listEx4Title)}
        description={t(m.listEx4Desc)}
        component="List"
        render={(K) => (
          <K.List size="sm" divided aria-label={t(m.listSettings)} style={{ maxWidth: '28rem' }}>
            <K.ListItem title={t(m.listProfile)} description={t(m.listItemProfileDesc)} leading={settingsIcon} onClick={() => {}} trailing={chevron} />
            <K.ListItem title={t(m.listNotifications)} leading={settingsIcon} onClick={() => {}} trailing={chevron} />
            <K.ListItem title={t(m.listBilling)} description={t(m.listItemBillingDesc)} leading={settingsIcon} disabled onClick={() => {}} />
          </K.List>
        )}
        code={`<List size="sm" divided aria-label="Settings">
  <ListItem title="Profile" leading={settingsIcon} onClick={noop} />
  <ListItem title="Billing" disabled onClick={noop} />
</List>`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: t(m.listPropSize) },
          { name: 'divided', type: 'boolean', default: 'false', description: t(m.listPropDivided) },
          { name: 'children', type: 'ReactNode', description: t(m.listPropChildren) },
        ]}
      />
      <Heading level={3}>{t(m.listListitem)}</Heading>
      <PropsTable
        props={[
          { name: 'title', type: 'ReactNode', description: t(m.listItemPropTitle) },
          { name: 'description', type: 'ReactNode', description: t(m.listItemPropDesc) },
          { name: 'leading', type: 'ReactNode', description: t(m.listItemPropLeading) },
          { name: 'trailing', type: 'ReactNode', description: t(m.listItemPropTrailing) },
          { name: 'selected', type: 'boolean', default: 'false', description: t(m.listItemPropSelected) },
          { name: 'disabled', type: 'boolean', default: 'false', description: t(m.listItemPropDisabled) },
          { name: 'href', type: 'string', description: t(m.listItemPropHref) },
          { name: 'onClick', type: 'MouseEventHandler', description: t(m.listItemPropOnClick) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.listA11y1))}</li>
        <li>{prose(t(m.listA11y2))}</li>
        <li>{prose(t(m.listA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.listUse1))}</li>
        <li>{prose(t(m.listUse2))}</li>
        <li>{prose(t(m.listUse3))}</li>
      </ul>
    </>
  );
}
