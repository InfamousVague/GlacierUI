/**
 * @glacier/native — CardFan.
 *
 * The React Native binding of @glacier/react's CardFan. Every placement — the
 * slinky offsets, the lean, the bow, the magnification — comes from
 * @glacier/logic, so the two fans lay out identically from the same numbers.
 *
 * Web-parity notes:
 * - The web places cards with `inset-inline-start: calc(--slink * (100% - w))`.
 *   Yoga has no calc, so the track is measured on layout and the same fraction
 *   is turned into a pixel offset here. The arithmetic is the web's, only the
 *   unit conversion differs.
 * - Hover is a pointer idea. On a device the fan opens around a touch as it
 *   moves along the strip, which is the same gesture a mouse makes.
 */
import { useState, type ComponentType, type ReactNode } from 'react';
import { View, Pressable, type ViewProps } from 'react-native';
import { cardFanSpec } from '@glacier/spec';
import { fanMagnify, fanPlacements, fanSlinky, focusFromTrack, useControlled } from '@glacier/logic';
import { t } from '../tokens.ts';
import { Skeleton } from '../atoms/feedback/Skeleton.tsx';

export type CardFanSize = 'sm' | 'md' | 'lg';

export interface CardFanItem {
  id: string;
}

export interface CardFanProps<T extends CardFanItem = CardFanItem> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  getLabel?: (item: T) => string;
  selected?: string;
  defaultSelected?: string;
  onSelect?: (id: string) => void;
  size?: CardFanSize;
  spread?: number;
  magnify?: boolean;
  disabled?: boolean;
  skeleton?: boolean;
}

const DIMS = cardFanSpec.dimensions ?? {};
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);

// The same three lengths the web reads, in the rem the spec writes them in.
const WIDTHS: Record<CardFanSize, number> = {
  sm: parseFloat((DIMS.widthSm as string) ?? '5rem') * 16,
  md: parseFloat((DIMS.widthMd as string) ?? '8.25rem') * 16,
  lg: parseFloat((DIMS.widthLg as string) ?? '11rem') * 16,
};

/** A card is drawn taller than it is wide, in the proportion the web sets. */
const ASPECT = 1.4;

// The shim models only the subset of events the kit consumes, so the track View
// is typed through a local alias — the same convention Slider and SortableList
// use for their own responders.
type LayoutEvent = { nativeEvent: { layout: { width: number } } };
type TouchEvent = { nativeEvent: { locationX: number } };
const Track = View as unknown as ComponentType<
  ViewProps & {
    onLayout?: (e: LayoutEvent) => void;
    onStartShouldSetResponder?: () => boolean;
    onMoveShouldSetResponder?: () => boolean;
    onResponderMove?: (e: TouchEvent) => void;
    onResponderRelease?: () => void;
  }
>;

export function CardFan<T extends CardFanItem = CardFanItem>({
  items,
  renderItem,
  getLabel,
  selected: selectedProp,
  defaultSelected,
  onSelect,
  size = 'md',
  spread = 1,
  magnify = true,
  disabled = false,
  skeleton = false,
}: CardFanProps<T>) {
  const [selected, setSelected] = useControlled<string | undefined>({
    value: selectedProp,
    defaultValue: defaultSelected,
    onChange: onSelect as ((value: string | undefined) => void) | undefined,
  });
  const [focus, setFocus] = useState<number | null>(null);
  // The strip's measured width. The web gets its track from a percentage; Yoga
  // has no calc, so the fraction has to become pixels here.
  const [trackWidth, setTrackWidth] = useState(0);

  const count = items.length;
  const width = WIDTHS[size];
  const cardHeight = width * ASPECT;
  const radius = t(bare(DIMS.radius) ?? 'radius-lg');
  const placements = fanPlacements(count, focus, width, fanSlinky(count));

  // The track is what is left of the strip once one card's width is reserved,
  // exactly as `calc(100% - var(--fan-width))` reserves it on the web.
  const track = Math.max(0, trackWidth - width);

  const frame = {
    width: '100%' as const,
    height: cardHeight + 48,
    paddingTop: t('space-6'),
    opacity: disabled ? 0.5 : 1,
  };

  if (skeleton) {
    const bones = fanPlacements(Math.max(count, 5), null, width, fanSlinky(Math.max(count, 5)));
    return (
      <Track style={frame} onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}>
        {bones.map((placement, index) => (
          <View
            key={index}
            style={{
              position: 'absolute',
              bottom: 0,
              left: placement.offset * track,
              width,
              transform: [{ translateY: placement.lift * spread }, { rotate: `${placement.rotate * spread}deg` }],
            }}
          >
            <Skeleton width={width} height={cardHeight} radius={radius} />
          </View>
        ))}
      </Track>
    );
  }

  return (
    <Track
      accessibilityRole="none"
      style={frame}
      onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => !disabled}
      onMoveShouldSetResponder={() => !disabled}
      onResponderMove={(e) => setFocus(focusFromTrack(e.nativeEvent.locationX, trackWidth, count))}
      onResponderRelease={() => setFocus(null)}
    >
      {items.map((item, index) => {
        const placement = placements[index];
        if (!placement) return null;
        const isSelected = selected === item.id;
        const scale = magnify ? fanMagnify(index, focus) : 1;

        return (
          <View
            key={item.id}
            style={{
              position: 'absolute',
              bottom: 0,
              left: placement.offset * track,
              width,
              zIndex: isSelected ? 30 : placement.z,
              transform: [{ translateY: placement.lift * spread }, { rotate: `${placement.rotate * spread}deg` }],
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected, disabled }}
              accessibilityLabel={getLabel?.(item) ?? item.id}
              disabled={disabled}
              onPress={() => setSelected(item.id)}
            >
              {/* The magnification scales this inner layer rather than the
                  placed box, so a card grows without moving the footprint its
                  neighbours are positioned against. */}
              <View style={{ transform: [{ scale }] }}>{renderItem(item, index)}</View>
            </Pressable>
          </View>
        );
      })}
    </Track>
  );
}
