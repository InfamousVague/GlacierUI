/**
 * @glacier/native — SortableList.
 *
 * The React Native binding of @glacier/react's SortableList: rows reordered by
 * dragging a handle. Every reorder decision — which slot the pointer is over,
 * how far each row shifts, whether anything actually changed — comes from
 * @glacier/logic, so a drop lands in the same slot as it would on the web.
 * Paint and geometry are read from the sortable-list spec.
 *
 * The drag uses the responder system rather than Pressable: a Pressable reports
 * that a press happened, while a reorder needs the whole gesture — grant, every
 * move, and release. `onStartShouldSetResponder` claims it at touch-down so the
 * handle owns the gesture instead of a parent scroll view stealing it.
 *
 * Web-parity notes:
 * - The lifted row tracks the finger and the rows it passes shift by one slot,
 *   the same slot arithmetic the web uses, multiplied by this binding's own row
 *   height.
 * - Keyboard lift-and-move is a hardware-keyboard affordance with no touch
 *   equivalent; on device a row is reordered by dragging its handle. The
 *   live-region announcements it drives are likewise web-only.
 * - The drag shadow is a resting elevation rather than the web's layered
 *   box-shadow, which React Native has no equivalent for.
 */
import { useRef, useState, type ComponentType, type ReactNode } from 'react';
import { View, Text as RNText, type ViewProps } from 'react-native';
import { sortableListSpec } from '@glacier/spec';
import { didReorder, dropTarget, moveItem, shiftFor } from '@glacier/logic';
import { t } from '../tokens.ts';
import { paintFor, dimensionsFor } from '../resolve.ts';
import { Skeleton } from '../atoms/feedback/Skeleton.tsx';

/** The minimum a row must provide: something stable to key and track it by. */
export interface SortableItemLike {
  id: string;
}

export type SortableListSize = 'sm' | 'md' | 'lg';

export interface SortableListProps<T extends SortableItemLike> {
  /** The rows in their current order. Controlled. */
  items: T[];
  /** Called with the reordered array once a drag is dropped. */
  onReorder: (items: T[]) => void;
  /** Renders one row's content; the handle and row chrome are the list's. */
  renderItem: (item: T, index: number) => ReactNode;
  /** The name announced for a row. Accepted for parity with the web kit. */
  getLabel?: (item: T) => string;
  size?: SortableListSize;
  disabled?: boolean;
  skeleton?: boolean;
  skeletonRows?: number;
  /** Web-only escape hatch; accepted for parity and ignored here. */
  className?: string;
}

const BOX = dimensionsFor(sortableListSpec);
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);

const DRAGGING = paintFor(sortableListSpec, 'states', 'dragging');

/** Row height and padding per size, mirroring the web stylesheet's steps. */
const SIZES: Record<SortableListSize, { height: number; padding: string }> = {
  sm: { height: 36, padding: 'space-2' },
  md: { height: 44, padding: 'space-3' },
  lg: { height: 52, padding: 'space-4' },
};

/** The parts of a responder event this component reads. */
interface DragResponderEvent {
  nativeEvent: { pageY?: number; locationY?: number };
}

/**
 * The measured position of a laid-out row.
 *
 * Declared locally and applied with a cast, matching SeekBar, SegmentedControl,
 * and ResizableSplitPane: the shared react-native shim deliberately leaves
 * onLayout off ViewProps, and each component narrows it to just the fields it
 * reads rather than widening the shim for everyone.
 */
type LayoutEvent = { nativeEvent: { layout: { y: number } } };

const Row = View as unknown as ComponentType<ViewProps & { onLayout?: (event: LayoutEvent) => void }>;

/** The six-dot grip, drawn with plain views so it needs no icon dependency. */
function Grip({ color }: { color: string }) {
  return (
    <View style={{ flexDirection: 'row', columnGap: 3, paddingHorizontal: t('space-1') }}>
      {[0, 1].map((col) => (
        <View key={col} style={{ rowGap: 3 }}>
          {[0, 1, 2].map((row) => (
            <View key={row} style={{ width: 2.5, height: 2.5, borderRadius: 1.25, backgroundColor: color }} />
          ))}
        </View>
      ))}
    </View>
  );
}

/**
 * The Glacier SortableList, rendered with React Native primitives. See the file
 * header for the parity contract.
 */
export function SortableList<T extends SortableItemLike>({
  items,
  onReorder,
  renderItem,
  getLabel,
  size = 'md',
  disabled = false,
  skeleton = false,
  skeletonRows = 4,
}: SortableListProps<T>) {
  const [drag, setDrag] = useState<{ from: number; to: number; offset: number } | null>(null);
  const dragStartY = useRef(0);
  // Row midpoints, captured at drag start. Measuring per-move would read the
  // rows mid-transform and chase its own tail.
  const centers = useRef<number[]>([]);
  // Each row's measured top, filled by onLayout, so midpoints can be derived
  // without a DOM to query.
  const tops = useRef<number[]>([]);

  const metrics = SIZES[size] ?? SIZES.md;
  const gap = t(bare(BOX.gap) ?? 'space-1');
  const radius = t(bare(BOX.radius) ?? 'radius-lg');
  const border = t(bare(BOX.border) ?? 'hairline');
  const padding = t(metrics.padding);
  // How far one slot is, in pixels. Measured from the laid-out rows rather than
  // computed from the row height plus the gap token: the tokens resolve to CSS
  // custom-property strings here, so `height + gap` would silently concatenate
  // into "44var(--glacier-space-1)" instead of adding. Two real measured tops
  // give the true distance whatever the gap turns out to be.
  const slotRef = useRef(metrics.height);

  const pointerY = (event: DragResponderEvent): number => {
    const { pageY, locationY } = event.nativeEvent;
    return Number.isFinite(pageY) ? (pageY as number) : Number.isFinite(locationY) ? (locationY as number) : 0;
  };

  const beginDrag = (event: DragResponderEvent, index: number) => {
    if (disabled) return;
    const [first, second] = tops.current;
    if (first !== undefined && second !== undefined && second > first) slotRef.current = second - first;
    centers.current = tops.current.map((top) => top + metrics.height / 2);
    dragStartY.current = pointerY(event);
    setDrag({ from: index, to: index, offset: 0 });
  };

  const moveDrag = (event: DragResponderEvent) => {
    if (!drag) return;
    const y = pointerY(event);
    setDrag({
      ...drag,
      // The midpoints are in row-list space; the pointer is in page space, so
      // it is converted by the distance travelled from the row it grabbed.
      to: dropTarget(centers.current, centers.current[drag.from]! + (y - dragStartY.current)),
      offset: y - dragStartY.current,
    });
  };

  const endDrag = () => {
    if (!drag) return;
    if (didReorder(drag.from, drag.to)) onReorder(moveItem(items, drag.from, drag.to));
    setDrag(null);
  };

  if (skeleton) {
    return (
      <View style={{ width: '100%', rowGap: gap, alignSelf: 'stretch' }}>
        {Array.from({ length: skeletonRows }, (_, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              columnGap: t('space-2'),
              minHeight: metrics.height,
              padding,
              borderWidth: border,
              borderStyle: 'solid',
              borderColor: t('border'),
              borderRadius: radius,
            }}
          >
            <Grip color={t('text-subtle')} />
            <Skeleton width="60%" height={16} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={{ width: '100%', rowGap: gap, alignSelf: 'stretch', opacity: disabled ? 0.5 : 1 }}>
      {items.map((item, index) => {
        const isDragging = drag?.from === index;
        const shift = drag ? shiftFor(index, drag.from, drag.to) : 0;

        return (
          <Row
            key={item.id}
            onLayout={(event) => {
              tops.current[index] = event.nativeEvent.layout.y;
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              columnGap: t('space-2'),
              minHeight: metrics.height,
              padding,
              borderWidth: border,
              borderStyle: 'solid',
              borderColor: isDragging ? t(DRAGGING.border ?? 'accent-border') : t('border'),
              borderRadius: radius,
              backgroundColor: isDragging ? t(DRAGGING.background ?? 'surface-raised') : t('surface'),
              // The dragged row follows the finger; the rows it passes move one
              // slot. Slots come from the shared logic, pixels from here.
              transform: [{ translateY: isDragging ? (drag?.offset ?? 0) : shift * slotRef.current }],
              zIndex: isDragging ? 1 : 0,
              elevation: isDragging ? 3 : 0,
            }}
          >
            {/* The handle claims the whole gesture at touch-down, so a parent
                scroll view cannot steal it mid-drag. */}
            <View
              accessibilityRole="button"
              accessibilityLabel={`Reorder ${getLabel?.(item) ?? item.id}`}
              onStartShouldSetResponder={() => !disabled}
              onMoveShouldSetResponder={() => !disabled}
              onResponderGrant={(event: DragResponderEvent) => beginDrag(event, index)}
              onResponderMove={moveDrag}
              onResponderRelease={endDrag}
              onResponderTerminate={endDrag}
            >
              <Grip color={t('text-subtle')} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              {typeof renderItem(item, index) === 'string' ? (
                <RNText>{renderItem(item, index)}</RNText>
              ) : (
                renderItem(item, index)
              )}
            </View>
          </Row>
        );
      })}
    </View>
  );
}
