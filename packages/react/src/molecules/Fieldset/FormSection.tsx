import { SkeletonVariant } from '@glacier/spec';
import { useId, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Divider } from '../../atoms/display/Divider/Divider.tsx';
import { Heading } from '../../atoms/display/Typography/Heading.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import styles from './Fieldset.module.css';

export interface FormSectionProps extends Omit<ComponentProps<'section'>, 'title'> {
  /** The section title, rendered as a Heading that labels the section. */
  title: ReactNode;
  /** Semantic heading level for the title. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Muted supporting line under the title. */
  description?: ReactNode;
  /** Right-aligned actions on the title row. */
  actions?: ReactNode;
  /** Draws a hairline divider above the section, for stacking sections. */
  divider?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  children?: ReactNode;
}

/**
 * A page-level grouping for settings and long forms: a titled, labelled
 * region whose content is often one or more Fieldsets.
 */
export function FormSection({
  title,
  level = 3,
  description,
  actions,
  divider = false,
  skeleton = false,
  className,
  children,
  ...rest
}: FormSectionProps) {
  const titleId = useId();

  if (skeleton) {
    return (
      <section {...rest} className={cx(styles.section, className)}>
        {divider && <Divider className={styles.divider} />}
        <div className={styles.header}>
          <div className={styles.headerText}>
            <Heading level={level} noMargin skeleton />
            {description && (
              <div className={styles.description}>
                <Skeleton variant={SkeletonVariant.Text} width="16rem" />
              </div>
            )}
          </div>
        </div>
        <div className={styles.sectionContent}>{children}</div>
      </section>
    );
  }

  return (
    <section {...rest} aria-labelledby={titleId} className={cx(styles.section, className)}>
      {divider && <Divider className={styles.divider} />}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <Heading id={titleId} level={level} noMargin>
            {title}
          </Heading>
          {description && <div className={styles.description}>{description}</div>}
        </div>
        {actions && <div className={styles.sectionActions}>{actions}</div>}
      </div>
      <div className={styles.sectionContent}>{children}</div>
    </section>
  );
}
