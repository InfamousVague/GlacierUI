/**
 * Enum vocabulary — named constants for the loose string props, so components
 * read `size={Size.Large}` / `tone={Tone.Accent}` / `tone={TextTone.Muted}`
 * instead of `size="lg"` / `tone="accent"` / `tone="muted"`. Mirrors the
 * `@glacier/motion` enum pattern (Motion, Speed, Ease, Spring).
 *
 * Each value equals the underlying vocab string, so an enum member is accepted
 * anywhere the existing spec-derived union is (a string-enum member is
 * assignable to its literal value), while an out-of-range member is still
 * rejected by that per-component union. Adopting the enum is therefore additive
 * and never breaks an existing `size="lg"` string.
 */

import { controlSizes, tones } from './vocab.ts';
import { textSizes, textTones } from './components/text.ts';
import { buttonVariants } from './components/button.ts';
import { skeletonVariants } from './components/skeleton.ts';
import { scrollbarAppearances } from './components/scroll-area.ts';

/** Every size step in the kit. A component's own union restricts which apply. */
export enum Size {
  XSmall = 'xs',
  Small = 'sm',
  Medium = 'md',
  Large = 'lg',
  XLarge = 'xl',
}

/**
 * Status / semantic tones shared by badges, callouts, meters, steps, spinners,
 * progress, and friends. Note/Auto/Subtle/Inherit cover the component-specific
 * one-offs (Callout note, Meter auto, Spinner subtle/inherit).
 */
export enum Tone {
  Neutral = 'neutral',
  Accent = 'accent',
  Success = 'success',
  Warning = 'warning',
  Danger = 'danger',
  Info = 'info',
  Note = 'note',
  Auto = 'auto',
  Subtle = 'subtle',
  Inherit = 'inherit',
}

/** The Text component's emphasis tones (its own scale, distinct from status). */
export enum TextTone {
  Default = 'default',
  Muted = 'muted',
  Subtle = 'subtle',
  Accent = 'accent',
  Danger = 'danger',
  Success = 'success',
  Warning = 'warning',
}

/** Visual style variants for Button, IconButton, Card, and Pill. */
export enum Variant {
  Solid = 'solid',
  Soft = 'soft',
  Outline = 'outline',
  Ghost = 'ghost',
  Glass = 'glass',
  Danger = 'danger',
}

/** The Skeleton placeholder's shape variants (its own axis, not a visual style). */
export enum SkeletonVariant {
  Text = 'text',
  Rect = 'rect',
  Circle = 'circle',
}

/** Visual treatments available to ScrollArea's visible web scrollbar. */
export enum ScrollbarAppearance {
  Subtle = 'subtle',
  Default = 'default',
  Accent = 'accent',
}

// ---- compile-time sync guards ----------------------------------------------
// These fail the build if an enum drifts from the spec arrays it mirrors.
type AssertTrue<T extends true> = T;

// Size must cover the canonical size scales.
type _sizeCoversText = AssertTrue<(typeof textSizes)[number] extends `${Size}` ? true : false>;
type _sizeCoversControl = AssertTrue<(typeof controlSizes)[number] extends `${Size}` ? true : false>;

// Tone must cover the semantic tone vocab.
type _toneCoversSemantic = AssertTrue<(typeof tones)[number] extends `${Tone}` ? true : false>;

// TextTone must equal the Text vocab exactly (both directions).
type _textToneCovers = AssertTrue<(typeof textTones)[number] extends `${TextTone}` ? true : false>;
type _textToneExact = AssertTrue<`${TextTone}` extends (typeof textTones)[number] ? true : false>;

// Variant equals the button style vocab (the superset of the style variants);
// SkeletonVariant equals the skeleton shape vocab.
type _variantCovers = AssertTrue<(typeof buttonVariants)[number] extends `${Variant}` ? true : false>;
type _variantExact = AssertTrue<`${Variant}` extends (typeof buttonVariants)[number] ? true : false>;
type _skelCovers = AssertTrue<(typeof skeletonVariants)[number] extends `${SkeletonVariant}` ? true : false>;
type _skelExact = AssertTrue<`${SkeletonVariant}` extends (typeof skeletonVariants)[number] ? true : false>;
type _scrollbarAppearanceExact = AssertTrue<`${ScrollbarAppearance}` extends (typeof scrollbarAppearances)[number] ? true : false>;
type _scrollbarAppearanceCovers = AssertTrue<(typeof scrollbarAppearances)[number] extends `${ScrollbarAppearance}` ? true : false>;
