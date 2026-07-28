// The Glacier MicToggle, rendered with React Native primitives: a
// CallControlButton for the microphone with a ring behind it that swells with
// the live input level. Every decision — that muted is DANGER rather than "off",
// how a level becomes a ring scale, how the level is sampled — comes from
// @glacier/logic, the same functions the DOM kit calls, so the two cannot
// disagree about the one thing this control exists to say.
//
// Web-parity notes:
// - The ring is an absolutely-positioned View inside the disc, scaled by
//   `micRingGeometry` exactly as the web kit scales its span. The web eases the
//   scale over duration-fast; there is no animation runtime here, so the ring
//   steps to each sampled level instead of gliding to it.
// - Reduced motion: the web reads `useReducedMotion()`. React Native's
//   equivalent is `AccessibilityInfo.isReduceMotionEnabled()`, which this
//   package's react-native shim does not declare, so the setting arrives as the
//   `reduceMotion` prop for a device build to wire up. Setting it stops the
//   sampling outright — the ring holds at rest rather than merely animating less.

import { type ReactNode } from 'react';
import { View } from 'react-native';
import { Mic, MicOff } from '@glacier/icons';
import { useControlled, type LoudnessMeter } from '@glacier/logic';
import { t } from '../../tokens.ts';
import { CallControlButton, type CallControlButtonProps } from './CallControlButton.tsx';
import {
  callControlGlyph,
  callControlState,
  micRingGeometry,
  useMicLevel,
  type CallControlSize,
} from '@glacier/logic';

/** The two things the control can say, both named as ACTIONS. */
export interface MicToggleLabels {
  mute: string;
  unmute: string;
}

const DEFAULT_LABELS: MicToggleLabels = { mute: 'Mute', unmute: 'Unmute' };

export interface MicToggleProps
  extends Omit<CallControlButtonProps, 'aria-label' | 'state' | 'pressed' | 'children' | 'ring'> {
  muted?: boolean;
  defaultMuted?: boolean;
  onMutedChange?: (muted: boolean) => void;
  /** Reads the current input loudness as 0..1; on a device, from the platform recorder. */
  meter?: LoudnessMeter | null;
  /** Controlled level 0..1, overriding the meter. */
  level?: number;
  size?: CallControlSize;
  caption?: ReactNode;
  /** Freezes the ring and stops sampling, for a device build wiring up AccessibilityInfo. */
  reduceMotion?: boolean;
  labels?: Partial<MicToggleLabels>;
}

export function MicToggle({
  muted,
  defaultMuted = false,
  onMutedChange,
  meter = null,
  level,
  size = 'md',
  caption,
  reduceMotion = false,
  labels,
  disabled = false,
  skeleton = false,
  ...rest
}: MicToggleProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const [isMuted, setMuted] = useControlled({
    value: muted,
    defaultValue: defaultMuted,
    onChange: onMutedChange,
  });

  // Sampling runs only when there is something to show: not while muted, not
  // while disabled, and never with reduced motion asked for.
  const sampling = !isMuted && !disabled && !skeleton && !reduceMotion && level === undefined;
  const sampled = useMicLevel({ meter: sampling ? meter : null, active: sampling });
  const shown = level !== undefined ? level : sampled;
  const live = !isMuted && !disabled && !reduceMotion;
  const { scale, opacity } = micRingGeometry(live ? shown : 0);

  const glyph = callControlGlyph(size);

  return (
    <CallControlButton
      aria-label={isMuted ? text.unmute : text.mute}
      // One control whose label changes, not two that swap, so focus survives
      // the toggle. Pressed carries the state; the label names the action.
      pressed={isMuted}
      state={callControlState(isMuted, 'suppresses')}
      size={size}
      caption={caption}
      disabled={disabled}
      skeleton={skeleton}
      onPress={() => setMuted(!isMuted)}
      ring={
        // Decorative: a live level is a signal, not something a screen reader can
        // act on, and announcing it would flood the buffer.
        !isMuted && (
          <View
            aria-hidden={true}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              borderRadius: t('radius-full'),
              backgroundColor: t('accent-solid'),
              transform: [{ scale }],
              opacity,
            }}
          />
        )
      }
      {...rest}
    >
      {isMuted ? <MicOff size={glyph} /> : <Mic size={glyph} />}
    </CallControlButton>
  );
}
