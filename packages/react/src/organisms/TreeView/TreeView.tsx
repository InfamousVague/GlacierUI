import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { SkeletonVariant } from '@glacier/spec';
import { Speed, Ease, transition } from '@glacier/motion';
import {
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx.ts';
import { resolveDirection } from '../../internal/direction.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import styles from './TreeView.module.css';

export interface TreeItem {
  id: string;
  label: ReactNode;
  /** Leading glyph, hidden from assistive tech. */
  icon?: ReactNode;
  /** Trailing content such as a CounterBadge or Pill. */
  trailing?: ReactNode;
  /** Skipped by arrow navigation and unselectable. */
  disabled?: boolean;
  /** Child items; their presence makes the row an expandable parent. */
  children?: TreeItem[];
}

export interface TreeViewProps extends Omit<ComponentProps<'ul'>, 'onSelect'> {
  items: TreeItem[];
  /** Controlled list of expanded parent ids. */
  expandedIds?: string[];
  /** Initially expanded parent ids when uncontrolled. */
  defaultExpandedIds?: string[];
  onExpandedChange?: (expandedIds: string[]) => void;
  /** Controlled selected row id (single-select). */
  selectedId?: string;
  /** Initially selected row id when uncontrolled. */
  defaultSelectedId?: string;
  onSelect?: (id: string) => void;
  /** Accessible name for the tree. Required: a tree without a name is a maze. */
  'aria-label': string;
  /** Renders the frosted glass material behind the tree. */
  glass?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
}

/** A row of the tree in visible (expanded) document order. */
interface VisibleRow {
  item: TreeItem;
  level: number;
  parentId?: string;
}

function flattenVisible(
  items: TreeItem[],
  expanded: string[],
  level = 1,
  parentId?: string,
  out: VisibleRow[] = [],
): VisibleRow[] {
  for (const item of items) {
    out.push({ item, level, parentId });
    if (item.children && item.children.length > 0 && expanded.includes(item.id)) {
      flattenVisible(item.children, expanded, level + 1, item.id, out);
    }
  }
  return out;
}

const chevronGlyph = (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path
      d="M3 1.5 7 5 3 8.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Row widths for the skeleton, one entry per placeholder row. */
const SKELETON_ROWS: { depth: number; width: string }[] = [
  { depth: 1, width: '7rem' },
  { depth: 2, width: '9rem' },
  { depth: 2, width: '6rem' },
  { depth: 1, width: '8rem' },
  { depth: 2, width: '7rem' },
];

/**
 * A hierarchical list of expandable rows following the WAI-ARIA tree pattern:
 * a role="tree" of nested role="treeitem" rows with role="group" branches,
 * one roving tabindex across the visible rows. Arrow keys walk the visible
 * rows (Down/Up), expand or descend (Right), collapse or ascend (Left);
 * Home and End jump to the extremes; Enter and Space select, also toggling
 * parent rows. Branches animate open and closed, and the selected row wears
 * the accent soft tint like an active SidebarItem.
 */
export function TreeView({
  items,
  expandedIds,
  defaultExpandedIds,
  onExpandedChange,
  selectedId,
  defaultSelectedId,
  onSelect,
  glass = false,
  skeleton = false,
  className,
  'aria-label': ariaLabel,
  ...rest
}: TreeViewProps) {
  const uid = useId();
  const reduce = useReducedMotion();
  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  const [expanded, setExpanded] = useControlled(expandedIds, defaultExpandedIds ?? []);
  const [selected, setSelected] = useControlled(selectedId, defaultSelectedId ?? '');
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const visible = useMemo(() => flattenVisible(items ?? [], expanded), [items, expanded]);
  const enabledVisible = useMemo(() => visible.filter((row) => !row.item.disabled), [visible]);

  if (skeleton) {
    return (
      <ul {...rest} aria-hidden="true" className={cx(styles.tree, glass && styles.glass, className)}>
        {SKELETON_ROWS.map((row, index) => (
          <li key={index} className={styles.item}>
            <span className={styles.row} style={{ '--tree-depth': row.depth } as CSSProperties}>
              <span className={styles.chevron} />
              <Skeleton variant={SkeletonVariant.Text} width={row.width} />
            </span>
          </li>
        ))}
      </ul>
    );
  }

  // Roving tabindex: the focused row if it is still visible and enabled,
  // otherwise the selected row, otherwise the first enabled row.
  const focusId =
    focusedId && enabledVisible.some((row) => row.item.id === focusedId)
      ? focusedId
      : (enabledVisible.find((row) => row.item.id === selected)?.item.id ??
        enabledVisible[0]?.item.id);

  function focusItem(id: string) {
    setFocusedId(id);
    itemRefs.current.get(id)?.focus();
  }

  function toggleExpanded(id: string) {
    const next = expanded.includes(id)
      ? expanded.filter((value) => value !== id)
      : [...expanded, id];
    setExpanded(next);
    onExpandedChange?.(next);
  }

  function select(item: TreeItem) {
    if (item.disabled) return;
    setSelected(item.id);
    onSelect?.(item.id);
  }

  function activate(item: TreeItem, hasChildren: boolean) {
    focusItem(item.id);
    if (hasChildren) toggleExpanded(item.id);
    select(item);
  }

  function onTreeKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    const id = (event.target as HTMLElement).closest('[data-id]')?.getAttribute('data-id');
    if (!id) return;
    const index = enabledVisible.findIndex((row) => row.item.id === id);
    if (index < 0) return;
    const row = enabledVisible[index]!;
    const hasChildren = !!row.item.children && row.item.children.length > 0;
    const isExpanded = hasChildren && expanded.includes(row.item.id);

    // APG: in RTL the horizontal arrows invert, so ArrowLeft expands/descends
    // and ArrowRight collapses/ascends. Normalize to the LTR meaning up front.
    let key = event.key;
    if (resolveDirection(event.currentTarget) === 'rtl') {
      if (key === 'ArrowLeft') key = 'ArrowRight';
      else if (key === 'ArrowRight') key = 'ArrowLeft';
    }

    switch (key) {
      case 'ArrowDown': {
        event.preventDefault();
        const next = enabledVisible[index + 1];
        if (next) focusItem(next.item.id);
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const previous = enabledVisible[index - 1];
        if (previous) focusItem(previous.item.id);
        break;
      }
      case 'ArrowRight': {
        event.preventDefault();
        if (!hasChildren) break;
        if (!isExpanded) toggleExpanded(row.item.id);
        else {
          const child = enabledVisible.find((candidate) => candidate.parentId === row.item.id);
          if (child) focusItem(child.item.id);
        }
        break;
      }
      case 'ArrowLeft': {
        event.preventDefault();
        if (isExpanded) toggleExpanded(row.item.id);
        else if (row.parentId) {
          const parent = visible.find((candidate) => candidate.item.id === row.parentId);
          if (parent && !parent.item.disabled) focusItem(parent.item.id);
        }
        break;
      }
      case 'Home': {
        event.preventDefault();
        const first = enabledVisible[0];
        if (first) focusItem(first.item.id);
        break;
      }
      case 'End': {
        event.preventDefault();
        const last = enabledVisible[enabledVisible.length - 1];
        if (last) focusItem(last.item.id);
        break;
      }
      case 'Enter':
      case ' ': {
        event.preventDefault();
        if (hasChildren) toggleExpanded(row.item.id);
        select(row.item);
        break;
      }
    }
  }

  function renderNode(item: TreeItem, level: number, posinset: number, setsize: number): ReactNode {
    const children = item.children ?? [];
    const hasChildren = children.length > 0;
    const isExpanded = hasChildren && expanded.includes(item.id);
    const isSelected = !item.disabled && item.id === selected;
    // named by its own label span, so an expanded parent's accessible name
    // does not swallow every descendant label
    const labelId = `${uid}-label-${item.id}`;
    return (
      <li
        key={item.id}
        ref={(el) => {
          if (el) itemRefs.current.set(item.id, el);
          else itemRefs.current.delete(item.id);
        }}
        role="treeitem"
        data-id={item.id}
        aria-labelledby={labelId}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={item.disabled ? undefined : isSelected}
        aria-disabled={item.disabled || undefined}
        aria-level={level}
        aria-setsize={setsize}
        aria-posinset={posinset}
        tabIndex={!item.disabled && item.id === focusId ? 0 : -1}
        className={styles.item}
      >
        <span
          className={styles.row}
          data-selected={isSelected || undefined}
          data-disabled={item.disabled || undefined}
          style={{ '--tree-depth': level } as CSSProperties}
          onClick={item.disabled ? undefined : () => activate(item, hasChildren)}
        >
          <span className={styles.chevron} data-expanded={isExpanded || undefined} aria-hidden="true">
            {hasChildren && chevronGlyph}
          </span>
          {item.icon && (
            <span className={styles.icon} aria-hidden="true">
              {item.icon}
            </span>
          )}
          <span id={labelId} className={styles.label}>
            {item.label}
          </span>
          {item.trailing && <span className={styles.trailing}>{item.trailing}</span>}
        </span>
        {hasChildren && (
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.ul
                role="group"
                className={styles.group}
                initial={reduce ? false : { height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={reduce ? { duration: 0 } : transition(Speed.Fast, Ease.Out)}
              >
                {children.map((child, index) => renderNode(child, level + 1, index + 1, children.length))}
              </motion.ul>
            )}
          </AnimatePresence>
        )}
      </li>
    );
  }

  return (
    <ul
      {...rest}
      role="tree"
      aria-label={ariaLabel}
      className={cx(styles.tree, glass && styles.glass, className)}
      onKeyDown={onTreeKeyDown}
    >
      {items.map((item, index) => renderNode(item, 1, index + 1, items.length))}
    </ul>
  );
}
