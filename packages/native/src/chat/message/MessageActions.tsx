/**
 * @glacier/native — MessageActions.
 *
 * The React Native binding of @glacier/react's MessageActions: the react /
 * reply / thread / more cluster on a message row. The action order and the
 * inline cap come from @glacier/logic, so both bindings fold the same actions
 * into the overflow at the same point. Paint (the surface-raised bar and its
 * border-subtle hairline) and geometry (the radius-lg box, the space-1 padding,
 * the space-0 gap) are read from the message-actions spec through the shared
 * resolvers.
 *
 * Web-parity notes — this is the component where the platforms genuinely differ,
 * so the divergence is the design rather than a shortfall:
 * - **There is no hover on a touch screen, so there is no hidden state.** The
 *   web binding rests at `opacity: 0` with `pointer-events: none` and reveals on
 *   the host's row hover or on `:focus-within`; here the cluster is simply
 *   always visible, which is exactly what the web binding also does under
 *   `@media (hover: none)`. The `reveal` prop is accepted for API parity and
 *   deliberately does nothing: hiding the only path to reply behind an
 *   undiscoverable long-press is the failure this component exists to prevent.
 * - **No tab order, so no roving tabindex.** React Native has no keyboard focus
 *   model to rove; the cluster still reports itself as a labelled toolbar so a
 *   screen reader announces the group before its controls, which is the part of
 *   the web semantics that carries over.
 * - The `menu` layout is the SAME actions as MenuItem rows, for a host
 *   ContextMenu's long-press content — identical to the web, and the reason the
 *   two paths cannot offer different action sets.
 * - The web cluster's `shadow-2` box shadow and its opacity crossfade have no
 *   direct React Native equivalent and are dropped; the raised fill carries the
 *   separation from the bubble underneath.
 */
import { View } from 'react-native';
import {
  orderMessageActions,
  splitMessageActions,
  defaultMessageActionsLabels,
  MESSAGE_ACTION_INLINE_CAP,
  type MessageAction,
  type MessageActionsLabels,
} from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once message-actions.ts is
// registered in packages/spec/src/index.ts.
import {
  messageActionsSpec,
  messageActionLayouts,
  messageActionReveals,
} from '../../../../spec/src/components/message-actions.ts';
import { MoreHorizontal } from '@glacier/icons';
import { type ReactNode } from 'react';
import { t } from '../../tokens.ts';
import { paintFor, dimensionsFor } from '../../resolve.ts';
import { IconButton } from '../../atoms/inputs/IconButton.tsx';
import { Menu, MenuItem } from '../../organisms/Menu.tsx';

export type MessageActionsLayout = (typeof messageActionLayouts)[number];
export type MessageActionsReveal = (typeof messageActionReveals)[number];
export type MessageActionItem = MessageAction<ReactNode>;

export interface MessageActionsProps {
  actions: readonly MessageActionItem[];
  layout?: MessageActionsLayout;
  /** Accepted for API parity and intentionally inert: see the header. */
  reveal?: MessageActionsReveal;
  /** Accepted for API parity and intentionally inert: there is no hover to gate on. */
  visible?: boolean;
  inlineCap?: number;
  size?: 'sm' | 'md';
  labels?: Partial<MessageActionsLabels>;
}

const BOX = dimensionsFor(messageActionsSpec);
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);
const BASE = (messageActionsSpec.paint ?? {}) as { background?: string; border?: string };
const VISIBLE = paintFor(messageActionsSpec, 'states', 'visible');

function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

export function MessageActions({
  actions,
  layout = 'cluster',
  reveal: _reveal,
  visible: _visible,
  inlineCap = MESSAGE_ACTION_INLINE_CAP,
  size = 'sm',
  labels,
}: MessageActionsProps) {
  const strings = { ...defaultMessageActionsLabels, ...labels };

  if (layout === 'menu') {
    // No wrapper: the rows are the Menu panel's direct children, so its own
    // select-to-close behaviour works untouched.
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

  const { inline, overflow } = splitMessageActions(actions, inlineCap);
  if (inline.length === 0 && overflow.length === 0) return null;

  return (
    <View
      accessibilityRole="toolbar"
      aria-label={strings.toolbar}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        columnGap: metric(BOX.gap, 'space-0'),
        padding: metric(BOX.padding, 'space-1'),
        borderRadius: metric(BOX.radius, 'radius-lg'),
        borderWidth: metric(BOX.border, 'hairline'),
        borderStyle: 'solid',
        borderColor: t(VISIBLE.border ?? bare(BASE.border) ?? 'border-subtle'),
        backgroundColor: t(VISIBLE.background ?? bare(BASE.background) ?? 'surface-raised'),
      }}
    >
      {inline.map((action) => (
        <IconButton
          key={action.id}
          variant="ghost"
          size={size}
          aria-label={action.label}
          disabled={action.disabled}
          onPress={() => action.onSelect?.()}
        >
          {action.icon}
        </IconButton>
      ))}
      {overflow.length > 0 && (
        <Menu
          aria-label={strings.more}
          trigger={
            <IconButton variant="ghost" size={size} aria-label={strings.more}>
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
    </View>
  );
}
