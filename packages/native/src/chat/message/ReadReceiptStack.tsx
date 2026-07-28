import {
  avatarStackLabels,
  fillTemplate,
  readReceiptLabels,
  readReceiptStack,
  splitStack,
  stackLabel,
  type ReadReceiptLabels,
} from '@glacier/logic';
import { AvatarGroup, type AvatarGroupProps, type AvatarStackItem } from '../../atoms/display/AvatarGroup.tsx';

export type { ReadReceiptLabels };

export interface ReadReceiptStackProps
  // Everything geometric is the preset's; only what a receipt genuinely tunes is
  // exposed, so it cannot quietly become a second AvatarGroup with different
  // defaults.
  extends Omit<AvatarGroupProps, 'avatars' | 'size' | 'shape' | 'direction' | 'labels' | 'label'> {
  /** Who has read up to this point, in the order they should read. */
  readers: readonly AvatarStackItem[];
  /** Accessible name; defaults to "Read by" followed by the readers it shows. */
  label?: string;
  labels?: Partial<ReadReceiptLabels>;
}

/**
 * The Glacier ReadReceiptStack, rendered with React Native primitives.
 *
 * Not a second stack: it renders AvatarGroup with the read-receipt preset from
 * @glacier/logic — the smallest avatar step, a tighter overlap, and a lower
 * cap — the same three numbers the DOM binding reads. All it adds is the
 * sentence, since "Ada, Grace, 2 more" under a bubble is ambiguous in a way
 * "Read by Ada, Grace, 2 more" is not.
 */
export function ReadReceiptStack({
  readers,
  max = readReceiptStack.max,
  overlap = readReceiptStack.overlap,
  label,
  labels,
  ...rest
}: ReadReceiptStackProps) {
  const text = { ...readReceiptLabels, ...labels };
  const { shown, overflow } = splitStack(readers, max);

  const names = stackLabel(shown.map((reader) => reader.name ?? ''), overflow, text.more);

  return (
    <AvatarGroup
      avatars={readers}
      max={max}
      overlap={overlap}
      size={readReceiptStack.size}
      label={label ?? fillTemplate(text.readBy, { names })}
      labels={{ ...avatarStackLabels, more: text.more }}
      {...rest}
    />
  );
}
