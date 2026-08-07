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

export interface AnalyserMeter {
  /** Current loudness, 0..1. Safe to call at any rate. */
  meter: LoudnessMeter;
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
  /** The centre frequency (Hz) of each EQ band, low to high, index-aligned with
   * `setEqGains`. */
  eqFrequencies: readonly number[];
  /** Sets each EQ band's gain in dB, index-aligned with `eqFrequencies`. Missing
   * or extra entries are ignored; a flat (all-zero) set is transparent. */
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

/**
 * How long a lag the deck may build up. A stop and a start together cost about
 * a fifth of a second, and the player drops it whenever it is silent, so this
 * is a ceiling on abuse rather than a working figure.
 */
const MAX_DELAY_SECONDS = 2;

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
  const deck = context.createDelay(MAX_DELAY_SECONDS);
  const tail = filters.reduce<AudioNode>((node, filter) => {
    node.connect(filter);
    return filter;
  }, analyser);
  tail.connect(deck);
  deck.connect(gain);
  gain.connect(context.destination);

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

  // The glide in flight, as the numbers that describe it. The delay line holds
  // the length; only this holds the speed, which is the length's slope and so
  // is not a thing the graph can be asked for.
  let glideFrom = 1;
  let glideTo = 1;
  let glideStart = context.currentTime;
  let glideSeconds = 0;

  const created: AnalyserMeter = {
    meter: () => {
      analyser.getFloatTimeDomainData(buffer);
      return rms(buffer);
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
      const now = context.currentTime;
      deck.delayTime.cancelScheduledValues(now);
      deck.delayTime.setValueAtTime(0, now);
      glideFrom = speed;
      glideTo = speed;
      glideStart = now;
      glideSeconds = 0;
    },
    addSource: seatElement,
    setDynamics: (on: boolean) => {
      if (on === squeezing) return;
      squeezing = on;
      // Rerouting rather than zeroing: a compressor "set flat" still colours
      // the signal, and absent is the only honest off. The tail's one output
      // is whichever of these it was given, so a bare disconnect is exact.
      tail.disconnect();
      if (on) {
        tail.connect(squeeze);
        makeup.connect(deck);
      } else {
        // Bare, not disconnect(deck): the deck is make-up's only output, so
        // the two are the same while the graph is alive - but the targeted
        // form throws once dispose has severed it, and a disposed meter is
        // supposed to go quiet, not loud.
        makeup.disconnect();
        tail.connect(deck);
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
      filters.forEach((filter, index) => {
        const value = gains[index];
        if (typeof value === 'number' && Number.isFinite(value)) filter.gain.value = value;
      });
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
      deck.disconnect();
      gain.disconnect();
      void context.close();
    },
  };
  host[CACHE] = created;
  return created;
}
