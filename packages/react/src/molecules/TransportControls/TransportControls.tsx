import {
  nextRepeat,
  playerMetrics,
  transportPlaySize,
  type PlayerDensity,
  type PlayerRepeat,
} from '@glacier/logic';
import { transportEmphases } from '@glacier/spec';
import { Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Square } from '@glacier/icons';
import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { IconButton } from '../../atoms/inputs/Button/IconButton.tsx';
import styles from './TransportControls.module.css';

export type { PlayerRepeat, PlayerDensity };

// Derived from the spec so the union cannot drift.
export type TransportEmphasis = (typeof transportEmphases)[number];

/** Labels every control needs, so the row can be spoken in any language. */
export interface TransportControlsLabels {
  play: string;
  pause: string;
  stop: string;
  skipBack: string;
  skipForward: string;
  shuffle: string;
  /** Given the current mode, so the label can name it. */
  repeat: (mode: PlayerRepeat) => string;
  /** Names the row itself, since it is a group. */
  group: string;
}

const DEFAULT_LABELS: TransportControlsLabels = {
  play: 'Play',
  pause: 'Pause',
  stop: 'Stop',
  skipBack: 'Previous track',
  skipForward: 'Next track',
  shuffle: 'Shuffle',
  repeat: (mode) => `Repeat: ${mode}`,
  group: 'Playback controls',
};

export interface TransportControlsProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  /** Controlled play state. */
  playing?: boolean;
  defaultPlaying?: boolean;
  onPlayingChange?: (playing: boolean) => void;
  /** Omit a handler and that control is not rendered. */
  onStop?: () => void;
  onSkipBack?: () => void;
  onSkipForward?: () => void;
  /** Controlled shuffle. Omit both this and the handler to drop the control. */
  shuffle?: boolean;
  defaultShuffle?: boolean;
  onShuffleChange?: (on: boolean) => void;
  /** Controlled repeat mode. Omit both this and the handler to drop the control. */
  repeat?: PlayerRepeat;
  defaultRepeat?: PlayerRepeat;
  onRepeatChange?: (mode: PlayerRepeat) => void;
  /** How tightly the row is packed; the same scale a PlayerCard reads. */
  density?: PlayerDensity;
  /**
   * How loudly the play control is drawn. Solid fills it, which is right on a
   * surface that is about the player; quiet leaves it a bare glyph a step
   * larger than its neighbours, which is what a chrome strip wants - a filled
   * disc there would be the loudest thing on a bar that is not the subject.
   */
  emphasis?: TransportEmphasis;
  /** Dims the row and blocks every control. */
  disabled?: boolean;
  /** Loads each button as its own placeholder, so the row keeps its footprint. */
  skeleton?: boolean;
  /** Overrides the control labels; merged over the English defaults. */
  labels?: Partial<TransportControlsLabels>;
}

/**
 * The row of buttons that drives playback: shuffle, previous, stop,
 * play/pause, next, repeat - in the order every player puts them, so it needs
 * no explanation.
 *
 * A control appears when it can do something: either the row owns the state or
 * the caller is listening for it. That is what lets one component cover a bare
 * play button and a full six-button transport without a pile of `show*` flags.
 */
export function TransportControls({
  playing,
  defaultPlaying = false,
  onPlayingChange,
  onStop,
  onSkipBack,
  onSkipForward,
  shuffle,
  defaultShuffle = false,
  onShuffleChange,
  repeat,
  defaultRepeat = 'off',
  onRepeatChange,
  density = 'comfortable',
  emphasis = 'solid',
  disabled = false,
  skeleton = false,
  labels,
  className,
  style,
  ...rest
}: TransportControlsProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const metrics = playerMetrics(density);

  const [isPlaying, setPlaying] = useControlled(playing, defaultPlaying);
  const [isShuffling, setShuffling] = useControlled(shuffle, defaultShuffle);
  const [repeatMode, setRepeatMode] = useControlled(repeat, defaultRepeat);

  const hasShuffle = shuffle !== undefined || onShuffleChange !== undefined;
  const hasRepeat = repeat !== undefined || onRepeatChange !== undefined;

  const togglePlaying = () => {
    const next = !isPlaying;
    setPlaying(next);
    onPlayingChange?.(next);
  };

  const toggleShuffle = () => {
    const next = !isShuffling;
    setShuffling(next);
    onShuffleChange?.(next);
  };

  const cycleRepeat = () => {
    const next = nextRepeat(repeatMode);
    setRepeatMode(next);
    onRepeatChange?.(next);
  };

  // The density's spacing reaches CSS as a custom property, so the stylesheet
  // keeps deciding how the gap is used while the scale itself stays shared.
  const densityVars = { '--transport-gap': `var(--glacier-${metrics.transportGap})` } as CSSProperties;

  const quiet = (
    label: string,
    glyph: ReactNode,
    onClick: () => void,
    on?: boolean,
    pressed?: boolean,
  ) => (
    <IconButton
      variant="ghost"
      size={metrics.controlSize}
      disabled={disabled}
      skeleton={skeleton}
      aria-label={label}
      aria-pressed={pressed}
      data-on={on || undefined}
      onClick={onClick}
    >
      {glyph}
    </IconButton>
  );

  return (
    <div
      className={cx(styles.transport, className)}
      style={{ ...densityVars, ...style }}
      data-emphasis={emphasis}
      data-disabled={disabled || undefined}
      // a placeholder is not a group of controls yet
      role={skeleton ? undefined : 'group'}
      aria-hidden={skeleton || undefined}
      aria-label={skeleton ? undefined : text.group}
      {...rest}
    >
      {hasShuffle &&
        quiet(
          text.shuffle,
          <Shuffle size={metrics.controlIcon} />,
          toggleShuffle,
          isShuffling,
          isShuffling,
        )}
      {onSkipBack && quiet(text.skipBack, <SkipBack size={metrics.controlIcon} />, onSkipBack)}
      {/* Stop is offered apart from pause because they are different requests:
          one gives up the position, the other keeps it. */}
      {onStop && quiet(text.stop, <Square size={metrics.controlIcon} />, onStop)}

      {/* One button whose label changes, not two that swap, so focus survives
          the toggle. */}
      <IconButton
        className={styles.play}
        variant={emphasis === 'solid' ? 'solid' : 'ghost'}
        size={transportPlaySize(density, emphasis)}
        disabled={disabled}
        skeleton={skeleton}
        aria-label={isPlaying ? text.pause : text.play}
        onClick={togglePlaying}
      >
        {isPlaying ? <Pause size={metrics.playIcon} /> : <Play size={metrics.playIcon} />}
      </IconButton>

      {onSkipForward && quiet(text.skipForward, <SkipForward size={metrics.controlIcon} />, onSkipForward)}
      {hasRepeat &&
        quiet(
          // three states cannot be described by a pressed flag alone, so the
          // label names the mode as well
          text.repeat(repeatMode),
          repeatMode === 'one' ? (
            <Repeat1 size={metrics.controlIcon} />
          ) : (
            <Repeat size={metrics.controlIcon} />
          ),
          cycleRepeat,
          repeatMode !== 'off',
          repeatMode !== 'off',
        )}
    </div>
  );
}
