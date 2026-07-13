/**
 * @glacier/native — Select.
 *
 * The React Native binding of @glacier/react's Select: an Input-metric trigger
 * that toggles a glass listbox of options. Paint (surface trigger, glass-thick
 * menu, accent active row) and geometry (control height + inline padding per
 * size, radius-lg trigger, radius-md rows, the space-1 menu padding and the
 * option paddings) are read from the select spec through the shared resolvers,
 * so the resting control is visually identical to the web kit and cannot drift
 * from it. Selection is controlled/uncontrolled through the shared useControlled
 * hook, exactly like the web.
 *
 * Anchored-overlay approximation (device follow-ups, documented):
 * - React Native has no floating-ui or portal, so the menu is not portaled to a
 *   document body; it renders as an absolutely-positioned View inside the
 *   relative root, pinned below the trigger (top 100% + the web's 8px anchor
 *   gap). Collision-aware flip (the web's open-up branch), live scroll/resize
 *   reflow, and the RTL right-edge anchoring are dropped — the menu always opens
 *   below, inline-start aligned, floored at the trigger width. The dynamic
 *   120–416px max-height clamp becomes a fixed 26rem (416px) scroll cap.
 * - Outside-pointer dismissal (the web pointerdown listener) has no anchored
 *   equivalent without a full-screen layer; tapping the trigger again toggles
 *   the menu closed. The open/scale-in motion, reduced-motion branch, backdrop
 *   blur, and the WAI-ARIA activedescendant keyboard model (arrow/Home/End/
 *   Enter/Escape roving) are web/device follow-ups; taps select here.
 * - `name` (the hidden form input) and `className` are DOM concepts with no
 *   native owner and are accepted-but-noop. The web reads its invalid/id/
 *   described-by wiring from FieldContext, which does not exist here, so — like
 *   the native Input — `invalid` is surfaced as a direct prop.
 */
import { useState, type ReactNode } from 'react';
import { View, Text, Pressable, ScrollView, type ViewProps } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { selectSizes, selectSpec } from '@glacier/spec';
import { useControlled, paintFor } from '@glacier/commons';
import { t } from './tokens.ts';
import { sizeFor, dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

// Derived from the spec so the size union cannot drift from the web kit.
export type SelectSize = (typeof selectSizes)[number];

export interface SelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface SelectProps extends Omit<ViewProps, 'children'> {
  /** The list of { value, label, disabled } options to choose from. */
  options: SelectOption[];
  /** Controlled selected value. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Fires with the new value when a selection is committed. */
  onValueChange?: (value: string) => void;
  /** Shown on the trigger when no option is selected. */
  placeholder?: string;
  /** Control size step. */
  size?: SelectSize;
  /** Stretches the trigger to the container width. */
  fullWidth?: boolean;
  /** Dims the trigger and blocks opening the menu. */
  disabled?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Renders the frosted glass material on the trigger instead of a solid surface. */
  glass?: boolean;
  /**
   * Recolors the trigger border to danger. On the web this is read from the
   * surrounding Field's aria-invalid; there is no FieldContext here, so the
   * native binding surfaces it as a direct prop (matching the native Input).
   */
  invalid?: boolean;
  /**
   * Submitted with forms via a hidden input on the web. Accepted for prop
   * parity; native has no form owner, so it is a noop.
   */
  name?: string;
  /** Id for the trigger; maps to nativeID. */
  id?: string;
  /** Accessible name for the trigger and listbox. */
  'aria-label'?: string;
  /** Web-only escape hatch; accepted for parity and ignored on native. */
  className?: string;
}

// Size-independent box metrics (trigger radius, option radius, trigger gap,
// hairline border, menu padding) read once from the spec.
const BOX = dimensionsFor(selectSpec);

// Strip a leading `$` from a base-paint ref exactly as the shared resolvers do
// so it cannot drift from the web kit.
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);
const BASE = (selectSpec.paint ?? {}) as { background?: string; text?: string; border?: string };

// State paints read from the spec's `states` group so the tokens stay in sync
// with Select.module.css.
const OPEN = paintFor(selectSpec, 'states', 'open'); //           { border: focus-ring, ring: accent-soft }
const DISABLED = paintFor(selectSpec, 'states', 'disabled'); //   { background: surface-sunken }
const INVALID = paintFor(selectSpec, 'states', 'invalid'); //     { border: danger-border }
const PLACEHOLDER = paintFor(selectSpec, 'states', 'placeholder'); // { text: text-subtle }
const ACTIVE = paintFor(selectSpec, 'states', 'active'); //       { background: accent-solid, text: accent-contrast }
const SELECTED = paintFor(selectSpec, 'states', 'selected'); //   { check: text }
const OPTION_DISABLED = paintFor(selectSpec, 'states', 'option-disabled'); // { text: text-disabled }

const ACTIVE_BG = t(ACTIVE.background ?? 'accent-solid');
const ACTIVE_TEXT = t(ACTIVE.text ?? 'accent-contrast');
const CHECK_COLOR = t(SELECTED.check ?? 'text');
const DISABLED_TEXT = t(OPTION_DISABLED.text ?? 'text-disabled');

// The web anchors the menu 8px below the trigger (`const gap = 8`), untokenized
// in both kits; the raw length mirrors it exactly. The dynamic 120–416px
// max-height clamp collapses to the web's 416px (26rem) ceiling here.
const MENU_GAP = '0.5rem';
const MENU_MAX_HEIGHT = '26rem';
// The check slot is a fixed 0.875rem square in the CSS (`.check`), not a token.
const CHECK_SLOT = '0.875rem';

// The trailing up/down chevron glyph, matching the web Chevrons SVG. Painted the
// spec's text-subtle role rather than currentColor so it resolves on-device too.
const Chevrons = (
  <Svg width={10} height={14} viewBox="0 0 10 14" fill="none" aria-hidden={true}>
    <Path
      d="M1.5 5 5 1.5 8.5 5M1.5 9 5 12.5 8.5 9"
      stroke={t('text-subtle')}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * The Glacier Select, rendered with React Native primitives. See the file header
 * for the anchored-overlay parity contract; visually identical to
 * @glacier/react's Select in its resting closed and open states.
 */
export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = 'Select…',
  size = 'md',
  fullWidth = false,
  disabled = false,
  skeleton = false,
  glass = false,
  invalid = false,
  name: _name,
  id,
  className: _className,
  'aria-label': ariaLabel,
  style,
  ...rest
}: SelectProps) {
  const [selected, setSelected] = useControlled({
    value,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  });
  const [open, setOpen] = useState(false);

  if (skeleton) {
    // Same geometry the web Skeleton renders: 11rem (or full width), control
    // height, radius-lg.
    return (
      <Skeleton
        width={fullWidth ? '100%' : '11rem'}
        height={t(`control-height-${size}`)}
        radius={t(BOX.radius ?? 'radius-lg')}
      />
    );
  }

  const dims = sizeFor(selectSpec, size);
  const selectedOption = options.find((o) => o.value === selected);
  // The option list carries font-size-xs at sm, font-size-sm otherwise (the web
  // `.menuSm .option` override); leading-sm on both trigger value and rows.
  const optionFont = t(size === 'sm' ? 'font-size-xs' : 'font-size-sm');

  // Resting trigger border: danger when invalid, focus-ring while open, the
  // glass hairline under glass, else the spec base border.
  const borderColor = invalid
    ? t(INVALID.border ?? 'danger-border')
    : open
      ? t(OPEN.border ?? 'focus-ring')
      : glass
        ? t('glass-border')
        : t(bare(BASE.border) ?? 'border');

  // Disabled sinks the surface; glass is the resting frosted tint; else base surface.
  const backgroundColor = disabled
    ? t(DISABLED.background ?? 'surface-sunken')
    : glass
      ? t('glass-regular')
      : t(bare(BASE.background) ?? 'surface');

  function toggle() {
    if (disabled || options.length === 0) return;
    setOpen((o) => !o);
  }

  function commit(option: SelectOption) {
    if (option.disabled) return;
    setSelected(option.value);
    setOpen(false);
  }

  return (
    <View
      {...rest}
      // `style` is applied LAST as an array so a caller's layout style (width,
      // margin, flex) augments the root without wiping its paint, and `...rest`
      // can never clobber the component style.
      style={[
        {
          position: 'relative',
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          width: fullWidth ? '100%' : undefined,
        },
        style as never,
      ]}
    >
      <Pressable
        nativeID={id}
        accessibilityRole="button"
        aria-label={ariaLabel}
        // aria-haspopup/aria-expanded are not in the RN prop shim; the RN-native
        // accessibilityState (expanded) is the equivalent and maps on rn-web.
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        onPress={toggle}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          columnGap: t(BOX.gap ?? 'space-3'),
          width: fullWidth ? '100%' : undefined,
          height: t(dims.height ?? 'control-height-md'),
          paddingHorizontal: t(dims.paddingInline ?? 'space-4'),
          borderWidth: t(BOX.border ?? 'hairline'),
          borderStyle: 'solid',
          borderColor,
          borderRadius: t(BOX.radius ?? 'radius-lg'),
          backgroundColor,
          opacity: disabled ? 0.5 : 1,
          // The 3px accent-soft glow hugging the trigger while open (box-shadow on
          // react-native-web; ignored on-device).
          ...(open ? { boxShadow: `0 0 0 3px ${t(OPEN.ring ?? 'accent-soft')}` } : null),
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            flexShrink: 1,
            // The value dims to text-subtle when nothing is selected (placeholder).
            color: selectedOption ? t(bare(BASE.text) ?? 'text') : t(PLACEHOLDER.text ?? 'text-subtle'),
            fontSize: t(dims.fontSize ?? 'font-size-sm'),
            lineHeight: t('leading-sm') as never,
            fontFamily: t('font-sans'),
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        {Chevrons}
      </Pressable>

      {open && (
        // The glass listbox: an absolutely-positioned View anchored below the
        // trigger (see the file header for the approximation). Floored at the
        // trigger width, scrolls past the 26rem cap.
        <View
          aria-label={ariaLabel}
          accessibilityRole="menu"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: MENU_GAP,
            minWidth: '100%',
            zIndex: 200,
            padding: t(BOX.menuPadding ?? 'space-1'),
            borderWidth: t(BOX.border ?? 'hairline'),
            borderStyle: 'solid',
            borderColor: t('glass-border'),
            borderRadius: t(BOX.radius ?? 'radius-lg'),
            backgroundColor: t('glass-thick'),
            // The layered drop shadow (box-shadow on react-native-web; the glass
            // blur + inset highlight are dropped on-device).
            boxShadow: t('shadow-4'),
          }}
        >
          <ScrollView style={{ maxHeight: MENU_MAX_HEIGHT }}>
            {options.map((option) => {
              const isSelected = option.value === selected;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="menuitem"
                  // aria-selected is not in the RN prop shim; accessibilityState
                  // (selected) is the RN-native equivalent and maps on rn-web.
                  accessibilityState={{ selected: isSelected, disabled: option.disabled }}
                  disabled={option.disabled}
                  onPress={() => commit(option)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    columnGap: t('space-1'),
                    paddingVertical: t('space-2'),
                    // padding-inline: space-2 (leading) space-3 (trailing).
                    paddingLeft: t('space-2'),
                    paddingRight: t('space-3'),
                    borderRadius: t(BOX.optionRadius ?? 'radius-md'),
                    // The web `data-active` accent fill lands on hover/arrow-nav;
                    // the native analog is the pressed state (accent-solid fill).
                    backgroundColor: pressed && !option.disabled ? ACTIVE_BG : 'transparent',
                  })}
                >
                  {({ pressed }) => {
                    const active = pressed && !option.disabled;
                    const labelColor = option.disabled ? DISABLED_TEXT : active ? ACTIVE_TEXT : t('text');
                    // The check inherits the row text color: accent-contrast while
                    // active, else the selected-state `text` role.
                    const checkColor = active ? ACTIVE_TEXT : CHECK_COLOR;
                    return (
                      <>
                        <View
                          style={{
                            width: CHECK_SLOT,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {isSelected && (
                            <Svg width={11} height={11} viewBox="0 0 12 12" fill="none" aria-hidden={true}>
                              <Path
                                d="M2.5 6.5 5 9 9.5 3.5"
                                stroke={checkColor}
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </Svg>
                          )}
                        </View>
                        <Text
                          numberOfLines={1}
                          style={{
                            flexShrink: 1,
                            color: labelColor,
                            fontSize: optionFont,
                            lineHeight: t('leading-sm') as never,
                            fontFamily: t('font-sans'),
                          }}
                        >
                          {option.label}
                        </Text>
                      </>
                    );
                  }}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
