import { motion, useReducedMotion } from 'motion/react';
import { Speed, Ease, transition } from '@glacier/motion';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../internal/cx.ts';
import { useDirection } from '../../internal/direction.ts';
import { useAnchoredPosition } from '../../internal/useAnchoredPosition.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { useField } from '../../internal/FieldContext.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../i18n/messages.ts';
import type { ControlSize } from '../../atoms/inputs/Button/Button.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import styles from './Combobox.module.css';

export interface ComboboxOption {
  /** Unique submitted value. */
  value: string;
  /** Content rendered in the input and result row. */
  label: ReactNode;
  /** Plain-text filtering value when label is not a string. */
  textValue?: string;
  /** Optional muted supporting content below the label. */
  description?: ReactNode;
  disabled?: boolean;
}

export interface ComboboxProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  options: ComboboxOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (value: string) => void;
  filter?: (option: ComboboxOption, inputValue: string) => boolean;
  placeholder?: string;
  emptyState?: ReactNode;
  loading?: boolean;
  size?: ControlSize;
  fullWidth?: boolean;
  disabled?: boolean;
  skeleton?: boolean;
  glass?: boolean;
  name?: string;
  id?: string;
  'aria-label'?: string;
  className?: string;
}

interface VisibleOption {
  option: ComboboxOption;
  index: number;
}

function optionText(option: ComboboxOption | undefined): string {
  if (!option) return '';
  if (option.textValue !== undefined) return option.textValue;
  return typeof option.label === 'string' ? option.label : option.value;
}

const Chevron = (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * An editable combobox with a portaled listbox. It keeps focus on the native
 * input and exposes the active option through aria-activedescendant, so normal
 * text editing and list navigation remain available together.
 */
export function Combobox({
  options,
  value,
  defaultValue,
  onValueChange,
  inputValue,
  defaultInputValue,
  onInputValueChange,
  filter,
  placeholder,
  emptyState,
  loading = false,
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
}: ComboboxProps) {
  const t = useT();
  const listboxId = useId();
  const field = useField();
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const initialSelected = defaultValue ?? '';
  const initialOption = options.find((option) => option.value === initialSelected);
  const [selected, setSelected] = useControlled(value, initialSelected);
  const [query, setQuery] = useControlled(inputValue, defaultInputValue ?? optionText(initialOption));
  const [open, setOpen] = useState(false);
  const [activeValue, setActiveValue] = useState<string | undefined>();
  // the listbox portals to the body, past any scoped dir ancestor - carry the
  // input's resolved direction with it
  const dir = useDirection(inputRef);
  const position = useAnchoredPosition(open, inputRef, listRef, { placement: 'bottom-start', matchWidth: true });
  const selectedOption = options.find((option) => option.value === selected);

  function matches(option: ComboboxOption, nextQuery: string): boolean {
    if (filter) return filter(option, nextQuery);
    return optionText(option).toLocaleLowerCase().includes(nextQuery.trim().toLocaleLowerCase());
  }

  function optionsFor(nextQuery: string): VisibleOption[] {
    return options.flatMap((option, index) => (matches(option, nextQuery) ? [{ option, index }] : []));
  }

  const visibleOptions = optionsFor(query);
  const activeOption = visibleOptions.find(({ option }) => option.value === activeValue);
  const activeId = activeOption ? `${listboxId}-option-${activeOption.index}` : undefined;

  useEffect(() => {
    if (value !== undefined && inputValue === undefined) setQuery(optionText(selectedOption));
  }, [inputValue, selectedOption, setQuery, value]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !listRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  function firstEnabled(items: VisibleOption[]): string | undefined {
    return items.find(({ option }) => !option.disabled)?.option.value;
  }

  function openMenu(nextQuery = query) {
    if (disabled) return;
    const nextOptions = optionsFor(nextQuery);
    const matchingSelection = nextOptions.find(({ option }) => option.value === selected && !option.disabled)?.option.value;
    setActiveValue(matchingSelection ?? firstEnabled(nextOptions));
    setOpen(true);
  }

  function moveActive(delta: 1 | -1) {
    const enabled = visibleOptions.filter(({ option }) => !option.disabled);
    if (enabled.length === 0) return;
    const current = enabled.findIndex(({ option }) => option.value === activeValue);
    const next = current === -1 ? (delta === 1 ? 0 : enabled.length - 1) : Math.min(Math.max(current + delta, 0), enabled.length - 1);
    setActiveValue(enabled[next]?.option.value);
  }

  function commit(option: ComboboxOption | undefined) {
    if (!option || option.disabled) return;
    setSelected(option.value);
    onValueChange?.(option.value);
    const nextQuery = optionText(option);
    setQuery(nextQuery);
    onInputValueChange?.(nextQuery);
    setActiveValue(option.value);
    inputRef.current?.focus();
    setOpen(false);
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!open) openMenu();
        else moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!open) openMenu();
        else moveActive(-1);
        break;
      case 'Home':
        if (open) {
          event.preventDefault();
          setActiveValue(firstEnabled(visibleOptions));
        }
        break;
      case 'End':
        if (open) {
          event.preventDefault();
          const enabled = visibleOptions.filter(({ option }) => !option.disabled);
          setActiveValue(enabled[enabled.length - 1]?.option.value);
        }
        break;
      case 'Enter':
        if (open) {
          event.preventDefault();
          commit(activeOption?.option);
        }
        break;
      case 'Escape':
        if (open) {
          event.preventDefault();
          setOpen(false);
        }
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  }

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

  const menuStyle: CSSProperties = position?.style ?? { position: 'fixed', visibility: 'hidden' };

  return (
    <div {...rest} ref={rootRef} className={cx(styles.root, fullWidth && styles.fullWidth, className)}>
      <div className={styles.control}>
        <input
          ref={inputRef}
          id={id ?? field?.id}
          type="text"
          role="combobox"
          autoComplete="off"
          className={cx(styles.input, styles[size], glass && styles.glass)}
          value={query}
          placeholder={placeholder}
          disabled={disabled}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-activedescendant={open ? activeId : undefined}
          aria-describedby={field?.describedBy}
          aria-invalid={field?.invalid || undefined}
          aria-label={ariaLabel}
          onFocus={() => openMenu()}
          onClick={() => openMenu()}
          onChange={(event) => {
            const nextQuery = event.currentTarget.value;
            setQuery(nextQuery);
            onInputValueChange?.(nextQuery);
            setActiveValue(firstEnabled(optionsFor(nextQuery)));
            setOpen(true);
          }}
          onKeyDown={onInputKeyDown}
        />
        <span className={styles.indicator}>{Chevron}</span>
      </div>
      {name && <input type="hidden" name={name} value={selected} />}
      {open &&
        createPortal(
          <motion.ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            dir={dir}
            aria-label={ariaLabel}
            aria-busy={loading || undefined}
            className={cx(styles.menu, styles[size])}
            style={menuStyle}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={reduce ? { duration: 0 } : transition(Speed.Fast, Ease.Out)}
          >
            {loading ? (
              <li role="presentation" className={styles.message}>{t(kitMessages.loading)}</li>
            ) : visibleOptions.length === 0 ? (
              <li role="presentation" className={styles.message}>{emptyState ?? t(kitMessages.noOptions)}</li>
            ) : (
              visibleOptions.map(({ option, index }) => (
                <li
                  key={option.value}
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={option.value === selected}
                  aria-disabled={option.disabled || undefined}
                  data-active={option.value === activeValue || undefined}
                  data-disabled={option.disabled || undefined}
                  className={styles.option}
                  onMouseEnter={() => !option.disabled && setActiveValue(option.value)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => commit(option)}
                >
                  <span className={styles.optionLabel}>{option.label}</span>
                  {option.description && <span className={styles.optionDescription}>{option.description}</span>}
                </li>
              ))
            )}
          </motion.ul>,
          document.body,
        )}
    </div>
  );
}