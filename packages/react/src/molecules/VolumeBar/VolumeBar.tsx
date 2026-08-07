import { formatGain, volumeGain } from '@glacier/logic';
import {
  volumeReadouts,
  volumeBarSizes,
  volumeBarOrientations,
  volumeBarLayouts,
} from '@glacier/spec';
import { Volume, Volume1, Volume2, VolumeX } from '@glacier/icons';
import type { ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { IconButton } from '../../atoms/inputs/Button/IconButton.tsx';
import { Slider } from '../../atoms/inputs/Slider/Slider.tsx';
import { Text } from '../../atoms/display/Typography/Text.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import { Popover } from '../../organisms/Popover/Popover.tsx';
import styles from './VolumeBar.module.css';

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

export interface VolumeBarProps extends Omit<ComponentProps<'div'>, 'onChange' | 'defaultValue'> {
  /** Controlled fader position, 0-100: 100 is unity, 0 is off. */
  value?: number;
  /** Initial position when uncontrolled. */
  defaultValue?: number;
  /**
   * Called with the 0-100 position as the fader moves. Pass it through
   * `volumeAmplitude` for the multiplier an audio element takes - the rail is
   * calibrated in decibels, so the number is not one.
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
   * to the travel. Its length is `--volume-length`, which defaults to the
   * horizontal rail's.
   */
  orientation?: VolumeBarOrientation;
  /**
   * Whether the rail sits on the surface or opens over the speaker button.
   * Popover buys back the width of a rail where there is none to spare, at the
   * price of a level that can no longer be read at a glance. The panel opens
   * above the button, since the surfaces short enough to need it are usually the
   * ones docked to the bottom of a window.
   *
   * The panel is not asked for: it opens while the pointer is on the speaker and
   * closes when it leaves, so the speaker stays the mute button it is in every
   * other layout. It carries the rail and the readout and nothing else - drawing
   * a second speaker a finger's width above the first would say there are two
   * controls where there is one.
   */
  layout?: VolumeBarLayout;
  /** Dims the row and blocks the fader and the mute toggle. */
  disabled?: boolean;
  /** Loads the button, rail, and readout as placeholders at their real sizes. */
  skeleton?: boolean;
  /** Overrides the labels; merged over the English defaults. */
  labels?: Partial<VolumeBarLabels>;
}

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
  className,
  ...rest
}: VolumeBarProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const [level, setLevel] = useControlled(value, defaultValue);
  const [isMuted, setMuted] = useControlled(muted, defaultMuted);

  const change = (next: number) => {
    setLevel(next);
    onValueChange?.(next);
  };

  const toggleMute = () => {
    const next = !isMuted;
    setMuted(next);
    onMutedChange?.(next);
  };

  const glyph = size === 'sm' ? 15 : 16;
  // Muted reads as off on the readout too: the number is what is coming out,
  // not what the fader is set to.
  const gain = isMuted ? -Infinity : volumeGain(level);
  const printed = readout === 'percent' ? `${Math.round(level)}%` : formatGain(gain);
  // The glyph steps with the level rather than only with mute: a speaker at
  // full waves with the fader on the floor claims a room is loud when it is
  // silent. Half the travel is -30 dB on this rail, which is about where a
  // level stops being background and becomes the thing being listened to.
  const speaker = isMuted ? (
    <VolumeX size={glyph} />
  ) : level <= 0 ? (
    <Volume size={glyph} />
  ) : level < 50 ? (
    <Volume1 size={glyph} />
  ) : (
    <Volume2 size={glyph} />
  );

  const body = (
    <div
      className={cx(styles.volume, layout === 'inline' && className)}
      data-size={size}
      data-orientation={orientation}
      data-layout={layout}
      data-muted={isMuted || undefined}
      data-disabled={disabled || undefined}
      // a placeholder is not a group of controls yet
      role={skeleton ? undefined : 'group'}
      aria-hidden={skeleton || undefined}
      aria-label={skeleton ? undefined : text.volume}
      {...rest}
    >
      {/* Not in a panel: there the speaker is the one the panel opened over,
          and drawing it again a finger's width above says there are two
          controls where there is one. */}
      {layout === 'inline' && (
        <IconButton
          variant="ghost"
          size={size}
          disabled={disabled}
          skeleton={skeleton}
          // one button whose label changes, not two that swap, so focus survives
          aria-label={isMuted ? text.unmute : text.mute}
          aria-pressed={isMuted}
          onClick={toggleMute}
        >
          {speaker}
        </IconButton>
      )}

      <Slider
        className={styles.rail}
        value={level}
        onValueChange={change}
        min={0}
        max={100}
        orientation={orientation}
        // Muting leaves the fader where it is rather than dragging it to zero:
        // the position is the setting, and the setting is what unmute returns
        // to. It is disabled instead, so it cannot be moved to no effect.
        disabled={disabled || isMuted}
        skeleton={skeleton}
        aria-label={text.volume}
        aria-valuetext={printed}
      />

      {readout !== 'none' && (
        <div className={styles.readout} aria-hidden="true">
          {/* Decorative: the fader already speaks its own value, so announcing
              this too would read the level twice. */}
          {skeleton ? (
            <Skeleton variant="text" width={40} />
          ) : (
            <Text as="span" size="xs" tone={isMuted ? 'subtle' : 'muted'} mono>
              {printed}
            </Text>
          )}
        </div>
      )}
    </div>
  );

  if (layout === 'inline') return body;

  // The speaker is the mute button here too. Nothing has to be pressed to reach
  // the rail - the panel opens under the pointer and on focus - so the press is
  // left to do the one thing a speaker has always done.
  const trigger = (
    <IconButton
      variant="ghost"
      size={size}
      disabled={disabled}
      skeleton={skeleton}
      // one button whose label changes, not two that swap, so focus survives
      aria-label={isMuted ? text.unmute : text.mute}
      aria-pressed={isMuted}
      onClick={(event) => {
        // A touch has no hover: the tap that opened the panel is this same
        // press, and it should not silence the track on the way in.
        if ((event.nativeEvent as { pointerType?: string }).pointerType === 'touch') return;
        toggleMute();
      }}
      className={className}
    >
      {speaker}
    </IconButton>
  );

  // A placeholder has nothing to open.
  if (skeleton) return trigger;

  return (
    <Popover
      // above, because the surfaces short of room for a rail are the ones
      // docked to the bottom of a window
      placement="top"
      openOn="hover"
      className={styles.panel}
      aria-label={text.volume}
      trigger={trigger}
    >
      {body}
    </Popover>
  );
}
