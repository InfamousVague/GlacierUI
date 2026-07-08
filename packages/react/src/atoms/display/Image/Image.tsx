import { useState, type ComponentProps, type CSSProperties, type ReactNode } from 'react';
import { cx } from '../../../internal/cx.ts';
import { Skeleton } from '../../feedback/Skeleton/Skeleton.tsx';
import styles from './Image.module.css';

export type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
export type ImageRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

const BrokenGlyph = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="m21 15-4-4-4 4M3 16l4-4 3 3" />
    <path d="m2 2 20 20" />
  </svg>
);

export interface ImageProps extends Omit<ComponentProps<'img'>, 'width' | 'height' | 'style'> {
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
  className?: string;
  style?: CSSProperties;
}

/**
 * A framed image with a fixed aspect ratio: it holds its box while the source
 * loads (showing a skeleton), fits the image with `object-fit`, rounds the
 * corners, and swaps in a fallback if the source fails. Built for content
 * imagery like cover art, thumbnails, and hero shots.
 */
export function Image({
  src,
  alt,
  aspectRatio,
  fit = 'cover',
  radius = 'md',
  fallback,
  skeleton = false,
  loading = 'lazy',
  className,
  style,
  ...rest
}: ImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const frameStyle: CSSProperties = {
    aspectRatio: aspectRatio != null ? String(aspectRatio) : undefined,
    ...style,
  };

  if (skeleton) {
    return (
      <div className={cx(styles.frame, styles[`radius-${radius}`], className)} style={frameStyle}>
        <Skeleton width="100%" height="100%" />
      </div>
    );
  }

  return (
    <div
      className={cx(styles.frame, styles[`radius-${radius}`], className)}
      style={frameStyle}
      data-status={status}
    >
      {status !== 'error' && (
        <img
          src={src}
          alt={alt}
          loading={loading}
          className={styles.img}
          style={{ objectFit: fit }}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          {...rest}
        />
      )}
      {status === 'loading' && <Skeleton className={styles.pending} />}
      {status === 'error' && (
        <span className={styles.fallback}>{fallback ?? BrokenGlyph}</span>
      )}
    </div>
  );
}
