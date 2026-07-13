// Glacier SegmentedControl — the React Native binding. A row of Pressable
// segments over a hairline glass track, with the selected segment lifting its
// label and a filled highlight painted behind it. Paint and geometry are read
// from the segmented-control spec through the shared resolvers, so it stays
// visually identical to @glacier/react's SegmentedControl and cannot drift.
import { type ReactNode } from 'react';
import { View, Text, Pressable, type ViewProps } from 'react-native';
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
   * Spring preset for the thumb. Accepted for prop parity with the web kit but
   * inert here: this binding paints the selected highlight in place with no
   * animation runtime, so nothing springs between segments.
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
 * Resting visuals only: the web slides the thumb between segments as a shared
 * Motion layout element, scales the pressed label, and draws a focus ring on
 * keyboard focus. This binding has no animation runtime, so it paints the static
 * highlight under the selected segment and taps switch selection (the `spring`
 * prop is inert; `className` is a web escape hatch and ignored). The glass track
 * is the resting tint only — native cannot blur.
 */
export function SegmentedControl({
  options,
  value,
  defaultValue,
  onValueChange,
  size = 'md',
  fullWidth = false,
  skeleton = false,
  spring: _spring,
  disabled = false,
  className: _className,
  'aria-label': ariaLabel,
  style,
  ...rest
}: SegmentedControlProps) {
  const fallback = defaultValue ?? options.find((o) => !o.disabled)?.value ?? '';
  const [selected, setSelected] = useControlled({ value, defaultValue: fallback, onChange: onValueChange });

  // Geometry: per-size height/padding/font from the spec, plus the shared box.
  const dims = sizeFor(segmentedControlSpec, size);
  const segHeight = metric(dims.height, 'calc(var(--glacier-control-height-md) - 0.375rem)');
  const padInline = metric(dims.paddingInline, 'space-4');
  const fontSize = metric(dims.fontSize, 'font-size-sm');
  const radius = metric(BOX.radius, 'control-radius');
  const trackPad = metric(BOX.padding, '0.1875rem');
  const hairline = metric(BOX.border, 'hairline');

  // The glass track box, shared by the live control and the skeleton.
  const trackStyle = {
    flexDirection: 'row' as const,
    alignItems: 'stretch' as const,
    alignSelf: fullWidth ? ('stretch' as const) : ('flex-start' as const),
    width: fullWidth ? ('100%' as const) : undefined,
    padding: trackPad,
    borderRadius: radius,
    borderWidth: hairline,
    borderStyle: 'solid' as const,
    borderColor: TRACK_BORDER,
    backgroundColor: TRACK_BG,
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
    <View accessibilityRole="radiogroup" aria-label={ariaLabel} {...rest} style={[trackStyle, style as never]}>
      {options.map((option) => {
        const isSelected = option.value === selected;
        const isDisabled = disabled || option.disabled;
        const labelColor = isDisabled ? DISABLED_COLOR : isSelected ? SELECTED_COLOR : MUTED_COLOR;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected, disabled: isDisabled }}
            // Also surface selection as aria-checked so react-native-web exposes
            // it to assistive tech (accessibilityState alone does not map here).
            aria-checked={isSelected}
            aria-label={typeof option.label === 'string' ? option.label : undefined}
            disabled={isDisabled}
            onPress={() => setSelected(option.value)}
            style={{
              position: 'relative',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              flex: fullWidth ? 1 : undefined,
              height: segHeight,
              paddingHorizontal: padInline,
              borderRadius: radius,
            }}
          >
            {isSelected && (
              // The highlight fills the segment (web `.thumb` inset:0). Rendered
              // before the label so the label paints on top (web z-index:1).
              <View
                aria-hidden={true}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  borderRadius: radius,
                  backgroundColor: THUMB_BG,
                }}
              />
            )}
            <Text
              numberOfLines={1}
              style={{
                color: labelColor,
                fontSize,
                // line-height:1, matching the web `.label` rule.
                lineHeight: fontSize as never,
                fontFamily: t('font-sans'),
                // Selected labels go semibold; the resting weight is medium.
                fontWeight: t(isSelected ? 'font-weight-semibold' : 'font-weight-medium') as never,
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
