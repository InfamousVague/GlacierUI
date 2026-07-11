import { Play, Snowflake, X } from '@glacier/icons';
import { Button, IconButton, Pill, TimeSeriesChart } from '@glacier/react';
import { useMemo } from 'react';
import { fmtBytes, fmtPct, fmtRate } from '../core/format.ts';
import { useTelemetry } from '../core/telemetry.tsx';

/** Detail chart window: the last five minutes. */
const CHART_TICKS = 300;

export function DetailPanel({ pid, onClose }: { pid: number; onClose: () => void }) {
  const { sensor, current, trail, live } = useTelemetry();
  const info = sensor.info(pid);
  const sample = current.processes.find((p) => p.pid === pid);

  const history = trail(CHART_TICKS);
  const chart = useMemo(() => {
    const times: number[] = [];
    const cpu: (number | null)[] = [];
    for (const s of history) {
      times.push(s.time);
      const p = s.processes.find((x) => x.pid === pid);
      cpu.push(p ? p.cpu : null);
    }
    return { times, cpu };
  }, [history, pid]);

  if (!info) return null;
  const frozen = sample?.state === 'frozen';
  const gone = !sample;

  return (
    <aside className="pfPanel" aria-label={`${info.name} detail`}>
      <div className="pfDetailHead">
        <div>
          <h2 className="pfDetailName">{info.name}</h2>
          <p className="pfDetailSub">
            PID {info.pid} · {info.user} · {info.kind}
            {info.parent ? ` · ${info.parent}` : ''}
          </p>
        </div>
        <IconButton variant="ghost" size="sm" aria-label="Close detail" onClick={onClose}>
          <X size={14} />
        </IconButton>
      </div>

      {gone ? (
        <Pill tone="danger">terminated</Pill>
      ) : (
        <>
          <TimeSeriesChart
            times={chart.times}
            series={[{ id: 'cpu', label: '% CPU', values: chart.cpu }]}
            max={Math.max(...chart.cpu.map((v) => v ?? 0), 100)}
            formatValue={(v) => fmtPct(v)}
            height="8rem"
            aria-label={`${info.name} CPU, last five minutes`}
          />
          <dl className="pfFacts">
            <div>
              <dt>CPU</dt>
              <dd>{fmtPct(sample.cpu)}</dd>
            </div>
            <div>
              <dt>Memory</dt>
              <dd>{fmtBytes(sample.mem)}</dd>
            </div>
            <div>
              <dt>Threads</dt>
              <dd>{sample.threads}</dd>
            </div>
            <div>
              <dt>Energy</dt>
              <dd>{sample.energy.toFixed(1)}</dd>
            </div>
            <div>
              <dt>Network</dt>
              <dd>
                ↓ {fmtRate(sample.netIn)} · ↑ {fmtRate(sample.netOut)}
              </dd>
            </div>
            <div>
              <dt>Disk</dt>
              <dd>
                R {fmtRate(sample.diskRead)} · W {fmtRate(sample.diskWrite)}
              </dd>
            </div>
          </dl>
          <div className="pfActions">
            {frozen ? (
              <Button size="sm" variant="soft" onClick={() => sensor.resume(pid)} disabled={!live}>
                <Play size={14} aria-hidden /> Resume
              </Button>
            ) : (
              <Button size="sm" variant="soft" onClick={() => sensor.freeze(pid)} disabled={!live}>
                <Snowflake size={14} aria-hidden /> Freeze
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              style={{ color: 'var(--glacier-danger-text)' }}
              onClick={() => {
                sensor.kill(pid);
                onClose();
              }}
              disabled={!live}
            >
              Quit
            </Button>
          </div>
          {!live && <p className="pfDetailSub">Actions work on the live system - jump back to Live first.</p>}
        </>
      )}
    </aside>
  );
}
