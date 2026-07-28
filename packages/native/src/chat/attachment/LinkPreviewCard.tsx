// LinkPreviewCard — the native binding of @glacier/react's LinkPreviewCard.
//
// The unfurled preview of a link. The domain shown under the title is derived
// by `linkPreviewDomain` in @glacier/logic (regex-parsed rather than through
// `URL`, which Hermes has not always fully shipped), so both platforms credit
// the same publisher for the same href — including the awkward ones with
// credentials or a port in the authority.
//
// Resting visuals only: the web cross-fades the surface and title on hover;
// there is no hover on a touch device and no animation runtime here.

import type { ReactNode } from 'react';
import { View, Text, Pressable, type ViewProps } from 'react-native';
import { Link2 } from '@glacier/icons';
import { LINK_PREVIEW_IMAGE_ASPECT, linkPreviewDomain } from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once the spec is registered.
import { linkPreviewCardSpec, linkPreviewLayouts } from '../../../../spec/src/components/link-preview-card.ts';
import { t } from '../../tokens.ts';
import { dimensionsFor } from '../../resolve.ts';
import { Image } from '../../atoms/display/Image.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton.tsx';

// Derived from the spec so the layout union cannot drift from the web kit.
export type LinkPreviewLayout = (typeof linkPreviewLayouts)[number];

/** Every string the card can speak. */
export interface LinkPreviewCardLabels {
  /** Names the card when there is no title. */
  link: string;
}

const DEFAULT_LABELS: LinkPreviewCardLabels = { link: 'Link' };

export interface LinkPreviewCardProps extends Omit<ViewProps, 'children' | 'style'> {
  /** Where the card goes, and what the domain line is derived from. */
  url: string;
  title?: ReactNode;
  description?: ReactNode;
  /** og:image URL. Omitted, the card drops to the compact layout. */
  image?: string;
  layout?: LinkPreviewLayout;
  /**
   * Called when the card is activated. On the web the card is a real anchor and
   * this rides alongside the navigation; natively it is the only channel, so a
   * device build opens the url from here (Linking.openURL).
   */
  onOpen?: () => void;
  skeleton?: boolean;
  labels?: Partial<LinkPreviewCardLabels>;
}

// Size-independent metrics and the rest paint, read once from the spec.
const BOX = dimensionsFor(linkPreviewCardSpec);
const bare = (ref: string | undefined, fallback: string): string => t((ref ?? fallback).replace(/^\$/, ''));
const CARD_BG = bare(linkPreviewCardSpec.paint?.background, '$surface-sunken');
const CARD_BORDER = bare(linkPreviewCardSpec.paint?.border, '$border-subtle');

export function LinkPreviewCard({
  url,
  title,
  description,
  image,
  layout,
  onOpen,
  skeleton = false,
  labels,
  ...rest
}: LinkPreviewCardProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const domain = linkPreviewDomain(url);
  const resolved: LinkPreviewLayout = layout ?? (image ? 'media' : 'compact');
  const padding = t(BOX.padding ?? 'space-3');

  const card = {
    width: '100%' as const,
    overflow: 'hidden' as const,
    borderRadius: t(BOX.radius ?? 'radius-lg'),
    borderWidth: t(BOX.border ?? 'hairline'),
    borderStyle: 'solid' as const,
    backgroundColor: CARD_BG,
    borderColor: CARD_BORDER,
    ...(resolved === 'media'
      ? { flexDirection: 'column' as const }
      : { flexDirection: 'row' as const, alignItems: 'flex-start' as const, gap: padding, padding }),
  };

  const body = {
    flex: 1,
    minWidth: 0,
    gap: t(BOX.gap ?? 'space-1'),
    ...(resolved === 'media' ? { padding } : null),
  };

  if (skeleton) {
    return (
      <View {...rest} aria-hidden={true} style={card}>
        {resolved === 'media' && (
          <View style={{ width: '100%', aspectRatio: LINK_PREVIEW_IMAGE_ASPECT }}>
            <Skeleton width="100%" height="100%" />
          </View>
        )}
        <View style={body}>
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="30%" />
        </View>
      </View>
    );
  }

  return (
    <Pressable
      {...rest}
      // One target, not three: the title, the image, and the domain go to the
      // same place, and three stops to one destination is three times the work.
      accessibilityRole="link"
      aria-label={`${typeof title === 'string' && title !== '' ? title : text.link}, ${domain}`}
      onPress={onOpen}
      style={card}
    >
      {resolved === 'media' && image != null && (
        // Decorative: it illustrates a page the title already names, so alt
        // text here would announce the same thing twice.
        <Image src={image} alt="" aspectRatio={LINK_PREVIEW_IMAGE_ASPECT} fit="cover" radius="none" />
      )}
      {resolved === 'compact' && (
        // The glyph is what keeps a card with no image from reading as an empty
        // box: the shape says "link" where the picture would have left a hole.
        <View aria-hidden={true} style={{ width: t('size-lg'), height: t('size-lg'), alignItems: 'center', justifyContent: 'center' }}>
          <Link2 size={16} color={t('text-subtle')} />
        </View>
      )}
      <View style={body}>
        {title != null && (
          <Text
            numberOfLines={2}
            style={{
              color: t('text'),
              fontFamily: t('font-sans'),
              fontSize: t('font-size-sm') as never,
              fontWeight: t('font-weight-semibold') as never,
            }}
          >
            {title}
          </Text>
        )}
        {description != null && (
          <Text
            numberOfLines={2}
            style={{ color: t('text-muted'), fontFamily: t('font-sans'), fontSize: t('font-size-xs') as never }}
          >
            {description}
          </Text>
        )}
        {/* Publisher-supplied text can say anything; the domain is the reader's
            only check on a title that lies, so it is never optional. */}
        <Text
          numberOfLines={1}
          style={{ color: t('text-subtle'), fontFamily: t('font-sans'), fontSize: t('font-size-xs') as never }}
        >
          {domain}
        </Text>
      </View>
    </Pressable>
  );
}
