import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../i18n/messages.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { useField } from '../../internal/FieldContext.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './SearchField.module.css';

export interface SearchFieldProps
  extends Omit<ComponentProps<'input'>, 'value' | 'defaultValue' | 'onChange' | 'size'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Right-aligned slot for a keyboard shortcut hint, e.g. a Kbd. */
  shortcut?: ReactNode;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
}

export function SearchField({
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  placeholder = 'Search',
  size = 'md',
  shortcut,
  skeleton = false,
  glass = false,
  className,
  id,
  ...rest
}: SearchFieldProps) {
  const t = useT();
  const field = useField();
  const [value, setValue] = useControlled(controlledValue, defaultValue);

  if (skeleton) {
    return (
      <Skeleton
        width="100%"
        height={`var(--perfect-control-height-${size})`}
        radius="var(--perfect-radius-lg)"
        className={className}
      />
    );
  }

  return (
    <div className={cx(styles.wrap, styles[size], glass && styles.glass, className)}>
      <svg
        className={styles.icon}
        aria-hidden="true"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="m11 11 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        id={id ?? field?.id}
        type="search"
        aria-describedby={field?.describedBy}
        aria-invalid={field?.invalid || undefined}
        placeholder={placeholder}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          onValueChange?.(event.target.value);
        }}
        className={styles.input}
        {...rest}
      />
      {value ? (
        <button
          type="button"
          className={styles.clear}
          aria-label={t(kitMessages.clearSearch)}
          onClick={() => {
            setValue('');
            onValueChange?.('');
          }}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m4 4 8 8M12 4l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ) : null}
      {shortcut ? <span className={styles.shortcut}>{shortcut}</span> : null}
    </div>
  );
}
