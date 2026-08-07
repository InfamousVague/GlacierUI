// The Glacier TransportControls, rendered with React Native primitives: the row
// of buttons that drives playback - shuffle, previous, stop, play/pause, next,
// repeat. The repeat cycle and the density scale come from @glacier/logic, the
// same functions the DOM kit calls, so the two rows cannot behave or measure
// differently.

import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Square } from '@glacier/icons';
import {
  nextRepeat,
  playerMetrics,
  transportPlaySize,
  useControlled,
  type PlayerDensity,
  type PlayerRepeat,
} from '@glacier/logic';
import { transportEmphases } from '@glacier/spec';
import { t } from '../tokens.ts';
import { IconButton } from '../atoms/inputs/IconButton.tsx';

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

export interface TransportControlsProps {
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
 * The row of buttons that drives playback, in the order every player puts them,
 * so it needs no explanation.
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
}: TransportControlsProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  // The same scale the DOM kit reads, so a compact row is the same row here.
  const metrics = playerMetrics(density);

  const [isPlaying, setPlaying] = useControlled({
    value: playing,
    defaultValue: defaultPlaying,
    onChange: onPlayingChange,
  });
  const [isShuffling, setShuffling] = useControlled({
    value: shuffle,
    defaultValue: defaultShuffle,
    onChange: onShuffleChange,
  });
  const [repeatMode, setRepeatMode] = useControlled({
    value: repeat,
    defaultValue: defaultRepeat,
    onChange: onRepeatChange,
  });

  const hasShuffle = shuffle !== undefined || onShuffleChange !== undefined;
  const hasRepeat = repeat !== undefined || onRepeatChange !== undefined;

  // Icons do not inherit a text colour here, so every glyph is told what it is.
  const onColor = t('accent-text');
  const offColor = t('text-muted');

  const quiet = (
    label: string,
    glyph: ReactNode,
    onPress: () => void,
    selected?: boolean,
  ) => (
    <IconButton
      variant="ghost"
      size={metrics.controlSize}
      disabled={disabled}
      skeleton={skeleton}
      aria-label={label}
      accessibilityState={selected === undefined ? undefined : { selected }}
      onPress={onPress}
    >
      {glyph}
    </IconButton>
  );

  // Quiet leaves the play control a bare glyph, so it has to carry its own
  // colour: without the solid disc behind it there is no accent contrast to sit
  // on, and the size step alone is what marks it as the primary action.
  const playColor = emphasis === 'solid' ? t('accent-contrast') : t('text');

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: t(metrics.transportGap),
        opacity: disabled ? 0.5 : 1,
      }}
      // a placeholder is not a group of controls yet
      accessibilityRole={skeleton ? undefined : 'group'}
      aria-hidden={skeleton || undefined}
      aria-label={skeleton ? undefined : text.group}
    >
      {hasShuffle &&
        quiet(
          text.shuffle,
          <Shuffle size={metrics.controlIcon} color={isShuffling ? onColor : offColor} />,
          () => setShuffling(!isShuffling),
          isShuffling,
        )}
      {onSkipBack &&
        quiet(text.skipBack, <SkipBack size={metrics.controlIcon} color={offColor} />, onSkipBack)}
      {/* Stop is offered apart from pause because they are different requests:
          one gives up the position, the other keeps it. */}
      {onStop && quiet(text.stop, <Square size={metrics.controlIcon} color={offColor} />, onStop)}

      {/* One button whose label changes, not two that swap, so focus survives
          the toggle. */}
      <IconButton
        variant={emphasis === 'solid' ? 'solid' : 'ghost'}
        size={transportPlaySize(density, emphasis)}
        disabled={disabled}
        skeleton={skeleton}
        aria-label={isPlaying ? text.pause : text.play}
        onPress={() => setPlaying(!isPlaying)}
      >
        {isPlaying ? (
          <Pause size={metrics.playIcon} color={playColor} />
        ) : (
          <Play size={metrics.playIcon} color={playColor} />
        )}
      </IconButton>

      {onSkipForward &&
        quiet(
          text.skipForward,
          <SkipForward size={metrics.controlIcon} color={offColor} />,
          onSkipForward,
        )}
      {hasRepeat &&
        quiet(
          // three states cannot be described by a selected flag alone, so the
          // label names the mode as well
          text.repeat(repeatMode),
          repeatMode === 'one' ? (
            <Repeat1 size={metrics.controlIcon} color={onColor} />
          ) : (
            // 'all' is engaged and tints; 'off' stays quiet
            <Repeat size={metrics.controlIcon} color={repeatMode === 'all' ? onColor : offColor} />
          ),
          () => setRepeatMode(nextRepeat(repeatMode)),
          repeatMode !== 'off',
        )}
    </View>
  );
}
