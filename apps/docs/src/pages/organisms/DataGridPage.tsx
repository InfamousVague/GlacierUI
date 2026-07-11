import { useState } from 'react';
import {
  DataGrid,
  Heading,
  Pill,
  Text,
  Size,
  TextTone,
  type DataGridColumn,
  type DataGridRow,
  type DataGridRowId,
  type DataGridSort,
} from '@glacier/react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

interface Person extends DataGridRow {
  id: number;
  name: string;
  role: string;
  commits: number;
  status: 'Active' | 'Away' | 'Offline';
}

const PEOPLE: Person[] = [
  { id: 1, name: 'Ada Lovelace', role: 'Engineer', commits: 128, status: 'Active' },
  { id: 2, name: 'Grace Hopper', role: 'Compiler Lead', commits: 342, status: 'Away' },
  { id: 3, name: 'Linus Pauling', role: 'Chemist', commits: 57, status: 'Offline' },
  { id: 4, name: 'Alan Turing', role: 'Mathematician', commits: 211, status: 'Active' },
];

const statusTone = { Active: 'success', Away: 'warning', Offline: 'neutral' } as const;

const COLUMNS: DataGridColumn[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'role', header: 'Role', sortable: true },
  { key: 'commits', header: 'Commits', align: 'end', sortable: true },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Pill tone={statusTone[(row as Person).status]} size={Size.Small}>
        {(row as Person).status}
      </Pill>
    ),
  },
];

function SelectableGrid() {
  const [selectedIds, setSelectedIds] = useState<DataGridRowId[]>([1]);
  return (
    <div style={{ display: 'grid', gap: 'var(--glacier-space-3)' }}>
      <DataGrid
        aria-label="Team (selectable)"
        columns={COLUMNS}
        data={PEOPLE}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        defaultSort={{ columnKey: 'commits', direction: 'desc' }}
      />
      <Text size={Size.Small} tone={TextTone.Muted}>
        Selected: <code>{selectedIds.join(', ') || 'none'}</code>
      </Text>
    </div>
  );
}

function ControlledSortGrid() {
  const [sort, setSort] = useState<DataGridSort | null>({ columnKey: 'name', direction: 'asc' });
  return (
    <div style={{ display: 'grid', gap: 'var(--glacier-space-3)' }}>
      <DataGrid aria-label="Team (controlled sort)" columns={COLUMNS} data={PEOPLE} sort={sort} onSortChange={setSort} />
      <Text size={Size.Small} tone={TextTone.Muted}>
        Sort: <code>{sort ? `${sort.columnKey} ${sort.direction}` : 'none'}</code>
      </Text>
    </div>
  );
}

export function DataGridPage() {
  return (
    <>
      <Heading level={1}>DataGrid</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A column-driven data grid with client sorting, multi-row selection, loading and empty
        states, responsive overflow, and a roving-focus keyboard grid. It is the interactive
        counterpart to <code>Table</code>: reach for Table when the data is static, and for DataGrid
        when rows are sortable, selectable, or paged.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the figure.</Text>
      <ComponentBlueprint specId="data-grid" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Sortable columns"
        description="Mark columns sortable to make their headers three-state sort controls: click cycles ascending, descending, then unsorted. Sorting is client-side by default."
        code={`const columns: DataGridColumn[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'role', header: 'Role', sortable: true },
  { key: 'commits', header: 'Commits', align: 'end', sortable: true },
];

<DataGrid aria-label="Team" columns={columns} data={people} />`}
      >
        <DataGrid aria-label="Team" columns={COLUMNS} data={PEOPLE} />
      </Example>

      <Example
        title="Selectable rows"
        description="selectable adds a leading checkbox column with a select-all header. The header checkbox shows an indeterminate dash on a partial selection. Drive it with selectedIds and onSelectionChange."
        code={`const [selectedIds, setSelectedIds] = useState<DataGridRowId[]>([1]);

<DataGrid
  aria-label="Team"
  columns={columns}
  data={people}
  selectable
  selectedIds={selectedIds}
  onSelectionChange={setSelectedIds}
/>`}
      >
        <SelectableGrid />
      </Example>

      <Example
        title="Controlled sort"
        description="Hold the sort in state to persist it or drive server sorting. Pair with manualSort to render data exactly as given while still reporting header clicks."
        code={`const [sort, setSort] = useState<DataGridSort | null>({ columnKey: 'name', direction: 'asc' });

<DataGrid aria-label="Team" columns={columns} data={people} sort={sort} onSortChange={setSort} />`}
      >
        <ControlledSortGrid />
      </Example>

      <Example
        title="Custom cell rendering"
        description="A column render function receives the row and its index, so cells can hold any node, here a Pill keyed to each person's status."
        code={`{
  key: 'status',
  header: 'Status',
  render: (row) => <Pill tone={statusTone[row.status]} size={Size.Small}>{row.status}</Pill>,
}`}
      >
        <DataGrid aria-label="Team status" columns={COLUMNS} data={PEOPLE.slice(0, 2)} />
      </Example>

      <Example
        title="Compact density"
        description="Compact trims vertical padding for data-dense views without changing the type scale."
        code={`<DataGrid aria-label="Team" columns={columns} data={people} density="compact" />`}
      >
        <DataGrid aria-label="Team compact" columns={COLUMNS} data={PEOPLE} density="compact" />
      </Example>

      <Example
        title="Sticky header"
        description="Cap the body with maxHeight and set stickyHeader to pin the header while the rows scroll vertically. The grid always scrolls horizontally when columns overflow."
        code={`<DataGrid aria-label="Team" columns={columns} data={people} stickyHeader maxHeight="9rem" />`}
      >
        <DataGrid aria-label="Team scroll" columns={COLUMNS} data={[...PEOPLE, ...PEOPLE.map((p) => ({ ...p, id: p.id + 100 }))]} stickyHeader maxHeight="9rem" />
      </Example>

      <Example
        title="Loading"
        description="loading shows skeleton rows that keep the header and column widths, and marks the grid aria-busy."
        code={`<DataGrid aria-label="Team" columns={columns} data={[]} loading loadingRows={4} />`}
      >
        <DataGrid aria-label="Team loading" columns={COLUMNS} data={[]} loading loadingRows={4} />
      </Example>

      <Example
        title="Empty"
        description="With no rows and not loading, the grid shows emptyState across a single spanning cell, defaulting to a localized No results."
        code={`<DataGrid aria-label="Team" columns={columns} data={[]} emptyState="No teammates yet" />`}
      >
        <DataGrid aria-label="Team empty" columns={COLUMNS} data={[]} emptyState="No teammates yet" />
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'columns', type: 'DataGridColumn[]', description: 'Required. Column definitions: { key, header, align?, sortable?, width?, render?, sortValue? }.' },
          { name: 'data', type: 'DataGridRow[]', description: 'Required. Rows to render; each must carry a stable id.' },
          { name: 'aria-label', type: 'string', description: 'Required. Accessible name for the grid.' },
          { name: 'sort', type: 'DataGridSort | null', description: 'Controlled active sort: { columnKey, direction } or null.' },
          { name: 'defaultSort', type: 'DataGridSort | null', default: 'null', description: 'Initial sort when uncontrolled.' },
          { name: 'onSortChange', type: '(sort: DataGridSort | null) => void', description: 'Called with the next sort when a sortable header cycles.' },
          { name: 'manualSort', type: 'boolean', default: 'false', description: 'Skip built-in client sorting; render data as given and only report sort changes.' },
          { name: 'selectable', type: 'boolean', default: 'false', description: 'Render a leading checkbox column with select-all in the header.' },
          { name: 'selectedIds', type: 'DataGridRowId[]', description: 'Controlled list of selected row ids.' },
          { name: 'defaultSelectedIds', type: 'DataGridRowId[]', default: '[]', description: 'Initially selected row ids when uncontrolled.' },
          { name: 'onSelectionChange', type: '(ids: DataGridRowId[]) => void', description: 'Called with the next full list of selected ids.' },
          { name: 'loading', type: 'boolean', default: 'false', description: 'Show skeleton rows and mark the grid aria-busy.' },
          { name: 'loadingRows', type: 'number', default: '5', description: 'How many skeleton rows to show while loading.' },
          { name: 'emptyState', type: 'ReactNode', description: 'Content shown when there are no rows and not loading.' },
          { name: 'density', type: "'comfortable' | 'compact'", default: "'comfortable'", description: 'Row rhythm; compact trims vertical padding.' },
          { name: 'stickyHeader', type: 'boolean', default: 'false', description: 'Pin the header row while the body scrolls vertically.' },
          { name: 'maxHeight', type: 'string', description: 'Cap the body height and scroll vertically; pairs with stickyHeader.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: 'Renders a placeholder with the component’s exact geometry.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          The host is a <code>role="grid"</code> table of <code>role="row"</code> rows with{' '}
          <code>role="columnheader"</code> and <code>role="gridcell"</code> cells. It exposes{' '}
          <code>aria-rowcount</code>, <code>aria-colcount</code>, and per-cell{' '}
          <code>aria-rowindex</code> and <code>aria-colindex</code>.
        </li>
        <li>
          One roving tabindex spans the cells: Tab enters the grid at a single cell, then the arrow
          keys move focus across the header and body. Home and End jump to the row edges;{' '}
          <code>Ctrl+Home</code> and <code>Ctrl+End</code> jump to the grid corners.
        </li>
        <li>
          Sortable headers carry <code>aria-sort</code> (ascending, descending, or none) and cycle
          three states with Enter or Space.
        </li>
        <li>
          Selection is multi-select through a leading checkbox column; rows report{' '}
          <code>aria-selected</code>, and the select-all header checkbox reports{' '}
          <code>aria-checked="mixed"</code> on a partial selection. Space toggles the focused
          selection cell.
        </li>
        <li>The grid marks itself <code>aria-busy</code> while loading; skeleton rows are decorative.</li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Choose DataGrid over Table when rows need sorting, selection, or a loading state; keep Table for static, read-only rows.</li>
        <li>Give every row a stable <code>id</code> so selection survives re-sorts and re-renders.</li>
        <li>For very large datasets, page or window the data yourself, feed only the visible slice as <code>data</code>, and set <code>manualSort</code> so the parent owns ordering.</li>
        <li>Right-align numeric columns with <code>align: 'end'</code>, and put status or actions in a <code>render</code> cell rather than the raw value.</li>
        <li>Reach for compact density in dashboards and admin tables where vertical space is scarce.</li>
      </ul>
    </>
  );
}
