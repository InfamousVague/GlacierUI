import {
  memberRoleTone,
  presenceDotSize,
  presenceLabel,
  type PresenceLabels,
  type PresenceStatus,
} from '@glacier/logic';
import type { MouseEventHandler, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Avatar, type AvatarSize } from '../../atoms/display/Avatar/Avatar.tsx';
import { Pill, type PillTone } from '../../atoms/display/Pill/Pill.tsx';
import { PresenceDot } from '../../atoms/display/PresenceDot/PresenceDot.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import { ListItem, type ListItemProps } from '../List/List.tsx';
import styles from './MemberRow.module.css';

export interface MemberRowProps
  extends Omit<ListItemProps, 'title' | 'description' | 'leading' | 'trailing' | 'role'> {
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
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Overrides the English presence names used in the row's accessible name. */
  labels?: Partial<PresenceLabels>;
  /** Renders a placeholder holding the row's exact layout. */
  skeleton?: boolean;
}

/**
 * A person in a list.
 *
 * This is a ListItem with a person in it, not a new row: the layout, the hover
 * and selected paint, and the div/anchor/button switch are all the list item's,
 * so a roster and a settings list stay the same list. What it adds is the
 * person — the avatar with presence pinned to its corner, the role pill, and the
 * actions slot.
 *
 * There is no RoleBadge in the kit because a role badge is a Pill; the only
 * thing that needed a shared home was which tone a role takes, which lives in
 * @glacier/logic so both bindings agree that "Owner" is accent.
 *
 * The presence is deliberately NOT announced by the dot. A list item's leading
 * slot is decorative and hidden from assistive tech, so a labelled dot in there
 * would be silently dropped and presence would end up colour-only. Instead the
 * dot is decorative and the status name rides in the title as visually hidden
 * text, which names the row whether it renders as a div, an anchor, or a button.
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
  className,
  ...rest
}: MemberRowProps) {
  const personName = avatarName ?? (typeof name === 'string' ? name : undefined);
  const statusText = status ? presenceLabel(status, labels) : undefined;
  const tone = roleTone ?? (typeof role === 'string' ? memberRoleTone(role) : 'neutral');

  const leading = (
    <span className={styles.person}>
      <Avatar src={src} name={personName} size={avatarSize} skeleton={skeleton} />
      {status && !skeleton && (
        <span className={styles.presence}>
          {/* Decorative: the row's title carries the words. */}
          <PresenceDot status={status} size={presenceDotSize(avatarSize)} ring decorative />
        </span>
      )}
    </span>
  );

  /**
   * The title, and the presence riding along inside it.
   *
   * A plain-string name is swapped for a hidden copy of the whole sentence
   * rather than having the status appended beside it: an accessible name is
   * assembled child by child with a space between each, so an appended fragment
   * reads back as "Ada Lovelace , Do not disturb". Building the sentence once
   * gives the exact string the native binding passes as its row label, which is
   * what keeps the two rows announcing the same words.
   */
  const spokenName = statusText && typeof name === 'string' ? `${name}, ${statusText}` : undefined;

  const title = skeleton ? (
    <Skeleton variant="text" width="45%" />
  ) : spokenName ? (
    <>
      <span aria-hidden="true">{name}</span>
      <span className={styles.srOnly}>{spokenName}</span>
    </>
  ) : statusText ? (
    <>
      {name}
      <span className={styles.srOnly}>{statusText}</span>
    </>
  ) : (
    name
  );

  const description =
    secondary == null ? undefined : skeleton ? <Skeleton variant="text" width="30%" /> : secondary;

  const trailing =
    skeleton || (role == null && actions == null) ? undefined : (
      <span className={styles.trailing}>
        {role != null && (
          <Pill size="sm" variant="soft" tone={tone}>
            {role}
          </Pill>
        )}
        {actions}
      </span>
    );

  return (
    <ListItem
      className={cx(className)}
      title={title}
      description={description}
      leading={leading}
      trailing={trailing}
      {...rest}
    />
  );
}
