/**
 * @glacier/native — VoiceRecorder.
 *
 * The React Native binding of @glacier/react's hold-to-record control. The
 * state machine (`advanceVoiceState`, `voiceReleaseOutcome`), the slide-to-cancel
 * geometry (`slideToCancel`), and the level bookkeeping (`useLiveLevels`) all
 * come from @glacier/logic, and the trace is painted by the kit's own SeekBar
 * in its bars shape. No audio analysis is written here or in the web binding:
 * the host owns the microphone and hands in a `meter`.
 *
 * KEY HANDLING DIVERGES SHARPLY. The web binding gives keyboard and switch users
 * a route that does not require holding anything — activate to start a LOCKED
 * recording, activate again to stop, Escape to discard — because a hold gesture
 * has no keyboard analogue. React Native has no key events on a Pressable and no
 * Escape at all, so:
 *
 * - The `lock` state is reachable only through the `state` prop or the long-press
 *   route below; there is no key that reaches it.
 * - Discarding a locked recording is the explicit trash control, which is the
 *   only affordance the runtime can offer once Escape is gone.
 * - The hold itself is the responder system, not pointer events: `onResponderMove`
 *   streams coordinates while the finger travels, which is what the cancel slide
 *   is measured from. The travel is a delta between two readings on the same
 *   stationary control, so the responder event's `locationX` is enough and no
 *   page-space coordinate is needed.
 *
 * Also resting-visual only: the recording pulse breathes on the web and is
 * static here, and the strip's takeover of the bar is laid out but not animated.
 */

import { useEffect, useRef, useState, type ComponentType } from 'react';
import { View, Text as RNText, type ResponderEvent, type TextProps, type ViewProps } from 'react-native';
import { Check, Mic, Square, Trash2 } from '@glacier/icons';
import { formatDuration, useControlled, useLiveLevels, type LoudnessMeter } from '@glacier/logic';
import {
  advanceVoiceState,
  slideToCancel,
  voiceIsLive,
  voiceReleaseOutcome,
} from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once the compose specs are registered.
import { voiceRecorderSpec, voiceRecorderStates } from '../../../../spec/src/components/voice-recorder.ts';
import { t } from '../../tokens.ts';
import { paintFor, dimensionsFor } from '../../resolve.ts';
import { IconButton } from '../../atoms/inputs/IconButton.tsx';
import { SeekBar } from '../../atoms/inputs/SeekBar.tsx';

// Derived from the spec so the state union cannot drift from the web kit.
export type VoiceRecorderState = (typeof voiceRecorderStates)[number];

export interface VoiceRecorderProps extends Omit<ViewProps, 'children' | 'style'> {
  state?: VoiceRecorderState;
  defaultState?: VoiceRecorderState;
  onStateChange?: (state: VoiceRecorderState) => void;
  /** Reads input loudness as 0..1. The host owns the microphone. */
  meter?: LoudnessMeter | null;
  onStart?: () => void;
  onSend?: (seconds: number) => void;
  onCancel?: () => void;
  maxDuration?: number;
  /** Travel toward the inline start, in points, that cancels the take. */
  cancelThreshold?: number;
  lockable?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/** How much of the take the waveform spans before it pins at its end. */
const WAVE_SPAN_SECONDS = 30;
const GLYPH = { sm: 16, md: 18, lg: 20 } as const;

const DIMS = dimensionsFor(voiceRecorderSpec);

// The permissive react-native d.ts declares no accessibilityLiveRegion (the
// platform's nearest thing to the web role=status), so the clock is typed
// through a narrow local alias.
const Live = RNText as unknown as ComponentType<
  TextProps & { accessibilityLiveRegion?: 'none' | 'polite' | 'assertive' }
>;

function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

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
  lockable: _lockable = true,
  disabled = false,
  size = 'md',
  ...rest
}: VoiceRecorderProps) {
  const [state, setState] = useControlled<VoiceRecorderState>({
    value: stateProp,
    defaultValue: defaultState,
    onChange: onStateChange,
  });
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(0);
  const startX = useRef(0);

  const live = voiceIsLive(state);
  const move = (event: Parameters<typeof advanceVoiceState>[1]) => {
    const next = advanceVoiceState(state, event);
    if (next !== state) setState(next);
    return next;
  };

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      const seconds = (Date.now() - startedAt.current) / 1000;
      setElapsed(seconds);
      // A recording that ran forever would hand the app a file it cannot send.
      if (seconds >= maxDuration) {
        setState('armed');
        onSend?.(seconds);
      }
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restarting on handler identity would reset the clock mid-take
  }, [live, maxDuration]);

  const levels = useLiveLevels({
    meter: live ? meter : null,
    progress: Math.min(elapsed / WAVE_SPAN_SECONDS, 1),
    active: live,
    buckets: 48,
    intervalMs: 60,
  });

  const paint = paintFor(voiceRecorderSpec, 'states', live ? state : 'armed');

  const begin = () => {
    startedAt.current = Date.now();
    setElapsed(0);
    onStart?.();
  };

  const finish = (outcome: 'send' | 'cancel') => {
    const seconds = (Date.now() - startedAt.current) / 1000;
    if (outcome === 'send') onSend?.(seconds);
    else onCancel?.();
  };

  // The responder handlers the runtime does declare, spread onto the control.
  const holdHandlers = {
    onStartShouldSetResponder: () => !disabled,
    onMoveShouldSetResponder: () => !disabled && live,
    onResponderGrant: (event: ResponderEvent) => {
      startX.current = event.nativeEvent.locationX;
      if (move('hold') !== state) begin();
    },
    onResponderMove: (event: ResponderEvent) => {
      if (state === 'locked') return;
      const { canceling } = slideToCancel({
        delta: event.nativeEvent.locationX - startX.current,
        threshold: cancelThreshold,
        // I18nManager could flip this; the shared helper owns the mirroring and
        // takes the direction as a fact rather than deciding it.
        direction: 'ltr',
      });
      move(canceling ? 'enter-cancel' : 'leave-cancel');
    },
    onResponderRelease: () => {
      const outcome = voiceReleaseOutcome(state);
      if (outcome === 'none') return;
      move('release');
      finish(outcome);
    },
    onResponderTerminate: () => {
      if (voiceReleaseOutcome(state) === 'none') return;
      move('release');
      finish('cancel');
    },
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: metric(DIMS.gap, 'space-2'),
        flex: live ? 1 : 0,
        paddingHorizontal: live ? metric(DIMS.paddingInline, 'space-3') : 0,
        borderRadius: t(DIMS.radius ?? 'radius-full'),
        backgroundColor: state === 'canceling' ? t('danger-soft') : 'transparent',
        opacity: disabled ? 0.5 : 1,
      }}
      {...rest}
    >
      {live && (
        <>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: t('radius-full'),
              backgroundColor: t('danger-solid'),
            }}
          />
          <Live
            accessibilityLiveRegion="polite"
            style={{
              color: t(paint.text ?? 'danger-text'),
              fontFamily: t('font-mono'),
              fontSize: t('font-size-xs'),
            }}
          >
            {formatDuration(Math.floor(elapsed))}
          </Live>
          <View style={{ flex: 1, minWidth: 0 }} aria-hidden>
            {/* Decorative: a level trace has nothing to say aloud, and the clock
                beside it already carries the state. */}
            <SeekBar
              duration={Math.max(elapsed, 1)}
              value={elapsed}
              shape="bars"
              tone={state === 'canceling' ? 'danger' : 'accent'}
              levels={levels}
              size="sm"
              disabled
              aria-label="Recording level"
            />
          </View>
          <RNText style={{ color: t('text-subtle'), fontSize: t('font-size-xs') }}>
            {state === 'canceling' ? 'Release to cancel' : 'Slide to cancel'}
          </RNText>
          {state === 'locked' && (
            <IconButton
              size={size}
              variant="ghost"
              aria-label="Discard recording"
              onPress={() => {
                move('discard');
                finish('cancel');
              }}
            >
              <Trash2 size={GLYPH[size]} color={t('text-muted')} />
            </IconButton>
          )}
        </>
      )}
      <View {...holdHandlers}>
        <IconButton
          size={size}
          variant={live ? 'danger' : 'ghost'}
          disabled={disabled}
          aria-label={live ? 'Recording' : 'Hold to record a voice message'}
          accessibilityState={{ selected: live }}
          onPress={() => {
            // Reached only when the press was not a hold (an assistive-tech
            // activation): go straight to hands-free, since there is no hold.
            if (state === 'armed') {
              if (move('hold') !== state) begin();
              move('lock');
            } else if (state === 'locked') {
              move('stop');
              finish('send');
            }
          }}
        >
          {state === 'locked' ? (
            <Square size={GLYPH[size]} color={t('danger-contrast')} />
          ) : live ? (
            <Check size={GLYPH[size]} color={t('danger-contrast')} />
          ) : (
            <Mic size={GLYPH[size]} color={t('text-muted')} />
          )}
        </IconButton>
      </View>
    </View>
  );
}
