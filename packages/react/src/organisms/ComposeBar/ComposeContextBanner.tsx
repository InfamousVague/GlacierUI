import type { ComponentProps } from 'react';
import { Forward, Pencil, Reply, X } from '@glacier/icons';
import { Fragment, type ReactNode } from 'react';
// TODO(integration): switch to '@glacier/spec' once the compose specs are registered.
import { composeContextModes } from '../../../../spec/src/components/compose-context-banner.ts';
import { cx } from '../../internal/cx.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { IconButton } from '../../atoms/inputs/Button/IconButton.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import { composeMessages } from './messages.ts';
import styles from './ComposeContextBanner.module.css';

// Derived from the spec so the mode union cannot drift.
export type ComposeContextMode = (typeof composeContextModes)[number];
export { composeContextModes };

export interface ComposeContextBannerProps extends ComponentProps<'div'> {
  /** Which context this is: replying to, editing, or forwarding. */
  mode: ComposeContextMode;
  /** Who the referenced message is from; named in the lead line. */
  author?: ReactNode;
  /** The referenced text, clamped to one line. */
  preview?: ReactNode;
  /** How many messages are being forwarded; only the forward mode reads it. */
  count?: number;
  /** Called when the context is dropped. Required: a context you cannot leave is a trap. */
  onDismiss: () => void;
  skeleton?: boolean;
  className?: string;
}

const GLYPHS = { reply: Reply, edit: Pencil, forward: Forward } as const;

/**
 * A placeholder no message would contain, so the translated sentence can be cut
 * exactly where the author's name goes.
 */
const AUTHOR_SLOT = String.fromCharCode(0x2063);

/**
 * Drops a node into the hole a translated sentence left for it.
 *
 * Concatenating "Replying to " and the name would pin the name to the end,
 * which is wrong in the languages that put it first. Interpolating a marker and
 * splitting on it lets every locale keep its own word order while the name is
 * still a styled node rather than a string.
 */
function splitAround(template: string, node: ReactNode, className: string): ReactNode {
  const [before = '', after = ''] = template.split(AUTHOR_SLOT);
  return (
    <Fragment>
      {before}
      <span className={className}>{node}</span>
      {after}
    </Fragment>
  );
}

/**
 * The strip above a compose bar saying why this message is not a fresh one.
 *
 * ONE component with three modes, not three components. Reply, edit, and
 * forward are the same strip — a glyph, a lead line, one clamped line of quoted
 * context, and a dismiss — and they differ only in the glyph, the tint, and the
 * words. Three components would be three chances for the thing sitting directly
 * above the input to be a different height in each, which the user sees as the
 * composer twitching every time they switch tasks.
 *
 * The dismiss names its mode. "Close" does not say what is about to be lost,
 * and in edit mode what is lost is the rewrite, not just the context.
 */
export function ComposeContextBanner({
  mode,
  author,
  preview,
  count,
  onDismiss,
  skeleton = false,
  className,
  ...rest
}: ComposeContextBannerProps) {
  const t = useT();
  const Glyph = GLYPHS[mode];

  if (skeleton) {
    return (
      <div className={cx(styles.banner, className)} data-mode={mode} data-skeleton="">
        <Skeleton width="60%" height="var(--glacier-space-8)" radius="var(--glacier-radius-md)" />
      </div>
    );
  }

  const lead: ReactNode = (() => {
    if (mode === 'edit') return t(composeMessages.editing);
    if (mode === 'forward')
      return count !== undefined && count > 1
        ? t(composeMessages.forwarding, { count })
        : t(composeMessages.forwardingOne);
    // A reply with no known author still has to say what it is doing.
    if (author == null) return t(composeMessages.replying);
    return splitAround(t(composeMessages.replyingTo, { author: AUTHOR_SLOT }), author, styles.author ?? '');
  })();

  const dismissLabel = t(
    mode === 'edit'
      ? composeMessages.cancelEdit
      : mode === 'forward'
        ? composeMessages.cancelForward
        : composeMessages.cancelReply,
  );

  return (
    // A status region: it appears while the user is typing, so it must be
    // announced — but politely, without interrupting the keystroke.
    <div role="status" className={cx(styles.banner, className)} data-mode={mode} {...rest}>
      <span className={styles.icon} aria-hidden="true">
        <Glyph size={14} />
      </span>
      <span className={styles.body}>
        <span className={styles.lead}>{lead}</span>
        {preview != null && <span className={styles.preview}>{preview}</span>}
      </span>
      <IconButton size="sm" variant="ghost" aria-label={dismissLabel} onClick={onDismiss}>
        <X size={14} />
      </IconButton>
    </div>
  );
}
