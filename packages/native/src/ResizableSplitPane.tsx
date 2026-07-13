/**
 * The Glacier ResizableSplitPane, rendered with React Native primitives. It
 * hosts exactly two children — a start pane and an end pane — and sizes the
 * start pane to a fraction (`ratio`/`defaultRatio`) of the container, laid out
 * with flex per orientation (a row with a vertical divider when horizontal, a
 * column with a horizontal divider when vertical). The corner radius, divider
 * thickness (hairline), grip length (space-6) and the root surface paint are
 * read from the resizable-split-pane spec through the shared resolvers, so the
 * resting split is visually identical to @glacier/react's ResizableSplitPane
 * and cannot drift from it.
 *
 * Resting visuals only. The divider is STATIC: the web drives resize through
 * pointer capture + pointermove and keyboard arrows/Home/End, none of which
 * have a runtime here (there is no PanResponder in this binding). The divider
 * therefore renders at the resting split and does not move; `onRatioChange`,
 * `min`, `max`, `step`, and `resetRatio` are accepted for a 1:1 prop contract
 * but are inert without a drag/keyboard runtime. A controlled `ratio` is still
 * honored through `useControlled`, so a parent that owns the ratio repaints the
 * split. The grip pill (a web hover/focus reveal, opacity 0→1) is shown at rest
 * as the touch drag affordance — a documented approximation, since touch has no
 * hover; its white fill is the web CSS literal (not a spec token). The focus
 * ring and the divider's hover/focus accent-solid fill are focus/hover states,
 * not part of the resting paint. The web `className`/`style` DOM escape hatches
 * are not part of the native contract.
 */

import { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { resizableSplitPaneSpec } from '@glacier/spec';
import { useControlled } from '@glacier/commons';
import { t } from './tokens.ts';
import { dimensionsFor } from './resolve.ts';

// The orientation union mirrors the web component (whose type is a hardcoded
// union; `splitOrientations` is not re-exported from @glacier/spec), so there
// is nothing to derive from an array here.
export type SplitOrientation = 'horizontal' | 'vertical';

export interface ResizableSplitPaneProps extends Omit<ViewProps, 'children' | 'style'> {
  /** Exactly two children: the start pane and the end pane. */
  children: [ReactNode, ReactNode];
  /**
   * Split direction. `horizontal` places the panes side by side with a vertical
   * divider; `vertical` stacks them with a horizontal divider.
   */
  orientation?: SplitOrientation;
  /** Controlled size of the start pane as a fraction of the container, 0–1. */
  ratio?: number;
  /** Initial start-pane fraction when uncontrolled. */
  defaultRatio?: number;
  /**
   * Called with the next ratio on drag, keyboard step, or reset. Accepted for
   * contract parity; inert on native (no drag/keyboard runtime here).
   */
  onRatioChange?: (ratio: number) => void;
  /** Smallest start-pane fraction the divider can reach (inert without a drag). */
  min?: number;
  /** Largest start-pane fraction the divider can reach (inert without a drag). */
  max?: number;
  /** Fraction the divider snaps back to on double-click (web-only; inert here). */
  resetRatio?: number;
  /** Fraction the divider moves per arrow-key press (web-only; inert here). */
  step?: number;
  /** Accessible name for the divider. */
  'aria-label'?: string;
}

// Size-independent geometry read once from the spec: the corner radius, the
// divider thickness (hairline), and the grip pill's long edge (space-6).
const DIMS = dimensionsFor(resizableSplitPaneSpec);
const RADIUS = t(DIMS.radius ?? 'radius-lg');
const THICKNESS = t(DIMS.thickness ?? 'hairline');
const GRIP_LONG = t(DIMS.gripHeight ?? 'space-6');
// The grip's short edge is a fixed 6px pill in the web CSS.
const GRIP_SHORT = 6;

// Paint. The root surface comes from the spec's top-level rest paint; the
// resting divider hairline is `border-subtle` (the web `.divider` fills it and
// the spec lists it in `tokens`). The grip is the web CSS's literal white pill,
// which is not a spec-declared token.
const SURFACE_BG = t((resizableSplitPaneSpec.paint?.background ?? '$surface').replace(/^\$/, ''));
const DIVIDER_BG = t('border-subtle');
const GRIP_COLOR = '#fff';

const round = (value: number): number => Math.round(value * 1e4) / 1e4;

/**
 * A container that splits into two panes with a divider between them. It hosts
 * exactly two children — a start pane sized to `ratio` (or `defaultRatio`) of
 * the container and an end pane that fills the rest — laid out side by side when
 * `orientation="horizontal"` or stacked when `"vertical"`.
 */
export function ResizableSplitPane({
  children,
  orientation = 'horizontal',
  ratio,
  defaultRatio = 0.5,
  onRatioChange,
  min: _min = 0.1,
  max: _max = 0.9,
  resetRatio: _resetRatio,
  step: _step = 0.02,
  'aria-label': ariaLabel,
  ...rest
}: ResizableSplitPaneProps) {
  // Controlled-or-uncontrolled, so a parent that persists the ratio stays the
  // source of truth. The setter has no caller here (the drag/keyboard that would
  // move the divider are web-only), so the split rests where it is resolved.
  const [current] = useControlled({ value: ratio, defaultValue: defaultRatio, onChange: onRatioChange });
  const isHorizontal = orientation === 'horizontal';
  const [start, end] = children;

  // The start pane's size along the split axis, as a percentage of the whole,
  // matching the web `--split-start` custom property.
  const startSize = `${round(current * 100)}%`;

  return (
    <View
      accessibilityRole="group"
      {...rest}
      style={{
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        overflow: 'hidden',
        borderRadius: RADIUS,
        backgroundColor: SURFACE_BG,
        flexDirection: isHorizontal ? 'row' : 'column',
      }}
    >
      {/* Start pane: fixed to the resting split along the axis, clipped. */}
      <View
        style={{
          [isHorizontal ? 'width' : 'height']: startSize,
          flexGrow: 0,
          flexShrink: 0,
          minWidth: 0,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {start}
      </View>

      {/* Divider: a hairline rail (stretched across the cross axis by RN's
          default alignItems) carrying the centered grip pill. Static. */}
      <View
        accessibilityRole="separator"
        accessibilityLabel={ariaLabel ?? 'Resize panes'}
        aria-label={ariaLabel ?? 'Resize panes'}
        aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
        style={{
          flexGrow: 0,
          flexShrink: 0,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: DIVIDER_BG,
          [isHorizontal ? 'width' : 'height']: THICKNESS,
        }}
      >
        <View
          aria-hidden={true}
          style={{
            borderRadius: t('radius-full'),
            backgroundColor: GRIP_COLOR,
            width: isHorizontal ? GRIP_SHORT : GRIP_LONG,
            height: isHorizontal ? GRIP_LONG : GRIP_SHORT,
          }}
        />
      </View>

      {/* End pane: fills the remaining space, clipped. */}
      <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
        {end}
      </View>
    </View>
  );
}
