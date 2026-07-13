import { useState } from 'react';
import { useT } from '../i18n.ts';
import {
  AlertDialog,
  Button,
  DataGrid,
  Field,
  Heading,
  IconButton,
  Input,
  Modal,
  Pill,
  Row,
  Select,
  Size,
  Text,
  TextTone,
  useToast,
  type DataGridColumn,
  type DataGridRow,
} from '@glacier/react';
import { Plus, Trash2 } from '@glacier/icons';

interface Project extends DataGridRow {
  id: number;
  name: string;
  owner: string;
  status: 'Active' | 'Paused' | 'Archived';
}

const STATUS_TONE = { Active: 'success', Paused: 'warning', Archived: 'neutral' } as const;

const SEED: Project[] = [
  { id: 1, name: 'Aurora', owner: 'Ada Lovelace', status: 'Active' },
  { id: 2, name: 'Borealis', owner: 'Grace Hopper', status: 'Active' },
  { id: 3, name: 'Cirrus', owner: 'Alan Turing', status: 'Paused' },
  { id: 4, name: 'Drift', owner: 'Linus Pauling', status: 'Archived' },
];

export function LibraryPage() {
  const t = useT();
  const { toast } = useToast();
  const [rows, setRows] = useState<Project[]>(SEED);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftOwner, setDraftOwner] = useState('');

  const columns: DataGridColumn[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'owner', header: 'Owner', sortable: true },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Pill tone={STATUS_TONE[(row as Project).status]} size={Size.Small}>
          {(row as Project).status}
        </Pill>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'end',
      render: (row) => (
        <IconButton
          variant="ghost"
          size="sm"
          aria-label={`Delete ${(row as Project).name}`}
          onClick={() => setPendingDelete(row as Project)}
        >
          <Trash2 size={16} />
        </IconButton>
      ),
    },
  ];

  function resetDraft() {
    setDraftName('');
    setDraftOwner('');
  }

  function createProject() {
    const name = draftName.trim();
    if (!name) return;
    const nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
    setRows((prev) => [...prev, { id: nextId, name, owner: draftOwner.trim() || 'Unassigned', status: 'Active' }]);
    setCreating(false);
    resetDraft();
    toast({ tone: 'success', message: `Created "${name}"` });
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const removed = pendingDelete;
    setRows((prev) => prev.filter((row) => row.id !== removed.id));
    setPendingDelete(null);
    toast({ tone: 'neutral', message: `Deleted "${removed.name}"` });
  }

  return (
    <div className="page">
      <Row justify="between" align="center" wrap gap={3}>
        <div>
          <Heading level={1}>{t('libTitle')}</Heading>
          <Text tone={TextTone.Muted} className="pageLede">
            {t('libLede')}
          </Text>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus size={16} /> New project
        </Button>
      </Row>

      <DataGrid
        aria-label="Projects"
        columns={columns}
        data={rows}
        selectable
        emptyState="No projects yet. Create your first one."
      />

      <Modal
        open={creating}
        onClose={() => {
          setCreating(false);
          resetDraft();
        }}
        title="New project"
        description="Give it a name and an owner. You can change these later."
        footer={
          <Row justify="end" gap={2}>
            <Button
              variant="ghost"
              onClick={() => {
                setCreating(false);
                resetDraft();
              }}
            >
              Cancel
            </Button>
            <Button onClick={createProject} disabled={!draftName.trim()}>
              Create
            </Button>
          </Row>
        }
      >
        <div style={{ display: 'grid', gap: 'var(--glacier-space-4)' }}>
          <Field label="Name">
            <Input value={draftName} onChange={(event) => setDraftName(event.target.value)} placeholder="Nimbus" autoFocus />
          </Field>
          <Field label="Owner" hint="Optional. Defaults to Unassigned.">
            <Input value={draftOwner} onChange={(event) => setDraftOwner(event.target.value)} placeholder="Ada Lovelace" />
          </Field>
          <Field label="Visibility">
            <Select
              defaultValue="team"
              options={[
                { value: 'team', label: 'Team' },
                { value: 'private', label: 'Private' },
                { value: 'public', label: 'Public' },
              ]}
            />
          </Field>
        </div>
      </Modal>

      <AlertDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        tone="danger"
        title={pendingDelete ? `Delete "${pendingDelete.name}"?` : 'Delete project?'}
        description="This removes the project from the list. This starter keeps it in memory, so a reload brings it back."
        actionLabel="Delete"
        onAction={confirmDelete}
      />
    </div>
  );
}
