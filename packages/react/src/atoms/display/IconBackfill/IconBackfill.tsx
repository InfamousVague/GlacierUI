import { cloneElement, type ComponentProps, type ReactElement, type SVGProps } from 'react';
import { cx } from '../../../internal/cx.ts';
import styles from './IconBackfill.module.css';

type IconElement = ReactElement<SVGProps<SVGSVGElement> & { color?: string; size?: number | string; 'data-icon-backfill'?: boolean }>;

export interface IconBackfillProps extends ComponentProps<'span'> {
  /** One outline icon. Its explicit color is reused for the backfill. */
  children: IconElement;
  /** Overrides the glyph and backfill color. Defaults to the icon's color, then currentColor. */
  color?: string;
  /** Glyph size used to scale the surrounding backfill inset. Defaults to the child's size. */
  size?: number | string;
}

/**
 * Stacks a filled, soft-stroked copy of the glyph behind its outline at 33%
 * opacity. The backing follows the icon's silhouette and shares its resolved
 * color, including inherited text colors and explicit custom colors.
 */
export function IconBackfill({ children, color, size, className, style, ...rest }: IconBackfillProps) {
  const resolvedColor = color ?? children.props.color;
  const resolvedSize = size ?? children.props.size;
  const glyph = resolvedColor ? cloneElement(children, { color: resolvedColor }) : children;
  const backfill = cloneElement(children, {
    'aria-hidden': true,
    'data-icon-backfill': true,
    className: styles.backfill,
    color: resolvedColor,
    fill: 'currentColor',
    stroke: 'currentColor',
    strokeWidth: 4,
  });

  return (
    <span
      {...rest}
      className={cx(styles.root, className)}
      style={{ color: resolvedColor, fontSize: resolvedSize, ...style }}
    >
      {backfill}
      {glyph}
    </span>
  );
}