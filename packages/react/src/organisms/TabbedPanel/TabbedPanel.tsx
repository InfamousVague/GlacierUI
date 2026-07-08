import { motion, useReducedMotion } from 'motion/react';
import { Speed, Ease, transition } from '@perfect/motion';
import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { CounterBadge } from '../../atoms/CounterBadge/CounterBadge.tsx';
import styles from './TabbedPanel.module.css';

export interface TabbedPanelTab {
  id: string;
  label: ReactNode;
  /** Optional count rendered as a CounterBadge on the tab. */
  count?: number;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabbedPanelProps {
  tabs: TabbedPanelTab[];
  /** Controlled active tab id. */
  value?: string;
  /** Initial active tab id when uncontrolled. */
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  /** Actions rendered at the end of the header row, e.g. a Button or Menu. */
  actions?: ReactNode;
  /** Accessible name for the tab list. */
  'aria-label'?: string;
  className?: string;
}

/**
 * A framed panel with a header row of tabs and a bounded content body that
 * switches per active tab. Each tab may carry a numeric count as a
 * CounterBadge, and the header has an optional end slot for actions. Follows
 * the WAI-ARIA tabs pattern with automatic activation: a role="tablist" of
 * role="tab" buttons drives a role="tabpanel" body. Arrow keys move and
 * activate the tabs (wrapping, skipping disabled), Home and End jump to the
 * extremes.
 */
export function TabbedPanel({
  tabs,
  value,
  defaultValue,
  onValueChange,
  actions,
  className,
  ...rest
}: TabbedPanelProps) {
  const id = useId();
  const reduce = useReducedMotion();
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const fallback = defaultValue ?? tabs.find((tab) => !tab.disabled)?.id ?? '';
  const [selected, setSelected] = useControlled(value, fallback);

  const activeIndex = tabs.findIndex((tab) => tab.id === selected);
  const active = activeIndex >= 0 ? tabs[activeIndex] : undefined;
  const enabled = tabs.filter((tab) => !tab.disabled);

  function select(tab: TabbedPanelTab, focus: boolean) {
    setSelected(tab.id);
    onValueChange?.(tab.id);
    if (focus) tabRefs.current.get(tab.id)?.focus();
  }

  function onListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (enabled.length === 0) return;
    const pos = enabled.findIndex((tab) => tab.id === selected);
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        select(enabled[(pos + 1) % enabled.length]!, true);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        select(enabled[(pos - 1 + enabled.length) % enabled.length]!, true);
        break;
      case 'Home':
        event.preventDefault();
        select(enabled[0]!, true);
        break;
      case 'End':
        event.preventDefault();
        select(enabled[enabled.length - 1]!, true);
        break;
    }
  }

  return (
    <div className={cx(styles.panel, className)}>
      <div className={styles.header}>
        <div
          role="tablist"
          aria-label={rest['aria-label']}
          className={styles.list}
          onKeyDown={onListKeyDown}
        >
          {tabs.map((tab, index) => {
            const isSelected = tab.id === selected;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  if (el) tabRefs.current.set(tab.id, el);
                  else tabRefs.current.delete(tab.id);
                }}
                type="button"
                role="tab"
                id={`${id}-tab-${index}`}
                aria-selected={isSelected}
                aria-controls={`${id}-panel-${index}`}
                tabIndex={isSelected ? 0 : -1}
                disabled={tab.disabled}
                className={styles.tab}
                onClick={() => select(tab, false)}
              >
                <span className={styles.tabLabel}>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <CounterBadge
                    count={tab.count}
                    tone={isSelected ? 'accent' : 'neutral'}
                    size="sm"
                    className={styles.count}
                  />
                )}
                {isSelected && (
                  <motion.span
                    layoutId={`${id}-indicator`}
                    className={styles.indicator}
                    transition={reduce ? { duration: 0 } : transition(Speed.Fast, Ease.Out)}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {active && (
        <motion.div
          key={active.id}
          role="tabpanel"
          id={`${id}-panel-${activeIndex}`}
          aria-labelledby={`${id}-tab-${activeIndex}`}
          tabIndex={0}
          className={styles.body}
          initial={reduce ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduce ? { duration: 0 } : transition(Speed.Fast, Ease.Out)}
        >
          {active.content}
        </motion.div>
      )}
    </div>
  );
}
