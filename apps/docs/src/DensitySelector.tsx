import { useRef, type KeyboardEvent } from 'react';
import { useT } from '@glacier/react';
import { PanelLeft, Search } from '@glacier/icons';
import type { Density } from '@glacier/tokens';
import { m } from './i18n.ts';
import styles from './DensitySelector.module.css';

export const densityModes = ['extra-compact', 'compact', 'comfortable', 'spacious', 'more-space'] as const;

export type DensityMode = Density;

interface DensitySelectorProps {
  value: DensityMode;
  onValueChange: (value: DensityMode) => void;
  'aria-label': string;
}

function DensityPreview({ mode }: { mode: DensityMode }) {
  return (
    <span className={styles.preview} data-mode={mode} aria-hidden="true">
      <span className={styles.chrome}>
        <span className={styles.sidebarControl}><PanelLeft size={9} strokeWidth={2} /></span>
        <span className={styles.searchControl}><Search size={8} strokeWidth={2} /></span>
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

/** A visual density control with keyboard-equivalent radio-card interactions. */
export function DensitySelector({ value, onValueChange, 'aria-label': ariaLabel }: DensitySelectorProps) {
  const t = useT();
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedValue = densityModes.find((mode) => mode === value) ?? 'comfortable';
  const labels: Record<DensityMode, string> = {
    'extra-compact': t(m.densityExtraCompact),
    compact: t(m.compact),
    comfortable: t(m.densityDefault),
    spacious: t(m.comfortable),
    'more-space': t(m.densityMoreSpace),
  };

  const select = (mode: DensityMode, focus = false) => {
    onValueChange(mode);
    if (focus) optionRefs.current[densityModes.indexOf(mode)]?.focus();
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
    <div className={styles.root} role="radiogroup" aria-label={ariaLabel}>
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
            onClick={() => select(mode)}
            onKeyDown={(event) => onKeyDown(event, mode)}
          >
            <DensityPreview mode={mode} />
            <span className={styles.label}>{labels[mode]}</span>
          </button>
        );
      })}
    </div>
  );
}