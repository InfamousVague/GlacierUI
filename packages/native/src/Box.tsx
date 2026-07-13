import { type ReactNode } from 'react';
import { View, type ViewProps, type Style } from 'react-native';
import { t } from './tokens.ts';

/**
 * The Glacier Box, rendered with React Native primitives.
 *
 * Box is a pure layout primitive with no spec: it maps the web Box's
 * token-locked style contract (padding / background / radius / border /
 * elevation / sizing / flex-child) onto a single <View>. Every scale value is
 * turned into a `var(--glacier-*)` reference via `t()`, so on web
 * (react-native-web) it resolves to the exact same tokens the DOM Box uses and
 * cannot drift; a device token map swaps them for concrete values.
 *
 * Mapping (web -> RN):
 *   padding/paddingX/paddingY/padding{Top,Right,Bottom,Left} -> padding* (t('space-N'))
 *   background -> backgroundColor token
 *   radius     -> borderRadius (t('radius-N'))
 *   border     -> borderWidth hairline + borderColor token
 *   elevation  -> boxShadow (t('shadow-N'))
 *   width/maxWidth/height -> width / maxWidth / height|minHeight
 *   grow/shrink -> flexGrow / flexShrink
 *   alignSelf  -> alignSelf (start->flex-start, end->flex-end)
 *
 * Approximations & web-only bits (all documented so the docs compare 1:1):
 *  - Responsive values: RN has no media-query cascade, so a per-breakpoint
 *    object ({ base, sm, md, lg, xl }) collapses to its `base` entry (resting
 *    viewport). Scalars apply as-is.
 *  - The web Box is `display: block`; an RN <View> is always flex-column. This
 *    is an inherent RN difference and matches for the common container case
 *    (Box carries no gap/align/justify of its own — those live on Stack/Row/Grid).
 *  - `background: 'accent' | 'accentSoft'` also set a *text* color on the web via
 *    CSS inheritance; RN <Text> does not inherit from a parent <View>, so (like
 *    Surface/Card) only the background is taken and content brings its own color.
 *  - `background: 'glass'` renders its resting tint (`glass-regular`); the web's
 *    `backdrop-filter` blur has no native runtime and is accepted-but-noop.
 *  - `width: 'fit'` (fit-content) and `height: 'screen'` (min-height 100vh) pass
 *    through react-native-web on the web docs; on a device build those CSS
 *    keywords are not valid lengths (web-parity only).
 *  - `as`, `className`, and DOM `style` are web-only escape hatches: `as` and
 *    `className` are accepted-but-noop; `style` is merged onto the View for parity.
 */

/** A value that can vary by breakpoint. Scalars apply at every width; on native only `base` is used. */
export type Responsive<T> = T | Partial<Record<'base' | 'sm' | 'md' | 'lg' | 'xl', T>>;

/** Step numbers from the shared space scale. */
export type SpaceStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;

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

/**
 * The shared style surface every layout primitive accepts. All values are scale
 * keys, never raw lengths, so nothing can land off the system. Mirrors the web
 * `BoxStyleProps` exactly.
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
  /** Allow shrinking below content size. */
  shrink?: boolean;
  alignSelf?: Align;
}

export interface BoxProps extends Omit<ViewProps, 'style' | 'children'>, BoxStyleProps {
  /** Web-only: the rendered element. Accepted-but-noop on native (always a View). */
  as?: unknown;
  /** Web-only: CSS class. Accepted-but-noop on native. */
  className?: string;
  /** Escape-hatch style, merged onto the underlying View. */
  style?: Style;
  children?: ReactNode;
}

/** Pick the base (resting-viewport) value from a scalar-or-responsive prop. */
function base<T>(value: Responsive<T> | undefined): T | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'object') return (value as Partial<Record<'base', T>>).base;
  return value as T;
}

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

// border=true takes the default (strong) border color; the named tokens follow
// the web `[data-border=...]` rules in Layout.module.css.
const BORDER_COLOR: Record<'subtle' | 'strong' | 'accent', string> = {
  subtle: t('border-subtle'),
  strong: t('border-strong'),
  accent: t('accent-border'),
};

const WIDTH: Record<WidthToken, string> = { auto: 'auto', full: '100%', fit: 'fit-content' };
const ALIGN_SELF: Record<Align, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

export function Box({
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
  width,
  maxWidth,
  height,
  grow,
  shrink,
  alignSelf,
  as: _as,
  className: _className,
  style,
  children,
  ...rest
}: BoxProps) {
  // min-width:0 so a Box never overflows a flex parent (matches `.box` in the CSS).
  const box: Style = { minWidth: 0 };

  // Padding resolves widest to narrowest: all sides, then axes, then edges, so
  // the most specific prop wins per side (mirrors resolveBox's cascade). `0` is
  // a valid step and must not fall through, hence explicit ?? on defined values.
  const pAll = base(padding);
  const pX = base(paddingX);
  const pY = base(paddingY);
  const pt = paddingTop ?? pY ?? pAll;
  const pr = paddingRight ?? pX ?? pAll;
  const pb = paddingBottom ?? pY ?? pAll;
  const pl = paddingLeft ?? pX ?? pAll;
  if (pt !== undefined) box.paddingTop = t(`space-${pt}`);
  if (pr !== undefined) box.paddingRight = t(`space-${pr}`);
  if (pb !== undefined) box.paddingBottom = t(`space-${pb}`);
  if (pl !== undefined) box.paddingLeft = t(`space-${pl}`);

  if (background !== undefined) box.backgroundColor = BACKGROUND[background];
  if (radius !== undefined) box.borderRadius = t(`radius-${radius}`);
  if (border) {
    box.borderWidth = t('hairline');
    box.borderStyle = 'solid';
    box.borderColor = border === true ? t('border') : BORDER_COLOR[border];
  }
  if (elevation !== undefined) box.boxShadow = t(`shadow-${elevation}`);

  if (width !== undefined) box.width = WIDTH[width];
  if (maxWidth !== undefined) box.maxWidth = maxWidth === 'full' ? '100%' : t(`container-${maxWidth}`);
  if (height !== undefined) {
    if (height === 'screen') box.minHeight = '100vh';
    else box.height = height === 'full' ? '100%' : 'auto';
  }

  if (grow) box.flexGrow = 1;
  if (shrink) box.flexShrink = 1;
  if (alignSelf !== undefined) box.alignSelf = ALIGN_SELF[alignSelf];

  return (
    <View style={style ? [box, style] : box} {...rest}>
      {children}
    </View>
  );
}
