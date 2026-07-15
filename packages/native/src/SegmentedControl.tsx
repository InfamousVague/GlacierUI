// Glacier SegmentedControl — the React Native binding. A row of Pressable
// segments over a hairline glass track, with the selected segment lifting its
// label and a filled highlight painted behind it. Paint and geometry are read
// from the segmented-control spec through the shared resolvers, so it stays
// visually identical to @glacier/react's SegmentedControl and cannot drift.
import { useEffect, useLayoutEffect, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { Animated, Platform, View, Text, Pressable, type PressableProps, type ViewProps } from 'react-native';
import { segmentedControlSpec, segmentedControlSizes, segmentedControlSprings } from '@glacier/spec';
import { useControlled, paintFor } from '@glacier/commons';
import { t } from './tokens.ts';
import { sizeFor, dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

// Derived from the spec so the unions cannot drift from the web kit.
export type SegmentedControlSize = (typeof segmentedControlSizes)[number];
export type SegmentedControlSpring = (typeof segmentedControlSprings)[number];

export interface SegmentedOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps extends Omit<ViewProps, 'children'> {
  options: SegmentedOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: SegmentedControlSize;
  fullWidth?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /**
    * Spring preset for the selected thumb entrance. Defaults to snappy.
   */
  spring?: SegmentedControlSpring;
  disabled?: boolean;
  /** Accessible name for the group. */
  'aria-label'?: string;
  /** Web-only escape hatch; accepted for parity and ignored on native. */
  className?: string;
}

// Size-independent box metrics (radius, track padding, hairline) read once from
// the spec. The spec also declares `gap: space-2`, but the web `.root` does not
// apply a gap — segments sit adjacent and the highlight fills each one via
// `inset: 0` — so this binding omits it to stay pixel-identical to the CSS.
const BOX = dimensionsFor(segmentedControlSpec);

// Top-level track paint (the glass fill + hairline border). Native cannot blur,
// so this is the resting tint only; the web adds a backdrop-blur over it.
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);
const BASE = (segmentedControlSpec.paint ?? {}) as { background?: string; border?: string };
const TRACK_BG = t(bare(BASE.background) ?? 'segment-track');
const TRACK_BORDER = t(bare(BASE.border) ?? 'glass-border');

// Selected paint: the highlight fill under the segment and the full-strength
// label color. Disabled dims the label; the muted resting color is the web
// `.label` default (text-muted), not exposed as a spec state.
const SELECTED = paintFor(segmentedControlSpec, 'states', 'selected');
const THUMB_BG = t(SELECTED.thumb ?? 'segment-thumb');
const SELECTED_COLOR = t(SELECTED.text ?? 'text');
const DISABLED_COLOR = t(paintFor(segmentedControlSpec, 'states', 'disabled').text ?? 'text-disabled');
const MUTED_COLOR = t('text-muted');

const SPRING_DURATIONS: Record<SegmentedControlSpring, number> = {
  snappy: 140,
  smooth: 220,
  bouncy: 180,
};

type LayoutEvent = { nativeEvent: { layout: { x: number; width: number } } };
type SegmentLayout = { x: number; width: number };
const SegmentPressable = Pressable as unknown as ComponentType<
  PressableProps & { onLayout?: (event: LayoutEvent) => void }
>;
const SegmentRoot = View as unknown as ComponentType<ViewProps & { ref?: { current: HTMLElement | null } }>;

/**
 * A resolved measurement value. `sizeFor`/`dimensionsFor` return bare token
 * names (`space-4`, `control-radius`) alongside raw CSS values — the track
 * padding is an off-scale `0.1875rem` and each size's height is a
 * `calc(var(--glacier-control-height-md) - 0.375rem)` expression. A bare token
 * name (lowercase identifier) is wrapped in its custom property; anything with a
 * leading digit/dot or a calc()/var() form passes straight through so it never
 * becomes `var(--glacier-calc(...))`.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[a-z][a-z0-9-]*$/.test(v) ? t(v) : v;
}

/**
 * The Glacier SegmentedControl, rendered with React Native primitives. The track
 * is a flex-row View with a hairline glass border; each option is a Pressable
 * whose label lifts from the muted resting color to full text color and weight
 * when selected, and the selected segment mounts the highlight as an
 * absolutely-positioned View (inset:0) behind the label. Selection is
 * controlled/uncontrolled through the shared `useControlled` hook — the same
 * contract the web kit uses.
 *
 * A single measured thumb slides between segments at the requested preset's
 * tempo, while a pressed label scales to 0.96 like the web control. The glass
 * track is the resting tint only — native cannot blur.
 */
export function SegmentedControl({
  options,
  value,
  defaultValue,
  onValueChange,
  size = 'md',
  fullWidth = false,
  skeleton = false,
  spring = 'snappy',
  disabled = false,
  className: _className,
  'aria-label': ariaLabel,
  style,
  ...rest
}: SegmentedControlProps) {
  const fallback = defaultValue ?? options.find((o) => !o.disabled)?.value ?? '';
  const [selected, setSelected] = useControlled({ value, defaultValue: fallback, onChange: onValueChange });
  const [layouts, setLayouts] = useState<Record<string, SegmentLayout>>({});
  const rootRef = useRef<HTMLElement | null>(null);
  const thumbLeft = useRef(new Animated.Value(0)).current;
  const thumbWidth = useRef(new Animated.Value(0)).current;

  useLayoutEffect(() => {
    if (Platform.OS !== 'web' || rootRef.current == null) return;
    const root = rootRef.current;
    const measure = () => {
      const rootBounds = root.getBoundingClientRect();
      const next: Record<string, SegmentLayout> = {};
      for (const [index, segment] of Array.from(root.querySelectorAll<HTMLElement>('[role="radio"]')).entries()) {
        const value = options[index]?.value;
        if (value == null) continue;
        const bounds = segment.getBoundingClientRect();
        next[value] = { x: bounds.left - rootBounds.left, width: bounds.width };
      }
      setLayouts(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [options, size, fullWidth]);

  const selectedLayout = layouts[selected];
  useEffect(() => {
    if (Platform.OS === 'web' || selectedLayout == null) return;
    const left = Animated.timing(thumbLeft, {
      toValue: selectedLayout.x,
      duration: SPRING_DURATIONS[spring],
      useNativeDriver: false,
    });
    const width = Animated.timing(thumbWidth, {
      toValue: selectedLayout.width,
      duration: SPRING_DURATIONS[spring],
      useNativeDriver: false,
    });
    left.start();
    width.start();
    return () => {
      left.stop();
      width.stop();
    };
  }, [selectedLayout, spring, thumbLeft, thumbWidth]);

  // Geometry: per-size height/padding/font from the spec, plus the shared box.
  const dims = sizeFor(segmentedControlSpec, size);
  const segHeight = metric(dims.height, 'calc(var(--glacier-control-height-md) - 0.375rem)');
  const padInline = metric(dims.paddingInline, 'space-4');
  const fontSize = metric(dims.fontSize, 'font-size-sm');
  const radius = metric(BOX.radius, 'control-radius');
  const trackPad = metric(BOX.padding, '0.1875rem');
  const hairline = metric(BOX.border, 'hairline');
  const intrinsicDisplay = Platform.OS === 'web' && !fullWidth ? ('inline-flex' as const) : ('flex' as const);

  // The glass track box, shared by the live control and the skeleton.
  const trackStyle = {
    display: intrinsicDisplay,
    flexDirection: 'row' as const,
    alignItems: 'stretch' as const,
    alignSelf: fullWidth ? ('stretch' as const) : ('flex-start' as const),
    width: fullWidth ? ('100%' as const) : undefined,
    flexGrow: fullWidth ? 1 : 0,
    flexShrink: fullWidth ? 1 : 0,
    padding: trackPad,
    borderRadius: radius,
    borderWidth: hairline,
    borderStyle: 'solid' as const,
    borderColor: TRACK_BORDER,
    backgroundColor: TRACK_BG,
    overflow: 'hidden' as const,
  };
  const thumbStyle = selectedLayout == null ? undefined : {
    position: 'absolute' as const,
    top: trackPad,
    bottom: trackPad,
    left: selectedLayout.x,
    width: selectedLayout.width,
    borderRadius: radius,
    backgroundColor: THUMB_BG,
    pointerEvents: 'none' as const,
    transitionProperty: Platform.OS === 'web' ? ('left, width' as const) : undefined,
    transitionDuration: Platform.OS === 'web' ? `${SPRING_DURATIONS[spring]}ms` : undefined,
    transitionTimingFunction: Platform.OS === 'web'
      ? spring === 'bouncy' ? 'cubic-bezier(0.2, 1.35, 0.4, 1)' : 'var(--glacier-ease-out)'
      : undefined,
  };
  const nativeThumbStyle = selectedLayout == null ? undefined : {
    ...thumbStyle,
    left: thumbLeft,
    width: thumbWidth,
  };

  if (skeleton) {
    // The real track with each label reserving its width (a transparent Text),
    // plus a pill-shaped Skeleton chip, so the placeholder matches the live
    // control's intrinsic size exactly. The track is hidden from assistive tech.
    return (
      <View aria-hidden={true} {...rest} style={[trackStyle, style as never]}>
        {options.map((option, index) => (
          <View
            key={index}
            style={{
              position: 'relative',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              flex: fullWidth ? 1 : undefined,
              height: segHeight,
              paddingHorizontal: padInline,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                color: 'transparent',
                fontSize,
                lineHeight: fontSize as never,
                fontFamily: t('font-sans'),
                fontWeight: t('font-weight-medium') as never,
              }}
            >
              {option.label}
            </Text>
            <View style={{ position: 'absolute', top: '22%', bottom: '22%', left: t('space-2'), right: t('space-2') }}>
              <Skeleton radius={t('radius-full')} width="100%" height="100%" />
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <SegmentRoot ref={rootRef} accessibilityRole="radiogroup" aria-label={ariaLabel} {...rest} style={[trackStyle, style as never]}>
      {thumbStyle != null && (
        Platform.OS === 'web'
          ? <View aria-hidden={true} style={thumbStyle} />
          : <Animated.View aria-hidden={true} style={nativeThumbStyle} />
      )}
      {options.map((option) => {
        const isSelected = option.value === selected;
        const isDisabled = Boolean(disabled || option.disabled);
        return (
          <NativeSegment
            key={option.value}
            option={option}
            selected={isSelected}
            disabled={isDisabled}
            spring={spring}
            fullWidth={fullWidth}
            height={segHeight}
            padding={padInline}
            radius={radius}
            fontSize={fontSize}
            onLayout={(layout) => setLayouts((current) => (
              current[option.value]?.x === layout.x && current[option.value]?.width === layout.width
                ? current
                : { ...current, [option.value]: layout }
            ))}
            onPress={() => setSelected(option.value)}
          />
        );
      })}
    </SegmentRoot>
  );
}

interface NativeSegmentProps {
  option: SegmentedOption;
  selected: boolean;
  disabled: boolean;
  spring: SegmentedControlSpring;
  fullWidth: boolean;
  height: string;
  padding: string;
  radius: string;
  fontSize: string;
  onLayout: (layout: SegmentLayout) => void;
  onPress: () => void;
}

function NativeSegment({ option, selected, disabled, fullWidth, height, padding, radius, fontSize, onLayout, onPress }: NativeSegmentProps) {
  const labelColor = disabled ? DISABLED_COLOR : selected ? SELECTED_COLOR : MUTED_COLOR;

  return (
    <SegmentPressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      aria-checked={selected}
      aria-label={typeof option.label === 'string' ? option.label : undefined}
      disabled={disabled}
      onPress={onPress}
      onLayout={(event) => onLayout(event.nativeEvent.layout)}
      style={({ pressed }) => ({
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: fullWidth ? 1 : undefined,
        flexGrow: fullWidth ? 1 : 0,
        flexShrink: fullWidth ? 1 : 0,
        height,
        paddingHorizontal: padding,
        borderRadius: radius,
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
      <Text
        numberOfLines={1}
        style={{
          color: labelColor,
          fontSize,
          lineHeight: fontSize as never,
          fontFamily: t('font-sans'),
          fontWeight: t(selected ? 'font-weight-semibold' : 'font-weight-medium') as never,
        }}
      >
        {option.label}
      </Text>
    </SegmentPressable>
  );
}
