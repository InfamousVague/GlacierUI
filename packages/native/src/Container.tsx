import { type ElementType, type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { t } from './tokens.ts';
import { type NativeStyle } from './resolve.ts';

/**
 * The Glacier Container, rendered with React Native primitives.
 *
 * Container is a pure layout primitive with no spec: a centered, width-capped
 * column with responsive gutters (mirrors `.box` + `.container` in
 * Layout.module.css). The web resolves its box props into inline custom
 * properties that a CSS cascade turns into `padding`, `max-width`, etc.; here we
 * map the SAME public prop contract straight onto a single `<View>`'s flex
 * style, reading every scale value through `t()` so the tokens cannot drift from
 * the web kit. Web centering (`width:100%; margin-inline:auto; max-width:<size>`)
 * becomes `width:'100%'; marginHorizontal:'auto'; maxWidth:<container token>`.
 *
 * Approximations (React Native has no media queries or CSS grid at runtime):
 *   - Responsive space values (`padding`, `paddingX`, `paddingY`, and the default
 *     `{ base: 4, md: 6 }` gutter) collapse to their `base` breakpoint; the wider
 *     `md`/`lg`/… steps are dropped. A scalar step applies at every width, as on
 *     the web.
 *   - `background: 'accent' | 'accentSoft'` sets only the container fill; the web
 *     also inherits a text color, but RN `<Text>` does not inherit from a parent
 *     `<View>`, so (like Surface/Card) content brings its own `<Text>` color.
 *   - `background: 'glass'` renders its resting tint (`glass-regular`); the web's
 *     `backdrop-filter` blur has no native runtime and is accepted-but-noop.
 *   - `height: 'screen'` maps to `minHeight: '100vh'` (a react-native-web string;
 *     a device build would swap it for the window height).
 *
 * Web-only props: `as` (polymorphic tag) is accepted-but-noop; DOM props
 * (`className`, `style`, `id`, refs) are not part of the native surface.
 */

// Local mirrors of @glacier/react's layout unions (the native package does not
// depend on the DOM kit). Kept name-for-name so the docs compare 1:1.
type SpaceStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;
type Responsive<T> = T | Partial<Record<'base' | 'sm' | 'md' | 'lg' | 'xl', T>>;

export type ContainerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'prose' | 'full';
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
export type HeightToken = 'auto' | 'full' | 'screen';
export type Align = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

export interface ContainerProps extends Omit<ViewProps, 'style' | 'children'> {
  /** Polymorphic element tag on web; accepted-but-noop on native. */
  as?: ElementType;
  /** Max content width. Defaults to lg. */
  size?: ContainerSize;
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
  height?: HeightToken;
  /** Grow to fill the main axis of a parent Row or Stack. */
  grow?: boolean;
  /** Allow shrinking below content size. */
  shrink?: boolean;
  alignSelf?: Align;
  children?: ReactNode;
}

// Background role -> fill token, mirroring `.box[data-bg=*]` in Layout.module.css.
const BACKGROUND: Record<Background, string> = {
  transparent: 'transparent',
  bg: t('bg'),
  surface: t('surface'),
  surfaceRaised: t('surface-raised'),
  surfaceSunken: t('surface-sunken'),
  accent: t('accent-solid'),
  accentSoft: t('accent-soft'),
  glass: t('glass-regular'),
};

// Align keyword -> RN alignSelf (web uses the CSS box-alignment keywords).
const ALIGN_SELF: Record<Align, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

const borderColorFor = (b: BorderToken): string =>
  b === 'subtle'
    ? t('border-subtle')
    : b === 'strong'
      ? t('border-strong')
      : b === 'accent'
        ? t('accent-border')
        : t('border'); // true / 'default'

/** The base step of a responsive space value (RN has no media queries). */
const spaceBase = (v: Responsive<SpaceStep> | undefined): SpaceStep | undefined =>
  v === undefined ? undefined : typeof v === 'number' ? v : v.base;

export function Container({
  as: _as,
  size = 'lg',
  padding,
  paddingX,
  paddingY,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  background,
  radius,
  border,
  elevation,
  height,
  grow,
  shrink,
  alignSelf,
  children,
  ...rest
}: ContainerProps) {
  // Default horizontal gutters, only when the caller has not set any x padding
  // (matches the web's `hasX` guard, which keys off padding/paddingX/paddingLeft).
  const hasX = padding !== undefined || paddingX !== undefined || paddingLeft !== undefined;
  const xPad: Responsive<SpaceStep> | undefined = hasX ? paddingX : { base: 4, md: 6 };

  // Per-edge resolution, widest to narrowest (most specific wins), mirroring
  // resolveBox: all-sides < axis < explicit edge.
  const all = spaceBase(padding);
  const yBase = spaceBase(paddingY);
  const xBase = spaceBase(xPad);
  const pt = paddingTop ?? yBase ?? all;
  const pr = paddingRight ?? xBase ?? all;
  const pb = paddingBottom ?? yBase ?? all;
  const pl = paddingLeft ?? xBase ?? all;

  const style: NativeStyle = {
    width: '100%',
    maxWidth: size === 'full' ? '100%' : t(`container-${size}`),
    marginHorizontal: 'auto',
  };

  if (pt !== undefined) style.paddingTop = t(`space-${pt}`);
  if (pr !== undefined) style.paddingRight = t(`space-${pr}`);
  if (pb !== undefined) style.paddingBottom = t(`space-${pb}`);
  if (pl !== undefined) style.paddingLeft = t(`space-${pl}`);

  if (background) style.backgroundColor = BACKGROUND[background];
  if (radius) style.borderRadius = t(`radius-${radius}`);
  if (border) {
    style.borderWidth = t('hairline');
    style.borderStyle = 'solid';
    style.borderColor = borderColorFor(border);
  }
  if (elevation !== undefined) style.boxShadow = t(`shadow-${elevation}`);

  if (height === 'auto') style.height = 'auto';
  else if (height === 'full') style.height = '100%';
  else if (height === 'screen') style.minHeight = '100vh';

  if (grow) style.flexGrow = 1;
  if (shrink) style.flexShrink = 1;
  if (alignSelf) style.alignSelf = ALIGN_SELF[alignSelf];

  return (
    <View style={style} {...rest}>
      {children}
    </View>
  );
}
