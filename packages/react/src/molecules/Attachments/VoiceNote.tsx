import { formatDuration, playerSkeletonWidths } from '@glacier/logic';
import { Pause, Play } from '@glacier/icons';
import type { ComponentProps } from 'react';
import type { voiceNoteDensities } from '@glacier/spec';
import { cx } from '../../internal/cx.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { IconButton } from '../../atoms/inputs/Button/IconButton.tsx';
import { SeekBar, type SeekBarProps } from '../../atoms/inputs/SeekBar/SeekBar.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import styles from './Attachments.module.css';

/** Derived from the spec so the density union cannot drift. */
export type VoiceNoteDensity = (typeof voiceNoteDensities)[number];

/** Every string the row can speak. */
export interface VoiceNoteLabels {
  play: string;
  pause: string;
  /** The scrubber's name. */
  seek: string;
  /** Names the group, so the two controls are announced as one thing. */
  voiceMessage: string;
}

const DEFAULT_LABELS: VoiceNoteLabels = {
  play: 'Play',
  pause: 'Pause',
  seek: 'Seek',
  voiceMessage: 'Voice message',
};

/**
 * Control and glyph sizes per density. Two steps, not the player's three: a
 * bubble is either tight or it is not, and a third step would be a size nobody
 * can tell apart from its neighbours at this scale.
 */
const METRICS: Record<VoiceNoteDensity, { control: 'sm' | 'md'; glyph: number }> = {
  compact: { control: 'sm', glyph: 14 },
  comfortable: { control: 'md', glyph: 16 },
};

export interface VoiceNoteProps
  extends Omit<ComponentProps<'div'>, 'children' | 'defaultValue' | 'onChange'> {
  /** Recording length in seconds. */
  duration: number;
  /** The recorded waveform; without it the bar draws an even swell. */
  levels?: number[];
  /** Controlled playhead position in seconds. */
  value?: number;
  defaultValue?: number;
  onValueChange?: (seconds: number) => void;
  onSeekEnd?: (seconds: number) => void;
  /** Controlled play state. */
  playing?: boolean;
  defaultPlaying?: boolean;
  onPlayingChange?: (playing: boolean) => void;
  density?: VoiceNoteDensity;
  /** Forwarded to the seek bar. */
  shape?: SeekBarProps['shape'];
  tone?: SeekBarProps['tone'];
  rail?: SeekBarProps['rail'];
  /** Formats the readout. Defaults to m:ss, or h:mm:ss past an hour. */
  formatTime?: (seconds: number) => string;
  disabled?: boolean;
  /** Renders a placeholder with the row's exact geometry. */
  skeleton?: boolean;
  /** Overrides the spoken strings; merged over the English defaults. */
  labels?: Partial<VoiceNoteLabels>;
}

/**
 * A voice message in a bubble: play/pause, the waveform, and the clock.
 *
 * Deliberately thin. The scrubbing, the keyboard model, the waveform geometry,
 * and the value announcement all already exist in `SeekBar`, and the clock
 * already exists as `formatDuration` — so this is an assembly, not a second
 * audio player. `PlayerCard` is the same three parts arranged as a card with
 * artwork and a transport; this is the bubble-sized sibling, which is why it
 * keeps the same prop names and hands the same props through.
 */
export function VoiceNote({
  duration,
  levels,
  value,
  defaultValue = 0,
  onValueChange,
  onSeekEnd,
  playing,
  defaultPlaying = false,
  onPlayingChange,
  density = 'comfortable',
  shape = 'waveform',
  tone,
  rail,
  formatTime = formatDuration,
  disabled = false,
  skeleton = false,
  labels,
  className,
  ...rest
}: VoiceNoteProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const metrics = METRICS[density];
  const [position, setPosition] = useControlled(value, defaultValue);
  const [isPlaying, setPlaying] = useControlled(playing, defaultPlaying);

  const seek = (seconds: number) => {
    setPosition(seconds);
    onValueChange?.(seconds);
  };

  const togglePlaying = () => {
    const next = !isPlaying;
    setPlaying(next);
    onPlayingChange?.(next);
  };

  // At rest the readout is the length of the recording — the thing a listener
  // decides on. Once it is running, it is the position, which is the thing they
  // are tracking. Both are the same width in tabular figures, so the row does
  // not shuffle at the moment playback starts.
  const readout = formatTime(isPlaying || position > 0 ? position : duration);

  return (
    <div
      className={cx(styles.voice, className)}
      // A placeholder is not a group of controls yet.
      role={skeleton ? undefined : 'group'}
      aria-label={skeleton ? undefined : text.voiceMessage}
      aria-hidden={skeleton || undefined}
      data-disabled={disabled || undefined}
      data-density={density}
      {...rest}
    >
      {/* One button whose label changes, not two that swap, so focus survives
          the toggle. */}
      <IconButton
        variant="solid"
        size={metrics.control}
        disabled={disabled}
        skeleton={skeleton}
        aria-label={isPlaying ? text.pause : text.play}
        onClick={togglePlaying}
      >
        {isPlaying ? <Pause size={metrics.glyph} /> : <Play size={metrics.glyph} />}
      </IconButton>
      <div className={styles.voiceBar}>
        <SeekBar
          size="sm"
          duration={duration}
          value={position}
          onValueChange={seek}
          onSeekEnd={onSeekEnd}
          shape={shape}
          tone={tone}
          rail={rail}
          levels={levels}
          formatTime={formatTime}
          disabled={disabled}
          skeleton={skeleton}
          aria-label={text.seek}
        />
      </div>
      {/* Decorative: the bar already speaks the position through
          aria-valuetext, and announcing both reads the clock twice. */}
      <span className={styles.voiceTime} aria-hidden="true">
        {/* The readout's bone is the player's clock width, so a loading
            voice note and a loading PlayerCard reserve the same five figures. */}
        {skeleton ? <Skeleton variant="text" width={playerSkeletonWidths.clock} /> : readout}
      </span>
    </div>
  );
}
