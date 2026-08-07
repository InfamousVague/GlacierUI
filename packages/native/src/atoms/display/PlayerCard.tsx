// The Glacier PlayerCard, rendered with React Native primitives: an audio
// transport in a card - what is playing, a seek bar with its elapsed and total
// times, and the play, skip, shuffle, and repeat controls under it. The transport
// logic (time formatting, the repeat cycle, the density scale) comes from
// @glacier/logic, the same functions the DOM kit calls, so the two cannot
// behave or measure differently.

import { useId, type ReactNode } from 'react';
import { View } from 'react-native';
import { Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward } from '@glacier/icons';
import {
  formatDuration,
  nextRepeat,
  playerMetrics,
  playerSkeletonWidths,
  useControlled,
  type PlayerDensity,
  type PlayerLayout,
  type PlayerRepeat,
  type SeekBarBeat,
} from '@glacier/logic';
import { t } from '../../tokens.ts';
import { Card } from './Card.tsx';
import { IconButton } from '../inputs/IconButton.tsx';
import { Text } from './Text.tsx';
import { Skeleton } from '../feedback/Skeleton.tsx';
import {
  SeekBar,
  type SeekBarShape,
  type SeekBarTone,
  type SeekBarFill,
  type SeekBarRail,
} from '../inputs/SeekBar.tsx';

export type { PlayerRepeat, PlayerLayout, PlayerDensity };

/** Labels every control needs, so the card can be spoken in any language. */
export interface PlayerCardLabels {
  play: string;
  pause: string;
  skipBack: string;
  skipForward: string;
  shuffle: string;
  /** Given the current mode, so the label can name it. */
  repeat: (mode: PlayerRepeat) => string;
  seek: string;
}

const DEFAULT_LABELS: PlayerCardLabels = {
  play: 'Play',
  pause: 'Pause',
  skipBack: 'Previous track',
  skipForward: 'Next track',
  shuffle: 'Shuffle',
  repeat: (mode) => `Repeat: ${mode}`,
  seek: 'Seek',
};

export interface PlayerCardProps {
  /** Album art, placed and sized by the layout. */
  artwork?: ReactNode;
  /** How the card arranges what it holds. */
  layout?: PlayerLayout;
  /** How tightly it is packed. */
  density?: PlayerDensity;
  /** What is playing. */
  title?: ReactNode;
  /** A second line, usually the artist. */
  subtitle?: ReactNode;
  /** A third line naming the album or source. */
  album?: ReactNode;
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
  /** Omit a skip handler and that control is not rendered. */
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
  /** Forwarded to the seek bar. */
  shape?: SeekBarShape;
  tone?: SeekBarTone;
  fill?: SeekBarFill;
  /**
   * How visible the unplayed run is. Defaults to `contrast`, because the card
   * is a raised surface and the muted rail vanishes against it.
   */
  rail?: SeekBarRail;
  levels?: number[];
  beat?: SeekBarBeat;
  /** How hard the beat deforms the seek bar. Forwarded straight through. */
  intensity?: number;
  /**
   * Draws the seek bar's tracer, the shadow trailing the beat. On here, unlike
   * on a bare bar: a card is a now-playing surface, where the bar is the thing
   * being looked at rather than a rail under something else. Without a `beat`
   * there is nothing to trail, so a still card pays nothing for it.
   */
  tracer?: boolean;
  /** Formats the elapsed and total readouts. */
  formatTime?: (seconds: number) => string;
  /** Dims the card and blocks every control. */
  disabled?: boolean;
  /** Loads every part as its own placeholder, keeping the card's exact layout. */
  skeleton?: boolean;
  /** Overrides the control labels; merged over the English defaults. */
  labels?: Partial<PlayerCardLabels>;
}

/** Artwork footprints per layout, mirroring the DOM kit's stylesheet. */
const ART_WIDTH: Record<PlayerLayout, number | '100%'> = {
  stacked: 56,
  inline: 80,
  square: '100%',
  bar: 32,
};

/**
 * An audio transport in a card. Every piece of state is controllable or left to
 * the card; a control whose handler is omitted is not rendered, so the same
 * component covers a bare play/pause strip and a full transport.
 *
 * There is one tree, not a separate skeleton tree: `skeleton` is threaded into
 * each part, so a loading card holds the exact layout it will settle into.
 */
export function PlayerCard({
  artwork,
  layout = 'stacked',
  density = 'comfortable',
  title,
  subtitle,
  album,
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
}: PlayerCardProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const headingId = useId();
  // The same scale the DOM kit reads, so a compact card is the same card here.
  const metrics = playerMetrics(density);
  const gap = t(metrics.gap);
  const transportGap = t(metrics.transportGap);

  const [position, setPosition] = useControlled({ value, defaultValue, onChange: onValueChange });
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

  // A control appears when it can do something: either the card owns the state
  // or the caller is listening for it.
  const hasShuffle = shuffle !== undefined || onShuffleChange !== undefined;
  const hasRepeat = repeat !== undefined || onRepeatChange !== undefined;
  const hasHeading = title != null || subtitle != null || album != null;

  const onColor = t('accent-text');
  const offColor = t('text-muted');

  const art = artwork != null && <View style={{ width: ART_WIDTH[layout] }}>{artwork}</View>;

  /**
   * A placeholder line. The native Text skeleton is a fixed-width block, so
   * using it for every line would stack identical bars. Widths come from
   * @glacier/logic, the same values the DOM kit reads.
   */
  const line = (width: string, node: ReactNode, render: (n: ReactNode) => ReactNode) =>
    node == null ? false : skeleton ? <Skeleton variant="text" width={width} /> : render(node);

  const heading = hasHeading && (
    <View style={{ gap: t('space-1'), minWidth: 0 }}>
      {line(playerSkeletonWidths.title, title, (n) => (
        <Text nativeID={headingId} weight="semibold" numberOfLines={1}>
          {n}
        </Text>
      ))}
      {line(playerSkeletonWidths.subtitle, subtitle, (n) => (
        <Text size="sm" tone="muted" numberOfLines={1}>
          {n}
        </Text>
      ))}
      {line(playerSkeletonWidths.album, album, (n) => (
        <Text size="xs" tone="subtle" numberOfLines={1}>
          {n}
        </Text>
      ))}
    </View>
  );

  const seekBar = (
    <SeekBar
      duration={duration}
      value={position}
      onValueChange={setPosition}
      onSeekEnd={onSeekEnd}
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
  );

  // Decoration: the seek bar already speaks the position through its
  // accessibility value, so repeating it would double-announce.
  const elapsed = skeleton ? (
    <Skeleton variant="text" width={playerSkeletonWidths.clock} />
  ) : (
    <Text size="xs" tone="muted" mono>
      {formatTime(position)}
    </Text>
  );
  const total = skeleton ? (
    <Skeleton variant="text" width={playerSkeletonWidths.clock} />
  ) : (
    <Text size="xs" tone="subtle" mono>
      {formatTime(duration)}
    </Text>
  );

  const scrubber = (
    // The bar and its clock are one unit: the times are the bar's endpoints, so
    // they sit tight under it and the density gap separates the group.
    <View style={{ gap: t('space-1'), minWidth: 0 }}>
      {seekBar}
      <View aria-hidden={true} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {elapsed}
        {total}
      </View>
    </View>
  );

  /**
   * The bar layout's scrubber: the same bar, with its clocks as endpoints on
   * either side rather than a caption underneath, since a one-line card has no
   * row to put them on.
   */
  const barScrubber = (
    <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: t('space-2') }}>
      <View aria-hidden={true}>{elapsed}</View>
      <View style={{ flex: 1, minWidth: 0 }}>{seekBar}</View>
      <View aria-hidden={true}>{total}</View>
    </View>
  );

  const shuffleControl = hasShuffle && (
    <IconButton
      variant="ghost"
      size={metrics.controlSize}
      disabled={disabled}
      skeleton={skeleton}
      aria-label={text.shuffle}
      accessibilityState={{ selected: isShuffling }}
      onPress={() => setShuffling(!isShuffling)}
    >
      <Shuffle size={metrics.controlIcon} color={isShuffling ? onColor : offColor} />
    </IconButton>
  );

  const skipBackControl = onSkipBack && (
    <IconButton
      variant="ghost"
      size={metrics.controlSize}
      disabled={disabled}
      skeleton={skeleton}
      aria-label={text.skipBack}
      onPress={onSkipBack}
    >
      <SkipBack size={metrics.controlIcon} color={offColor} />
    </IconButton>
  );

  // One button whose label changes, not two that swap, so focus survives the
  // toggle.
  const playControl = (
    <IconButton
      variant="solid"
      size={metrics.playSize}
      disabled={disabled}
      skeleton={skeleton}
      aria-label={isPlaying ? text.pause : text.play}
      onPress={() => setPlaying(!isPlaying)}
    >
      {isPlaying ? (
        <Pause size={metrics.playIcon} color={t('accent-contrast')} />
      ) : (
        <Play size={metrics.playIcon} color={t('accent-contrast')} />
      )}
    </IconButton>
  );

  const skipForwardControl = onSkipForward && (
    <IconButton
      variant="ghost"
      size={metrics.controlSize}
      disabled={disabled}
      skeleton={skeleton}
      aria-label={text.skipForward}
      onPress={onSkipForward}
    >
      <SkipForward size={metrics.controlIcon} color={offColor} />
    </IconButton>
  );

  const repeatControl = hasRepeat && (
    <IconButton
      variant="ghost"
      size={metrics.controlSize}
      disabled={disabled}
      skeleton={skeleton}
      // three states cannot be described by a pressed flag alone, so the
      // label names the mode as well
      aria-label={text.repeat(repeatMode)}
      accessibilityState={{ selected: repeatMode !== 'off' }}
      onPress={() => setRepeatMode(nextRepeat(repeatMode))}
    >
      {repeatMode === 'one' ? (
        <Repeat1 size={metrics.controlIcon} color={onColor} />
      ) : (
        // 'all' is engaged and tints; 'off' stays quiet
        <Repeat size={metrics.controlIcon} color={repeatMode === 'all' ? onColor : offColor} />
      )}
    </IconButton>
  );

  const transportRow = { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: transportGap } as const;

  const transport = (
    <View style={transportRow}>
      {shuffleControl}
      {skipBackControl}
      {playControl}
      {skipForwardControl}
      {repeatControl}
    </View>
  );

  return (
    <Card
      // A loading card reads as an outline, not a filled slab. Transparent alone
      // is not enough: the Card paints a separate elevation overlay on top of
      // its background, and only elevation 0 drops that View entirely.
      elevation={skeleton ? 0 : undefined}
      // a placeholder is not a group of controls yet
      accessibilityRole={skeleton ? undefined : 'group'}
      aria-hidden={skeleton || undefined}
      aria-labelledby={!skeleton && title != null ? headingId : undefined}
      style={{
        opacity: disabled ? 0.5 : 1,
        // a transport is a control, not prose: dragging across it should never
        // leave a selection highlight behind the buttons
        userSelect: 'none' as never,
        // a loading card reads as an outline waiting to be filled, not a solid
        // slab - the placeholders inside are what should carry it
        ...(skeleton ? { backgroundColor: 'transparent' } : null),
      }}
    >
      {/* Bar puts the whole card on one line: the transport leads, what is
          playing rides beside it, the seek bar takes what is left between its
          two clocks, and the modes close the row out. */}
      {layout === 'bar' ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap }}>
          <View style={transportRow}>
            {skipBackControl}
            {playControl}
            {skipForwardControl}
          </View>
          {art}
          <View style={{ flexShrink: 1, minWidth: 0 }}>{heading}</View>
          {barScrubber}
          {(shuffleControl || repeatControl) && (
            <View style={transportRow}>
              {shuffleControl}
              {repeatControl}
            </View>
          )}
        </View>
      ) : /* Inline pairs the art with the text as a header row, top-aligned, then
          breaks: the bar and controls get the card's full width rather than
          being squeezed into the column beside the art. */
      layout === 'inline' ? (
        <View style={{ gap }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap }}>
            {art}
            <View style={{ flex: 1, minWidth: 0 }}>{heading}</View>
          </View>
          {scrubber}
          {transport}
        </View>
      ) : (
        <View style={{ gap }}>
          {art}
          {heading}
          {scrubber}
          {transport}
        </View>
      )}
    </Card>
  );
}
