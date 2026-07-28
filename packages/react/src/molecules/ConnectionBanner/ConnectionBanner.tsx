import {
  CONNECTION_RECONNECTED_MS,
  connectionGlyph,
  connectionTone,
  connectionUrgency,
  connectionVisible,
  useConnectionSettle,
  type ConnectionGlyph,
  type ConnectionLabels,
  type ConnectionState,
} from '@glacier/logic';
import { RefreshCw, Wifi, WifiOff } from '@glacier/icons';
import { useReducedMotion } from 'motion/react';
import type { ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import { defineMessages, useT } from '../../i18n/index.ts';
import { Banner } from '../../atoms/feedback/Banner/Banner.tsx';
import { Button } from '../../atoms/inputs/Button/Button.tsx';
import styles from './ConnectionBanner.module.css';

export type { ConnectionState, ConnectionLabels };

/**
 * TODO(i18n): move into packages/react/src/i18n/messages.ts as
 * `connectionOffline` / `connectionReconnecting` / `connectionReconnected` /
 * `connectionRetry`; listed in the handoff.
 */
const messages = defineMessages({
  connectionOffline: {
    en: 'You are offline', es: 'Estás sin conexión', fr: 'Vous êtes hors ligne',
    de: 'Sie sind offline', ja: 'オフラインです', pt: 'Você está offline',
    zh: '您已离线', ar: 'أنت غير متصل',
  },
  connectionReconnecting: {
    en: 'Reconnecting…', es: 'Reconectando…', fr: 'Reconnexion…', de: 'Verbindung wird wiederhergestellt…',
    ja: '再接続中…', pt: 'Reconectando…', zh: '正在重新连接…', ar: 'جارٍ إعادة الاتصال…',
  },
  connectionReconnected: {
    en: 'Back online', es: 'De nuevo en línea', fr: 'De nouveau en ligne', de: 'Wieder online',
    ja: 'オンラインに戻りました', pt: 'De volta online', zh: '已恢复连接', ar: 'عدت متصلاً',
  },
  connectionRetry: {
    en: 'Try again', es: 'Reintentar', fr: 'Réessayer', de: 'Erneut versuchen',
    ja: '再試行', pt: 'Tentar novamente', zh: '重试', ar: 'إعادة المحاولة',
  },
});

/**
 * The glyph each state resolves to. The state-to-SHAPE mapping lives in
 * @glacier/logic; only the lookup from shape name to component is per-binding.
 */
const ICON: Record<ConnectionGlyph, typeof Wifi> = {
  'wifi-off': WifiOff,
  refresh: RefreshCw,
  wifi: Wifi,
};

const MESSAGE = {
  offline: 'connectionOffline',
  reconnecting: 'connectionReconnecting',
  reconnected: 'connectionReconnected',
} as const;

export interface ConnectionBannerProps extends Omit<ComponentProps<'div'>, 'children'> {
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
  /** Overrides the wording; merged over the kit's translations. */
  labels?: Partial<ConnectionLabels>;
}

/**
 * The network strip over a conversation — a **preset of Banner**, not a second
 * banner.
 *
 * Banner already owns the strip, the soft tone wash, the hairline, the icon
 * slot, and the trailing action; restyling any of that here would be two
 * banners to keep in sync. What this adds is the three things Banner cannot
 * know: which tone and glyph each connection state paints, that the recovery
 * confirmation dismisses ITSELF after a dwell, and that only "offline" is worth
 * interrupting a screen reader for.
 *
 * That last one is the decision worth spelling out. Banner infers its role from
 * its tone, which would make the warning-toned "Reconnecting…" an `alert` that
 * cuts across whatever someone is reading — every few seconds, for as long as
 * the network is bad. So the role is set from `connectionUrgency` instead:
 * offline is assertive because it changes what the user can do (anything typed
 * from here is not going anywhere), while retrying and recovering are progress
 * reports on a problem already announced and wait for a pause.
 *
 * `online` renders nothing at all. A "Connected" strip that lives at the top of
 * every chat app is a strip nobody reads.
 */
export function ConnectionBanner({
  state,
  online,
  onRetry,
  onSettle,
  dwellMs = CONNECTION_RECONNECTED_MS,
  labels,
  className,
  ...rest
}: ConnectionBannerProps) {
  const t = useT();
  const reduce = useReducedMotion();

  // The explicit state wins; `online` is the one-boolean shorthand for the
  // common case of a transport that only reports up or down.
  const resolved: ConnectionState = state ?? (online === false ? 'offline' : 'online');

  // Always called: the timer is part of the state machine, and a hook behind a
  // conditional return is a hook that unmounts the moment the banner clears.
  useConnectionSettle(resolved, () => onSettle?.(), dwellMs);

  if (!connectionVisible(resolved)) return null;

  const key = MESSAGE[resolved as keyof typeof MESSAGE];
  const message = labels?.[resolved as keyof typeof MESSAGE] ?? t(messages[key]);
  const Glyph = ICON[connectionGlyph(resolved)];
  const spin = resolved === 'reconnecting' && !reduce;

  return (
    <Banner
      tone={connectionTone(resolved)}
      // Banner derives its role from its tone; the connection states need the
      // opposite mapping, so it is set explicitly here.
      role={connectionUrgency(resolved) === 'assertive' ? 'alert' : 'status'}
      className={cx(styles.banner, className)}
      data-state={resolved}
      icon={
        <span className={styles.icon} data-spin={spin || undefined} aria-hidden="true">
          <Glyph size={16} />
        </span>
      }
      action={
        // Only while offline: there is nothing to retry mid-attempt and nothing
        // to retry once it worked, and a focused control that disappears out
        // from under the keyboard is worse than no control.
        resolved === 'offline' && onRetry ? (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            {labels?.retry ?? t(messages.connectionRetry)}
          </Button>
        ) : undefined
      }
      {...rest}
    >
      {message}
    </Banner>
  );
}
