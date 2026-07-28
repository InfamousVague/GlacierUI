// The Glacier QuotedMessage, rendered with React Native primitives: the reply
// context block. The snippet is cut by the SAME `quotedSnippet` the DOM kit
// calls, so a quote ends on the same word on both platforms, and every colour
// and measurement is read from the quoted-message spec through the shared
// resolvers.

import { type ReactNode } from 'react';
import { Pressable, Text as RNText, View, type ViewProps } from 'react-native';
import { QUOTED_SNIPPET_LINES, quotedSnippet } from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once quoted-message.ts is registered.
import { quotedMessageSpec, quotedMessageTones } from '../../../../spec/src/components/quoted-message.ts';
import { press } from '@glacier/logic';
import { t } from '../../tokens.ts';
import { paintFor, dimensionsFor } from '../../resolve.ts';
import { Text } from '../../atoms/display/Text.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton.tsx';

// Derived from the spec so the tone union cannot drift from the web kit.
export type QuotedMessageTone = (typeof quotedMessageTones)[number];

export interface QuotedMessageProps extends Omit<ViewProps, 'children' | 'style'> {
  /** Who is being quoted. */
  author: string;
  /** What they said; truncated by the shared quoted-snippet rule. */
  text?: string;
  /** Stands in for a quote with no text — "Photo", "Voice message". */
  placeholder?: string;
  /** A thumbnail of the quoted attachment, on the trailing edge. */
  preview?: ReactNode;
  /** Which family the rule and author line paint. */
  tone?: QuotedMessageTone;
  /** Jumps to the original. Omit it and the block renders inert. */
  onPress?: () => void;
  /** Overrides the accessible name of the jump target. */
  label?: string;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
}

// Size-independent box metrics (gap, padding, radius, rule) read once.
const BOX = dimensionsFor(quotedMessageSpec);

/**
 * The reply-context block.
 *
 * The snippet is cut in the STRING rather than only by the text layer, which is
 * what keeps the two platforms honest: `numberOfLines` clips whatever it is
 * handed, so a native quote left untruncated would still read out in full to a
 * screen reader while the web one had been trimmed. Both are cut first, then
 * clamped to the shared line count.
 *
 * Pressability is all-or-nothing, exactly as on the web: with a handler it is a
 * real button named for where it goes, without one it is an inert box with no
 * focus stop — because a target in a transcript that does nothing when activated
 * is worse than no affordance at all.
 */
export function QuotedMessage({
  author,
  text,
  placeholder,
  preview,
  tone = 'accent',
  onPress,
  label,
  skeleton = false,
  ...rest
}: QuotedMessageProps) {
  const paint = paintFor(quotedMessageSpec, 'variants', tone);
  const snippet = quotedSnippet(text);
  const body = snippet !== '' ? snippet : placeholder;

  const box = {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: t(BOX.gap ?? 'space-2'),
    width: '100%' as const,
    paddingVertical: t(BOX.paddingBlock ?? 'space-2'),
    paddingHorizontal: t(BOX.paddingInline ?? 'space-3'),
    borderRadius: t(BOX.radius ?? 'radius-md'),
    backgroundColor: t(paint.background ?? 'accent-soft'),
    // The rule marks where the quoted text begins, so it is a logical
    // inline-start border and moves with the writing direction.
    borderStartWidth: BOX.rule ?? '0.1875rem',
    borderStyle: 'solid' as const,
    borderStartColor: t(paint.border ?? 'accent-solid'),
  };

  if (skeleton) {
    return (
      <View aria-hidden={true} style={box} {...rest}>
        <View style={{ flex: 1, gap: t('space-1') }}>
          <Skeleton variant="text" width="6ch" />
          <Skeleton variant="text" width="80%" />
        </View>
      </View>
    );
  }

  const content = (
    <>
      <View style={{ flex: 1, minWidth: 0, gap: t('space-1') }}>
        {/* The kit Text owns its own tone scale and has no slot for a variant's
            colour, so the author line is a raw <Text> painted from the spec —
            the same route Banner takes for its tone-coloured message. */}
        <RNText
          numberOfLines={1}
          style={{
            color: t(paint.author ?? 'accent-text'),
            fontSize: t('font-size-xs'),
            fontWeight: t('font-weight-semibold') as never,
            fontFamily: t('font-sans'),
          }}
        >
          {author}
        </RNText>
        {body != null && body !== '' && (
          <Text size="sm" tone="muted" numberOfLines={QUOTED_SNIPPET_LINES}>
            {body}
          </Text>
        )}
      </View>
      {/* Trailing, so a thumbnail can never push the author line off the row. */}
      {preview != null && <View aria-hidden={true}>{preview}</View>}
    </>
  );

  if (!onPress) {
    return (
      <View style={box} {...rest}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      // The name says whose message and where it goes; "button" is not a choice
      // anyone can make.
      accessibilityLabel={label ?? `Reply to ${author}: ${snippet}. Go to the original message`}
      onPress={onPress}
      style={({ pressed }) => [box, { transform: [{ scale: pressed ? press.compact : 1 }] }]}
      {...rest}
    >
      {content}
    </Pressable>
  );
}
