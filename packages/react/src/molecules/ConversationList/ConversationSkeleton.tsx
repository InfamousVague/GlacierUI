import {
  type ConversationDensity,
} from '@glacier/logic';
import type { ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import { List } from '../List/List.tsx';
import { ConversationListItem } from './ConversationListItem.tsx';
import styles from './ConversationList.module.css';

export interface ConversationSkeletonProps extends Omit<ComponentProps<'ul'>, 'children'> {
  /**
   * How many placeholder rows to draw. Enough to fill a viewport, not to
   * predict the list: a screen of bones reads as loading, a thousand reads as
   * broken.
   */
  count?: number;
  /** Matches the density the real list will use, so the rows are the right height. */
  density?: ConversationDensity;
}

/**
 * The chat sidebar while it loads.
 *
 * It renders the real `ConversationListItem` in its skeleton state rather than a
 * lookalike, so the placeholder cannot drift from the row it stands in for: same
 * grid, same avatar diameter, same two line boxes, same trailing column. Each
 * part is its own placeholder — disc, name, timestamp, snippet, badge — so the
 * list reads as an outline waiting to be filled rather than a stack of grey
 * slabs, and nothing shifts when the conversations arrive.
 *
 * The placeholders are decorative and hidden from assistive tech; mark the
 * region around the list `aria-busy` so the wait is announced once instead of
 * once per row.
 */
export function ConversationSkeleton({
  count = 6,
  density = 'comfortable',
  className,
  ...rest
}: ConversationSkeletonProps) {
  return (
    <List {...rest} aria-hidden="true" className={cx(styles.rows, className)} data-density={density}>
      {Array.from({ length: Math.max(0, count) }, (_, index) => (
        <ConversationListItem
          key={index}
          skeleton
          density={density}
          // The row is a placeholder, so it carries no conversation: an empty
          // summary keeps the prop contract honest rather than faking data.
          item={{ id: `skeleton-${index}`, name: '' }}
        />
      ))}
    </List>
  );
}
