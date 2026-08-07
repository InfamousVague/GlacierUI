import { motion, useReducedMotion } from 'motion/react';
import { Size } from '@glacier/spec';
import { Speed, Ease, transition } from '@glacier/motion';
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { Modal } from '../Modal/Modal.tsx';
import styles from './TabbedModal.module.css';

const NARROW_QUERY = '(max-width: 40rem)';

function useNarrowLayout() {
  const [narrow, setNarrow] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(NARROW_QUERY).matches
      : false,
  );

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia(NARROW_QUERY);
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return narrow;
}

export interface TabbedModalSection {
  /** Stable identifier for the section, matched against `value`. */
  id: string;
  /** Section navigation label. */
  label: ReactNode;
  /** Optional leading glyph in the nav rail. */
  icon?: ReactNode;
  /** Body shown in the scrollable pane when this section is active. */
  content: ReactNode;
  /** Dims the rail entry and skips it in navigation. */
  disabled?: boolean;
}

export interface TabbedModalProps {
  open: boolean;
  /** Called when the user dismisses via Escape, the close button, or the overlay. */
  onClose: () => void;
  /** Sections listed in the responsive tab navigation; the active one fills the content pane. */
  sections: TabbedModalSection[];
  /** Controlled active section id. */
  value?: string;
  /** Initial active section id when uncontrolled. */
  defaultValue?: string;
  /** Called with the next active section id. */
  onValueChange?: (value: string) => void;
  /** Heading shown above the two panes. */
  title?: ReactNode;
  /** Action row passed through to the underlying Modal, below both panes. */
  footer?: ReactNode;
  /**
   * The hairline between the nav rail and the pane. On by default; turn it off
   * where the sections are few enough to read as one surface without a rule
   * splitting them.
   */
  divider?: boolean;
  className?: string;
}

/**
 * A settings-style dialog with section tabs and a scrollable active pane. It
 * composes the kit's Modal, inheriting its portal, focus trap, scroll lock, and
 * dismiss behaviour. The WAI-ARIA tablist is a vertical rail on wide screens
 * and a horizontal strip on narrow screens; Up/Down or Left/Right move and
 * activate tabs respectively, while Home and End jump to the ends.
 */
export function TabbedModal({
  open,
  onClose,
  sections,
  value,
  defaultValue,
  onValueChange,
  title,
  footer,
  divider = true,
  className,
}: TabbedModalProps) {
  const id = useId();
  const reduce = useReducedMotion();
  const narrow = useNarrowLayout();
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const fallback = defaultValue ?? sections.find((section) => !section.disabled)?.id ?? '';
  const [selected, setSelected] = useControlled(value, fallback);

  const activeIndex = sections.findIndex((section) => section.id === selected);
  const active = activeIndex >= 0 ? sections[activeIndex] : undefined;
  const enabled = sections.filter((section) => !section.disabled);

  function select(section: TabbedModalSection, focus: boolean) {
    setSelected(section.id);
    onValueChange?.(section.id);
    if (focus) tabRefs.current.get(section.id)?.focus();
  }

  function onRailKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (enabled.length === 0) return;
    const pos = enabled.findIndex((section) => section.id === selected);
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const nextKey = narrow ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
    const previousKey = narrow ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
    switch (event.key) {
      case nextKey:
        event.preventDefault();
        select(enabled[(pos + 1) % enabled.length]!, true);
        break;
      case previousKey:
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
    <Modal open={open} onClose={onClose} title={title} footer={footer} size={Size.XLarge}>
      <div className={cx(styles.layout, className)} data-modal-overflow="contained" data-divider={divider ? undefined : 'none'}>
        <div
          role="tablist"
          aria-orientation={narrow ? 'horizontal' : 'vertical'}
          aria-label={typeof title === 'string' ? title : undefined}
          className={styles.rail}
          onKeyDown={onRailKeyDown}
        >
          {sections.map((section, index) => {
            const isSelected = section.id === selected;
            return (
              <button
                key={section.id}
                ref={(el) => {
                  if (el) tabRefs.current.set(section.id, el);
                  else tabRefs.current.delete(section.id);
                }}
                type="button"
                role="tab"
                id={`${id}-tab-${index}`}
                aria-selected={isSelected}
                aria-controls={`${id}-panel-${index}`}
                tabIndex={isSelected ? 0 : -1}
                disabled={section.disabled}
                data-active={isSelected || undefined}
                className={styles.railItem}
                onClick={() => select(section, false)}
              >
                {isSelected && (
                  <motion.span
                    layoutId={`${id}-indicator`}
                    className={styles.indicator}
                    transition={reduce ? { duration: 0 } : transition(Speed.Fast, Ease.Out)}
                    aria-hidden="true"
                  />
                )}
                {section.icon && (
                  <span className={styles.railIcon} aria-hidden="true">
                    {section.icon}
                  </span>
                )}
                <span className={styles.railLabel}>{section.label}</span>
              </button>
            );
          })}
        </div>
        {active && (
          <motion.div
            key={active.id}
            role="tabpanel"
            id={`${id}-panel-${activeIndex}`}
            aria-labelledby={`${id}-tab-${activeIndex}`}
            tabIndex={0}
            className={styles.pane}
            initial={reduce ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduce ? { duration: 0 } : transition(Speed.Fast, Ease.Out)}
          >
            {active.content}
          </motion.div>
        )}
      </div>
    </Modal>
  );
}
