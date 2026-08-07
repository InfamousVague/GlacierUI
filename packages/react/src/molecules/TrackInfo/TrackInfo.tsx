import { playerSkeletonWidths } from '@glacier/logic';
import { trackInfoSizes, trackInfoAligns } from '@glacier/spec';
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Text } from '../../atoms/display/Typography/Text.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import styles from './TrackInfo.module.css';

// Derived from the spec so the unions cannot drift.
export type TrackInfoSize = (typeof trackInfoSizes)[number];
export type TrackInfoAlign = (typeof trackInfoAligns)[number];

export interface TrackInfoProps extends Omit<ComponentProps<'div'>, 'title'> {
  /** Album art. Held square by the block and sized by `size`. */
  artwork?: ReactNode;
  /** What is playing. */
  title?: ReactNode;
  /** A second line, usually the album. */
  subtitle?: ReactNode;
  /** A third line, usually the artist or source. */
  album?: ReactNode;
  /** The artwork footprint; the text sizes do not change with it. */
  size?: TrackInfoSize;
  /**
   * How the text column sits against the artwork. Centre reads right while the
   * art is the taller of the two; start once the lines run past it.
   */
  align?: TrackInfoAlign;
  /** Loads each line as its own placeholder at its own width. */
  skeleton?: boolean;
  /** Marks the title so a surrounding group can be labelled by it. */
  titleId?: string;
}

/**
 * What is playing, as one block: album art beside the title, album, and artist.
 *
 * Each line steps down in quietness, and the first two in size as well, so which
 * of the three is the track name is legible before a word of it is read - the
 * reason the block is a component at all rather than three `Text`s a caller
 * stacks themselves. The type sits a step below the page's, because the block is
 * chrome wherever it is used: what is playing, not what is being read.
 *
 * It is text, not a control: it takes no role, so whatever surface holds it
 * stays the thing a screen reader announces.
 */
export function TrackInfo({
  artwork,
  title,
  subtitle,
  album,
  size = 'md',
  align = 'center',
  skeleton = false,
  titleId,
  className,
  ...rest
}: TrackInfoProps) {
  /**
   * A placeholder line. Text's own skeleton is a fixed `14ch`, which is right
   * for a title and three times too wide for an artist, so the widths come from
   * `@glacier/logic` - the same numbers the native kit and the PlayerCard read.
   * The wrapper holds the real line box, so swapping a bone for its text never
   * shifts the block.
   */
  const line = (
    width: string,
    step: 'md' | 'sm' | 'xs',
    node: ReactNode,
    render: (n: ReactNode) => ReactNode,
  ) => {
    if (node == null) return false;
    if (!skeleton) return render(node);
    return (
      <span
        className={styles.bone}
        style={{ height: `calc(var(--glacier-leading-${step}) * var(--glacier-font-size-${step}))` }}
      >
        <Skeleton
          variant="text"
          width={width}
          style={{ fontSize: `var(--glacier-font-size-${step})` }}
        />
      </span>
    );
  };

  const hasLines = title != null || subtitle != null || album != null;

  return (
    <div className={cx(styles.track, className)} data-size={size} data-align={align} {...rest}>
      {artwork != null && (
        <div className={styles.artwork}>
          {skeleton ? <Skeleton width="100%" height="100%" radius="var(--glacier-radius-md)" /> : artwork}
        </div>
      )}
      {hasLines && (
        <div className={styles.lines}>
          {line(playerSkeletonWidths.title, 'sm', title, (n) => (
            <Text id={titleId} size="sm" weight="semibold" className={styles.line}>
              {n}
            </Text>
          ))}
          {line(playerSkeletonWidths.subtitle, 'xs', subtitle, (n) => (
            <Text size="xs" tone="muted" className={styles.line}>
              {n}
            </Text>
          ))}
          {/* The scale's floor: the third line has no smaller step to take, so
              it separates from the second by tone alone. */}
          {line(playerSkeletonWidths.album, 'xs', album, (n) => (
            <Text size="xs" tone="subtle" className={styles.line}>
              {n}
            </Text>
          ))}
        </div>
      )}
    </div>
  );
}
