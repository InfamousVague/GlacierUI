/*
 * Grid — the two-dimensional flow primitive, rendered with React Native
 * primitives.
 *
 * Like Stack/Row this is a spec-less LAYOUT primitive (a pure flexbox wrapper),
 * the native twin of @glacier/react's <Grid>. The web version is a real CSS
 * grid: `grid-template-columns: repeat(columns, minmax(0, 1fr))`, or an auto-fit
 * `repeat(auto-fit, minmax(min(minChildWidth, 100%), 1fr))`. React Native has no
 * CSS grid, so the columns are EMULATED with a flex-wrap row plus per-child cell
 * widths (see below). Prop names + defaults (gap=4, columns=1) are kept identical
 * to the web component so the docs Web/Native toggle compares 1:1, and every
 * scale key resolves through t() so the tokens match the DOM kit.
 *
 * ── The grid approximation ──────────────────────────────────────────────────
 * The container is a flex row that wraps, with a token `gap`. Each child is
 * wrapped in a cell <View> that carries the track width — the web renders
 * children directly as grid items; the cell wrapper is the mechanism RN needs to
 * size each track:
 *   • Fixed `columns=N`: each cell is `flexBasis: calc((100% - (N-1)*gap)/N)`
 *     with grow/shrink 0 and `minWidth: 0`, so exactly N equal tracks fit per
 *     line and children floor at zero and never overflow (matching minmax(0,1fr)).
 *   • `minChildWidth`: each cell is `flexBasis: minChildWidth` with `flexGrow: 1`
 *     so cells fill the line and wrap once another minChildWidth track no longer
 *     fits — a close analogue of `auto-fit` that reflows with no media queries.
 *
 * ── Approximations / web-only surface (report) ──────────────────────────────
 *  - Responsive props (gap/columns/padding accept a per-breakpoint object on
 *    web). RN has no media-query runtime, so a responsive value collapses to its
 *    `base` entry; a bare scalar applies at every width.
 *  - `background='accent'|'accentSoft'` paints only the fill; the web also sets an
 *    inherited text color, but RN <Text> does not inherit from a parent <View>,
 *    so content brings its own color (as in Surface/Card/Stack).
 *  - `background='glass'` renders its resting tint (`glass-regular`); the web's
 *    backdrop-filter blur has no native runtime and is a noop.
 *  - `width='fit'` emits `fit-content` and `height='screen'` emits `100vh`;
 *    `flexBasis` uses `calc()`/`rem`. These resolve on react-native-web (docs)
 *    but have no device equivalent — web-parity only.
 *  - `as` (polymorphic element) and `className` are DOM-only and accepted-but-
 *    noop. `style` passes through to the <View> as an escape hatch (applied last
 *    so it wins, mirroring the web's `...style`).
 */

import { Children, type ElementType, type ReactNode } from 'react';
import { View, type ViewProps, type Style } from 'react-native';
import { t } from './tokens.ts';

// ---- Token unions, mirrored from @glacier/react's layout/types.ts ----------
// Redefined locally rather than imported: @glacier/native depends only on
// @glacier/commons + @glacier/spec, and a layout primitive has no spec. Keeping
// the unions here avoids a dependency on the web package while staying 1:1.

/** The space scale steps (1 unit = 4px at min viewport). */
export type SpaceStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;

/** A value that can vary by breakpoint. Scalars apply at every width; native uses `base`. */
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
  /** Allow shrinking below content size. */
  shrink?: boolean;
  alignSelf?: Align;
}

export interface GridProps extends BoxStyleProps, Omit<ViewProps, 'children' | 'style'> {
  /** Space between tracks, from the space scale. Defaults to 4. Responsive → `base`. */
  gap?: Responsive<SpaceStep>;
  /** Fixed column count (responsive → `base`). Ignored when minChildWidth is set. */
  columns?: Responsive<number>;
  /** Auto-fit as many equal tracks as fit at this minimum child width. */
  minChildWidth?: string;
  align?: Align;
  justify?: Justify;
  children?: ReactNode;

  /** Web-only: the DOM element to render. Accepted but no-op on native. */
  as?: ElementType;
  /** Web-only: CSS class name. Accepted but no-op on native. */
  className?: string;
  /** Escape hatch: a flat style object merged last (mirrors the web's `style`). */
  style?: Style;
}

// ---- prop -> RN value maps -------------------------------------------------

/** Collapse a responsive value to a single scalar: object -> `base`, else itself. */
function scalar<T>(value: Responsive<T> | undefined): T | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'object' && value !== null) return (value as Record<'base', T>).base;
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
 * Grid — an equal-column layout. Give it a fixed `columns` count or a
 * `minChildWidth` to auto-fit as many tracks as fit; children never overflow
 * since each track floors at zero. Defaults (gap 4, columns 1) match
 * @glacier/react's Grid.
 */
export function Grid({
  as: _as,
  className: _className,
  gap = 4,
  columns = 1,
  minChildWidth,
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
}: GridProps) {
  const gapStep = scalar(gap) ?? 4;
  const gapToken = t(`space-${gapStep}`);
  const cols = scalar(columns) ?? 1;

  const box: Style = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    // Web `.box` pins min-width to 0 so flex children never overflow.
    minWidth: 0,
    gap: gapToken,
    // CSS grid items default to `stretch` on the cross axis; `align` overrides.
    alignItems: align ? alignItemsMap[align] : 'stretch',
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

  // Surface fill. accent/accentSoft text color + glass blur are dropped (header).
  if (background !== undefined) box.backgroundColor = backgroundMap[background];
  if (radius !== undefined) box.borderRadius = t(`radius-${radius}`);
  if (border) {
    box.borderWidth = t('hairline');
    box.borderStyle = 'solid';
    box.borderColor = borderColorFor(border);
  }
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

  // Per-child cell width carries the track sizing (see header). Auto-fit cells
  // grow to fill and wrap below minChildWidth; fixed cells are exact fractions
  // that subtract the inter-track gaps and floor at zero.
  const cell: Style = minChildWidth
    ? { flexGrow: 1, flexShrink: 1, flexBasis: minChildWidth, minWidth: 0 }
    : {
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: cols > 1 ? `calc((100% - ${cols - 1} * ${gapToken}) / ${cols})` : '100%',
        minWidth: 0,
      };

  // `style` is the web escape hatch: applied after the computed box so it wins.
  return (
    <View style={[box, style]} {...rest}>
      {Children.toArray(children).map((child, i) => (
        <View key={i} style={cell}>
          {child}
        </View>
      ))}
    </View>
  );
}
