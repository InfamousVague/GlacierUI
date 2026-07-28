/**
 * @glacier/native — ColorPicker.
 *
 * The React Native binding of @glacier/react's ColorPicker: lightness, chroma,
 * and hue over a live swatch. Every colour decision — the OKLCH↔sRGB matrices,
 * the hex parsing, the gamut test, the readable-on choice — comes from
 * @glacier/logic, so the two pickers resolve a drag to byte-identical colour.
 *
 * Web-parity notes:
 * - The channel sliders are the kit's own Slider rather than an <input
 *   type=range>, which is the closest native equivalent and keeps them
 *   keyboard- and screen-reader-operable through the existing component.
 * - Each track paints the gradient it traverses, as the web one does. React
 *   Native has no gradient primitive, but it does not need one: the rail is a
 *   run of solid segments sampled from `channelRamp`, the same ramp the web
 *   joins into a `linear-gradient`. Both bindings therefore travel identical
 *   colours, and no dependency was added to get there.
 * - The hex field is a TextInput with the same parse-before-commit rule, so a
 *   half-typed value never resolves to black.
 */
import { useState, type ReactNode } from 'react';
import { View, TextInput, Pressable, Text as RNText } from 'react-native';
import { colorPickerSpec } from '@glacier/spec';
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
  channelRamp,
  MAX_HUE,
  HUE_STEP,
} from '@glacier/logic';
import { t } from '../../tokens.ts';
import { dimensionsFor } from '../../resolve.ts';
import { Text } from '../display/Text.tsx';
import { Slider } from './Slider.tsx';
import { Skeleton } from '../feedback/Skeleton.tsx';

export interface ColorPickerProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  format?: 'oklch' | 'hex';
  presets?: string[];
  alpha?: boolean;
  size?: 'sm' | 'md';
  disabled?: boolean;
  skeleton?: boolean;
  emptyLabel?: ReactNode;
  /** Web-only escape hatch; accepted for parity and ignored here. */
  className?: string;
}

const BOX = dimensionsFor(colorPickerSpec);
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);

const DEFAULT = 'oklch(0.64 0.162 228)';

/** The labels the web kit routes through kitMessages; mirrored here. */
const LABELS = {
  picker: 'Colour picker',
  lightness: 'Lightness',
  chroma: 'Chroma',
  hue: 'Hue',
  alpha: 'Opacity',
  hex: 'Hex value',
  presets: 'Presets',
  outOfGamut: 'Outside sRGB',
};

const SWATCH_HEIGHT = { sm: 48, md: 72 };
// Mirrors the web's `--track-height` per size, as SWATCH_HEIGHT mirrors
// `--swatch-height`. Deliberately the literal and not the spec's
// `trackHeight: space-3`: space-3 is a density-scaled clamp, so reading the
// token here would make the native rail a couple of pixels off the web one at
// every density but the base.
const TRACK_HEIGHT = { sm: '0.625rem', md: '0.75rem' };

function parseColor(input: string): Oklch | null {
  const lch = parseOklch(input);
  if (lch) return lch;
  const rgb = parseHex(input);
  return rgb ? rgbToOklch(rgb) : null;
}

/**
 * The Glacier ColorPicker, rendered with React Native primitives. See the file
 * header for the parity contract.
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
}: ColorPickerProps) {
  const [value, setValue] = useControlled({ value: valueProp, defaultValue, onChange: onValueChange });
  // What the hex field shows while being edited, so a half-typed value can sit
  // there without repeatedly resolving to something wrong.
  const [draft, setDraft] = useState<string | null>(null);

  const color = parseColor(value) ?? parseColor(DEFAULT)!;
  const hex = oklchToHex(color);
  const displayable = inSrgbGamut(color);

  const radius = t(bare(BOX.radius) ?? 'radius-lg');
  const gap = t(bare(BOX.gap) ?? 'space-3');
  const border = t(bare(BOX.border) ?? 'hairline');

  const emit = (next: Oklch) => setValue(format === 'hex' ? oklchToHex(next) : formatOklch(next));

  const channels: { key: 'l' | 'c' | 'h' | 'a'; label: string; max: number; step: number }[] = [
    { key: 'l', label: LABELS.lightness, max: 1, step: 0.01 },
    { key: 'c', label: LABELS.chroma, max: MAX_CHROMA, step: 0.005 },
    // MAX_HUE, not 360: a full turn normalises back to 0, so a slider that
    // could reach it would snap to its own start.
    { key: 'h', label: LABELS.hue, max: MAX_HUE, step: HUE_STEP },
  ];
  if (alpha) channels.push({ key: 'a', label: LABELS.alpha, max: 1, step: 0.01 });

  const frame = {
    width: '100%' as const,
    maxWidth: 320,
    rowGap: gap,
    padding: t('space-3'),
    borderWidth: border,
    borderStyle: 'solid' as const,
    borderColor: t('border'),
    borderRadius: radius,
    backgroundColor: t('surface'),
    opacity: disabled ? 0.5 : 1,
  };

  if (skeleton) {
    return (
      <View style={frame}>
        <Skeleton width="100%" height={SWATCH_HEIGHT[size]} radius={t('radius-md')} />
        {channels.map((channel) => (
          <Skeleton key={channel.key} width="100%" height={12} radius={t('radius-full')} />
        ))}
      </View>
    );
  }

  return (
    <View accessibilityRole="none" accessibilityLabel={LABELS.picker} style={frame}>
      {/* The swatch names its own value in text: colour is never the only
          channel of information. */}
      <View
        style={{
          height: SWATCH_HEIGHT[size],
          padding: t('space-2'),
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          borderWidth: border,
          borderStyle: 'solid',
          borderColor: t('border'),
          borderRadius: t('radius-md'),
          backgroundColor: hex,
        }}
      >
        {/* Raw RN Text here, not the kit Text: this label needs an arbitrary
            colour — black or white, whichever is readable on the swatch behind
            it — and the kit Text only exposes the token tones. */}
        <RNText style={{ color: readableOn(color), fontFamily: t('font-mono'), fontSize: t('font-size-xs') }}>
          {hex}
        </RNText>
      </View>

      <View style={{ rowGap: t('space-2') }}>
        {channels.map((channel) => {
          const current = channel.key === 'a' ? (color.a ?? 1) : color[channel.key];
          return (
            <View key={channel.key} style={{ rowGap: 2 }}>
              <Text size="xs" tone="muted">
                {channel.label}
              </Text>
              <Slider
                min={0}
                max={channel.max}
                step={channel.step}
                value={current}
                disabled={disabled}
                aria-label={channel.label}
                trackColors={channelRamp(color, channel.key)}
                trackHeight={TRACK_HEIGHT[size]}
                onValueChange={(next: number) => emit({ ...color, [channel.key]: next })}
              />
            </View>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: t('space-2') }}>
        <TextInput
          value={draft ?? hex}
          editable={!disabled}
          aria-label={LABELS.hex}
          onChangeText={(next: string) => {
            setDraft(next);
            const parsed = parseHex(next);
            // Commit only once it parses, so a half-typed value never resolves
            // to black on the way through.
            if (parsed) emit(rgbToOklch(parsed));
          }}
          onBlur={() => setDraft(null)}
          style={{
            flexGrow: 1,
            flexShrink: 1,
            paddingVertical: t('space-1'),
            paddingHorizontal: t('space-2'),
            borderWidth: border,
            borderStyle: 'solid',
            borderColor: t('border'),
            borderRadius: t('radius-md'),
            backgroundColor: t('surface-raised'),
            color: t('text'),
            fontFamily: t('font-mono'),
            fontSize: t('font-size-sm'),
          }}
        />
        {!displayable && (
          // Mirrors the web's `.gamut { flex: none }`. Without it the label is
          // the flexible half of the row and wraps to two lines, while the hex
          // field — which has a whole field's worth of slack — keeps its width.
          // `Text` takes no style, so the rule lives on a wrapper.
          <View style={{ flexShrink: 0 }}>
          <Text size="xs" tone="muted">
            {LABELS.outOfGamut}
          </Text>
          </View>
        )}
      </View>

      {presets && presets.length > 0 && (
        <View
          accessibilityLabel={LABELS.presets}
          style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: t('space-1'), rowGap: t('space-1') }}
        >
          {presets.map((preset) => {
            const parsed = parseColor(preset);
            const presetHex = parsed ? oklchToHex(parsed) : preset;
            return (
              <Pressable
                key={preset}
                accessibilityRole="button"
                // A row of unlabelled swatches is a row of unlabelled buttons.
                accessibilityLabel={presetHex}
                accessibilityState={{ selected: presetHex === hex, disabled }}
                disabled={disabled}
                onPress={() => parsed && emit(parsed)}
                style={{
                  width: 24,
                  height: 24,
                  borderWidth: presetHex === hex ? 2 : border,
                  borderStyle: 'solid',
                  borderColor: presetHex === hex ? t('accent-border') : t('border'),
                  borderRadius: t('radius-md'),
                  backgroundColor: presetHex,
                }}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}

/** Re-exported so a host can read the picker's colour without a second import. */
export { readableOn };
