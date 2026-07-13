import { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { toolbarSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { paintFor, dimensionsFor } from './resolve.ts';

// Size-independent metrics (padding, gap) read once from the toolbar spec so the
// bar cannot drift from Toolbar.module.css.
const BOX = dimensionsFor(toolbarSpec);

// The optional bottom rule and the glass surface pull their tokens from the
// spec's `border` / `surface` states rather than re-transcribing the CSS.
const BORDER_COLOR = t(paintFor(toolbarSpec, 'states', 'border').border ?? 'border-subtle');
const SURFACE_BG = t(paintFor(toolbarSpec, 'states', 'surface').background ?? 'glass-thin');

export interface ToolbarProps extends Omit<ViewProps, 'children' | 'style'> {
  /** Content pinned to the start, such as a menu button or a title. */
  start?: ReactNode;
  /** Content pinned to the end, such as actions. */
  end?: ReactNode;
  /** Stick to the top of the scroll container. */
  sticky?: boolean;
  /** Add a bottom hairline. */
  border?: boolean;
  /** Add the translucent glass background, for app and page headers. */
  surface?: boolean;
  children?: ReactNode;
}

/**
 * The Glacier Toolbar, rendered with React Native primitives. It is a horizontal
 * row with a fixed start slot, a flexible middle that grows so the end slot hugs
 * the trailing edge, and a fixed end slot. Geometry (even padding + the space-3
 * gap) is read from the toolbar spec through the shared resolvers, and the
 * optional hairline / glass paint come from the spec's `border` / `surface`
 * states, so it stays visually identical to @glacier/react's Toolbar.
 *
 * Slots and middle content arrive as ReactNode props/children and render as-is;
 * each slot is a plain <View> row with the same space-3 gap the web slot uses.
 * The toolbar sets no text color of its own — its content brings its own <Text>,
 * and RN text does not inherit color (nor font-family) from a parent View, so
 * the web's container-level `font-family: font-sans` is a no-op here.
 *
 * Two web features have no native runtime and are accepted-but-noop:
 *   - `sticky` is pure scroll-container positioning (position: sticky, top 0,
 *     z-index 20) with zero paint; it has no effect outside a web ScrollView and
 *     is not applied. The prop is kept for a 1:1 contract.
 *   - `surface`'s `backdrop-filter` blur/saturate renders as its resting
 *     glass-thin tint only, mirroring how Card/Banner treat glass on native.
 * The `className` / `style` / DOM escape hatches on the web `div` are web-only
 * and are not part of the native contract.
 */
export function Toolbar({
  start,
  end,
  sticky = false,
  border = false,
  surface = false,
  children,
  ...rest
}: ToolbarProps) {
  const gap = t(BOX.gap ?? 'space-3');

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: gap,
        minWidth: 0,
        // even padding on every side, matched to the spec's dimensions
        padding: t(BOX.padding ?? 'space-3'),
        ...(surface && { backgroundColor: SURFACE_BG }),
        ...(border && {
          borderBottomWidth: t('hairline'),
          borderBottomColor: BORDER_COLOR,
          borderStyle: 'solid' as const,
        }),
      }}
      {...rest}
    >
      {start != null && (
        <View
          style={{ flexShrink: 0, flexDirection: 'row', alignItems: 'center', columnGap: gap }}
        >
          {start}
        </View>
      )}
      <View
        style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', columnGap: gap }}
      >
        {children}
      </View>
      {end != null && (
        <View
          style={{ flexShrink: 0, flexDirection: 'row', alignItems: 'center', columnGap: gap }}
        >
          {end}
        </View>
      )}
    </View>
  );
}
