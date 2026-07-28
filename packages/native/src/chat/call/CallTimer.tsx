// The Glacier CallTimer, rendered with React Native's Text: how long the call
// has been running. Both the clock (`useCallElapsed`) and the formatting
// (`formatDuration`) come from @glacier/logic — the same functions the DOM kit
// and the player read — so one call cannot show two durations.
//
// Web-parity notes:
// - Font size comes from the call-timer spec through the shared resolvers; the
//   tone maps to the spec's rest paint or its `muted` state paint.
// - `mono` on the native Text gives the monospace family with tabular figures,
//   matching the web `font-variant-numeric: tabular-nums`.
// - The web pins `min-width: 5ch` so 9:59 rolling to 10:00 does not reflow the
//   row; React Native has no ch unit, so the readout is centered in a fixed
//   character-width box measured from the spec's font size instead.
// - Nothing animates on either platform: an eased clock would appear to lag.

import { View } from 'react-native';
import { formatDuration } from '@glacier/logic';
import { sizeFor } from '../../resolve.ts';
import { Text } from '../../atoms/display/Text.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton.tsx';
import { t } from '../../tokens.ts';
import { useCallElapsed } from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once the call-controls specs are
// registered in packages/spec/src/index.ts.
import { callTimerSpec, callTimerTones } from '../../../../spec/src/components/call-timer.ts';

// Derived from the spec so the union cannot drift from the web kit.
export type CallTimerTone = (typeof callTimerTones)[number];
export type CallTimerSize = 'sm' | 'md';
export { callTimerTones };

export interface CallTimerProps {
  /** Controlled elapsed seconds. Wins over `startedAt`. */
  seconds?: number;
  /** Epoch milliseconds the call connected; the timer then ticks its own clock. */
  startedAt?: number;
  /** Stops the clock — a held call freezes rather than keeps counting. */
  running?: boolean;
  tone?: CallTimerTone;
  size?: CallTimerSize;
  /** Accessible name for the readout. */
  label?: string;
  /** Formats the seconds. Defaults to the kit-wide m:ss / h:mm:ss. */
  format?: (seconds: number) => string;
  /** Renders a placeholder the width of a settled readout. */
  skeleton?: boolean;
}

/** The web pins the readout at 5ch; approximate that from the spec's font size. */
const READOUT_CHARS = 5;

export function CallTimer({
  seconds,
  startedAt,
  running = true,
  tone = 'default',
  size = 'md',
  label = 'Call duration',
  format = formatDuration,
  skeleton = false,
}: CallTimerProps) {
  const elapsed = useCallElapsed({ seconds, startedAt, running });
  const fontSize = sizeFor(callTimerSpec, size).fontSize ?? 'font-size-sm';
  // A monospace character is about 0.6em wide, so five of them is 3em.
  const minWidth = `calc(${t(fontSize)} * ${READOUT_CHARS * 0.6})`;

  if (skeleton) {
    return <Skeleton variant="text" width={minWidth} />;
  }

  return (
    <View
      // role="timer" and no live region: a clock announcing itself every second
      // would make a screen reader unusable for the length of the call. (The web
      // spells that as aria-live="off"; react-native-web's default for a
      // non-live view is the same thing.)
      accessibilityRole="timer"
      accessibilityLabel={label}
      aria-label={label}
      style={{ minWidth }}
    >
      {/* The tone maps onto Text's own tones, whose paint comes from the text
          spec — the same `text` / `text-muted` tokens the web stylesheet uses,
          rather than a second transcription of them here. */}
      <Text size={size === 'sm' ? 'xs' : 'sm'} tone={tone === 'muted' ? 'muted' : 'default'} mono>
        {format(elapsed)}
      </Text>
    </View>
  );
}
