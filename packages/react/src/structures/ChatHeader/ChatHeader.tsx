// TODO(integration): switch to '@glacier/spec' once chat-header.ts is
// registered in packages/spec/src/index.ts.
import { chatHeaderDensities } from '../../../../spec/src/components/chat-header.ts';
import { ArrowLeft } from '@glacier/icons';
import { motion, useReducedMotion } from 'motion/react';
import { pressTap } from '@glacier/motion';
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../i18n/messages.ts';
import { IconButton } from '../../atoms/inputs/Button/IconButton.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import styles from './ChatHeader.module.css';

// Derived from the spec so the density union cannot drift.
export type ChatHeaderDensity = (typeof chatHeaderDensities)[number];

/** The heading element per level, as a table rather than a built tag string. */
const HEADING_TAG = { 1: 'h1', 2: 'h2', 3: 'h3' } as const;

export interface ChatHeaderProps extends Omit<ComponentProps<'header'>, 'title'> {
  /** Who or what the conversation is with. Rendered as the surface's heading. */
  title: ReactNode;
  /** A second line: presence, member count, or a TypingIndicator. */
  subtitle?: ReactNode;
  /** Leading avatar slot — an Avatar for a person, an AvatarGroup for a group. */
  avatar?: ReactNode;
  /** Trailing actions, typically call buttons. */
  actions?: ReactNode;
  /** Renders a leading back control; omit it and none is drawn. */
  onBack?: () => void;
  /** The back control's accessible name; defaults to the kit's translated "Back". */
  backLabel?: string;
  /** Opens the conversation details, turning the avatar and title into one target. */
  onTitlePress?: () => void;
  /** The heading element for the title. */
  headingLevel?: 1 | 2 | 3;
  /** How tightly the bar is packed. */
  density?: ChatHeaderDensity;
  /** The bottom hairline separating the bar from the transcript. */
  border?: boolean;
  /** Renders a placeholder with the bar's exact geometry. */
  skeleton?: boolean;
}

/**
 * The bar above a conversation: an avatar, who you are talking to, a presence
 * line under it, and the trailing actions.
 *
 * **Why this is not a PageHeader.** PageHeader is a page masthead — a 2xl title
 * that wraps, generous block padding, and an actions group that drops BELOW the
 * title on narrow widths. All three are wrong here. A conversation name is long
 * and arbitrary, so the title has to truncate on one line rather than growing
 * the bar; the call buttons have to stay on the trailing edge at every width,
 * because a header that reflows pushes the transcript down mid-scroll; and the
 * leading avatar has nowhere to live in PageHeader except inside the title,
 * which would fold a photograph into the heading's accessible name. The two are
 * siblings, sharing a type ramp and an actions gap, not a preset of one another.
 *
 * The title is a real heading (h2 by default, since a chat pane usually sits
 * inside a page that already owns the h1), so a screen reader can jump straight
 * to it and knows what the transcript below belongs to. The avatar is decorative
 * — the name beside it already says who this is.
 *
 * With `onTitlePress` the button goes INSIDE the heading rather than around the
 * identity block. A heading is flow content and a button may only contain
 * phrasing content, so wrapping the whole block would be invalid markup, and —
 * more to the point — it would swallow the heading a screen reader user
 * navigates by. `h2 > button` keeps the landmark, gives one tab stop, and names
 * it with the conversation name.
 *
 * The subtitle is deliberately plain text and never a live region: presence and
 * typing both change constantly, above a transcript that is already announcing
 * messages.
 */
export function ChatHeader({
  title,
  subtitle,
  avatar,
  actions,
  onBack,
  backLabel,
  onTitlePress,
  headingLevel = 2,
  density = 'comfortable',
  border = true,
  skeleton = false,
  className,
  ...rest
}: ChatHeaderProps) {
  const t = useT();
  const reduce = useReducedMotion();
  const Heading = HEADING_TAG[headingLevel];

  if (skeleton) {
    // The same element, height, and regions as the live bar, so nothing shifts
    // when the conversation loads. Decorative, hence aria-hidden.
    return (
      <header
        aria-hidden="true"
        className={cx(styles.header, className)}
        data-density={density}
        data-border={border || undefined}
      >
        <div className={styles.identity}>
          <Skeleton variant="circle" width="2.25rem" />
          <div className={styles.titleBlock}>
            <Skeleton variant="text" width="10ch" />
            <Skeleton variant="text" width="7ch" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={cx(styles.header, className)}
      data-density={density}
      data-border={border || undefined}
      {...rest}
    >
      {onBack && (
        <IconButton
          variant="ghost"
          className={styles.back}
          aria-label={backLabel ?? t(kitMessages.back)}
          onClick={onBack}
        >
          <ArrowLeft size={18} />
        </IconButton>
      )}
      <div className={styles.identity}>
        {/* Decorative: the title beside it already names the conversation, and
            an image with the same alt text makes every jump to the heading read
            the name twice. */}
        {avatar != null && (
          <span className={styles.avatar} aria-hidden="true">
            {avatar}
          </span>
        )}
        <span className={styles.titleBlock}>
          <Heading className={styles.title}>
            {onTitlePress ? (
              <motion.button
                type="button"
                className={styles.titleButton}
                whileTap={pressTap('compact', reduce ?? false)}
                onClick={onTitlePress}
              >
                {title}
              </motion.button>
            ) : (
              title
            )}
          </Heading>
          {subtitle != null && <span className={styles.subtitle}>{subtitle}</span>}
        </span>
      </div>
      {actions != null && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
