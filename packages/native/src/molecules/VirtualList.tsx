/**
 * @glacier/native - VirtualList.
 *
 * The React Native binding of @glacier/react's VirtualList: renders only the
 * rows the scroller can show. The windowing arithmetic - which slice, how tall
 * the spacer is, how far down the window sits - comes from @glacier/logic, so
 * this list renders the same rows for the same scroll position as the web one.
 *
 * Web-parity notes:
 * - Built on ScrollView with an absolutely-positioned window rather than
 *   FlatList. FlatList would virtualize too, but with its own windowing rules,
 *   and the two bindings would then disagree about which rows exist at a given
 *   offset - the exact drift this package exists to prevent.
 * - Scroll events are throttled by the platform; on web they fire per frame.
 * - The listbox/option roles and the aria-setsize positions are web-only; the
 *   rows here carry accessibilityRole and their index for the same purpose.
 */
import { useRef, useState, type ComponentType, type ReactNode } from 'react';
import { View, ScrollView, type ViewProps } from 'react-native';
import { virtualListSpec } from '@glacier/spec';
import { scrollOffsetForIndex, virtualWindow, windowIndices } from '@glacier/logic';
import { t } from '../tokens.ts';
import { dimensionsFor } from '../resolve.ts';
import { Text } from '../atoms/display/Text.tsx';
import { Skeleton } from '../atoms/feedback/Skeleton.tsx';

export interface VirtualListProps {
  /** How many rows there are in total. */
  count: number;
  /** Height of one row. Every row is this tall. */
  itemSize: number;
  /** Renders the row at an index. Called only for rows inside the window. */
  renderItem: (index: number) => ReactNode;
  /** Viewport height. */
  height?: number;
  overscan?: number;
  onVisibleChange?: (start: number, end: number) => void;
  getKey?: (index: number) => string | number;
  emptyLabel?: ReactNode;
  skeleton?: boolean;
  /** Web-only escape hatch; accepted for parity and ignored here. */
  className?: string;
}

const BOX = dimensionsFor(virtualListSpec);
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);

/** The scroll event fields this component reads. */
type ScrollEvent = { nativeEvent: { contentOffset: { x: number; y: number } } };
type LayoutEvent = { nativeEvent: { layout: { height: number } } };

const Measured = View as unknown as ComponentType<ViewProps & { onLayout?: (event: LayoutEvent) => void }>;

/**
 * The Glacier VirtualList, rendered with React Native primitives. See the file
 * header for the parity contract.
 */
export function VirtualList({
  count,
  itemSize,
  renderItem,
  height,
  overscan = 3,
  onVisibleChange,
  getKey,
  emptyLabel,
  skeleton = false,
}: VirtualListProps) {
  const [scrollOffset, setScrollOffset] = useState(0);
  const [viewportSize, setViewportSize] = useState(height ?? 0);
  const reported = useRef<{ start: number; end: number } | null>(null);

  const radius = t(bare(BOX.radius) ?? 'radius-lg');
  const border = t(bare(BOX.border) ?? 'hairline');

  const window_ = virtualWindow({ count, itemSize, viewportSize, scrollOffset, overscan });

  // Reported from the scroll handler rather than an effect: on device the
  // handler already runs off the render pass, and firing per render would call
  // back on every unrelated update.
  if (count > 0 && (reported.current?.start !== window_.start || reported.current?.end !== window_.end)) {
    reported.current = { start: window_.start, end: window_.end };
    onVisibleChange?.(window_.start, window_.end);
  }

  const frame = {
    height,
    borderWidth: border,
    borderStyle: 'solid' as const,
    borderColor: t('border'),
    borderRadius: radius,
    backgroundColor: t('surface'),
    overflow: 'hidden' as const,
  };

  if (count === 0 && !skeleton) {
    return (
      <View style={{ ...frame, minHeight: 96, alignItems: 'center', justifyContent: 'center' }}>
        <Text tone="subtle" size="sm">
          {emptyLabel}
        </Text>
      </View>
    );
  }

  return (
    <Measured
      style={frame}
      onLayout={(event) => setViewportSize(event.nativeEvent.layout.height)}
    >
      <ScrollView
        onScroll={(event: ScrollEvent) => setScrollOffset(event.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
      >
        {/* The spacer: as tall as the whole list, so the scroll indicator
            describes the data rather than the rendered handful. */}
        <View style={{ height: window_.totalSize }}>
          <View style={{ position: 'absolute', left: 0, right: 0, top: window_.offset }}>
            {windowIndices(window_).map((index) => (
              <View
                key={getKey?.(index) ?? index}
                accessibilityRole="text"
                style={{
                  height: itemSize,
                  justifyContent: 'center',
                  paddingHorizontal: t('space-3'),
                  overflow: 'hidden',
                }}
              >
                {skeleton ? <Skeleton width="70%" height={16} /> : renderItem(index)}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </Measured>
  );
}

/**
 * The offset that brings a row into view, re-exported so a host can drive a
 * ScrollView ref without importing @glacier/logic itself.
 */
export { scrollOffsetForIndex };
