import type { ChatAttachment } from '@glacier/logic';
import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import { attachmentAspect, attachmentLabel } from '@glacier/logic';
import type { imageAttachmentRadii } from '@glacier/spec';
import { cx } from '../../internal/cx.ts';
import { format } from '../../i18n/locale.ts';
import { Image } from '../../atoms/display/Image/Image.tsx';
import styles from './Attachments.module.css';

/** Derived from the spec so the radius union cannot drift. */
export type ImageAttachmentRadius = (typeof imageAttachmentRadii)[number];

/** Every string the frame can speak, so a photo is announced in any language. */
export interface ImageAttachmentLabels {
  /** Spoken when there is neither alt text nor a file name. */
  image: string;
  /** The open action, with a `{name}` slot. */
  open: string;
}

const DEFAULT_LABELS: ImageAttachmentLabels = {
  image: 'Photo',
  open: 'Open {name}',
};

export interface ImageAttachmentProps
  extends Omit<ComponentProps<'div'>, 'children' | 'onClick' | 'placeholder'> {
  /** The attachment being rendered; its width and height reserve the box. */
  attachment: ChatAttachment;
  /** What the sender said the picture is. */
  alt?: string;
  /**
   * A blurhash, thumbhash, or dominant-colour stand-in painted under the image
   * while it decodes. Any node — the kit deliberately does not decode hashes,
   * because every app already has the decoder its backend emits for.
   */
  placeholder?: ReactNode;
  /** The bytes are still on their way; the box is already at its final size. */
  loading?: boolean;
  /** Fills the parent box instead of reserving its own. How a grid tile places it. */
  fill?: boolean;
  radius?: ImageAttachmentRadius;
  /** Caps the frame width, e.g. a bubble's content width. */
  maxWidth?: string | number;
  /** Opens the photo full size. Given, the whole frame becomes one button. */
  onOpen?: () => void;
  /** Overrides the spoken strings; merged over the English defaults. */
  labels?: Partial<ImageAttachmentLabels>;
}

/**
 * A photo sent in a message.
 *
 * The one thing it must never do is move: the frame's aspect ratio is computed
 * from the attachment's intrinsic size and applied to an empty box, so the
 * space the picture will occupy is already occupied before the first byte
 * arrives. Everything else — the placeholder, the fade, the crop — happens
 * inside a box whose geometry is already final.
 *
 * The ratio is clamped (see `attachmentAspect`): a 9:16 screenshot that renders
 * at its true ratio is half a screen of one message, so a very tall or very wide
 * picture crops to a readable frame and marks itself `data-clamped` for an app
 * that wants to offer "see the whole thing".
 */
export function ImageAttachment({
  attachment,
  alt,
  placeholder,
  loading = false,
  fill = false,
  radius = 'lg',
  maxWidth,
  onOpen,
  labels,
  className,
  style,
  ...rest
}: ImageAttachmentProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const { ratio, clamped } = attachmentAspect(attachment.width, attachment.height);
  const name = attachmentLabel(attachment, text.image, alt);

  const frameStyle: CSSProperties = {
    // In fill mode the tile owns the box, so claiming a ratio here would fight it.
    aspectRatio: fill ? undefined : String(ratio),
    maxWidth,
    ...style,
  };

  const picture = (
    <Image
      className={styles.image}
      src={attachment.url ?? ''}
      // Inside a trigger the button already carries the name; repeating it on
      // the image would announce the same photo twice.
      alt={onOpen ? '' : name}
      fit="cover"
      radius="none"
      skeleton={loading}
    />
  );

  const body = (
    <>
      {placeholder != null && (
        // Decorative by definition: it is a low-fidelity copy of the image
        // beside it, which is already named.
        <span className={styles.placeholder} aria-hidden="true">
          {placeholder}
        </span>
      )}
      {picture}
    </>
  );

  const frameClass = cx(
    styles.frame,
    styles[`radius-${radius}`],
    fill && styles.fill,
    placeholder != null && styles.hasPlaceholder,
    className,
  );

  if (onOpen) {
    return (
      <button
        type="button"
        className={cx(frameClass, styles.trigger)}
        style={frameStyle}
        data-clamped={clamped || undefined}
        data-loading={loading || undefined}
        aria-label={format(text.open, { name })}
        onClick={onOpen}
        {...(rest as ComponentProps<'button'>)}
      >
        {body}
      </button>
    );
  }

  return (
    <div
      className={frameClass}
      style={frameStyle}
      data-clamped={clamped || undefined}
      data-loading={loading || undefined}
      {...rest}
    >
      {body}
    </div>
  );
}
