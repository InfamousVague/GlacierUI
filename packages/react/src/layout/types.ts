import type { SpaceStep } from '@perfect/tokens';

/** A value that can vary by breakpoint. Scalars apply at every width. */
export type Responsive<T> = T | Partial<Record<'base' | 'sm' | 'md' | 'lg' | 'xl', T>>;

export type Background =
  | 'transparent'
  | 'bg'
  | 'surface'
  | 'surfaceRaised'
  | 'surfaceSunken'
  | 'accent'
  | 'accentSoft'
  | 'glass';

export type RadiusToken = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type BorderToken = boolean | 'subtle' | 'strong' | 'accent';
export type ElevationToken = 0 | 1 | 2 | 3 | 4 | 5;
export type ContainerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'prose' | 'full';
export type WidthToken = 'auto' | 'full' | 'fit';
export type HeightToken = 'auto' | 'full' | 'screen';
export type Align = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type Justify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

/**
 * The shared style surface every layout primitive accepts. All values are
 * scale keys, never raw lengths, so nothing can land off the system.
 */
export interface BoxStyleProps {
  /** Padding on all sides, from the space scale. */
  padding?: Responsive<SpaceStep>;
  paddingX?: Responsive<SpaceStep>;
  paddingY?: Responsive<SpaceStep>;
  paddingTop?: SpaceStep;
  paddingRight?: SpaceStep;
  paddingBottom?: SpaceStep;
  paddingLeft?: SpaceStep;
  background?: Background;
  radius?: RadiusToken;
  border?: BorderToken;
  elevation?: ElevationToken;
  width?: WidthToken;
  maxWidth?: ContainerSize;
  height?: HeightToken;
  /** Grow to fill the main axis of a parent Row or Stack. */
  grow?: boolean;
  /** Allow shrinking below content size. Layout primitives shrink by default. */
  shrink?: boolean;
  alignSelf?: Align;
}

export interface FlowProps {
  /** Space between children, from the space scale. */
  gap?: Responsive<SpaceStep>;
  /** Cross-axis alignment. */
  align?: Align;
  /** Main-axis distribution. */
  justify?: Justify;
}
