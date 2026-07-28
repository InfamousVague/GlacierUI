// The Glacier ChatHeader, rendered with React Native primitives: the bar above
// a conversation. Every height, gap, and colour is read from the chat-header
// spec through the shared resolvers, so the strip is the same strip the DOM kit
// draws — including the rule that it never wraps.

import { type ReactNode } from 'react';
import { Pressable, Text as RNText, View, type ViewProps } from 'react-native';
import { press } from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once chat-header.ts is registered.
import { chatHeaderDensities, chatHeaderSpec } from '../../../../spec/src/components/chat-header.ts';
import { ArrowLeft } from '@glacier/icons';
import { t } from '../../tokens.ts';
import { dimensionsFor, sizeFor } from '../../resolve.ts';
import { IconButton } from '../../atoms/inputs/IconButton.tsx';
import { Text } from '../../atoms/display/Text.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton.tsx';

// Derived from the spec so the density union cannot drift from the web kit.
export type ChatHeaderDensity = (typeof chatHeaderDensities)[number];

export interface ChatHeaderProps extends Omit<ViewProps, 'children' | 'style'> {
  /** Who or what the conversation is with. */
  title: string;
  /** A second line: presence, member count, or a TypingIndicator. */
  subtitle?: ReactNode;
  /** Leading avatar slot. */
  avatar?: ReactNode;
  /** Trailing actions, typically call buttons. */
  actions?: ReactNode;
  /** Renders a leading back control; omit it and none is drawn. */
  onBack?: () => void;
  /** The back control's accessible name. */
  backLabel?: string;
  /** Opens the conversation details. */
  onTitlePress?: () => void;
  /** The heading level reported to assistive tech. */
  headingLevel?: 1 | 2 | 3;
  /** How tightly the bar is packed. */
  density?: ChatHeaderDensity;
  /** The bottom hairline separating the bar from the transcript. */
  border?: boolean;
  /** Renders a placeholder with the bar's exact geometry. */
  skeleton?: boolean;
}

// Size-independent metrics (border, actions gap, subtitle size) read once.
const BOX = dimensionsFor(chatHeaderSpec);
// The bar's own paint: the spec's top-level rest paint, as bare token names.
const SURFACE = (chatHeaderSpec.paint?.background ?? '$surface').replace(/^\$/, '');
const RULE = (chatHeaderSpec.paint?.border ?? '$border-subtle').replace(/^\$/, '');
const TITLE_COLOR = (chatHeaderSpec.paint?.text ?? '$text').replace(/^\$/, '');

/**
 * A fixed-height strip, not a masthead — the same reasoning as the web binding.
 * A conversation name is long and arbitrary, so the title truncates on one line
 * rather than growing the bar; the trailing actions stay pinned at every width,
 * because a header that reflows pushes the transcript down mid-scroll.
 *
 * The title reports itself as a heading (`accessibilityRole="header"` with a
 * level), which is how a screen reader jumps to it and knows what the transcript
 * below belongs to. The avatar is decorative: the name beside it already says
 * who this is. The subtitle is plain text and never a live region — presence and
 * typing both change constantly, above a transcript that is already announcing
 * messages.
 */
export function ChatHeader({
  title,
  subtitle,
  avatar,
  actions,
  onBack,
  backLabel = 'Back',
  onTitlePress,
  headingLevel = 2,
  density = 'comfortable',
  border = true,
  skeleton = false,
  ...rest
}: ChatHeaderProps) {
  const dims = sizeFor(chatHeaderSpec, density);
  const gap = t(dims.gap ?? 'space-3');

  const bar = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    width: '100%' as const,
    height: t(dims.height ?? 'space-16'),
    paddingHorizontal: t(dims.paddingInline ?? 'space-4'),
    gap,
    backgroundColor: t(SURFACE),
    ...(border
      ? {
          borderBottomWidth: t(BOX.border ?? 'hairline'),
          borderBottomColor: t(RULE),
          borderStyle: 'solid' as const,
        }
      : null),
  };

  if (skeleton) {
    return (
      <View aria-hidden={true} style={bar} {...rest}>
        <Skeleton variant="circle" width="2.25rem" />
        <View style={{ gap: t('space-1') }}>
          <Skeleton variant="text" width="10ch" />
          <Skeleton variant="text" width="7ch" />
        </View>
      </View>
    );
  }

  const heading = (
    <RNText
      accessibilityRole="header"
      aria-level={headingLevel}
      numberOfLines={1}
      style={{
        color: t(TITLE_COLOR),
        fontSize: t(dims.fontSize ?? 'font-size-md'),
        fontWeight: t('font-weight-semibold') as never,
        fontFamily: t('font-sans'),
      }}
    >
      {title}
    </RNText>
  );

  return (
    <View style={bar} {...rest}>
      {onBack && (
        <IconButton variant="ghost" aria-label={backLabel} onPress={onBack}>
          <ArrowLeft size={18} color={t('text')} />
        </IconButton>
      )}
      {/* Takes the row's slack, so the actions stay pinned to the trailing edge. */}
      <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap }}>
        {/* Decorative: the title beside it already names the conversation. */}
        {avatar != null && <View aria-hidden={true}>{avatar}</View>}
        <View style={{ flex: 1, minWidth: 0, justifyContent: 'center' }}>
          {onTitlePress ? (
            // One target, and it IS the heading — so the surface keeps the
            // landmark a screen reader navigates by rather than burying it
            // inside a button that swallows it.
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={title}
              onPress={onTitlePress}
              style={({ pressed }) => [{ transform: [{ scale: pressed ? press.compact : 1 }] }]}
            >
              {heading}
            </Pressable>
          ) : (
            heading
          )}
          {subtitle != null &&
            (typeof subtitle === 'string' ? (
              <Text size="xs" tone="muted" numberOfLines={1}>
                {subtitle}
              </Text>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: t('space-1') }}>
                {subtitle}
              </View>
            ))}
        </View>
      </View>
      {actions != null && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            // Tighter than the bar gap: the actions are one cluster.
            gap: t(BOX.actionsGap ?? 'space-1'),
            flexShrink: 0,
          }}
        >
          {actions}
        </View>
      )}
    </View>
  );
}
