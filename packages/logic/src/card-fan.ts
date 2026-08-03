/**
 * Slinky fan layout: a spread that is dense at its ends and opens up around
 * wherever the pointer is.
 *
 * An even spread has exactly two settings, and both fail at scale: keep the
 * per-item step and forty cards run off both edges, or shrink the step and
 * forty cards become one illegible smear with only the last readable.
 *
 * A slinky decouples the track from its contents. The track is a FIXED length —
 * the width of the strip, the angle the fan may sweep — and items are
 * distributed across it by weight rather than by count. With nothing focused
 * every item weighs the same and the result is the even spread. Focus one and
 * it and its neighbours weigh more, claiming more track; the rest weigh what
 * they always did but have less track left, so they compress. The ends stay
 * pinned, so the silhouette never moves and can never overflow — which is the
 * whole point — and the compressed items bunch toward the side away from the
 * pointer, the way a slinky's coils pile up at one end when you lift the other.
 *
 * Positions come back as fractions of the track (0 at the first item, 1 at the
 * last) because surfaces measure their tracks in different units: a fan maps
 * them onto degrees of arc, a strip onto pixels of width.
 *
 * All of it is arithmetic, so both bindings lay a fan out identically and the
 * whole thing is testable without a renderer.
 */

export interface SlinkyOptions {
  /**
   * How much extra track the focused item claims, as a multiple of an unfocused
   * one. 0 gives an even spread; 2 makes the focused item three times the width
   * of one at the far end.
   */
  gain?: number;
  /**
   * How many items either side of the focus share in the expansion. Small
   * values give a sharp local bulge; large ones tilt the whole fan.
   */
  reach?: number;
}

/**
 * Enough to lift an item clear of its neighbours without the far end collapsing
 * into a single edge — past about 3 the items outside the bulge stop being
 * separable at all, which trades one unreadable fan for another.
 */
const GAIN = 1.8;

/**
 * A little over two items each way: wide enough that the expansion reads as the
 * fan opening rather than one item popping out, narrow enough that a large fan
 * still reveals only a handful at a time — which is what makes forty items
 * navigable instead of merely visible.
 */
const REACH = 2.2;

/**
 * Where each of `count` items sits along its track, as a fraction from 0 to 1.
 *
 * `focus` is a FRACTIONAL index — 0 is the first item, `count - 1` the last, and
 * 3.5 is the seam between the fourth and fifth — so a pointer sliding across the
 * fan moves the bulge continuously instead of snapping item to item. Pass null
 * for the resting, evenly spread state.
 */
export function slinkyOffsets(count: number, focus: number | null, options: SlinkyOptions = {}): number[] {
  if (count <= 0) return [];
  if (count === 1) return [0.5];
  if (focus === null || !Number.isFinite(focus)) {
    return Array.from({ length: count }, (_, index) => index / (count - 1));
  }

  const gain = options.gain ?? GAIN;
  const reach = options.reach ?? REACH;

  // A gaussian rather than a triangle so the bulge has no corners: a linear
  // falloff puts a visible kink in the fan at the edge of its own influence, and
  // the kink slides around with the pointer.
  const weights: number[] = [];
  let total = 0;
  for (let index = 0; index < count; index += 1) {
    const distance = (index - focus) / reach;
    const weight = 1 + gain * Math.exp(-distance * distance);
    weights.push(weight);
    total += weight;
  }

  // Each item sits at the middle of the slice its weight bought, so a heavy item
  // pushes its neighbours away symmetrically instead of dragging the fan one way.
  const centres: number[] = [];
  let run = 0;
  for (let index = 0; index < count; index += 1) {
    const weight = weights[index] ?? 1;
    centres.push((run + weight / 2) / total);
    run += weight;
  }

  // Pin the ends. Without this the fan shrinks toward its middle as soon as
  // anything is focused, because the outermost half-slices grow with it — and a
  // fan that changes size under the pointer is the overflow problem this exists
  // to solve.
  const first = centres[0] ?? 0;
  const last = centres[count - 1] ?? 1;
  const span = last - first || 1;
  return centres.map((centre) => (centre - first) / span);
}

/**
 * A fan's resting focus: its own middle.
 *
 * This is what puts the density at the ENDS rather than spreading everything
 * evenly — the centre items claim the room and the outer ones tuck in behind
 * each other, which is both how a fan of cards sits in a hand and the only way a
 * forty-item fan fits the strip a seven-item one does.
 */
export function restFocus(count: number): number {
  return (count - 1) / 2;
}

/**
 * The pointer's position along a track, as the fractional index to focus.
 *
 * Takes a distance and a length rather than a DOM rect, so the same call serves
 * a mouse on a strip, a touch on an arc, and a test with no renderer at all.
 *
 * Linear in the track rather than in the arc: a fan's items are not evenly
 * spaced in x once rotated, but the error is well under half an item at the
 * spreads a fan uses, and chasing it exactly would mean hit-testing every item
 * on every pointer move.
 */
export function focusFromTrack(position: number, length: number, count: number): number | null {
  if (count <= 1 || length <= 0 || !Number.isFinite(position)) return null;
  const along = position / length;
  return Math.max(0, Math.min(1, along)) * (count - 1);
}

/**
 * Tuning that widens the bulge as the fan grows.
 *
 * A large fan should not be reduced to five readable items and two solid blocks:
 * forty items want the bulge spread over eight, not two. Gentler than a reveal
 * animation would be — a fan is somewhere you work, and an item that has to be
 * chased is worse than one that is merely small.
 */
export function fanSlinky(count: number): SlinkyOptions {
  return { gain: GAIN, reach: Math.max(REACH, count / 5) };
}

/** Where one item sits and how it is turned, in units the renderer applies. */
export interface FanPlacement {
  /** Fraction along the track, 0 at the near end and 1 at the far one. */
  offset: number;
  /** Degrees to rotate, negative at the near end. */
  rotate: number;
  /** Downward displacement that bows the fan into an arc. */
  lift: number;
  /** Stacking order, so a focused item sits above its neighbours. */
  z: number;
}

/**
 * The lean at the fan's ends, in degrees.
 *
 * Capped, and derived from the count rather than the index: with forty items an
 * index-driven tilt puts the outermost cards on their sides. A fan is a fan at
 * any size — only the density inside it changes.
 */
export function fanLean(count: number): number {
  return Math.min(13, count * 1.75);
}

/**
 * How far the fan's ends drop below its middle, for an item of `width`.
 *
 * Scaled by the item so the arc keeps its shape at any size, and capped for the
 * same reason as the lean: uncapped, a large fan pushes its ends a hand's height
 * down the screen.
 */
export function fanBow(count: number, width: number): number {
  return Math.min(22, count * 3) * (width / 132);
}

/**
 * Every item's placement in one pass.
 *
 * One function rather than four called per item, so a binding cannot apply the
 * lean from one count and the bow from another mid-render.
 */
export function fanPlacements(
  count: number,
  focus: number | null,
  width: number,
  options?: SlinkyOptions,
): FanPlacement[] {
  const offsets = slinkyOffsets(count, focus ?? restFocus(count), options ?? fanSlinky(count));
  const lean = fanLean(count);
  const bow = fanBow(count, width);

  return offsets.map((offset, index) => {
    // -1 at the near end, +1 at the far one; the lean and the bow both read from
    // the item's place along the fan rather than its index, so adding an item
    // reshapes the whole fan instead of extending one end of it.
    const away = (offset - 0.5) * 2;
    return {
      offset,
      rotate: away * lean,
      lift: Math.abs(away) * bow,
      // Only a focused item rises, and by whole steps, so neighbours never
      // trade places on a sub-pixel change in the pointer.
      z: focus === null ? 0 : Math.max(0, Math.round(20 * Math.exp(-(((index - focus) / 1.2) ** 2)))),
    };
  });
}

/**
 * The dock-style magnification for one item: 1 at rest, larger under the
 * pointer, tapering to nothing about two items away.
 *
 * The same gaussian the layout uses, so the item that claims the most track is
 * the one that grows — a bulge whose largest item was not its widest would read
 * as two effects fighting.
 */
export function fanMagnify(index: number, focus: number | null, amount = 0.3, reach = 1.2): number {
  if (focus === null || !Number.isFinite(focus)) return 1;
  const distance = (index - focus) / reach;
  return 1 + amount * Math.exp(-distance * distance);
}
