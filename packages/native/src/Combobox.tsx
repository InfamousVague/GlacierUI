// Combobox — the React Native binding of @glacier/react's molecules/Combobox.
// An editable input plus a filtered option list rendered in an anchored floating
// layer. Paint and geometry are read from the combobox spec through the shared
// resolvers, so the resting visual matches the DOM kit and cannot drift.
import { useEffect, useId, useState, type ReactNode } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, type ViewProps, type StyleProp } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { comboboxSpec, comboboxSizes } from '@glacier/spec';
import { useControlled, paintFor } from '@glacier/commons';
import { t } from './tokens.ts';
import { sizeFor, dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

// Derived from the spec so the size union cannot drift from the web kit.
export type ComboboxSize = (typeof comboboxSizes)[number];

export interface ComboboxOption {
  /** Unique submitted value. */
  value: string;
  /** Content rendered in the input and result row. */
  label: ReactNode;
  /** Plain-text filtering value when label is not a string. */
  textValue?: string;
  /** Optional muted supporting content below the label. */
  description?: ReactNode;
  disabled?: boolean;
}

export interface ComboboxProps extends Omit<ViewProps, 'style' | 'children'> {
  options: ComboboxOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (value: string) => void;
  filter?: (option: ComboboxOption, inputValue: string) => boolean;
  placeholder?: string;
  emptyState?: ReactNode;
  loading?: boolean;
  size?: ComboboxSize;
  fullWidth?: boolean;
  disabled?: boolean;
  skeleton?: boolean;
  glass?: boolean;
  /**
   * DOM form value submitted through a hidden input when set. There is no form
   * owner on native, so it is accepted for prop parity and is a noop.
   */
  name?: string;
  /** DOM parity for the input `id`; maps to the input's `nativeID`. */
  id?: string;
  'aria-label'?: string;
  /** Web-only escape hatch; accepted for parity and ignored on native. */
  className?: string;
  /** Caller style, merged over the root wrapper. */
  style?: StyleProp;
}

interface VisibleOption {
  option: ComboboxOption;
  index: number;
}

function optionText(option: ComboboxOption | undefined): string {
  if (!option) return '';
  if (option.textValue !== undefined) return option.textValue;
  return typeof option.label === 'string' ? option.label : option.value;
}

// Strip the leading `$` from a base-paint ref exactly as the shared resolvers do
// so it cannot drift from the web kit.
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);
const BASE = (comboboxSpec.paint ?? {}) as { background?: string; text?: string; border?: string };

// Size-independent box metrics (radius, option radius, border, menu padding).
const BOX = dimensionsFor(comboboxSpec);

// State paints read from the spec's `states` group so the tokens stay in sync
// with Combobox.module.css.
const FOCUS = paintFor(comboboxSpec, 'states', 'focus'); //    { border: focus-ring, ring: accent-soft }
const DISABLED = paintFor(comboboxSpec, 'states', 'disabled'); // { background: surface-sunken }
const MENU = paintFor(comboboxSpec, 'states', 'open'); //      { background: glass-thick, border: glass-border, highlight: glass-highlight, shadow: shadow-4 }
const ACTIVE = paintFor(comboboxSpec, 'states', 'active'); //  { background: accent-solid, text: accent-contrast }
const EMPTY = paintFor(comboboxSpec, 'states', 'empty'); //    { text: text-subtle }

// The web pads the field's trailing edge clear of the chevron: space-8 at sm/md,
// space-10 at lg (Combobox.module.css `.input.sm/.md/.lg`).
const chevronPad = (size: ComboboxSize): string => (size === 'lg' ? 'space-10' : 'space-8');

// The listbox drops font-size to xs at the sm step (`.menu.sm .option/.message`).
const rowFont = (size: ComboboxSize): string => (size === 'sm' ? 'font-size-xs' : 'font-size-sm');

const Chevron = (color: string) => (
  <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
    <Path d="m3 4.5 3 3 3-3" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/**
 * The Glacier Combobox, rendered with React Native primitives. The trigger is a
 * <TextInput> that filters `options`; while open, the listbox renders as an
 * absolutely-positioned View anchored below the input (top 100% + a space-1 gap)
 * inside the relatively-positioned root, matching the web's bottom-start,
 * match-width placement. Options are Pressable rows that commit on tap; the
 * keyboard-active row (the committed selection, or the first enabled result)
 * takes the accent fill, exactly as the web paints `.option[data-active]`.
 *
 * Resting visuals only. React Native has no floating-ui/portal, so the overlay
 * is an in-flow absolute layer: collision-aware flip/clamp, a true portal past
 * the root, outside-press dismissal, and reduced-motion fade/scale-in are device
 * follow-ups. Keyboard navigation (arrow/Home/End/Enter/Escape/Tab), the ARIA
 * combobox wiring (aria-activedescendant/aria-controls/aria-expanded), the
 * surrounding Field's id/describedBy/invalid, the hidden form input (`name`),
 * localized loading/empty strings, `glass` backdrop blur, and `className` are
 * web-only and are approximated or accepted-but-noop here.
 */
export function Combobox({
  options,
  value,
  defaultValue,
  onValueChange,
  inputValue,
  defaultInputValue,
  onInputValueChange,
  filter,
  placeholder,
  emptyState,
  loading = false,
  size = 'md',
  fullWidth = false,
  disabled = false,
  skeleton = false,
  glass = false,
  name: _name,
  id,
  className: _className,
  'aria-label': ariaLabel,
  style,
  ...rest
}: ComboboxProps) {
  const listId = useId();
  const initialSelected = defaultValue ?? '';
  const initialOption = options.find((option) => option.value === initialSelected);
  const [selected, setSelected] = useControlled({ value, defaultValue: initialSelected });
  const [query, setQuery] = useControlled({
    value: inputValue,
    defaultValue: defaultInputValue ?? optionText(initialOption),
  });
  const [open, setOpen] = useState(false);
  const [activeValue, setActiveValue] = useState<string | undefined>();
  const [focused, setFocused] = useState(false);

  const selectedOption = options.find((option) => option.value === selected);

  function matches(option: ComboboxOption, nextQuery: string): boolean {
    if (filter) return filter(option, nextQuery);
    return optionText(option).toLocaleLowerCase().includes(nextQuery.trim().toLocaleLowerCase());
  }

  function optionsFor(nextQuery: string): VisibleOption[] {
    return options.flatMap((option, index) => (matches(option, nextQuery) ? [{ option, index }] : []));
  }

  const visibleOptions = optionsFor(query);

  // Mirror the web: a controlled `value` with an uncontrolled input mirrors the
  // committed option's text back into the field.
  useEffect(() => {
    if (value !== undefined && inputValue === undefined) setQuery(optionText(selectedOption));
  }, [inputValue, selectedOption, setQuery, value]);

  function firstEnabled(items: VisibleOption[]): string | undefined {
    return items.find(({ option }) => !option.disabled)?.option.value;
  }

  function openMenu(nextQuery = query) {
    if (disabled) return;
    const nextOptions = optionsFor(nextQuery);
    const matchingSelection = nextOptions.find(({ option }) => option.value === selected && !option.disabled)?.option.value;
    setActiveValue(matchingSelection ?? firstEnabled(nextOptions));
    setOpen(true);
  }

  function commit(option: ComboboxOption | undefined) {
    if (!option || option.disabled) return;
    setSelected(option.value);
    onValueChange?.(option.value);
    const nextQuery = optionText(option);
    setQuery(nextQuery);
    onInputValueChange?.(nextQuery);
    setActiveValue(option.value);
    setOpen(false);
  }

  if (skeleton) {
    return (
      <Skeleton
        width={fullWidth ? '100%' : '11rem'}
        height={t(`control-height-${size}`)}
        radius={t(BOX.radius ?? 'radius-lg')}
      />
    );
  }

  const dims = sizeFor(comboboxSpec, size);

  // Resting input paint: the glass hairline under `glass`, else the spec base
  // border; focus swaps to the focus-ring. Disabled sinks the surface.
  const restingBorder = glass ? t('glass-border') : t(bare(BASE.border) ?? 'border');
  const borderColor = focused && !disabled ? t(FOCUS.border ?? 'focus-ring') : restingBorder;
  const backgroundColor = disabled
    ? t(DISABLED.background ?? 'surface-sunken')
    : glass
      ? t('glass-regular')
      : t(bare(BASE.background) ?? 'surface');
  const subtle = t('text-subtle');
  const menuFont = t(rowFont(size));

  return (
    <View
      {...rest}
      style={[
        {
          position: 'relative',
          minWidth: '11rem',
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          width: fullWidth ? '100%' : undefined,
        },
        style as never,
      ]}
    >
      <View style={{ position: 'relative', flexDirection: 'row', alignItems: 'center', width: '100%' }}>
        <TextInput
          nativeID={id}
          aria-label={ariaLabel}
          value={query}
          placeholder={placeholder}
          placeholderTextColor={subtle}
          editable={!disabled}
          onFocus={() => {
            setFocused(true);
            openMenu();
          }}
          onBlur={() => setFocused(false)}
          onChangeText={(next) => {
            setQuery(next);
            onInputValueChange?.(next);
            setActiveValue(firstEnabled(optionsFor(next)));
            setOpen(true);
          }}
          style={{
            width: '100%',
            height: t(dims.height ?? 'control-height-md'),
            // Inline padding from the size step; the trailing edge clears the chevron.
            paddingLeft: t(dims.paddingInline ?? 'space-4'),
            paddingRight: t(chevronPad(size)),
            borderWidth: t(BOX.border ?? 'hairline'),
            borderStyle: 'solid',
            borderColor,
            borderRadius: t(BOX.radius ?? 'radius-lg'),
            backgroundColor,
            color: t(bare(BASE.text) ?? 'text'),
            fontSize: t(dims.fontSize ?? 'font-size-sm'),
            fontFamily: t('font-sans'),
            opacity: disabled ? 0.5 : 1,
            // The 3px accent-soft focus glow (box-shadow on react-native-web; the
            // border swap carries the state on-device).
            ...(focused && !disabled ? { boxShadow: `0 0 0 3px ${t(FOCUS.ring ?? 'accent-soft')}` } : null),
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            right: t('space-3'),
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {Chevron(subtle)}
        </View>
      </View>

      {open && (
        <View
          accessibilityRole="list"
          nativeID={listId}
          accessibilityState={{ busy: loading || undefined }}
          style={{
            position: 'absolute',
            // Anchored below the trigger (bottom-start): top 100% + a space-1 gap,
            // left/right 0 to match the trigger width. A collision-aware flip/clamp
            // and a real portal are device follow-ups.
            top: '100%',
            left: 0,
            right: 0,
            marginTop: t('space-1'),
            zIndex: 200,
            overflow: 'hidden',
            borderWidth: t(BOX.border ?? 'hairline'),
            borderStyle: 'solid',
            borderColor: t(MENU.border ?? 'glass-border'),
            borderRadius: t(BOX.radius ?? 'radius-lg'),
            backgroundColor: t(MENU.background ?? 'glass-thick'),
            boxShadow: `inset 0 ${t('hairline')} 0 ${t(MENU.highlight ?? 'glass-highlight')}, ${t(MENU.shadow ?? 'shadow-4')}`,
          }}
        >
          <ScrollView
            style={{ maxHeight: '20rem' }}
            contentContainerStyle={{ padding: t(BOX.menuPadding ?? 'space-1') }}
          >
            {loading ? (
              <View style={{ padding: t('space-3'), borderRadius: t(BOX.optionRadius ?? 'radius-md') }}>
                <Text style={{ color: t(EMPTY.text ?? 'text-subtle'), fontSize: menuFont, lineHeight: t('leading-sm') as never, fontFamily: t('font-sans') }}>
                  Loading…
                </Text>
              </View>
            ) : visibleOptions.length === 0 ? (
              <View style={{ padding: t('space-3'), borderRadius: t(BOX.optionRadius ?? 'radius-md') }}>
                <Text style={{ color: t(EMPTY.text ?? 'text-subtle'), fontSize: menuFont, lineHeight: t('leading-sm') as never, fontFamily: t('font-sans') }}>
                  {emptyState ?? 'No options'}
                </Text>
              </View>
            ) : (
              visibleOptions.map(({ option }) => {
                const isActive = option.value === activeValue;
                const labelColor = isActive
                  ? t(ACTIVE.text ?? 'accent-contrast')
                  : option.disabled
                    ? t('text-disabled')
                    : t('text');
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected: option.value === selected, disabled: option.disabled }}
                    disabled={option.disabled}
                    onPress={() => commit(option)}
                    style={{
                      flexDirection: 'column',
                      rowGap: t('space-1'),
                      paddingVertical: t('space-2'),
                      paddingHorizontal: t('space-3'),
                      borderRadius: t(BOX.optionRadius ?? 'radius-md'),
                      ...(isActive ? { backgroundColor: t(ACTIVE.background ?? 'accent-solid') } : null),
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{
                        color: labelColor,
                        fontSize: menuFont,
                        lineHeight: t('leading-sm') as never,
                        fontFamily: t('font-sans'),
                      }}
                    >
                      {option.label}
                    </Text>
                    {option.description != null && (
                      <Text
                        style={{
                          color: isActive ? t(ACTIVE.text ?? 'accent-contrast') : t('text-muted'),
                          opacity: isActive ? 0.8 : 1,
                          fontSize: t('font-size-xs'),
                          fontFamily: t('font-sans'),
                        }}
                      >
                        {option.description}
                      </Text>
                    )}
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
