import { useState, type ReactNode } from 'react';
import { View, Image as RNImage, type ViewProps } from 'react-native';
import { Svg, Rect, Path } from 'react-native-svg';
import { imageSpec, imageFits, imageRadii } from '@glacier/spec';
import { t } from './tokens.ts';
import { Skeleton } from './Skeleton.tsx';

// Derived from the spec so the fit and radius unions cannot drift from the web kit.
export type ImageFit = (typeof imageFits)[number];
export type ImageRadius = (typeof imageRadii)[number];

export interface ImageProps extends Omit<ViewProps, 'style' | 'children'> {
  src: string;
  /** Required for a11y; pass an empty string for a purely decorative image. */
  alt: string;
  /** Aspect ratio of the frame, e.g. `'2 / 3'` for a book cover or `1` for a square. */
  aspectRatio?: string | number;
  /** How the image fills its frame. */
  fit?: ImageFit;
  /** Corner radius, from the radius scale. */
  radius?: ImageRadius;
  /** Rendered when the image fails to load. Defaults to a muted broken-image glyph. */
  fallback?: ReactNode;
  /** Renders a placeholder with the frame's geometry. */
  skeleton?: boolean;
  /**
   * Native lazy/eager loading hint. DOM-only; accepted for prop parity with the
   * web kit but a no-op here (React Native's <Image> has no lazy attribute).
   */
  loading?: 'lazy' | 'eager';
}

// The frame's rest fill, read from the spec's top-level paint so it stays
// identical to Image.module.css (`background: var(--glacier-surface-sunken)`).
const FRAME_BG = t((imageSpec.paint?.background ?? '$surface-sunken').replace(/^\$/, ''));

// object-fit -> react-native resizeMode. cover/contain/fill map exactly; RN has
// no `none`/`scale-down`, so they take the nearest resting equivalent (center =
// unscaled, contain = fit-without-upscale-ish). On react-native-web these render
// to the matching object-fit box.
const RESIZE_MODE: Record<ImageFit, 'cover' | 'contain' | 'stretch' | 'center'> = {
  cover: 'cover',
  contain: 'contain',
  fill: 'stretch',
  none: 'center',
  'scale-down': 'contain',
};

/** The default broken-image glyph, matching the web BrokenGlyph SVG (text-subtle stroke). */
const BrokenGlyph = (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke={t('text-subtle')}
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden={true}
  >
    <Rect x={3} y={3} width={18} height={18} rx={2} />
    <Path d="m21 15-4-4-4 4M3 16l4-4 3 3" />
    <Path d="m2 2 20 20" />
  </Svg>
);

/**
 * The Glacier Image, rendered with React Native primitives. The frame (aspect
 * ratio, corner radius, sunken fill) and the fit are read from the image spec —
 * background from the spec's top-level paint, radius from the shared radius
 * scale — so it matches @glacier/react's Image and cannot drift from it. An
 * <Image> holds the box while it loads (a Skeleton overlay stands in), fits the
 * source with resizeMode, and swaps in a fallback glyph on error.
 *
 * Resting visuals only: the web fades the image in on decode (opacity
 * transition) — here the loaded image is shown at full opacity with no
 * animation runtime. The `loading` hint is DOM-only and a no-op.
 */
export function Image({
  src,
  alt,
  aspectRatio,
  fit = 'cover',
  radius = 'md',
  fallback,
  skeleton = false,
  loading: _loading = 'lazy',
  ...rest
}: ImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  const frame = {
    position: 'relative' as const,
    width: '100%' as const,
    overflow: 'hidden' as const,
    backgroundColor: FRAME_BG,
    borderRadius: t(`radius-${radius}`),
    ...(aspectRatio != null ? { aspectRatio } : null),
  };

  if (skeleton) {
    return (
      <View style={frame} {...rest}>
        <Skeleton width="100%" height="100%" />
      </View>
    );
  }

  const fill = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 };

  return (
    <View style={frame} {...rest}>
      {status !== 'error' && (
        <RNImage
          source={{ uri: src }}
          accessibilityRole="image"
          accessibilityLabel={alt}
          resizeMode={RESIZE_MODE[fit]}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          style={{ width: '100%', height: '100%' }}
        />
      )}
      {status === 'loading' && (
        <View style={fill}>
          <Skeleton width="100%" height="100%" />
        </View>
      )}
      {status === 'error' && (
        <View style={{ ...fill, alignItems: 'center', justifyContent: 'center', color: t('text-subtle') }}>
          {fallback ?? BrokenGlyph}
        </View>
      )}
    </View>
  );
}
