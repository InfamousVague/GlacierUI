import { type ReactNode } from 'react';
import { View, Text, type ViewProps } from 'react-native';
import { titleBarSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { paintFor, dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

// Size-independent geometry read once from the title-bar spec so the bar cannot
// drift from TitleBar.module.css. `height` and `trafficLightInset` are declared
// as raw CSS lengths in the spec (window chrome must not breathe with density,
// and the 88px gutter is a fixed macOS measurement) so they pass straight
// through; the padding/gap/border metrics are `$token` refs wrapped with t().
const DIMS = dimensionsFor(titleBarSpec);
const HEIGHT = DIMS.height ?? '3.25rem';
const PADDING_INLINE = t(DIMS.paddingInline ?? 'space-3');
const COLUMN_GAP = t(DIMS.gap ?? 'space-3');
const SLOT_GAP = t(DIMS.slotGap ?? 'space-2');
const TRAFFIC_LIGHT_INSET = DIMS.trafficLightInset ?? '88px';
const BORDER_WIDTH = t(DIMS.border ?? 'hairline');

// Paint read from the spec states: the translucent glass-thin surface and the
// bottom hairline color, matching the `.bar[data-surface]` / `.bar[data-border]`
// rules. blur-md + glass-saturate back the web backdrop-filter and have no
// native runtime, so the surface renders as its resting tint (like Card glass).
const SURFACE_BG = t(paintFor(titleBarSpec, 'states', 'surface').background ?? 'glass-thin');
const BORDER_COLOR = t(paintFor(titleBarSpec, 'states', 'border').border ?? 'border-subtle');

export interface TitleBarProps extends Omit<ViewProps, 'style' | 'children'> {
  /** One-line centered title, small and muted. It truncates instead of wrapping. */
  title?: ReactNode;
  /** Content pinned to the start, after the traffic-light gutter. Stays clickable. */
  start?: ReactNode;
  /** Content pinned to the end, such as window-level actions. Stays clickable. */
  end?: ReactNode;
  /**
   * Reserve an 88px inline-start gutter for the macOS close, minimize, and
   * zoom buttons that a titleBarStyle Overlay window paints over the bar.
   */
  trafficLightInset?: boolean;
  /** The translucent glass background with backdrop blur, like the app header. */
  surface?: boolean;
  /** A bottom hairline separating the bar from the window content. */
  border?: boolean;
  /** Renders a placeholder with the bar's exact geometry. */
  skeleton?: boolean;
  /** Extra centered content beside the title, such as a search field. */
  children?: ReactNode;
  /**
   * Web-only: the header's ARIA landmark role. RN has no `banner` landmark, so
   * this is accepted-but-noop here; the native bar exposes no role of its own.
   */
  role?: string;
  /** Web-only DOM escape hatch, accepted-but-noop on native. */
  className?: string;
}

/**
 * The Glacier TitleBar, rendered with React Native primitives. The desktop
 * window bar for Tauri and Electron shells: a fixed-height strip that centers a
 * one-line title (plus any children) and can reserve the macOS traffic-light
 * gutter. Geometry (height, padding, gaps, gutter, hairline) and paint (the
 * glass-thin surface + border-subtle bottom rule) are read from the title-bar
 * spec through the shared resolvers, so it stays visually locked to
 * @glacier/react's TitleBar.
 *
 * The web uses a `1fr auto 1fr` CSS grid to keep the middle truly centered even
 * with lopsided slots. React Native has no grid, so this composes a plain row
 * of three <View>s where the two side slots take equal flex (`flex: 1`) and the
 * center sits at content width between them, which keeps the title centered for
 * balanced slots. Layout uses flexDirection/gap per the native compose rule
 * rather than depending on the Stack/Row siblings.
 *
 * Resting visuals only. Web-only fidelity that is accepted-but-noop on native:
 * the `data-tauri-drag-region` window-drag attribute (no window chrome to drag
 * on device), the `surface` backdrop-filter blur (rendered as its resting glass
 * tint), the `user-select: none` chrome guard, and the `role` / `className`
 * DOM props. The title is wrapped in <Text> with numberOfLines={1} for the
 * web's nowrap + ellipsis truncation, since RN cannot render a bare string in a
 * View and text color/size must live on <Text>.
 */
export function TitleBar({
  title,
  start,
  end,
  trafficLightInset = false,
  surface = true,
  border = true,
  skeleton = false,
  children,
  // Web-only props; kept for a 1:1 docs contract, no-op on native.
  role: _role,
  className: _className,
  ...rest
}: TitleBarProps) {
  const bar = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    height: HEIGHT,
    minWidth: 0,
    columnGap: COLUMN_GAP,
    // padding-inline: space-3, with the inline start swapped for the fixed
    // 88px gutter when the traffic-light inset is on.
    paddingLeft: trafficLightInset ? TRAFFIC_LIGHT_INSET : PADDING_INLINE,
    paddingRight: PADDING_INLINE,
    ...(surface ? { backgroundColor: SURFACE_BG } : null),
    ...(border
      ? { borderBottomWidth: BORDER_WIDTH, borderBottomColor: BORDER_COLOR, borderStyle: 'solid' as const }
      : null),
  };

  const slotBase = {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    columnGap: SLOT_GAP,
    minWidth: 0,
  };

  if (skeleton) {
    // Same element, height, padding, and regions as the live bar, with a text
    // shimmer where the title sits. Decorative, so it is hidden from a11y.
    return (
      <View aria-hidden={true} style={bar} {...rest}>
        <View style={slotBase} />
        <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: SLOT_GAP, minWidth: 0, overflow: 'hidden' }}>
          <Skeleton variant="text" width="8rem" />
        </View>
        <View style={{ ...slotBase, justifyContent: 'flex-end' }} />
      </View>
    );
  }

  return (
    <View style={bar} {...rest}>
      <View style={{ ...slotBase, justifyContent: 'flex-start' }}>{start}</View>
      <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: SLOT_GAP, minWidth: 0, overflow: 'hidden' }}>
        {title != null && (
          <Text
            numberOfLines={1}
            style={{
              minWidth: 0,
              fontFamily: t('font-sans'),
              fontSize: t('font-size-sm'),
              fontWeight: t('font-weight-medium') as never,
              color: t('text-muted'),
            }}
          >
            {title}
          </Text>
        )}
        {children}
      </View>
      <View style={{ ...slotBase, justifyContent: 'flex-end' }}>{end}</View>
    </View>
  );
}
