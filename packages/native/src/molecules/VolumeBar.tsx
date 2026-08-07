// The Glacier VolumeBar, rendered with React Native primitives: a fader with a
// mute toggle on its leading edge and a level readout on its trailing edge. The
// decibel conversion and its formatting come from @glacier/logic, the same
// functions the DOM kit calls, so the two rails are calibrated identically.

import { View } from 'react-native';
import { Volume, Volume1, Volume2, VolumeX } from '@glacier/icons';
import { formatGain, useControlled, volumeGain } from '@glacier/logic';
import { volumeReadouts, volumeBarSizes, volumeBarOrientations, volumeBarLayouts } from '@glacier/spec';
import { t } from '../tokens.ts';
import { IconButton } from '../atoms/inputs/IconButton.tsx';
import { Slider } from '../atoms/inputs/Slider.tsx';
import { Text } from '../atoms/display/Text.tsx';
import { Skeleton } from '../atoms/feedback/Skeleton.tsx';
import { Popover } from '../organisms/Popover.tsx';

// Derived from the spec so the unions cannot drift.
export type VolumeReadout = (typeof volumeReadouts)[number];
export type VolumeBarSize = (typeof volumeBarSizes)[number];
export type VolumeBarOrientation = (typeof volumeBarOrientations)[number];
export type VolumeBarLayout = (typeof volumeBarLayouts)[number];

/** Labels the control needs, so the fader can be spoken in any language. */
export interface VolumeBarLabels {
  mute: string;
  unmute: string;
  volume: string;
}

const DEFAULT_LABELS: VolumeBarLabels = {
  mute: 'Mute',
  unmute: 'Unmute',
  volume: 'Volume',
};

export interface VolumeBarProps {
  /** Controlled fader position, 0-100: 100 is unity, 0 is off. */
  value?: number;
  /** Initial position when uncontrolled. */
  defaultValue?: number;
  /**
   * Called with the 0-100 position as the fader moves. Pass it through
   * `volumeAmplitude` from `@glacier/logic` for the multiplier a player takes -
   * the rail is calibrated in decibels, so the number is not one.
   */
  onValueChange?: (volume: number) => void;
  /** Controlled mute state. */
  muted?: boolean;
  defaultMuted?: boolean;
  onMutedChange?: (muted: boolean) => void;
  /** What the trailing readout prints, if anything. */
  readout?: VolumeReadout;
  /** Steps the mute button and readout with the controls around them. */
  size?: VolumeBarSize;
  /**
   * Which way the rail runs. Vertical stands it up beside the mute toggle
   * rather than stacking the two, so the whole of the height it is given goes
   * to the travel. The length is the slider spec's `verticalLength` here - the
   * web's `--volume-length` custom property is not exposed on native.
   */
  orientation?: VolumeBarOrientation;
  /**
   * Whether the rail sits on the surface or opens over the speaker button.
   * Popover buys back the width of a rail where there is none to spare, at the
   * price of a level that can no longer be read at a glance and takes two
   * gestures to set.
   *
   * The panel carries the rail and the readout and nothing else: a touch has no
   * hover to open it with, so here the press is what opens it and the speaker
   * cannot also silence what is behind it. `muted` is still read - the trigger
   * wears the struck speaker - but a surface that wants mute as a control of
   * its own wants the inline layout.
   */
  layout?: VolumeBarLayout;
  /** Dims the row and blocks the fader and the mute toggle. */
  disabled?: boolean;
  /** Loads the button, rail, and readout as placeholders at their real sizes. */
  skeleton?: boolean;
  /** Overrides the labels; merged over the English defaults. */
  labels?: Partial<VolumeBarLabels>;
}

/** Readout footprints per size, mirroring the DOM stylesheet's fixed column. */
const READOUT_WIDTH: Record<VolumeBarSize, number> = {
  sm: 40,
  md: 44,
};

/**
 * A fader with a mute toggle on its leading edge and a level readout on its
 * trailing edge.
 *
 * The rail is linear in decibels rather than in amplitude, because decibels are
 * what the ear is linear in: the same nudge of the thumb does the same thing at
 * either end of the travel, and the readout is a number that means something
 * rather than a percentage of nothing in particular.
 *
 * Muting and pulling the fader down are kept apart on purpose. They sound the
 * same and they are not the same: mute is undoable and remembers the level it
 * was set to, and only one of the two survives being pressed by accident.
 */
export function VolumeBar({
  value,
  defaultValue = 70,
  onValueChange,
  muted,
  defaultMuted = false,
  onMutedChange,
  readout = 'gain',
  size = 'md',
  orientation = 'horizontal',
  layout = 'inline',
  disabled = false,
  skeleton = false,
  labels,
}: VolumeBarProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const [level, setLevel] = useControlled({ value, defaultValue, onChange: onValueChange });
  const [isMuted, setMuted] = useControlled({
    value: muted,
    defaultValue: defaultMuted,
    onChange: onMutedChange,
  });

  const glyph = size === 'sm' ? 15 : 16;
  // Muted reads as off on the readout too: the number is what is coming out,
  // not what the fader is set to.
  const gain = isMuted ? -Infinity : volumeGain(level);
  const printed = readout === 'percent' ? `${Math.round(level)}%` : formatGain(gain);
  const vertical = orientation === 'vertical';
  // The glyph steps with the level rather than only with mute: a speaker at
  // full waves with the fader on the floor claims a room is loud when it is
  // silent. Half the travel is -30 dB on this rail, which is about where a
  // level stops being background and becomes the thing being listened to.
  const speaker = isMuted ? (
    <VolumeX size={glyph} color={t('text-muted')} />
  ) : level <= 0 ? (
    <Volume size={glyph} color={t('text-muted')} />
  ) : level < 50 ? (
    <Volume1 size={glyph} color={t('text-muted')} />
  ) : (
    <Volume2 size={glyph} color={t('text-muted')} />
  );

  const body = (
    <View
      style={{
        // In a panel the fader is a column: the readout at the top, where the
        // thumb will not cover it, and the rail standing under it. Reversed
        // rather than reordered, because the order the question is asked in has
        // not changed.
        flexDirection: layout === 'popover' ? 'column-reverse' : 'row',
        alignItems: 'center',
        gap: t('space-2'),
        // More room above and below than beside, made up on the body because
        // the panel's own padding is even: the ends of the travel are where the
        // thumb is aimed hardest - all the way down, all the way up - and a
        // thumb that ends its run flush against the edge reads as clipped.
        paddingVertical: layout === 'popover' ? t('space-1') : 0,
        minWidth: 0,
        opacity: disabled ? 0.5 : 1,
      }}
      // a placeholder is not a group of controls yet
      accessibilityRole={skeleton ? undefined : 'group'}
      aria-hidden={skeleton || undefined}
      aria-label={skeleton ? undefined : text.volume}
    >
      {/* Not in a panel: there the speaker that would carry mute is the button
          that opened it, and drawing it twice - once to open, once again a
          finger's width above - says there are two controls where there is
          one. Mute stays with the layout that has room for it. */}
      {layout === 'inline' && (
        <IconButton
          variant="ghost"
          size={size}
          disabled={disabled}
          skeleton={skeleton}
          // one button whose label changes, not two that swap, so focus survives
          aria-label={isMuted ? text.unmute : text.mute}
          accessibilityState={{ selected: isMuted }}
          onPress={() => setMuted(!isMuted)}
        >
          {speaker}
        </IconButton>
      )}

      {/* A standing rail is as long as the slider spec says; only a lying one
          takes what is left of the row. */}
      <View style={vertical ? undefined : { flex: 1, minWidth: 0 }}>
        <Slider
          value={level}
          onValueChange={setLevel}
          min={0}
          max={100}
          orientation={orientation}
          // Muting leaves the fader where it is rather than dragging it to
          // zero: the position is the setting, and the setting is what unmute
          // returns to. It is disabled instead, so it cannot be moved to no
          // effect.
          disabled={disabled || isMuted}
          skeleton={skeleton}
          aria-label={text.volume}
          // a decibel rail's number means nothing on its own, so the fader says
          // what it reads rather than only what it is set to
          accessibilityValue={{ min: 0, max: 100, now: Math.round(level), text: printed }}
        />
      </View>

      {readout !== 'none' && (
        // Decorative: the fader already speaks its own value, so announcing
        // this too would read the level twice.
        <View
          aria-hidden={true}
          style={{
            width: READOUT_WIDTH[size],
            alignItems: layout === 'popover' ? 'center' : 'flex-end',
          }}
        >
          {skeleton ? (
            <Skeleton variant="text" width={READOUT_WIDTH[size]} />
          ) : (
            <Text size="xs" tone={isMuted ? 'subtle' : 'muted'} mono numberOfLines={1}>
              {printed}
            </Text>
          )}
        </View>
      )}
    </View>
  );

  if (layout === 'inline') return body;

  // The trigger is not the mute button: a touch has no hover to open the panel
  // with, so the press is spent opening it. It carries the state instead - the
  // struck speaker is readable with the panel shut.
  const trigger = (
    <IconButton
      variant="ghost"
      size={size}
      disabled={disabled}
      skeleton={skeleton}
      aria-label={text.volume}
    >
      {speaker}
    </IconButton>
  );

  // A placeholder has nothing to open.
  if (skeleton) return trigger;

  return (
    // above, because the surfaces short of room for a rail are the ones docked
    // to the bottom of a window
    <Popover placement="top" aria-label={text.volume} trigger={trigger}>
      {body}
    </Popover>
  );
}
