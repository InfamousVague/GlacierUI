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
 * Dragging uses the native responder system on devices and pointer capture on
 * React Native Web. Both paths measure movement from the drag's starting ratio,
 * clamp to `min`/`max`, and update through the same controlled-state contract.
 * Native accessibility increment/decrement actions move by `step`. The grip
 * pill (a web hover/focus reveal, opacity 0→1) is shown at rest as the touch
 * drag affordance; its white fill is the web CSS literal (not a spec token).
 * The web `className`/`style` DOM escape hatches are not part of the native
 * contract.
 */

import { useRef, type ComponentType, type ReactNode } from 'react';
import { Platform, View, type ViewProps } from 'react-native';
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
  /** Called with the next ratio while the divider is dragged or adjusted. */
  onRatioChange?: (ratio: number) => void;
  /** Smallest start-pane fraction the divider can reach. */
  min?: number;
  /** Largest start-pane fraction the divider can reach. */
  max?: number;
  /** Fraction the divider snaps back to on double-click (web-only; inert here). */
  resetRatio?: number;
  /** Fraction the divider moves per native accessibility adjustment. */
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
const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

type LayoutEvent = { nativeEvent: { layout: { width: number; height: number } } };
type ResponderDragEvent = {
  nativeEvent: { locationX: number; locationY: number; pageX?: number; pageY?: number };
};
type PointerDragEvent = {
  nativeEvent: { clientX: number; clientY: number; button?: number; buttons?: number; pointerId?: number };
  currentTarget: {
    parentElement?: { getBoundingClientRect(): { width: number; height: number } };
    setPointerCapture?(pointerId: number): void;
    releasePointerCapture?(pointerId: number): void;
  };
  preventDefault?(): void;
};
type AccessibilityActionEvent = { nativeEvent: { actionName: string } };

const Root = View as unknown as ComponentType<ViewProps & { onLayout?: (event: LayoutEvent) => void }>;
const Divider = View as unknown as ComponentType<
  Omit<ViewProps, 'onResponderGrant' | 'onResponderMove' | 'onPointerDown' | 'onPointerMove' | 'onPointerUp'> & {
    hitSlop?: number;
    accessibilityValue?: { min: number; max: number; now: number };
    accessibilityActions?: Array<{ name: string }>;
    onAccessibilityAction?: (event: AccessibilityActionEvent) => void;
    onResponderGrant?: (event: ResponderDragEvent) => void;
    onResponderMove?: (event: ResponderDragEvent) => void;
    onResponderRelease?: () => void;
    onResponderTerminate?: () => void;
    onPointerDown?: (event: PointerDragEvent) => void;
    onPointerMove?: (event: PointerDragEvent) => void;
    onPointerUp?: (event: PointerDragEvent) => void;
    onPointerCancel?: (event: PointerDragEvent) => void;
    tabIndex?: number;
    'aria-valuemin'?: number;
    'aria-valuemax'?: number;
    'aria-valuenow'?: number;
  }
>;

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
  min = 0.1,
  max = 0.9,
  resetRatio: _resetRatio,
  step = 0.02,
  'aria-label': ariaLabel,
  ...rest
}: ResizableSplitPaneProps) {
  const [current, setCurrent] = useControlled({ value: ratio, defaultValue: defaultRatio, onChange: onRatioChange });
  const isHorizontal = orientation === 'horizontal';
  const [start, end] = children;
  const extentRef = useRef(0);
  const dragStartRef = useRef({ coordinate: 0, ratio: current });
  const pointerDraggingRef = useRef(false);

  const commit = (next: number) => setCurrent(round(clamp(next, min, max)));
  const beginDrag = (coordinate: number, liveExtent?: number) => {
    if (liveExtent !== undefined && liveExtent > 0) extentRef.current = liveExtent;
    dragStartRef.current = { coordinate, ratio: current };
  };
  const moveDrag = (coordinate: number) => {
    if (extentRef.current <= 0) return;
    const delta = coordinate - dragStartRef.current.coordinate;
    commit(dragStartRef.current.ratio + delta / extentRef.current);
  };
  const responderCoordinate = (event: ResponderDragEvent) =>
    isHorizontal
      ? (event.nativeEvent.pageX ?? event.nativeEvent.locationX)
      : (event.nativeEvent.pageY ?? event.nativeEvent.locationY);
  const pointerCoordinate = (event: PointerDragEvent) =>
    isHorizontal ? event.nativeEvent.clientX : event.nativeEvent.clientY;
  const finishPointerDrag = (event: PointerDragEvent) => {
    pointerDraggingRef.current = false;
    const pointerId = event.nativeEvent.pointerId;
    if (pointerId !== undefined) {
      try {
        event.currentTarget.releasePointerCapture?.(pointerId);
      } catch {
        // The pointer may already have been released by the host.
      }
    }
  };

  // The start pane's size along the split axis, as a percentage of the whole,
  // matching the web `--split-start` custom property.
  const percent = round(current * 100);
  const startSize = `${percent}%`;

  return (
    <Root
      accessibilityRole="group"
      {...rest}
      onLayout={(event) => {
        extentRef.current = isHorizontal ? event.nativeEvent.layout.width : event.nativeEvent.layout.height;
      }}
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
      {/* Start pane: fixed to the resolved split along the axis, clipped. */}
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

      {/* Divider: a hairline rail with a larger invisible drag target. */}
      <Divider
        accessibilityRole="separator"
        accessibilityLabel={ariaLabel ?? 'Resize panes'}
        accessibilityValue={{ min: round(min * 100), max: round(max * 100), now: percent }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === 'increment') commit(current + step);
          if (event.nativeEvent.actionName === 'decrement') commit(current - step);
        }}
        aria-label={ariaLabel ?? 'Resize panes'}
        aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
        aria-valuemin={round(min * 100)}
        aria-valuemax={round(max * 100)}
        aria-valuenow={percent}
        tabIndex={Platform.OS === 'web' ? 0 : undefined}
        hitSlop={8}
        {...(Platform.OS === 'web'
          ? {
              onPointerDown: (event: PointerDragEvent) => {
                if (event.nativeEvent.button !== undefined && event.nativeEvent.button !== 0) return;
                event.preventDefault?.();
                const bounds = event.currentTarget.parentElement?.getBoundingClientRect();
                beginDrag(pointerCoordinate(event), bounds ? (isHorizontal ? bounds.width : bounds.height) : undefined);
                pointerDraggingRef.current = true;
                const pointerId = event.nativeEvent.pointerId;
                if (pointerId !== undefined) {
                  try {
                    event.currentTarget.setPointerCapture?.(pointerId);
                  } catch {
                    // Synthetic events can provide an ID without an active pointer.
                  }
                }
              },
              onPointerMove: (event: PointerDragEvent) => {
                if (pointerDraggingRef.current && event.nativeEvent.buttons !== 0) moveDrag(pointerCoordinate(event));
              },
              onPointerUp: finishPointerDrag,
              onPointerCancel: finishPointerDrag,
            }
          : {
              onStartShouldSetResponder: () => true,
              onResponderGrant: (event: ResponderDragEvent) => beginDrag(responderCoordinate(event)),
              onResponderMove: (event: ResponderDragEvent) => moveDrag(responderCoordinate(event)),
              onResponderRelease: () => {
                pointerDraggingRef.current = false;
              },
              onResponderTerminate: () => {
                pointerDraggingRef.current = false;
              },
            })}
        style={{
          flexGrow: 0,
          flexShrink: 0,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: DIVIDER_BG,
          [isHorizontal ? 'width' : 'height']: THICKNESS,
          ...(Platform.OS === 'web'
            ? { cursor: isHorizontal ? 'col-resize' : 'row-resize', touchAction: 'none', userSelect: 'none' }
            : null),
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
      </Divider>

      {/* End pane: fills the remaining space, clipped. */}
      <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
        {end}
      </View>
    </Root>
  );
}
