import { motion, useReducedMotion } from 'motion/react';
import { Speed, Ease, transition } from '@glacier/motion';
import { format } from 'date-fns';
import type { DayPickerLocale } from 'react-day-picker';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays } from '@glacier/icons';
import { cx } from '../../internal/cx.ts';
import { useDirection } from '../../internal/direction.ts';
import { useAnchoredPosition } from '../../internal/useAnchoredPosition.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { useField } from '../../internal/FieldContext.ts';
import { defineMessages } from '../../i18n/locale.ts';
import { useLocale, useT } from '../../i18n/LocaleProvider.tsx';
import type { ControlSize } from '../../atoms/inputs/Button/Button.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import { Calendar } from './Calendar.tsx';
import styles from './DatePicker.module.css';

const messages = defineMessages({
  placeholder: {
    en: 'Pick a date',
    es: 'Elige una fecha',
    fr: 'Choisir une date',
    de: 'Datum wählen',
    ja: '日付を選択',
    pt: 'Escolher uma data',
    zh: '选择日期',
    ar: 'اختر تاريخًا',
  },
  calendar: {
    en: 'Calendar',
    es: 'Calendario',
    fr: 'Calendrier',
    de: 'Kalender',
    ja: 'カレンダー',
    pt: 'Calendário',
    zh: '日历',
    ar: 'التقويم',
  },
});

export interface DatePickerProps extends Omit<ComponentProps<'div'>, 'defaultValue'> {
  /** Controlled selected date. */
  value?: Date;
  /** Uncontrolled initial date. */
  defaultValue?: Date;
  /** Called with the next date, or undefined when the selected day is unpicked. */
  onValueChange?: (value: Date | undefined) => void;
  /** Hint shown while no date is selected; defaults to the localized prompt. */
  placeholder?: string;
  size?: ControlSize;
  fullWidth?: boolean;
  disabled?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Renders the frosted glass material on the trigger instead of a solid surface. */
  glass?: boolean;
  /** Earliest selectable date. */
  min?: Date;
  /** Latest selectable date. */
  max?: Date;
  /** Marks matching dates disabled and unselectable. */
  disabledDates?: (date: Date) => boolean;
  /** Overrides the date-fns locale derived from the kit locale. */
  dateFnsLocale?: DayPickerLocale;
  /** Submitted with forms via a hidden input (ISO yyyy-MM-dd) when set. */
  name?: string;
  id?: string;
  'aria-label'?: string;
  className?: string;
}

/**
 * A single-date picker: an Input-metric trigger that opens a portaled Calendar
 * in an anchored glass panel. The panel flips and clamps through the shared
 * anchored-position engine, tracks scroll, and dismisses on Escape or an
 * outside press, restoring focus to the trigger. The value renders through
 * Intl.DateTimeFormat in the kit locale; when name is set an ISO yyyy-MM-dd
 * hidden input submits with native forms. Ranges are deliberately not picked
 * from this popover - use an inline Calendar in range mode, where both
 * endpoints stay visible while the range is chosen.
 */
export function DatePicker({
  value,
  defaultValue,
  onValueChange,
  placeholder,
  size = 'md',
  fullWidth = false,
  disabled = false,
  skeleton = false,
  glass = false,
  min,
  max,
  disabledDates,
  dateFnsLocale,
  name,
  id,
  className,
  'aria-label': ariaLabel,
  ...rest
}: DatePickerProps) {
  const t = useT();
  const locale = useLocale();
  const panelId = useId();
  const field = useField();
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useControlled<Date | undefined>(value, defaultValue);
  const [open, setOpen] = useState(false);
  // the panel portals to the body, past any scoped dir ancestor - carry the
  // trigger's resolved direction with it
  const dir = useDirection(triggerRef);
  const position = useAnchoredPosition(open, triggerRef, panelRef, { placement: 'bottom-start' });

  const formatter = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }), [locale]);

  function close(refocus: boolean) {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }

  function handleSelect(next: Date | undefined) {
    setSelected(next);
    onValueChange?.(next);
    if (next) close(true);
  }

  function onPanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close(true);
    }
  }

  // move focus onto the calendar's focus-target day when the panel opens;
  // close on outside pointer presses
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !panelRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // after the hooks so the real DatePicker can replace the skeleton in place
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

  const panelStyle: CSSProperties = position?.style ?? { position: 'fixed', visibility: 'hidden' };

  return (
    <div {...rest} ref={rootRef} className={cx(styles.root, styles[size], fullWidth && styles.fullWidth, className)}>
      <button
        ref={triggerRef}
        type="button"
        id={id ?? field?.id}
        className={cx(styles.trigger, styles[size], glass && styles.glass)}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-describedby={field?.describedBy}
        aria-invalid={field?.invalid || undefined}
        aria-label={ariaLabel}
        data-placeholder={selected ? undefined : true}
        onClick={() => (open ? close(true) : setOpen(true))}
      >
        <CalendarDays className={styles.icon} size={16} aria-hidden="true" />
        <span className={styles.value}>
          {selected ? formatter.format(selected) : (placeholder ?? t(messages.placeholder))}
        </span>
      </button>
      {name && <input type="hidden" name={name} value={selected ? format(selected, 'yyyy-MM-dd') : ''} />}
      {/* portaled so overflow-clipping ancestors and stacking contexts cannot
          cut the panel off; animates open only and closes instantly */}
      {open &&
        createPortal(
          <motion.div
            ref={panelRef}
            id={panelId}
            role="dialog"
            dir={dir}
            aria-label={ariaLabel ?? t(messages.calendar)}
            className={styles.panel}
            style={panelStyle}
            onKeyDown={onPanelKeyDown}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={reduce ? { duration: 0 } : transition(Speed.Fast, Ease.Out)}
          >
            <Calendar
              bare
              mode="single"
              value={selected}
              onValueChange={handleSelect}
              min={min}
              max={max}
              disabledDates={disabledDates}
              dateFnsLocale={dateFnsLocale}
              aria-label={ariaLabel}
            />
          </motion.div>,
          document.body,
        )}
    </div>
  );
}
