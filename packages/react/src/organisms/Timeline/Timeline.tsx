import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import styles from './Timeline.module.css';

/** The semantic color family a marker can wear. */
export type TimelineTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

export interface TimelineItem {
  /** Stable identity (string or number) for the event. */
  id: string | number;
  /** The event headline. */
  title: ReactNode;
  /** Body copy under the header row. */
  description?: ReactNode;
  /** Muted time slot at the end of the header row; pass a <time> element for machine-readable dates. */
  timestamp?: ReactNode;
  /** Avatar or name slot composed by the consumer, leading the header row. */
  actor?: ReactNode;
  /** Glyph inside the marker dot; falls back to a plain dot. */
  icon?: ReactNode;
  /** Colors the marker. Defaults to neutral. */
  tone?: TimelineTone;
  /** Optional media or preview block under the description. */
  media?: ReactNode;
  /** Optional action row of small buttons or links. */
  actions?: ReactNode;
}

export interface TimelineProps extends Omit<ComponentProps<'ol'>, 'children'> {
  /** The events, in reading order: the DOM order is the chronological order you choose. */
  items: TimelineItem[];
  /** Accessible name for the feed. Required: a feed without a name is just a list. */
  'aria-label': string;
  /** Vertical rhythm; compact trims the space between events. */
  density?: 'comfortable' | 'compact';
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** How many placeholder rows the skeleton draws. */
  skeletonCount?: number;
}

/** Title line widths for the skeleton, cycled so the placeholder reads organically. */
const SKELETON_TITLE_WIDTHS = ['45%', '60%', '50%', '70%'];

/**
 * A vertical activity feed: a semantic ordered list of events, each with a
 * tone-colored marker on a connector rail and a content column of header
 * (actor, title, timestamp), description, media, and actions. The DOM order
 * is the reading order - pass items newest-first or oldest-first and the
 * ordered-list semantics carry that chronology to assistive tech. Markers
 * and connectors are decorative; all meaning lives in the content column.
 */
export function Timeline({
  items,
  'aria-label': ariaLabel,
  density = 'comfortable',
  skeleton = false,
  skeletonCount = 4,
  className,
  ...rest
}: TimelineProps) {
  if (skeleton) {
    const rows = Math.max(1, skeletonCount);
    return (
      <ol className={cx(styles.root, className)} data-density={density} aria-hidden {...rest}>
        {Array.from({ length: rows }, (_, i) => {
          const last = i === rows - 1;
          return (
            <li key={i} className={styles.item} data-last={last || undefined}>
              <span className={styles.rail}>
                <span className={styles.marker}>
                  <Skeleton variant="circle" width="var(--glacier-size-lg)" />
                </span>
                {last ? null : <span className={styles.connector} />}
              </span>
              <div className={styles.content}>
                <div className={styles.header}>
                  <Skeleton variant="text" width={SKELETON_TITLE_WIDTHS[i % SKELETON_TITLE_WIDTHS.length]} />
                </div>
                <div className={styles.description}>
                  <Skeleton variant="text" width="80%" />
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    // The explicit role looks redundant on an ol, but WebKit strips list
    // semantics from lists styled with list-style: none; role="list" restores
    // them so VoiceOver still announces the feed as a list.
    <ol role="list" className={cx(styles.root, className)} aria-label={ariaLabel} data-density={density} {...rest}>
      {items.map((item, i) => {
        const last = i === items.length - 1;
        const tone = item.tone ?? 'neutral';
        return (
          <li key={item.id} className={styles.item} data-last={last || undefined}>
            <span className={styles.rail} aria-hidden="true">
              <span
                className={styles.marker}
                data-tone={tone}
                data-icon={item.icon != null || undefined}
              >
                {item.icon ?? <span className={styles.dot} />}
              </span>
              {last ? null : <span className={styles.connector} />}
            </span>
            <div className={styles.content}>
              <div className={styles.header}>
                {item.actor != null && <span className={styles.actor}>{item.actor}</span>}
                <span className={styles.title}>{item.title}</span>
                {item.timestamp != null && <span className={styles.timestamp}>{item.timestamp}</span>}
              </div>
              {item.description != null && <div className={styles.description}>{item.description}</div>}
              {item.media != null && <div className={styles.media}>{item.media}</div>}
              {item.actions != null && <div className={styles.actions}>{item.actions}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
