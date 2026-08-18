import { rms, type LoudnessMeter } from '@glacier/logic';

/**
 * Wires a Web Audio analyser onto a playing `<audio>` (or `<video>`) element and
 * hands back a loudness meter - the sampler `useLiveLevels` reads to build a
 * SeekBar's waveform while the track plays, instead of measuring the file up
 * front.
 *
 * Web only: the Web Audio API has no React Native equivalent, so a device build
 * feeds `useLiveLevels` from its own player's metering instead. The shared
 * bookkeeping lives in @glacier/logic, which is why only this thin adapter is
 * platform-specific.
 *
 * Two constraints the browser imposes, both easy to trip over:
 *
 * 1. **Call this inside a user gesture.** An `AudioContext` built before the
 *    first real interaction is created suspended, and on WebKit it can stay
 *    silent permanently even after `resume()`. Create the meter in the same
 *    handler that starts playback.
 * 2. **The audio must be CORS-clean.** Cross-origin media taints the graph and
 *    the analyser reads pure silence, with no error to tell you why. Set
 *    `crossOrigin="anonymous"` on the element and serve the audio with
 *    `Access-Control-Allow-Origin`.
 *
 * An element can only be connected to one source node for its lifetime, so the
 * returned meter is cached against the element and re-calling this is safe.
 */
/**
 * One element's seat at the mixer: the gain between its source node and the
 * analyser. Levels set here sit ahead of everything the graph does - the meter
 * reads them, the EQ shapes their sum, the deck bends it, the fader weighs it -
 * which is what makes two seats a crossfade rather than two players.
 */
export interface AnalyserMixSource {
  /** Sets this element's share of the mix, 0..1, immediately. */
  setLevel(level: number): void;
  /**
   * Glides this element's share to `level` over `seconds`, on the audio clock.
   * The path is the equal-power quarter-wave, so a pair of these - one rising,
   * one falling - holds the blend's loudness steady through the middle of a
   * crossfade instead of dipping there. A later `setLevel` or `fadeLevel`
   * supersedes whatever is still scheduled.
   */
  fadeLevel(level: number, seconds: number): void;
}

/**
 * The scratch surface: a hand on the platter, heard.
 *
 * A media element cannot play backwards, and seeking it repeatedly is a
 * decoder restart, not a scrub - so this is built the way a tape machine is.
 * A worklet sits in the graph just ahead of the deck and keeps a ring of the
 * last little while of everything that actually played. `hold` freezes the
 * tape and hands the output to a read head; `move` tells the head where the
 * hand is, and the head chases it - through a critically-damped spring, so
 * sixty pointer events a second read as one continuous motion rather than a
 * zipper - sounding the ring at whatever velocity the chase requires,
 * forwards or backwards, silent when the hand rests. `release` hands the
 * chain back to the live element.
 *
 * The capture point is ahead of the deck on purpose: the deck is where brakes
 * and spin-ups bend the signal, so the tape holds the song at true speed no
 * matter what the transport was doing to it.
 *
 * The caller owns the element: pause it when it calls `hold` (the tape
 * freezes either way, but a playing element would keep buying audio nobody
 * hears), and seek-then-play on `release` using the offset it returns.
 */
export interface AnalyserScrub {
  /**
   * True once the engine is standing: the worklet module loaded and the ring
   * is recording. False where AudioWorklet is missing, in which case every
   * other call is a safe no-op and `release` answers 0 - callers keep their
   * seek-only fallback.
   */
  ready(): boolean;
  /**
   * Grab the platter: freeze the tape and take over the chain's output.
   * `atSeconds` is where the song stands - the head's anchor, and what maps
   * both tapes onto the song's own clock.
   */
  hold(atSeconds: number): void;
  /**
   * Where the hand is, in seconds of song relative to the grab - negative is
   * back, positive forward. With the whole song loaded the head roams the
   * entire track; on the ring alone it can only reach what has played, and
   * parks at the tape's edge rather than reading fiction.
   */
  move(offsetSeconds: number): void;
  /** Where the head actually is right now, seconds relative to the grab. */
  offset(): number;
  /** Loudness of what the scrub is sounding, 0..1-ish - a liveness signal. */
  level(): number;
  /** Let go: hand the chain back to the element. Returns the settled offset,
   *  which is where the caller should land its seek. */
  release(): number;
  /**
   * Forget the ring. Call across every seek - its map onto the song's clock
   * broke with the jump. The whole-song tape is indexed absolutely and
   * survives; only `eject` drops it.
   */
  clear(): void;
  /**
   * Hand the engine the WHOLE song: mono PCM at `rate` covering `duration`
   * seconds from the top of the track. From then on the head roams the entire
   * file, both directions, the way a tape machine's does - this is what turns
   * "scratch what has played" into "scrub the record". The buffer is
   * transferred, not copied; the caller's copy is gone after this.
   */
  load(pcm: Float32Array, rate: number, duration: number): void;
  /** Whether a whole-song tape is loaded. */
  loaded(): boolean;
  /** A new source: drop the song tape AND the ring. */
  eject(): void;
  /** Dev: logs the engine's internals to the console, one line. */
  probe(): void;
}

export interface AnalyserMeter {
  /** Current loudness, 0..1. Safe to call at any rate. */
  meter: LoudnessMeter;
  /**
   * Instantaneous spectrum as `count` log-spaced bands, each 0..1, low to
   * high. Log-spaced because that is how the ear hears it: an octave per
   * band-ish, so bass does not eat the whole readout. Safe to call at any
   * rate; a silent or suspended graph reads all zeros.
   */
  spectrum(count: number): number[];
  /**
   * Seats another element at the same mixer - or returns the seat an element
   * already holds, including the one the meter was created on. The newcomer
   * plays through the whole shared chain: metered by the same analyser, shaped
   * by the same EQ, bent by the same deck, weighed by the same fader. This is
   * the crossfade primitive: two elements, two seats, one signal path.
   *
   * The same one-source-per-element rule applies as at creation: an element
   * seated here is spent, and belongs to this graph for the rest of its life.
   * Seating it at a second meter throws rather than going quietly silent.
   */
  addSource(element: HTMLMediaElement): AnalyserMixSource;
  /**
   * Evens out loud and quiet - night listening - with a gentle compressor
   * slipped in after the EQ. The analyser sits ahead of it, so the bar keeps
   * reading the track's real dynamics while the ear gets the tamed ones. Off
   * (the default) routes around it entirely: transparent means absent, not
   * merely configured quiet.
   */
  setDynamics(on: boolean): void;
  /**
   * Folds the channels together and plays the same signal to both ears. The
   * fold happens at the fader, past the meter and the shaping, so nothing else
   * changes - accessibility, or one earbud shared.
   */
  setMono(on: boolean): void;
  /**
   * Sets playback loudness, 0..1, on the gain that follows the analyser. The
   * meter reads the source ahead of it, so the fader changes how loud the track
   * is without changing how far the bar moves. Set 0 to silence playback while
   * still metering (gate the visual separately if a muted bar should rest).
   */
  setVolume(volume: number): void;
  /**
   * Glides the same gain to a target over `seconds`, scheduled on the audio
   * clock rather than stepped from JavaScript - the graph interpolates it
   * per sample, so a fade to silence is a fade, not a zipper. A later
   * `setVolume` or `rampVolume` supersedes whatever is still scheduled.
   */
  rampVolume(volume: number, seconds: number): void;
  /**
   * Glides playback speed to `to` (1 = as recorded) over `seconds`, dragging
   * pitch with it - a deck slowing to a stop, or picking back up.
   *
   * This is done in the graph rather than through the element's `playbackRate`,
   * which is the only other way to change the speed of a live stream and is a
   * poor one: it is the media engine's own resampler, it is re-tuned on every
   * write, and how it behaves across a pause differs by engine (WebKit will
   * quietly hand the rate back to its default). Here the speed is a property of
   * the audio graph, interpolated per sample on the audio thread, and does the
   * same thing on every engine.
   *
   * The glide is geometric: the speed moves by a constant factor per unit time,
   * so it travels the same number of semitones every step and is heard as one
   * even sweep. A later `rampSpeed` or `resetSpeed` supersedes it, picking up
   * from whatever speed the glide had reached.
   */
  rampSpeed(to: number, seconds: number): void;
  /**
   * Drops the lag the glides have built up and parks the deck at `speed`,
   * without gliding there.
   *
   * The lag is the mechanism: a stream is slowed by reading it through a delay
   * line that lengthens, so every glide below full speed leaves the graph
   * running that much behind the element - a fifth of a second across a stop
   * and a start, and it accumulates. Dropping it is a jump in the signal, so
   * call this only while nothing can be heard (paused, or faded out); the
   * `speed` it parks at is where the next glide will start from, since a delay
   * line of a fixed length has no speed of its own to hold.
   */
  resetSpeed(speed?: number): void;
  /** The scratch surface - see `AnalyserScrub`. Always present; where the
   * platform has no AudioWorklet it reports `ready() === false` and every
   * call is a safe no-op. */
  scrub: AnalyserScrub;
  /** The centre frequency (Hz) of each EQ band, low to high, index-aligned with
   * `setEqGains`. */
  eqFrequencies: readonly number[];
  /**
   * Sets the eight band gains, in dB, in `eqFrequencies` order.
   *
   * Boosts are paid for automatically: a broadband headroom stage after the
   * cascade attenuates by the curve's true combined maximum, so a +8dB preset
   * changes the shape of the sound without driving a 0dBFS master past the
   * DAC and into clipping. Flat costs nothing - the stage sits at unity.
   * All moves glide (~150ms); switching presets never clicks.
   */
  setEqGains(gains: readonly number[]): void;
  /**
   * Resumes the underlying AudioContext. A context built outside a user gesture
   * starts suspended, so metering (and, since the graph reaches the speakers,
   * playback itself) stays silent until this is called from within one - the
   * click that starts the track. WebKit also parks idle contexts in its
   * nonstandard 'interrupted' state; this wakes those too. Safe to call
   * repeatedly - call it on every play press, not just the first.
   */
  resume(): Promise<void>;
  /**
   * Tears the audio graph down. One way: routing an element through Web Audio
   * cannot be undone, and it may not be given a second source node, so the
   * element is silent afterwards and can never be metered again. Only reach for
   * this when the element is being thrown away with it.
   */
  dispose(): void;
}

/**
 * `createMediaElementSource` may be called once per element, for the whole life
 * of that element, so the graph is cached against the element itself rather
 * than in a map beside it.
 *
 * A module-scoped cache looks equivalent and is not: it is lost every time the
 * module is re-evaluated - a dev server's hot update, or this package resolved
 * twice in one page - while the element carries on holding the source node it
 * was handed. The next call then sees an element it has no record of, asks for
 * a second source node, and the browser throws `InvalidStateError` on what
 * looked like a fresh start. Keying off the global symbol registry means two
 * copies of this module still agree on where to look.
 */
const CACHE: unique symbol = Symbol.for('glacier.analyser-meter');
/**
 * The seat an element holds at some meter's mixer, cached on the element for
 * the same reason the meter itself is: the source node it wraps is issued once
 * per element, for life, and the record of that has to live somewhere a module
 * reload cannot lose.
 */
const SEAT: unique symbol = Symbol.for('glacier.analyser-meter.seat');

interface MeteredElement extends HTMLMediaElement {
  [CACHE]?: AnalyserMeter;
  [SEAT]?: { context: AudioContext; seat: AnalyserMixSource };
}

/** The EQ band centres in Hz, low to high. Standard octave-ish spacing that the
 * kit's AudioEqualizer defaults line up with. */
const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000] as const;
/** Every EQ move glides on this time constant - settled in ~150ms, never a
 *  step. Applies to the band gains and the headroom stage alike, so the two
 *  cannot be heard moving separately. */
const EQ_GLIDE = 0.03;
/** The bands' fixed Q. Restated here because the headroom math has to model
 *  the same filters the graph runs. */
const EQ_Q = 1;

/**
 * How much broadband attenuation a set of band gains needs so the shaped
 * signal cannot exceed the level it arrived at.
 *
 * The honest number is the maximum of the cascade's combined magnitude
 * response, not the loudest slider: at Q=1 adjacent bands overlap, so
 * [+8, +6, ...] on 32/64Hz sums past either value alone. Each band is the
 * Audio EQ Cookbook's peaking filter exactly as Web Audio implements it
 * (A = 10^(dB/40)), evaluated on a log grid and summed in dB; the maximum
 * positive excursion is what the headroom stage must absorb. Curves that
 * only cut return 0 - headroom only ever attenuates.
 *
 * ~150 grid points x 8 biquads per call, and it runs only when a preset or
 * slider changes: arithmetic noise, nothing worth caching.
 */
function eqHeadroomDb(gainsDb: readonly number[], sampleRate: number): number {
  let worst = 0;
  const floor = Math.log10(20);
  const span = Math.log10(Math.min(20000, sampleRate / 2) ) - floor;
  const POINTS = 160;
  for (let i = 0; i <= POINTS; i += 1) {
    const hz = 10 ** (floor + (span * i) / POINTS);
    const w = (2 * Math.PI * hz) / sampleRate;
    const cosW = Math.cos(w);
    const cos2W = Math.cos(2 * w);
    let db = 0;
    for (let band = 0; band < EQ_FREQUENCIES.length; band += 1) {
      const g = gainsDb[band] ?? 0;
      if (g === 0) continue;
      const w0 = (2 * Math.PI * EQ_FREQUENCIES[band]!) / sampleRate;
      const alpha = Math.sin(w0) / (2 * EQ_Q);
      const A = 10 ** (g / 40);
      const b0 = 1 + alpha * A;
      const b1 = -2 * Math.cos(w0);
      const b2 = 1 - alpha * A;
      const a0 = 1 + alpha / A;
      const a1 = b1;
      const a2 = 1 - alpha / A;
      const num = b0 * b0 + b1 * b1 + b2 * b2 + 2 * (b0 * b1 + b1 * b2) * cosW + 2 * b0 * b2 * cos2W;
      const den = a0 * a0 + a1 * a1 + a2 * a2 + 2 * (a0 * a1 + a1 * a2) * cosW + 2 * a0 * a2 * cos2W;
      db += 10 * Math.log10(num / den);
    }
    if (db > worst) worst = db;
  }
  return worst;
}

/**
 * How long a lag the deck may build up. A stop and a start together cost about
 * a fifth of a second, and the player drops it whenever it is silent, so this
 * is a ceiling on abuse rather than a working figure.
 */
const MAX_DELAY_SECONDS = 2;

/**
 * How much tape the scratch ring holds. The disc free-runs at a revolution
 * per six seconds, so this is seven-plus hard spins of reach - generous for a
 * scratch, and at 44.1kHz stereo about sixteen megabytes, allocated once and
 * kept. A figure chosen for the gesture, not the memory: a hand that winds
 * back further than this hits the tape's edge and holds there.
 */
const SCRUB_RING_SECONDS = 45;

/** The fastest the read head may travel, in multiples of real time. The same
 * order of "hyperspeed" a hard fast-wind gives a tape machine; past it the
 * output is ultrasonic squeal and aliasing, not scrubbing. */
const SCRUB_MAX_RATE = 12;

/**
 * The read head's whole physics, run per sample on the audio thread.
 *
 * The head chases the hand through a critically-damped spring (~30ms of
 * character). That lag is not a compromise, it is the mechanism: pointer
 * events arrive at 60-120Hz, so the hand's reported position is a staircase,
 * and a head glued straight to it would sound each step as a click. The
 * spring rides through the steps, and its velocity - which IS the playback
 * rate, and so the pitch - stays continuous.
 *
 * Kept as a registered-processor source string because a worklet runs off in
 * its own scope: it may import nothing and close over nothing, so a string
 * handed to `addModule` via a Blob URL is the honest shape of it.
 */
const SCRUB_PROCESSOR = `
class GlacierScrubDeck extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const seconds = (options && options.processorOptions && options.processorOptions.seconds) || 45;
    this.n = Math.ceil(sampleRate * seconds);
    this.ringL = new Float32Array(this.n);
    this.ringR = new Float32Array(this.n);
    this.w = 0;       // samples ever written; w % n is the write slot
    this.filled = 0;  // how much of the ring is real
    // The whole song, when the app has fetched and decoded it: mono PCM at its
    // own (usually lower) rate. With it the head roams the entire track; the
    // ring is the fallback for the first grab of a track, before it lands.
    this.tape = null;
    this.tapeRate = 1;
    this.tapeDur = 0;
    this.mix = 0;       // 0 = the live chain, 1 = the scrub voice
    this.mixTarget = 0;
    // The head runs in SONG SECONDS - one domain for both tapes, whatever
    // their sample rates. 1x is 1/sampleRate per rendered sample.
    this.anchor = 0;  // song time of the grab
    this.pos = 0;
    this.vel = 0;
    this.target = 0;
    this.holdW = 0;   // write head at the grab - the ring sample that IS anchor
    const maxRate = (options && options.processorOptions && options.processorOptions.maxRate) || 12;
    this.maxV = maxRate / sampleRate;
    this.port.onmessage = (e) => {
      const m = e.data;
      if (m.t === 'hold') {
        this.anchor = m.at || 0;
        this.pos = this.anchor;
        this.target = this.anchor;
        this.vel = 0;
        this.holdW = this.w;
        this.mixTarget = 1;
      } else if (m.t === 'move') {
        const asked = this.anchor + m.offset;
        const lo = this.tape ? 0 : this.anchor - this.filled / sampleRate;
        const hi = this.tape ? this.tapeDur : this.anchor;
        this.target = asked < lo ? lo : asked > hi ? hi : asked;
      } else if (m.t === 'release') {
        this.mixTarget = 0;
      } else if (m.t === 'clear') {
        // A seek broke the ring's map onto the song; the file tape is indexed
        // absolutely and survives it.
        this.filled = 0;
      } else if (m.t === 'tape') {
        this.tape = m.pcm;
        this.tapeRate = m.rate;
        this.tapeDur = m.duration;
      } else if (m.t === 'eject') {
        this.tape = null;
        this.tapeDur = 0;
        this.filled = 0;
        // Eject is a track change, and a held voice on a new source is never
        // right: a hold that outlives its song would mute every song after it
        // (the mix only ever comes back via release, and the release for this
        // hold may never arrive - the sheet closed mid-scratch, the skip
        // landed under a held finger). Dropping the hold here makes eject a
        // full reset of the scratch surface, which is what it always meant.
        this.mixTarget = 0;
        this.vel = 0;
        this.target = this.pos;
      } else if (m.t === 'probe') {
        this.port.postMessage({
          t: 'probed',
          w: this.w,
          filled: this.filled,
          mix: this.mix,
          pos: this.pos - this.anchor,
          target: this.target - this.anchor,
          vel: this.vel * sampleRate,
          tape: this.tape ? this.tapeDur : 0,
          inRms: this.inRms || 0,
          inChans: this.inChans === undefined ? -1 : this.inChans,
          rate: sampleRate,
        });
      }
    };
  }
  process(inputs, outputs) {
    const input = inputs[0];
    const out = outputs[0];
    const outL = out[0];
    const outR = out.length > 1 ? out[1] : out[0];
    const inL = input && input.length > 0 ? input[0] : null;
    const inR = input && input.length > 1 ? input[1] : inL;
    const frames = outL.length;
    this.inChans = input ? input.length : 0;
    if (inL) {
      let ie = 0;
      for (let i = 0; i < frames; i += 1) ie += inL[i] * inL[i];
      this.inRms = Math.sqrt(ie / frames);
    } else {
      this.inRms = 0;
    }
    // Critically damped spring, ~5.5Hz: tight enough to feel glued to the
    // finger, slow enough to swallow the pointer-event staircase.
    const w0 = (2 * Math.PI * 5.5) / sampleRate;
    const k = w0 * w0;
    const c = 2 * w0;
    const slew = 1 / (0.005 * sampleRate); // 5ms voice fade - the de-click
    const dt = 1 / sampleRate;
    let energy = 0;
    for (let i = 0; i < frames; i += 1) {
      const dryL = inL ? inL[i] : 0;
      const dryR = inR ? inR[i] : dryL;
      // The ring records only while the scrub voice is quiet: a held platter
      // is frozen, and writing during the release fade only ever writes the
      // silence of an element that has not resumed yet.
      if (this.mix < 0.5) {
        this.ringL[this.w % this.n] = dryL;
        this.ringR[this.w % this.n] = dryR;
        this.w += 1;
        if (this.filled < this.n) this.filled += 1;
      }
      this.vel += (this.target - this.pos) * k - this.vel * c;
      if (this.vel > this.maxV) this.vel = this.maxV;
      if (this.vel < -this.maxV) this.vel = -this.maxV;
      this.pos += this.vel;
      // The tape's edges: the head parks rather than reading fiction.
      const lo = this.tape ? 0 : this.anchor - this.filled / sampleRate;
      const hi = this.tape ? this.tapeDur : this.anchor;
      if (this.pos > hi) { this.pos = hi; if (this.vel > 0) this.vel = 0; }
      if (this.pos < lo) { this.pos = lo; if (this.vel < 0) this.vel = 0; }
      let wetL = 0;
      let wetR = 0;
      if (this.tape) {
        const idx = this.pos * this.tapeRate;
        const base = Math.floor(idx);
        if (base >= 0 && base < this.tape.length - 1) {
          const frac = idx - base;
          wetL = this.tape[base] * (1 - frac) + this.tape[base + 1] * frac;
          wetR = wetL;
        }
      } else if (this.filled > 1) {
        // Ring index: the sample written at the grab IS the anchor's moment,
        // and everything older sits behind it at the context rate.
        const back = (this.anchor - this.pos) * sampleRate;
        const abs = this.holdW - back;
        const base = Math.floor(abs);
        if (base >= this.holdW - this.filled && base < this.w - 1) {
          const frac = abs - base;
          const a = ((base % this.n) + this.n) % this.n;
          const b = (a + 1) % this.n;
          wetL = this.ringL[a] * (1 - frac) + this.ringL[b] * frac;
          wetR = this.ringR[a] * (1 - frac) + this.ringR[b] * frac;
        }
      }
      this.mix += this.mix < this.mixTarget
        ? Math.min(slew, this.mixTarget - this.mix)
        : -Math.min(slew, this.mix - this.mixTarget);
      const m = this.mix;
      const L = dryL * (1 - m) + wetL * m;
      const R = dryR * (1 - m) + wetR * m;
      outL[i] = L;
      if (outR !== outL) outR[i] = R;
      energy += L * L;
    }
    // The head's whereabouts, every quantum while the scrub voice sounds -
    // ~3ms of staleness at worst, which is what lets release() answer
    // synchronously from the main thread's mirror.
    if (this.mix > 0.001) {
      this.port.postMessage({
        t: 'head',
        offset: this.pos - this.anchor,
        level: Math.sqrt(energy / frames),
      });
    }
    return true;
  }
}
registerProcessor('glacier-scrub-deck', GlacierScrubDeck);
`;

/**
 * How many straight segments a glide is scheduled as. Each segment holds one
 * speed - the delay's slope is what the ear reads as pitch - so the glide is a
 * staircase, and this is how fine its steps are: over an octave, 128 of them is
 * a step of a tenth of a semitone every few milliseconds, which is heard as a
 * slide rather than as steps.
 *
 * Straight segments rather than one `setValueCurveAtTime`: a curve already
 * running cannot be reliably cut short (`cancelScheduledValues` leaves it
 * alone, and `cancelAndHoldAtTime` is not everywhere), and a deck whose stop
 * cannot be interrupted by a press is worse than a slightly stepped one.
 */
const SPEED_SEGMENTS = 128;

/**
 * The lag a glide has to build to be heard as a change of speed.
 *
 * Reading a signal through a delay line of length D(t) plays it back at speed
 * 1 - D'(t): stretch the line and the source is read more slowly than it
 * arrives, which is the slowdown, pitch and all. So a wanted speed p is a
 * wanted slope 1 - p, and the length is that slope's integral. For a geometric
 * glide - p(u) = from * (to/from)^(u/T), the even one - the integral is closed
 * form, which is why the glide is scheduled rather than stepped from a timer.
 *
 * Exported for the tests that hold this to its arithmetic; callers use
 * `rampSpeed`.
 */
export function speedGlideDelay(
  from: number,
  to: number,
  seconds: number,
  startDelay: number,
  atTime: number,
): number {
  const t = Math.min(Math.max(atTime, 0), seconds);
  const ratio = to / from;
  // A glide that goes nowhere still lags: the source is read slower than it
  // arrives for the whole of it.
  const travelled =
    ratio === 1 ? from * t : (from * seconds * (ratio ** (t / seconds) - 1)) / Math.log(ratio);
  return startDelay + t - travelled;
}

/** The speed a glide has reached, `atTime` seconds in. */
export function speedGlideSpeed(from: number, to: number, seconds: number, atTime: number): number {
  if (seconds <= 0) return to;
  const t = Math.min(Math.max(atTime, 0), seconds);
  return from * (to / from) ** (t / seconds);
}

/**
 * How many straight segments a level fade is scheduled as. A fade is a far
 * gentler curve than the deck's glide, and sixteen chords of a quarter-wave sit
 * within a fraction of a percent of it - the ear cannot find the corners.
 */
const FADE_SEGMENTS = 16;

/**
 * The level a fade has reached, `u` (0..1) of the way through.
 *
 * The path is the equal-power quarter-wave: a rising fade follows sin(u·π/2)
 * and a falling one cos(u·π/2), so sin² + cos² = 1 holds across a symmetric
 * pair and a crossfade's total loudness stays level through its middle. A
 * straight line dips there instead - two half-volume signals sum to about
 * -3dB, the hole in the middle every naive crossfade has.
 *
 * Exported for the tests that hold the pair to that identity; callers use
 * `fadeLevel` on a mix source.
 */
export function fadeShape(from: number, to: number, u: number): number {
  const t = Math.min(Math.max(u, 0), 1);
  if (to === from) return from;
  const rising = to > from;
  const shaped = rising ? Math.sin((t * Math.PI) / 2) : 1 - Math.cos((t * Math.PI) / 2);
  return from + (to - from) * shaped;
}

export function createAnalyserMeter(element: HTMLMediaElement): AnalyserMeter {
  const host = element as MeteredElement;
  const existing = host[CACHE];
  if (existing) return existing;
  // A seat without a meter of its own means the element already plays through
  // some other graph. Refuse before allocating a context for it: the same
  // error `addSource` throws, thrown while there is nothing to clean up.
  if (host[SEAT]) {
    throw new Error(
      'This element is already routed through another audio graph and cannot be metered twice.',
    );
  }

  const context = new AudioContext();
  const analyser = context.createAnalyser();
  // Small window: loudness, not spectral detail, and it keeps each read cheap.
  analyser.fftSize = 512;
  const buffer = new Float32Array(analyser.fftSize);

  /**
   * Seats an element at the mixer: its one-per-life source node feeding a gain
   * of its own, into the shared analyser. The gain is the seat - a crossfade is
   * two of these countersliding - and it opens at full so a lone element plays
   * exactly as it did before seats existed.
   */
  const seatElement = (el: HTMLMediaElement): AnalyserMixSource => {
    const seated = el as MeteredElement;
    const held = seated[SEAT];
    if (held) {
      if (held.context !== context) {
        throw new Error(
          'This element is already routed through another audio graph and cannot be seated twice.',
        );
      }
      return held.seat;
    }
    const src = context.createMediaElementSource(el);
    const mix = context.createGain();
    src.connect(mix);
    mix.connect(analyser);
    disposable.push(src, mix);
    const seat: AnalyserMixSource = {
      // The same discipline as the fader below: through the timeline, newest
      // instruction the only instruction.
      setLevel: (level: number) => {
        const now = context.currentTime;
        mix.gain.cancelScheduledValues(now);
        mix.gain.setValueAtTime(level < 0 ? 0 : level, now);
      },
      fadeLevel: (level: number, seconds: number) => {
        const now = context.currentTime;
        const from = mix.gain.value;
        const to = level < 0 ? 0 : level;
        const span = Math.max(0.01, seconds);
        mix.gain.cancelScheduledValues(now);
        mix.gain.setValueAtTime(from, now);
        // Chords of the quarter-wave rather than one setValueCurveAtTime: a
        // curve in flight cannot be reliably cut short, and a crossfade a
        // pause must be able to interrupt outranks a mathematically pure one.
        for (let i = 1; i <= FADE_SEGMENTS; i += 1) {
          mix.gain.linearRampToValueAtTime(
            fadeShape(from, to, i / FADE_SEGMENTS),
            now + (i / FADE_SEGMENTS) * span,
          );
        }
      },
    };
    seated[SEAT] = { context, seat };
    return seat;
  };

  // Everything seated or built here, torn down together in dispose.
  const disposable: AudioNode[] = [];

  // A peaking filter per band, chained after the analyser so the meter still
  // reads the raw source while the ear hears the shaped signal. Flat at 0dB, so
  // an untouched EQ is inaudible.
  const filters = EQ_FREQUENCIES.map((frequency) => {
    const filter = context.createBiquadFilter();
    filter.type = 'peaking';
    filter.frequency.value = frequency;
    filter.Q.value = 1;
    filter.gain.value = 0;
    return filter;
  });
  // A gain after the EQ carries the fader: the analyser reads the full source
  // ahead of both, so the bar moves the same at any playback volume, while the
  // gain sets how loud it actually is. The graph must reach the destination or
  // routing the element through it silences playback.
  const gain = context.createGain();
  // The deck. Between the EQ and the gain on purpose: the speed is a property
  // of the signal, so it sits with the rest of the shaping - but the fade has
  // to come after it, or a fade would be heard as late as the lag is long.
  //
  // `let`, because a flush REPLACES it. A DelayNode remembers the last two
  // seconds of everything that ever flowed through it, and the API has no way
  // to make it forget; a glide that grows the delay after a seek would read
  // that memory - the song from before the jump, played as if it belonged.
  // A fresh node's memory is silence, which is the only right thing for a
  // spin-up to find behind a discontinuity.
  let deck = context.createDelay(MAX_DELAY_SECONDS);
  const tail = filters.reduce<AudioNode>((node, filter) => {
    node.connect(filter);
    return filter;
  }, analyser);
  /*
   * The EQ's gain staging, and the reason presets are listenable at all.
   *
   * Peaking filters BOOST: +8dB of sub on a master already peaking at 0dBFS
   * puts the waveform 8dB past the only hard ceiling in the chain - the
   * DAC's clamp at the destination. Web Audio floats never clip inside the
   * graph, so the damage happens silently at the very last step, and it is
   * savage: measured on a bass-heavy 0dBFS signal, the stock "deep bass"
   * curve sent 49% of all samples past the ceiling. Every serious equalizer
   * pairs its bands with a broadband pre-attenuation for exactly this
   * reason; this node is ours.
   *
   * It holds 10^(-need/20), where `need` is the true maximum of the CASCADE's
   * combined response - computed, not read off the sliders, because at Q=1
   * neighbouring bands overlap: 32Hz at +8 and 64Hz at +6 sum to more than
   * either alone. A curve that only cuts needs nothing, and gets exactly
   * that - this stage only ever attenuates, so Flat stays bit-transparent.
   *
   * It also stands between the cascade and everything downstream so the
   * night-mode squeeze reroute (setDynamics) hangs off IT, not off the last
   * filter - otherwise toggling night mode would wire the EQ straight past
   * the headroom and bring the clipping back.
   */
  const shaped = context.createGain();
  tail.connect(shaped);
  // A fixed berth ahead of the deck. The shaping (the EQ tail, or the
  // leveller's make-up when night mode is routed in) always lands HERE, and
  // this always feeds whatever comes next - so the scratch engine, which
  // arrives asynchronously (its worklet module has to load), can slot itself
  // in behind it without every other reroute needing to know whether it made
  // it. Unity gain: a berth, not a control.
  const preDeck = context.createGain();
  // Whoever feeds the deck right now: the berth, or the scratch engine once
  // it has moored behind it. Tracked so a deck swap rewires the live path.
  let deckFeed: AudioNode = preDeck;
  shaped.connect(preDeck);
  preDeck.connect(deck);
  deck.connect(gain);
  gain.connect(context.destination);

  /** Replaces the deck with a fresh, empty one - the flush that forgets. */
  const swapDeck = () => {
    const fresh = context.createDelay(MAX_DELAY_SECONDS);
    try {
      deckFeed.disconnect(deck);
    } catch {
      // Already detached (mid-reroute); the fresh wiring below still stands.
    }
    deck.disconnect();
    deckFeed.connect(fresh);
    fresh.connect(gain);
    deck = fresh;
  };

  // The night-mode leveller, built now and routed in later: a gentle downward
  // squeeze with a touch of make-up so quiet passages come up more than loud
  // ones come down. It sits between the EQ and the deck - part of the shaping,
  // ahead of the fade - and off means routed around, not configured flat.
  const squeeze = context.createDynamicsCompressor();
  squeeze.threshold.value = -28;
  squeeze.knee.value = 24;
  squeeze.ratio.value = 3;
  squeeze.attack.value = 0.003;
  squeeze.release.value = 0.25;
  const makeup = context.createGain();
  makeup.gain.value = 1.3;
  squeeze.connect(makeup);
  let squeezing = false;

  // The primary element takes the first seat, at full - alone, the mixer is
  // inaudible and the graph behaves exactly as it did before seats existed.
  seatElement(element);

  // ── The scratch engine ────────────────────────────────────────────────────
  //
  // Built in the background: `addModule` is async, so the meter stands up
  // without it and the engine moors behind the berth when its module lands -
  // usually within the same gesture that created the meter, well before any
  // hand reaches the platter. Until then (and forever, where AudioWorklet
  // does not exist) `scrub.ready()` is false and callers keep their fallback.
  //
  // The head's whereabouts are mirrored here off the worklet's per-quantum
  // reports, which is what lets `offset` and `release` answer synchronously -
  // at most one render quantum (~3ms) stale, inside any gesture's noise.
  let scrubNode: AudioWorkletNode | null = null;
  let scrubReady = false;
  let scrubLoaded = false;
  let scrubHead = 0;
  let scrubLevel = 0;
  const workletHost = context.audioWorklet;
  if (
    workletHost &&
    typeof AudioWorkletNode !== 'undefined' &&
    typeof Blob !== 'undefined' &&
    typeof URL.createObjectURL === 'function'
  ) {
    // A Blob URL because a worklet loads as its own module, importing nothing
    // and closing over nothing - shipping it as a source string keeps the kit
    // a plain library with no asset pipeline behind it.
    const moduleUrl = URL.createObjectURL(
      new Blob([SCRUB_PROCESSOR], { type: 'application/javascript' }),
    );
    void workletHost
      .addModule(moduleUrl)
      .then(() => {
        const node = new AudioWorkletNode(context, 'glacier-scrub-deck', {
          numberOfInputs: 1,
          numberOfOutputs: 1,
          outputChannelCount: [2],
          processorOptions: { seconds: SCRUB_RING_SECONDS, maxRate: SCRUB_MAX_RATE },
        });
        node.port.onmessage = (event: MessageEvent) => {
          const m = event.data as { t?: string; offset?: number; level?: number };
          if (m?.t === 'head') {
            scrubHead = m.offset ?? 0;
            scrubLevel = m.level ?? 0;
          } else if (m?.t === 'probed') {
            // Dev probe: one line, everything the engine knows about itself.
            console.log('[glacier scrub]', JSON.stringify(m));
          }
        };
        // Moor it behind the berth: berth → engine → deck. One rewire, once,
        // almost always before anything plays; the berth is what spares every
        // other reroute from caring whether this line ever ran.
        preDeck.disconnect();
        preDeck.connect(node);
        node.connect(deck);
        deckFeed = node;
        disposable.push(node);
        scrubNode = node;
        scrubReady = true;
      })
      .catch(() => {
        // No module, no scratch; the seek-only fallback stands.
      })
      .finally(() => URL.revokeObjectURL(moduleUrl));
  }

  // The glide in flight, as the numbers that describe it. The delay line holds
  // the length; only this holds the speed, which is the length's slope and so
  // is not a thing the graph can be asked for.
  let glideFrom = 1;
  let glideTo = 1;
  let glideStart = context.currentTime;
  let glideSeconds = 0;

  // Scratch space for spectrum reads, sized to the analyser's bin count and
  // reused across calls - a per-frame reader must not allocate per frame.
  const spectrumBins = new Uint8Array(analyser.frequencyBinCount);

  const created: AnalyserMeter = {
    meter: () => {
      analyser.getFloatTimeDomainData(buffer);
      return rms(buffer);
    },
    spectrum: (count: number) => {
      const bands = Math.max(1, Math.floor(count));
      analyser.getByteFrequencyData(spectrumBins);
      // Log-spaced edges across the useful range: the first bin is DC and
      // skipped, the top of the range is the last bin. Each band averages
      // the bins under it; a band narrower than one bin reads that bin.
      const top = spectrumBins.length;
      const result: number[] = [];
      for (let i = 0; i < bands; i += 1) {
        const from = Math.max(1, Math.round(top ** (i / bands)));
        const to = Math.max(from + 1, Math.round(top ** ((i + 1) / bands)));
        let sum = 0;
        for (let bin = from; bin < Math.min(to, top); bin += 1) sum += spectrumBins[bin] ?? 0;
        result.push(sum / (Math.min(to, top) - from) / 255);
      }
      return result;
    },
    // Both writes go through the automation timeline rather than `.value`: a
    // bare value write loses to any ramp still scheduled, so a fader moved
    // mid-fade would silently not move. Cancelling first makes the newest
    // instruction the only instruction.
    setVolume: (volume: number) => {
      const now = context.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(volume < 0 ? 0 : volume, now);
    },
    rampVolume: (volume: number, seconds: number) => {
      const now = context.currentTime;
      gain.gain.cancelScheduledValues(now);
      // Anchor the ramp at the value sounding right now, or it has nothing to
      // slope from and steps instead.
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(volume < 0 ? 0 : volume, now + Math.max(0.01, seconds));
    },
    rampSpeed: (to: number, seconds: number) => {
      const now = context.currentTime;
      // The length comes from the graph and the speed from the model: the
      // length is what the next glide must start from without a step in it,
      // and the speed is what it must start from without a jump in pitch.
      const startDelay = deck.delayTime.value;
      const speed = speedGlideSpeed(glideFrom, glideTo, glideSeconds, now - glideStart);
      // A deck at a standstill is silence, not a signal, and a delay line
      // asked for it would grow without end.
      const target = Math.max(0.05, to);
      const span = Math.max(0.01, seconds);
      deck.delayTime.cancelScheduledValues(now);
      deck.delayTime.setValueAtTime(startDelay, now);
      for (let i = 1; i <= SPEED_SEGMENTS; i += 1) {
        const at = (i / SPEED_SEGMENTS) * span;
        const length = speedGlideDelay(speed, target, span, startDelay, at);
        // The ceiling is a safety valve, not a working limit: hitting it means
        // the lag was never dropped, and holding the length is at least a
        // return to full speed rather than a silent line.
        deck.delayTime.linearRampToValueAtTime(Math.min(length, MAX_DELAY_SECONDS - 0.05), now + at);
      }
      glideFrom = speed;
      glideTo = target;
      glideStart = now;
      glideSeconds = span;
    },
    resetSpeed: (speed = 1) => {
      // Not merely delayTime back to zero: the whole node is replaced, so the
      // line forgets what played before the reset. Zeroing the length still
      // leaves the ring holding the pre-reset song, and the next glide to
      // grow the delay would read it back out - a blip of wherever playback
      // WAS after every seek or pause, instead of silence.
      swapDeck();
      const now = context.currentTime;
      glideFrom = speed;
      glideTo = speed;
      glideStart = now;
      glideSeconds = 0;
    },
    addSource: seatElement,
    scrub: {
      ready: () => scrubReady,
      hold: (atSeconds: number) => {
        // The mirror resets with the grab: a release read before the first
        // report must answer "you have not moved", not last scratch's landing.
        scrubHead = 0;
        scrubLevel = 0;
        scrubNode?.port.postMessage({ t: 'hold', at: atSeconds });
      },
      move: (offsetSeconds: number) => {
        scrubNode?.port.postMessage({ t: 'move', offset: offsetSeconds });
      },
      offset: () => scrubHead,
      level: () => scrubLevel,
      release: () => {
        const settled = scrubHead;
        scrubNode?.port.postMessage({ t: 'release' });
        return settled;
      },
      clear: () => {
        scrubNode?.port.postMessage({ t: 'clear' });
      },
      load: (pcm: Float32Array, rate: number, duration: number) => {
        if (!scrubNode) return;
        scrubLoaded = true;
        scrubNode.port.postMessage({ t: 'tape', pcm, rate, duration }, [pcm.buffer]);
      },
      loaded: () => scrubLoaded,
      eject: () => {
        scrubLoaded = false;
        scrubNode?.port.postMessage({ t: 'eject' });
      },
      probe: () => {
        scrubNode?.port.postMessage({ t: 'probe' });
      },
    },
    setDynamics: (on: boolean) => {
      if (on === squeezing) return;
      squeezing = on;
      // Rerouting rather than zeroing: a compressor "set flat" still colours
      // the signal, and absent is the only honest off. The tail's one output
      // is whichever of these it was given, so a bare disconnect is exact.
      // Both routes land on the berth, so neither needs to know whether the
      // scratch engine (or a deck swap) has rewired what follows it.
      shaped.disconnect();
      if (on) {
        shaped.connect(squeeze);
        makeup.connect(preDeck);
      } else {
        // Bare, not disconnect(preDeck): the berth is make-up's only output,
        // so the two are the same while the graph is alive - but the targeted
        // form throws once dispose has severed it, and a disposed meter is
        // supposed to go quiet, not loud.
        makeup.disconnect();
        shaped.connect(preDeck);
      }
    },
    setMono: (on: boolean) => {
      // The fold costs no nodes: the fader is made to downmix by constraint.
      // Mono at one channel, the destination fans it back to both ears.
      gain.channelCountMode = on ? 'explicit' : 'max';
      gain.channelCount = on ? 1 : 2;
    },
    eqFrequencies: EQ_FREQUENCIES,
    setEqGains: (gains: readonly number[]) => {
      const at = context.currentTime;
      filters.forEach((filter, index) => {
        const value = gains[index];
        if (typeof value === 'number' && Number.isFinite(value)) {
          // A glide, not an assignment: stepping a filter's gain mid-signal
          // is a discontinuity, heard as a click on every preset change.
          filter.gain.cancelScheduledValues(at);
          filter.gain.setTargetAtTime(value, at, EQ_GLIDE);
        }
      });
      const need = eqHeadroomDb(
        filters.map((filter, index) => {
          const value = gains[index];
          return typeof value === 'number' && Number.isFinite(value) ? value : filter.gain.value;
        }),
        context.sampleRate,
      );
      shaped.gain.cancelScheduledValues(at);
      shaped.gain.setTargetAtTime(10 ** (-need / 20), at, EQ_GLIDE);
    },
    // Anything short of running gets a resume, not just 'suspended': WebKit
    // parks a long-idle context in its own 'interrupted' state (App Nap, the
    // OS taking the output away), which the standard state union does not
    // name. Matching 'suspended' alone left an interrupted context untouched,
    // so a track played after the app sat idle advanced in silence - the
    // whole graph reaches the speakers through this context. A closed context
    // is the one thing resume() cannot help; that rejection is not worth
    // surfacing to a play press.
    resume: () =>
      context.state === 'running' || context.state === 'closed'
        ? Promise.resolve()
        : context.resume().catch(() => {}),
    // The entry stays put: the element is spent either way, and the record of
    // that is the only thing standing between a later call and a throw. Reading
    // a closed context leaves the buffer untouched, so a disposed meter reports
    // silence rather than failing.
    dispose: () => {
      disposable.forEach((node) => node.disconnect());
      analyser.disconnect();
      filters.forEach((filter) => filter.disconnect());
      squeeze.disconnect();
      makeup.disconnect();
      shaped.disconnect();
      preDeck.disconnect();
      // The port as well as the node: a worklet with an open port is kept
      // alive by it, tape and all, after the graph around it has gone.
      scrubNode?.port.close();
      scrubReady = false;
      deck.disconnect();
      gain.disconnect();
      void context.close();
    },
  };
  host[CACHE] = created;
  return created;
}
