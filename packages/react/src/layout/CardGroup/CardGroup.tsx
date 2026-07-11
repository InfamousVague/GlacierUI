import { cardGroupDensities, cardGroupGaps, cardGroupModes } from '@glacier/spec';
import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import styles from './CardGroup.module.css';

// Derived from the spec so the unions cannot drift.
/** grid wraps cards on auto-fill columns; list stacks them in one column. */
export type CardGroupMode = (typeof cardGroupModes)[number];

/** The token-driven gap steps between cards. */
export type CardGroupGap = (typeof cardGroupGaps)[number];

/** compact tightens the chosen gap one space step. */
export type CardGroupDensity = (typeof cardGroupDensities)[number];

export interface CardGroupProps extends ComponentProps<'div'> {
  /**
   * Layout mode. grid lays cards on repeat(auto-fill, minmax(...)) columns
   * that keep a stable minimum width and wrap responsively; list stacks them
   * in a single column.
   */
  mode?: CardGroupMode;
  /**
   * The minimum card width in grid mode, e.g. '16rem'. Feeds the
   * --card-group-min custom property; ignored in list mode.
   */
  minItemWidth?: string;
  /** Space between cards, from the token scale. */
  gap?: CardGroupGap;
  /** compact tightens the chosen gap one space step. */
  density?: CardGroupDensity;
  /** Renders placeholder cards so the grid geometry holds while loading. */
  skeleton?: boolean;
  /** How many placeholder cards the skeleton renders. */
  skeletonCount?: number;
  /** The cards, or any repeated surfaces. */
  children?: ReactNode;
}

/**
 * A layout shelf for repeated surfaces such as Cards and StatTiles. In grid
 * mode it lays children on auto-fill columns floored at `minItemWidth` (and
 * clamped to the container, so a card never overflows a narrow parent); in
 * list mode it stacks them in a single column. Purely visual: it renders a
 * plain div with no role, so add list semantics on top when the content is
 * semantically a list.
 */
export function CardGroup({
  mode = 'grid',
  minItemWidth = '16rem',
  gap = 'md',
  density = 'comfortable',
  skeleton = false,
  skeletonCount = 6,
  className,
  style,
  children,
  ...rest
}: CardGroupProps) {
  const vars = { '--card-group-min': minItemWidth } as CSSProperties;
  const groupClass = cx(styles.group, mode === 'list' ? styles.list : styles.grid, className);

  if (skeleton) {
    // Placeholder cards fill the same tracks as the live children, so columns
    // and gaps do not shift when the real cards arrive.
    return (
      <div
        className={groupClass}
        data-gap={gap}
        data-density={density}
        style={{ ...vars, ...style }}
        aria-hidden
        {...rest}
      >
        {Array.from({ length: Math.max(1, skeletonCount) }, (_, i) => (
          <Skeleton
            key={i}
            variant="rect"
            width="100%"
            height="8rem"
            radius="var(--glacier-radius-xl)"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={groupClass}
      data-gap={gap}
      data-density={density}
      style={{ ...vars, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}
