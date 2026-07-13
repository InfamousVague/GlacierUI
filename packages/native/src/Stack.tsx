/*
 * Stack — the vertical flow primitive, rendered with React Native primitives.
 *
 * This is a spec-less LAYOUT primitive: a single <View> whose flex box maps the
 * web `Stack` prop contract onto React Native styles. The web renders a
 * `.box.stack` flex column (see Layout.module.css): `flex-direction: column`,
 * `gap: var(--pl-gap)`, `align-items: stretch`. We reproduce that resting layout
 * with RN's flex model, which react-native (0.71+) and react-native-web both
 * support (gap / flexDirection / alignItems / justifyContent / padding* /
 * margin-free / width / maxWidth / flexGrow / flexShrink).
 *
 * Prop names + defaults are kept identical to @glacier/react's Stack so the
 * docs Web/Native toggle compares 1:1. All scale values are read through `t()`
 * (bare token name -> `var(--glacier-*)`), matching the web's token wiring:
 *   gap / padding steps -> t(`space-${step}`)  (web: --glacier-space-<step>)
 *   background / radius / border / elevation / maxWidth -> the same --glacier-*
 *   tokens the CSS applies via its data-* selectors.
 *
 * Approximations / web-only surface (report):
 *  - Responsive props (padding/paddingX/paddingY/gap accept a per-breakpoint
 *    object on web). RN has no media-query runtime, so a responsive object
 *    collapses to its `base` value; a bare scalar applies at every width.
 *  - `width="fit"` emits `fit-content` and `height="screen"` emits `100vh`:
 *    both resolve on react-native-web (docs) but have no device equivalent, so
 *    they degrade to `auto` / no-op on a real RN build.
 *  - `background="glass"` renders only its resting tint (`glass-regular`); the
 *    web's `backdrop-filter` blur has no native runtime (as in Surface/Card).
 *    `background="accent"/"accentSoft"` set only the container fill — the web
 *    also sets a `color`, but RN <Text> does not inherit color from a parent
 *    <View>, so content brings its own <Text> color (as in Surface/Card).
 *  - `as` (polymorphic element) and `className` are DOM-only and accepted-but-
 *    no-op. `style` passes through to the <View> as an escape hatch (applied
 *    last so it wins, mirroring the web's `...style`).
 */

import { type ElementType, type ReactNode } from 'react';
import { View, type ViewProps, type Style } from 'react-native';
import { t } from './tokens.ts';

// ---- Token unions, mirrored from @glacier/react's layout/types.ts ----------
// Redefined locally rather than imported: @glacier/native depends only on
// @glacier/commons + @glacier/spec, and a layout primitive has no spec. Keeping
// the unions here avoids a dependency on the web package while staying 1:1.

/** The space scale steps (1 unit = 4px at min viewport). */
export type SpaceStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;

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

/** The shared box style surface every layout primitive accepts. */
export interface BoxStyleProps {
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

export interface StackProps extends BoxStyleProps, FlowProps, Omit<ViewProps, 'children' | 'style'> {
  /** Web-only: the DOM element to render. Accepted but no-op on native. */
  as?: ElementType;
  /** Web-only: CSS class name. Accepted but no-op on native. */
  className?: string;
  /** Escape hatch: a flat style object merged last (mirrors the web's `style`). */
  style?: Style;
  children?: ReactNode;
}

// ---- prop -> RN value maps -------------------------------------------------

/** Collapse a responsive value to a single scalar: object -> `base`, else itself. */
function scalar<T>(value: Responsive<T> | undefined): T | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'object' && value !== null) return (value as Record<string, T>).base;
  return value;
}

const alignItemsMap: Record<Align, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

const justifyMap: Record<Justify, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

const backgroundMap: Record<Background, string> = {
  transparent: 'transparent',
  bg: t('bg'),
  surface: t('surface'),
  surfaceRaised: t('surface-raised'),
  surfaceSunken: t('surface-sunken'),
  accent: t('accent-solid'),
  accentSoft: t('accent-soft'),
  glass: t('glass-regular'),
};

/** Border color per token (base rule paints a hairline; these set the color). */
const borderColorFor = (border: Exclude<BorderToken, false>): string => {
  if (border === true) return t('border'); // web: data-border='default'
  if (border === 'subtle') return t('border-subtle');
  if (border === 'strong') return t('border-strong');
  return t('accent-border'); // 'accent'
};

/**
 * Stack — a vertical flow. Children stack with a token gap and no margins, so
 * the rhythm is always even. Defaults to gap 4 and stretched children,
 * identical to @glacier/react's Stack.
 */
export function Stack({
  as: _as,
  className: _className,
  gap = 4,
  align,
  justify,
  // box props
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
  style,
  children,
  ...rest
}: StackProps) {
  const box: Style = {
    display: 'flex',
    flexDirection: 'column',
    // Web `.box` sets min-width: 0 so flex children never overflow.
    minWidth: 0,
    // `.stack` defaults to stretched children; `align` overrides the cross axis.
    alignItems: align ? alignItemsMap[align] : 'stretch',
    gap: t(`space-${scalar(gap) ?? 4}`),
  };

  if (justify) box.justifyContent = justifyMap[justify];

  // Padding: widest to narrowest so a more specific edge wins (RN resolves
  // paddingLeft over paddingHorizontal over padding), matching the web cascade.
  const p = scalar(padding);
  if (p !== undefined) box.padding = t(`space-${p}`);
  const px = scalar(paddingX);
  if (px !== undefined) box.paddingHorizontal = t(`space-${px}`);
  const py = scalar(paddingY);
  if (py !== undefined) box.paddingVertical = t(`space-${py}`);
  if (paddingTop !== undefined) box.paddingTop = t(`space-${paddingTop}`);
  if (paddingRight !== undefined) box.paddingRight = t(`space-${paddingRight}`);
  if (paddingBottom !== undefined) box.paddingBottom = t(`space-${paddingBottom}`);
  if (paddingLeft !== undefined) box.paddingLeft = t(`space-${paddingLeft}`);

  // Surface fill. accent/accentSoft/glass extra text-color/blur are dropped
  // (see header): only the container background is painted here.
  if (background !== undefined) box.backgroundColor = backgroundMap[background];

  if (radius !== undefined) box.borderRadius = t(`radius-${radius}`);

  if (border) {
    box.borderWidth = t('hairline');
    box.borderStyle = 'solid';
    box.borderColor = borderColorFor(border);
  }

  // Resting drop shadow via boxShadow (react-native-web); parity with Card.
  if (elevation !== undefined) box.boxShadow = t(`shadow-${elevation}`);

  // Sizing. `fit`/`screen` resolve only on react-native-web (see header note).
  if (width === 'full') box.width = '100%';
  else if (width === 'auto') box.width = 'auto';
  else if (width === 'fit') box.width = 'fit-content';

  if (maxWidth !== undefined) box.maxWidth = maxWidth === 'full' ? '100%' : t(`container-${maxWidth}`);

  if (height === 'full') box.height = '100%';
  else if (height === 'auto') box.height = 'auto';
  else if (height === 'screen') box.minHeight = '100vh';

  // Flex-child behavior in a parent Row/Stack.
  if (grow) box.flexGrow = 1;
  if (shrink) box.flexShrink = 1;
  if (alignSelf !== undefined) box.alignSelf = alignItemsMap[alignSelf];

  // `style` is the web escape hatch: applied after the computed box so it wins.
  return (
    <View style={[box, style]} {...rest}>
      {children}
    </View>
  );
}
