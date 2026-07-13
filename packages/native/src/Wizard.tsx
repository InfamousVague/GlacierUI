import { useEffect, useRef, useState, type ReactNode } from 'react';
import { View, Text, type ViewProps } from 'react-native';
import { useControlled } from '@glacier/commons';
import { wizardSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { dimensionsFor, paintFor } from './resolve.ts';
import { Steps } from './Steps.tsx';
import { Heading } from './Heading.tsx';
import { Skeleton } from './Skeleton.tsx';
import { Button } from './Button.tsx';

/**
 * Wizard — the @glacier/native binding of the web organism (a stepped flow: a
 * connected numbered Steps header, one labelled panel at a time, and a gated
 * Previous/Next footer where Next runs the step's validate before advancing).
 *
 * COMPOSITION. It wraps the native siblings — <Steps> (connected/numbered),
 * <Heading>, <Skeleton>, <Button> — and lays them out in plain <View>s so it
 * never depends on Stack/Row (generated in the same wave). Geometry is read
 * from `wizardSpec` through the shared resolver (dimensionsFor): the column gap
 * (`space-5`), footer gap (`space-3`), skeleton content gap (`space-2`), panel
 * radius (`radius-md`) and error font-size (`font-size-sm`) all come from the
 * spec, so they cannot drift from the DOM kit. The reserved error line-height
 * (`1lh`) is a raw CSS length the spec declares inline; like Steps/Pill do with
 * their raw rems it passes straight through `metric()` rather than being wrapped
 * as a token. The panel base color (`$text`) and the error tone (`danger-text`
 * from the `error` state) are read from the spec too.
 *
 * State is controlled/uncontrolled via useControlled({ value: activeStep,
 * defaultValue: defaultActiveStep }); `onStepChange` is fired explicitly in
 * commit() (not wired through useControlled's onChange) so it announces every
 * committed navigation exactly once, matching the web. The forward gate
 * (sync/async validate → true passes, false blocks silently, string blocks and
 * voices the message; a rejection is a silent block) is reproduced faithfully,
 * including the "bail if the wizard moved while an async gate was pending"
 * guard via latestRef.
 *
 * RESTING VISUALS ONLY. The web crossfades the panel with a small directional x
 * shift and moves focus into the panel on every commit; there is no animation or
 * focus runtime on this binding, so the active step's content is simply mounted
 * (the outgoing one unmounted). The web-only bits are accepted-but-noop and
 * reported: `className`/`style` escape hatches, focus-move-to-panel, the
 * visually-hidden "Step X of Y" heading prefix (the native <Steps> already
 * announces position as its group label), and the localized kit labels (no i18n
 * runtime here — the defaults emit "Previous"/"Next"/"Done" like Steps emits its
 * default "Step n of N"). The native <Button> has no `loading` prop, so the
 * validating async state maps to a disabled footer instead of a spinner.
 */

export interface WizardStep {
  /** Stable identity; keys the panel. */
  id: string;
  /** Step name: shown as the panel heading and used for a11y labelling. */
  label: ReactNode;
  /** The panel body for this step. */
  content: ReactNode;
  /**
   * The forward gate, run when Next/Finish is pressed on this step: `true`
   * passes; `false` blocks silently (the step's own fields show their errors);
   * a string blocks AND shows that message in the wizard's error region. May
   * return a Promise of the same: the footer goes inert until it settles; a
   * rejection is treated as a silent block.
   */
  validate?: () => boolean | string | Promise<boolean | string>;
}

export interface WizardProps extends Omit<ViewProps, 'children' | 'style' | 'aria-label'> {
  steps: WizardStep[];
  /** Required accessible name for the wizard region. */
  'aria-label': string;
  /** Controlled zero-based index of the active step; clamped into range. */
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
  /** Defaults to "Previous" (no locale runtime on this binding). */
  previousLabel?: ReactNode;
  /** Defaults to "Next". */
  nextLabel?: ReactNode;
  /** Defaults to "Done". */
  finishLabel?: ReactNode;
  /** Heading element for the step label. */
  headingLevel?: 2 | 3;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Web-only escape hatch; accepted-but-noop on native. */
  className?: string;
}

function isThenable(value: unknown): value is Promise<boolean | string> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as PromiseLike<unknown>).then === 'function'
  );
}

/** A gate message plus a nonce, so retrying with the SAME message still
    re-renders the error node. */
interface GateError {
  text: string;
  nonce: number;
}

// Size-independent geometry read once from the spec.
const DIMS = dimensionsFor(wizardSpec);

/**
 * A resolved measurement value. `dimensionsFor` returns bare token names
 * (e.g. `space-5`) alongside raw CSS lengths (the reserved error height `1lh`
 * is declared inline in the spec, not as a token). Token names get wrapped in
 * the custom property; a raw length — anything that starts with a digit or dot
 * — passes straight through so it never becomes `var(--glacier-1lh)`.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

// The base panel color ($text) and the error tone come from the spec, not
// transcribed literals.
const TEXT_COLOR = t((wizardSpec.paint?.text ?? '$text').replace(/^\$/, ''));
const ERROR_COLOR = t(paintFor(wizardSpec, 'states', 'error').text ?? 'danger-text');

/**
 * A stepped flow rendered with React Native primitives. Next runs the active
 * step's validate before advancing (and fires onSave for the step being left);
 * Previous always returns ungated. A blocking message is shown in a polite live
 * region under the panel.
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
  className: _className,
  ...rest
}: WizardProps) {
  const [index, setIndex] = useControlled<number>({
    value: activeStep,
    defaultValue: defaultActiveStep,
  });
  const [error, setError] = useState<GateError | null>(null);
  const [validating, setValidating] = useState(false);

  const count = steps.length;
  const current = Math.min(Math.max(index, 0), Math.max(count - 1, 0));
  const step = steps[current];
  const isLast = current === count - 1;

  // An async gate can settle after the world moved (a controlled parent
  // navigated, the steps array changed); continuations read the latest truth
  // here instead of their click-time closure.
  const latestRef = useRef({ index: current, count });
  latestRef.current = { index: current, count };

  // Drop any gate message from the step that was left, including externally
  // driven controlled jumps that bypass the handlers. (The web also moves focus
  // into the panel here — web-only, omitted on this binding.)
  useEffect(() => {
    setError(null);
  }, [current]);

  const gap = metric(DIMS.gap, 'space-5');
  const footerGap = metric(DIMS.footerGap, 'space-3');
  const contentGap = metric(DIMS.skeletonContentGap, 'space-2');
  const panelRadius = metric(DIMS.panelRadius, 'radius-md');
  const errorFontSize = metric(DIMS.errorFontSize, 'font-size-sm');
  const errorMinHeight = metric(DIMS.errorMinHeight, '1lh');

  function commit(next: number) {
    // useControlled's onChange is intentionally not wired: fire onStepChange
    // explicitly so it announces exactly once (matching the web's commit()).
    setIndex(next);
    onStepChange?.(next);
  }

  function handlePrevious() {
    if (current === 0 || validating) return;
    setError(null);
    commit(current - 1);
  }

  async function handleNext() {
    if (validating || !step) return;
    const clicked = current;
    let result: boolean | string = true;
    if (step.validate) {
      try {
        const gate = step.validate();
        if (isThenable(gate)) {
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
      else commit(clicked + 1);
    } else {
      const text = typeof result === 'string' ? result : null;
      setError((prev) => (text === null ? null : { text, nonce: (prev?.nonce ?? 0) + 1 }));
    }
  }

  if (skeleton) {
    return (
      <View aria-hidden={true} style={{ flexDirection: 'column', rowGap: gap }} {...rest}>
        <Steps count={count} variant="connected" numbered skeleton />
        <Heading level={headingLevel} skeleton />
        <View style={{ borderRadius: panelRadius }}>
          <View style={{ flexDirection: 'column', rowGap: contentGap }}>
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="92%" />
            <Skeleton variant="text" width="61%" />
          </View>
        </View>
        <View style={{ minHeight: errorMinHeight }} />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            columnGap: footerGap,
          }}
        >
          {/* The native Button has no `skeleton` prop, so control-height blocks
              stand in for the two footer buttons. */}
          <Skeleton variant="rect" width={t('space-24')} height={t('control-height-md')} radius={t('control-radius')} />
          <Skeleton variant="rect" width={t('space-24')} height={t('control-height-md')} radius={t('control-radius')} />
        </View>
      </View>
    );
  }

  const headingLabel = typeof step?.label === 'string' ? step.label : undefined;

  return (
    <View accessibilityLabel={ariaLabel} style={{ flexDirection: 'column', rowGap: gap }} {...rest}>
      <Steps count={count} active={current} variant="connected" numbered />
      <Heading level={headingLevel} noMargin>
        {step?.label}
      </Heading>
      <View
        accessibilityLabel={headingLabel}
        accessibilityState={{ busy: validating }}
        style={{ borderRadius: panelRadius }}
      >
        {typeof step?.content === 'string' ? (
          <Text style={{ color: TEXT_COLOR, fontFamily: t('font-sans') }}>{step.content}</Text>
        ) : (
          step?.content
        )}
      </View>
      {/* The web marks this the polite live region (role="status" aria-live);
          the native stub declares no live-region prop, so it is a plain
          reserved-height slot here — accepted-but-noop, reported in notes. */}
      <View style={{ minHeight: errorMinHeight }}>
        {error && (
          <Text key={error.nonce} style={{ color: ERROR_COLOR, fontSize: errorFontSize, fontFamily: t('font-sans') }}>
            {error.text}
          </Text>
        )}
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          columnGap: footerGap,
        }}
      >
        <Button variant="ghost" disabled={current === 0 || validating} onPress={handlePrevious}>
          {previousLabel ?? 'Previous'}
        </Button>
        {/* Native Button has no `loading` prop; the validating async state maps
            to a disabled footer instead of a spinner. */}
        <Button disabled={validating} onPress={handleNext}>
          {isLast ? (finishLabel ?? 'Done') : (nextLabel ?? 'Next')}
        </Button>
      </View>
    </View>
  );
}
