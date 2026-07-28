import type { ChatAttachment } from '@glacier/logic';
import type { ComponentProps, CSSProperties } from 'react';
import { attachmentLabel, imageGridLayout } from '@glacier/logic';
import { cx } from '../../internal/cx.ts';
import { format } from '../../i18n/locale.ts';
import { ImageAttachment } from './ImageAttachment.tsx';
import styles from './Attachments.module.css';

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

export interface ImageGridProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** The album, in send order. */
  images: ChatAttachment[];
  /** Per-image alt text, positionally matched to `images`. */
  alts?: (string | undefined)[];
  /** How many tiles before the rest collapse into the count. */
  max?: number;
  /** Called with the attachment and its index when a tile is activated. */
  onOpen?: (attachment: ChatAttachment, index: number) => void;
  /** Overrides the spoken strings; merged over the English defaults. */
  labels?: Partial<ImageGridLabels>;
}

/**
 * The album layout for photos sent together.
 *
 * The mosaic itself is `imageGridLayout` in @glacier/logic — which tile is
 * where, how many rows, what the whole grid's ratio is, and which tile carries
 * the "+N" — so the DOM and native albums are the same mosaic rather than two
 * independent attempts at "the familiar one". This component only turns those
 * rows and flex weights into elements.
 *
 * A single image is not a mosaic: the layout reports no grid ratio for it, and
 * the tile falls through to `ImageAttachment`'s own clamped intrinsic frame.
 */
export function ImageGrid({
  images,
  alts,
  max,
  onOpen,
  labels,
  className,
  style,
  ...rest
}: ImageGridProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const layout = imageGridLayout(images.length, { max });
  if (layout.shown === 0) return null;

  const gridStyle = {
    '--attachment-grid-gap': `var(--glacier-${layout.gap})`,
    aspectRatio: layout.aspectRatio != null ? String(layout.aspectRatio) : undefined,
    ...style,
  } as CSSProperties;

  return (
    <div
      // One group, so a screen reader announces "4 photos" before walking into
      // them rather than reading four unrelated images in a row.
      role="group"
      aria-label={format(text.album, { count: images.length })}
      className={cx(styles.grid, className)}
      style={gridStyle}
      {...rest}
    >
      {layout.rows.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.gridRow} style={{ flex: row.flex }}>
          {row.tiles.map((tile) => {
            const attachment = images[tile.index];
            if (!attachment) return null;
            const overflowing = tile.overflow > 0;
            const name = attachmentLabel(attachment, text.image, alts?.[tile.index]);
            // The overflow tile opens the rest of the album, so it announces
            // the count it hides — not the one photo peeking out from under it.
            const label = overflowing ? format(text.more, { count: tile.overflow }) : name;
            return (
              <div key={attachment.id} className={styles.tile} style={{ flex: tile.flex }}>
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
                  <span className={styles.more} aria-hidden="true">
                    {format(text.overflowBadge, { count: tile.overflow })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
