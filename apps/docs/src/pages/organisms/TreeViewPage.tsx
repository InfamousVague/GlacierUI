import { useState } from 'react';
import { CounterBadge, Heading, Text, Size, TextTone, useT, type TreeItem } from '@glacier/react';
import { Folder, FileText, FileCode, BookOpen } from '@glacier/icons';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

const folderIcon = <Folder size={14} />;
const fileIcon = <FileText size={14} />;
const codeIcon = <FileCode size={14} />;
const bookIcon = <BookOpen size={14} />;

const FILES: TreeItem[] = [
  {
    id: 'src',
    label: 'src',
    icon: folderIcon,
    children: [
      {
        id: 'components',
        label: 'components',
        icon: folderIcon,
        children: [
          { id: 'button', label: 'Button.tsx', icon: codeIcon },
          { id: 'input', label: 'Input.tsx', icon: codeIcon },
        ],
      },
      { id: 'main', label: 'main.tsx', icon: codeIcon },
      { id: 'styles', label: 'styles.css', icon: fileIcon },
    ],
  },
  {
    id: 'public',
    label: 'public',
    icon: folderIcon,
    children: [{ id: 'favicon', label: 'favicon.svg', icon: fileIcon }],
  },
  { id: 'readme', label: 'README.md', icon: fileIcon },
];

function ControlledTree({ K }: { K: PlatformKit }) {
  const t = useT();
  const [expandedIds, setExpandedIds] = useState<string[]>(['src']);
  const [selectedId, setSelectedId] = useState('main');
  return (
    <div style={{ display: 'grid', gap: 'var(--glacier-space-3)' }}>
      <K.TreeView
        aria-label={t(m.treeAriaControlled)}
        items={FILES}
        expandedIds={expandedIds}
        onExpandedChange={setExpandedIds}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <Text size={Size.Small} tone={TextTone.Muted}>
        {t(m.treeSelectedLabel)} <code>{selectedId}</code>, {t(m.treeExpandedLabel)}{' '}
        <code>{expandedIds.join(', ') || t(m.treeNone)}</code>
      </Text>
    </div>
  );
}

export function TreeViewPage() {
  const t = useT();
  const CHAPTERS: TreeItem[] = [
    {
      id: 'basics',
      label: t(m.treeviewBasics),
      icon: bookIcon,
      trailing: <CounterBadge count={4} size={Size.Small} />,
      children: [
        { id: 'variables', label: t(m.treeviewVariables) },
        { id: 'functions', label: t(m.treeviewFunctions) },
        { id: 'loops', label: t(m.treeviewLoops) },
        { id: 'objects', label: t(m.treeviewObjects) },
      ],
    },
    {
      id: 'advanced',
      label: t(m.treeviewAdvanced),
      icon: bookIcon,
      trailing: <CounterBadge count={2} size={Size.Small} />,
      children: [
        { id: 'closures', label: t(m.treeviewClosures) },
        { id: 'async', label: t(m.treeviewAsyncAndAwait) },
      ],
    },
  ];
  const MIXED: TreeItem[] = [
    {
      id: 'unit-1',
      label: t(m.treeviewUnit1Fundamentals),
      children: [
        { id: 'lesson-1', label: t(m.treeviewLesson1HelloWorld) },
        { id: 'lesson-2', label: t(m.treeviewLesson2Types) },
      ],
    },
    {
      id: 'unit-2',
      label: t(m.treeviewUnit2LockedUntilUnit1IsDone),
      disabled: true,
      children: [{ id: 'lesson-3', label: t(m.treeviewLesson3Modules) }],
    },
    { id: 'glossary', label: t(m.treeviewGlossary) },
  ];
  return (
    <>
      <Heading level={1}>{t(m.treeName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.treeLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntro)}</Text>
      <ComponentBlueprint specId="tree-view" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.treeEx1Title)}
        description={t(m.treeEx1Desc)}
        component="TreeView"
        render={(K) => (
          <K.TreeView aria-label={t(m.treeAriaProjectFiles)} items={FILES} defaultExpandedIds={['src']} defaultSelectedId="main" />
        )}
        code={`import { TreeView, type TreeItem } from '@glacier/react';

const items: TreeItem[] = [
  {
    id: 'src',
    label: 'src',
    icon: folderIcon,
    children: [
      { id: 'main', label: 'main.tsx', icon: codeIcon },
      { id: 'styles', label: 'styles.css', icon: fileIcon },
    ],
  },
  { id: 'readme', label: 'README.md', icon: fileIcon },
];

<TreeView aria-label="Project files" items={items} defaultExpandedIds={['src']} />`}
      />

      <Example
        title={t(m.treeEx2Title)}
        description={t(m.treeEx2Desc)}
        component="TreeView"
        render={(K) => <ControlledTree K={K} />}
        code={`const [expandedIds, setExpandedIds] = useState<string[]>(['src']);
const [selectedId, setSelectedId] = useState('main');

<TreeView
  aria-label="Project files"
  items={items}
  expandedIds={expandedIds}
  onExpandedChange={setExpandedIds}
  selectedId={selectedId}
  onSelect={setSelectedId}
/>`}
      />

      <Example
        title={t(m.treeEx3Title)}
        description={t(m.treeEx3Desc)}
        component="TreeView"
        render={(K) => (
          <K.TreeView aria-label={t(m.treeAriaCourseChapters)} items={CHAPTERS} defaultExpandedIds={['basics']} />
        )}
        code={`const chapters: TreeItem[] = [
  {
    id: 'basics',
    label: 'Basics',
    icon: bookIcon,
    trailing: <CounterBadge count={4} size={Size.Small} />,
    children: [
      { id: 'variables', label: 'Variables' },
      { id: 'functions', label: 'Functions' },
    ],
  },
];

<TreeView aria-label="Course chapters" items={chapters} defaultExpandedIds={['basics']} />`}
      />

      <Example
        title={t(m.treeEx4Title)}
        description={t(m.treeEx4Desc)}
        component="TreeView"
        render={(K) => (
          <K.TreeView aria-label={t(m.treeAriaCourseOutline)} items={MIXED} defaultExpandedIds={['unit-1']} />
        )}
        code={`const items: TreeItem[] = [
  { id: 'unit-1', label: 'Unit 1', children: [/* ... */] },
  { id: 'unit-2', label: 'Unit 2', disabled: true, children: [/* ... */] },
  { id: 'glossary', label: 'Glossary' },
];

<TreeView aria-label="Course outline" items={items} defaultExpandedIds={['unit-1']} />`}
      />

      <Example
        title={t(m.exSkeleton)}
        description={t(m.treeEx5Desc)}
        component="TreeView"
        render={(K) => (
          <K.TreeView aria-label={t(m.treeAriaProjectFiles)} items={[]} skeleton />
        )}
        code={`<TreeView aria-label="Project files" items={[]} skeleton />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'items', type: 'TreeItem[]', description: t(m.treePropItems) },
          { name: 'expandedIds', type: 'string[]', description: t(m.treePropExpandedIds) },
          { name: 'defaultExpandedIds', type: 'string[]', default: '[]', description: t(m.treePropDefaultExpandedIds) },
          { name: 'onExpandedChange', type: '(expandedIds: string[]) => void', description: t(m.treePropOnExpandedChange) },
          { name: 'selectedId', type: 'string', description: t(m.treePropSelectedId) },
          { name: 'defaultSelectedId', type: 'string', description: t(m.treePropDefaultSelectedId) },
          { name: 'onSelect', type: '(id: string) => void', description: t(m.treePropOnSelect) },
          { name: 'aria-label', type: 'string', description: t(m.treePropAriaLabel) },
          { name: 'glass', type: 'boolean', default: 'false', description: t(m.treePropGlass) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.treePropSkeleton) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.treeA11y1))}</li>
        <li>{prose(t(m.treeA11y2))}</li>
        <li>{prose(t(m.treeA11y3))}</li>
        <li>{prose(t(m.treeA11y4))}</li>
        <li>{prose(t(m.treeA11y5))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.treeUse1))}</li>
        <li>{prose(t(m.treeUse2))}</li>
        <li>{prose(t(m.treeUse3))}</li>
        <li>{prose(t(m.treeUse4))}</li>
      </ul>
    </>
  );
}
