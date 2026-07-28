import {
  MAX_CHROMA,
  formatOklch,
  inSrgbGamut,
  oklchToHex,
  parseHex,
  parseOklch,
  readableOn,
  rgbToOklch,
  useControlled,
  type Oklch,
} from '@glacier/logic';
import { useState, type ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../i18n/messages.ts';
import { Text } from '../../atoms/display/Typography/Text.tsx';
import { Size, TextTone } from '@glacier/spec';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import styles from './ColorPicker.module.css';

export interface ColorPickerProps extends Omit<ComponentProps<'div'>, 'onChange' | 'defaultValue' | 'color'> {
  /** Controlled colour, as a CSS oklch() or hex string. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Which notation to report. */
  format?: 'oklch' | 'hex';
  /** Fixed swatches offered under the sliders. */
  presets?: string[];
  /** Offers an opacity slider as a fourth channel. */
  alpha?: boolean;
  size?: 'sm' | 'md';
  disabled?: boolean;
  skeleton?: boolean;
}

const DEFAULT = 'oklch(0.64 0.162 228)';

/** Parses either notation, so a caller can hand us whichever it has. */
function parseColor(input: string): Oklch | null {
  const lch = parseOklch(input);
  if (lch) return lch;
  const rgb = parseHex(input);
  return rgb ? rgbToOklch(rgb) : null;
}

/**
 * An OKLCH colour picker.
 *
 * OKLCH rather than HSL because that is the space the kit's own ramps are
 * authored in: a colour picked here sits on the same perceptual footing as
 * every token around it, and its lightness means the same thing at every hue —
 * which is exactly what HSL does not give you.
 *
 * Three plain range inputs rather than a 2D gradient canvas. A canvas is only
 * operable by dragging, so it cannot be used without sight or without a mouse;
 * three labelled sliders plus a hex field can be driven entirely from the
 * keyboard, and each slider paints the gradient it actually traverses.
 *
 * Out-of-gamut colours are named rather than silently clamped, so the swatch
 * never quietly shows something other than what was asked for.
 */
export function ColorPicker({
  value: valueProp,
  defaultValue = DEFAULT,
  onValueChange,
  format = 'oklch',
  presets,
  alpha = false,
  size = 'md',
  disabled = false,
  skeleton = false,
  className,
  ...rest
}: ColorPickerProps) {
  const t = useT();
  const [value, setValue] = useControlled({ value: valueProp, defaultValue, onChange: onValueChange });

  // What the hex field is showing while it is being edited. Kept separate from
  // the colour so a half-typed value can sit in the field without repeatedly
  // resolving to something wrong.
  const [draft, setDraft] = useState<string | null>(null);

  const color = parseColor(value) ?? parseColor(DEFAULT)!;
  const hex = oklchToHex(color);
  const displayable = inSrgbGamut(color);

  const emit = (next: Oklch) => setValue(format === 'hex' ? oklchToHex(next) : formatOklch(next));

  const channels: { key: 'l' | 'c' | 'h' | 'a'; label: string; max: number; step: number; track: string }[] = [
    {
      key: 'l',
      label: t(kitMessages.colorLightness),
      max: 1,
      step: 0.01,
      // Each track paints the gradient it actually traverses, so the slider
      // shows what moving it will do.
      track: `linear-gradient(to right, ${[0, 0.25, 0.5, 0.75, 1]
        .map((l) => oklchToHex({ ...color, l }))
        .join(', ')})`,
    },
    {
      key: 'c',
      label: t(kitMessages.colorChroma),
      max: MAX_CHROMA,
      step: 0.005,
      track: `linear-gradient(to right, ${[0, 0.5, 1]
        .map((f) => oklchToHex({ ...color, c: f * MAX_CHROMA }))
        .join(', ')})`,
    },
    {
      key: 'h',
      label: t(kitMessages.colorHue),
      max: 360,
      step: 1,
      track: `linear-gradient(to right, ${[0, 60, 120, 180, 240, 300, 360]
        .map((h) => oklchToHex({ ...color, h }))
        .join(', ')})`,
    },
  ];

  if (alpha) {
    channels.push({
      key: 'a',
      label: t(kitMessages.colorAlpha),
      max: 1,
      step: 0.01,
      track: `linear-gradient(to right, transparent, ${hex})`,
    });
  }

  if (skeleton) {
    return (
      <div className={cx(styles.root, styles[size], className)} {...rest}>
        <Skeleton width="100%" height="4rem" radius="var(--glacier-radius-lg)" />
        {channels.map((channel) => (
          <Skeleton key={channel.key} width="100%" height="var(--glacier-space-3)" radius="var(--glacier-radius-full)" />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cx(styles.root, styles[size], className)}
      data-disabled={disabled || undefined}
      role="group"
      aria-label={rest['aria-label'] ?? t(kitMessages.colorPicker)}
      {...rest}
    >
      {/* The swatch names its own value in text: colour is never the only
          channel of information. */}
      <div className={styles.swatch} style={{ background: hex, color: readableOn(color) }}>
        <span className={styles.swatchValue}>{hex}</span>
      </div>

      <div className={styles.sliders}>
        {channels.map((channel) => {
          const current = channel.key === 'a' ? (color.a ?? 1) : color[channel.key];
          return (
            <label key={channel.key} className={styles.slider}>
              <span className={styles.sliderLabel}>{channel.label}</span>
              <input
                type="range"
                className={styles.track}
                style={{ backgroundImage: channel.track }}
                min={0}
                max={channel.max}
                step={channel.step}
                value={current}
                disabled={disabled}
                // Names the channel as well as the number, so a screen reader
                // says "lightness 64%" rather than a bare "0.64".
                aria-valuetext={`${channel.label} ${Math.round((current / channel.max) * 100)}%`}
                onChange={(event) => emit({ ...color, [channel.key]: Number(event.target.value) })}
              />
            </label>
          );
        })}
      </div>

      <div className={styles.footer}>
        {/* The non-visual route to an exact colour: a picker that can only be
            driven by dragging cannot be used without sight. */}
        <input
          type="text"
          className={styles.field}
          value={draft ?? hex}
          disabled={disabled}
          aria-label={t(kitMessages.colorHex)}
          spellCheck={false}
          onChange={(event) => {
            setDraft(event.target.value);
            const parsed = parseHex(event.target.value);
            // Only commit once it parses; a half-typed value stays in the field
            // instead of resolving to black on every keystroke.
            if (parsed) emit(rgbToOklch(parsed));
          }}
          onBlur={() => setDraft(null)}
        />

        {!displayable && (
          <Text tone={TextTone.Muted} size={Size.XSmall} className={styles.gamut}>
            {t(kitMessages.colorOutOfGamut)}
          </Text>
        )}
      </div>

      {presets && presets.length > 0 && (
        <div className={styles.presets} role="group" aria-label={t(kitMessages.colorPresets)}>
          {presets.map((preset) => {
            const parsed = parseColor(preset);
            const presetHex = parsed ? oklchToHex(parsed) : preset;
            return (
              <button
                key={preset}
                type="button"
                className={styles.preset}
                style={{ background: presetHex }}
                // A row of unlabelled swatches is a row of unlabelled buttons.
                aria-label={presetHex}
                aria-pressed={presetHex === hex}
                disabled={disabled}
                onClick={() => parsed && emit(parsed)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
