/**
 * Player transport logic - the parts of an audio player that are decisions
 * rather than pixels, shared so both bindings behave identically.
 */

/**
 * Formats a position the way a listener expects to read it back: m:ss under an
 * hour, h:mm:ss once a track is long enough to need it. Negative and non-finite
 * inputs settle at zero rather than rendering "NaN:aN".
 */
export function formatDuration(seconds: number): string {
  const whole = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const secs = whole % 60;
  const mins = Math.floor(whole / 60) % 60;
  const hours = Math.floor(whole / 3600);
  const pad = (n: number) => String(n).padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(mins)}:${pad(secs)}` : `${mins}:${pad(secs)}`;
}

/**
 * How the card arranges what it holds.
 *
 * - `stacked` - heading, bar, then controls in a column. The default, and the
 *   one that survives being squeezed into a narrow column.
 * - `inline` - artwork top-aligned on the leading edge with the title, artist,
 *   and album beside it; the bar and controls then break to their own rows and
 *   span the full width, so the seek bar is never squeezed into a column.
 * - `square` - artwork as a square hero with the bar and controls beneath it,
 *   the shape a phone's now-playing screen wants.
 */
export type PlayerLayout = 'stacked' | 'inline' | 'square';

/**
 * How tightly the card is packed. Deliberately a subset of the app-wide density
 * words rather than a new scale, so the two read as the same vocabulary.
 */
export type PlayerDensity = 'compact' | 'comfortable' | 'spacious';

/**
 * The measurements a density resolves to. Spacing is given as token names for
 * each binding to wrap its own way; icon sizes are plain numbers because both
 * icon sets take a pixel size.
 */
export interface PlayerMetrics {
  /** Gap between the card's rows. */
  gap: string;
  /** Gap between the transport controls. */
  transportGap: string;
  /** Glyph size for the quiet controls. */
  controlIcon: number;
  /** Glyph size for the primary play control. */
  playIcon: number;
  /** Button size for the quiet controls. */
  controlSize: 'sm' | 'md';
  /** Button size for the play control, always a step above its neighbours. */
  playSize: 'md' | 'lg';
}

const METRICS: Record<PlayerDensity, PlayerMetrics> = {
  compact: {
    gap: 'space-2',
    transportGap: 'space-0',
    controlIcon: 15,
    playIcon: 16,
    controlSize: 'sm',
    playSize: 'md',
  },
  comfortable: {
    gap: 'space-4',
    transportGap: 'space-1',
    controlIcon: 18,
    playIcon: 20,
    controlSize: 'md',
    playSize: 'lg',
  },
  spacious: {
    gap: 'space-5',
    transportGap: 'space-3',
    controlIcon: 20,
    playIcon: 24,
    controlSize: 'md',
    playSize: 'lg',
  },
};

/**
 * Resolves a density to its measurements. Shared so a compact card is the same
 * card on both platforms rather than two guesses at "tighter".
 */
export function playerMetrics(density: PlayerDensity): PlayerMetrics {
  return METRICS[density] ?? METRICS.comfortable;
}

/**
 * How wide each placeholder is while the card loads.
 *
 * Shared so the two bindings cannot size their bones differently: left to their
 * own defaults they do not agree - the DOM kit's text placeholder is a fixed
 * `14ch`, which is about right for a title and three times too wide for a
 * `1:24` readout, while the native one is a fixed block that would make every
 * line the same length. Both read these instead.
 */
export const playerSkeletonWidths = {
  title: '45%',
  subtitle: '32%',
  album: '25%',
  /** A readout is about five mono characters; px, since it should not scale. */
  clock: 34,
} as const;

/**
 * Repeat modes, in the order the button cycles through them.
 *
 * - `off` - stop at the end of the track.
 * - `all` - loop the queue.
 * - `one` - loop this track.
 */
export type PlayerRepeat = 'off' | 'all' | 'one';

const REPEAT_ORDER: PlayerRepeat[] = ['off', 'all', 'one'];

/**
 * The mode a press moves to. Off to all to one and back to off - the order
 * every player uses, so the button needs no explanation.
 */
export function nextRepeat(mode: PlayerRepeat): PlayerRepeat {
  const index = REPEAT_ORDER.indexOf(mode);
  return REPEAT_ORDER[(index + 1) % REPEAT_ORDER.length] ?? 'off';
}
