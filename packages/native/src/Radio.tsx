import { type ReactNode } from 'react';
import { View, Text, Pressable, type PressableProps } from 'react-native';
import { radioSpec } from '@glacier/spec';
import { useControlled, paintFor } from '@glacier/commons';
import { t } from './tokens.ts';
import { dimensionsFor } from './resolve.ts';

export interface RadioProps extends Omit<PressableProps, 'style' | 'children'> {
  label?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /**
   * Web-parity change callback. The DOM Radio is controlled via the input's
   * `onChange`; a controlled group passes `checked` + `onChange`, so this mirrors
   * that contract (fired on select, in addition to `onCheckedChange`).
   */
  onChange?: (event?: unknown) => void;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
}

// Size-independent indicator metrics read once from the spec. `diameter`/
// `dotSize` are raw CSS lengths (not $token refs), so they are used directly;
// the token-backed metrics (radius/gap/border) are wrapped in t().
const BOX = dimensionsFor(radioSpec);
const SIZE = BOX.diameter ?? '1.375rem';
const DOT = BOX.dotSize ?? '0.5rem';

// The unchecked ring paints from the spec's base paint; strip the leading `$`
// exactly as the shared resolvers do so it cannot drift from the web kit.
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);
const BASE = (radioSpec.paint ?? {}) as { background?: string; border?: string };

// The checked border color + inner-dot color from the `checked` state entry.
const CHECKED = paintFor(radioSpec, 'states', 'checked');
const CHECKED_BORDER = t(CHECKED.border ?? 'accent-solid');
const DOT_COLOR = t(CHECKED.dot ?? 'accent-solid');

/**
 * The Glacier Radio, rendered with React Native primitives. Paint and geometry
 * are read from the radio spec through the shared resolvers, so it is visually
 * identical to @glacier/react's Radio. A hairline-ringed circular View is the
 * indicator; unlike the Checkbox it keeps its surface fill when checked and only
 * the border shifts to the accent while an accent inner dot appears. The whole
 * control is a Pressable row that selects on tap. The web dot-pop spring is a
 * device follow-up — the resting visual is pixel-matched.
 */
export function Radio({
  label,
  checked,
  defaultChecked = false,
  onCheckedChange,
  onChange,
  disabled = false,
  skeleton = false,
  glass = false,
  ...rest
}: RadioProps) {
  const [isChecked, setChecked] = useControlled({
    value: checked,
    defaultValue: defaultChecked ?? false,
    // Fire both callbacks: `onChange` for web parity, `onCheckedChange` for the
    // kit-level contract shared with Checkbox/Switch.
    onChange: (next) => {
      onChange?.();
      onCheckedChange?.(next);
    },
  });

  const ring = {
    width: SIZE,
    height: SIZE,
    borderRadius: t(BOX.radius ?? 'radius-full'),
    borderWidth: t(BOX.border ?? 'hairline'),
    borderStyle: 'solid' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  if (skeleton) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: t(BOX.gap ?? 'space-2') }}>
        <View style={{ ...ring, backgroundColor: t('border-strong'), borderColor: 'transparent' }} />
        {label != null && (
          <View style={{ width: 96, height: t('font-size-sm'), borderRadius: t('radius-sm'), backgroundColor: t('border-strong') }} />
        )}
      </View>
    );
  }

  // The ring keeps its surface fill in every state (glass swaps in the frosted
  // tint — native cannot blur, so this is the resting tint only). Only the
  // border shifts to the accent when checked, mirroring the web `.dot` rules.
  const backgroundColor = glass ? t('glass-regular') : t(bare(BASE.background) ?? 'surface');
  const borderColor = isChecked
    ? CHECKED_BORDER
    : glass
      ? t('glass-border')
      : t(bare(BASE.border) ?? 'border-strong');

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: isChecked, disabled }}
      disabled={disabled}
      onPress={() => setChecked(true)}
      // The web control (a label) has no press-scale; keep the row static.
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: t(BOX.gap ?? 'space-2'),
        opacity: disabled ? 0.5 : 1,
      }}
      {...rest}
    >
      <View style={{ ...ring, backgroundColor, borderColor }}>
        {isChecked && (
          <View style={{ width: DOT, height: DOT, borderRadius: t('radius-full'), backgroundColor: DOT_COLOR }} />
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
