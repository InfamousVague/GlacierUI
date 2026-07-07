import { useState, type ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './Avatar.module.css';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type AvatarShape = 'circle' | 'rounded';

/** Diameter per size, mirroring the .sm/.md/.lg/.xl rules in the CSS. */
const SIZE_REM: Record<AvatarSize, string> = {
  sm: '1.75rem',
  md: '2.25rem',
  lg: '3rem',
  xl: '4rem',
};

export interface AvatarProps extends Omit<ComponentProps<'span'>, 'children'> {
  src?: string;
  alt?: string;
  /** Falls back to initials of up to two words when there is no image. */
  name?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
}

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase();
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  skeleton = false,
  className,
  ...rest
}: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const sizeRem = SIZE_REM[size];

  if (skeleton) {
    return (
      <Skeleton
        variant={shape === 'circle' ? 'circle' : 'rect'}
        width={sizeRem}
        height={sizeRem}
        radius={shape === 'rounded' ? 'var(--perfect-radius-md)' : undefined}
        className={className}
      />
    );
  }

  const rootClass = cx(styles.avatar, styles[size], styles[shape], className);
  const showImage = Boolean(src) && !errored;

  if (showImage) {
    return (
      <span className={rootClass} {...rest}>
        <img
          className={styles.image}
          src={src}
          alt={alt ?? name ?? ''}
          onError={() => setErrored(true)}
        />
      </span>
    );
  }

  const initials = name ? initialsOf(name) : '';

  if (initials) {
    return (
      <span className={cx(rootClass, styles.initials)} {...rest}>
        <span aria-label={name}>{initials}</span>
      </span>
    );
  }

  return <span className={cx(rootClass, styles.placeholder)} aria-hidden="true" {...rest} />;
}
