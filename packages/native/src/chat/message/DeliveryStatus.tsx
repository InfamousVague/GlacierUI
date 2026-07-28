// The Glacier DeliveryStatus, rendered with React Native primitives: how far a
// sent message got, as one small mark. The status-to-SHAPE table and the
// least-advanced collapse both come from @glacier/logic, and every colour and
// box comes from the delivery-status spec through the shared resolvers — so the
// silhouette a phone draws is the silhouette the web draws.

import { View, type ViewProps } from 'react-native';
import { leastDelivery, type DeliveryStatus as DeliveryStatusValue } from '@glacier/logic';
import {
  deliveryGlyph,
  deliveryLabel,
  type DeliveryGlyph,
  type DeliveryLabels,
} from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once delivery-status.ts is registered.
import { deliveryStatusSpec } from '../../../../spec/src/components/delivery-status.ts';
import { AlertTriangle, Check, CheckCheck, CircleCheck, Clock } from '@glacier/icons';
import { t } from '../../tokens.ts';
import { paintFor, sizeFor, dimensionsFor } from '../../resolve.ts';
import { Skeleton } from '../../atoms/feedback/Skeleton.tsx';

export type { DeliveryStatusValue, DeliveryLabels };

export type DeliveryStatusSize = 'sm' | 'md';

/**
 * The glyph each shape resolves to. Only the lookup from shape NAME to component
 * is per-binding; which shape a status draws is decided once in commons.
 */
const ICON: Record<DeliveryGlyph, typeof Check> = {
  clock: Clock,
  check: Check,
  'double-check': CheckCheck,
  'check-circle': CircleCheck,
  alert: AlertTriangle,
};

export interface DeliveryStatusProps extends Omit<ViewProps, 'children' | 'style'> {
  /** How far the message got. */
  status?: DeliveryStatusValue;
  /** A run's states, collapsed to the least advanced one. Ignored when status is set. */
  statuses?: (DeliveryStatusValue | undefined)[];
  size?: DeliveryStatusSize;
  /** Overrides the text alternative; defaults to the status's own name. */
  label?: string;
  /** Hides the glyph from assistive tech; only for a bubble that already reports the state. */
  decorative?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Overrides the English status names; merged over the shared defaults. */
  labels?: Partial<DeliveryLabels>;
  /**
   * An explicit glyph colour, for a caller that has dropped the mark onto a
   * surface the tone table knows nothing about — an accent-filled bubble, where
   * both the quiet greys and the accent tint go unreadable.
   *
   * The DOM binding needs no such prop: a stylesheet there can simply outrank
   * the tone class. React Native has no cascade and the icon takes its colour as
   * a prop, so the override has to be handed down explicitly.
   */
  color?: string;
}

// The stroke weight is a glyph detail rather than a scale value, so it lives in
// the spec's dimensions and is read from there rather than retyped.
const STROKE = Number(dimensionsFor(deliveryStatusSpec).stroke ?? 1.75);

/**
 * No two states share a silhouette: a clock, one tick, two ticks, a tick inside
 * a solid disc, a warning triangle. This is the smallest element in a
 * transcript, which is precisely the size at which hue stops carrying meaning —
 * so colour is layered on top for the two states worth spending it on, never
 * underneath as the only signal.
 *
 * `accessibilityRole="image"` with a label naming the state, not a live region:
 * a transcript holds hundreds of these.
 */
export function DeliveryStatus({
  status,
  statuses,
  size = 'md',
  label,
  decorative = false,
  skeleton = false,
  labels,
  color,
  ...rest
}: DeliveryStatusProps) {
  const dims = sizeFor(deliveryStatusSpec, size);
  const box = t(dims.iconSize ?? 'size-md');

  if (skeleton) {
    return <Skeleton variant="circle" width={box} {...rest} />;
  }

  // An explicit status wins; a run collapses to the one it should advertise.
  const resolved = status ?? (statuses ? leastDelivery(statuses) : undefined);
  if (resolved === undefined) return null;

  const Glyph = ICON[deliveryGlyph(resolved)];
  const colour = color ?? t(paintFor(deliveryStatusSpec, 'tones', resolved).text ?? 'text-muted');

  return (
    <View
      accessibilityRole={decorative ? undefined : 'image'}
      accessibilityLabel={decorative ? undefined : (label ?? deliveryLabel(resolved, labels))}
      aria-hidden={decorative ? true : undefined}
      style={{ width: box, height: box, alignItems: 'center', justifyContent: 'center' }}
      {...rest}
    >
      <Glyph size="100%" color={colour} strokeWidth={STROKE} />
    </View>
  );
}
