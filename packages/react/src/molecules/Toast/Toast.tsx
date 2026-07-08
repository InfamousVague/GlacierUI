import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Spring, springTransition } from '@perfect/motion';
import { toastTones } from '@perfect/spec';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../internal/cx.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../i18n/messages.ts';
import { Skeleton } from '../../atoms/Skeleton/Skeleton.tsx';
import styles from './Toast.module.css';

// Derived from the spec so the tone union cannot drift.
export type ToastTone = (typeof toastTones)[number];

/** Per-tone auto-dismiss defaults, in milliseconds. */
const TONE_DURATION: Record<ToastTone, number> = {
  neutral: 4500,
  info: 4500,
  success: 3500,
  warning: 4500,
  danger: 7000,
};

const DismissIcon = (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

// ---- visual pill -----------------------------------------------------------

export interface ToastProps {
  tone?: ToastTone;
  /** The notification content. */
  message: ReactNode;
  /** Optional leading glyph. */
  icon?: ReactNode;
  /** Whether a trailing close control is shown. */
  dismissible?: boolean;
  /** Called when the pill or its dismiss control is pressed. */
  onDismiss?: () => void;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  className?: string;
}

/**
 * The visual toast pill. Rendered on its own it is a static notification;
 * the ToastProvider wraps it in motion and a portal. A danger toast announces
 * as an alert, other tones as a status.
 */
export function Toast({
  tone = 'neutral',
  message,
  icon,
  dismissible = true,
  onDismiss,
  glass = false,
  skeleton = false,
  className,
}: ToastProps) {
  const t = useT();
  if (skeleton) {
    return (
      <Skeleton
        width="18rem"
        height="2.75rem"
        radius="var(--perfect-radius-full)"
        className={className}
      />
    );
  }
  const alert = tone === 'danger';
  return (
    <div
      role={alert ? 'alert' : 'status'}
      aria-live={alert ? 'assertive' : 'polite'}
      className={cx(styles.pill, styles[tone], glass && styles.glass, className)}
      onClick={onDismiss}
    >
      {icon != null && <span className={styles.icon}>{icon}</span>}
      <span className={styles.message}>{message}</span>
      {dismissible && (
        <button
          type="button"
          aria-label={t(kitMessages.dismiss)}
          className={styles.dismiss}
          onClick={(e) => {
            e.stopPropagation();
            onDismiss?.();
          }}
        >
          {DismissIcon}
        </button>
      )}
    </div>
  );
}

// ---- provider + hook -------------------------------------------------------

export interface ToastOptions {
  tone?: ToastTone;
  message: ReactNode;
  icon?: ReactNode;
  /** Auto-dismiss delay in milliseconds; defaults by tone, 0 disables auto-dismiss. */
  duration?: number;
  /** Whether a trailing close control is shown. */
  dismissible?: boolean;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
}

interface CurrentToast extends ToastOptions {
  /** Bumped on every call so AnimatePresence swaps the pill on replace. */
  id: number;
}

export interface ToastContextValue {
  /** Show a toast, replacing any current one (latest wins, no queue). */
  toast: (options: ToastOptions) => void;
  /** Dismiss the current toast, if any. */
  dismiss: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Holds the single current toast, portals it to the bottom center of
 * document.body, and runs the auto-dismiss timer. A new toast replaces the
 * current one immediately: this is a deliberate latest-wins, no-queue design.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<CurrentToast | null>(null);
  const nextId = useRef(0);
  const reduce = useReducedMotion();

  const dismiss = useCallback(() => setCurrent(null), []);

  const toast = useCallback((options: ToastOptions) => {
    nextId.current += 1;
    setCurrent({ ...options, id: nextId.current });
  }, []);

  // Auto-dismiss the current toast; re-arms whenever it is replaced.
  useEffect(() => {
    if (!current) return;
    const tone = current.tone ?? 'neutral';
    const duration = current.duration ?? TONE_DURATION[tone] ?? 0;
    if (duration <= 0) return;
    const shownId = current.id;
    const timer = setTimeout(() => {
      // only clear if this toast is still the one on screen
      setCurrent((c) => (c && c.id === shownId ? null : c));
    }, duration);
    return () => clearTimeout(timer);
  }, [current]);

  const value = useMemo<ToastContextValue>(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className={styles.viewport}>
          <AnimatePresence>
            {current && (
              <motion.div
                key={current.id}
                className={styles.item}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                transition={reduce ? { duration: 0 } : springTransition(Spring.Snappy)}
              >
                <Toast
                  tone={current.tone}
                  message={current.message}
                  icon={current.icon}
                  dismissible={current.dismissible}
                  glass={current.glass}
                  onDismiss={dismiss}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

/**
 * Returns the imperative toast controls. Must be called under a ToastProvider.
 * `toast({ tone, message, icon?, duration?, dismissible? })` replaces the
 * current toast; `dismiss()` clears it.
 */
export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return value;
}
