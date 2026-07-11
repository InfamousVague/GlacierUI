import { useRef, useState, type ChangeEvent, type ComponentProps } from 'react';
import { otpFieldTypes } from '@glacier/spec';
import { cx } from '../../../internal/cx.ts';
import { useControlled } from '../../../internal/useControlled.ts';
import { useT } from '../../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../../i18n/messages.ts';
import { Skeleton } from '../../feedback/Skeleton/Skeleton.tsx';
import styles from './OtpField.module.css';

// characters each mode accepts; everything else is stripped on entry
const FILTERS = {
  numeric: /[^0-9]/g,
  alphanumeric: /[^0-9a-zA-Z]/g,
} as const;

const MASK_CHAR = '•';

// Derived from the spec so the union cannot drift.
export type OtpFieldType = (typeof otpFieldTypes)[number];

// skeleton geometry per size, mirroring the css so loading never shifts layout
const SKELETON_CELL = {
  sm: { width: '2rem', height: 'var(--glacier-control-height-sm)' },
  md: { width: '2.5rem', height: 'var(--glacier-control-height-md)' },
  lg: { width: '3rem', height: 'var(--glacier-control-height-lg)' },
} as const;

export interface OtpFieldProps
  extends Omit<ComponentProps<'div'>, 'onChange' | 'defaultValue' | 'children'> {
  /** Number of code characters. */
  length?: number;
  /** Controlled code value. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Called with the sanitized code on every change. */
  onValueChange?: (value: string) => void;
  /** Called once with the full code when the last cell fills. */
  onComplete?: (value: string) => void;
  /** Which characters the code accepts. */
  type?: OtpFieldType;
  /** Renders dots instead of the entered characters. */
  masked?: boolean;
  /** Draws a separator dash after every N cells, e.g. 3 for a 123-456 code. */
  groupSize?: number;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  /** Paints the invalid treatment, matching Input's aria-invalid styling. */
  error?: boolean;
  autoFocus?: boolean;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
  /** Renders placeholders with the component's exact geometry. */
  skeleton?: boolean;
  /** Accessible name for the code input; defaults to the localized "One-time code". */
  'aria-label'?: string;
}

/**
 * A one-time passcode entry. One real text input is stretched invisibly across
 * the visual cells, so typing, backspace, paste, and platform code autofill
 * (autocomplete="one-time-code") all behave natively while the cells render
 * each character with a blinking caret in the next empty cell. Codes read left
 * to right in every locale, so the row is pinned ltr.
 */
export function OtpField({
  length = 6,
  value: valueProp,
  defaultValue,
  onValueChange,
  onComplete,
  type = 'numeric',
  masked = false,
  groupSize,
  size = 'md',
  disabled = false,
  error = false,
  autoFocus = false,
  glass = false,
  skeleton = false,
  className,
  'aria-label': ariaLabel,
  ...rest
}: OtpFieldProps) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useControlled(valueProp, defaultValue ?? '');
  const [focused, setFocused] = useState(false);

  if (skeleton) {
    const cell = SKELETON_CELL[size];
    return (
      <div className={cx(styles.cells, className)} aria-hidden="true">
        {Array.from({ length }, (_, i) => (
          <Skeleton key={i} width={cell.width} height={cell.height} radius="var(--glacier-radius-md)" />
        ))}
      </div>
    );
  }

  // typing and backspace act on the tail, so the caret always sits at the end
  const pinSelection = () => {
    const el = inputRef.current;
    if (el) el.setSelectionRange(el.value.length, el.value.length);
  };

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value.replace(FILTERS[type], '').slice(0, length);
    if (next === value) return;
    setValue(next);
    onValueChange?.(next);
    if (next.length === length) onComplete?.(next);
  }

  function handleFocus() {
    setFocused(true);
    pinSelection();
  }

  function handleBlur() {
    setFocused(false);
  }

  const activeIndex = focused ? Math.min(value.length, length - 1) : -1;

  return (
    <div
      {...rest}
      className={cx(styles.root, styles[size], glass && styles.glass, className)}
      data-disabled={disabled || undefined}
      data-error={error || undefined}
    >
      <div className={styles.cells} dir="ltr" aria-hidden="true">
        {Array.from({ length }, (_, i) => {
          const char = value[i];
          const showSeparator = groupSize != null && groupSize > 0 && (i + 1) % groupSize === 0 && i < length - 1;
          return [
            <span
              key={`cell-${i}`}
              className={styles.cell}
              data-cell=""
              data-filled={char != null || undefined}
              data-active={i === activeIndex || undefined}
            >
              {char != null ? (masked ? MASK_CHAR : char) : null}
              {i === activeIndex && char == null && <span className={styles.caret} />}
            </span>,
            showSeparator ? <span key={`sep-${i}`} className={styles.separator} data-separator="" /> : null,
          ];
        })}
      </div>
      <input
        ref={inputRef}
        className={styles.input}
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSelect={pinSelection}
        disabled={disabled}
        autoFocus={autoFocus}
        autoComplete="one-time-code"
        inputMode={type === 'numeric' ? 'numeric' : 'text'}
        pattern={type === 'numeric' ? '[0-9]*' : undefined}
        maxLength={length}
        spellCheck={false}
        autoCapitalize="off"
        aria-label={ariaLabel ?? t(kitMessages.oneTimeCode)}
        aria-invalid={error || undefined}
      />
    </div>
  );
}
