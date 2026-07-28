// VoiceNote — the native binding of @glacier/react's VoiceNote.
//
// A voice message in a bubble: play/pause, the SeekBar drawing the recording's
// waveform, and the clock. Deliberately thin on both platforms — the scrubbing,
// the waveform geometry, and the value announcement already live in SeekBar,
// and the clock is `formatDuration` in @glacier/logic — so this is an
// assembly rather than a second audio player.

import { View, Text, type ViewProps } from 'react-native';
import { Pause, Play } from '@glacier/icons';
import { formatDuration, playerSkeletonWidths, useControlled } from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once the spec is registered.
import { voiceNoteSpec, voiceNoteDensities } from '../../../../spec/src/components/voice-note.ts';
import { t } from '../../tokens.ts';
import { dimensionsFor } from '../../resolve.ts';
import { IconButton } from '../../atoms/inputs/IconButton.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton.tsx';
import { SeekBar, type SeekBarShape, type SeekBarTone, type SeekBarRail } from '../../atoms/inputs/SeekBar.tsx';

// Derived from the spec so the density union cannot drift from the web kit.
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

/** Control and glyph sizes per density, mirroring the DOM kit's table. */
const METRICS: Record<VoiceNoteDensity, { control: 'sm' | 'md'; glyph: number }> = {
  compact: { control: 'sm', glyph: 14 },
  comfortable: { control: 'md', glyph: 16 },
};

export interface VoiceNoteProps extends Omit<ViewProps, 'children' | 'style'> {
  /** Recording length in seconds. */
  duration: number;
  /** The recorded waveform; without it the bar draws an even swell. */
  levels?: number[];
  value?: number;
  defaultValue?: number;
  onValueChange?: (seconds: number) => void;
  onSeekEnd?: (seconds: number) => void;
  playing?: boolean;
  defaultPlaying?: boolean;
  onPlayingChange?: (playing: boolean) => void;
  density?: VoiceNoteDensity;
  shape?: SeekBarShape;
  tone?: SeekBarTone;
  rail?: SeekBarRail;
  formatTime?: (seconds: number) => string;
  disabled?: boolean;
  skeleton?: boolean;
  labels?: Partial<VoiceNoteLabels>;
}

// Size-independent metrics read once from the spec.
const BOX = dimensionsFor(voiceNoteSpec);

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
  ...rest
}: VoiceNoteProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const metrics = METRICS[density];
  const [position, setPosition] = useControlled({ value, defaultValue, onChange: onValueChange });
  const [isPlaying, setPlaying] = useControlled({
    value: playing,
    defaultValue: defaultPlaying,
    onChange: onPlayingChange,
  });

  // At rest the readout is the length of the recording — the thing a listener
  // decides on; once running it is the position, which is the thing they track.
  // Both are the same width in tabular figures, so the row does not shuffle at
  // the moment playback starts.
  const readout = formatTime(isPlaying || position > 0 ? position : duration);

  return (
    <View
      {...rest}
      // A placeholder is not a group of controls yet.
      accessibilityRole={skeleton ? undefined : 'group'}
      aria-label={skeleton ? undefined : text.voiceMessage}
      aria-hidden={skeleton || undefined}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        gap: t(BOX.gap ?? 'space-2'),
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {/* One button whose label changes, not two that swap, so focus survives
          the toggle. */}
      <IconButton
        variant="solid"
        size={metrics.control}
        disabled={disabled}
        skeleton={skeleton}
        aria-label={isPlaying ? text.pause : text.play}
        onPress={() => setPlaying(!isPlaying)}
      >
        {isPlaying ? (
          <Pause size={metrics.glyph} color={t('accent-contrast')} />
        ) : (
          <Play size={metrics.glyph} color={t('accent-contrast')} />
        )}
      </IconButton>
      <View style={{ flex: 1, minWidth: 0 }}>
        <SeekBar
          size="sm"
          duration={duration}
          value={position}
          onValueChange={setPosition}
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
      </View>
      {/* Decorative: the bar already speaks the position through its
          accessibility value, and announcing both reads the clock twice. */}
      {skeleton ? (
        <Skeleton variant="text" width={playerSkeletonWidths.clock} />
      ) : (
        <Text
          aria-hidden={true}
          style={{
            color: t('text-muted'),
            fontFamily: t('font-mono'),
            fontSize: t('font-size-xs') as never,
            fontVariant: ['tabular-nums'],
          }}
        >
          {readout}
        </Text>
      )}
    </View>
  );
}
