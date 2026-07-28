import { useRef, type ComponentProps, type KeyboardEvent, type ReactNode } from 'react';
import type { Density } from '@glacier/tokens';
import { cx } from '../../internal/cx.ts';
import { kitMessages } from '../../i18n/messages.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { ScrollArea } from '../ScrollArea/ScrollArea.tsx';
import styles from './DensitySelector.module.css';

export const densityModes = ['extra-compact', 'compact', 'comfortable', 'spacious', 'more-space'] as const;
export type DensityMode = Density;

export interface DensitySelectorProps extends Omit<ComponentProps<'div'>, 'children' | 'onChange'> {
  /** The active density token value. */
  value: DensityMode;
  /** Called when a density card is selected. */
  onValueChange: (value: DensityMode) => void;
  /** Optional label overrides keyed by density value. */
  labels?: Partial<Record<DensityMode, ReactNode>>;
  /** Disables every density option. */
  disabled?: boolean;
  /** Accessible name for the radio group. */
  'aria-label': string;
}

function DensityPreview({ mode }: { mode: DensityMode }) {
  return (
    <span className={styles.preview} data-mode={mode} aria-hidden="true">
      <span className={styles.chrome}>
        <span className={styles.sidebarControl} />
        <span className={styles.searchControl}><i /></span>
      </span>
      <span className={styles.canvas}>
        <i className={`${styles.line} ${styles.title}`} />
        <i className={`${styles.line} ${styles.body}`} />
        <i className={`${styles.line} ${styles.bodyShort}`} />
        <i className={`${styles.line} ${styles.body}`} />
      </span>
    </span>
  );
}

/** A scroll-safe visual density picker with radio-card keyboard interactions. */
export function DensitySelector({
  value,
  onValueChange,
  labels,
  disabled = false,
  className,
  'aria-label': ariaLabel,
  ...rest
}: DensitySelectorProps) {
  const t = useT();
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedValue = densityModes.find((mode) => mode === value) ?? 'comfortable';
  const defaultLabels: Record<DensityMode, string> = {
    'extra-compact': t(kitMessages.densityExtraCompact),
    compact: t(kitMessages.densityCompact),
    comfortable: t(kitMessages.densityDefault),
    spacious: t(kitMessages.densityComfortable),
    'more-space': t(kitMessages.densityMoreSpace),
  };

  const select = (mode: DensityMode, focus = false) => {
    if (disabled) return;
    onValueChange(mode);
    if (!focus) return;
    const option = optionRefs.current[densityModes.indexOf(mode)];
    option?.focus();
    option?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, mode: DensityMode) => {
    const index = densityModes.indexOf(mode);
    let nextIndex: number | undefined;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % densityModes.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + densityModes.length) % densityModes.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = densityModes.length - 1;
    if (nextIndex === undefined) return;

    const next = densityModes[nextIndex];
    if (!next) return;
    event.preventDefault();
    select(next, true);
  };

  return (
    <ScrollArea
      orientation="horizontal"
      className={cx(styles.root, className)}
      role="radiogroup"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      {...rest}
    >
      <div className={styles.options}>
        {densityModes.map((mode, index) => {
          const selected = selectedValue === mode;
          return (
            <button
              key={mode}
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              className={styles.option}
              data-selected={selected || undefined}
              data-haptic="selection"
              disabled={disabled}
              onClick={() => select(mode)}
              onKeyDown={(event) => onKeyDown(event, mode)}
            >
              <DensityPreview mode={mode} />
              <span className={styles.label}>{labels?.[mode] ?? defaultLabels[mode]}</span>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}