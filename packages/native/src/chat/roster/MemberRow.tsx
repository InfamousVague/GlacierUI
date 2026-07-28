import { View, type ViewProps } from 'react-native';
import type { ReactNode } from 'react';
// TODO(integration): switch to '@glacier/spec' once member-row.ts is registered.
import { memberRowSpec } from '../../../../spec/src/components/member-row.ts';
import {
  memberRoleTone,
  presenceDotSize,
  presenceLabel,
  type PresenceLabels,
  type PresenceStatus,
} from '@glacier/logic';
import { listSpec, listItemSpec } from '@glacier/spec';
import { t } from '../../tokens.ts';
import { dimensionsFor, sizeFor } from '../../resolve.ts';
import { Avatar, type AvatarSize } from '../../atoms/display/Avatar.tsx';
import { Pill, type PillTone } from '../../atoms/display/Pill.tsx';
import { PresenceDot } from '../../atoms/display/PresenceDot.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton.tsx';
import { ListItem, type ListItemProps } from '../../molecules/List.tsx';

export interface MemberRowProps
  extends Omit<ListItemProps, 'title' | 'description' | 'leading' | 'trailing'> {
  /** The person's name. */
  name: ReactNode;
  /** An optional supporting line under the name. */
  secondary?: ReactNode;
  /** Avatar image URL; falls back to the initials of the name. */
  src?: string;
  /** Overrides the name used for the initials and the image alt, for when name is not a plain string. */
  avatarName?: string;
  avatarSize?: AvatarSize;
  /** The person's presence. Omit it and no dot is drawn — an absent dot means unknown, not offline. */
  status?: PresenceStatus;
  /** The person's role, rendered as a small soft Pill. */
  role?: ReactNode;
  /** Overrides the pill tone; a string role otherwise resolves its own. */
  roleTone?: PillTone;
  /** Trailing row controls, after the role pill. */
  actions?: ReactNode;
  /** Overrides the English presence names used in the row's accessible name. */
  labels?: Partial<PresenceLabels>;
  /** Renders a placeholder holding the row's exact layout. */
  skeleton?: boolean;
}

// Size-independent metrics (the trailing gap, the presence inset) from the spec.
const BOX = dimensionsFor(memberRowSpec);
// The loading row borrows the list's own row metrics rather than inventing any.
const ITEM_DIMS = dimensionsFor(listItemSpec);

/**
 * The Glacier MemberRow, rendered with React Native primitives.
 *
 * A ListItem with a person in it, not a new row: the row layout, the selected
 * paint, and the pressable switch are all the native ListItem's, exactly as the
 * DOM binding leans on the DOM one. What it adds is the avatar with presence
 * pinned to its corner, the role pill, and the actions slot.
 *
 * The presence is not announced by the dot. A list item's leading slot is
 * decorative and hidden from assistive tech on both platforms, so a labelled dot
 * there would be dropped and presence would end up colour-only. The DOM binding
 * puts the status name in the title as visually hidden text; this one passes the
 * same string as the row's own label, which is the mechanism a native row has.
 *
 * There is no RoleBadge: a role badge is a Pill, and the only thing that needed
 * a shared home was the role-to-tone table, which lives in @glacier/logic.
 */
export function MemberRow({
  name,
  secondary,
  src,
  avatarName,
  avatarSize = 'md',
  status,
  role,
  roleTone,
  actions,
  labels,
  skeleton = false,
  ...rest
}: MemberRowProps) {
  const personName = avatarName ?? (typeof name === 'string' ? name : undefined);
  const statusText = status ? presenceLabel(status, labels) : undefined;
  const tone = roleTone ?? (typeof role === 'string' ? memberRoleTone(role) : 'neutral');

  // A native list-item wraps its title and description in <Text>, and a
  // placeholder is a View — nesting one inside the other is unreliable on a
  // device. So a loading row is drawn directly from the list specs' own row
  // metrics rather than through ListItem, which keeps the geometry identical
  // without asking Text to host a box. (The DOM binding has no such limit and
  // threads its placeholders straight through ListItem.)
  if (skeleton) {
    const row = sizeFor(listSpec, 'md');
    return (
      <View
        aria-hidden={true}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          columnGap: t(ITEM_DIMS.gap ?? 'space-3'),
          minHeight: t(row.height ?? 'control-height-md'),
          paddingVertical: t('space-3'),
          paddingHorizontal: t(row.paddingInline ?? 'space-4'),
          borderRadius: t(ITEM_DIMS.radius ?? 'radius-lg'),
        }}
      >
        <Avatar size={avatarSize} skeleton />
        <View style={{ flex: 1, minWidth: 0, rowGap: t('space-1') }}>
          <Skeleton variant="text" width="45%" />
          {secondary != null && <Skeleton variant="text" width="30%" />}
        </View>
      </View>
    );
  }

  const leading = (
    <View style={{ position: 'relative', flexDirection: 'row', flexShrink: 0 }}>
      <Avatar src={src} name={personName} size={avatarSize} />
      {status && (
        <View style={{ position: 'absolute', bottom: t(BOX.presenceInset ?? 'space-0'), right: t(BOX.presenceInset ?? 'space-0') }}>
          {/* Decorative: the row's own label carries the words. */}
          <PresenceDot status={status} size={presenceDotSize(avatarSize)} ring decorative />
        </View>
      )}
    </View>
  );

  const trailing =
    role == null && actions == null ? undefined : (
      <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: t(BOX.gap ?? 'space-2') }}>
        {role != null && (
          <Pill size="sm" variant="soft" tone={tone}>
            {role}
          </Pill>
        )}
        {actions}
      </View>
    );

  return (
    <ListItem
      // The row's accessible name is the person plus their presence, the same
      // sentence the DOM binding hides inside its title.
      aria-label={
        statusText && typeof name === 'string' ? `${name}, ${statusText}` : undefined
      }
      title={name}
      description={secondary}
      leading={leading}
      trailing={trailing}
      {...rest}
    />
  );
}
