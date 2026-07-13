import { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { t } from './tokens.ts';

/**
 * The Glacier Center, rendered with React Native primitives.
 *
 * Center is a pure layout primitive with no @glacier/spec — the web renders a
 * single box with `.center` (`display: grid; place-items: center`) plus the
 * shared box style props. RN has no CSS grid, so the two-axis centering is
 * emulated with flexbox: a `<View>` (default `flexDirection: column`) with
 * `alignItems: 'center'` + `justifyContent: 'center'`, which is exactly what
 * `place-items: center` resolves to for a single-item container.
 *
 * The box style contract (padding / background / radius / border / elevation /
 * width / maxWidth / height / grow / shrink / alignSelf) is mapped 1:1 to the
 * same tokens the web reads from Layout.module.css, wrapped through `t()` so it
 * cannot drift from the DOM kit. Prop names and defaults match @glacier/react's
 * Center so the docs compare 1:1.
 *
 * Approximations / accepted-but-noop (reported):
 *  - Responsive space values (e.g. `padding={{ base: 2, md: 6 }}`) collapse to
 *    the `base` step: there is no runtime media query, so only base applies.
 *  - `background="accent"|"accentSoft"` sets only the View's backgroundColor;
 *    the web's paired text color is dropped because RN `<Text>` does not inherit
 *    color from a parent View (same as Surface/Card).
 *  - `background="glass"` renders its resting tint (`glass-regular`); the web's
 *    `backdrop-filter` blur has no native runtime.
 *  - `height="screen"` uses `minHeight: '100vh'` (resolved by react-native-web
 *    for the docs); a device build would swap this for a Dimensions value.
 *  - `width="fit"` emits `fit-content` (web-only) — on a device this falls back
 *    to intrinsic sizing.
 *  - Web-only props `as` (polymorphic element) and `className` are accepted but
 *    have no effect. `style` is honored as an escape hatch (merged last).
 */

// ---- box style prop contract (mirrors @glacier/react's layout/types.ts) ----

/** A value that can vary by breakpoint. Scalars apply at every width. */
export type Responsive<T> = T | Partial<Record<'base' | 'sm' | 'md' | 'lg' | 'xl', T>>;

/** Step numbers on the shared space scale. */
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

type NativeStyle = Record<string, string | number>;

export interface CenterProps extends BoxStyleProps, Omit<ViewProps, 'style'> {
  /** Web-only polymorphic element type. Accepted but ignored on native. */
  as?: unknown;
  /** Web-only class hook. Accepted but ignored on native. */
  className?: string;
  /** Escape hatch merged last onto the View style (native style object). */
  style?: NativeStyle;
  children?: ReactNode;
}

/** Resolve a (possibly responsive) space value to its base step token. */
function baseStep(value: Responsive<SpaceStep> | undefined): string | undefined {
  if (value === undefined) return undefined;
  const step = typeof value === 'object' ? value.base : value;
  return step === undefined ? undefined : t(`space-${step}`);
}

const BACKGROUND_TOKEN: Record<Background, string> = {
  transparent: 'transparent',
  bg: t('bg'),
  surface: t('surface'),
  surfaceRaised: t('surface-raised'),
  surfaceSunken: t('surface-sunken'),
  accent: t('accent-solid'),
  accentSoft: t('accent-soft'),
  glass: t('glass-regular'),
};

const BORDER_COLOR: Record<'default' | 'subtle' | 'strong' | 'accent', string> = {
  default: t('border'),
  subtle: t('border-subtle'),
  strong: t('border-strong'),
  accent: t('accent-border'),
};

const WIDTH_VALUE: Record<WidthToken, string> = {
  full: '100%',
  auto: 'auto',
  fit: 'fit-content',
};

const ALIGN_SELF: Record<Align, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

/** Turn the box style props into a single React Native style object. */
function resolveBox(props: BoxStyleProps): NativeStyle {
  const style: NativeStyle = {};

  // Padding, widest to narrowest. RN resolves edge specificity itself
  // (padding < paddingVertical/Horizontal < paddingTop/Right/Bottom/Left),
  // matching the web's base-to-specific cascade.
  const padding = baseStep(props.padding);
  if (padding !== undefined) style.padding = padding;
  const paddingX = baseStep(props.paddingX);
  if (paddingX !== undefined) style.paddingHorizontal = paddingX;
  const paddingY = baseStep(props.paddingY);
  if (paddingY !== undefined) style.paddingVertical = paddingY;
  if (props.paddingTop !== undefined) style.paddingTop = t(`space-${props.paddingTop}`);
  if (props.paddingRight !== undefined) style.paddingRight = t(`space-${props.paddingRight}`);
  if (props.paddingBottom !== undefined) style.paddingBottom = t(`space-${props.paddingBottom}`);
  if (props.paddingLeft !== undefined) style.paddingLeft = t(`space-${props.paddingLeft}`);

  if (props.background !== undefined) style.backgroundColor = BACKGROUND_TOKEN[props.background];
  if (props.radius !== undefined) style.borderRadius = t(`radius-${props.radius}`);

  if (props.border !== undefined && props.border !== false) {
    const key = props.border === true ? 'default' : props.border;
    style.borderColor = BORDER_COLOR[key];
    style.borderWidth = t('hairline');
    style.borderStyle = 'solid';
  }

  if (props.elevation !== undefined) style.boxShadow = t(`shadow-${props.elevation}`);

  if (props.width !== undefined) style.width = WIDTH_VALUE[props.width];
  if (props.maxWidth !== undefined) {
    style.maxWidth = props.maxWidth === 'full' ? '100%' : t(`container-${props.maxWidth}`);
  }
  if (props.height !== undefined) {
    if (props.height === 'screen') style.minHeight = '100vh';
    else style.height = props.height === 'full' ? '100%' : 'auto';
  }

  if (props.grow) style.flexGrow = 1;
  if (props.shrink) style.flexShrink = 1;
  if (props.alignSelf !== undefined) style.alignSelf = ALIGN_SELF[props.alignSelf];

  return style;
}

/**
 * Centers its children on both axes. Pair with height="screen" for a
 * full-viewport centered layout, or a fixed height for a panel.
 */
export function Center({
  as: _as,
  className: _className,
  style,
  children,
  // box style props
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
  ...rest
}: CenterProps) {
  const box = resolveBox({
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
  });

  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center' }, box, style]} {...rest}>
      {children}
    </View>
  );
}
