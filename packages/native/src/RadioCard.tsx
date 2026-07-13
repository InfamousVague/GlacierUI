import { type ReactNode } from 'react';
import { View, Text, Pressable, type PressableProps } from 'react-native';
import { radioCardSpec } from '@glacier/spec';
import { useControlled, paintFor } from '@glacier/commons';
import { t } from './tokens.ts';
import { dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

export interface RadioCardProps extends Omit<PressableProps, 'children'> {
  /** The card heading, the primary label of the choice. */
  title: ReactNode;
  /** Secondary line under the title. */
  description?: ReactNode;
  /** Leading glyph or preview swatch above the title. */
  icon?: ReactNode;
  /** Controlled selected state. */
  checked?: boolean;
  /** Initial selected state when uncontrolled. */
  defaultChecked?: boolean;
  /** Called with the next checked state when the card is selected. */
  onCheckedChange?: (checked: boolean) => void;
  /** Extra content rendered below the description. */
  children?: ReactNode;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /**
   * The native radio value submitted with the form. Accepted for prop parity
   * with @glacier/react; native has no form owner, so it is a noop.
   */
  value?: string;
  /**
   * Groups cards into one radio set on the web. Accepted for prop parity; on
   * native the group is owned by the parent through `checked`/`onCheckedChange`,
   * so it is a noop.
   */
  name?: string;
}

// Size-independent geometry read once from the spec. `indicator` (1.25rem) is a
// raw CSS length used directly; the token-backed metrics are wrapped in t().
const BOX = dimensionsFor(radioCardSpec);

/**
 * A resolved measurement value. `dimensionsFor` returns bare token names (e.g.
 * `space-4`) alongside raw CSS lengths (the indicator's `1.25rem` is declared
 * inline, not as a token). Token names get wrapped in the custom property; a raw
 * length — anything that starts with a digit or dot — passes straight through so
 * it never becomes `var(--glacier-1.25rem)`.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

// Strip the leading `$` from a base-paint ref exactly as the shared resolvers do
// so it cannot drift from the web kit.
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);
const BASE = (radioCardSpec.paint ?? {}) as { background?: string; text?: string; border?: string };

// The checked paint (accent border + accent-soft tint + accent-solid badge) from
// the `checked` state entry. The badge's check color is the CSS `.indicator`
// color role (accent-contrast); it lives in the token list, not the state map.
const CHECKED = paintFor(radioCardSpec, 'states', 'checked');
const CHECKED_BORDER = t(CHECKED.border ?? 'accent-solid');
const CHECKED_BG = t(CHECKED.background ?? 'accent-soft');
const INDICATOR_BG = t(CHECKED.indicator ?? 'accent-solid');
const CHECK_COLOR = t('accent-contrast');

/**
 * The Glacier RadioCard, rendered with React Native primitives. A selectable
 * preview tile with radio semantics: paint (surface-raised base, accent border +
 * accent-soft tint when checked) and geometry (radius-lg, space-4 padding, the
 * space-5 body inset and the corner badge) are read from the radio-card spec
 * through the shared resolvers, so it is visually identical to @glacier/react's
 * RadioCard and cannot drift from it. Like the web it uses its own tile geometry
 * (not the Card's radius-xl/space-6), and mirrors Radio/Checkbox: the whole tile
 * is a Pressable that selects on tap, with a corner check badge synthesized from
 * a rotated bordered View (the Checkbox glyph) instead of an SVG path.
 *
 * A bare title (no description or children) is a compact tile: the badge rides
 * centered on the trailing edge instead of pinning to the top-right corner.
 *
 * Resting visuals only. The web spring-in of the corner check on select is a
 * device follow-up — the resting selected state is pixel-matched. `value`/`name`
 * are DOM form attributes with no native form owner and are accepted-but-noop.
 */
export function RadioCard({
  title,
  description,
  icon,
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  skeleton = false,
  children,
  value: _value,
  name: _name,
  style,
  ...rest
}: RadioCardProps) {
  const [isChecked, setChecked] = useControlled({
    value: checked,
    defaultValue: defaultChecked ?? false,
    onChange: onCheckedChange,
  });

  // A bare title (no description or extra content) is a compact tile: the badge
  // rides inline with the title instead of pinning to the top-right corner.
  const compact = description == null && children == null;

  // Shared tile box, painted from the spec base paint or the checked state.
  const box = {
    position: 'relative' as const,
    flexDirection: 'column' as const,
    rowGap: metric(BOX.gap, 'space-2'),
    minWidth: 0,
    padding: metric(BOX.padding, 'space-4'),
    borderWidth: metric(BOX.border, 'hairline'),
    borderStyle: 'solid' as const,
    borderColor: isChecked ? CHECKED_BORDER : t(bare(BASE.border) ?? 'border-subtle'),
    borderRadius: metric(BOX.radius, 'radius-lg'),
    backgroundColor: isChecked ? CHECKED_BG : t(bare(BASE.background) ?? 'surface-raised'),
  };

  if (skeleton) {
    // Resting placeholder at the tile's exact geometry: two text lines (7rem /
    // 10rem) inside the bordered surface, matching the web `.skeleton` rule.
    return (
      <View style={box}>
        <Skeleton variant="text" width="7rem" />
        <Skeleton variant="text" width="10rem" />
      </View>
    );
  }

  const indicator = (
    <View
      // The corner (or trailing-centered, when compact) check badge. Only present
      // when checked, matching the web indicator's scale-0/opacity-0 resting hide.
      aria-hidden={true}
      style={{
        position: 'absolute',
        right: metric(BOX.indicatorInset, 'space-3'),
        top: compact ? '50%' : metric(BOX.indicatorInset, 'space-3'),
        // Center vertically without a transform (transform is reserved for the
        // check glyph's rotation), mirroring the web `.compact .indicator` rule.
        marginTop: compact ? '-0.625rem' : undefined,
        width: metric(BOX.indicator, '1.25rem'),
        height: metric(BOX.indicator, '1.25rem'),
        borderRadius: t('radius-full'),
        backgroundColor: INDICATOR_BG,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
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
    </View>
  );

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: isChecked, disabled }}
      // Also surface the selected state as aria-checked so react-native-web
      // exposes it to assistive tech (accessibilityState alone does not map here).
      aria-checked={isChecked}
      disabled={disabled}
      // Radios select (never toggle off) on press, matching the native Radio.
      onPress={() => setChecked(true)}
      {...rest}
      // `style` is applied LAST as an array so a caller's layout style (flex,
      // width, margin) merges over the box without wiping its paint, and `...rest`
      // can never clobber the tile. The web control (a label) has no press-scale.
      style={[{ ...box, justifyContent: compact ? 'center' : undefined, opacity: disabled ? 0.5 : 1 }, style as never]}
    >
      {icon != null && (
        <View
          // Leading glyph, hidden from assistive tech and tinted with accent-text.
          // A currentColor SVG or glyph picks up this `color` on react-native-web,
          // matching the web `.icon` rule.
          aria-hidden={true}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            color: t('accent-text'),
            fontSize: metric(BOX.iconSize, 'font-size-md'),
            lineHeight: 1 as never,
          }}
        >
          {icon}
        </View>
      )}
      <View
        style={{
          flexDirection: 'column',
          rowGap: metric(BOX.bodyGap, 'space-1'),
          minWidth: 0,
          // padding-inline-end -> right: keep text clear of the corner badge.
          paddingRight: metric(BOX.bodyInset, 'space-5'),
        }}
      >
        <Text
          style={{
            fontSize: metric(BOX.titleSize, 'font-size-sm'),
            fontWeight: t('font-weight-semibold') as never,
            lineHeight: t('leading-md') as never,
            color: t(bare(BASE.text) ?? 'text'),
            fontFamily: t('font-sans'),
          }}
        >
          {title}
        </Text>
        {description != null && (
          <Text
            style={{
              fontSize: metric(BOX.descriptionSize, 'font-size-xs'),
              lineHeight: t('leading-md') as never,
              color: t('text-muted'),
              fontFamily: t('font-sans'),
            }}
          >
            {description}
          </Text>
        )}
        {children != null && <View style={{ marginTop: t('space-1') }}>{children}</View>}
      </View>
      {isChecked && indicator}
    </Pressable>
  );
}
