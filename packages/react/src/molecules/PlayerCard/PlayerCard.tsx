import {
  formatDuration,
  nextRepeat,
  playerMetrics,
  playerSkeletonWidths,
  type PlayerDensity,
  type PlayerLayout,
  type PlayerRepeat,
} from '@glacier/logic';
import { Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward } from '@glacier/icons';
import { useId, type CSSProperties, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { Card, type CardProps } from '../../atoms/display/Surface/Card.tsx';
import { IconButton } from '../../atoms/inputs/Button/IconButton.tsx';
import { Text } from '../../atoms/display/Typography/Text.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import { SeekBar, type SeekBarProps } from '../../atoms/inputs/SeekBar/SeekBar.tsx';
import styles from './PlayerCard.module.css';

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

export interface PlayerCardProps
  // Built on the Card's own surface rather than a bare div: the Card is a motion
  // element, so its drag handlers are not the DOM's, and its `layout` is
  // framer-motion's animation flag rather than ours. Both are omitted, and so is
  // `shape`: on a PlayerCard that word names the seek waveform, not the plate
  // silhouette, so the player keeps the meaning its own prop already had.
  extends Omit<CardProps, 'children' | 'title' | 'defaultValue' | 'skeleton' | 'layout' | 'shape'> {
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
  shape?: SeekBarProps['shape'];
  tone?: SeekBarProps['tone'];
  fill?: SeekBarProps['fill'];
  /**
   * How visible the unplayed run is. Defaults to `contrast`, because the card
   * is a raised surface and the muted rail vanishes against it.
   */
  rail?: SeekBarProps['rail'];
  levels?: number[];
  /** Formats the elapsed and total readouts. */
  formatTime?: (seconds: number) => string;
  /** Dims the card and blocks every control. */
  disabled?: boolean;
  /** Loads every part as its own placeholder, keeping the card's exact layout. */
  skeleton?: boolean;
  /** Overrides the control labels; merged over the English defaults. */
  labels?: Partial<PlayerCardLabels>;
}

/**
 * An audio transport in a card: what is playing, a seek bar with its elapsed and
 * total times, and the play, skip, shuffle, and repeat controls under it.
 *
 * Every piece of state is controllable or left to the card, and a control whose
 * handler is omitted is not rendered at all - so the same component covers a
 * bare play/pause strip and a full transport without a pile of `show*` flags.
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
  formatTime = formatDuration,
  disabled = false,
  skeleton = false,
  labels,
  className,
  style,
  ...rest
}: PlayerCardProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const headingId = useId();
  const metrics = playerMetrics(density);

  const [position, setPosition] = useControlled(value, defaultValue);
  const [isPlaying, setPlaying] = useControlled(playing, defaultPlaying);
  const [isShuffling, setShuffling] = useControlled(shuffle, defaultShuffle);
  const [repeatMode, setRepeatMode] = useControlled(repeat, defaultRepeat);

  // A control appears when it can do something: either the card owns the state
  // or the caller is listening for it.
  const hasShuffle = shuffle !== undefined || onShuffleChange !== undefined;
  const hasRepeat = repeat !== undefined || onRepeatChange !== undefined;
  const hasHeading = title != null || subtitle != null || album != null;

  const seek = (seconds: number) => {
    setPosition(seconds);
    onValueChange?.(seconds);
  };

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

  // The density's spacing reaches CSS as custom properties, so the stylesheet
  // keeps deciding how the gaps are used while the scale itself stays shared.
  const densityVars = {
    '--player-gap': `var(--glacier-${metrics.gap})`,
    '--player-transport-gap': `var(--glacier-${metrics.transportGap})`,
  } as CSSProperties;

  /**
   * A placeholder line. Text's own skeleton is a fixed `14ch`, which does not
   * agree with what the native kit draws, so both bindings size their bones
   * from the shared widths instead. The wrapper holds the real line box, so
   * swapping the placeholder for text never shifts the layout.
   */
  const line = (
    width: string,
    size: 'md' | 'sm' | 'xs',
    node: ReactNode,
    render: (n: ReactNode) => ReactNode,
  ) => {
    if (node == null) return false;
    if (!skeleton) return render(node);
    return (
      <span
        className={styles.bone}
        style={{ height: `calc(var(--glacier-leading-${size}) * var(--glacier-font-size-${size}))` }}
      >
        <Skeleton variant="text" width={width} style={{ fontSize: `var(--glacier-font-size-${size})` }} />
      </span>
    );
  };

  const heading = hasHeading && (
    <div className={styles.heading}>
      {line(playerSkeletonWidths.title, 'md', title, (n) => (
        <Text id={headingId} weight="semibold" className={styles.title}>
          {n}
        </Text>
      ))}
      {line(playerSkeletonWidths.subtitle, 'sm', subtitle, (n) => (
        <Text size="sm" tone="muted" className={styles.title}>
          {n}
        </Text>
      ))}
      {line(playerSkeletonWidths.album, 'xs', album, (n) => (
        <Text size="xs" tone="subtle" className={styles.title}>
          {n}
        </Text>
      ))}
    </div>
  );

  const scrubber = (
    <div className={styles.scrubber}>
      <SeekBar
        duration={duration}
        value={position}
        onValueChange={seek}
        onSeekEnd={onSeekEnd}
        shape={shape}
        tone={tone}
        fill={fill}
        rail={rail}
        levels={levels}
        formatTime={formatTime}
        disabled={disabled}
        skeleton={skeleton}
        aria-label={text.seek}
      />
      {/* The clock is decoration: the seek bar already speaks the position
          through aria-valuetext, so repeating it would double-announce. */}
      <div className={styles.times} aria-hidden="true">
        {skeleton ? (
          <>
            <Skeleton variant="text" width={playerSkeletonWidths.clock} />
            <Skeleton variant="text" width={playerSkeletonWidths.clock} />
          </>
        ) : (
          <>
            <Text as="span" size="xs" tone="muted" mono>
              {formatTime(position)}
            </Text>
            <Text as="span" size="xs" tone="subtle" mono>
              {formatTime(duration)}
            </Text>
          </>
        )}
      </div>
    </div>
  );

  const transport = (
    <div className={styles.transport}>
      {hasShuffle && (
        <IconButton
          variant="ghost"
          size={metrics.controlSize}
          disabled={disabled}
          skeleton={skeleton}
          aria-label={text.shuffle}
          aria-pressed={isShuffling}
          data-on={isShuffling || undefined}
          onClick={toggleShuffle}
        >
          <Shuffle size={metrics.controlIcon} />
        </IconButton>
      )}
      {onSkipBack && (
        <IconButton
          variant="ghost"
          size={metrics.controlSize}
          disabled={disabled}
          skeleton={skeleton}
          aria-label={text.skipBack}
          onClick={onSkipBack}
        >
          <SkipBack size={metrics.controlIcon} />
        </IconButton>
      )}
      {/* One button whose label changes, not two that swap, so focus survives
          the toggle. */}
      <IconButton
        variant="solid"
        size={metrics.playSize}
        disabled={disabled}
        skeleton={skeleton}
        aria-label={isPlaying ? text.pause : text.play}
        onClick={togglePlaying}
      >
        {isPlaying ? <Pause size={metrics.playIcon} /> : <Play size={metrics.playIcon} />}
      </IconButton>
      {onSkipForward && (
        <IconButton
          variant="ghost"
          size={metrics.controlSize}
          disabled={disabled}
          skeleton={skeleton}
          aria-label={text.skipForward}
          onClick={onSkipForward}
        >
          <SkipForward size={metrics.controlIcon} />
        </IconButton>
      )}
      {hasRepeat && (
        <IconButton
          variant="ghost"
          size={metrics.controlSize}
          disabled={disabled}
          skeleton={skeleton}
          // three states cannot be described by a pressed flag alone, so the
          // label names the mode as well
          aria-label={text.repeat(repeatMode)}
          aria-pressed={repeatMode !== 'off'}
          data-on={repeatMode !== 'off' || undefined}
          onClick={cycleRepeat}
        >
          {repeatMode === 'one' ? <Repeat1 size={metrics.controlIcon} /> : <Repeat size={metrics.controlIcon} />}
        </IconButton>
      )}
    </div>
  );

  const art = artwork != null && <div className={styles.artwork}>{artwork}</div>;

  return (
    <Card
      className={cx(styles.card, className)}
      style={{ ...densityVars, ...style }}
      data-layout={layout}
      data-density={density}
      data-disabled={disabled || undefined}
      data-skeleton={skeleton || undefined}
      // a placeholder is not a group of controls yet
      role={skeleton ? undefined : 'group'}
      aria-hidden={skeleton || undefined}
      aria-labelledby={!skeleton && title != null ? headingId : undefined}
      {...rest}
    >
      <div className={styles.body}>
        {/* Inline pairs the art with the text as a header row, top-aligned, then
            breaks: the bar and controls get the card's full width rather than
            being squeezed into the column beside the art. */}
        {layout === 'inline' ? (
          <>
            <div className={styles.header}>
              {art}
              {heading}
            </div>
            {scrubber}
            {transport}
          </>
        ) : (
          <>
            {art}
            {heading}
            {scrubber}
            {transport}
          </>
        )}
      </div>
    </Card>
  );
}
