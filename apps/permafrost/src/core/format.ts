const KB = 1024;
const MB = 1024 ** 2;
const GB = 1024 ** 3;

export function fmtBytes(v: number): string {
  if (v >= GB) return `${(v / GB).toFixed(v >= 10 * GB ? 0 : 1)} GB`;
  if (v >= MB) return `${(v / MB).toFixed(v >= 100 * MB ? 0 : 1)} MB`;
  if (v >= KB) return `${Math.round(v / KB)} KB`;
  return `${Math.round(v)} B`;
}

export function fmtRate(v: number): string {
  return `${fmtBytes(v)}/s`;
}

export function fmtPct(v: number): string {
  return `${v >= 100 ? Math.round(v) : v.toFixed(1)}%`;
}

export function fmtClock(time: number): string {
  return new Date(time).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}
