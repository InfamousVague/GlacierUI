import { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { t } from './tokens.ts';
import type { NativeStyle } from './resolve.ts';

/**
 * Row — the horizontal flow primitive, rendered with React Native primitives.
 *
 * Unlike the kit's atoms this has NO @glacier/spec: it is a pure flexbox
 * wrapper, the native twin of @glacier/react's <Row>. It renders a single
 * <View> and maps the web's shared BoxStyleProps + FlowProps contract onto
 * React Native flex styles, resolving every scale key through t() so the tokens
 * stay identical to the DOM kit. Prop names, defaults (gap=3, wrap=false), and
 * resting layout (flex-direction: row, align-items: center, nowrap, min-width:0)
 * mirror `.box`/`.row` in Layout.module.css 1:1.
 *
 * Approximations, all documented so the docs can compare fairly:
 *  - Responsive space props: the web drives per-breakpoint padding/gap through
 *    CSS custom properties + media queries. React Native has no runtime media
 *    queries, so a Responsive object collapses to its `base` step and the wider
 *    breakpoints are dropped.
 *  - `background='accent' | 'accentSoft'` paints its fill but drops the web's
 *    inherited text color (RN <Text> does not inherit from a parent <View>, the
 *    same call Surface and Card make).
 *  - `background='glass'` renders its resting tint (`glass-regular`); the web's
 *    backdrop-filter blur has no native runtime and is a noop.
 *  - `width='fit'` collapses to 'auto' (react-native-web has no fit-content) and
 *    `height='screen'` maps to a 100vh min-height (a viewport unit that
 *    react-native-web resolves but a device build cannot).
 *  - The web-only escape hatches `as`, `className`, and `style` are accepted so
 *    the prop contract stays 1:1, but are noop here (no polymorphism / DOM).
 */

// ---- Prop unions, re-declared to match @glacier/react's layout/types.ts. The
// native package does not depend on @glacier/tokens or @glacier/react, so the
// scale keys live here; they cannot drift because the web derives them the same
// literal way and both feed the shared token names t() wraps.
export type SpaceStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;
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

export interface RowProps extends Omit<ViewProps, 'style'> {
  /** Space between children, from the space scale. Defaults to 3. */
  gap?: Responsive<SpaceStep>;
  /** Cross-axis (vertical) alignment. Defaults to center, like `.row`. */
  align?: Align;
  /** Main-axis (horizontal) distribution. */
  justify?: Justify;
  /** Wrap onto new lines when the row runs out of width. */
  wrap?: boolean;

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

  children?: ReactNode;

  // Web-only escape hatches from @glacier/react's <Row>. Accepted so the prop
  // contract compares 1:1; noop on native (no polymorphism, no DOM className).
  as?: unknown;
  className?: string;
  style?: unknown;
}

// ---- scale-key → React Native value maps -----------------------------------

const ALIGN_ITEMS: Record<Align, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

const JUSTIFY_CONTENT: Record<Justify, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

const BACKGROUND_TOKEN: Record<Exclude<Background, 'transparent'>, string> = {
  bg: 'bg',
  surface: 'surface',
  surfaceRaised: 'surface-raised',
  surfaceSunken: 'surface-sunken',
  accent: 'accent-solid',
  accentSoft: 'accent-soft',
  glass: 'glass-regular',
};

const BORDER_COLOR: Record<'default' | 'subtle' | 'strong' | 'accent', string> = {
  default: 'border',
  subtle: 'border-subtle',
  strong: 'border-strong',
  accent: 'accent-border',
};

const WIDTH_VALUE: Record<WidthToken, string> = {
  full: '100%',
  auto: 'auto',
  fit: 'auto', // react-native-web has no fit-content; content-sizing is the closest.
};

/** The base step of a responsive space value (RN has no breakpoint cascade). */
function baseStep(value: Responsive<SpaceStep> | undefined): SpaceStep | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return value;
  return value.base;
}

/**
 * The Glacier Row for React Native. A single flex <View> whose resting style
 * matches Layout.module.css's `.box` + `.row`; every prop maps to an RN flex
 * style with scale keys resolved through t().
 */
export function Row({
  gap = 3,
  align,
  justify,
  wrap = false,
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
  children,
  // Web-only, intentionally ignored.
  as: _as,
  className: _className,
  style: _style,
  ...rest
}: RowProps) {
  const s: NativeStyle = {
    flexDirection: 'row',
    flexWrap: wrap ? 'wrap' : 'nowrap',
    // `.box` pins min-width to 0 so flex children never overflow the container.
    minWidth: 0,
    // `.row` centers on the cross axis unless `align` overrides it.
    alignItems: align ? ALIGN_ITEMS[align] : 'center',
  };

  const gapStep = baseStep(gap);
  if (gapStep !== undefined) s.gap = t(`space-${gapStep}`);
  if (justify) s.justifyContent = JUSTIFY_CONTENT[justify];

  // Padding, resolved widest → narrowest like resolveBox: all sides, then the
  // axis props, then the individual edges, so the most specific value wins.
  const pAll = baseStep(padding);
  const pX = baseStep(paddingX);
  const pY = baseStep(paddingY);
  const pt = paddingTop ?? pY ?? pAll;
  const pr = paddingRight ?? pX ?? pAll;
  const pb = paddingBottom ?? pY ?? pAll;
  const pl = paddingLeft ?? pX ?? pAll;
  if (pt !== undefined) s.paddingTop = t(`space-${pt}`);
  if (pr !== undefined) s.paddingRight = t(`space-${pr}`);
  if (pb !== undefined) s.paddingBottom = t(`space-${pb}`);
  if (pl !== undefined) s.paddingLeft = t(`space-${pl}`);

  // Surface. accent/accentSoft drop the inherited text color; glass is its
  // resting tint only (backdrop blur is a noop) — same as Surface & Card.
  if (background === 'transparent') s.backgroundColor = 'transparent';
  else if (background) s.backgroundColor = t(BACKGROUND_TOKEN[background]);

  if (radius) s.borderRadius = t(`radius-${radius}`);

  if (border !== undefined && border !== false) {
    const key = border === true ? 'default' : border;
    s.borderWidth = t('hairline');
    s.borderStyle = 'solid';
    s.borderColor = t(BORDER_COLOR[key]);
  }

  if (elevation !== undefined) s.boxShadow = t(`shadow-${elevation}`);

  // Sizing.
  if (width) s.width = WIDTH_VALUE[width];
  if (maxWidth) s.maxWidth = maxWidth === 'full' ? '100%' : t(`container-${maxWidth}`);
  if (height === 'full') s.height = '100%';
  else if (height === 'auto') s.height = 'auto';
  else if (height === 'screen') s.minHeight = '100vh'; // `.box[data-h='screen']`

  // Flex child roles.
  if (grow) s.flexGrow = 1;
  if (shrink) s.flexShrink = 1;
  if (alignSelf) s.alignSelf = ALIGN_ITEMS[alignSelf];

  return (
    <View style={s} {...rest}>
      {children}
    </View>
  );
}
