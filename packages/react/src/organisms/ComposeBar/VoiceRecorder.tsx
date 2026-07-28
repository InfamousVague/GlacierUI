import type { ComponentProps } from 'react';
import { formatDuration, useLiveLevels, type LoudnessMeter } from '@glacier/logic';
import { Check, Mic, Square, Trash2 } from '@glacier/icons';
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import {
  advanceVoiceState,
  slideToCancel,
  voiceIsLive,
  voiceReleaseOutcome,
  type VoiceRecorderState,
} from '@glacier/logic';
import { cx } from '../../internal/cx.ts';
import { resolveDirection } from '../../internal/direction.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { IconButton } from '../../atoms/inputs/Button/IconButton.tsx';
import { SeekBar } from '../../atoms/inputs/SeekBar/SeekBar.tsx';
import { composeMessages } from './messages.ts';
import styles from './VoiceRecorder.module.css';

export type { VoiceRecorderState };

export interface VoiceRecorderProps extends Omit<ComponentProps<'div'>, 'size' | 'onChange' | 'children'> {
  /** Controlled state; left off, the component owns it. */
  state?: VoiceRecorderState;
  defaultState?: VoiceRecorderState;
  onStateChange?: (state: VoiceRecorderState) => void;
  /**
   * Reads the current input loudness as 0..1. The component never opens a
   * microphone: the host owns that permission prompt and its audio graph.
   */
  meter?: LoudnessMeter | null;
  /** Called when a hold begins and recording should start. */
  onStart?: () => void;
  /** Called with the elapsed seconds when a take is kept. */
  onSend?: (seconds: number) => void;
  /** Called when a take is thrown away. */
  onCancel?: () => void;
  /** Seconds after which the recording stops itself and offers the take. */
  maxDuration?: number;
  /** Travel toward the inline start, in CSS pixels, that cancels the take. */
  cancelThreshold?: number;
  /** Lets a hold become a hands-free recording. */
  lockable?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** How much of the take the waveform spans before it pins at its end. */
const WAVE_SPAN_SECONDS = 30;

/** Glyph size per control size, matching the send control beside it. */
const GLYPH = { sm: 16, md: 18, lg: 20 } as const;

/**
 * Hold the microphone to record; the bar becomes a live waveform with a running
 * clock, and sliding toward the start edge throws the take away.
 *
 * **No audio analysis is written here.** The levels come from
 * `useLiveLevels` in @glacier/logic — the same sampler the player's waveform
 * uses — and are painted by the kit's own SeekBar in its bars shape. The
 * microphone itself is the host's: an AudioContext built outside a user gesture
 * is muted for good on WebKit, and the permission prompt belongs to the app, so
 * this takes a `meter` function and never opens a stream.
 *
 * Cancel travels toward the INLINE START, not leftward, so an Arabic user does
 * not have to slide toward the send button to cancel.
 *
 * Keyboard and switch users are not asked to hold anything: activating the mic
 * from the keyboard starts a LOCKED recording — press to start, press to stop,
 * Escape to discard. The hold gesture is an accelerator, never the only route.
 */
export function VoiceRecorder({
  state: stateProp,
  defaultState = 'armed',
  onStateChange,
  meter = null,
  onStart,
  onSend,
  onCancel,
  maxDuration = 300,
  cancelThreshold = 96,
  lockable = true,
  disabled = false,
  size = 'md',
  className,
  ...rest
}: VoiceRecorderProps) {
  const t = useT();
  const [state, setState] = useControlled(stateProp, defaultState);
  const [elapsed, setElapsed] = useState(0);
  const [slide, setSlide] = useState(0);

  const startedAt = useRef(0);
  const pointerStartX = useRef(0);
  // A hold ends with a click event as well; without this the release would be
  // handled twice, once as a gesture and once as a keyboard-style activation.
  const holding = useRef(false);
  const swallowClick = useRef(false);

  const live = voiceIsLive(state);

  /**
   * Applies one event and reports where it landed. `from` exists because two
   * moves can happen in the same handler (hold, then lock): React has not
   * re-rendered in between, so the second must start from the first's result
   * rather than from the stale render-time state.
   */
  const move = (event: Parameters<typeof advanceVoiceState>[1], from: VoiceRecorderState = state) => {
    const next = advanceVoiceState(from, event);
    if (next === from) return next;
    setState(next);
    onStateChange?.(next);
    return next;
  };

  // The clock, and the self-stop at the cap. A recording that ran forever would
  // hand the app a file it cannot send.
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      const seconds = (Date.now() - startedAt.current) / 1000;
      setElapsed(seconds);
      if (seconds >= maxDuration) {
        holding.current = false;
        setState('armed');
        onStateChange?.('armed');
        onSend?.(seconds);
      }
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restarting the timer on every handler identity would reset the clock mid-take
  }, [live, maxDuration]);

  // The trace spans the first WAVE_SPAN_SECONDS and then pins at its end, so a
  // short take fills the bar proportionally instead of collapsing into one
  // bucket at the far left.
  const levels = useLiveLevels({
    meter: live ? meter : null,
    progress: Math.min(elapsed / WAVE_SPAN_SECONDS, 1),
    active: live,
    buckets: 48,
    intervalMs: 60,
  });

  const begin = () => {
    startedAt.current = Date.now();
    setElapsed(0);
    setSlide(0);
    onStart?.();
  };

  const finish = (outcome: 'send' | 'cancel') => {
    const seconds = (Date.now() - startedAt.current) / 1000;
    setSlide(0);
    if (outcome === 'send') onSend?.(seconds);
    else onCancel?.();
  };

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (disabled || live) return;
    pointerStartX.current = event.clientX;
    holding.current = true;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // jsdom and synthetic events have no active pointer to capture
    }
    // Capture keeps the move and up events coming to this control even once the
    // finger has slid off it, which a cancel gesture always does.
    if (move('hold') !== state) begin();
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!holding.current || state === 'locked') return;
    const { progress, canceling } = slideToCancel({
      delta: event.clientX - pointerStartX.current,
      threshold: cancelThreshold,
      // Read live at gesture time rather than snapshotted at render: a dir flip
      // between mounting and the hold would otherwise send the user the wrong way.
      direction: resolveDirection(event.currentTarget),
    });
    setSlide(progress);
    if (canceling) move('enter-cancel');
    else move('leave-cancel');
  };

  const onPointerUp = () => {
    if (!holding.current) return;
    holding.current = false;
    swallowClick.current = true;
    const outcome = voiceReleaseOutcome(state);
    if (outcome === 'none') return;
    move('release');
    finish(outcome);
  };

  // Reached only without a preceding pointer press: the keyboard route.
  const onClick = () => {
    if (swallowClick.current) {
      swallowClick.current = false;
      return;
    }
    if (disabled) return;
    if (state === 'armed') {
      // Straight to hands-free, because there is no hold to hold. The lock has
      // to be chained off the hold's result — nothing has re-rendered yet.
      const held = move('hold');
      if (held !== state) begin();
      move('lock', held);
    } else {
      move('stop');
      finish('send');
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape' || !live) return;
    event.preventDefault();
    holding.current = false;
    move('discard');
    finish('cancel');
  };

  const micLabel = live
    ? t(state === 'locked' ? composeMessages.stopRecording : composeMessages.recording)
    : t(composeMessages.recordVoice);

  return (
    <div
      {...rest}
      className={cx(styles.root, className)}
      data-state={state}
      data-disabled={disabled || undefined}
      onKeyDown={onKeyDown}
    >
      {live && (
        <>
          <span className={styles.pulse} aria-hidden="true" />
          {/* Polite and coarse: the seconds are announced as they tick, without
              interrupting whatever else is being read. */}
          <span className={styles.clock} role="status">
            {formatDuration(Math.floor(elapsed))}
          </span>
          {/* Decorative: a level trace has nothing to say aloud, and the clock
              beside it already carries the state. Disabled so it is not a
              second tab stop inside an aria-hidden subtree. */}
          <span className={styles.wave} aria-hidden="true">
            <SeekBar
              duration={Math.max(elapsed, 1)}
              value={elapsed}
              shape="bars"
              tone={state === 'canceling' ? 'danger' : 'accent'}
              levels={levels}
              size="sm"
              disabled
              aria-label={t(composeMessages.waveform)}
            />
          </span>
          <span className={styles.hint} style={{ opacity: 1 - slide * 0.6 }}>
            {t(state === 'canceling' ? composeMessages.releaseToCancel : composeMessages.slideToCancel)}
          </span>
          {state === 'locked' && (
            <IconButton
              size={size}
              variant="ghost"
              aria-label={t(composeMessages.discardRecording)}
              onClick={() => {
                move('discard');
                finish('cancel');
              }}
            >
              <Trash2 size={GLYPH[size]} />
            </IconButton>
          )}
        </>
      )}
      <IconButton
        size={size}
        variant={live ? 'danger' : 'ghost'}
        disabled={disabled}
        className={styles.mic}
        aria-label={micLabel}
        aria-pressed={live || undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={onClick}
      >
        {state === 'locked' ? (
          <Square size={GLYPH[size]} />
        ) : live ? (
          <Check size={GLYPH[size]} />
        ) : (
          <Mic size={GLYPH[size]} />
        )}
      </IconButton>
    </div>
  );
}
