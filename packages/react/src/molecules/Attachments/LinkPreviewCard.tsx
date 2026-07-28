import { Link2 } from '@glacier/icons';
import type { ComponentProps, ReactNode } from 'react';
import { LINK_PREVIEW_IMAGE_ASPECT, linkPreviewDomain } from '@glacier/logic';
import type { linkPreviewLayouts } from '@glacier/spec';
import { cx } from '../../internal/cx.ts';
import { Image } from '../../atoms/display/Image/Image.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import styles from './Attachments.module.css';

/** Derived from the spec so the layout union cannot drift. */
export type LinkPreviewLayout = (typeof linkPreviewLayouts)[number];

/** Every string the card can speak. */
export interface LinkPreviewCardLabels {
  /** Names the card when there is no title. */
  link: string;
}

const DEFAULT_LABELS: LinkPreviewCardLabels = { link: 'Link' };

export interface LinkPreviewCardProps extends Omit<ComponentProps<'a'>, 'href' | 'title'> {
  /** Where the card goes, and what the domain line is derived from. */
  url: string;
  title?: ReactNode;
  description?: ReactNode;
  /** og:image URL. Omitted, the card drops to the compact layout. */
  image?: string;
  /** Overrides the layout the presence of an image would pick. */
  layout?: LinkPreviewLayout;
  /** Called when the card is activated, alongside following the href. */
  onOpen?: () => void;
  /** Renders a placeholder while the unfurl is being fetched. */
  skeleton?: boolean;
  /** Overrides the spoken strings; merged over the English defaults. */
  labels?: Partial<LinkPreviewCardLabels>;
}

/**
 * The unfurled preview of a link.
 *
 * The no-image case is the one that decides the design. Reserving the media box
 * anyway leaves a grey slab where the picture was meant to be — a hole that
 * reads as a broken card rather than as a card without a picture — so the
 * layout switches instead: a leading link glyph beside the text, no box at all.
 * The picture is a bonus, not the frame.
 *
 * It is one link, not a stack of them. The title, the image, and the domain go
 * to the same place, and three tab stops to one destination is three times the
 * work for anyone moving by keyboard.
 */
export function LinkPreviewCard({
  url,
  title,
  description,
  image,
  layout,
  onOpen,
  skeleton = false,
  labels,
  className,
  ...rest
}: LinkPreviewCardProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const domain = linkPreviewDomain(url);
  const resolved: LinkPreviewLayout = layout ?? (image ? 'media' : 'compact');

  if (skeleton) {
    return (
      <div className={cx(styles.link, className)} data-layout={resolved} aria-hidden="true">
        {resolved === 'media' && (
          <Skeleton
            variant="rect"
            width="100%"
            height="auto"
            style={{ aspectRatio: String(LINK_PREVIEW_IMAGE_ASPECT) }}
          />
        )}
        <div className={styles.linkBody}>
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="30%" />
        </div>
      </div>
    );
  }

  return (
    <a
      className={cx(styles.link, className)}
      href={url}
      data-layout={resolved}
      // The destination, not "link": the title says what it is and the domain
      // says who published it, which together are what a reader decides on.
      aria-label={`${typeof title === 'string' && title !== '' ? title : text.link}, ${domain}`}
      onClick={onOpen}
      {...rest}
    >
      {resolved === 'media' && image != null && (
        // Decorative: it illustrates a page the title already names, so alt
        // text here would announce the same thing twice.
        <Image
          className={styles.linkMedia}
          src={image}
          alt=""
          aspectRatio={LINK_PREVIEW_IMAGE_ASPECT}
          fit="cover"
          radius="none"
        />
      )}
      {resolved === 'compact' && (
        <span className={styles.linkGlyph} aria-hidden="true">
          <Link2 size={16} />
        </span>
      )}
      <span className={styles.linkBody}>
        {title != null && <span className={styles.linkTitle}>{title}</span>}
        {description != null && <span className={styles.linkDescription}>{description}</span>}
        {/* Publisher-supplied text can say anything; the domain is the reader's
            only check on a title that lies, so it is never optional. */}
        <span className={styles.linkDomain}>{domain}</span>
      </span>
    </a>
  );
}
