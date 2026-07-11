import { motion, useReducedMotion } from 'motion/react';
import { Ease, Speed, transition } from '@glacier/motion';
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
import type { ControlSize } from '../../atoms/inputs/Button/Button.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import { cx } from '../../internal/cx.ts';
import { useDirection } from '../../internal/direction.ts';
import { useField } from '../../internal/FieldContext.ts';
import { useAnchoredPosition } from '../../internal/useAnchoredPosition.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../i18n/messages.ts';
import styles from './MultiSelect.module.css';

export interface MultiSelectOption {
  /** Unique submitted value. */
  value: string;
  /** Content rendered in a tag and option row. */
  label: ReactNode;
  /** Plain-text filtering value when label is not a string. */
  textValue?: string;
  /** Optional muted supporting content below the label. */
  description?: ReactNode;
  disabled?: boolean;
}

export interface MultiSelectProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  options: MultiSelectOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (value: string) => void;
  filter?: (option: MultiSelectOption, inputValue: string) => boolean;
  placeholder?: string;
  emptyState?: ReactNode;
  loading?: boolean;
  size?: ControlSize;
  fullWidth?: boolean;
  disabled?: boolean;
  skeleton?: boolean;
  glass?: boolean;
  /** Renders one hidden form input per selected value when set. */
  name?: string;
  id?: string;
  'aria-label'?: string;
  className?: string;
}

interface VisibleOption {
  option: MultiSelectOption;
  index: number;
}

function optionText(option: MultiSelectOption | undefined): string {
  if (!option) return '';
  if (option.textValue !== undefined) return option.textValue;
  return typeof option.label === 'string' ? option.label : option.value;
}

const Chevron = (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Check = (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2.5 6.5 5 9 9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Remove = (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/**
 * An editable multi-value combobox. It keeps focus on the native input,
 * exposes active suggestions with aria-activedescendant, and submits repeated
 * hidden form inputs so a normal form can retain each selected value.
 */
export function MultiSelect({
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
}: MultiSelectProps) {
  const t = useT();
  const listboxId = useId();
  const field = useField();
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [selected, setSelected] = useControlled(value, defaultValue ?? []);
  const [query, setQuery] = useControlled(inputValue, defaultInputValue ?? '');
  const [open, setOpen] = useState(false);
  const [activeValue, setActiveValue] = useState<string | undefined>();
  // the listbox portals to the body, past any scoped dir ancestor - carry the
  // input's resolved direction with it
  const dir = useDirection(inputRef);
  const position = useAnchoredPosition(open, inputRef, listRef, { placement: 'bottom-start', matchWidth: true });

  function matches(option: MultiSelectOption, nextQuery: string): boolean {
    if (filter) return filter(option, nextQuery);
    return optionText(option).toLocaleLowerCase().includes(nextQuery.trim().toLocaleLowerCase());
  }

  function optionsFor(nextQuery: string): VisibleOption[] {
    return options.flatMap((option, index) => (matches(option, nextQuery) ? [{ option, index }] : []));
  }

  const visibleOptions = optionsFor(query);
  const activeOption = visibleOptions.find(({ option }) => option.value === activeValue);
  const activeId = activeOption ? `${listboxId}-option-${activeOption.index}` : undefined;
  const selectedOptions = selected.flatMap((selectedValue) => {
    const option = options.find((candidate) => candidate.value === selectedValue);
    return option ? [option] : [];
  });

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
    setActiveValue(firstEnabled(nextOptions));
    setOpen(true);
  }

  function moveActive(delta: 1 | -1) {
    const enabled = visibleOptions.filter(({ option }) => !option.disabled);
    if (enabled.length === 0) return;
    const current = enabled.findIndex(({ option }) => option.value === activeValue);
    const next = current === -1 ? (delta === 1 ? 0 : enabled.length - 1) : Math.min(Math.max(current + delta, 0), enabled.length - 1);
    setActiveValue(enabled[next]?.option.value);
  }

  function updateSelected(next: string[]) {
    setSelected(next);
    onValueChange?.(next);
  }

  function toggleOption(option: MultiSelectOption | undefined) {
    if (!option || option.disabled) return;
    const next = selected.includes(option.value)
      ? selected.filter((selectedValue) => selectedValue !== option.value)
      : [...selected, option.value];
    updateSelected(next);
    setQuery('');
    onInputValueChange?.('');
    setActiveValue(option.value);
    setOpen(true);
  }

  function removeValue(selectedValue: string) {
    updateSelected(selected.filter((valueToKeep) => valueToKeep !== selectedValue));
    inputRef.current?.focus();
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
          toggleOption(activeOption?.option);
        }
        break;
      case 'Escape':
        if (open) {
          event.preventDefault();
          setOpen(false);
        }
        break;
      case 'Backspace': {
        const lastSelected = selected.length > 0 ? selected[selected.length - 1] : undefined;
        if (query === '' && lastSelected !== undefined) {
          event.preventDefault();
          removeValue(lastSelected);
        }
        break;
      }
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
      <div className={cx(styles.control, styles[size], glass && styles.glass, field?.invalid && styles.invalid)}>
        <div className={styles.tags} role="list">
          {selectedOptions.map((option) => (
            <span key={option.value} className={styles.tag} role="listitem">
              <span className={styles.tagLabel}>{option.label}</span>
              {!disabled && (
                <button
                  type="button"
                  className={styles.tagRemove}
                  aria-label={`${t(kitMessages.dismiss)} ${optionText(option)}`}
                  onClick={() => removeValue(option.value)}
                >
                  {Remove}
                </button>
              )}
            </span>
          ))}
        </div>
        <input
          ref={inputRef}
          id={id ?? field?.id}
          type="text"
          role="combobox"
          autoComplete="off"
          className={styles.input}
          value={query}
          placeholder={selectedOptions.length === 0 ? placeholder : undefined}
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
      {name && selected.map((selectedValue) => <input key={selectedValue} type="hidden" name={name} value={selectedValue} />)}
      {open &&
        createPortal(
          <motion.ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            dir={dir}
            aria-label={ariaLabel}
            aria-multiselectable="true"
            aria-busy={loading || undefined}
            className={styles.menu}
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
              visibleOptions.map(({ option, index }) => {
                const isSelected = selected.includes(option.value);
                return (
                  <li
                    key={option.value}
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled || undefined}
                    data-active={option.value === activeValue || undefined}
                    data-disabled={option.disabled || undefined}
                    data-selected={isSelected || undefined}
                    className={styles.option}
                    onMouseEnter={() => !option.disabled && setActiveValue(option.value)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => toggleOption(option)}
                  >
                    <span className={styles.optionContent}>
                      <span className={styles.optionLabel}>{option.label}</span>
                      {option.description && <span className={styles.optionDescription}>{option.description}</span>}
                    </span>
                    {isSelected && <span className={styles.check}>{Check}</span>}
                  </li>
                );
              })
            )}
          </motion.ul>,
          document.body,
        )}
    </div>
  );
}