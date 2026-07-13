import { useState } from 'react';
import { View, Text, Image, type ViewProps } from 'react-native';
import { avatarSpec, avatarSizes, avatarShapes } from '@glacier/spec';
import { t } from './tokens.ts';
import { paintStyle, sizeFor, dimensionsFor } from './resolve.ts';

// Derived from the spec so the size and shape unions cannot drift from the web kit.
export type AvatarSize = (typeof avatarSizes)[number];
export type AvatarShape = (typeof avatarShapes)[number];

export interface AvatarProps extends Omit<ViewProps, 'style' | 'children'> {
  src?: string;
  alt?: string;
  /** Falls back to initials of up to two words when there is no image. */
  name?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
}

// Size-independent box metrics (radius) read once from the spec.
const BOX = dimensionsFor(avatarSpec);

/** Up to two uppercased word-initials, matching the web component. */
function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase();
}

/**
 * The Glacier Avatar, rendered with React Native primitives. Geometry (diameter,
 * font size, radius) and paint (the image / initials / placeholder fills) are
 * read from the avatar spec through the shared resolvers, so it is visually
 * identical to @glacier/react's Avatar and cannot drift from it. An <Image> is
 * shown when `src` is set and has not errored, otherwise up-to-two initials of
 * `name` on the accent-soft fill, otherwise a blank sunken placeholder.
 */
export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  skeleton = false,
  glass = false,
  ...rest
}: AvatarProps) {
  const [errored, setErrored] = useState(false);

  const dims = sizeFor(avatarSpec, size);
  const diameter = t(dims.diameter ?? 'size-2xl');
  // circle uses the spec's radius-full; a rounded square uses radius-md.
  const borderRadius = shape === 'circle' ? t(BOX.radius ?? 'radius-full') : t('radius-md');

  const box = {
    width: diameter,
    height: diameter,
    borderRadius,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    overflow: 'hidden' as const,
  };

  if (skeleton) {
    // Resting placeholder at the exact geometry; the web shimmer is a device
    // follow-up (no animation runtime here).
    const skeletonPaint = paintStyle(avatarSpec, 'states', 'placeholder');
    return <View style={[box, skeletonPaint]} {...rest} />;
  }

  const showImage = Boolean(src) && !errored;

  if (showImage) {
    // The sunken base shows through while the image loads (object-fit cover).
    const imagePaint = paintStyle(avatarSpec, 'states', 'image');
    return (
      <View style={[box, imagePaint]} {...rest}>
        <Image
          source={{ uri: src }}
          accessibilityLabel={alt ?? name ?? ''}
          resizeMode="cover"
          onError={() => setErrored(true)}
          style={{ width: '100%', height: '100%' }}
        />
      </View>
    );
  }

  const initials = name ? initialsOf(name) : '';

  if (initials) {
    const initialsPaint = paintStyle(avatarSpec, 'states', 'initials');
    const glassPaint = glass
      ? { backgroundColor: t('glass-regular'), color: t('text') }
      : null;
    return (
      <View
        accessibilityLabel={name}
        style={[box, initialsPaint, glassPaint]}
        {...rest}
      >
        <Text
          style={{
            color: (glassPaint?.color as string) ?? (initialsPaint.color as string) ?? t('text'),
            fontSize: t(dims.fontSize ?? 'font-size-sm'),
            fontFamily: t('font-sans'),
            fontWeight: t('font-weight-semibold') as never,
          }}
        >
          {initials}
        </Text>
      </View>
    );
  }

  // Neither image nor name: a blank sunken placeholder.
  const placeholderPaint = paintStyle(avatarSpec, 'states', 'placeholder');
  const glassPaint = glass ? { backgroundColor: t('glass-regular') } : null;
  return <View style={[box, placeholderPaint, glassPaint]} {...rest} />;
}
