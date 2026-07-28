// The Glacier RecordingIndicator, rendered with React Native primitives: a
// danger dot with a label, and optionally how long the recording has run. The
// state resolution (`recordingState`), the pulse decision (`shouldPulse`), the
// clock (`useCallElapsed`) and the formatting (`formatDuration`) all come from
// @glacier/logic, the same functions the DOM kit calls.
//
// Web-parity notes:
// - The dot is the native StatusDot, so the tone tokens are the shared ones. Its
//   expanding-ring pulse is a web-only animation for now (see StatusDot), which
//   is why `shouldPulse` is still consulted here: it is the contract the device
//   build will animate against, and it already suppresses the pulse for a paused
//   or stopped recording.
// - Reduced motion arrives as the `reduceMotion` prop, because React Native's
//   AccessibilityInfo is not declared in this package's react-native shim. The
//   label carries the state either way, so nothing is lost when the motion is.
// - Gap and font size come from the recording-indicator spec through the shared
//   resolvers; the label colors come from Text's own spec-driven tones.

import { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { formatDuration } from '@glacier/logic';
import { sizeFor } from '../../resolve.ts';
import { t } from '../../tokens.ts';
import { StatusDot } from '../../atoms/display/StatusDot.tsx';
import { Text } from '../../atoms/display/Text.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton.tsx';
// TODO(integration): switch to '@glacier/spec' once the call-controls specs are
// registered in packages/spec/src/index.ts.
import { recordingIndicatorSpec } from '../../../../spec/src/components/recording-indicator.ts';
import {
  recordingState,
  shouldPulse,
  useCallElapsed,
  type RecordingState,
} from '@glacier/logic';

export type { RecordingState };
export type RecordingIndicatorSize = 'sm' | 'md';

export interface RecordingIndicatorLabels {
  recording: string;
  paused: string;
  stopped: string;
}

const DEFAULT_LABELS: RecordingIndicatorLabels = {
  recording: 'Recording',
  paused: 'Recording paused',
  stopped: 'Not recording',
};

/** The dot tone per state; danger only while actually capturing. */
const DOT_TONE: Record<RecordingState, 'danger' | 'neutral'> = {
  recording: 'danger',
  paused: 'neutral',
  stopped: 'neutral',
};

/** The label tone per state, mirroring the web stylesheet's three rules. */
const LABEL_TONE: Record<RecordingState, 'danger' | 'muted' | 'subtle'> = {
  recording: 'danger',
  paused: 'muted',
  stopped: 'subtle',
};

export interface RecordingIndicatorProps extends Omit<ViewProps, 'children' | 'style'> {
  recording?: boolean;
  /** Running but paused: the dot holds still and the label says so. */
  paused?: boolean;
  label?: ReactNode;
  seconds?: number;
  startedAt?: number;
  size?: RecordingIndicatorSize;
  /** Stops the pulse, for a device build wiring up AccessibilityInfo. */
  reduceMotion?: boolean;
  labels?: Partial<RecordingIndicatorLabels>;
  skeleton?: boolean;
}

export function RecordingIndicator({
  recording = true,
  paused = false,
  label,
  seconds,
  startedAt,
  size = 'md',
  reduceMotion = false,
  labels,
  skeleton = false,
  ...rest
}: RecordingIndicatorProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const state = recordingState(recording, paused);
  // A paused recording freezes its readout rather than counting on.
  const elapsed = useCallElapsed({ seconds, startedAt, running: state === 'recording' });
  const hasElapsed = seconds !== undefined || startedAt !== undefined;

  const gap = t(sizeFor(recordingIndicatorSpec, size).gap ?? 'space-2');
  const row = { flexDirection: 'row' as const, alignItems: 'center' as const, columnGap: gap };

  if (skeleton) {
    return (
      <View aria-hidden={true} style={row} {...rest}>
        <StatusDot size="sm" skeleton />
        <Skeleton variant="text" width={t('space-16')} />
      </View>
    );
  }

  return (
    <View
      // A recording starting or stopping IS worth interrupting for, unlike the
      // call clock — the opposite decision from CallTimer, for the opposite
      // reason. role="status" is the polite live region on both platforms.
      accessibilityRole="status"
      style={row}
      {...rest}
    >
      <StatusDot
        size={size === 'sm' ? 'sm' : 'md'}
        tone={DOT_TONE[state]}
        pulse={shouldPulse(state, reduceMotion)}
      />
      <Text size={size === 'sm' ? 'xs' : 'sm'} tone={LABEL_TONE[state]} weight="medium">
        {label ?? text[state]}
      </Text>
      {/* The live region says what is happening; the clock is decoration, and
          announcing it would re-fire the region every second. */}
      {hasElapsed && (
        <View aria-hidden={true}>
          <Text size={size === 'sm' ? 'xs' : 'sm'} tone="muted" mono>
            {formatDuration(elapsed)}
          </Text>
        </View>
      )}
    </View>
  );
}
