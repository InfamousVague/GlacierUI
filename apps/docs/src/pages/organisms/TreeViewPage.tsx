import { useState } from 'react';
import { TreeView, CounterBadge, Heading, Text, Size, TextTone, type TreeItem } from '@glacier/react';
import { Folder, FileText, FileCode, BookOpen } from '@glacier/icons';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

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

const CHAPTERS: TreeItem[] = [
  {
    id: 'basics',
    label: 'Basics',
    icon: bookIcon,
    trailing: <CounterBadge count={4} size={Size.Small} />,
    children: [
      { id: 'variables', label: 'Variables' },
      { id: 'functions', label: 'Functions' },
      { id: 'loops', label: 'Loops' },
      { id: 'objects', label: 'Objects' },
    ],
  },
  {
    id: 'advanced',
    label: 'Advanced',
    icon: bookIcon,
    trailing: <CounterBadge count={2} size={Size.Small} />,
    children: [
      { id: 'closures', label: 'Closures' },
      { id: 'async', label: 'Async and await' },
    ],
  },
];

const MIXED: TreeItem[] = [
  {
    id: 'unit-1',
    label: 'Unit 1: Fundamentals',
    children: [
      { id: 'lesson-1', label: 'Lesson 1: Hello world' },
      { id: 'lesson-2', label: 'Lesson 2: Types' },
    ],
  },
  {
    id: 'unit-2',
    label: 'Unit 2: Locked until Unit 1 is done',
    disabled: true,
    children: [{ id: 'lesson-3', label: 'Lesson 3: Modules' }],
  },
  { id: 'glossary', label: 'Glossary' },
];

function ControlledTree() {
  const [expandedIds, setExpandedIds] = useState<string[]>(['src']);
  const [selectedId, setSelectedId] = useState('main');
  return (
    <div style={{ display: 'grid', gap: 'var(--glacier-space-3)' }}>
      <TreeView
        aria-label="Project files (controlled)"
        items={FILES}
        expandedIds={expandedIds}
        onExpandedChange={setExpandedIds}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <Text size={Size.Small} tone={TextTone.Muted}>
        Selected: <code>{selectedId}</code>, expanded: <code>{expandedIds.join(', ') || 'none'}</code>
      </Text>
    </div>
  );
}

export function TreeViewPage() {
  return (
    <>
      <Heading level={1}>TreeView</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A hierarchical list of expandable rows for file explorers and chapter outlines. It follows
        the WAI-ARIA tree pattern: a <code>role="tree"</code> of nested <code>treeitem</code> rows
        with one roving tabindex, arrow-key navigation over the visible rows, and single selection
        via <code>selectedId</code> + <code>onSelect</code>. Branches animate open and closed, and
        parents may be controlled through <code>expandedIds</code> + <code>onExpandedChange</code>.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the figure.</Text>
      <ComponentBlueprint specId="tree-view" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="File explorer"
        description="An uncontrolled tree manages its own expansion. Click a folder to toggle and select it; click a file to select it. Arrow keys walk the visible rows."
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
      >
        <TreeView aria-label="Project files" items={FILES} defaultExpandedIds={['src']} defaultSelectedId="main" />
      </Example>

      <Example
        title="Controlled"
        description="Drive expansion and selection from state. onExpandedChange reports the next full list of expanded ids; onSelect reports the id of the row that becomes selected."
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
      >
        <ControlledTree />
      </Example>

      <Example
        title="Icons and trailing"
        description="Each row takes an optional leading icon and a trailing slot, here a CounterBadge with the lesson count per chapter."
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
      >
        <TreeView aria-label="Course chapters" items={CHAPTERS} defaultExpandedIds={['basics']} />
      </Example>

      <Example
        title="Disabled rows"
        description="A disabled row is dimmed, skipped by arrow navigation, and cannot be selected or expanded."
        code={`const items: TreeItem[] = [
  { id: 'unit-1', label: 'Unit 1', children: [/* ... */] },
  { id: 'unit-2', label: 'Unit 2', disabled: true, children: [/* ... */] },
  { id: 'glossary', label: 'Glossary' },
];

<TreeView aria-label="Course outline" items={items} defaultExpandedIds={['unit-1']} />`}
      >
        <TreeView aria-label="Course outline" items={MIXED} defaultExpandedIds={['unit-1']} />
      </Example>

      <Example
        title="Skeleton"
        description="While the tree loads, render the skeleton to hold its exact geometry, indents included."
        code={`<TreeView aria-label="Project files" items={[]} skeleton />`}
      >
        <TreeView aria-label="Project files" items={[]} skeleton />
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'items', type: 'TreeItem[]', description: 'Required. The tree rows: { id, label, icon?, trailing?, disabled?, children? }, nested via children.' },
          { name: 'expandedIds', type: 'string[]', description: 'Controlled list of expanded parent ids.' },
          { name: 'defaultExpandedIds', type: 'string[]', default: '[]', description: 'Initially expanded parent ids when uncontrolled.' },
          { name: 'onExpandedChange', type: '(expandedIds: string[]) => void', description: 'Called with the next full list of expanded ids whenever a parent toggles.' },
          { name: 'selectedId', type: 'string', description: 'Controlled selected row id (single-select).' },
          { name: 'defaultSelectedId', type: 'string', description: 'Initially selected row id when uncontrolled.' },
          { name: 'onSelect', type: '(id: string) => void', description: 'Called with the id of the row that becomes selected.' },
          { name: 'aria-label', type: 'string', description: 'Required. Accessible name for the tree.' },
          { name: 'glass', type: 'boolean', default: 'false', description: 'Renders the frosted glass material behind the tree.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: 'Renders a placeholder with the component’s exact geometry.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          The root is a <code>role="tree"</code> list of <code>role="treeitem"</code> rows; each
          branch is a <code>role="group"</code>. Parents expose <code>aria-expanded</code>, and
          every row carries <code>aria-level</code>, <code>aria-setsize</code>, and{' '}
          <code>aria-posinset</code>.
        </li>
        <li>
          One roving tabindex spans the visible rows: Tab enters the tree at the selected row (or
          the first enabled row), then arrow keys move focus without leaving the widget.
        </li>
        <li>
          ArrowDown and ArrowUp walk the visible rows, skipping disabled ones. ArrowRight expands a
          collapsed parent or descends to its first child; ArrowLeft collapses an expanded parent
          or ascends to the parent row. Home and End jump to the extremes.
        </li>
        <li>
          Enter and Space select the focused row, also toggling expansion on parent rows; the
          selection is reported through <code>aria-selected</code>.
        </li>
        <li>The chevron and leading icons are <code>aria-hidden</code>; the row label names the item.</li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Use a TreeView for genuinely hierarchical data such as files, chapters, or nested categories; reach for a List or Sidebar when the data is flat.</li>
        <li>Keep labels short so deep rows survive the indent; put counts or status in the trailing slot instead of the label.</li>
        <li>Control <code>expandedIds</code> when expansion must persist or sync elsewhere, for example remembering which folders a learner left open.</li>
        <li>Disable rows that exist but are not yet available, such as locked chapters, rather than hiding them.</li>
      </ul>
    </>
  );
}
