import {
  conversationOrder,
  conversationRowHeight,
  conversationSectionLabel,
  conversationWindow,
  defaultConversationLabels,
  groupConversations,
  moveConversationCursor,
  type ConversationDensity,
  type ConversationLabels,
} from '@glacier/logic';
import { useId, useRef, type ComponentProps, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { List } from '../List/List.tsx';
import { ScrollArea } from '../ScrollArea/ScrollArea.tsx';
import { ConversationListItem, type ConversationItem } from './ConversationListItem.tsx';
import styles from './ConversationList.module.css';

export type { ConversationItem };

export interface ConversationListProps
  extends Omit<ComponentProps<'div'>, 'onSelect' | 'defaultValue' | 'children'> {
  /**
   * The conversations, in the order they should read within their section.
   *
   * Data, not children: the list has to know its full row count without walking
   * the DOM, which is the precondition for dropping windowing in later.
   */
  items: readonly ConversationItem[];
  /** Controlled id of the open conversation. */
  value?: string;
  /** Initially open conversation when uncontrolled. */
  defaultValue?: string;
  /** Called with the id when a different conversation is opened. */
  onValueChange?: (id: string) => void;
  /** Splits pinned conversations into their own section. */
  grouped?: boolean;
  /** How tightly the rows are packed; forwarded to every row. */
  density?: ConversationDensity;
  /**
   * Opens each conversation as the arrows move through it. Off by default:
   * opening a thread costs a fetch and a scroll position, so it should take a
   * deliberate Enter rather than happening while you look for something.
   */
  selectionFollowsFocus?: boolean;
  /** Caps the list and wraps it in a ScrollArea. That viewport is the scroll host. */
  maxHeight?: number | string;
  /** Rendered in place of the sections when there is nothing to list. */
  empty?: ReactNode;
  /** Instant timestamps are read against; injectable so a list renders deterministically. */
  now?: Date | number;
  /** BCP-47 tag for the timestamp formatter. */
  locale?: string;
  /** Translated strings; merged over the shared English defaults. */
  labels?: Partial<ConversationLabels>;
}

/**
 * The chat sidebar: a single-select listbox of conversations.
 *
 * Selection, keyboard navigation, and the Pinned / All grouping live here so a
 * row stays a row. The keyboard model is a roving tabindex rather than
 * `aria-activedescendant`, so the focused row is the genuinely focused element
 * and the browser scrolls it into view for free — which matters more the longer
 * the list gets.
 *
 * **The windowing seam.** There is no VirtualList in the kit yet, and this
 * component is built so adding one changes no public API:
 *
 * 1. rows come from `items`, so the full count is known without measuring;
 * 2. every row's height is fixed and derived from the spec's density step, so
 *    an offset can be computed rather than observed;
 * 3. the tree already emits a leading and a trailing strut around the rows —
 *    zero-height today — for a windowing strategy to inflate;
 * 4. `aria-posinset` / `aria-setsize` are already counted against the full
 *    flattened order, so a window of 20 rows out of 5,000 still announces
 *    "142 of 5000"; and
 * 5. `conversationWindow()` in @glacier/logic already does the arithmetic and
 *    returns the whole list whenever it is handed no viewport height.
 *
 * Turning windowing on is therefore: give `conversationWindow` the host
 * viewport's `scrollTop` and `clientHeight` (the ScrollArea viewport when
 * `maxHeight` is set). Nothing else in this file, and nothing at all in
 * ConversationListItem, has to change.
 */
export function ConversationList({
  items,
  value,
  defaultValue,
  onValueChange,
  grouped = true,
  density = 'comfortable',
  selectionFollowsFocus = false,
  maxHeight,
  empty,
  now,
  locale,
  labels,
  className,
  onKeyDown,
  'aria-label': ariaLabel,
  ...rest
}: ConversationListProps) {
  const text = { ...defaultConversationLabels, ...labels };
  const headerId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useControlled(value, defaultValue ?? '');
  const sections = groupConversations(items, grouped);
  const order = conversationOrder(sections);

  // No viewport measurements are fed in, so this resolves to the whole list and
  // two zero-height struts. See the seam note above.
  const slice = conversationWindow({ total: order.length, rowHeight: conversationRowHeight(density) });

  const open = (id: string) => {
    if (id === selected) return;
    setSelected(id);
    onValueChange?.(id);
  };

  /**
   * Moves DOM focus to a row, which is what makes the roving tabindex real.
   * Scanned rather than selected by attribute value, since a conversation id is
   * caller data and may contain anything a selector would choke on.
   */
  const focusRow = (id: string) => {
    const rows = rootRef.current?.querySelectorAll<HTMLElement>('[data-conversation-id]') ?? [];
    for (const row of rows) {
      if (row.dataset.conversationId === id) {
        row.focus();
        return;
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const focusedId =
      (event.target as HTMLElement).closest<HTMLElement>('[data-conversation-id]')?.dataset
        .conversationId ?? selected;
    const next = moveConversationCursor(order, focusedId || undefined, event.key);
    // An unhandled key is left alone so type-ahead, Tab, and the page's own
    // shortcuts still work inside the list.
    if (next === undefined) return;
    event.preventDefault();
    focusRow(next);
    if (selectionFollowsFocus) open(next);
  };

  // The row that owns the tab stop: the open conversation, or the first row, so
  // Tab always lands somewhere useful and only once.
  const tabStopId = order.includes(selected) ? selected : order[0];

  let rendered = -1;
  const body =
    order.length === 0 ? (
      <div className={styles.empty}>{empty}</div>
    ) : (
      sections.map((section) => (
        // role="none" so the wrapper does not sit between the listbox and its
        // options: a listbox may own options and groups, nothing else.
        <div key={section.id} role="none" className={styles.section}>
          {/* Decorative: the group below already carries this name, and an
              option sequence must not be interrupted by a stray heading. */}
          <div className={styles.header} id={`${headerId}-${section.id}`} aria-hidden="true">
            {conversationSectionLabel(section.id, text)}
          </div>
          <List
            role="group"
            aria-label={conversationSectionLabel(section.id, text)}
            className={styles.rows}
          >
            {section.items.map((item) => {
              rendered += 1;
              const index = rendered;
              if (index < slice.start || index >= slice.end) return null;
              return (
                <ConversationListItem
                  key={item.id}
                  item={item}
                  density={density}
                  selected={item.id === selected}
                  onSelect={open}
                  posInSet={index + 1}
                  setSize={order.length}
                  tabIndex={item.id === tabStopId ? 0 : -1}
                  now={now}
                  locale={locale}
                  labels={labels}
                />
              );
            })}
          </List>
        </div>
      ))
    );

  const listbox = (
    <div
      {...rest}
      ref={rootRef}
      role="listbox"
      aria-label={ariaLabel ?? text.list}
      className={cx(styles.list, className)}
      data-density={density}
      onKeyDown={handleKeyDown}
    >
      {/* The struts a windowing strategy inflates; zero-height while the whole
          list is rendered, and never part of the option sequence. */}
      <div className={styles.strut} aria-hidden="true" style={{ height: slice.padStart }} />
      {body}
      <div className={styles.strut} aria-hidden="true" style={{ height: slice.padEnd }} />
    </div>
  );

  return maxHeight === undefined ? listbox : <ScrollArea maxHeight={maxHeight}>{listbox}</ScrollArea>;
}
