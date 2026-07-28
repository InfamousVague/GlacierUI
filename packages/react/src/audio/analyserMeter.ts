import { rms, type LoudnessMeter } from '@glacier/logic';

/**
 * Wires a Web Audio analyser onto a playing `<audio>` (or `<video>`) element and
 * hands back a loudness meter — the sampler `useLiveLevels` reads to build a
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
 * returned meter is cached per element and re-calling this is safe.
 */
export interface AnalyserMeter {
  /** Current loudness, 0..1. Safe to call at any rate. */
  meter: LoudnessMeter;
  /** Releases the audio graph. The element keeps playing. */
  dispose(): void;
}

/** `createMediaElementSource` may be called once per element, so cache by element. */
const meters = new WeakMap<HTMLMediaElement, AnalyserMeter>();

export function createAnalyserMeter(element: HTMLMediaElement): AnalyserMeter {
  const existing = meters.get(element);
  if (existing) return existing;

  const context = new AudioContext();
  const analyser = context.createAnalyser();
  // Small window: loudness, not spectral detail, and it keeps each read cheap.
  analyser.fftSize = 512;
  const buffer = new Float32Array(analyser.fftSize);

  const source = context.createMediaElementSource(element);
  source.connect(analyser);
  // The graph must reach the destination or routing the element through it
  // silences playback.
  analyser.connect(context.destination);

  const created: AnalyserMeter = {
    meter: () => {
      analyser.getFloatTimeDomainData(buffer);
      return rms(buffer);
    },
    dispose: () => {
      source.disconnect();
      analyser.disconnect();
      void context.close();
      meters.delete(element);
    },
  };
  meters.set(element, created);
  return created;
}
