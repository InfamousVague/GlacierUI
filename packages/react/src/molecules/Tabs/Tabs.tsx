import { motion, useReducedMotion } from 'motion/react';
import { SkeletonVariant } from '@glacier/spec';
import { Spring, springTransition, Speed, Ease, transition } from '@glacier/motion';
import { useId, useRef, type ComponentProps, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { resolveDirection } from '../../internal/direction.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import styles from './Tabs.module.css';

export interface TabItem {
  value: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps extends ComponentProps<'div'> {
  tabs: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Spring preset for the underline indicator. Defaults to Spring.Snappy. */
  spring?: Spring;
  /** Stretches the tabs to fill the list width. */
  fullWidth?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Accessible name for the tab list. */
  'aria-label'?: string;
  className?: string;
}

/**
 * A tab menu following the WAI-ARIA tabs pattern with automatic activation:
 * the underline indicator is a shared framer-motion layout element, so it
 * springs between tabs the same way the SegmentedControl thumb does. Arrow
 * keys move and activate (wrapping, skipping disabled tabs), Home and End
 * jump to the extremes.
 */
export function Tabs({
  tabs,
  value,
  defaultValue,
  onValueChange,
  spring = Spring.Snappy,
  fullWidth = false,
  skeleton = false,
  className,
  'aria-label': ariaLabel,
  ...rest
}: TabsProps) {
  const id = useId();
  const reduce = useReducedMotion();
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const fallback = defaultValue ?? tabs.find((tab) => !tab.disabled)?.value ?? '';
  const [selected, setSelected] = useControlled(value, fallback);

  if (skeleton) {
    return (
      <div {...rest} className={className}>
        <div className={cx(styles.list, fullWidth && styles.fullWidth)}>
          {[0, 1, 2].map((line) => (
            <span
              key={line}
              style={{
                display: 'inline-flex',
                justifyContent: 'center',
                flex: fullWidth ? 1 : undefined,
                padding: 'var(--glacier-space-3) var(--glacier-space-4)',
              }}
            >
              <Skeleton variant={SkeletonVariant.Text} width="4rem" />
            </span>
          ))}
        </div>
        <div className={styles.panel} style={{ display: 'grid', gap: 'var(--glacier-space-2)' }}>
          <Skeleton variant={SkeletonVariant.Text} width="100%" />
          <Skeleton variant={SkeletonVariant.Text} width="70%" />
        </div>
      </div>
    );
  }

  const activeIndex = tabs.findIndex((tab) => tab.value === selected);
  const active = activeIndex >= 0 ? tabs[activeIndex] : undefined;
  const enabled = tabs.filter((tab) => !tab.disabled);

  function select(tab: TabItem, focus: boolean) {
    setSelected(tab.value);
    onValueChange?.(tab.value);
    if (focus) tabRefs.current.get(tab.value)?.focus();
  }

  function onListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (enabled.length === 0) return;
    const pos = enabled.findIndex((tab) => tab.value === selected);
    // APG: horizontal arrows follow reading direction, so they invert in RTL.
    const forward = resolveDirection(event.currentTarget) === 'rtl' ? -1 : 1;
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        select(enabled[(pos + forward + enabled.length) % enabled.length]!, true);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        select(enabled[(pos - forward + enabled.length) % enabled.length]!, true);
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
    <div {...rest} className={className}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={cx(styles.list, fullWidth && styles.fullWidth)}
        onKeyDown={onListKeyDown}
      >
        {tabs.map((tab, index) => {
          const isSelected = tab.value === selected;
          return (
            <button
              key={tab.value}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.value, el);
                else tabRefs.current.delete(tab.value);
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${index}`}
              aria-selected={isSelected}
              aria-controls={`${id}-panel-${index}`}
              tabIndex={isSelected ? 0 : -1}
              disabled={tab.disabled}
              className={styles.tab}
              // rest spreads on the root div, so the tab's haptic kind sits
              // directly on the button and is not per-caller overridable
              data-haptic="selection"
              onClick={() => select(tab, false)}
            >
              {tab.label}
              {isSelected && (
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
      {active && (
        <motion.div
          key={active.value}
          role="tabpanel"
          id={`${id}-panel-${activeIndex}`}
          aria-labelledby={`${id}-tab-${activeIndex}`}
          tabIndex={0}
          className={styles.panel}
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
