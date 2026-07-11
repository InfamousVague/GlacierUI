import { motion, useReducedMotion } from 'motion/react';
import { Speed, Ease, transition } from '@glacier/motion';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../internal/cx.ts';
import { resolveDirection, useDirection } from '../../internal/direction.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { useField } from '../../internal/FieldContext.ts';
import type { ControlSize } from '../../atoms/inputs/Button/Button.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface SelectProps extends ComponentProps<'div'> {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  size?: ControlSize;
  fullWidth?: boolean;
  disabled?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Renders the frosted glass material on the trigger instead of a solid surface. */
  glass?: boolean;
  /** Submitted with forms via a hidden input when set. */
  name?: string;
  id?: string;
  'aria-label'?: string;
  className?: string;
}

const Chevrons = (
  <svg className={styles.chevrons} width="10" height="14" viewBox="0 0 10 14" fill="none" aria-hidden="true">
    <path d="M1.5 5 5 1.5 8.5 5M1.5 9 5 12.5 8.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Check = (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2.5 6.5 5 9 9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface MenuPosition {
  style: CSSProperties;
  openUp: boolean;
}

/**
 * A styled replacement for the native select: an Input-metric trigger and a
 * glass listbox that animates open. The menu portals to document.body with
 * fixed positioning, so it escapes overflow-clipping ancestors and stacking
 * contexts (glass panels, modals, scroll areas). Follows the WAI-ARIA listbox
 * pattern with aria-activedescendant; arrow keys navigate, Enter selects,
 * Escape closes.
 */
export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = 'Select…',
  size = 'md',
  fullWidth = false,
  disabled = false,
  skeleton = false,
  glass = false,
  name,
  id,
  className,
  'aria-label': ariaLabel,
  ...rest
}: SelectProps) {
  const listboxId = useId();
  const field = useField();
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [selected, setSelected] = useControlled(value, defaultValue ?? '');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  // the menu portals to the body, past any scoped dir ancestor - carry the
  // trigger's resolved direction with it
  const dir = useDirection(triggerRef);

  const selectedOption = options.find((o) => o.value === selected);

  const enabledIndexes = options
    .map((o, i) => (o.disabled ? -1 : i))
    .filter((i) => i >= 0);

  function openMenu() {
    if (disabled || options.length === 0) return;
    const selectedIndex = options.findIndex((o) => o.value === selected && !o.disabled);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : (enabledIndexes[0] ?? -1));
    setOpen(true);
  }

  function closeMenu(refocus: boolean) {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }

  function commit(index: number) {
    const option = options[index];
    if (!option || option.disabled) return;
    setSelected(option.value);
    onValueChange?.(option.value);
    closeMenu(true);
  }

  function move(from: number, delta: 1 | -1): number {
    if (enabledIndexes.length === 0) return -1;
    const pos = enabledIndexes.indexOf(from);
    if (pos === -1) return delta === 1 ? enabledIndexes[0]! : enabledIndexes[enabledIndexes.length - 1]!;
    const next = Math.min(Math.max(pos + delta, 0), enabledIndexes.length - 1);
    return enabledIndexes[next]!;
  }

  function onTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !open) {
      e.preventDefault();
      openMenu();
    }
  }

  function onListKeyDown(e: KeyboardEvent<HTMLUListElement>) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => move(i, 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => move(i, -1));
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(enabledIndexes[0] ?? -1);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(enabledIndexes[enabledIndexes.length - 1] ?? -1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        commit(activeIndex);
        break;
      case 'Escape':
        e.preventDefault();
        closeMenu(true);
        break;
      case 'Tab':
        closeMenu(false);
        break;
    }
  }

  // anchor the portaled menu to the trigger; follow scroll and resize
  useLayoutEffect(() => {
    if (!open) return;

    function compute() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const gap = 8;
      const margin = 16;
      const spaceBelow = window.innerHeight - rect.bottom - gap - margin;
      const spaceAbove = rect.top - gap - margin;
      const openUp = spaceBelow < 240 && spaceAbove > spaceBelow;
      const maxHeight = Math.max(120, Math.min(416, openUp ? spaceAbove : spaceBelow));
      // Logical alignment, resolved live at measure time: the menu's inline-
      // start edge hugs the trigger's. Under RTL that is the right edge, and
      // anchoring via `right` keeps a menu wider than its trigger (minWidth
      // only floors it) growing toward inline-end without knowing its width.
      const rtl = resolveDirection(triggerRef.current) === 'rtl';
      const inline = rtl
        ? { right: Math.max(margin, Math.min(window.innerWidth - rect.right, window.innerWidth - rect.width - margin)) }
        : { left: Math.max(margin, Math.min(rect.left, window.innerWidth - rect.width - margin)) };
      setPosition({
        openUp,
        style: {
          position: 'fixed',
          ...inline,
          minWidth: rect.width,
          maxHeight,
          zIndex: 200,
          transformOrigin: openUp ? 'bottom' : 'top',
          ...(openUp
            ? { bottom: window.innerHeight - rect.top + gap }
            : { top: rect.bottom + gap }),
        },
      });
    }

    compute();
    window.addEventListener('resize', compute);
    document.addEventListener('scroll', compute, true);
    return () => {
      window.removeEventListener('resize', compute);
      document.removeEventListener('scroll', compute, true);
    };
  }, [open]);

  // focus the listbox when it opens; close on outside pointer presses
  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!rootRef.current?.contains(target) && !listRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // after the hooks so the real Select can replace the skeleton in place
  if (skeleton) {
    return (
      <Skeleton
        width={fullWidth ? '100%' : '11rem'}
        height={`var(--glacier-control-height-${size})`}
        radius="var(--glacier-radius-lg)"
        className={className}
      />
    );
  }

  return (
    <div {...rest} ref={rootRef} className={cx(styles.root, styles[size], fullWidth && styles.fullWidth, className)}>
      <button
        ref={triggerRef}
        type="button"
        id={id ?? field?.id}
        className={cx(styles.trigger, styles[size], glass && styles.glass)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-describedby={field?.describedBy}
        aria-invalid={field?.invalid || undefined}
        aria-label={ariaLabel}
        data-placeholder={selectedOption ? undefined : true}
        onClick={() => (open ? closeMenu(true) : openMenu())}
        onKeyDown={onTriggerKeyDown}
      >
        <span className={styles.value}>{selectedOption ? selectedOption.label : placeholder}</span>
        {Chevrons}
      </button>
      {name && <input type="hidden" name={name} value={selected} />}
      {/* portaled so overflow-clipping ancestors and stacking contexts cannot
          cut the menu off; animates open only and closes instantly */}
      {open &&
        position &&
        createPortal(
          <motion.ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            dir={dir}
            className={cx(styles.menu, size === 'sm' && styles.menuSm)}
            style={position.style}
            tabIndex={-1}
            aria-label={ariaLabel}
            aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
            onKeyDown={onListKeyDown}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: position.openUp ? 4 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={reduce ? { duration: 0 } : transition(Speed.Fast, Ease.Out)}
          >
            {options.map((option, i) => (
              <li
                key={option.value}
                id={`${listboxId}-${i}`}
                role="option"
                className={styles.option}
                aria-selected={option.value === selected}
                aria-disabled={option.disabled || undefined}
                data-active={(i === activeIndex && !option.disabled) || undefined}
                data-disabled={option.disabled || undefined}
                onMouseEnter={() => !option.disabled && setActiveIndex(i)}
                onClick={() => commit(i)}
              >
                <span className={styles.check}>{option.value === selected && Check}</span>
                {option.label}
              </li>
            ))}
          </motion.ul>,
          document.body,
        )}
    </div>
  );
}
