import {
  moveGridCursor,
  orderMessageActions,
  splitMessageActions,
  MESSAGE_ACTION_INLINE_CAP,
  type MessageAction,
} from '@glacier/logic';
import { messageActionLayouts, messageActionReveals } from '@glacier/spec';
import { MoreHorizontal } from '@glacier/icons';
import { useEffect, useRef, useState, type ComponentProps, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { resolveDirection } from '../../internal/direction.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { reactionMessages } from '../../i18n/reactionMessages.ts';
import { IconButton } from '../../atoms/inputs/Button/IconButton.tsx';
import { Menu, MenuItem } from '../../organisms/Menu/Menu.tsx';
import styles from './MessageActions.module.css';

export type MessageActionsLayout = (typeof messageActionLayouts)[number];
export type MessageActionsReveal = (typeof messageActionReveals)[number];

/** One offered action. The icon slot is a React node in this binding. */
export type MessageActionItem = MessageAction<ReactNode>;

export interface MessageActionsProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** What this message offers. Data, not children, so both layouts are the same set. */
  actions: readonly MessageActionItem[];
  /** The floating toolbar, or the same actions as menu rows for a host ContextMenu. */
  layout?: MessageActionsLayout;
  /** Whether the cluster rests hidden. Ignored where the pointer is coarse. */
  reveal?: MessageActionsReveal;
  /** Host-driven reveal, from its own row hover or long-press state. Wins over `reveal`. */
  visible?: boolean;
  /** How many actions stay inline before the rest fold into the overflow menu. */
  inlineCap?: number;
  size?: 'sm' | 'md';
  /** Translated strings; merged over the catalog defaults. */
  labels?: Partial<{ toolbar: string; more: string }>;
}

/**
 * The react / reply / thread / more cluster on a message row.
 *
 * ## The hover problem, solved three ways at once
 *
 * A hover-revealed action cluster is the most commonly botched piece of a chat
 * UI, because "reveal on hover" is usually implemented as `display: none` —
 * which does not just hide the actions from a mouseless user, it deletes them.
 * All three input models are handled here, and none of them is a fallback for
 * another:
 *
 * 1. **Pointer.** The cluster rests at `opacity: 0` with `pointer-events: none`
 *    — transparent and click-through, but still rendered, still in the tab
 *    order, still in the accessibility tree. A host that tracks its own row
 *    hover drives `visible`; nothing about the reveal depends on the cluster
 *    itself being hoverable.
 * 2. **Touch.** Under `@media (hover: none)` the cluster is simply always
 *    visible. There is no hover to wait for, and an affordance reachable only
 *    by long-press is invisible until it is discovered by accident. Long-press
 *    is offered IN ADDITION: a host wraps the bubble in a `ContextMenu` whose
 *    content is this same component with `layout="menu"` and the SAME `actions`
 *    array, so the two paths cannot diverge into different action sets.
 * 3. **Keyboard.** The cluster reveals itself on `:focus-within`, so it appears
 *    at the exact moment it becomes operable, and it is one roving-tabindex
 *    `toolbar` rather than one tab stop per action — otherwise a transcript of
 *    fifty messages costs two hundred presses to walk past.
 *
 * The overflow past `inlineCap` folds into a Menu rather than being dropped, so
 * a capped cluster still reaches every action from both a pointer and a
 * keyboard.
 *
 * Placement is the host slot's job. This renders an inline-flex bar and takes no
 * position of its own, so a MessageGroup can pin it to a bubble's trailing
 * corner, float it above the row, or stack it inline without fighting the kit.
 */
export function MessageActions({
  actions,
  layout = 'cluster',
  reveal = 'hover',
  visible,
  inlineCap = MESSAGE_ACTION_INLINE_CAP,
  size = 'sm',
  labels,
  className,
  onKeyDown,
  ...rest
}: MessageActionsProps) {
  const t = useT();
  const clusterRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState(0);

  const strings = {
    toolbar: labels?.toolbar ?? t(reactionMessages.messageActions),
    more: labels?.more ?? t(reactionMessages.messageActionsMore),
  };

  const { inline, overflow } = splitMessageActions(actions, inlineCap);
  const cells = inline.length + (overflow.length > 0 ? 1 : 0);

  // A shrinking cluster must not strand the cursor past its last control.
  useEffect(() => {
    setCursor((c) => (c >= cells ? Math.max(0, cells - 1) : c));
  }, [cells]);

  if (layout === 'menu') {
    // The same ordered set as menu rows, for a host ContextMenu's content. No
    // wrapper element: the rows are the Menu panel's direct children, so its
    // arrow-key roving and select-to-close work untouched.
    return (
      <>
        {orderMessageActions(actions).map((action) => (
          <MenuItem
            key={action.id}
            icon={action.icon}
            danger={action.danger}
            disabled={action.disabled}
            onSelect={action.onSelect}
          >
            {action.label}
          </MenuItem>
        ))}
      </>
    );
  }

  if (cells === 0) return null;

  function onClusterKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const rtl = resolveDirection(clusterRef.current) === 'rtl';
    const next = moveGridCursor(cursor, event, cells, { rtl });
    // Enter, Space, and Tab must fall through untouched or the focused action
    // stops being pressable.
    if (next === cursor && !['Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    setCursor(next);
    clusterRef.current?.querySelectorAll<HTMLElement>('button')[next]?.focus();
  }

  return (
    <div
      ref={clusterRef}
      role="toolbar"
      aria-label={strings.toolbar}
      className={cx(styles.cluster, className)}
      data-reveal={reveal}
      data-visible={visible === undefined ? undefined : String(visible)}
      onKeyDown={onClusterKeyDown}
      {...rest}
    >
      {inline.map((action, index) => (
        <IconButton
          key={action.id}
          variant="ghost"
          size={size}
          aria-label={action.label}
          disabled={action.disabled}
          data-action={action.id}
          tabIndex={index === cursor ? 0 : -1}
          onClick={() => action.onSelect?.()}
        >
          {action.icon}
        </IconButton>
      ))}
      {overflow.length > 0 && (
        <Menu
          aria-label={strings.more}
          trigger={
            <IconButton
              variant="ghost"
              size={size}
              aria-label={strings.more}
              data-action="more"
              tabIndex={inline.length === cursor ? 0 : -1}
            >
              <MoreHorizontal size={16} />
            </IconButton>
          }
        >
          {overflow.map((action) => (
            <MenuItem
              key={action.id}
              icon={action.icon}
              danger={action.danger}
              disabled={action.disabled}
              onSelect={action.onSelect}
            >
              {action.label}
            </MenuItem>
          ))}
        </Menu>
      )}
    </div>
  );
}
