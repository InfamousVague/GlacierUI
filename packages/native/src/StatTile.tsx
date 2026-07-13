import { type ReactNode } from 'react';
import { View, Text, type ViewProps } from 'react-native';
import { statTileSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { dimensionsFor, type NativeStyle } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

/**
 * StatTile — the @glacier/native binding of the web StatTile (a compact stat
 * micro-card: an optional leading icon disc, a prominent value, and a muted
 * label, with an optional trailing delta/hint on the value baseline).
 *
 * Paint and geometry are read from statTileSpec through the shared resolvers so
 * this stays pixel-identical to @glacier/react's StatTile and cannot drift:
 * - the top-level `paint` gives the resting solid surface (surface-raised fill,
 *   border-subtle hairline, text color); `glass` swaps in the frosted tint
 *   (glass-regular fill + glass-border hairline) plus the inset top highlight.
 * - `dimensions` give the tile gap/padding/radius, the icon disc size + radius,
 *   and the value/label/hint font sizes.
 *
 * Text color + fontSize live on <Text> (a bare string cannot sit in a View and
 * color does not inherit across a View in React Native). The icon arrives as a
 * decorative ReactNode and is wrapped in the sunken disc carrying `text-muted`
 * as its `color`, so a currentColor SVG picks it up on react-native-web,
 * matching the web `.icon` rule — we never render our own glyph.
 *
 * This is the resting visual only; the component itself does not animate and is
 * not tappable (the web `.tile` has no active/press scale). The web glass
 * `backdrop-filter` blur has no on-device equivalent and is dropped
 * (accepted-but-noop); glass renders as its resting tint + highlight shadow,
 * like Card/Callout. In skeleton mode the placeholders inherit Skeleton's own
 * static wash (its shimmer is a device follow-up).
 */

export interface StatTileProps extends Omit<ViewProps, 'style' | 'children'> {
  /** Optional leading glyph rendered in a muted disc. Decorative. */
  icon?: ReactNode;
  /** The prominent value - a number, currency, or short string. */
  value: ReactNode;
  /** The muted label naming what the value measures. */
  label: ReactNode;
  /** Optional trailing delta or hint, e.g. a change chip or timeframe. */
  hint?: ReactNode;
  /** Renders the frosted glass material instead of a solid card. */
  glass?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
}

// Size-independent box + type metrics read once from the spec: gap, radius,
// border, paddingBlock/Inline, the icon disc size + radius, and the
// value/label/hint font sizes — token names, plus the disc's raw 2.25rem length.
const DIMS = dimensionsFor(statTileSpec);

// The resting solid surface lives on the spec's top-level paint (there is no
// variant/tone group to resolve), so read it straight off and strip the `$`.
const BASE = (statTileSpec.paint ?? {}) as { background?: string; text?: string; border?: string };
const strip = (value: string | undefined, fallback: string): string =>
  (value ?? `$${fallback}`).replace(/^\$/, '');
const BASE_BG = strip(BASE.background, 'surface-raised');
const BASE_BORDER = strip(BASE.border, 'border-subtle');
const BASE_TEXT = strip(BASE.text, 'text');

/**
 * A resolved measurement value. `dimensionsFor` hands back token names alongside
 * raw CSS lengths; wrap the token names in the custom property and let a raw
 * length — anything that starts with a digit or dot — pass through so it never
 * becomes `var(--glacier-2.25rem)`.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

// The 2.25rem disc and the value's line box, reused by the offset calc below.
const VALUE_FONT_SIZE = metric(DIMS.valueFontSize, 'font-size-2xl');
const ICON_SIZE = metric(DIMS.iconSize, '2.25rem');
// Centers the icon disc on the value's first line box, verbatim from the web
// `--stat-tile-icon-offset` (a resting layout value, so it holds on rn-web).
const ICON_OFFSET = `calc((${VALUE_FONT_SIZE} * ${t('leading-2xl')} - ${ICON_SIZE}) / 2)`;

/** The outer card box, shared by the live and skeleton renders. */
function tileStyle(glass: boolean): NativeStyle {
  return {
    flexDirection: 'row',
    alignItems: 'flex-start',
    columnGap: metric(DIMS.gap, 'space-3'),
    minWidth: 0,
    backgroundColor: glass ? t('glass-regular') : t(BASE_BG),
    borderColor: glass ? t('glass-border') : t(BASE_BORDER),
    borderWidth: metric(DIMS.border, 'hairline'),
    borderStyle: 'solid',
    borderRadius: metric(DIMS.radius, 'radius-lg'),
    paddingVertical: metric(DIMS.paddingBlock, 'space-4'),
    paddingHorizontal: metric(DIMS.paddingInline, 'space-5'),
    // The frosted material's inset top highlight (matching `.glass`); its
    // backdrop blur has no on-device equivalent and is dropped.
    ...(glass ? { boxShadow: `inset 0 ${t('hairline')} 0 ${t('glass-highlight')}` } : null),
  };
}

// The sunken disc that frames the leading glyph, riding the value's baseline.
const iconDisc: NativeStyle = {
  flexShrink: 0,
  marginTop: ICON_OFFSET,
  alignItems: 'center',
  justifyContent: 'center',
  width: ICON_SIZE,
  height: ICON_SIZE,
  borderRadius: metric(DIMS.iconRadius, 'radius-md'),
  backgroundColor: t('surface-sunken'),
  // currentColor source for an SVG glyph on react-native-web; the disc's own
  // font-size/line-height match the web `.icon` rule.
  color: t('text-muted'),
  fontSize: t('font-size-lg'),
  lineHeight: 1,
};

// The value/label column and the value+hint row: min-width:0 so the value can
// truncate instead of pushing the hint out, matching the web `.body`/`.valueRow`.
const bodyStyle: NativeStyle = { flexDirection: 'column', rowGap: t('space-1'), minWidth: 0 };
const valueRowStyle: NativeStyle = {
  flexDirection: 'row',
  alignItems: 'baseline',
  columnGap: t('space-2'),
  minWidth: 0,
};

export function StatTile({
  icon,
  value,
  label,
  hint,
  glass = false,
  skeleton = false,
  ...rest
}: StatTileProps) {
  if (skeleton) {
    // Mirrors the live anatomy keyed off the same props: the icon-disc bone
    // renders only when the tile carries an icon, and the hint bone joins the
    // value row only when a hint will, so nothing shifts when the data lands.
    // The character-count widths (6ch/4ch/10ch) are declared inline by the web
    // component, not as tokens, so they are mirrored verbatim.
    return (
      <View style={tileStyle(glass)} {...rest}>
        {icon != null && (
          <View style={{ flexShrink: 0, marginTop: ICON_OFFSET }}>
            <Skeleton width={ICON_SIZE} height={ICON_SIZE} radius={metric(DIMS.iconRadius, 'radius-md')} />
          </View>
        )}
        <View style={bodyStyle}>
          <View style={valueRowStyle}>
            <Skeleton variant="text" width="6ch" height={VALUE_FONT_SIZE} />
            {hint != null && (
              <Skeleton variant="text" width="4ch" height={metric(DIMS.hintFontSize, 'font-size-xs')} />
            )}
          </View>
          <Skeleton variant="text" width="10ch" height={metric(DIMS.labelFontSize, 'font-size-sm')} />
        </View>
      </View>
    );
  }

  return (
    <View style={tileStyle(glass)} {...rest}>
      {icon != null && (
        // Decorative, hidden from assistive tech (web `aria-hidden`).
        <View aria-hidden={true} style={iconDisc}>
          {icon}
        </View>
      )}
      <View style={bodyStyle}>
        <View style={valueRowStyle}>
          <Text
            numberOfLines={1}
            style={{
              flexShrink: 1,
              minWidth: 0,
              color: t(BASE_TEXT),
              fontSize: VALUE_FONT_SIZE,
              lineHeight: t('leading-2xl') as never,
              fontFamily: t('font-sans'),
              fontWeight: t('font-weight-semibold') as never,
            }}
          >
            {value}
          </Text>
          {hint != null && (
            <Text
              style={{
                flexShrink: 0,
                color: t('text-muted'),
                fontSize: metric(DIMS.hintFontSize, 'font-size-xs'),
                lineHeight: t('leading-md') as never,
                fontFamily: t('font-sans'),
                fontWeight: t('font-weight-medium') as never,
              }}
            >
              {hint}
            </Text>
          )}
        </View>
        <Text
          style={{
            color: t('text-muted'),
            fontSize: metric(DIMS.labelFontSize, 'font-size-sm'),
            lineHeight: t('leading-md') as never,
            fontFamily: t('font-sans'),
          }}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}
