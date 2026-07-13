import { useState } from 'react';
import {
  Heading,
  Pill,
  Text,
  Size,
  TextTone,
  useT,
  type DataGridColumn,
  type DataGridRow,
  type DataGridRowId,
  type DataGridSort,
} from '@glacier/react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

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

function SelectableGrid({ K }: { K: PlatformKit }) {
  const t = useT();
  const [selectedIds, setSelectedIds] = useState<DataGridRowId[]>([1]);
  return (
    <div style={{ display: 'grid', gap: 'var(--glacier-space-3)' }}>
      <K.DataGrid
        aria-label={t(m.datagridTeamSelectable)}
        columns={COLUMNS}
        data={PEOPLE}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        defaultSort={{ columnKey: 'commits', direction: 'desc' }}
      />
      <Text size={Size.Small} tone={TextTone.Muted}>
        {t(m.datagridSelected)} <code>{selectedIds.join(', ') || 'none'}</code>
      </Text>
    </div>
  );
}

function ControlledSortGrid({ K }: { K: PlatformKit }) {
  const t = useT();
  const [sort, setSort] = useState<DataGridSort | null>({ columnKey: 'name', direction: 'asc' });
  return (
    <div style={{ display: 'grid', gap: 'var(--glacier-space-3)' }}>
      <K.DataGrid aria-label={t(m.datagridTeamControlledSort)} columns={COLUMNS} data={PEOPLE} sort={sort} onSortChange={setSort} />
      <Text size={Size.Small} tone={TextTone.Muted}>
        {t(m.datagridSort)} <code>{sort ? `${sort.columnKey} ${sort.direction}` : 'none'}</code>
      </Text>
    </div>
  );
}

export function DataGridPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.dgName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.dgLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntro)}</Text>
      <ComponentBlueprint specId="data-grid" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.dgExSortTitle)}
        description={t(m.dgExSortDesc)}
        component="DataGrid"
        render={(K) => <K.DataGrid aria-label={t(m.datagridTeam)} columns={COLUMNS} data={PEOPLE} />}
        code={`const columns: DataGridColumn[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'role', header: 'Role', sortable: true },
  { key: 'commits', header: 'Commits', align: 'end', sortable: true },
];

<DataGrid aria-label="Team" columns={columns} data={people} />`}
      />

      <Example
        title={t(m.dgExSelectTitle)}
        description={t(m.dgExSelectDesc)}
        component="DataGrid"
        render={(K) => <SelectableGrid K={K} />}
        code={`const [selectedIds, setSelectedIds] = useState<DataGridRowId[]>([1]);

<DataGrid
  aria-label="Team"
  columns={columns}
  data={people}
  selectable
  selectedIds={selectedIds}
  onSelectionChange={setSelectedIds}
/>`}
      />

      <Example
        title={t(m.dgExCtrlTitle)}
        description={t(m.dgExCtrlDesc)}
        component="DataGrid"
        render={(K) => <ControlledSortGrid K={K} />}
        code={`const [sort, setSort] = useState<DataGridSort | null>({ columnKey: 'name', direction: 'asc' });

<DataGrid aria-label="Team" columns={columns} data={people} sort={sort} onSortChange={setSort} />`}
      />

      <Example
        title={t(m.dgExRenderTitle)}
        description={t(m.dgExRenderDesc)}
        component="DataGrid"
        render={(K) => <K.DataGrid aria-label={t(m.datagridTeamStatus)} columns={COLUMNS} data={PEOPLE.slice(0, 2)} />}
        code={`{
  key: 'status',
  header: 'Status',
  render: (row) => <Pill tone={statusTone[row.status]} size={Size.Small}>{row.status}</Pill>,
}`}
      />

      <Example
        title={t(m.dgExCompactTitle)}
        description={t(m.dgExCompactDesc)}
        component="DataGrid"
        render={(K) => <K.DataGrid aria-label={t(m.datagridTeamCompact)} columns={COLUMNS} data={PEOPLE} density="compact" />}
        code={`<DataGrid aria-label="Team" columns={columns} data={people} density="compact" />`}
      />

      <Example
        title={t(m.dgExStickyTitle)}
        description={t(m.dgExStickyDesc)}
        component="DataGrid"
        render={(K) => <K.DataGrid aria-label={t(m.datagridTeamScroll)} columns={COLUMNS} data={[...PEOPLE, ...PEOPLE.map((p) => ({ ...p, id: p.id + 100 }))]} stickyHeader maxHeight="9rem" />}
        code={`<DataGrid aria-label="Team" columns={columns} data={people} stickyHeader maxHeight="9rem" />`}
      />

      <Example
        title={t(m.dgExLoadingTitle)}
        description={t(m.dgExLoadingDesc)}
        component="DataGrid"
        render={(K) => <K.DataGrid aria-label={t(m.datagridTeamLoading)} columns={COLUMNS} data={[]} loading loadingRows={4} />}
        code={`<DataGrid aria-label="Team" columns={columns} data={[]} loading loadingRows={4} />`}
      />

      <Example
        title={t(m.dgExEmptyTitle)}
        description={t(m.dgExEmptyDesc)}
        component="DataGrid"
        render={(K) => <K.DataGrid aria-label={t(m.datagridTeamEmpty)} columns={COLUMNS} data={[]} emptyState={t(m.dgEmptyDemo)} />}
        code={`<DataGrid aria-label="Team" columns={columns} data={[]} emptyState="No teammates yet" />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'columns', type: 'DataGridColumn[]', description: t(m.dgPropColumns) },
          { name: 'data', type: 'DataGridRow[]', description: t(m.dgPropData) },
          { name: 'aria-label', type: 'string', description: t(m.dgPropAriaLabel) },
          { name: 'sort', type: 'DataGridSort | null', description: t(m.dgPropSort) },
          { name: 'defaultSort', type: 'DataGridSort | null', default: 'null', description: t(m.dgPropDefaultSort) },
          { name: 'onSortChange', type: '(sort: DataGridSort | null) => void', description: t(m.dgPropOnSortChange) },
          { name: 'manualSort', type: 'boolean', default: 'false', description: t(m.dgPropManualSort) },
          { name: 'selectable', type: 'boolean', default: 'false', description: t(m.dgPropSelectable) },
          { name: 'selectedIds', type: 'DataGridRowId[]', description: t(m.dgPropSelectedIds) },
          { name: 'defaultSelectedIds', type: 'DataGridRowId[]', default: '[]', description: t(m.dgPropDefaultSelectedIds) },
          { name: 'onSelectionChange', type: '(ids: DataGridRowId[]) => void', description: t(m.dgPropOnSelectionChange) },
          { name: 'loading', type: 'boolean', default: 'false', description: t(m.dgPropLoading) },
          { name: 'loadingRows', type: 'number', default: '5', description: t(m.dgPropLoadingRows) },
          { name: 'emptyState', type: 'ReactNode', description: t(m.dgPropEmptyState) },
          { name: 'density', type: "'comfortable' | 'compact'", default: "'comfortable'", description: t(m.dgPropDensity) },
          { name: 'stickyHeader', type: 'boolean', default: 'false', description: t(m.dgPropStickyHeader) },
          { name: 'maxHeight', type: 'string', description: t(m.dgPropMaxHeight) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.dgPropSkeleton) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.dgA11y1))}</li>
        <li>{prose(t(m.dgA11y2))}</li>
        <li>{prose(t(m.dgA11y3))}</li>
        <li>{prose(t(m.dgA11y4))}</li>
        <li>{prose(t(m.dgA11y5))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.dgUse1))}</li>
        <li>{prose(t(m.dgUse2))}</li>
        <li>{prose(t(m.dgUse3))}</li>
        <li>{prose(t(m.dgUse4))}</li>
        <li>{prose(t(m.dgUse5))}</li>
      </ul>
    </>
  );
}
