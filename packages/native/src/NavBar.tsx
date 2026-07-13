/**
 * NavBar — the @glacier/native binding of the web structure.
 *
 * KIND: compose. A navigation bar/rail built from native primitives (View /
 * Pressable / Text + the CounterBadge / Skeleton / Tooltip siblings), matching
 * the DOM kit's `nav` landmark of icon-and-label items with a sliding active
 * pill. Paint and geometry are read from `navBarSpec` through the shared
 * resolvers so it cannot drift from NavBar.module.css:
 *   - dimensions → the space-12 rail width, control-height-md item size, space-1
 *                  bar gap, space-2 padding, space-3 item inline padding, and the
 *                  radius-md corners / pill.
 *   - states.active → the accent-soft pill background, accent-text active text,
 *                  and the font-weight-medium active label.
 * The resting item text (text-muted), the icon–label gap (space-2), and the
 * 1.125rem icon square are base values carried verbatim from the web `.item` /
 * `.icon` rules (the spec's top-level item paint is empty and those values are
 * not tokenized).
 *
 * ORIENTATION: horizontal is a row of icon+label items; vertical is a slim
 * square-icon rail whose labels collapse into an aria-label plus a right-placed
 * Tooltip. Items read the bar's orientation from a context; used outside a
 * NavBar an item lays out as a horizontal (labelled) item, exactly like the web.
 *
 * RESTING VISUALS ONLY. Web-only fidelity that is accepted-but-noop here
 * (reported in the wave notes):
 *   - spring / the sliding pill — there is no motion runtime on this binding, so
 *     the active pill renders as a RESTING absolute element under the item and
 *     `spring` is accepted for prop parity with no animated effect (the web
 *     springs a shared layout element between items).
 *   - hover wash + focus ring + the color-ease transition — pointer/focus states
 *     the native binding does not run.
 *   - as / href / target / rel — DOM polymorphism (render an <a>); every item is
 *     a Pressable here (accessibilityRole flips to "link" when linked). Wire
 *     navigation through onPress. Accepted for a 1:1 contract, otherwise no-op.
 *   - className — DOM escape hatch, ignored.
 */

import { createContext, useContext, type ElementType, type ReactNode } from 'react';
import { View, Text, Pressable, type PressableProps, type ViewProps } from 'react-native';
import { navBarSpec, navBarOrientations, navBarSprings } from '@glacier/spec';
import { t } from './tokens.ts';
import { paintFor, dimensionsFor } from './resolve.ts';
import { CounterBadge } from './CounterBadge.tsx';
import { Skeleton } from './Skeleton.tsx';
import { Tooltip } from './Tooltip.tsx';

// Derived from the spec so the unions cannot drift from the web kit.
export type NavBarOrientation = (typeof navBarOrientations)[number];
export type NavBarSpring = (typeof navBarSprings)[number];

// Shared with NavBarItem so items know the bar's orientation. null when an item
// is used outside a NavBar, where it lays out as a horizontal (labelled) item.
interface NavBarContextValue {
  orientation: NavBarOrientation;
}
const NavBarContext = createContext<NavBarContextValue | null>(null);

// Size-independent geometry read once from the spec (all tokenized).
const DIMS = dimensionsFor(navBarSpec);
const RAIL_SIZE = t(DIMS.railSize ?? 'space-12');
const ITEM_SIZE = t(DIMS.itemSize ?? 'control-height-md');
const GAP = t(DIMS.gap ?? 'space-1');
const PADDING = t(DIMS.padding ?? 'space-2');
const ITEM_PAD_INLINE = t(DIMS.itemPaddingInline ?? 'space-3');
const RADIUS = t(DIMS.radius ?? 'radius-md');

// The active item's paint: the accent-soft sliding pill, accent-text label, and
// the font-weight-medium active weight. Resting label text is the web `.item`
// base (text-muted), which the spec leaves out of its paint.
const ACTIVE = paintFor(navBarSpec, 'states', 'active');
const PILL_BG = t(ACTIVE.background ?? 'accent-soft');
const ACTIVE_TEXT = t(ACTIVE.text ?? 'accent-text');
const ACTIVE_WEIGHT = t(ACTIVE.weight ?? 'font-weight-medium');
const REST_TEXT = t('text-muted');

// The icon–label gap and the icon square are declared inline by the web CSS, not
// as tokens, so they are carried verbatim.
const ITEM_GAP = t('space-2');
const ICON_SIZE = '1.125rem';

// Item widths for the horizontal skeleton, one entry per placeholder item.
const SKELETON_ITEM_WIDTHS = ['5rem', '6rem', '5.5rem', '4.5rem'];

export interface NavBarProps extends Omit<ViewProps, 'style' | 'children'> {
  /** Horizontal row for a top nav or bottom tab bar; vertical for a slim icon rail. */
  orientation?: NavBarOrientation;
  /** Required: apps often carry more than one nav landmark, and the label tells them apart. */
  'aria-label': string;
  /** Pinned to the far end (bottom when vertical, trailing edge when horizontal), for a settings item. */
  end?: ReactNode;
  /** Spring preset for the active pill. Accepted for parity; no motion runtime on this binding. */
  spring?: NavBarSpring;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Web-only DOM escape hatch, accepted-but-noop on native. */
  className?: string;
  children?: ReactNode;
}

/**
 * The Glacier NavBar, rendered with React Native primitives. Horizontal it is a
 * row of icon-and-label items; vertical it is a slim icon rail of square buttons
 * with tooltips carrying the labels. Fill it with NavBarItem and pin a settings
 * item in the end slot. Geometry and the active-pill paint are read from the
 * nav-bar spec so it stays visually locked to @glacier/react's NavBar.
 */
export function NavBar({
  orientation = 'horizontal',
  end,
  spring: _spring = 'snappy',
  skeleton = false,
  className: _className,
  children,
  'aria-label': ariaLabel,
  ...rest
}: NavBarProps) {
  const vertical = orientation === 'vertical';

  const navStyle = {
    flexDirection: (vertical ? 'column' : 'row') as 'row' | 'column',
    alignItems: 'center' as const,
    columnGap: GAP,
    rowGap: GAP,
    minWidth: 0,
    ...(vertical
      ? { width: RAIL_SIZE, height: '100%', minHeight: 0, paddingVertical: PADDING }
      : { padding: PADDING }),
  };

  const itemsStyle = {
    flexDirection: (vertical ? 'column' : 'row') as 'row' | 'column',
    alignItems: 'center' as const,
    columnGap: GAP,
    rowGap: GAP,
    minWidth: 0,
  };

  // The end slot hugs the far edge: trailing when horizontal, bottom when vertical.
  const endStyle = {
    flexShrink: 0,
    flexDirection: (vertical ? 'column' : 'row') as 'row' | 'column',
    alignItems: 'center' as const,
    columnGap: GAP,
    rowGap: GAP,
    ...(vertical ? { marginTop: 'auto' as const } : { marginStart: 'auto' as const }),
  };

  if (skeleton) {
    // Same regions, geometry, and radius as the live bar. Decorative, so hidden
    // from a11y. The end square renders regardless of the `end` prop, matching
    // the web skeleton.
    const widths = vertical ? SKELETON_ITEM_WIDTHS.map(() => ITEM_SIZE) : SKELETON_ITEM_WIDTHS;
    return (
      <View aria-hidden={true} style={navStyle} {...rest}>
        <View style={itemsStyle}>
          {widths.map((width, index) => (
            <Skeleton key={index} width={width} height={ITEM_SIZE} radius={RADIUS} />
          ))}
        </View>
        <View style={endStyle}>
          <Skeleton width={ITEM_SIZE} height={ITEM_SIZE} radius={RADIUS} />
        </View>
      </View>
    );
  }

  return (
    <NavBarContext.Provider value={{ orientation }}>
      <View accessibilityRole="navigation" aria-label={ariaLabel} style={navStyle} {...rest}>
        <View style={itemsStyle}>{children}</View>
        {end != null && <View style={endStyle}>{end}</View>}
      </View>
    </NavBarContext.Provider>
  );
}

export interface NavBarItemProps extends Omit<PressableProps, 'style' | 'children'> {
  /** Rendered element on the web. DOM-only; every item is a Pressable on native. (No-op.) */
  as?: ElementType;
  /** Anchor href on the web; flips the native role to "link". Wire navigation via onPress. (No-op otherwise.) */
  href?: string;
  /** DOM anchor target. Accepted for parity; no effect on native. (No-op.) */
  target?: string;
  /** DOM anchor rel. Accepted for parity; no effect on native. (No-op.) */
  rel?: string;
  /** Required leading glyph, hidden from assistive tech. */
  icon: ReactNode;
  /**
   * Required label. Visible text in horizontal orientation; in vertical it
   * becomes the accessible name and a Tooltip placed to the right.
   */
  label: string;
  /** Highlights the item as the current location. */
  active?: boolean;
  /** Optional count shown as a CounterBadge: pinned to the icon corner in vertical, inline in horizontal. */
  badge?: number;
  /** Web-only DOM escape hatch, accepted-but-noop on native. */
  className?: string;
}

/**
 * One destination in a NavBar: an icon with a label, an optional count badge,
 * and the resting active pill. In the vertical rail the label collapses into an
 * aria-label plus a right-placed Tooltip, so the item stays a square icon
 * button. Reads the bar's orientation from context; used outside a NavBar it
 * renders as a horizontal, labelled item with a static pill.
 */
export function NavBarItem({
  as,
  href,
  target: _target,
  rel: _rel,
  icon,
  label,
  active = false,
  badge,
  disabled = false,
  className: _className,
  ...rest
}: NavBarItemProps) {
  const context = useContext(NavBarContext);
  const vertical = context?.orientation === 'vertical';
  const isLink = href != null || as === 'a';
  const contentColor = active ? ACTIVE_TEXT : REST_TEXT;

  const itemStyle = {
    position: 'relative' as const,
    flexShrink: 0,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    columnGap: ITEM_GAP,
    borderRadius: RADIUS,
    backgroundColor: 'transparent',
    ...(vertical
      ? { width: ITEM_SIZE, height: ITEM_SIZE }
      : { height: ITEM_SIZE, paddingHorizontal: ITEM_PAD_INLINE }),
    ...(disabled ? { opacity: 0.5 } : null),
  };

  const item = (
    <Pressable
      accessibilityRole={isLink ? 'link' : 'button'}
      accessibilityState={{ selected: active, disabled }}
      aria-label={vertical ? label : undefined}
      disabled={disabled}
      style={itemStyle}
      {...rest}
    >
      {/* The active pill: a resting absolute element behind the item content
          (painted first so the icon/label sit above it). */}
      {active && (
        <View
          aria-hidden={true}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            borderRadius: RADIUS,
            backgroundColor: PILL_BG,
          }}
        />
      )}
      <View
        aria-hidden={true}
        style={{
          position: 'relative',
          flexShrink: 0,
          width: ICON_SIZE,
          height: ICON_SIZE,
          alignItems: 'center',
          justifyContent: 'center',
          // A currentColor SVG picks up this color on react-native-web, matching
          // the web `.item` color (text-muted, accent-text when active).
          color: contentColor,
        }}
      >
        {icon}
      </View>
      {!vertical && (
        <Text
          numberOfLines={1}
          style={{
            position: 'relative',
            minWidth: 0,
            color: contentColor,
            fontSize: t('font-size-sm'),
            fontFamily: t('font-sans'),
            ...(active ? { fontWeight: ACTIVE_WEIGHT as never } : null),
          }}
        >
          {label}
        </Text>
      )}
      {badge !== undefined &&
        (vertical ? (
          // In the rail the badge pins to the top-right corner of the icon square.
          <View style={{ position: 'absolute', top: t('space-1'), right: t('space-1'), zIndex: 2 }}>
            <CounterBadge count={badge} size="sm" />
          </View>
        ) : (
          <CounterBadge count={badge} size="sm" />
        ))}
    </Pressable>
  );

  // The rail has no visible labels, so every item carries its own tooltip.
  if (vertical) {
    return (
      <Tooltip content={label} placement="right">
        {item}
      </Tooltip>
    );
  }
  return item;
}
