// ImageAttachment — the native binding of @glacier/react's ImageAttachment.
//
// A photo sent in a message, in a box that is reserved from the attachment's
// intrinsic size before the bytes arrive. The clamp that decides how tall a
// photo may get lives in @glacier/logic (`attachmentAspect`), the same
// function the DOM kit calls, so a screenshot crops to the same frame on both
// platforms rather than to two independent guesses.
//
// Resting visuals only: the web cross-fades the image over the placeholder as
// it decodes; there is no animation runtime here, so the loaded image simply
// replaces it.

import type { ReactNode } from 'react';
import { View, Pressable, type ViewProps } from 'react-native';
import type { ChatAttachment } from '@glacier/logic';
import { attachmentAspect, attachmentLabel } from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once the spec is registered.
import {
  imageAttachmentSpec,
  imageAttachmentRadii,
} from '../../../../spec/src/components/image-attachment.ts';
import { t } from '../../tokens.ts';
import { dimensionsFor, paintFor } from '../../resolve.ts';
import { Image } from '../../atoms/display/Image.tsx';

// Derived from the spec so the radius union cannot drift from the web kit.
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

export interface ImageAttachmentProps extends Omit<ViewProps, 'children' | 'style'> {
  attachment: ChatAttachment;
  /** What the sender said the picture is. */
  alt?: string;
  /** A blurhash or dominant-colour stand-in painted under the image. */
  placeholder?: ReactNode;
  /** The bytes are still on their way; the box is already at its final size. */
  loading?: boolean;
  /** Fills the parent box instead of reserving its own. How a grid tile places it. */
  fill?: boolean;
  radius?: ImageAttachmentRadius;
  /** Caps the frame width. */
  maxWidth?: number | string;
  /** Opens the photo full size. Given, the whole frame becomes one button. */
  onOpen?: () => void;
  /** Overrides the spoken strings; merged over the English defaults. */
  labels?: Partial<ImageAttachmentLabels>;
}

// The frame's rest fill and its default radius, read from the spec so they
// cannot drift from Attachments.module.css.
const BOX = dimensionsFor(imageAttachmentSpec);
const FRAME_BG = t((imageAttachmentSpec.paint?.background ?? '$surface-sunken').replace(/^\$/, ''));
const LOADING_BG = t(paintFor(imageAttachmentSpec, 'states', 'loading').background ?? 'surface-sunken');

/** Interpolates `{name}` placeholders, matching the kit catalog's `format`. */
function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in params ? String(params[key]) : whole,
  );
}

export function ImageAttachment({
  attachment,
  alt,
  placeholder,
  loading = false,
  fill: fillParent = false,
  radius = 'lg',
  maxWidth,
  onOpen,
  labels,
  ...rest
}: ImageAttachmentProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  // The web also marks a cropped frame with data-clamped for apps that offer
  // "see the whole thing"; there is no attribute channel here, so only the
  // ratio is read and an app asks `attachmentAspect` itself if it needs the flag.
  const { ratio } = attachmentAspect(attachment.width, attachment.height);
  const name = attachmentLabel(attachment, text.image, alt);

  const frame = {
    overflow: 'hidden' as const,
    backgroundColor: loading ? LOADING_BG : FRAME_BG,
    borderRadius: radius === 'none' ? 0 : t(`radius-${radius}`),
    // In fill mode the tile owns the box, so claiming a ratio here would fight
    // it; otherwise the ratio IS the reservation.
    ...(fillParent
      ? { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 }
      : { position: 'relative' as const, width: '100%' as const, aspectRatio: ratio, maxWidth }),
  };

  const body = (
    <>
      {placeholder != null && (
        // Decorative by definition: a low-fidelity copy of the image beside it,
        // which is already named.
        <View
          aria-hidden={true}
          pointerEvents="none"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {placeholder}
        </View>
      )}
      <Image
        src={attachment.url ?? ''}
        // Inside a trigger the button already carries the name; repeating it on
        // the image would announce the same photo twice.
        alt={onOpen ? '' : name}
        fit="cover"
        radius="none"
        skeleton={loading}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, height: '100%' }}
      />
    </>
  );

  if (onOpen) {
    return (
      <Pressable
        {...rest}
        accessibilityRole="button"
        aria-label={interpolate(text.open, { name })}
        onPress={onOpen}
        style={frame}
      >
        {body}
      </Pressable>
    );
  }

  // No trigger: the <Image> inside carries the name, so the frame stays a plain
  // box rather than announcing the same photo a second time.
  return (
    <View {...rest} style={frame}>
      {body}
    </View>
  );
}
