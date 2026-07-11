import { AppWindow, Blocks, Cog, Cpu } from '@glacier/icons';
import { DataGrid, Pill, Sparkline, type DataGridColumn, type DataGridRow } from '@glacier/react';
import { useMemo } from 'react';
import { fmtBytes, fmtPct, fmtRate } from '../core/format.ts';
import { useTelemetry } from '../core/telemetry.tsx';
import type { ProcessKind, ProcessSample } from '../core/types.ts';

export type ResourceKey = 'cpu' | 'memory' | 'disk' | 'network';

/** Sparkline samples per row: the last minute. */
const TREND_TICKS = 60;

const KIND_ICON: Record<ProcessKind, typeof AppWindow> = {
  app: AppWindow,
  helper: Blocks,
  daemon: Cog,
  kernel: Cpu,
};

interface Row extends DataGridRow {
  id: number;
  sample: ProcessSample;
  name: string;
  user: string;
  kind: ProcessKind;
  trend: number[];
}

export function ProcessTable({
  resource,
  selected,
  onSelect,
}: {
  resource: ResourceKey;
  selected: number | null;
  onSelect: (pid: number) => void;
}) {
  const { sensor, current, trail } = useTelemetry();

  const rows = useMemo<Row[]>(() => {
    const history = trail(TREND_TICKS);
    return current.processes.map((sample) => {
      const info = sensor.info(sample.pid);
      const trend = history.map((s) => {
        const p = s.processes.find((x) => x.pid === sample.pid);
        if (!p) return 0;
        return resource === 'memory' ? p.mem : resource === 'disk' ? p.diskRead + p.diskWrite : resource === 'network' ? p.netIn + p.netOut : p.cpu;
      });
      return {
        id: sample.pid,
        sample,
        name: info?.name ?? `pid ${sample.pid}`,
        user: info?.user ?? '?',
        kind: info?.kind ?? 'daemon',
        trend,
      };
    });
  }, [sensor, current, trail, resource]);

  // Rows in a column share one scale: pin every trend to the column-wide peak.
  const trendMax = useMemo(() => Math.max(...rows.flatMap((r) => r.trend), 1), [rows]);

  const columns = useMemo<DataGridColumn[]>(() => {
    const r = (row: DataGridRow) => row as Row;
    const name: DataGridColumn = {
      key: 'name',
      header: 'Process',
      sortable: true,
      width: '16rem',
      render: (row) => {
        const { name, kind, sample } = r(row);
        const Icon = KIND_ICON[kind];
        return (
          <button type="button" className="pfName" onClick={() => onSelect(r(row).id)} title={`Inspect ${name}`}>
            <Icon size={14} aria-hidden />
            <span className="pfProcName">{name}</span>
            {sample.state === 'frozen' && (
              <Pill size="sm" tone="info">
                frozen
              </Pill>
            )}
          </button>
        );
      },
    };
    const pid: DataGridColumn = {
      key: 'id',
      header: 'PID',
      sortable: true,
      align: 'end',
      width: '4.5rem',
      render: (row) => <span className="pfMono pfDim">{r(row).id}</span>,
    };
    const user: DataGridColumn = {
      key: 'user',
      header: 'User',
      sortable: true,
      width: '8rem',
      render: (row) => <span className="pfDim">{r(row).user}</span>,
    };
    const trend: DataGridColumn = {
      key: 'trend',
      header: 'Last minute',
      width: '9rem',
      render: (row) => (
        <Sparkline
          data={r(row).trend}
          min={0}
          max={trendMax}
          size="sm"
          tone={r(row).sample.state === 'frozen' ? 'neutral' : 'accent'}
          aria-label={`${r(row).name} trend, last minute`}
        />
      ),
    };
    const threads: DataGridColumn = {
      key: 'threads',
      header: 'Threads',
      sortable: true,
      align: 'end',
      width: '5.5rem',
      sortValue: (row) => r(row).sample.threads,
      render: (row) => <span className="pfMono pfDim">{r(row).sample.threads}</span>,
    };

    const num = (
      key: string,
      header: string,
      value: (s: ProcessSample) => number,
      format: (v: number) => string,
      width = '7rem',
    ): DataGridColumn => ({
      key,
      header,
      sortable: true,
      align: 'end',
      width,
      sortValue: (row) => value(r(row).sample),
      render: (row) => <span className="pfMono">{format(value(r(row).sample))}</span>,
    });

    switch (resource) {
      case 'memory':
        return [name, num('mem', 'Memory', (s) => s.mem, fmtBytes), trend, num('swapish', 'Energy', (s) => s.energy, (v) => v.toFixed(1)), threads, pid, user];
      case 'disk':
        return [name, num('read', 'Read', (s) => s.diskRead, fmtRate), num('write', 'Written', (s) => s.diskWrite, fmtRate), trend, pid, user];
      case 'network':
        return [name, num('in', 'Received', (s) => s.netIn, fmtRate), num('out', 'Sent', (s) => s.netOut, fmtRate), trend, pid, user];
      default:
        return [name, num('cpu', '% CPU', (s) => s.cpu, fmtPct, '6rem'), trend, num('energy', 'Energy', (s) => s.energy, (v) => v.toFixed(1)), threads, pid, user];
    }
  }, [resource, onSelect, trendMax]);

  const defaultSortKey = resource === 'memory' ? 'mem' : resource === 'disk' ? 'write' : resource === 'network' ? 'in' : 'cpu';

  return (
    <DataGrid
      aria-label={`Processes by ${resource}`}
      columns={columns}
      data={rows}
      defaultSort={{ columnKey: defaultSortKey, direction: 'desc' }}
      density="compact"
      stickyHeader
      selectedIds={selected === null ? [] : [selected]}
    />
  );
}
