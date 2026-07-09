import { motion, useReducedMotion } from 'motion/react';
import { Spring, springTransition } from '@glacier/motion';
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { useControlled } from '../../internal/useControlled.ts';
import styles from './TabStrip.module.css';

export interface TabStripItem {
  /** Stable identity of the tab; also the value reported by onValueChange. */
  id: string;
  /** Visible label. */
  label: ReactNode;
  /** Optional leading glyph. */
  icon?: ReactNode;
}

export interface TabStripProps {
  tabs: TabStripItem[];
  /** Controlled active tab id. */
  value?: string;
  /** Initial active tab id when uncontrolled; defaults to the first tab. */
  defaultValue?: string;
  /** Called with the id of the tab that becomes active. */
  onValueChange?: (id: string) => void;
  /** Called with the id of the tab whose close button is pressed. */
  onClose?: (id: string) => void;
  /** Spring preset for the active indicator. Defaults to Spring.Snappy. */
  spring?: Spring;
  /** Accessible name for the strip. */
  'aria-label'?: string;
  className?: string;
}

/**
 * A horizontal strip of closable document tabs, like editor or browser tabs.
 * The active tab carries a springing underline indicator (a shared
 * framer-motion layout element), the strip scrolls horizontally when the tabs
 * overflow, and each tab has its own close (×) button. Left/Right move the
 * active tab; Delete or Backspace closes the focused tab.
 *
 * Reordering by drag is out of scope for v1.
 */
export function TabStrip({
  tabs,
  value,
  defaultValue,
  onValueChange,
  onClose,
  spring = Spring.Snappy,
  className,
  ...rest
}: TabStripProps) {
  const id = useId();
  const reduce = useReducedMotion();
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const fallback = defaultValue ?? tabs[0]?.id ?? '';
  const [active, setActive] = useControlled(value, fallback);

  // Track horizontal overflow so the strip can reserve room for the scrollbar
  // and keep it below the tabs rather than overlaying their bottom edge.
  const stripRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  const syncOverflow = useCallback(() => {
    const el = stripRef.current;
    if (!el) return;
    setOverflowing(el.scrollWidth - el.clientWidth > 1);
  }, []);

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    syncOverflow();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(syncOverflow);
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);
    return () => observer.disconnect();
  }, [syncOverflow, tabs]);

  function select(id: string, focus: boolean) {
    setActive(id);
    onValueChange?.(id);
    if (focus) tabRefs.current.get(id)?.focus();
  }

  function close(id: string) {
    onClose?.(id);
  }

  function onStripKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (tabs.length === 0) return;
    const focusedId = (document.activeElement as HTMLElement | null)?.dataset?.tabId;
    const pos = tabs.findIndex((tab) => tab.id === (focusedId ?? active));
    if (pos < 0) return;
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        select(tabs[(pos + 1) % tabs.length]!.id, true);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        select(tabs[(pos - 1 + tabs.length) % tabs.length]!.id, true);
        break;
      case 'Home':
        event.preventDefault();
        select(tabs[0]!.id, true);
        break;
      case 'End':
        event.preventDefault();
        select(tabs[tabs.length - 1]!.id, true);
        break;
      case 'Delete':
      case 'Backspace':
        event.preventDefault();
        close(tabs[pos]!.id);
        break;
    }
  }

  return (
    <div
      ref={stripRef}
      role="tablist"
      aria-label={rest['aria-label']}
      aria-orientation="horizontal"
      className={cx(styles.strip, className)}
      data-overflowing={overflowing || undefined}
      onKeyDown={onStripKeyDown}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        const name = typeof tab.label === 'string' ? tab.label : 'tab';
        // The close affordance lives inside the role="tab" button as a
        // non-focusable role="button" span: keyboard users close with
        // Delete/Backspace on the tab, pointer users click the ×. Keeping it
        // inside the tab (rather than a sibling) means the tablist owns only
        // role="tab" children, and a non-focusable span avoids nesting two
        // focusable controls.
        return (
          <button
            key={tab.id}
            type="button"
            ref={(el) => {
              if (el) tabRefs.current.set(tab.id, el);
              else tabRefs.current.delete(tab.id);
            }}
            role="tab"
            data-tab-id={tab.id}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className={styles.tab}
            onClick={() => select(tab.id, false)}
          >
            {tab.icon && (
              <span className={styles.icon} aria-hidden="true">
                {tab.icon}
              </span>
            )}
            <span className={styles.label}>{tab.label}</span>
            <span
              role="button"
              className={styles.close}
              aria-label={`Close ${name}`}
              onClick={(event: MouseEvent<HTMLSpanElement>) => {
                event.stopPropagation();
                close(tab.id);
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                <path d="M3 3l6 6M9 3l-6 6" />
              </svg>
            </span>
            {isActive && (
              <motion.span
                layoutId={`${id}-indicator`}
                className={styles.indicator}
                transition={reduce ? { duration: 0 } : springTransition(spring)}
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
