// The Glacier PlayerBar, rendered with React Native primitives: the whole
// player on one line - what is playing on the leading edge, the transport over
// its seek bar through the middle, and the output controls on the trailing
// edge. Time formatting, the countdown readout, and the density scale come from
// @glacier/logic, the same functions the DOM kit calls, so the two strips
// cannot read or measure differently.

import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Cog, Heart } from '@glacier/icons';
import {
  formatDuration,
  formatRemaining,
  playerMetrics,
  playerSkeletonWidths,
  stripTransportDensity,
  transportPlaySize,
  useControlled,
  type PlayerDensity,
  type PlayerRepeat,
  type SeekBarBeat,
} from '@glacier/logic';
import { playerBarPositions } from '@glacier/spec';
import { t } from '../tokens.ts';
import { Text } from '../atoms/display/Text.tsx';
import { Skeleton } from '../atoms/feedback/Skeleton.tsx';
import { IconButton } from '../atoms/inputs/IconButton.tsx';
import {
  SeekBar,
  type SeekBarShape,
  type SeekBarTone,
  type SeekBarFill,
  type SeekBarRail,
} from '../atoms/inputs/SeekBar.tsx';
import { TrackInfo } from '../molecules/TrackInfo.tsx';
import { SegmentedControl } from '../molecules/SegmentedControl.tsx';
import { TransportControls, type TransportControlsLabels } from '../molecules/TransportControls.tsx';
import { VolumeBar, type VolumeBarLabels, type VolumeReadout } from '../molecules/VolumeBar.tsx';
import { Popover } from './Popover.tsx';

export type { PlayerRepeat, PlayerDensity };
export type PlayerBarQuality = 'low' | 'medium' | 'high' | 'lossless';

// Derived from the spec so the union cannot drift.
export type PlayerBarPosition = (typeof playerBarPositions)[number];

/** Every label the strip needs, so it can be spoken in any language. */
export interface PlayerBarLabels extends TransportControlsLabels, VolumeBarLabels {
  seek: string;
  favorite: string;
  unfavorite: string;
  quality: string;
  qualityLow: string;
  qualityMedium: string;
  qualityHigh: string;
  qualityLossless: string;
}

const DEFAULT_LABELS: PlayerBarLabels = {
  play: 'Play',
  pause: 'Pause',
  stop: 'Stop',
  skipBack: 'Previous track',
  skipForward: 'Next track',
  shuffle: 'Shuffle',
  repeat: (mode) => `Repeat: ${mode}`,
  group: 'Playback controls',
  mute: 'Mute',
  unmute: 'Unmute',
  volume: 'Volume',
  seek: 'Seek',
  favorite: 'Add to favourites',
  unfavorite: 'Remove from favourites',
  quality: 'Audio quality',
  qualityLow: 'Low',
  qualityMedium: 'Medium',
  qualityHigh: 'High',
  qualityLossless: 'Lossless',
};

export interface PlayerBarProps {
  /** Album art, forwarded to the track block. Takes the full height of the strip. */
  artwork?: ReactNode;
  /** What is playing. */
  title?: ReactNode;
  /**
   * A second line, the artist. There is no third: a strip is read at a glance
   * from across a room, and the album is the one of the three nobody is
   * scanning for.
   */
  subtitle?: ReactNode;
  /** Track length in seconds. */
  duration: number;
  /** Controlled playhead position in seconds. */
  value?: number;
  defaultValue?: number;
  onValueChange?: (seconds: number) => void;
  onSeekEnd?: (seconds: number) => void;
  /** Controlled play state. */
  playing?: boolean;
  defaultPlaying?: boolean;
  onPlayingChange?: (playing: boolean) => void;
  /** Omit a handler and that control is not rendered. */
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
  /**
   * Controlled favourite state. Omit both this and the handler to drop the
   * heart - a strip that cannot save anything should not offer to.
   */
  favorite?: boolean;
  defaultFavorite?: boolean;
  onFavoriteChange?: (on: boolean) => void;
  /** Controlled fader position, 0-100. Omit both this and the handler to drop the fader. */
  volume?: number;
  defaultVolume?: number;
  onVolumeChange?: (volume: number) => void;
  /** Controlled mute state. */
  muted?: boolean;
  defaultMuted?: boolean;
  onMutedChange?: (muted: boolean) => void;
  /** Controlled stream quality. */
  quality?: PlayerBarQuality;
  defaultQuality?: PlayerBarQuality;
  onQualityChange?: (quality: PlayerBarQuality) => void;
  /** What the fader's readout prints; forwarded to the VolumeBar. */
  volumeReadout?: VolumeReadout;
  /**
   * Controls flanking the bar and its transport, on the rail either side of
   * them. Slots rather than props, because a lyrics button or a queue carrying
   * a count is the app's idea of what it has, not the kit's.
   */
  leading?: ReactNode;
  trailing?: ReactNode;
  /**
   * Buttons on the trailing edge, before the fader. A slot rather than props,
   * because a queue button carrying a count is the app's idea of what it has
   * queued, not the kit's.
   */
  actions?: ReactNode;
  /** A quiet line under the fader for what the output is doing. */
  status?: ReactNode;
  /** How the strip sits against the window. */
  position?: PlayerBarPosition;
  /** How tightly it is packed. */
  density?: PlayerDensity;
  /**
   * Counts the trailing clock down rather than printing the total. A strip is
   * read while listening, when what is left matters more than how long it was.
   */
  remaining?: boolean;
  /** Forwarded to the seek bar. */
  shape?: SeekBarShape;
  tone?: SeekBarTone;
  fill?: SeekBarFill;
  rail?: SeekBarRail;
  levels?: number[];
  beat?: SeekBarBeat;
  intensity?: number;
  /**
   * Draws the seek bar's tracer, the shadow trailing the beat. On, as on a
   * card: the bar is the only moving thing on a strip, so it is what the eye
   * goes to. Without a `beat` there is nothing to trail, so a still strip pays
   * nothing for it.
   */
  tracer?: boolean;
  /** Formats both clocks. */
  formatTime?: (seconds: number) => string;
  /** Dims the strip and blocks every control. */
  disabled?: boolean;
  /** Loads every part as its own placeholder, keeping the strip's exact height. */
  skeleton?: boolean;
  /** Overrides the control labels; merged over the English defaults. */
  labels?: Partial<PlayerBarLabels>;
}

/**
 * The whole player on one line: what is playing on the leading edge, the seek
 * bar with the transport under it through the middle, and the output controls -
 * actions, volume, format - on the trailing edge.
 *
 * A strip is chrome rather than a card. It is docked against an edge of the
 * window and is never the subject of the screen, which is what decides most of
 * its shape: the cover takes the height the controls set rather than choosing
 * its own, and the track block is two lines rather than three.
 *
 * It is assembled from three components that each stand alone - `TrackInfo`,
 * `TransportControls`, and `VolumeBar` - so an app that wants a different strip
 * can build one out of the same parts rather than fighting this one.
 */
// The strip's height, stated rather than discovered. It is the middle column's:
// the seek row, the transport under it, and the gap between them, plus the
// padding above and below. Stating it is what lets the cover fill it - a square
// with no definite height to fill takes its size from its own width instead,
// and a cover as wide as the block it sits in would stand the strip on end.
// These mirror the calc in PlayerBar.module.css.
const SEEK_HEIGHT = 24;
const ROW_GAP = 4;
// The breathing room above and below is never less than the gap between the two
// rows: the strip's own edge is a harder line than the one between the bar and
// the buttons, so the space at the edge has to read as the wider of the two.
const PAD: Record<PlayerDensity, number> = { compact: 8, comfortable: 12, spacious: 16 };
// the control scale in points, mirroring --glacier-control-height-*
const CONTROL_HEIGHT = { sm: 36, md: 44, lg: 52 };

export function PlayerBar({
  artwork,
  title,
  subtitle,
  duration,
  value,
  defaultValue = 0,
  onValueChange,
  onSeekEnd,
  playing,
  defaultPlaying = false,
  onPlayingChange,
  onSkipBack,
  onSkipForward,
  shuffle,
  defaultShuffle = false,
  onShuffleChange,
  repeat,
  defaultRepeat = 'off',
  onRepeatChange,
  favorite,
  defaultFavorite = false,
  onFavoriteChange,
  volume,
  defaultVolume = 70,
  onVolumeChange,
  muted,
  defaultMuted = false,
  onMutedChange,
  quality,
  defaultQuality = 'high',
  onQualityChange,
  volumeReadout = 'none',
  leading,
  trailing,
  actions,
  status,
  position = 'docked',
  density = 'comfortable',
  remaining = true,
  shape,
  tone,
  fill,
  rail = 'contrast',
  levels,
  beat,
  intensity,
  tracer = true,
  formatTime = formatDuration,
  disabled = false,
  skeleton = false,
  labels,
}: PlayerBarProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  // The same scale the DOM kit reads, so a compact strip is the same strip here.
  const metrics = playerMetrics(density);
  // The buttons run a step tighter than the room around them: they are chrome
  // under the bar, not the subject of the surface.
  const transportDensity = stripTransportDensity(density);
  const transportMetrics = playerMetrics(transportDensity);
  const barHeight =
    SEEK_HEIGHT +
    ROW_GAP +
    CONTROL_HEIGHT[transportPlaySize(transportDensity, 'solid')] +
    PAD[density] * 2;

  const [playhead, setPlayhead] = useControlled({ value, defaultValue, onChange: onValueChange });
  const [isFavorite, setFavorite] = useControlled({
    value: favorite,
    defaultValue: defaultFavorite,
    onChange: onFavoriteChange,
  });
  const [qualityMode, setQualityMode] = useControlled({
    value: quality,
    defaultValue: defaultQuality,
    onChange: onQualityChange,
  });

  // The fader appears when it can do something: either the strip owns the level
  // or the caller is listening for it. A strip with nothing to turn down should
  // not draw a control that turns nothing down.
  const hasVolume = volume !== undefined || onVolumeChange !== undefined;
  const hasFavorite = favorite !== undefined || onFavoriteChange !== undefined;
  const qualityOptions = [
    { value: 'low', label: text.qualityLow },
    { value: 'medium', label: text.qualityMedium },
    { value: 'high', label: text.qualityHigh },
    { value: 'lossless', label: text.qualityLossless },
  ];

  /**
   * A clock. Decoration, and marked as such: the seek bar already speaks the
   * position through its accessibility value, so announcing these would read
   * the time twice - once as a measurement and once as a number with no units.
   */
  const clock = (label: string, quiet: boolean) =>
    skeleton ? (
      <Skeleton variant="text" width={playerSkeletonWidths.clock} />
    ) : (
      <Text size="xs" tone={quiet ? 'subtle' : 'muted'} mono>
        {label}
      </Text>
    );

  return (
    <View
      style={{
        flexDirection: 'row',
        // Stretch, not centre: the cover has no height of its own to be centred
        // at. The strip's height is handed down to all three regions, which is
        // what lets the art fill it edge to edge.
        alignItems: 'stretch',
        height: barHeight,
        gap: t(metrics.gap),
        width: '100%',
        paddingVertical: PAD[density],
        paddingHorizontal: t('space-4'),
        // A loading strip reads as an outline waiting to be filled rather than
        // a grey slab, so the surface steps back and lets the placeholders
        // inside carry it.
        backgroundColor: skeleton ? 'transparent' : t('surface'),
        // Docked sits flush against the window, so it gets a hairline on the
        // edge it is docked to; a box drawn all the way round chrome reads as a
        // panel that failed to fill its space. Floating is the same strip
        // lifted off the surface, and takes the full border and a radius.
        borderTopWidth: 1,
        borderRightWidth: position === 'floating' ? 1 : 0,
        borderBottomWidth: position === 'floating' ? 1 : 0,
        borderLeftWidth: position === 'floating' ? 1 : 0,
        borderColor: t('border-subtle'),
        borderRadius: position === 'floating' ? t('radius-lg') : 0,
        opacity: disabled ? 0.5 : 1,
      }}
      // a placeholder is not a group of controls yet
      accessibilityRole={skeleton ? undefined : 'group'}
      aria-hidden={skeleton || undefined}
      // The web strip is labelled by its title element; native has no id
      // reference, so the title is read straight onto the group when it is a
      // string. A node title is the app's own markup and speaks for itself.
      aria-label={skeleton || typeof title !== 'string' ? undefined : title}
    >
      {/* The three regions share the row 1:2:1 from a zero basis, so the middle
          gets twice what the ends do whatever is in them. The seek bar is the
          part that has to stay aimable, and the only place to get it width is
          the ends. */}
      <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 }}>
        <TrackInfo
          artwork={artwork}
          title={title}
          subtitle={subtitle}
          // the cover takes the strip's height rather than setting it: how tall
          // the row is was decided by the controls in the middle
          size="fill"
          skeleton={skeleton}
        />
      </View>

      {/* The middle column: the bar on top, and under it the row that drives
          it. The bar goes first because it is the one thing on the strip that
          is always moving, so it is what the eye finds first, and putting the
          buttons above it would mean reaching past them to aim at it. */}
      <View
        style={{
          flexGrow: 2,
          flexShrink: 1,
          flexBasis: 0,
          alignItems: 'center',
          justifyContent: 'center',
          gap: ROW_GAP,
          minWidth: 0,
        }}
      >
        {/* The bar and its two clocks are one unit, the clocks being its
            endpoints rather than a caption under it - a strip has no row to
            spend on a caption. */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: t('space-2'),
            width: '100%',
            minWidth: 0,
          }}
        >
          <View aria-hidden={true}>{clock(formatTime(playhead), false)}</View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <SeekBar
              duration={duration}
              value={playhead}
              onValueChange={setPlayhead}
              onSeekEnd={onSeekEnd}
              // the thin step: on a strip the bar is chrome running under the
              // transport, not the subject of a card
              size="sm"
              shape={shape}
              tone={tone}
              fill={fill}
              rail={rail}
              levels={levels}
              beat={beat}
              intensity={intensity}
              tracer={tracer}
              formatTime={formatTime}
              disabled={disabled}
              skeleton={skeleton}
              aria-label={text.seek}
            />
          </View>
          <View aria-hidden={true}>
            {clock(
              remaining ? formatRemaining(playhead, duration, formatTime) : formatTime(duration),
              true,
            )}
          </View>
        </View>

        {/* The row under the bar: the transport in the middle, and a rail
            either side of it for the controls that belong to the track rather
            than to the output. Both rails take an equal share of what is left,
            empty or not - the transport is centred on the strip, not on
            whatever happens to be beside it, and a play button that moved when
            a heart appeared would be a play button that moved. */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
            minWidth: 0,
          }}
        >
          <View
            style={{
              flexGrow: 1,
              flexShrink: 1,
              flexBasis: 0,
              flexDirection: 'row',
              alignItems: 'center',
              gap: t('space-1'),
              minWidth: 0,
            }}
          >
            {hasFavorite && (
              <IconButton
                variant="ghost"
                size={transportMetrics.controlSize}
                disabled={disabled}
                skeleton={skeleton}
                // one button whose label changes, not two that swap, so focus
                // survives the toggle
                aria-label={isFavorite ? text.unfavorite : text.favorite}
                accessibilityState={{ selected: isFavorite }}
                onPress={() => setFavorite(!isFavorite)}
              >
                {/* filled once saved: a heart outline and a heart are the same
                    glyph, and the fill is the part read from across a room */}
                <Heart
                  size={transportMetrics.controlIcon}
                  color={isFavorite ? t('accent-text') : t('text-muted')}
                  fill={isFavorite ? t('accent-text') : 'none'}
                />
              </IconButton>
            )}
            {leading}
          </View>

          <TransportControls
            playing={playing}
            defaultPlaying={defaultPlaying}
            onPlayingChange={onPlayingChange}
            onSkipBack={onSkipBack}
            onSkipForward={onSkipForward}
            shuffle={shuffle}
            defaultShuffle={defaultShuffle}
            onShuffleChange={onShuffleChange}
            repeat={repeat}
            defaultRepeat={defaultRepeat}
            onRepeatChange={onRepeatChange}
            density={transportDensity}
            disabled={disabled}
            skeleton={skeleton}
            labels={text}
          />

          <View
            style={{
              flexGrow: 1,
              flexShrink: 1,
              flexBasis: 0,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: t('space-1'),
              minWidth: 0,
            }}
          >
            {trailing}
            {hasVolume &&
              (skeleton ? (
                <IconButton
                  variant="ghost"
                  size={transportMetrics.controlSize}
                  disabled={disabled}
                  skeleton
                  aria-label={text.quality}
                >
                  <Cog size={transportMetrics.controlIcon} />
                </IconButton>
              ) : (
                <Popover
                  placement="top"
                  aria-label={text.quality}
                  trigger={
                    <IconButton
                      variant="ghost"
                      size={transportMetrics.controlSize}
                      disabled={disabled}
                      aria-label={text.quality}
                    >
                      <Cog size={transportMetrics.controlIcon} />
                    </IconButton>
                  }
                >
                  <View style={{ width: '16rem', gap: t('space-3') }}>
                    <Text size="xs" tone="muted">
                      {text.quality}
                    </Text>
                    <SegmentedControl
                      size="sm"
                      fullWidth
                      aria-label={text.quality}
                      options={qualityOptions}
                      value={qualityMode}
                      onValueChange={(next) => setQualityMode(next as PlayerBarQuality)}
                      disabled={disabled}
                    />
                  </View>
                </Popover>
              ))}
            {hasVolume && (
              // Behind the speaker, not across the strip: a rail lying on the
              // row would take its width from the thing being played, and it
              // stands up once opened so the panel stays the width of a thumb.
              <VolumeBar
                value={volume}
                defaultValue={defaultVolume}
                onValueChange={onVolumeChange}
                muted={muted}
                defaultMuted={defaultMuted}
                onMutedChange={onMutedChange}
                readout={volumeReadout}
                layout="popover"
                orientation="vertical"
                size={transportMetrics.controlSize}
                disabled={disabled}
                skeleton={skeleton}
                labels={text}
              />
            )}
          </View>
        </View>
      </View>

      {/* Output: what the app wants to offer and what it is coming out of. */}
      <View
        style={{
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: 0,
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: t('space-1'),
          minWidth: 0,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t('space-2'), minWidth: 0 }}>
          {actions}
        </View>
        {status != null &&
          (skeleton ? (
            <Skeleton variant="text" width={72} />
          ) : (
            <Text size="xs" tone="subtle" numberOfLines={1}>
              {status}
            </Text>
          ))}
      </View>
    </View>
  );
}
