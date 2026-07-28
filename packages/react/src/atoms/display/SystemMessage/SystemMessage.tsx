import {
  systemMessageGlyph,
  type SystemGlyph,
  type SystemMessageKind,
} from '@glacier/logic';
import { Info, Pencil, PhoneOff, UserMinus, UserPlus } from '@glacier/icons';
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../../internal/cx.ts';
import { Skeleton } from '../../feedback/Skeleton/Skeleton.tsx';
import styles from './SystemMessage.module.css';

export type { SystemMessageKind };

/**
 * The glyph each kind resolves to. The kind-to-SHAPE mapping lives in
 * @glacier/logic; only the lookup from shape name to component is per-binding.
 */
const ICON: Record<SystemGlyph, typeof Info> = {
  info: Info,
  'user-plus': UserPlus,
  'user-minus': UserMinus,
  pencil: Pencil,
  'phone-off': PhoneOff,
};

export interface SystemMessageProps extends ComponentProps<'div'> {
  /** What the line reports; chooses the default glyph. */
  kind?: SystemMessageKind;
  /** Overrides the kind's glyph. Pass null to drop it. */
  icon?: ReactNode;
  /** When it happened, appended after the text. */
  timestamp?: ReactNode;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  children?: ReactNode;
}

/** The glyph box: one text step, so it sits on the line rather than above it. */
const ICON_SIZE = 'var(--glacier-size-sm)';

/**
 * The transcript narrating itself: joins, leaves, topic changes, ended calls.
 *
 * It has to read as chrome without becoming invisible, and the way it does that
 * is entirely typographic — smaller, subtler, centred, and capped well short of
 * the transcript width, so the eye files it as furniture and slides past. None
 * of that touches what a screen reader gets.
 *
 * Which is the second decision, and the one worth defending: this is **not** a
 * separator, even though it looks exactly like a labelled divider. Giving it
 * `role="separator"` would make a screen reader announce "separator" and then
 * skip the sentence — backwards, since the words are the content and the
 * centring is the decoration. It is also not a live region: it already sits in
 * the transcript at the point it happened, and announcing it out of band would
 * read it twice. So it carries no role at all, and is simply read in place.
 *
 * The icon is aria-hidden for the same reason: "Ana joined" should not be read
 * as "user plus Ana joined".
 */
export function SystemMessage({
  kind = 'info',
  icon,
  timestamp,
  skeleton = false,
  className,
  children,
  ...rest
}: SystemMessageProps) {
  if (skeleton) {
    return (
      <div className={cx(styles.row, className)} aria-hidden="true">
        <Skeleton variant="text" width="16ch" />
      </div>
    );
  }

  const Glyph = ICON[systemMessageGlyph(kind)];
  const glyph = icon === undefined ? <Glyph size={ICON_SIZE} strokeWidth={1.75} /> : icon;

  return (
    <div className={cx(styles.row, className)} data-kind={kind} {...rest}>
      {glyph != null && (
        <span className={styles.icon} aria-hidden="true">
          {glyph}
        </span>
      )}
      <span className={styles.text}>{children}</span>
      {/* Inline, not pinned to an edge: a time pushed to the trailing edge of a
          centred line looks like a column that has lost its table. */}
      {timestamp != null && <span className={styles.timestamp}>{timestamp}</span>}
    </div>
  );
}
