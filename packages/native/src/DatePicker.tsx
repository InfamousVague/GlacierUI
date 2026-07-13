/**
 * @glacier/native — DatePicker.
 *
 * The React Native binding of @glacier/react's DatePicker: an Input-metric
 * trigger (a leading CalendarDays glyph + the formatted value) that opens the
 * native <Calendar> in an anchored overlay. Trigger paint (surface/glass
 * surface, disabled sink) and geometry (control height + inline padding + gap
 * per size, radius-lg, hairline border) are read from the date-picker spec
 * through the shared resolvers, and the panel reuses the spec's panel
 * padding/radius plus the glass tokens, so the resting control is visually
 * identical to the web kit and cannot drift from it. The value is
 * controlled/uncontrolled through the shared useControlled hook, exactly like
 * the web; the embedded Calendar is rendered `bare` so the panel frames it, and
 * choosing a day commits the value and closes the panel.
 *
 * Parity approximations (web/device follow-ups, documented):
 * - No portal + floating-ui: the web portals the panel to document.body and
 *   places it with the shared anchored-position engine (flip to the top when
 *   space runs out, clamp to the viewport, track scroll/resize, anchor to the
 *   right edge under RTL). Here the panel is an absolutely-positioned View
 *   inside the relatively-positioned root, pinned below the trigger (top 100% +
 *   the web's anchor gap); it always opens downward, inline-start aligned. A
 *   real portal + floating-ui flip/clamp/scroll-track is a device follow-up.
 * - Outside-press dismissal (the web pointerdown listener), the open scale/fade
 *   motion and reduced-motion branch, the hover border wash, and the keyboard
 *   model (open on Enter/Space, roving day focus, Escape-to-close with trigger
 *   refocus) are dropped — tapping the trigger toggles the panel and tapping a
 *   day selects and closes it.
 * - `name` (the hidden ISO yyyy-MM-dd form input) has no form owner on native
 *   and is accepted-but-noop; the web's FieldContext wiring (id / aria-describedby
 *   / aria-invalid fallback) does not exist here. `className` is a DOM concept
 *   with no native owner and is accepted-but-noop.
 * - The web derives its format locale from LocaleProvider; there is no provider
 *   on native, so the app passes a date-fns `locale` (default enUS), overridable
 *   per instance with `dateFnsLocale` exactly like the native Calendar. The
 *   default placeholder is the literal 'Pick a date' (the web localizes it).
 */
import { useState } from 'react';
import { View, Text, Pressable, type ViewProps } from 'react-native';
import { format } from 'date-fns';
import { enUS, type Locale } from 'date-fns/locale';
import { CalendarDays } from '@glacier/icons';
import { datePickerSpec, datePickerSizes } from '@glacier/spec';
import { useControlled, paintFor } from '@glacier/commons';
import { t } from './tokens.ts';
import { sizeFor, dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';
import { Calendar } from './Calendar.tsx';

// Derived from the spec so the size union cannot drift from the web kit.
export type ControlSize = (typeof datePickerSizes)[number];

export interface DatePickerProps extends Omit<ViewProps, 'children'> {
  /** Controlled selected date. */
  value?: Date;
  /** Uncontrolled initial date. */
  defaultValue?: Date;
  /** Called with the next date, or undefined when the selected day is unpicked. */
  onValueChange?: (value: Date | undefined) => void;
  /** Hint shown while no date is selected; defaults to 'Pick a date'. */
  placeholder?: string;
  /** Control size step. */
  size?: ControlSize;
  /** Stretches the control to its container width. */
  fullWidth?: boolean;
  /** Dims the trigger and blocks opening the panel. */
  disabled?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Renders the frosted glass material on the trigger instead of a solid surface. */
  glass?: boolean;
  /** Earliest selectable date. */
  min?: Date;
  /** Latest selectable date. */
  max?: Date;
  /** Marks matching dates disabled and unselectable in the panel. */
  disabledDates?: (date: Date) => boolean;
  /** Overrides the app locale for the formatted value and the panel names. */
  dateFnsLocale?: Locale;
  /**
   * The date-fns locale that formats the value and the panel's month/weekday
   * names. The web derives this from LocaleProvider; there is no provider on
   * native, so the app passes it here (defaults to enUS). `dateFnsLocale`
   * overrides it per instance.
   */
  locale?: Locale;
  /**
   * Submitted with forms via a hidden ISO input on the web. Accepted for prop
   * parity; native has no form owner, so it is a noop.
   */
  name?: string;
  /** Id for the trigger; maps to nativeID. */
  id?: string;
  /** Accessible name for the trigger and the panel. */
  'aria-label'?: string;
  /** Web-only escape hatch; accepted for parity and ignored on native. */
  className?: string;
}

// Size-independent box metrics (trigger radius, hairline border, panel padding
// and radius) read once from the spec.
const BOX = dimensionsFor(datePickerSpec);

// The base paint (`{ background, text, border }`) lives on the spec's top-level
// `paint`; strip the leading `$` exactly as the shared resolvers do so it cannot
// drift from the web kit.
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);
const BASE = (datePickerSpec.paint ?? {}) as { background?: string; text?: string; border?: string };

// State paints read from the spec's `states` group so the tokens stay in sync
// with DatePicker.module.css.
const OPEN = paintFor(datePickerSpec, 'states', 'open'); //           { border: focus-ring }
const FOCUS = paintFor(datePickerSpec, 'states', 'focus'); //         { border: focus-ring, ring: accent-soft }
const DISABLED = paintFor(datePickerSpec, 'states', 'disabled'); //   { background: surface-sunken }
const PLACEHOLDER = paintFor(datePickerSpec, 'states', 'placeholder'); // { text: text-subtle }

// The web anchors the panel below the trigger through the shared engine; the
// small gap mirrors the web's anchor offset. Untokenized in both kits, exactly
// like the trigger's 11rem min-width (a literal in DatePicker.module.css).
const PANEL_GAP = '0.5rem';
const TRIGGER_MIN_WIDTH = '11rem';

/**
 * The Glacier DatePicker, rendered with React Native primitives. See the file
 * header for the anchored-overlay parity contract; the resting trigger and the
 * open panel are visually matched to @glacier/react's DatePicker.
 */
export function DatePicker({
  value,
  defaultValue,
  onValueChange,
  placeholder,
  size = 'md',
  fullWidth = false,
  disabled = false,
  skeleton = false,
  glass = false,
  min,
  max,
  disabledDates,
  dateFnsLocale,
  locale,
  name: _name,
  id,
  className: _className,
  'aria-label': ariaLabel,
  style,
  ...rest
}: DatePickerProps) {
  const [selected, setSelected] = useControlled<Date | undefined>({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const [open, setOpen] = useState(false);

  const activeLocale = dateFnsLocale ?? locale ?? enUS;

  if (skeleton) {
    // Same geometry the web Skeleton renders: 11rem (or full width), control
    // height, radius-lg.
    return (
      <Skeleton
        width={fullWidth ? '100%' : TRIGGER_MIN_WIDTH}
        height={t(`control-height-${size}`)}
        radius={t(BOX.radius ?? 'radius-lg')}
      />
    );
  }

  const dims = sizeFor(datePickerSpec, size);

  // Resting trigger border: focus-ring while open, the glass hairline under
  // glass, else the spec base border.
  const borderColor = open
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

  // Committing a day closes the panel; unpicking (undefined) leaves it open, as
  // on the web. setSelected fires onValueChange through the useControlled hook.
  function handleSelect(next: Date | undefined) {
    setSelected(next);
    if (next) setOpen(false);
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
        onPress={() => setOpen((o) => !o)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          columnGap: t(dims.gap ?? 'space-2'),
          minWidth: TRIGGER_MIN_WIDTH,
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
          ...(open ? { boxShadow: `0 0 0 3px ${t(FOCUS.ring ?? 'accent-soft')}` } : null),
        }}
      >
        <CalendarDays size={16} color={t('text-subtle')} />
        <Text
          numberOfLines={1}
          style={{
            flexShrink: 1,
            // The value dims to text-subtle when nothing is selected (placeholder).
            color: selected ? t(bare(BASE.text) ?? 'text') : t(PLACEHOLDER.text ?? 'text-subtle'),
            fontSize: t(dims.fontSize ?? 'font-size-sm'),
            lineHeight: t('leading-sm') as never,
            fontFamily: t('font-sans'),
          }}
        >
          {selected ? format(selected, 'PP', { locale: activeLocale }) : (placeholder ?? 'Pick a date')}
        </Text>
      </Pressable>

      {open && (
        // The glass panel: an absolutely-positioned View anchored below the
        // trigger (see the file header for the approximation). Reuses the spec's
        // panel padding/radius + glass tokens; the Calendar renders bare inside.
        <View
          aria-label={ariaLabel ?? 'Calendar'}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: PANEL_GAP,
            zIndex: 200,
            padding: t(BOX.panelPadding ?? 'space-3'),
            borderWidth: t(BOX.border ?? 'hairline'),
            borderStyle: 'solid',
            borderColor: t('glass-border'),
            borderRadius: t(BOX.panelRadius ?? 'radius-lg'),
            backgroundColor: t('glass-thick'),
            // The layered drop shadow (box-shadow on react-native-web; the glass
            // blur + inset highlight are dropped on-device).
            boxShadow: t('shadow-4'),
          }}
        >
          <Calendar
            bare
            mode="single"
            value={selected}
            onValueChange={handleSelect}
            min={min}
            max={max}
            disabledDates={disabledDates}
            dateFnsLocale={dateFnsLocale}
            locale={locale}
            aria-label={ariaLabel}
          />
        </View>
      )}
    </View>
  );
}
