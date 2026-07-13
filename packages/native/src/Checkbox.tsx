import { type ReactNode } from 'react';
import { View, Text, Pressable, type PressableProps } from 'react-native';
import { checkboxSpec } from '@glacier/spec';
import { useControlled, paintFor } from '@glacier/commons';
import { t } from './tokens.ts';
import { paintStyle, dimensionsFor } from './resolve.ts';

export interface CheckboxProps extends Omit<PressableProps, 'style' | 'children'> {
  label?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Mixed state: shows a dash while unchecked. */
  indeterminate?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
}

// Size-independent box metrics (radius, gap, border, size) read once from the
// spec. `size`/`iconSize` are raw CSS values (not $token refs), so they are used
// directly; the token-backed metrics are wrapped in t().
const BOX = dimensionsFor(checkboxSpec);
const SIZE = BOX.size ?? '1.375rem';

// The unchecked box paints from the spec's base paint; strip the leading `$`
// exactly as the shared resolvers do so it cannot drift from the web kit.
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);
const BASE = (checkboxSpec.paint ?? {}) as { background?: string; border?: string };

// The filled (checked / indeterminate) paint and check glyph color from the
// `checked` state entry.
const FILLED = paintStyle(checkboxSpec, 'states', 'checked');
const CHECK_COLOR = t(paintFor(checkboxSpec, 'states', 'checked').check ?? 'accent-contrast');

/**
 * The Glacier Checkbox, rendered with React Native primitives. Paint and
 * geometry are read from the checkbox spec through the shared resolvers, so it
 * is visually identical to @glacier/react's Checkbox. A rotated bordered View
 * draws the check (a bar for the indeterminate dash); the box fills with the
 * accent when checked, and the whole control is a Pressable row that toggles on
 * tap. The web draw-in animation is a device follow-up — the resting visual is
 * pixel-matched.
 */
export function Checkbox({
  label,
  checked,
  defaultChecked = false,
  onCheckedChange,
  indeterminate = false,
  disabled = false,
  skeleton = false,
  glass = false,
  ...rest
}: CheckboxProps) {
  const [isChecked, setChecked] = useControlled({
    value: checked,
    defaultValue: defaultChecked ?? false,
    onChange: onCheckedChange,
  });
  const showDash = indeterminate && !isChecked;
  const filled = isChecked || showDash;

  const box = {
    width: SIZE,
    height: SIZE,
    borderRadius: t(BOX.radius ?? 'radius-sm'),
    borderStyle: 'solid' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  if (skeleton) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: t(BOX.gap ?? 'space-2') }}>
        <View style={{ ...box, backgroundColor: t('border-strong') }} />
        {label != null && (
          <View style={{ width: 96, height: t('font-size-sm'), borderRadius: t('radius-sm'), backgroundColor: t('border-strong') }} />
        )}
      </View>
    );
  }

  // Unchecked paint: the frosted material (glass-regular fill, glass-border
  // hairline) mirrors the web `.box.glass` rule; otherwise the spec base paint.
  // (Native cannot blur, so glass is the resting tint only.)
  const unchecked = glass
    ? {
        backgroundColor: t('glass-regular'),
        borderColor: t('glass-border'),
        borderWidth: t(BOX.border ?? 'hairline'),
      }
    : {
        backgroundColor: t(bare(BASE.background) ?? 'surface'),
        borderColor: t(bare(BASE.border) ?? 'border-strong'),
        borderWidth: t(BOX.border ?? 'hairline'),
      };

  return (
    <Pressable
      accessibilityRole="checkbox"
      // Indeterminate reports "mixed", matching the DOM checkbox's
      // aria-checked="mixed" (set via the input's `indeterminate` property).
      accessibilityState={{ checked: showDash ? 'mixed' : isChecked, disabled }}
      disabled={disabled}
      onPress={() => setChecked(!isChecked)}
      // The web control (a label) has no press-scale; keep the row static.
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: t(BOX.gap ?? 'space-2'),
        opacity: disabled ? 0.5 : 1,
      }}
      {...rest}
    >
      <View style={{ ...box, ...(filled ? FILLED : unchecked) }}>
        {isChecked && (
          <View
            style={{
              width: 5,
              height: 9,
              marginTop: -2,
              borderRightWidth: 2,
              borderBottomWidth: 2,
              borderColor: CHECK_COLOR,
              transform: [{ rotate: '45deg' }],
            }}
          />
        )}
        {showDash && (
          <View style={{ width: 8, height: 2, borderRadius: 1, backgroundColor: CHECK_COLOR }} />
        )}
      </View>
      {label != null && (
        <Text
          style={{
            // The web `.control` label is regular weight (no font-weight set).
            color: t('text'),
            fontSize: t('font-size-sm'),
            fontFamily: t('font-sans'),
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
