/**
 * The sensor contract. This mirrors the planned Rust `Sensor`/`Actuator`
 * traits one-for-one: the UI talks only to this interface, so swapping the
 * deterministic mock for the Tauri-backed native sensor is a one-file change.
 */

export type ProcessState = 'running' | 'frozen' | 'terminated';

export type ProcessKind = 'app' | 'helper' | 'daemon' | 'kernel';

/** Identity facts about a process that never change tick to tick. */
export interface ProcessInfo {
  pid: number;
  name: string;
  user: string;
  kind: ProcessKind;
  /** Parent app name for helpers, e.g. the browser owning a renderer. */
  parent?: string;
}

/** One process's measurements at one tick. */
export interface ProcessSample {
  pid: number;
  /** Percent of one core, so multi-threaded work exceeds 100. */
  cpu: number;
  /** Resident memory, bytes. */
  mem: number;
  threads: number;
  /** Energy impact, an Activity-Monitor-style 0-100+ figure. */
  energy: number;
  /** Disk throughput, bytes per second. */
  diskRead: number;
  diskWrite: number;
  /** Network throughput, bytes per second. */
  netIn: number;
  netOut: number;
  state: ProcessState;
}

/** The whole machine at one tick. */
export interface SystemSample {
  /** Epoch milliseconds. */
  time: number;
  /** Percent of total capacity, 0-100 each. */
  cpuUser: number;
  cpuSystem: number;
  /** Per-core load, 0-100 each. */
  coreLoads: number[];
  /** Bytes. */
  memUsed: number;
  swapUsed: number;
  /** 0-1; green below 0.5, yellow below 0.8, red above. */
  memPressure: number;
  /** Bytes per second, whole machine. */
  netIn: number;
  netOut: number;
  diskRead: number;
  diskWrite: number;
  processes: ProcessSample[];
}

/** A flagged instant on the recording, rendered as a scrubber tick. */
export interface RecorderMarker {
  time: number;
  tone: 'accent' | 'warning' | 'danger';
  label: string;
}

/** What the platform reports about itself once. */
export interface MachineFacts {
  cores: number;
  memTotal: number;
  hostname: string;
}

export interface Sensor {
  readonly machine: MachineFacts;
  /** The recorded window: [start, end]. End advances every tick while live. */
  window(): { start: number; end: number };
  /** The newest sample. */
  latest(): SystemSample;
  /** The recorded sample nearest to a time inside the window. */
  at(time: number): SystemSample;
  /** The whole ring, oldest first. */
  samples(): readonly SystemSample[];
  markers(): readonly RecorderMarker[];
  info(pid: number): ProcessInfo | undefined;
  /** Actuators. The mock applies them from the next tick on, like the real one. */
  freeze(pid: number): void;
  resume(pid: number): void;
  kill(pid: number): void;
  /** Notifies after every appended tick. Returns the unsubscribe. */
  subscribe(listener: () => void): () => void;
}
