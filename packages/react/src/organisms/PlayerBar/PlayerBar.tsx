import {
  formatDuration,
  formatRemaining,
  playerMetrics,
  playerSkeletonWidths,
  stripTransportDensity,
  transportPlaySize,
  type PlayerDensity,
  type PlayerRepeat,
} from '@glacier/logic';
import { playerBarPositions } from '@glacier/spec';
import { Heart, SlidersHorizontal } from '@glacier/icons';
import { useId, type ComponentProps, type CSSProperties, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { Text } from '../../atoms/display/Typography/Text.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import { IconButton } from '../../atoms/inputs/Button/IconButton.tsx';
import { SeekBar, type SeekBarProps } from '../../atoms/inputs/SeekBar/SeekBar.tsx';
import { SegmentedControl, type SegmentedOption } from '../../molecules/Segmented/SegmentedControl.tsx';
import { TrackInfo } from '../../molecules/TrackInfo/TrackInfo.tsx';
import {
  TransportControls,
  type TransportControlsLabels,
} from '../../molecules/TransportControls/TransportControls.tsx';
import { VolumeBar, type VolumeReadout, type VolumeBarLabels } from '../../molecules/VolumeBar/VolumeBar.tsx';
import { Popover } from '../Popover/Popover.tsx';
import styles from './PlayerBar.module.css';

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

// `onVolumeChange` is a DOM media event on every element, and it means
// something else there: the browser reporting that a media element's own volume
// moved. The strip's is the fader reporting a new position, so the inherited
// one is dropped rather than shadowed.
export interface PlayerBarProps
  extends Omit<ComponentProps<'div'>, 'title' | 'defaultValue' | 'onChange' | 'onVolumeChange'> {
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
   * them. This is where a strip's second thoughts go - a lyrics toggle, a cast
   * button - so they sit with the playback controls rather than out on the
   * trailing edge with the output.
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
  shape?: SeekBarProps['shape'];
  tone?: SeekBarProps['tone'];
  fill?: SeekBarProps['fill'];
  rail?: SeekBarProps['rail'];
  levels?: number[];
  beat?: SeekBarProps['beat'];
  intensity?: SeekBarProps['intensity'];
  /**
   * Draws the seek bar's tracer, the shadow trailing the beat. On, as on a
   * card: the bar is the only moving thing on a strip, so it is what the eye
   * goes to. Without a `beat` there is nothing to trail, so a still strip pays
   * nothing for it.
   */
  tracer?: SeekBarProps['tracer'];
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
 * its own, the track block is two lines rather than three, and the strip takes
 * no focus of its own, so tabbing into a document never lands here first.
 *
 * It is assembled from three components that each stand alone - `TrackInfo`,
 * `TransportControls`, and `VolumeBar` - so an app that wants a different strip
 * can build one out of the same parts rather than fighting this one.
 */
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
  className,
  style,
  ...rest
}: PlayerBarProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const titleId = useId();
  const metrics = playerMetrics(density);
  // The buttons run a step tighter than the room around them: they are chrome
  // under the bar, not the subject of the surface.
  const transportDensity = stripTransportDensity(density);
  const transportMetrics = playerMetrics(transportDensity);

  const [playhead, setPlayhead] = useControlled(value, defaultValue);
  const [isFavorite, setFavorite] = useControlled(favorite, defaultFavorite);
  const [qualityMode, setQualityMode] = useControlled(quality, defaultQuality);

  // The fader appears when it can do something: either the strip owns the level
  // or the caller is listening for it. A strip with nothing to turn down should
  // not draw a control that turns nothing down.
  const hasVolume = volume !== undefined || onVolumeChange !== undefined;
  const hasFavorite = favorite !== undefined || onFavoriteChange !== undefined;
  const qualityOptions: SegmentedOption[] = [
    { value: 'low', label: text.qualityLow },
    { value: 'medium', label: text.qualityMedium },
    { value: 'high', label: text.qualityHigh },
    { value: 'lossless', label: text.qualityLossless },
  ];

  const toggleFavorite = () => {
    const next = !isFavorite;
    setFavorite(next);
    onFavoriteChange?.(next);
  };

  const seek = (seconds: number) => {
    setPlayhead(seconds);
    onValueChange?.(seconds);
  };

  // The density's spacing reaches CSS as custom properties, so the stylesheet
  // keeps deciding how the gaps are used while the scale itself stays shared.
  // The play button's height goes with them: it is the tallest thing on the
  // strip, so it is what the strip's height is measured from. The strip draws
  // it solid, which is the same emphasis the transport below defaults to.
  const densityVars = {
    '--bar-gap': `var(--glacier-${metrics.gap})`,
    '--bar-play': `var(--glacier-control-height-${transportPlaySize(transportDensity, 'solid')})`,
  } as CSSProperties;

  /**
   * A clock. Decoration, and marked as such: the seek bar already speaks the
   * position through aria-valuetext, so announcing these would read the time
   * twice - once as a measurement and once as a number with no units.
   */
  const clock = (label: string, quiet: boolean) =>
    skeleton ? (
      <Skeleton variant="text" width={playerSkeletonWidths.clock} />
    ) : (
      <Text as="span" size="xs" tone={quiet ? 'subtle' : 'muted'} mono>
        {label}
      </Text>
    );

  return (
    <div
      className={cx(styles.bar, className)}
      style={{ ...densityVars, ...style }}
      data-position={position}
      // Not `data-density`: the token layer owns that attribute globally, and a
      // strip asking for tighter packing is not asking for the whole subtree's
      // control and space scale to step with it.
      data-pack={density}
      data-disabled={disabled || undefined}
      data-skeleton={skeleton || undefined}
      // a placeholder is not a group of controls yet
      role={skeleton ? undefined : 'group'}
      aria-hidden={skeleton || undefined}
      aria-labelledby={!skeleton && title != null ? titleId : undefined}
      {...rest}
    >
      <TrackInfo
        className={styles.track}
        artwork={artwork}
        title={title}
        subtitle={subtitle}
        // the cover takes the strip's height rather than setting it: how tall
        // the row is was decided by the controls in the middle
        size="fill"
        skeleton={skeleton}
        titleId={titleId}
      />

      {/* The middle region: the bar on top, and under it the row that drives
          it. The bar goes first because it is the one thing on the strip that
          is always moving, so it is what the eye finds first, and putting the
          buttons above it would mean reaching past them to aim at it. */}
      <div className={styles.center}>
        <div className={styles.scrubber}>
          <div className={styles.clock} aria-hidden="true">
            {clock(formatTime(playhead), false)}
          </div>
          <SeekBar
            className={styles.seek}
            duration={duration}
            value={playhead}
            onValueChange={seek}
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
          <div className={styles.clock} aria-hidden="true">
            {clock(
              remaining ? formatRemaining(playhead, duration, formatTime) : formatTime(duration),
              true,
            )}
          </div>
        </div>

        {/* The row under the bar: the transport in the middle, and a rail
            either side of it for the controls that belong to the track rather
            than to the output. Both rails are always drawn, empty or not - the
            transport is centred on the strip, not on whatever happens to be
            beside it, and a play button that moved when a heart appeared would
            be a button that moved. */}
        <div className={styles.controls}>
          <div className={styles.rail} data-side="leading">
            {hasFavorite && (
              <IconButton
                variant="ghost"
                size={transportMetrics.controlSize}
                disabled={disabled}
                skeleton={skeleton}
                // one button whose label changes, not two that swap, so focus
                // survives the toggle
                aria-label={isFavorite ? text.unfavorite : text.favorite}
                aria-pressed={isFavorite}
                data-on={isFavorite || undefined}
                onClick={toggleFavorite}
              >
                {/* filled once saved: a heart outline and a heart are the same
                    glyph, and the fill is the part read from across a room */}
                <Heart
                  size={transportMetrics.controlIcon}
                  fill={isFavorite ? 'currentColor' : 'none'}
                />
              </IconButton>
            )}
            {leading}
          </div>

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

          <div className={styles.rail} data-side="trailing">
            {trailing}
            {hasVolume && (
              skeleton ? (
                <IconButton
                  variant="ghost"
                  size={transportMetrics.controlSize}
                  disabled={disabled}
                  skeleton
                  aria-label={text.quality}
                >
                  <SlidersHorizontal size={transportMetrics.controlIcon} />
                </IconButton>
              ) : (
                <Popover
                  placement="top"
                  className={styles.qualityPanel}
                  aria-label={text.quality}
                  trigger={
                    <IconButton
                      variant="ghost"
                      size={transportMetrics.controlSize}
                      disabled={disabled}
                      aria-label={text.quality}
                    >
                      <SlidersHorizontal size={transportMetrics.controlIcon} />
                    </IconButton>
                  }
                >
                  <div className={styles.qualityBody}>
                    <Text as="p" size="xs" tone="muted" className={styles.qualityLabel}>
                      {text.quality}
                    </Text>
                    <SegmentedControl
                      size="sm"
                      fullWidth
                      aria-label={text.quality}
                      value={qualityMode}
                      onValueChange={(next) => {
                        const nextQuality = next as PlayerBarQuality;
                        setQualityMode(nextQuality);
                        onQualityChange?.(nextQuality);
                      }}
                      options={qualityOptions}
                      disabled={disabled}
                    />
                  </div>
                </Popover>
              )
            )}
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
          </div>
        </div>
      </div>

      {/* Output: what the app wants to offer and what it is coming out of. */}
      <div className={styles.output}>
        <div className={styles.outputRow}>{actions}</div>
        {status != null && (
          <div className={styles.status}>
            {skeleton ? (
              <Skeleton variant="text" width="8ch" />
            ) : (
              <Text as="span" size="xs" tone="subtle">
                {status}
              </Text>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
