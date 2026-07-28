// The Glacier ConnectionBanner, rendered with React Native primitives — a
// PRESET of the native Banner, not a second banner. The state machine, the dwell
// before the recovery confirmation clears, the tone, the glyph, and how hard
// each state interrupts all come from @glacier/logic, so the two platforms
// cannot disagree about what "offline" looks like or how long "back online"
// stays.

import {
  CONNECTION_RECONNECTED_MS,
  connectionGlyph,
  connectionLabels,
  connectionLabel,
  connectionTone,
  connectionUrgency,
  connectionVisible,
  useConnectionSettle,
  type ConnectionGlyph,
  type ConnectionLabels,
  type ConnectionState,
} from '@glacier/logic';
import { RefreshCw, Wifi, WifiOff } from '@glacier/icons';
import type { ViewProps } from 'react-native';
import { t } from '../../tokens.ts';
import { Banner } from '../../atoms/feedback/Banner.tsx';
import { Button } from '../../atoms/inputs/Button.tsx';

export type { ConnectionState, ConnectionLabels };

/**
 * The glyph each state resolves to. Only the lookup from shape NAME to component
 * is per-binding; which shape a state draws is decided once in commons.
 */
const ICON: Record<ConnectionGlyph, typeof Wifi> = {
  'wifi-off': WifiOff,
  refresh: RefreshCw,
  wifi: Wifi,
};

export interface ConnectionBannerProps extends Omit<ViewProps, 'children' | 'style'> {
  /** Which state to show. Online renders nothing at all. */
  state?: ConnectionState;
  /** Convenience for the common case: true renders nothing, false shows offline. */
  online?: boolean;
  /** Offers a retry action while offline. */
  onRetry?: () => void;
  /** Called once the recovery confirmation has been up long enough. */
  onSettle?: () => void;
  /** How long the recovery confirmation stays. */
  dwellMs?: number;
  /** Overrides the English wording; merged over the shared defaults. */
  labels?: Partial<ConnectionLabels>;
}

/**
 * The network strip over a conversation.
 *
 * Banner already owns the strip, the tone wash, the icon slot, and the trailing
 * action; what this adds is the three things Banner cannot know — the tone and
 * glyph per connection state, that the recovery confirmation dismisses ITSELF,
 * and that only "offline" is worth interrupting for. Banner infers its role from
 * its tone, which would make the warning-toned "Reconnecting…" an alert that
 * cuts across whatever is being read, every few seconds, for as long as the
 * network is bad; the role comes from `connectionUrgency` instead.
 */
export function ConnectionBanner({
  state,
  online,
  onRetry,
  onSettle,
  dwellMs = CONNECTION_RECONNECTED_MS,
  labels,
  ...rest
}: ConnectionBannerProps) {
  const resolved: ConnectionState = state ?? (online === false ? 'offline' : 'online');

  // Always called: the timer is the machine's last transition, and a hook behind
  // a conditional return is a hook that unmounts the moment the banner clears.
  useConnectionSettle(resolved, () => onSettle?.(), dwellMs);

  if (!connectionVisible(resolved)) return null;

  const tone = connectionTone(resolved);
  const Glyph = ICON[connectionGlyph(resolved)];

  return (
    <Banner
      tone={tone}
      // Banner derives its role from its tone; the connection states need the
      // opposite mapping, so it is set explicitly here.
      accessibilityRole={connectionUrgency(resolved) === 'assertive' ? 'alert' : 'status'}
      icon={<Glyph size={16} color={t(`${tone}-text`)} />}
      action={
        // Only while offline: nothing to retry mid-attempt, nothing to retry
        // once it worked.
        resolved === 'offline' && onRetry ? (
          <Button variant="ghost" size="sm" onPress={onRetry}>
            {labels?.retry ?? connectionLabels.retry}
          </Button>
        ) : undefined
      }
      {...rest}
    >
      {connectionLabel(resolved, labels)}
    </Banner>
  );
}
