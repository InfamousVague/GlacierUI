import { AnimatePresence, motion, useIsPresent, useReducedMotion, type Variants } from 'motion/react';
import { Speed, Ease, transition } from '@glacier/motion';
import { SkeletonVariant, Variant } from '@glacier/spec';
import { useEffect, useId, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { useDirection } from '../../internal/direction.ts';
import { useT, kitMessages } from '../../i18n/index.ts';
import { Steps } from '../../atoms/feedback/Steps/Steps.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import { Button } from '../../atoms/inputs/Button/Button.tsx';
import { Heading } from '../../atoms/display/Typography/Heading.tsx';
import styles from './Wizard.module.css';

export interface WizardStep {
  /** Stable identity; keys the panel transition. */
  id: string;
  /** Step name: shown as the panel heading and used for a11y labelling. */
  label: ReactNode;
  /** The panel body for this step. */
  content: ReactNode;
  /**
   * The forward gate, run when Next/Finish is pressed on this step:
   * `true` passes; `false` blocks silently (the step's own fields display
   * their errors); a string blocks AND shows that message in the wizard's
   * error live region. May return a Promise of the same: Next shows its
   * loading state and the footer is inert until it settles; a rejection is
   * treated as a silent block.
   */
  validate?: () => boolean | string | Promise<boolean | string>;
}

export interface WizardProps extends Omit<ComponentProps<'div'>, 'children'> {
  steps: WizardStep[];
  /** Required accessible name for the wizard region. */
  'aria-label': string;
  /** Controlled zero-based index of the active step. */
  activeStep?: number;
  /** Uncontrolled start; THE resume point (default 0). */
  defaultActiveStep?: number;
  /** Fires with the new index on every committed navigation. */
  onStepChange?: (index: number) => void;
  /**
   * Save callback: fires with the index being LEFT when its gate passes on
   * forward navigation. The parent persists it; resume via defaultActiveStep.
   */
  onSave?: (index: number) => void;
  /** Finish pressed on the last step and its gate passed. */
  onComplete?: () => void;
  /** Defaults to the localized kit Previous message. */
  previousLabel?: ReactNode;
  /** Defaults to the localized kit Next message. */
  nextLabel?: ReactNode;
  /** Defaults to the localized kit Done message. */
  finishLabel?: ReactNode;
  /** Heading element for the step label. */
  headingLevel?: 2 | 3;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
}

function isThenable(value: unknown): value is Promise<boolean | string> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as PromiseLike<unknown>).then === 'function'
  );
}

/** How far (px) a step slides in from its entering side; 0 under reduced motion. */
const STEP_SHIFT = 12;

/** A gate message plus a nonce, so retrying with the SAME message still swaps
    the rendered node and the live region re-announces it. */
interface GateError {
  text: string;
  nonce: number;
}

/**
 * Wraps a step's content inside the AnimatePresence child. popLayout keeps
 * the outgoing panel mounted while it fades; marking that exiting clone inert
 * removes its stale focusables and text from the tab order and the
 * accessibility tree for the duration of the transition.
 */
function StepShell({ children }: { children: ReactNode }) {
  const present = useIsPresent();
  return (
    <div inert={present ? undefined : true} aria-hidden={present ? undefined : true}>
      {children}
    </div>
  );
}

/**
 * A stepped flow: the connected Steps header, one step panel at a time, and a
 * gated footer. Next runs the active step's validate before advancing (and
 * fires onSave for the step being left); Previous always returns ungated.
 * A blocking message from the gate is voiced by a polite live region, and
 * every committed navigation moves focus to the new panel.
 */
export function Wizard({
  steps,
  'aria-label': ariaLabel,
  activeStep,
  defaultActiveStep = 0,
  onStepChange,
  onSave,
  onComplete,
  previousLabel,
  nextLabel,
  finishLabel,
  headingLevel = 2,
  skeleton = false,
  className,
  ...rest
}: WizardProps) {
  const t = useT();
  const reduce = useReducedMotion();
  const headingId = useId();
  const [index, setIndex] = useControlled<number>(activeStep, defaultActiveStep);
  const [error, setError] = useState<GateError | null>(null);
  const [validating, setValidating] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const panelRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  // The index commit() asked for: focus moves to the panel only when the
  // rendered index becomes exactly that target, so a controlled parent that
  // ignores the request cannot leave a stale armed flag behind.
  const pendingFocusRef = useRef<number | null>(null);
  // Restore focus after a blocking ASYNC gate: disabling the pressed button
  // while the promise was pending evicted focus to the body.
  const restoreFocusRef = useRef(false);
  const dirFactor = useDirection(panelRef) === 'rtl' ? -1 : 1;

  const count = steps.length;
  const current = Math.min(Math.max(index, 0), Math.max(count - 1, 0));
  const step = steps[current];
  const isLast = current === count - 1;

  // An async gate can settle after the world moved (a controlled parent
  // navigated, the steps array changed); continuations read the latest truth
  // from here instead of their click-time closure.
  const latestRef = useRef({ index: current, count });
  latestRef.current = { index: current, count };

  // After a committed navigation renders: move focus to the panel (never on
  // mount) and drop any gate message from the step that was left, including
  // externally-driven controlled jumps that bypass the handlers.
  useEffect(() => {
    setError(null);
    if (pendingFocusRef.current !== null) {
      const target = pendingFocusRef.current;
      pendingFocusRef.current = null;
      if (target === current) panelRef.current?.focus();
    }
  }, [current]);

  // Hand focus back to the Next button once a blocking async gate re-enables
  // the footer; runs after the re-enabling render so the button is focusable.
  useEffect(() => {
    if (!validating && restoreFocusRef.current) {
      restoreFocusRef.current = false;
      if (document.activeElement === document.body) {
        footerRef.current?.querySelectorAll('button')[1]?.focus();
      }
    }
  }, [validating]);

  function commit(next: number, dir: 1 | -1) {
    setDirection(dir);
    pendingFocusRef.current = next;
    setIndex(next);
    onStepChange?.(next);
  }

  function handlePrevious() {
    if (current === 0 || validating) return;
    setError(null);
    commit(current - 1, -1);
  }

  async function handleNext() {
    if (validating || !step) return;
    const clicked = current;
    let result: boolean | string = true;
    let wasAsync = false;
    if (step.validate) {
      try {
        const gate = step.validate();
        if (isThenable(gate)) {
          wasAsync = true;
          setValidating(true);
          result = await gate;
        } else {
          result = gate;
        }
      } catch {
        // A rejected gate is a silent block; the footer must not stay stuck.
        result = false;
      } finally {
        setValidating(false);
      }
    }
    // Bail if the wizard moved while an async gate was pending: this press
    // gated a step the user is no longer on.
    if (latestRef.current.index !== clicked) return;
    if (result === true) {
      setError(null);
      onSave?.(clicked);
      // Judge "last" against the latest step count, not the click-time one.
      if (clicked >= latestRef.current.count - 1) onComplete?.();
      else commit(clicked + 1, 1);
    } else {
      const text = typeof result === 'string' ? result : null;
      setError((prev) => (text === null ? null : { text, nonce: (prev?.nonce ?? 0) + 1 }));
      if (wasAsync) restoreFocusRef.current = true;
    }
  }

  if (skeleton) {
    return (
      <div className={cx(styles.wizard, className)} aria-hidden="true" {...rest}>
        <Steps count={count} variant="connected" numbered skeleton />
        <Heading level={headingLevel} skeleton />
        <div className={styles.panel}>
          <div className={styles.contentBones}>
            <Skeleton variant={SkeletonVariant.Text} width="100%" />
            <Skeleton variant={SkeletonVariant.Text} width="92%" />
            <Skeleton variant={SkeletonVariant.Text} width="61%" />
          </div>
        </div>
        <div className={styles.error} />
        <div className={styles.footer}>
          <Button skeleton />
          <Button skeleton />
        </div>
      </div>
    );
  }

  const shift = reduce ? 0 : STEP_SHIFT;
  // Forward (dir 1) enters from the trailing side; back from the leading
  // side. dirFactor flips the physical axis under RTL so the logical promise
  // holds in both writing directions.
  const panelVariants: Variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * shift * dirFactor }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -shift * dirFactor }),
  };

  return (
    <div role="region" aria-label={ariaLabel} className={cx(styles.wizard, className)} {...rest}>
      <Steps count={count} active={current} variant="connected" numbered />
      <Heading level={headingLevel} noMargin id={headingId}>
        <span className={styles.srOnly}>
          {t(kitMessages.stepOf, { step: current + 1, total: count })}
        </span>
        {step?.label}
      </Heading>
      <div
        ref={panelRef}
        role="group"
        aria-labelledby={headingId}
        aria-busy={validating || undefined}
        tabIndex={-1}
        className={styles.panel}
      >
        {/* popLayout, not wait: the incoming step mounts immediately while the
            outgoing one is popped out of flow to fade, so navigation never
            waits on an exit animation. */}
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={step?.id ?? current}
            custom={direction}
            variants={panelVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={reduce ? { duration: 0 } : transition(Speed.Fast, Ease.Out)}
          >
            <StepShell>{step?.content}</StepShell>
          </motion.div>
        </AnimatePresence>
      </div>
      <div role="status" aria-live="polite" className={styles.error}>
        {error && <span key={error.nonce}>{error.text}</span>}
      </div>
      <div ref={footerRef} className={styles.footer}>
        <Button
          variant={Variant.Ghost}
          disabled={current === 0 || validating}
          onClick={handlePrevious}
        >
          {previousLabel ?? t(kitMessages.previous)}
        </Button>
        <Button loading={validating} onClick={handleNext}>
          {isLast ? (finishLabel ?? t(kitMessages.done)) : (nextLabel ?? t(kitMessages.next))}
        </Button>
      </div>
    </div>
  );
}
