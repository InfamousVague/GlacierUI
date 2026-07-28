import { leastDelivery, type DeliveryStatus as DeliveryStatusValue } from '@glacier/logic';
import {
  deliveryGlyph,
  deliveryTone,
  type DeliveryGlyph,
  type DeliveryLabels,
} from '@glacier/logic';
import { AlertTriangle, Check, CheckCheck, CircleCheck, Clock } from '@glacier/icons';
import type { ComponentProps } from 'react';
import { cx } from '../../../internal/cx.ts';
import { defineMessages, useT } from '../../../i18n/index.ts';
import { Skeleton } from '../../feedback/Skeleton/Skeleton.tsx';
import styles from './DeliveryStatus.module.css';

export type { DeliveryStatusValue, DeliveryLabels };

export type DeliveryStatusSize = 'sm' | 'md';

/**
 * TODO(i18n): move into packages/react/src/i18n/messages.ts as
 * `deliverySending` / `deliverySent` / `deliveryDelivered` / `deliveryRead` /
 * `deliveryFailed`; listed in the handoff.
 *
 * The glyph is the whole visible component, so these words are the only thing a
 * screen reader has. Leaving them untranslated would make the delivery state
 * English-only in an otherwise translated transcript.
 */
const messages = defineMessages({
  deliverySending: { en: 'Sending', es: 'Enviando', fr: 'Envoi en cours', de: 'Wird gesendet', ja: '送信中', pt: 'Enviando', zh: '发送中', ar: 'جارٍ الإرسال' },
  deliverySent: { en: 'Sent', es: 'Enviado', fr: 'Envoyé', de: 'Gesendet', ja: '送信済み', pt: 'Enviado', zh: '已发送', ar: 'تم الإرسال' },
  deliveryDelivered: { en: 'Delivered', es: 'Entregado', fr: 'Remis', de: 'Zugestellt', ja: '配信済み', pt: 'Entregue', zh: '已送达', ar: 'تم التسليم' },
  deliveryRead: { en: 'Read', es: 'Leído', fr: 'Lu', de: 'Gelesen', ja: '既読', pt: 'Lido', zh: '已读', ar: 'تمت القراءة' },
  deliveryFailed: { en: 'Not sent', es: 'No enviado', fr: 'Non envoyé', de: 'Nicht gesendet', ja: '未送信', pt: 'Não enviado', zh: '未发送', ar: 'لم يتم الإرسال' },
});

/**
 * The glyph each shape resolves to. The status-to-SHAPE mapping lives in
 * @glacier/logic so both kits draw the same silhouette; only the lookup from
 * shape name to component is per-binding, because that is the only part that is
 * actually a component.
 */
const ICON: Record<DeliveryGlyph, typeof Check> = {
  clock: Clock,
  check: Check,
  'double-check': CheckCheck,
  'check-circle': CircleCheck,
  alert: AlertTriangle,
};

const MESSAGE: Record<DeliveryStatusValue, keyof typeof messages> = {
  sending: 'deliverySending',
  sent: 'deliverySent',
  delivered: 'deliveryDelivered',
  read: 'deliveryRead',
  failed: 'deliveryFailed',
};

export interface DeliveryStatusProps extends Omit<ComponentProps<'span'>, 'children'> {
  /** How far the message got. */
  status?: DeliveryStatusValue;
  /**
   * A run's states, collapsed with `leastDelivery` to the least advanced of
   * them — so a stack holding one failed send says failed rather than claiming
   * the "read" of whichever message happened to be last. Ignored when `status`
   * is set.
   */
  statuses?: (DeliveryStatusValue | undefined)[];
  size?: DeliveryStatusSize;
  /** Overrides the text alternative; defaults to the status's own name. */
  label?: string;
  /**
   * Hides the glyph from assistive tech. Only for a bubble whose own accessible
   * name already reports the state — otherwise the mark is unreadable to anyone
   * not looking at it.
   */
  decorative?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Overrides the status words; merged over the kit's translations. */
  labels?: Partial<DeliveryLabels>;
}

/** Glyph box per size, mirroring the --delivery-d rules in the CSS. */
const SIZE_TOKEN: Record<DeliveryStatusSize, string> = {
  sm: 'var(--glacier-size-sm)',
  md: 'var(--glacier-size-md)',
};

/**
 * How far a sent message got, as one small mark beside its timestamp.
 *
 * The rule the whole component exists to hold: **no two states share a
 * silhouette.** A clock, one tick, two ticks, a tick inside a solid disc, a
 * warning triangle. It would be easier to draw "delivered" and "read" as the
 * same double tick in two colours — most chat apps do — but this is the
 * smallest element in a transcript, about the height of a lowercase letter, and
 * that is precisely the size at which hue stops carrying meaning: a colour-blind
 * reader, a monochrome display, or a phone in sunlight all reduce it to the same
 * grey mark. Shape survives all three. Colour is layered on top for the two
 * states worth spending it on, never underneath as the only signal.
 *
 * It is `role="img"` with a label naming the state, not a live region: a
 * transcript holds hundreds of these, and hundreds of live regions would re-read
 * the conversation every time a receipt landed.
 *
 * Retrying a failed send belongs to the bubble, not here — the mark reports, it
 * never acts, so it never becomes a tap target the size of a letter.
 */
export function DeliveryStatus({
  status,
  statuses,
  size = 'md',
  label,
  decorative = false,
  skeleton = false,
  labels,
  className,
  ...rest
}: DeliveryStatusProps) {
  const t = useT();
  const box = SIZE_TOKEN[size];

  if (skeleton) {
    return <Skeleton variant="circle" width={box} className={className} />;
  }

  // An explicit status wins; a run collapses to the one it should advertise.
  // Both paths end at the same value, so a bubble and the stack holding it
  // cannot report different things.
  const resolved = status ?? (statuses ? leastDelivery(statuses) : undefined);
  if (resolved === undefined) return null;

  const Glyph = ICON[deliveryGlyph(resolved)];
  const name = label ?? labels?.[resolved] ?? t(messages[MESSAGE[resolved]]);

  return (
    <span
      className={cx(styles.status, styles[size], styles[deliveryTone(resolved)], className)}
      data-status={resolved}
      // Not role="status": see the component note. This reports, it does not
      // interrupt.
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative ? 'true' : undefined}
      {...rest}
    >
      <Glyph size="100%" strokeWidth={1.75} aria-hidden="true" />
    </span>
  );
}
