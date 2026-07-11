import { useEffect, useRef, type ComponentProps, type KeyboardEvent } from 'react';
import type { ControlSize } from '../Button/Button.tsx';
import { cx } from '../../../internal/cx.ts';
import { useT } from '../../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../../i18n/messages.ts';
import { useControlled } from '../../../internal/useControlled.ts';
import { useField } from '../../../internal/FieldContext.ts';
import { useHaptics } from '../../../haptics/HapticsProvider.tsx';
import type { HapticKind } from '../../../haptics/haptics.ts';
import { Skeleton } from '../../feedback/Skeleton/Skeleton.tsx';
import styles from './NumberInput.module.css';

// Press-and-hold auto-repeat timing. The value steps once on a tap; on a hold it
// pauses (HOLD_DELAY), then repeats on an interval that decays from REPEAT_START
// toward REPEAT_FLOOR, so it climbs slowly and finishes rapidly, like an OS
// stepper.
const HOLD_DELAY = 400;
const REPEAT_START = 240;
const REPEAT_FLOOR = 40;
const REPEAT_DECAY = 0.82;

export interface NumberInputProps
  extends Omit<ComponentProps<'input'>, 'type' | 'value' | 'defaultValue' | 'onChange' | 'size'> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  size?: ControlSize;
  disabled?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
  'aria-label'?: string;
  /** Set to "none" to opt this stepper out of haptic feedback. */
  'data-haptic'?: string;
}

/**
 * A numeric stepper: a minus button, a centered native number input with
 * tabular figures, and a plus button, wrapped in a bordered group at control
 * height. Results clamp to min and max, and the step buttons disable at the
 * bounds.
 *
 * Haptics: every committed step (button tap, hold-repeat tick, ArrowUp or
 * ArrowDown) fires a selection tick; a step that clamps at min or max bumps
 * medium once until the value leaves the bound; typed digits are silent and
 * their blur-commit fires one light. data-haptic="none" opts all of it out.
 */
export function NumberInput({
  value,
  defaultValue,
  min,
  max,
  step = 1,
  onValueChange,
  size = 'md',
  disabled = false,
  skeleton = false,
  glass = false,
  className,
  id,
  'aria-label': ariaLabel,
  onKeyDown,
  onBlur,
  ...rest
}: NumberInputProps) {
  const t = useT();
  const field = useField();
  const fireHaptic = useHaptics();
  const [current, setCurrent] = useControlled(value, defaultValue ?? 0);

  const valueRef = useRef(current);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Haptic bookkeeping: one medium bump per arrival at a bound (re-armed once
  // the value leaves it), whether the next change event is a step or typing,
  // and whether a typed edit is waiting for its blur-commit tick.
  const boundBumped = useRef(false);
  const arrowStep = useRef(false);
  const typedDirty = useRef(false);
  // Keep the ref on the latest committed value, except mid-hold, where the ref
  // is the accumulator so rapid ticks are not clobbered by a controlled parent
  // that re-renders a step behind.
  if (holdTimer.current === null) valueRef.current = current;
  useEffect(
    () => () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
    },
    [],
  );

  if (skeleton) {
    return (
      <Skeleton
        width="8rem"
        height={`var(--glacier-control-height-${size})`}
        radius="var(--glacier-radius-lg)"
        className={className}
      />
    );
  }

  const clamp = (next: number): number => {
    let out = next;
    if (min !== undefined && out < min) out = min;
    if (max !== undefined && out > max) out = max;
    return out;
  };

  const atBound = (v: number): boolean =>
    (min !== undefined && v <= min) || (max !== undefined && v >= max);

  // The value-change haptics. The provider's delegated press haptic is opted
  // out on the step buttons (data-haptic="none" below) so a tap buzzes once,
  // from the committed change, not twice. The same opt-out on the component
  // silences these programmatic ticks too.
  const hapticsOff = rest['data-haptic'] === 'none';
  const tick = (kind: HapticKind): void => {
    if (!hapticsOff) fireHaptic(kind);
  };
  // One medium bump when a step runs into min or max; re-armed after leaving.
  const bumpAtBound = (): void => {
    if (boundBumped.current) return;
    boundBumped.current = true;
    tick('medium');
  };

  const commit = (next: number): void => {
    const clamped = clamp(next);
    if (!atBound(clamped)) boundBumped.current = false;
    valueRef.current = clamped;
    setCurrent(clamped);
    onValueChange?.(clamped);
  };

  // Steps one increment from the latest value; returns false at a bound so the
  // hold loop knows to stop. Every committed step ticks; hitting a bound bumps.
  const stepBy = (dir: 1 | -1): boolean => {
    const raw = valueRef.current + dir * step;
    const next = clamp(raw);
    if (next === valueRef.current) {
      bumpAtBound();
      return false;
    }
    valueRef.current = next;
    setCurrent(next);
    onValueChange?.(next);
    if (next !== raw) {
      bumpAtBound();
    } else {
      if (!atBound(next)) boundBumped.current = false;
      tick('selection');
    }
    return true;
  };

  const stopHold = (): void => {
    if (holdTimer.current !== null) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  // Tap steps once; hold pauses, then auto-repeats faster and faster until
  // release or a bound.
  const startHold = (dir: 1 | -1): void => {
    stopHold();
    if (!stepBy(dir)) return;
    let interval = REPEAT_START;
    const tick = (): void => {
      if (!stepBy(dir)) {
        stopHold();
        return;
      }
      interval = Math.max(REPEAT_FLOOR, interval * REPEAT_DECAY);
      holdTimer.current = setTimeout(tick, interval);
    };
    holdTimer.current = setTimeout(tick, HOLD_DELAY);
  };

  // ArrowUp and ArrowDown step natively inside the input; tick them here (the
  // change event cannot tell a step from typing). Any other key marks the next
  // change as typing, which stays silent until its blur-commit.
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const dir = event.key === 'ArrowUp' ? 1 : event.key === 'ArrowDown' ? -1 : 0;
    if (dir === 0) {
      arrowStep.current = false;
      return;
    }
    const raw = valueRef.current + dir * step;
    const next = clamp(raw);
    if (next === valueRef.current) {
      bumpAtBound();
      return;
    }
    arrowStep.current = true;
    if (next !== raw) {
      bumpAtBound();
    } else {
      if (!atBound(next)) boundBumped.current = false;
      tick('selection');
    }
  };

  const atMin = min !== undefined && current <= min;
  const atMax = max !== undefined && current >= max;

  return (
    <div className={cx(styles.group, styles[size], glass && styles.glass, disabled && styles.disabled, className)}>
      <button
        type="button"
        aria-label={t(kitMessages.decrease)}
        className={styles.step}
        disabled={disabled || atMin}
        // the provider's delegated press haptic is owned by the value-change
        // ticks instead, so a touch tap does not buzz twice
        data-haptic="none"
        onPointerDown={(event) => {
          // primary button/touch only; event.button is 0 (or absent) for those
          if (!event.button) startHold(-1);
        }}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
        onClick={(event) => {
          // detail 0 is a keyboard activation; pointer taps are handled on down
          if (event.detail === 0) stepBy(-1);
        }}
      >
        <span aria-hidden="true">-</span>
      </button>
      <input
        type="number"
        inputMode="numeric"
        id={id ?? field?.id}
        aria-label={ariaLabel}
        aria-describedby={field?.describedBy}
        aria-invalid={field?.invalid || undefined}
        className={styles.input}
        value={current}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(event) => {
          if (arrowStep.current) arrowStep.current = false;
          else typedDirty.current = true;
          commit(Number(event.target.value));
        }}
        onKeyDown={handleKeyDown}
        onBlur={(event) => {
          onBlur?.(event);
          if (typedDirty.current) {
            typedDirty.current = false;
            tick('light');
          }
        }}
        {...rest}
      />
      <button
        type="button"
        aria-label={t(kitMessages.increase)}
        className={styles.step}
        disabled={disabled || atMax}
        data-haptic="none"
        onPointerDown={(event) => {
          // primary button/touch only; event.button is 0 (or absent) for those
          if (!event.button) startHold(1);
        }}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
        onClick={(event) => {
          if (event.detail === 0) stepBy(1);
        }}
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}
