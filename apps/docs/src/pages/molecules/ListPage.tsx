import { useState } from 'react';
import { Avatar, CounterBadge, List, ListItem, Pill, Text, Heading, Size, TextTone } from '@glacier/react';
import { ChevronRight, FileText, Folder, Settings } from '@glacier/icons';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

const folderIcon = <Folder size={16} />;
const fileIcon = <FileText size={16} />;
const settingsIcon = <Settings size={16} />;
const chevron = <ChevronRight size={14} />;

/** A selectable project list, so the selected row follows clicks. */
function SelectableList() {
  const [active, setActive] = useState('docs');
  const row = (id: string, title: string, description: string) => (
    <ListItem
      title={title}
      description={description}
      leading={folderIcon}
      trailing={active === id ? <Pill tone="accent" size="sm">Active</Pill> : chevron}
      selected={active === id}
      onClick={() => setActive(id)}
    />
  );
  return (
    <List divided aria-label="Projects">
      {row('docs', 'Documentation', 'Guides, references, and release notes')}
      {row('kit', 'Component kit', 'The React workspace and its tests')}
      {row('tokens', 'Tokens', 'Color ramps, spacing, and typography scales')}
    </List>
  );
}

export function ListPage() {
  return (
    <>
      <Heading level={1}>List</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        Semantic single-column content rows. Each ListItem pairs a title with an optional
        description, leading and trailing slots, and becomes a real link or button only when you
        make it interactive, so keyboard and assistive-tech behavior always match what the row
        does.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the figure.</Text>
      <ComponentBlueprint specId="list" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Basic"
        description="Rows with a title and a supporting description. Without href or onClick a row is plain content, not a control."
        code={`import { List, ListItem } from '@glacier/react';

<List aria-label="Files">
  <ListItem title="README.md" description="Project overview and setup" />
  <ListItem title="CHANGELOG.md" description="Release history" />
</List>`}
      >
        <List aria-label="Files" style={{ maxWidth: '28rem' }}>
          <ListItem title="README.md" description="Project overview and setup" leading={fileIcon} />
          <ListItem title="CHANGELOG.md" description="Release history" leading={fileIcon} />
        </List>
      </Example>

      <Example
        title="Leading and trailing slots"
        description="Lead with an Avatar or icon; trail with a Pill, CounterBadge, or a chevron for navigation rows."
        code={`<List divided aria-label="People">
  <ListItem title="Ada Lovelace" description="Owner" leading={<Avatar name="Ada Lovelace" size="sm" />} trailing={<Pill size="sm">Admin</Pill>} />
  <ListItem title="Inbox" leading={fileIcon} trailing={<CounterBadge count={12} />} />
</List>`}
      >
        <List divided aria-label="People" style={{ maxWidth: '28rem' }}>
          <ListItem
            title="Ada Lovelace"
            description="Owner"
            leading={<Avatar name="Ada Lovelace" size="sm" />}
            trailing={<Pill size="sm">Admin</Pill>}
          />
          <ListItem title="Inbox" description="Unread review requests" leading={fileIcon} trailing={<CounterBadge count={12} />} />
        </List>
      </Example>

      <Example
        title="Interactive and selected"
        description="onClick renders the row as a button with aria-pressed; href renders a link with aria-current when selected. Click around: the selection follows."
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
        title="Sizes, dividers, and disabled"
        description="Two density steps share the control-height scale; divided draws a hairline between rows; a disabled row dims and blocks its action."
        code={`<List size="sm" divided aria-label="Settings">
  <ListItem title="Profile" leading={settingsIcon} onClick={noop} />
  <ListItem title="Billing" disabled onClick={noop} />
</List>`}
      >
        <List size="sm" divided aria-label="Settings" style={{ maxWidth: '28rem' }}>
          <ListItem title="Profile" description="Name, avatar, and pronouns" leading={settingsIcon} onClick={() => {}} trailing={chevron} />
          <ListItem title="Notifications" leading={settingsIcon} onClick={() => {}} trailing={chevron} />
          <ListItem title="Billing" description="Requires an owner role" leading={settingsIcon} disabled onClick={() => {}} />
        </List>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Shared row density step for every direct ListItem.' },
          { name: 'divided', type: 'boolean', default: 'false', description: 'Draws a hairline between direct ListItem children.' },
          { name: 'children', type: 'ReactNode', description: 'ListItem rows.' },
        ]}
      />
      <Heading level={3}>ListItem</Heading>
      <PropsTable
        props={[
          { name: 'title', type: 'ReactNode', description: 'Required. The row heading, kept to one line.' },
          { name: 'description', type: 'ReactNode', description: 'Muted supporting line under the title.' },
          { name: 'leading', type: 'ReactNode', description: 'Slot before the copy: an icon, Avatar, or Checkbox. Decorative.' },
          { name: 'trailing', type: 'ReactNode', description: 'Slot after the copy: a Pill, CounterBadge, chevron, or action.' },
          { name: 'selected', type: 'boolean', default: 'false', description: 'Marks the row: aria-current on links, aria-pressed on buttons.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Dims the row and blocks its action.' },
          { name: 'href', type: 'string', description: 'Renders the row as a link.' },
          { name: 'onClick', type: 'MouseEventHandler', description: 'Renders the row as a button.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          The container is a real <code>ul</code> and every row a <code>li</code>, so assistive
          tech announces list length and position for free.
        </li>
        <li>
          A row is only focusable when it does something: <code>href</code> makes it an anchor,{' '}
          <code>onClick</code> a button; plain rows stay non-interactive content.
        </li>
        <li>
          Selection is announced through <code>aria-current="page"</code> on links and{' '}
          <code>aria-pressed</code> on buttons; leading glyphs are hidden from assistive tech.
        </li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Use List for content collections: files, people, settings rows. Use Menu for a popup of actions, and Table when rows have multiple comparable columns.</li>
        <li>Keep titles to one line; push detail into the description rather than widening the row.</li>
        <li>Do not nest another interactive control inside an interactive row; give the action to the trailing slot of a plain row instead.</li>
      </ul>
    </>
  );
}
