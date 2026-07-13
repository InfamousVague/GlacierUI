import { type ReactNode } from 'react';
import { View, Text, Pressable, type PressableProps } from 'react-native';
import { filterChipSpec, compactSizes } from '@glacier/spec';
import { useControlled, press } from '@glacier/commons';
import { t } from './tokens.ts';
import { paintStyle, sizeFor, dimensionsFor } from './resolve.ts';
import { CounterBadge } from './CounterBadge.tsx';

// Derived from the spec so the union cannot drift from the web kit.
export type FilterChipSize = (typeof compactSizes)[number];

export interface FilterChipProps extends Omit<PressableProps, 'style' | 'children'> {
  /** Controlled selected state. */
  selected?: boolean;
  /** Initial selected state when uncontrolled. */
  defaultSelected?: boolean;
  /** Called with the next selected state when the chip is toggled. */
  onSelectedChange?: (selected: boolean) => void;
  /** Leading glyph, hidden from assistive tech. */
  icon?: ReactNode;
  /** Trailing count, rendered as a CounterBadge; hidden when 0 or less. */
  count?: number;
  size?: FilterChipSize;
  children?: ReactNode;
}

// Size-independent box metrics (radius, gap, border) read once from the spec.
const BOX = dimensionsFor(filterChipSpec);

// The unselected chip paints from the spec's base paint (`$text-muted` label,
// `$border-strong` hairline); strip the leading `$` exactly as the shared
// resolvers do so it cannot drift from the web kit.
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);
const BASE = (filterChipSpec.paint ?? {}) as { text?: string; border?: string };

// The selected paint (accent soft fill, accent border + text) from the
// `selected` state entry, read through the shared resolver.
const SELECTED = paintStyle(filterChipSpec, 'states', 'selected');

/**
 * A resolved measurement value. `sizeFor`/`dimensionsFor` return bare token
 * names (e.g. `space-2`) alongside raw CSS lengths (the chip's `height:
 * 1.75rem` is declared inline, not as a token). Token names get wrapped in the
 * custom property; a raw length — anything starting with a digit or dot —
 * passes straight through so it never becomes `var(--glacier-1.75rem)`.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

/**
 * The Glacier FilterChip, rendered with React Native primitives. Paint and
 * geometry are read from the filter-chip spec through the shared resolvers, so
 * it is visually identical to @glacier/react's FilterChip and cannot drift from
 * it. A Pressable toggles `selected` (controlled or uncontrolled); the resting
 * fill is the transparent/border-strong outline unselected, and the accent soft
 * tint when selected. The label lives in <Text> (color does not inherit through
 * a View), an optional leading icon slot inherits the chip color, and an
 * optional trailing count renders as a CounterBadge (accent tone when selected).
 *
 * Resting visuals only: the web `whileTap` chip scale is matched by the
 * Pressable's `press.compact` dip (the commons scale for chip-weight controls);
 * hover and focus-ring states are interaction-only and not painted here.
 */
export function FilterChip({
  selected,
  defaultSelected = false,
  onSelectedChange,
  icon,
  count,
  size = 'md',
  disabled = false,
  children,
  onPress,
  ...rest
}: FilterChipProps) {
  const [isSelected, setSelected] = useControlled({
    value: selected,
    defaultValue: defaultSelected ?? false,
    onChange: onSelectedChange,
  });
  const dims = sizeFor(filterChipSpec, size);

  // Resting paint: unselected outline vs. selected accent soft tint.
  const paint = isSelected
    ? {
        backgroundColor: SELECTED.backgroundColor as string,
        borderColor: SELECTED.borderColor as string,
        color: SELECTED.color as string,
      }
    : {
        backgroundColor: 'transparent',
        borderColor: t(bare(BASE.border) ?? 'border-strong'),
        color: t(bare(BASE.text) ?? 'text-muted'),
      };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected, disabled }}
      disabled={disabled}
      onPress={() => {
        setSelected(!isSelected);
        onPress?.();
      }}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          columnGap: metric(BOX.gap, 'space-2'),
          height: metric(dims.height, '1.75rem'),
          paddingHorizontal: metric(dims.paddingInline, 'space-2'),
          borderRadius: metric(BOX.radius, 'radius-full'),
          borderWidth: metric(BOX.border, 'hairline'),
          borderStyle: 'solid',
          borderColor: paint.borderColor,
          backgroundColor: paint.backgroundColor,
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: pressed && !disabled ? press.compact : 1 }],
        },
      ]}
      {...rest}
    >
      {icon != null && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            // A currentColor SVG picks up the chip's text color (matching the
            // web `.icon` rule, which inherits `color` from the button).
            color: paint.color,
          }}
        >
          {icon}
        </View>
      )}
      <Text
        numberOfLines={1}
        style={{
          color: paint.color,
          fontSize: metric(dims.fontSize, 'font-size-sm'),
          // line-height:1, matching the web `.chip` rule.
          lineHeight: metric(dims.fontSize, 'font-size-sm') as never,
          fontFamily: t('font-sans'),
          fontWeight: t('font-weight-medium') as never,
        }}
      >
        {children}
      </Text>
      {count !== undefined && count > 0 && (
        <View
          style={{
            flexShrink: 0,
            // The web `.md .count` pulls the badge toward the trailing edge; sm
            // has no such nudge.
            marginRight: size === 'md' ? 'calc(var(--glacier-space-1) * -1 - 2px)' : 0,
          }}
        >
          <CounterBadge count={count} tone={isSelected ? 'accent' : 'neutral'} size={size} />
        </View>
      )}
    </Pressable>
  );
}
