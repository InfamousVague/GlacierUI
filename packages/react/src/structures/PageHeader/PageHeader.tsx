import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { defineMessages, useT } from '../../i18n/index.ts';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import { IconButton } from '../../atoms/inputs/Button/IconButton.tsx';
import { Menu, MenuItem } from '../../organisms/Menu/Menu.tsx';
import styles from './PageHeader.module.css';

const messages = defineMessages({
  moreActions: {
    en: 'More actions', es: 'Más acciones', fr: "Plus d'actions",
    de: 'Weitere Aktionen', ja: 'その他の操作', pt: 'Mais ações',
    zh: '更多操作', ar: 'المزيد من الإجراءات',
  },
});

const ellipsisIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <circle cx="3.25" cy="8" r="1.25" />
    <circle cx="8" cy="8" r="1.25" />
    <circle cx="12.75" cy="8" r="1.25" />
  </svg>
);

/** One row of the overflow menu behind the ellipsis button. */
export interface PageHeaderAction {
  /** Stable identity for the row. */
  id: string;
  /** The row's label. */
  label: ReactNode;
  /** Called when the row is chosen; the menu then closes. */
  onSelect?: () => void;
  /** Dims the row and ignores selection. */
  disabled?: boolean;
}

export interface PageHeaderProps extends Omit<ComponentProps<'header'>, 'title'> {
  /** The page title, rendered as an h1 or h2 per headingLevel. */
  title: ReactNode;
  /** Muted supporting copy under the title. */
  description?: ReactNode;
  /** Slot above the title; compose the kit Breadcrumbs. */
  breadcrumbs?: ReactNode;
  /** Inline metadata row under the title and description: pills, status dots, counts. */
  meta?: ReactNode;
  /** Primary actions, end-aligned on wide layouts. */
  actions?: ReactNode;
  /**
   * Secondary actions collected into an overflow Menu behind a localized
   * ellipsis button. The button is omitted entirely when the list is empty.
   */
  secondaryActions?: PageHeaderAction[];
  /** The heading element used for the title. */
  headingLevel?: 1 | 2;
  /** Compact trims the vertical padding and stack gap for dense screens. */
  density?: 'comfortable' | 'compact';
  /** Renders a placeholder with the header's exact geometry. */
  skeleton?: boolean;
}

/**
 * The page masthead: breadcrumbs over an h1/h2 title with a muted description
 * and an inline metadata row, primary actions end-aligned, and an overflow
 * menu of secondary actions behind an ellipsis button. The title block and
 * the actions share one wrapping flex row, so on narrow widths the actions
 * drop below the title without overlap and without any JS measurement.
 */
export function PageHeader({
  title,
  description,
  breadcrumbs,
  meta,
  actions,
  secondaryActions,
  headingLevel = 1,
  density = 'comfortable',
  skeleton = false,
  className,
  ...rest
}: PageHeaderProps) {
  const t = useT();
  const overflow = secondaryActions ?? [];
  const hasOverflow = overflow.length > 0;
  // One presence predicate shared by the skeleton and live branches, so the
  // placeholder mirrors exactly what will render: falsy-but-defined slots
  // (null, '', or a `cond && <X/>` that yields false) count as absent in both.
  const has = (slot: ReactNode) => Boolean(slot);
  const hasActions = has(actions);

  if (skeleton) {
    // Mirror the provided slots with Skeleton lines in the same containers,
    // so the placeholder keeps the live header's exact geometry and nothing
    // shifts when content arrives. Decorative, so aria-hidden.
    return (
      <header
        aria-hidden="true"
        className={cx(styles.header, className)}
        data-density={density}
        {...rest}
      >
        {has(breadcrumbs) && (
          <div className={styles.breadcrumbs}>
            <Skeleton variant="text" width="10rem" />
          </div>
        )}
        <div className={styles.row}>
          <div className={styles.titleBlock}>
            <div className={styles.title}>
              <Skeleton variant="text" width="12rem" />
            </div>
            {has(description) && (
              <div className={styles.description}>
                <Skeleton variant="text" width="18rem" />
              </div>
            )}
            {has(meta) && (
              <div className={styles.meta}>
                <Skeleton variant="text" width="8rem" />
              </div>
            )}
          </div>
          {(hasActions || hasOverflow) && (
            <div className={styles.actions}>
              <Skeleton
                width="6rem"
                height="var(--glacier-control-height-md)"
                radius="var(--glacier-control-radius)"
              />
            </div>
          )}
        </div>
      </header>
    );
  }

  const TitleTag = headingLevel === 1 ? ('h1' as const) : ('h2' as const);

  return (
    <header
      className={cx(styles.header, className)}
      data-density={density}
      {...rest}
    >
      {breadcrumbs && <div className={styles.breadcrumbs}>{breadcrumbs}</div>}
      <div className={styles.row}>
        <div className={styles.titleBlock}>
          <TitleTag className={styles.title}>{title}</TitleTag>
          {description && <div className={styles.description}>{description}</div>}
          {meta && <div className={styles.meta}>{meta}</div>}
        </div>
        {(hasActions || hasOverflow) && (
          <div className={styles.actions}>
            {actions}
            {hasOverflow && (
              <Menu
                aria-label={t(messages.moreActions)}
                placement="bottom-end"
                trigger={<IconButton aria-label={t(messages.moreActions)}>{ellipsisIcon}</IconButton>}
              >
                {overflow.map((action) => (
                  <MenuItem key={action.id} disabled={action.disabled} onSelect={action.onSelect}>
                    {action.label}
                  </MenuItem>
                ))}
              </Menu>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
