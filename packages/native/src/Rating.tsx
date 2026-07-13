import { View, Pressable, type ViewProps } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { ratingSizes, ratingSpec } from '@glacier/spec';
import { useControlled } from '@glacier/commons';
import { t } from './tokens.ts';
import { sizeFor, dimensionsFor } from './resolve.ts';

/**
 * Rating — the @glacier/native binding of the DOM kit's Rating atom.
 *
 * Mapping (mirrors Rating.module.css + ratingSpec):
 *  - A row of star cells. Each cell is a 1em x 1em box, where 1em is the size's
 *    font-size read from the spec, holding two stacked react-native-svg stars on
 *    the same lucide path the web inlines: a border-strong outline, and a
 *    warning-solid fill clipped to the value by an overflow-hidden wrapper, so a
 *    fractional read-only value (e.g. 4.3) reads as a partly-filled star.
 *  - Interactive by default: each star is a Pressable that sets the value on tap
 *    (accessibilityRole="radio") inside a "radiogroup". `readOnly` renders the
 *    same stars with fractional fill and role="image"; `skeleton` renders one
 *    star-silhouette bone per star in the live size and gap.
 *  - Paint (warning-solid fill, border-strong outline) and geometry (per-size
 *    font-size, the 0.1em gap) come from ratingSpec through the shared resolvers,
 *    so they cannot drift from @glacier/react's Rating.
 *
 * Platform notes (accepted-but-noop):
 *  - Pointer hover-preview (scrubbing to preview a value) and haptics
 *    (`data-haptic`) are DOM/pointer features with no React Native runtime here;
 *    `onChange` still fires on tap. The web arrow-key selection comes from the
 *    native radio group and is a device follow-up. The `.star:active` scale-0.9
 *    (spec `active` state) is reproduced as a pressed transform.
 */

// Derived from the spec so the size union cannot drift from the web kit.
export type RatingSize = (typeof ratingSizes)[number];

// The lucide "star" glyph — the same single closed-outline path the web inlines
// (Rating.tsx), kept here rather than pulled from @glacier/icons so the native
// kit stays free of the lucide dependency, exactly as the DOM kit does.
const STAR_PATH =
  'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z';

const STAR_STROKE = { strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

// Strip the leading `$` off a spec paint ref exactly as the shared resolvers do,
// so the token name cannot drift from the web kit.
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);

// The fill paint (warning-solid) comes from the spec's base paint; the empty
// outline paints border-strong and the skeleton bone the hover wash — both
// declared on ratingSpec.tokens, mirroring `.starFill` / `.starBase` / the web
// star-clipped Skeleton bone.
const FILL_COLOR = t(bare((ratingSpec.paint as { text?: string }).text) ?? 'warning-solid');
const OUTLINE_COLOR = t('border-strong');
const BONE_COLOR = t('hover');

// The row gap, '0.1em', read once from the spec. Expressed against the resolved
// per-size font-size as a calc() (1em === that font-size) so it never depends on
// an em cascade through the View tree.
const GAP_EM = parseFloat(dimensionsFor(ratingSpec).gap ?? '0.1');

export interface RatingProps extends Omit<ViewProps, 'aria-label' | 'children'> {
  /** Controlled rating value, 0 to `max`. */
  value?: number;
  /** Initial value when uncontrolled. */
  defaultValue?: number;
  /** Number of stars. */
  max?: number;
  onChange?: (value: number) => void;
  /** Display-only: renders the stars (with fractional fill) but no controls. */
  readOnly?: boolean;
  disabled?: boolean;
  size?: RatingSize;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Accessible name for the rating group. */
  'aria-label'?: string;
  /** Accepted for prop parity; there is no haptics runtime in the native binding (noop). */
  'data-haptic'?: string;
}

/**
 * A single star: the empty border-strong outline with the warning-solid fill
 * clipped over it by `fill` (0–1), so a partial rating reads as a partially
 * filled star. `size` is the cell edge (1em === the size's font-size).
 */
function StarCell({ fill, size }: { fill: number; size: string }) {
  const pct = Math.max(0, Math.min(1, fill)) * 100;
  return (
    <View style={{ position: 'relative', width: size, height: size }}>
      <Svg width="100%" height="100%" viewBox="0 0 24 24" style={{ position: 'absolute', top: 0, left: 0 }}>
        <Path d={STAR_PATH} fill="none" stroke={OUTLINE_COLOR} {...STAR_STROKE} />
      </Svg>
      {pct > 0 && (
        // overflow-hidden wrapper at the fill width, over a full-size star —
        // mirrors `.fillWrap { overflow: hidden; width: pct% }` in the CSS.
        <View style={{ position: 'absolute', top: 0, left: 0, width: `${pct}%`, height: size, overflow: 'hidden' }}>
          <View style={{ width: size, height: size }}>
            <Svg width="100%" height="100%" viewBox="0 0 24 24" style={{ position: 'absolute', top: 0, left: 0 }}>
              <Path d={STAR_PATH} fill={FILL_COLOR} stroke={FILL_COLOR} {...STAR_STROKE} />
            </Svg>
          </View>
        </View>
      )}
    </View>
  );
}

/**
 * The Glacier Rating, rendered with React Native + react-native-svg primitives.
 * Paint and geometry are read from the rating spec through the shared resolvers,
 * so it is visually identical to @glacier/react's Rating and cannot drift from
 * it. Interactive by default (tap a star to set the value); `readOnly` renders a
 * display badge that supports fractional fill.
 */
export function Rating({
  value,
  defaultValue,
  max = 5,
  onChange,
  readOnly = false,
  disabled = false,
  size = 'md',
  skeleton = false,
  'aria-label': ariaLabel,
  ...rest
}: RatingProps) {
  const [current, setCurrent] = useControlled({ value, defaultValue: defaultValue ?? 0, onChange });
  // 1em === the size's font-size; the cell edge and the em-based gap derive from
  // it, mirroring `.rating { font-size } .cell { width/height: 1em }`.
  const cell = sizeFor(ratingSpec, size).fontSize ?? '1.125rem';
  const gap = `calc(${cell} * ${GAP_EM})`;
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  const row = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    alignSelf: 'flex-start' as const,
    columnGap: gap,
  };

  if (skeleton) {
    // One star-silhouette bone per star, in the live size and gap, so the
    // placeholder reads as the row of stars it will become. (The shared shimmer
    // sweep is a device follow-up; this holds the resting geometry.)
    return (
      <View aria-hidden={true} style={row}>
        {stars.map((v) => (
          <View key={v} style={{ width: cell, height: cell }}>
            <Svg width="100%" height="100%" viewBox="0 0 24 24">
              <Path d={STAR_PATH} fill={BONE_COLOR} stroke={BONE_COLOR} {...STAR_STROKE} />
            </Svg>
          </View>
        ))}
      </View>
    );
  }

  if (readOnly) {
    return (
      <View accessibilityRole="image" aria-label={ariaLabel ?? `${current} of ${max}`} style={row} {...rest}>
        {stars.map((v) => (
          <StarCell key={v} fill={current - (v - 1)} size={cell} />
        ))}
      </View>
    );
  }

  return (
    <View
      accessibilityRole="radiogroup"
      aria-label={ariaLabel}
      style={{ ...row, opacity: disabled ? 0.5 : 1 }}
      {...rest}
    >
      {stars.map((v) => (
        <Pressable
          key={v}
          accessibilityRole="radio"
          accessibilityState={{ checked: current === v, disabled }}
          aria-label={String(v)}
          disabled={disabled}
          onPress={() => setCurrent(v)}
          // `.star:active { transform: scale(0.9) }` (spec `active` state).
          style={({ pressed }) => ({ transform: [{ scale: pressed && !disabled ? 0.9 : 1 }] })}
        >
          <StarCell fill={current >= v ? 1 : 0} size={cell} />
        </Pressable>
      ))}
    </View>
  );
}
