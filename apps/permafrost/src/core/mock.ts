import type {
  MachineFacts,
  ProcessInfo,
  ProcessSample,
  ProcessState,
  RecorderMarker,
  Sensor,
  SystemSample,
} from './types.ts';

/**
 * The deterministic mock sensor. Every sample is a pure function of the tick
 * index and the seed - reload the app and the same fifteen minutes of history
 * come back - while freeze/resume/kill mutate only future ticks, exactly like
 * the real actuators will.
 */

const GB = 1024 ** 3;
const MB = 1024 ** 2;
const KB = 1024;

const CORES = 8;
const MEM_TOTAL = 32 * GB;
/** Ticks backfilled at construction: 15 minutes of 1 Hz history. */
const BACKFILL = 900;
/** Ring capacity: half an hour, then the oldest second falls off. */
const CAPACITY = 1800;

// ---- deterministic noise ----------------------------------------------------

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth cheap 1D noise: three incommensurate sines with seeded phases. */
function makeWave(seed: number): (t: number) => number {
  const rng = mulberry32(seed);
  const p1 = rng() * Math.PI * 2;
  const p2 = rng() * Math.PI * 2;
  const p3 = rng() * Math.PI * 2;
  const f1 = 1 / (35 + rng() * 40);
  const f2 = 1 / (9 + rng() * 12);
  const f3 = 1 / (2.2 + rng() * 2);
  return (t) =>
    (Math.sin(t * f1 * Math.PI * 2 + p1) * 0.55 +
      Math.sin(t * f2 * Math.PI * 2 + p2) * 0.3 +
      Math.sin(t * f3 * Math.PI * 2 + p3) * 0.15 +
      1) /
    2; // 0..1
}

// ---- the cast of processes --------------------------------------------------

interface Archetype extends ProcessInfo {
  /** Rest-state CPU as % of one core, and how far the wave swings it. */
  cpu: number;
  cpuSwing: number;
  /** Resident memory base, bytes. */
  mem: number;
  memSwing: number;
  threads: number;
  netIn?: number;
  netOut?: number;
  diskRead?: number;
  diskWrite?: number;
  /** A deterministic burst: period and duration in ticks, cpu at full burst. */
  burst?: { period: number; duration: number; cpu: number; diskWrite?: number; label?: string; tone?: RecorderMarker['tone'] };
}

const CAST: Archetype[] = [
  { pid: 0, name: 'kernel_task', user: 'root', kind: 'kernel', cpu: 18, cpuSwing: 14, mem: 2.1 * GB, memSwing: 0.05 * GB, threads: 480 },
  { pid: 88, name: 'WindowServer', user: '_windowserver', kind: 'daemon', cpu: 22, cpuSwing: 26, mem: 1.2 * GB, memSwing: 0.2 * GB, threads: 24 },
  { pid: 101, name: 'launchd', user: 'root', kind: 'daemon', cpu: 0.4, cpuSwing: 0.8, mem: 48 * MB, memSwing: 4 * MB, threads: 5 },
  { pid: 233, name: 'coreaudiod', user: '_coreaudiod', kind: 'daemon', cpu: 2.1, cpuSwing: 2.4, mem: 88 * MB, memSwing: 8 * MB, threads: 9 },
  { pid: 312, name: 'mds_stores', user: 'root', kind: 'daemon', cpu: 1.2, cpuSwing: 6, mem: 320 * MB, memSwing: 120 * MB, threads: 12, diskRead: 2 * MB, burst: { period: 480, duration: 70, cpu: 92, label: 'Spotlight indexing', tone: 'accent' } },
  { pid: 340, name: 'backupd', user: 'root', kind: 'daemon', cpu: 0.6, cpuSwing: 1, mem: 96 * MB, memSwing: 10 * MB, threads: 8, burst: { period: 900, duration: 160, cpu: 34, diskWrite: 190 * MB, label: 'Time Machine backup', tone: 'warning' } },
  { pid: 401, name: 'Permafrost', user: 'matt', kind: 'app', cpu: 3.2, cpuSwing: 2.2, mem: 240 * MB, memSwing: 30 * MB, threads: 21, parent: 'Permafrost' },
  { pid: 512, name: 'Chromium', user: 'matt', kind: 'app', cpu: 12, cpuSwing: 10, mem: 900 * MB, memSwing: 150 * MB, threads: 42, netIn: 400 * KB, netOut: 60 * KB },
  { pid: 513, name: 'Chromium Helper (GPU)', user: 'matt', kind: 'helper', parent: 'Chromium', cpu: 9, cpuSwing: 14, mem: 620 * MB, memSwing: 80 * MB, threads: 18, burst: { period: 620, duration: 14, cpu: 320, label: 'GPU helper spike', tone: 'danger' } },
  { pid: 514, name: 'Chromium Helper (Renderer)', user: 'matt', kind: 'helper', parent: 'Chromium', cpu: 7, cpuSwing: 12, mem: 480 * MB, memSwing: 60 * MB, threads: 16, netIn: 900 * KB },
  { pid: 515, name: 'Chromium Helper (Renderer)', user: 'matt', kind: 'helper', parent: 'Chromium', cpu: 4, cpuSwing: 9, mem: 1.6 * GB, memSwing: 700 * MB, threads: 15, netIn: 250 * KB },
  { pid: 516, name: 'Chromium Helper (Renderer)', user: 'matt', kind: 'helper', parent: 'Chromium', cpu: 2.4, cpuSwing: 5, mem: 380 * MB, memSwing: 40 * MB, threads: 14 },
  { pid: 620, name: 'Code Helper (Plugin)', user: 'matt', kind: 'helper', parent: 'VS Code', cpu: 6, cpuSwing: 9, mem: 720 * MB, memSwing: 90 * MB, threads: 22 },
  { pid: 621, name: 'VS Code', user: 'matt', kind: 'app', cpu: 5, cpuSwing: 6, mem: 540 * MB, memSwing: 60 * MB, threads: 30 },
  { pid: 700, name: 'node (vite dev)', user: 'matt', kind: 'app', cpu: 8, cpuSwing: 22, mem: 460 * MB, memSwing: 120 * MB, threads: 12, netOut: 3 * MB },
  { pid: 701, name: 'cargo build', user: 'matt', kind: 'app', cpu: 2, cpuSwing: 4, mem: 380 * MB, memSwing: 200 * MB, threads: 10, burst: { period: 420, duration: 95, cpu: 540, label: 'Build started', tone: 'accent' } },
  { pid: 730, name: 'Docker VM', user: 'matt', kind: 'app', cpu: 14, cpuSwing: 8, mem: 3.8 * GB, memSwing: 0.3 * GB, threads: 64, netIn: 120 * KB, netOut: 90 * KB, diskRead: 4 * MB, diskWrite: 2 * MB },
  { pid: 810, name: 'Music', user: 'matt', kind: 'app', cpu: 4.5, cpuSwing: 3, mem: 480 * MB, memSwing: 40 * MB, threads: 26, netIn: 320 * KB },
  { pid: 833, name: 'CloudSync agent', user: 'matt', kind: 'daemon', cpu: 1.4, cpuSwing: 5, mem: 210 * MB, memSwing: 40 * MB, threads: 14, netOut: 1.2 * MB, netIn: 200 * KB },
  { pid: 900, name: 'Terminal', user: 'matt', kind: 'app', cpu: 1.1, cpuSwing: 1.6, mem: 160 * MB, memSwing: 20 * MB, threads: 10 },
  { pid: 940, name: 'Mail', user: 'matt', kind: 'app', cpu: 1.8, cpuSwing: 2.8, mem: 420 * MB, memSwing: 50 * MB, threads: 20, netIn: 80 * KB },
  { pid: 951, name: 'Messages', user: 'matt', kind: 'app', cpu: 0.9, cpuSwing: 1.4, mem: 260 * MB, memSwing: 25 * MB, threads: 16 },
  { pid: 970, name: 'ollama serve', user: 'matt', kind: 'daemon', cpu: 3, cpuSwing: 30, mem: 5.2 * GB, memSwing: 1.4 * GB, threads: 28 },
  { pid: 990, name: 'mdworker_shared', user: 'matt', kind: 'daemon', cpu: 0.8, cpuSwing: 3.5, mem: 90 * MB, memSwing: 30 * MB, threads: 6 },
  { pid: 1004, name: 'bird', user: 'matt', kind: 'daemon', cpu: 0.5, cpuSwing: 2, mem: 130 * MB, memSwing: 20 * MB, threads: 9, netOut: 240 * KB },
  { pid: 1010, name: 'photolibraryd', user: 'matt', kind: 'daemon', cpu: 0.7, cpuSwing: 4, mem: 300 * MB, memSwing: 60 * MB, threads: 11 },
];

// ---- the engine --------------------------------------------------------------

interface Intervention {
  state: ProcessState;
  /** Tick index the intervention takes effect. */
  from: number;
}

export class MockSensor implements Sensor {
  readonly machine: MachineFacts = { cores: CORES, memTotal: MEM_TOTAL, hostname: 'glacier.local' };

  private ring: SystemSample[] = [];
  private marks: RecorderMarker[] = [];
  private listeners = new Set<() => void>();
  private interventions = new Map<number, Intervention[]>();
  private waves = new Map<string, (t: number) => number>();
  private epoch: number; // epoch ms of tick 0
  private tick = 0;
  private timer: ReturnType<typeof setInterval> | undefined;
  private pressureWasHigh = false;

  constructor(seed = 47) {
    let w = 0;
    for (const p of CAST) {
      this.waves.set(`cpu:${p.pid}`, makeWave(seed + 100 + w));
      this.waves.set(`mem:${p.pid}`, makeWave(seed + 500 + w));
      this.waves.set(`io:${p.pid}`, makeWave(seed + 900 + w));
      w += 3;
    }
    for (let c = 0; c < CORES; c++) this.waves.set(`core:${c}`, makeWave(seed + 2000 + c));

    // Backfill: the recorder was already running when the window opened.
    this.epoch = Date.now() - BACKFILL * 1000;
    for (let t = 0; t < BACKFILL; t++) this.append(this.sample(t));
    this.tick = BACKFILL;
  }

  /** Begin (or resume) the 1 Hz live tick. Idempotent, so StrictMode's
      mount-unmount-mount cycle restarts the clock instead of killing it. */
  start() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.append(this.sample(this.tick));
      this.tick += 1;
      for (const fn of this.listeners) fn();
    }, 1000);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }

  // ---- Sensor ----

  window() {
    const ring = this.ring;
    return { start: ring[0]?.time ?? this.epoch, end: ring[ring.length - 1]?.time ?? this.epoch };
  }

  latest(): SystemSample {
    return this.ring[this.ring.length - 1];
  }

  at(time: number): SystemSample {
    const ring = this.ring;
    if (ring.length === 0) throw new Error('no samples');
    const i = Math.round((time - ring[0].time) / 1000);
    return ring[Math.min(Math.max(i, 0), ring.length - 1)];
  }

  samples(): readonly SystemSample[] {
    return this.ring;
  }

  markers(): readonly RecorderMarker[] {
    return this.marks;
  }

  info(pid: number): ProcessInfo | undefined {
    const a = CAST.find((p) => p.pid === pid);
    return a && { pid: a.pid, name: a.name, user: a.user, kind: a.kind, parent: a.parent };
  }

  freeze(pid: number) {
    this.intervene(pid, 'frozen');
  }

  resume(pid: number) {
    this.intervene(pid, 'running');
  }

  kill(pid: number) {
    this.intervene(pid, 'terminated');
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // ---- generation ----

  private intervene(pid: number, state: ProcessState) {
    // Effective from the newest recorded tick (tick - 1), so regenerating that
    // sample below reflects the action on the next paint, not a second later.
    const list = this.interventions.get(pid) ?? [];
    list.push({ state, from: this.tick - 1 });
    this.interventions.set(pid, list);
    if (this.ring.length > 0) {
      this.ring[this.ring.length - 1] = this.sample(this.tick - 1);
      for (const fn of this.listeners) fn();
    }
  }

  private stateAt(pid: number, t: number): ProcessState {
    const list = this.interventions.get(pid);
    if (!list) return 'running';
    let state: ProcessState = 'running';
    for (const iv of list) if (iv.from <= t) state = iv.state;
    return state;
  }

  private burstPhase(a: Archetype, t: number): number {
    if (!a.burst) return 0;
    const into = t % a.burst.period;
    if (into >= a.burst.duration) return 0;
    // ramp up fast, fade at the tail
    const f = into / a.burst.duration;
    return f < 0.1 ? f / 0.1 : f > 0.85 ? (1 - f) / 0.15 : 1;
  }

  private sample(t: number): SystemSample {
    const time = this.epoch + t * 1000;
    const processes: ProcessSample[] = [];
    let cpuSum = 0;
    let memSum = 4.6 * GB; // wired + compressed floor
    let netIn = 60 * KB;
    let netOut = 30 * KB;
    let diskRead = 300 * KB;
    let diskWrite = 200 * KB;

    for (const a of CAST) {
      const state = this.stateAt(a.pid, t);
      if (state === 'terminated') continue;

      const wCpu = this.waves.get(`cpu:${a.pid}`)!(t);
      const wMem = this.waves.get(`mem:${a.pid}`)!(t);
      const wIo = this.waves.get(`io:${a.pid}`)!(t);
      const burst = this.burstPhase(a, t);

      let cpu = state === 'frozen' ? 0 : Math.max(a.cpu + (wCpu - 0.5) * 2 * a.cpuSwing, 0);
      if (state !== 'frozen' && a.burst) cpu += burst * a.burst.cpu;
      const mem = Math.max(a.mem + (wMem - 0.5) * 2 * a.memSwing, 16 * MB);
      const pIn = (a.netIn ?? 0) * (0.4 + wIo * 1.2) * (state === 'frozen' ? 0 : 1);
      const pOut = (a.netOut ?? 0) * (0.4 + wIo * 1.2) * (state === 'frozen' ? 0 : 1);
      const pRead = (a.diskRead ?? 0) * (0.3 + wIo * 1.4) * (state === 'frozen' ? 0 : 1);
      let pWrite = (a.diskWrite ?? 0) * (0.3 + wIo * 1.4) * (state === 'frozen' ? 0 : 1);
      if (state !== 'frozen' && a.burst?.diskWrite) pWrite += burst * a.burst.diskWrite;

      cpuSum += cpu;
      memSum += mem;
      netIn += pIn;
      netOut += pOut;
      diskRead += pRead;
      diskWrite += pWrite;

      processes.push({
        pid: a.pid,
        cpu,
        mem,
        threads: state === 'frozen' ? a.threads : Math.round(a.threads * (0.9 + wCpu * 0.2)),
        energy: cpu * 0.85 + pOut / MB + pWrite / (4 * MB),
        diskRead: pRead,
        diskWrite: pWrite,
        netIn: pIn,
        netOut: pOut,
        state,
      });
    }

    const capacity = CORES * 100;
    const totalPct = Math.min((cpuSum / capacity) * 100, 100);
    const cpuSystem = totalPct * 0.32;
    const cpuUser = totalPct - cpuSystem;

    const coreLoads = Array.from({ length: CORES }, (_, c) => {
      const w = this.waves.get(`core:${c}`)!(t);
      const skew = 0.55 + w * 0.9; // efficiency vs performance cores drift apart
      return Math.min(totalPct * skew, 100);
    });

    const memUsed = Math.min(memSum, MEM_TOTAL * 0.97);
    const memPressure = Math.min((memUsed / MEM_TOTAL) * 1.15, 1);

    // markers: flag what a human would want to scrub back to
    if (t > 0) {
      for (const a of CAST) {
        if (!a.burst?.label) continue;
        if (t % a.burst.period === 0 && this.stateAt(a.pid, t) !== 'terminated') {
          this.marks.push({ time, tone: a.burst.tone ?? 'accent', label: a.burst.label });
        }
      }
      const high = memPressure > 0.78;
      if (high && !this.pressureWasHigh) this.marks.push({ time, tone: 'warning', label: 'Memory pressure elevated' });
      this.pressureWasHigh = high;
    }

    return {
      time,
      cpuUser,
      cpuSystem,
      coreLoads,
      memUsed,
      swapUsed: Math.max((memPressure - 0.6) * 8 * GB, 0),
      memPressure,
      netIn,
      netOut,
      diskRead,
      diskWrite,
      processes,
    };
  }

  private append(s: SystemSample) {
    this.ring.push(s);
    if (this.ring.length > CAPACITY) this.ring.shift();
    const cutoff = this.ring[0]?.time ?? 0;
    if (this.marks.length && this.marks[0].time < cutoff) {
      this.marks = this.marks.filter((m) => m.time >= cutoff);
    }
  }
}
