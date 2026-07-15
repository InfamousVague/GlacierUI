/**
 * @glacier/native — MultiSelect
 *
 * The React Native binding of @glacier/react's MultiSelect: an editable
 * multi-value combobox that filters options, renders selected values as
 * removable tags, and opens a listbox of toggleable option rows (Pressable rows
 * with an accent check on the selected ones). Paint and geometry are read from
 * the multi-select spec through the shared resolvers, so the resting control and
 * menu are pixel-identical to the web kit and cannot drift from it.
 *
 * Overlay approximation: React Native has no portal or floating-ui. The listbox
 * renders as an absolutely-positioned View inside the relatively-positioned root,
 * pinned below the control (top:'100%' + a space-1 gap, matched to the control
 * width via left/right 0). Precise collision-aware flip/clamp placement, a true
 * body portal, and outside-press-to-close are a device follow-up; here the
 * trailing chevron toggles the menu (on the web it is a decorative indicator and
 * the input's focus/outside-press drive open/close).
 *
 * Resting visuals only: the fade/scale-in of the panel, the backdrop blur (glass
 * is the resting tint), and the 3px focus glow (a react-native-web box-shadow,
 * dropped on device) are not animated. Keyboard navigation is approximated via
 * onKeyPress where react-native-web forwards physical keys. `name` (hidden form
 * inputs) and `className` are web-only and accepted-but-noop; Field-driven id /
 * describedBy / invalid have no FieldContext here and are a device follow-up.
 */
import { type ReactNode, useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, type ViewProps, type StyleProp } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { multiSelectSpec, controlSizes } from '@glacier/spec';
import { useControlled, paintFor } from '@glacier/commons';
import { t } from './tokens.ts';
import { sizeFor, dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

// Derived from the spec so the size union cannot drift from the web kit.
export type MultiSelectSize = (typeof controlSizes)[number];

export interface MultiSelectOption {
  /** Unique submitted value. */
  value: string;
  /** Content rendered in a tag and option row. */
  label: ReactNode;
  /** Plain-text filtering value when label is not a string. */
  textValue?: string;
  /** Optional muted supporting content below the label. */
  description?: ReactNode;
  disabled?: boolean;
}

export interface MultiSelectProps extends Omit<ViewProps, 'children' | 'style'> {
  options: MultiSelectOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (value: string) => void;
  filter?: (option: MultiSelectOption, inputValue: string) => boolean;
  placeholder?: string;
  emptyState?: ReactNode;
  loading?: boolean;
  size?: MultiSelectSize;
  fullWidth?: boolean;
  disabled?: boolean;
  skeleton?: boolean;
  glass?: boolean;
  /** Web-only: submits one hidden input per selected value. No native form owner; accepted-but-noop. */
  name?: string;
  /** DOM parity for the input id; maps to the TextInput nativeID. */
  id?: string;
  'aria-label'?: string;
  /** Web-only escape hatch; accepted for parity and ignored on native. */
  className?: string;
  /** Caller layout style, merged over the root wrapper (augments, never clobbers). */
  style?: StyleProp;
}

interface VisibleOption {
  option: MultiSelectOption;
  index: number;
}

function optionText(option: MultiSelectOption | undefined): string {
  if (!option) return '';
  if (option.textValue !== undefined) return option.textValue;
  return typeof option.label === 'string' ? option.label : option.value;
}

// Size-independent box metrics (radius, tag/option radius, gap, border, menu
// padding) read once from the spec so they cannot drift from the web kit.
const BOX = dimensionsFor(multiSelectSpec);

// Strip the leading `$` from a base-paint ref exactly as the shared resolvers do.
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);
const BASE = (multiSelectSpec.paint ?? {}) as { background?: string; text?: string; border?: string };

// State paints, read from the spec's `states` group so the tokens stay in sync
// with MultiSelect.module.css.
const FOCUS = paintFor(multiSelectSpec, 'states', 'focus'); //    { border: focus-ring, ring: accent-soft }
const OPEN = paintFor(multiSelectSpec, 'states', 'open'); //      { background: glass-thick, border: glass-border, highlight, shadow }
const ACTIVE = paintFor(multiSelectSpec, 'states', 'active'); //  { background: accent-solid, text: accent-contrast }
const SELECTED = paintFor(multiSelectSpec, 'states', 'selected'); // { background: accent-soft, check: accent-solid }
const EMPTY = paintFor(multiSelectSpec, 'states', 'empty'); //    { text: text-subtle }
const DISABLED = paintFor(multiSelectSpec, 'states', 'disabled'); // { background: surface-sunken }

/** Wrap a bare token name (with a fallback) in its custom property. */
const tok = (name: string | undefined, fallback: string): string => t(name ?? fallback);

// The size step encodes only paddingInline; the web CSS pairs it with a vertical
// pad (space-1 at sm/md, space-2 at lg) that the spec does not carry.
const PAD_INLINE: Record<MultiSelectSize, string> = { sm: 'space-2', md: 'space-3', lg: 'space-4' };
const padY = (size: MultiSelectSize): string => (size === 'lg' ? 'space-2' : 'space-1');

/**
 * The trailing chevron, drawn with react-native-svg. react-native-svg does not
 * inherit currentColor on device, so the stroke is the resolved token color.
 */
function Chevron({ color }: { color: string }) {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12" fill="none" aria-hidden={true}>
      <Path d="m3 4.5 3 3 3-3" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** The selected-option check glyph. */
function Check({ color }: { color: string }) {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12" fill="none" aria-hidden={true}>
      <Path d="M2.5 6.5 5 9 9.5 3.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** The small ✕ inside a tag's remove button. */
function Remove({ color }: { color: string }) {
  return (
    <Svg width={10} height={10} viewBox="0 0 10 10" fill="none" aria-hidden={true}>
      <Path d="M2 2l6 6M8 2l-6 6" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

/**
 * The Glacier MultiSelect, rendered with React Native primitives. The control is
 * a wrapping flex row of accent-soft tags plus an editable <TextInput>; the menu
 * is an absolutely-positioned glass panel of Pressable option rows anchored below
 * the control. Controlled/uncontrolled selection and query run through the shared
 * useControlled hook, so `value`/`onValueChange` and `inputValue`/`onInputValueChange`
 * mirror the DOM contract exactly.
 */
export function MultiSelect({
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
}: MultiSelectProps) {
  // useControlled's setter already calls onChange, so setSelected fires
  // onValueChange and setQuery fires onInputValueChange (no separate relay).
  const [selected, setSelected] = useControlled({ value, defaultValue: defaultValue ?? [], onChange: onValueChange });
  const [query, setQuery] = useControlled({ value: inputValue, defaultValue: defaultInputValue ?? '', onChange: onInputValueChange });
  const [open, setOpen] = useState(false);
  const [activeValue, setActiveValue] = useState<string | undefined>();
  const [focused, setFocused] = useState(false);

  function matches(option: MultiSelectOption, nextQuery: string): boolean {
    if (filter) return filter(option, nextQuery);
    return optionText(option).toLocaleLowerCase().includes(nextQuery.trim().toLocaleLowerCase());
  }

  function optionsFor(nextQuery: string): VisibleOption[] {
    return options.flatMap((option, index) => (matches(option, nextQuery) ? [{ option, index }] : []));
  }

  const visibleOptions = optionsFor(query);
  const activeOption = visibleOptions.find(({ option }) => option.value === activeValue);
  const selectedOptions = selected.flatMap((selectedValue) => {
    const option = options.find((candidate) => candidate.value === selectedValue);
    return option ? [option] : [];
  });

  function firstEnabled(items: VisibleOption[]): string | undefined {
    return items.find(({ option }) => !option.disabled)?.option.value;
  }

  function openMenu(nextQuery = query) {
    if (disabled) return;
    setActiveValue(firstEnabled(optionsFor(nextQuery)));
    setOpen(true);
  }

  function moveActive(delta: 1 | -1) {
    const enabled = visibleOptions.filter(({ option }) => !option.disabled);
    if (enabled.length === 0) return;
    const current = enabled.findIndex(({ option }) => option.value === activeValue);
    const next = current === -1 ? (delta === 1 ? 0 : enabled.length - 1) : Math.min(Math.max(current + delta, 0), enabled.length - 1);
    setActiveValue(enabled[next]?.option.value);
  }

  function toggleOption(option: MultiSelectOption | undefined) {
    if (!option || option.disabled) return;
    const next = selected.includes(option.value)
      ? selected.filter((selectedValue) => selectedValue !== option.value)
      : [...selected, option.value];
    setSelected(next);
    setQuery('');
    setActiveValue(option.value);
    setOpen(true);
  }

  function removeValue(selectedValue: string) {
    setSelected(selected.filter((valueToKeep) => valueToKeep !== selectedValue));
  }

  // react-native-web forwards physical keys through onKeyPress; the shim has no
  // preventDefault, so this is a best-effort mirror of the DOM key handling.
  function onKeyPress(event: { nativeEvent: { key: string } }) {
    switch (event.nativeEvent.key) {
      case 'ArrowDown':
        open ? moveActive(1) : openMenu();
        break;
      case 'ArrowUp':
        open ? moveActive(-1) : openMenu();
        break;
      case 'Enter':
        if (open) toggleOption(activeOption?.option);
        break;
      case 'Escape':
        if (open) setOpen(false);
        break;
      case 'Backspace': {
        const last = selected.length > 0 ? selected[selected.length - 1] : undefined;
        if (query === '' && last !== undefined) removeValue(last);
        break;
      }
    }
  }

  if (skeleton) {
    return <Skeleton width={fullWidth ? '100%' : '11rem'} height={t(`control-height-${size}`)} radius={tok(BOX.radius, 'radius-lg')} />;
  }

  const dims = sizeFor(multiSelectSpec, size);

  // Resting border: the glass hairline under glass, else the spec base border.
  // Focus swaps to the focus-ring color (react-native-web only) with a 3px glow.
  const restingBorder = glass ? t('glass-border') : t(bare(BASE.border) ?? 'border');
  const borderColor = focused && !disabled ? t(FOCUS.border ?? 'focus-ring') : restingBorder;
  // Disabled sinks the surface; glass is the resting frosted tint; else base surface.
  const backgroundColor = disabled
    ? t(DISABLED.background ?? 'surface-sunken')
    : glass
      ? t('glass-regular')
      : t(bare(BASE.background) ?? 'surface');

  const tagColor = t(SELECTED.check ?? 'accent-solid');

  return (
    <View
      {...rest}
      // `style` is applied LAST as an array so a caller's layout style (width,
      // margin, flex) merges over the wrapper without wiping it, and `...rest`
      // can never clobber the component style.
      style={[
        { position: 'relative', ...(fullWidth ? { width: '100%' } : { alignSelf: 'flex-start', minWidth: '11rem' }) },
        style as never,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          alignContent: 'center',
          columnGap: tok(BOX.gap, 'space-1'),
          rowGap: tok(BOX.gap, 'space-1'),
          width: '100%',
          minHeight: t(`control-height-${size}`),
          paddingHorizontal: t(dims.paddingInline ?? PAD_INLINE[size]),
          paddingVertical: t(padY(size)),
          borderWidth: tok(BOX.border, 'hairline'),
          borderStyle: 'solid',
          borderColor,
          borderRadius: tok(BOX.radius, 'radius-lg'),
          backgroundColor,
          opacity: disabled ? 0.5 : 1,
          ...(focused && !disabled ? { boxShadow: `0 0 0 3px ${t(FOCUS.ring ?? 'accent-soft')}` } : null),
        }}
      >
        {selectedOptions.map((option) => (
          <View
            key={option.value}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              columnGap: tok(BOX.gap, 'space-1'),
              minWidth: 0,
              paddingLeft: t('space-2'),
              paddingRight: t('space-1'),
              borderRadius: tok(BOX.tagRadius, 'radius-full'),
              backgroundColor: t(SELECTED.background ?? 'accent-soft'),
            }}
          >
            <Text
              numberOfLines={1}
              style={{ color: tagColor, fontSize: t(dims.fontSize ?? 'font-size-sm'), lineHeight: t('leading-sm') as never, fontFamily: t('font-sans') }}
            >
              {option.label}
            </Text>
            {!disabled && (
              <Pressable
                accessibilityRole="button"
                aria-label={`Remove ${optionText(option)}`}
                onPress={() => removeValue(option.value)}
                style={{
                  width: t('space-4'),
                  height: t('space-4'),
                  borderRadius: tok(BOX.tagRadius, 'radius-full'),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Remove color={tagColor} />
              </Pressable>
            )}
          </View>
        ))}
        <TextInput
          nativeID={id}
          aria-label={ariaLabel}
          value={query}
          editable={!disabled}
          placeholder={selectedOptions.length === 0 ? placeholder : undefined}
          placeholderTextColor={t('text-subtle')}
          onChangeText={(text) => {
            setQuery(text);
            setActiveValue(firstEnabled(optionsFor(text)));
            setOpen(true);
          }}
          onFocus={() => {
            setFocused(true);
            openMenu();
          }}
          onBlur={() => setFocused(false)}
          onKeyPress={onKeyPress}
          style={{
            flexGrow: 1,
            flexShrink: 1,
            flexBasis: t('space-10'),
            minWidth: t('space-10'),
            minHeight: t('space-5'),
            padding: 0,
            borderWidth: 0,
            backgroundColor: 'transparent',
            color: t(bare(BASE.text) ?? 'text'),
            fontSize: t(dims.fontSize ?? 'font-size-sm'),
            fontFamily: t('font-sans'),
            lineHeight: t('leading-sm') as never,
          }}
        />
        <Pressable
          accessibilityRole="button"
          aria-hidden={true}
          disabled={disabled}
          onPress={() => (open ? setOpen(false) : openMenu())}
          style={{ flexGrow: 0, flexShrink: 0, alignItems: 'center', justifyContent: 'center' }}
        >
          <Chevron color={t('text-subtle')} />
        </Pressable>
      </View>

      {open && (
        <View
          aria-label={ariaLabel}
          accessibilityState={{ busy: loading || undefined }}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: t('space-1'),
            zIndex: 200,
            maxHeight: '20rem',
            padding: tok(BOX.menuPadding, 'space-1'),
            borderWidth: tok(BOX.border, 'hairline'),
            borderStyle: 'solid',
            borderColor: t(OPEN.border ?? 'glass-border'),
            borderRadius: tok(BOX.radius, 'radius-lg'),
            backgroundColor: t(OPEN.background ?? 'glass-thick'),
            boxShadow: `inset 0 ${t('hairline')} 0 ${t(OPEN.highlight ?? 'glass-highlight')}, ${t(OPEN.shadow ?? 'shadow-4')}`,
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {loading ? (
              <Message>Loading…</Message>
            ) : visibleOptions.length === 0 ? (
              <Message>{emptyState ?? 'No options'}</Message>
            ) : (
              visibleOptions.map(({ option }) => {
                const isSelected = selected.includes(option.value);
                const keyboardActive = option.value === activeValue && !option.disabled;
                return (
                  <Pressable
                    key={option.value}
                    disabled={option.disabled}
                    accessibilityState={{ selected: isSelected, disabled: option.disabled }}
                    onPress={() => toggleOption(option)}
                    style={({ hovered }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      columnGap: t('space-3'),
                      paddingVertical: t('space-2'),
                      paddingHorizontal: t('space-3'),
                      borderRadius: tok(BOX.optionRadius, 'radius-md'),
                      backgroundColor: rowBackground(keyboardActive || (!option.disabled && !!hovered), isSelected),
                    })}
                  >
                    {({ hovered }) => {
                      const on = keyboardActive || (!option.disabled && !!hovered);
                      const labelColor = option.disabled ? t('text-disabled') : on ? t(ACTIVE.text ?? 'accent-contrast') : t(bare(BASE.text) ?? 'text');
                      const descColor = on ? t(ACTIVE.text ?? 'accent-contrast') : t('text-muted');
                      const checkColor = on ? t(ACTIVE.text ?? 'accent-contrast') : t(SELECTED.check ?? 'accent-solid');
                      return (
                        <>
                          <View style={{ flexDirection: 'column', flexShrink: 1, minWidth: 0, rowGap: t('space-1') }}>
                            <Text numberOfLines={1} style={{ color: labelColor, fontSize: t('font-size-sm'), lineHeight: t('leading-sm') as never, fontFamily: t('font-sans') }}>
                              {option.label}
                            </Text>
                            {option.description != null && (
                              <Text style={{ color: descColor, opacity: on ? 0.8 : 1, fontSize: t('font-size-xs'), lineHeight: t('leading-sm') as never, fontFamily: t('font-sans') }}>
                                {option.description}
                              </Text>
                            )}
                          </View>
                          {isSelected && (
                            <View style={{ flexShrink: 0 }}>
                              <Check color={checkColor} />
                            </View>
                          )}
                        </>
                      );
                    }}
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

/** Option row fill: accent-solid while active/hovered, accent-soft when a
 *  selected row is at rest, transparent otherwise. */
function rowBackground(active: boolean, selected: boolean): string {
  if (active) return t(ACTIVE.background ?? 'accent-solid');
  if (selected) return t(SELECTED.background ?? 'accent-soft');
  return 'transparent';
}

/** The non-selectable loading / empty result row (subtle text, space-3 pad). */
function Message({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        paddingVertical: t('space-3'),
        paddingHorizontal: t('space-3'),
        color: t(EMPTY.text ?? 'text-subtle'),
        fontSize: t('font-size-sm'),
        lineHeight: t('leading-sm') as never,
        fontFamily: t('font-sans'),
      }}
    >
      {children}
    </Text>
  );
}
