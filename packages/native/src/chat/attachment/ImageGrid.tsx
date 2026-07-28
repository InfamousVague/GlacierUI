// ImageGrid — the native binding of @glacier/react's ImageGrid.
//
// The album mosaic. Which tile is where, how many rows, the grid's own ratio,
// and which tile carries the "+N" all come from `imageGridLayout` in
// @glacier/logic — the same function the DOM kit calls — so the two platforms
// tile an album identically instead of approximately. The layout is expressed
// as rows of flex weights precisely because that is what React Native can
// render exactly; a CSS grid would have had to be re-approximated here.

import { View, Text, type ViewProps } from 'react-native';
import type { ChatAttachment } from '@glacier/logic';
import { attachmentLabel, imageGridLayout } from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once the spec is registered.
import { imageGridSpec } from '../../../../spec/src/components/image-grid.ts';
import { t } from '../../tokens.ts';
import { dimensionsFor, paintFor } from '../../resolve.ts';
import { ImageAttachment } from './ImageAttachment.tsx';

/** Every string an album can speak. */
export interface ImageGridLabels {
  /** Names the group, with a `{count}` slot. */
  album: string;
  /** Per-photo fallback when a tile has neither alt text nor a file name. */
  image: string;
  /** The open action, with a `{name}` slot. */
  open: string;
  /** The overflow tile's accessible name, with a `{count}` slot. */
  more: string;
  /** The visible badge on the overflow tile, with a `{count}` slot. */
  overflowBadge: string;
}

const DEFAULT_LABELS: ImageGridLabels = {
  album: '{count} photos',
  image: 'Photo',
  open: 'Open {name}',
  more: '{count} more photos',
  overflowBadge: '+{count}',
};

export interface ImageGridProps extends Omit<ViewProps, 'children' | 'style'> {
  images: ChatAttachment[];
  /** Per-image alt text, positionally matched to `images`. */
  alts?: (string | undefined)[];
  /** How many tiles before the rest collapse into the count. */
  max?: number;
  onOpen?: (attachment: ChatAttachment, index: number) => void;
  labels?: Partial<ImageGridLabels>;
}

// Size-independent metrics and the overflow wash, read once from the spec.
const BOX = dimensionsFor(imageGridSpec);
const OVERFLOW = paintFor(imageGridSpec, 'states', 'overflow');

/** Interpolates `{name}` placeholders, matching the kit catalog's `format`. */
function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in params ? String(params[key]) : whole,
  );
}

export function ImageGrid({ images, alts, max, onOpen, labels, ...rest }: ImageGridProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const layout = imageGridLayout(images.length, { max });
  if (layout.shown === 0) return null;

  const gap = t(layout.gap);

  return (
    <View
      {...rest}
      // One group, so a screen reader announces "4 photos" before walking into
      // them rather than reading four unrelated images in a row.
      accessibilityRole="group"
      aria-label={interpolate(text.album, { count: images.length })}
      style={{
        width: '100%',
        overflow: 'hidden',
        borderRadius: t(BOX.radius ?? 'radius-lg'),
        gap,
        ...(layout.aspectRatio != null ? { aspectRatio: layout.aspectRatio } : null),
      }}
    >
      {layout.rows.map((row, rowIndex) => (
        <View key={rowIndex} style={{ flexDirection: 'row', flex: row.flex, gap, minHeight: 0 }}>
          {row.tiles.map((tile) => {
            const attachment = images[tile.index];
            if (!attachment) return null;
            const overflowing = tile.overflow > 0;
            const name = attachmentLabel(attachment, text.image, alts?.[tile.index]);
            // The overflow tile opens the rest of the album, so it announces
            // the count it hides — not the one photo peeking out from under it.
            const label = overflowing ? interpolate(text.more, { count: tile.overflow }) : name;
            return (
              <View key={attachment.id} style={{ flex: tile.flex, position: 'relative', overflow: 'hidden' }}>
                <ImageAttachment
                  fill
                  radius="none"
                  attachment={attachment}
                  alt={overflowing ? label : alts?.[tile.index]}
                  labels={{ image: label, open: text.open }}
                  onOpen={onOpen ? () => onOpen(attachment, tile.index) : undefined}
                />
                {overflowing && (
                  // Decorative: the count is already the tile's accessible name,
                  // and hearing "+2" after "2 more photos" is the same fact twice.
                  <View
                    aria-hidden={true}
                    pointerEvents="none"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: t(OVERFLOW.wash ?? 'overlay'),
                    }}
                  >
                    <Text
                      style={{
                        color: t(OVERFLOW.text ?? 'accent-contrast'),
                        fontFamily: t('font-sans'),
                        fontSize: t('font-size-lg') as never,
                        fontWeight: t('font-weight-semibold') as never,
                      }}
                    >
                      {interpolate(text.overflowBadge, { count: tile.overflow })}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
