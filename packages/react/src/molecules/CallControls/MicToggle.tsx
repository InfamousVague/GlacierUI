import { Mic, MicOff } from '@glacier/icons';
import { useReducedMotion } from 'motion/react';
import type { CSSProperties, ReactNode } from 'react';
import { useControlled } from '../../internal/useControlled.ts';
import {
  CallControlButton,
  type CallControlButtonProps,
} from '../../atoms/inputs/CallControlButton/CallControlButton.tsx';
import {
  callControlGlyph,
  callControlState,
  micRingGeometry,
  useMicLevel,
  type CallControlSize,
} from '@glacier/logic';
import type { LoudnessMeter } from '@glacier/logic';
import styles from './MicToggle.module.css';

/** The two things the control can say, both named as ACTIONS. */
export interface MicToggleLabels {
  /** Spoken while live: what pressing it will do. */
  mute: string;
  /** Spoken while muted: what pressing it will do. */
  unmute: string;
}

const DEFAULT_LABELS: MicToggleLabels = { mute: 'Mute', unmute: 'Unmute' };

export interface MicToggleProps
  extends Omit<CallControlButtonProps, 'aria-label' | 'state' | 'pressed' | 'children' | 'ring'> {
  /** Controlled mute state. */
  muted?: boolean;
  defaultMuted?: boolean;
  onMutedChange?: (muted: boolean) => void;
  /**
   * Reads the current input loudness as 0..1. On the web this comes from
   * `createAnalyserMeter`; omit it and the ring simply stays at rest.
   */
  meter?: LoudnessMeter | null;
  /** Controlled level 0..1, overriding the meter — for a host that samples its own audio. */
  level?: number;
  size?: CallControlSize;
  /** A short word under the glyph. */
  caption?: ReactNode;
  /** Overrides the spoken labels; merged over the English defaults. */
  labels?: Partial<MicToggleLabels>;
}

/**
 * The microphone control: a CallControlButton with a ring behind it that swells
 * with the live input level, so a speaker can see they are being heard without
 * asking.
 *
 * Two decisions worth stating out loud:
 *
 * - **Muted is `danger`, not "off".** Talking into a muted mic is the most
 *   common failure in a call, so the toggled state is the alarming one — the
 *   inverse of every other toggle in the kit. The mapping comes from
 *   `callControlState(muted, 'suppresses')` so the native binding cannot get it
 *   backwards.
 * - **The ring is not drawn while muted**, and sampling stops with it. A halo
 *   around a muted mic would be a lie, and a disabled control should cost
 *   nothing.
 *
 * Under reduced motion the ring is frozen at rest: a halo that breathes for the
 * length of a meeting is precisely the continuous motion that setting exists to
 * stop, and the mute state is carried by paint and label regardless.
 */
export function MicToggle({
  muted,
  defaultMuted = false,
  onMutedChange,
  meter = null,
  level,
  size = 'md',
  caption,
  labels,
  disabled,
  skeleton = false,
  onClick,
  ...rest
}: MicToggleProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const reduce = useReducedMotion();
  const [isMuted, setMuted] = useControlled(muted, defaultMuted);

  // Sampling runs only when there is something to show: not while muted, not
  // while disabled, and never under reduced motion.
  const sampling = !isMuted && !disabled && !skeleton && !reduce && level === undefined;
  const sampled = useMicLevel({ meter: sampling ? meter : null, active: sampling });
  const shown = level !== undefined ? level : sampled;
  const live = !isMuted && !disabled && !reduce;
  const { scale, opacity } = micRingGeometry(live ? shown : 0);

  const toggle = () => {
    const next = !isMuted;
    setMuted(next);
    onMutedChange?.(next);
  };

  const glyph = callControlGlyph(size);

  return (
    <CallControlButton
      aria-label={isMuted ? text.unmute : text.mute}
      // One button whose label changes, not two that swap, so focus survives the
      // toggle. Pressed carries the state; the label names the action.
      pressed={isMuted}
      state={callControlState(isMuted, 'suppresses')}
      size={size}
      caption={caption}
      disabled={disabled}
      skeleton={skeleton}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) toggle();
      }}
      ring={
        // Decorative: a live level is a signal, not information a screen reader
        // can act on, and announcing it would flood the buffer.
        !isMuted && (
          <span
            aria-hidden="true"
            className={styles.ring}
            style={{ '--mic-ring-scale': scale, '--mic-ring-opacity': opacity } as CSSProperties}
          />
        )
      }
      {...rest}
    >
      {isMuted ? <MicOff size={glyph} /> : <Mic size={glyph} />}
    </CallControlButton>
  );
}
