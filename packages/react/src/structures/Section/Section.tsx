import { useId, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Heading } from '../../atoms/display/Typography/Heading.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import styles from './Section.module.css';

export type SectionGap = 'sm' | 'md' | 'lg';
export type SectionDensity = 'comfortable' | 'compact';
export type SectionHeadingLevel = 2 | 3;

export interface SectionProps extends Omit<ComponentProps<'section'>, 'title'> {
  /** Section heading; when present its generated id labels the section through aria-labelledby. */
  title?: ReactNode;
  /** Muted supporting line under the title. */
  description?: ReactNode;
  /** End-aligned content on the heading row, such as actions. */
  actions?: ReactNode;
  /** Semantic heading level for the title. */
  headingLevel?: SectionHeadingLevel;
  /** Vertical rhythm between the header block and the content. */
  gap?: SectionGap;
  /** Draw a hairline top rule so stacked sections separate cleanly. */
  divider?: boolean;
  /** Section rhythm; compact trims every gap one step down the scale. */
  density?: SectionDensity;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** The section content. */
  children?: ReactNode;
}

/**
 * A titled page region: a heading row with an optional description and
 * end-aligned actions, a token-driven rhythm gap before the content, and an
 * optional hairline divider for stacking sections down a page. With a title
 * the section is a labelled landmark region; without one it renders a plain
 * section, so pass aria-label when an untitled section should still be a
 * named region.
 */
export function Section({
  title,
  description,
  actions,
  headingLevel = 2,
  gap = 'md',
  divider = false,
  density = 'comfortable',
  skeleton = false,
  className,
  children,
  ...rest
}: SectionProps) {
  const titleId = useId();
  const hasHeader = Boolean(title || description || actions);

  if (skeleton) {
    // Mirror only the provided slots so the placeholder keeps the live
    // section's exact geometry and nothing shifts when content arrives.
    return (
      <section
        aria-hidden="true"
        className={cx(styles.section, className)}
        data-gap={gap}
        data-density={density}
        data-divider={divider || undefined}
        {...rest}
      >
        {hasHeader && (
          <div className={styles.header}>
            {(title || description) && (
              <div className={styles.headerText}>
                {title && <Heading level={headingLevel} noMargin skeleton />}
                {description && (
                  <div className={styles.description}>
                    <Skeleton variant="text" width="18rem" />
                  </div>
                )}
              </div>
            )}
            {actions && (
              <div className={styles.actions}>
                <Skeleton
                  width="6rem"
                  height="var(--glacier-control-height-md)"
                  radius="var(--glacier-control-radius)"
                />
              </div>
            )}
          </div>
        )}
        <div className={cx(styles.content, styles.skeletonLines)}>
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="92%" />
          <Skeleton variant="text" width="61%" />
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      className={cx(styles.section, className)}
      data-gap={gap}
      data-density={density}
      data-divider={divider || undefined}
      {...rest}
    >
      {hasHeader && (
        <div className={styles.header}>
          {(title || description) && (
            <div className={styles.headerText}>
              {title && (
                <Heading id={titleId} level={headingLevel} noMargin>
                  {title}
                </Heading>
              )}
              {description && <div className={styles.description}>{description}</div>}
            </div>
          )}
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      <div className={styles.content}>{children}</div>
    </section>
  );
}
