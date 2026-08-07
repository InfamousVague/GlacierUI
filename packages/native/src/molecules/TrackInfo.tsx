// The Glacier TrackInfo, rendered with React Native primitives: what is
// playing, as one block - album art beside the title, album, and artist. The
// artwork footprints and the placeholder line widths come from @glacier/logic
// and @glacier/spec, the same values the DOM kit reads, so the block cannot
// measure differently on the two platforms.

import type { ReactNode } from 'react';
import { View } from 'react-native';
import { playerSkeletonWidths } from '@glacier/logic';
import { trackInfoSizes, trackInfoAligns } from '@glacier/spec';
import { t } from '../tokens.ts';
import { Text } from '../atoms/display/Text.tsx';
import { Skeleton } from '../atoms/feedback/Skeleton.tsx';

// Derived from the spec so the unions cannot drift.
export type TrackInfoSize = (typeof trackInfoSizes)[number];
export type TrackInfoAlign = (typeof trackInfoAligns)[number];

export interface TrackInfoProps {
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
  titleID?: string;
}

/**
 * Artwork footprints per size, mirroring the DOM stylesheet. The spec states
 * them in rem; native has no rem, so they are read once and turned into the
 * points the DOM would resolve them to. `fill` has no measurement of its own -
 * it takes the height it is given and derives its width from the square.
 */
const ART: Record<Exclude<TrackInfoSize, 'fill'>, number> = {
  sm: 32,
  md: 40,
  lg: 64,
};

/**
 * What is playing, as one block: album art beside the title, album, and artist.
 *
 * Each line steps down in quietness, and the first two in size as well, so which
 * of the three is the track name is legible before a word of it is read - the
 * reason the block is a component at all rather than three `Text`s a caller
 * stacks themselves. The type sits a step below the page's, because the block is
 * chrome wherever it is used: what is playing, not what is being read.
 *
 * It is text, not a control: it takes no accessibility role, so whatever
 * surface holds it stays the thing a screen reader announces.
 */
export function TrackInfo({
  artwork,
  title,
  subtitle,
  album,
  size = 'md',
  align = 'center',
  skeleton = false,
  titleID,
}: TrackInfoProps) {
  const fill = size === 'fill';
  const art = fill ? undefined : ART[size];

  /**
   * A placeholder line. The native Text skeleton is a fixed-width block, so
   * using it for every line would stack three identical bars where the real
   * block has a long title over a short artist. The widths come from
   * @glacier/logic - the same numbers the DOM kit and the PlayerCard read.
   */
  const line = (width: string, node: ReactNode, render: (n: ReactNode) => ReactNode) =>
    node == null ? false : skeleton ? <Skeleton variant="text" width={width} /> : render(node);

  const hasLines = title != null || subtitle != null || album != null;

  return (
    <View
      style={{
        flexDirection: 'row',
        // Fill stretches so the cover has a height to take; otherwise the row
        // is only as tall as its contents and the align step decides where
        // they sit in it.
        alignItems: fill ? 'stretch' : align === 'center' ? 'center' : 'flex-start',
        gap: t(size === 'sm' ? 'space-2' : 'space-3'),
        minWidth: 0,
      }}
    >
      {artwork != null && (
        <View
          style={{
            width: art,
            height: fill ? '100%' : art,
            aspectRatio: fill ? 1 : undefined,
            borderRadius: t('radius-md'),
            overflow: 'hidden',
          }}
        >
          {skeleton ? <Skeleton width="100%" height="100%" radius={t('radius-md')} /> : artwork}
        </View>
      )}
      {hasLines && (
        <View
          style={{
            gap: t('space-1'),
            minWidth: 0,
            flexShrink: 1,
            justifyContent: fill ? 'center' : 'flex-start',
          }}
        >
          {line(playerSkeletonWidths.title, title, (n) => (
            <Text nativeID={titleID} size="sm" weight="semibold" numberOfLines={1}>
              {n}
            </Text>
          ))}
          {line(playerSkeletonWidths.subtitle, subtitle, (n) => (
            <Text size="xs" tone="muted" numberOfLines={1}>
              {n}
            </Text>
          ))}
          {/* The scale's floor: the third line has no smaller step to take, so
              it separates from the second by tone alone. */}
          {line(playerSkeletonWidths.album, album, (n) => (
            <Text size="xs" tone="subtle" numberOfLines={1}>
              {n}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}
