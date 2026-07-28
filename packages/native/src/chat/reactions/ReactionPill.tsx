/**
 * @glacier/native — ReactionPill.
 *
 * The React Native binding of @glacier/react's ReactionPill: one emoji, its
 * tally, and whether the viewer is in it. Paint (the outlined rest capsule, the
 * accent-soft "you reacted" fill, the quiet in-flight tokens) and geometry (the
 * radius-full capsule, per-size height and inline padding, the space-1 gap
 * between glyph and count) are read from the reaction-pill spec through the
 * shared resolvers, so it cannot drift from the web kit.
 *
 * Web-parity notes (resting visuals only):
 * - **Hover does not exist here.** The web's `hover` and `reacted-hover` states
 *   have no equivalent on a touch screen and are not painted; the press dip
 *   (`press.compact`, the shared scale) is the whole of the feedback.
 * - The focus ring is likewise web-only: React Native has no `:focus-visible`.
 * - **This does not compose the native FilterChip, and the web one does.** Not a
 *   drift — a constraint. React Native forbids a `<View>` inside a `<Text>`, so
 *   the DOM binding's trick of passing glyph and count as ONE child (keeping the
 *   chip's own gap from opening between them) has no equivalent here: the glyph
 *   would have to go in FilterChip's icon slot, which would open that chip's
 *   `space-2` gap where the web opens `space-1`. Reading the same spec through
 *   the same resolvers instead keeps every measurement identical, which is what
 *   parity actually means.
 * - `title` (the web's actor list on hover) has no hover to hang off; the actor
 *   names ride on the accessibility hint instead.
 */
import { View, Text, Pressable, type PressableProps } from 'react-native';
import { press } from '@glacier/logic';
import {
  formatReactionLabel,
  reactionIntent,
  reactionLabelState,
  defaultReactionLabels,
  type ReactionIntent,
  type ReactionLabelKey,
} from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once reaction-pill.ts is
// registered in packages/spec/src/index.ts.
import { reactionPillSpec } from '../../../../spec/src/components/reaction-pill.ts';
import { t } from '../../tokens.ts';
import { paintFor, sizeFor, dimensionsFor } from '../../resolve.ts';

export type ReactionPillSize = 'sm' | 'md';

export interface ReactionPillProps extends Omit<PressableProps, 'style' | 'children' | 'onPress'> {
  emoji: string;
  count: number;
  reactedByViewer?: boolean;
  pending?: boolean;
  actors?: readonly string[];
  label?: string;
  labels?: Partial<Record<ReactionLabelKey, string>>;
  size?: ReactionPillSize;
  onToggle?: (emoji: string, intent: ReactionIntent) => void;
  disabled?: boolean;
}

// Size-independent box metrics (radius, gap, border) read once from the spec.
const BOX = dimensionsFor(reactionPillSpec);

// The rest capsule paints from the spec's base paint; strip the leading `$`
// exactly as the shared resolvers do so it cannot drift from the web kit.
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);
const BASE = (reactionPillSpec.paint ?? {}) as { text?: string; border?: string };

const REACTED = paintFor(reactionPillSpec, 'states', 'reacted');
const PENDING = paintFor(reactionPillSpec, 'states', 'pending');

/**
 * A resolved measurement. The resolvers return bare token names alongside raw
 * CSS lengths (the pill's `height: 1.75rem` is declared inline, not as a token);
 * token names get wrapped in the custom property, and anything starting with a
 * digit or dot passes straight through so it never becomes `var(--glacier-1.75rem)`.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

/** How far the glyph dims while a toggle is in flight; mirrors the web `.emoji` rule. */
const PENDING_GLYPH_OPACITY = 0.55;

export function ReactionPill({
  emoji,
  count,
  reactedByViewer = false,
  pending = false,
  actors,
  label,
  labels,
  size = 'md',
  onToggle,
  disabled = false,
  ...rest
}: ReactionPillProps) {
  const dims = sizeFor(reactionPillSpec, size);
  const summary = { emoji, count, reactedByViewer, actors: [] };
  const intent = reactionIntent(summary);

  const templates: Record<ReactionLabelKey, string> = {
    one: labels?.one ?? defaultReactionLabels.one,
    other: labels?.other ?? defaultReactionLabels.other,
    oneByViewer: labels?.oneByViewer ?? defaultReactionLabels.oneByViewer,
    otherByViewer: labels?.otherByViewer ?? defaultReactionLabels.otherByViewer,
  };
  const name = label ?? formatReactionLabel(reactionLabelState(summary), templates);

  // Rest, reacted, and in-flight paint, every colour read from the spec.
  const color = reactedByViewer
    ? t(REACTED.text ?? 'accent-text')
    : pending
      ? t(PENDING.text ?? 'text-subtle')
      : t(bare(BASE.text) ?? 'text-muted');
  const borderColor = reactedByViewer
    ? t(REACTED.border ?? 'accent-border')
    : pending
      ? t(PENDING.border ?? 'border-subtle')
      : t(bare(BASE.border) ?? 'border-strong');
  const backgroundColor = reactedByViewer ? t(REACTED.background ?? 'accent-soft') : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      // The name is the whole state, never just the glyph — a button announced
      // as "👍" says nothing about how many agreed or what pressing it does.
      aria-label={name}
      // aria-pressed reports the OPTIMISTIC outcome while a toggle is in flight,
      // so a screen-reader user hears what they asked for rather than the stale
      // truth. The pill is never `disabled` for pending: disabling the control
      // under a finger drops focus and strands a keyboard user mid-row.
      accessibilityState={{ selected: reactedByViewer, disabled }}
      accessibilityHint={actors && actors.length > 0 ? actors.join(', ') : undefined}
      disabled={disabled}
      onPress={() => onToggle?.(emoji, intent)}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          columnGap: metric(BOX.gap, 'space-1'),
          height: metric(dims.height, '1.75rem'),
          paddingHorizontal: metric(dims.paddingInline, 'space-2'),
          borderRadius: metric(BOX.radius, 'radius-full'),
          borderWidth: metric(BOX.border, 'hairline'),
          borderStyle: 'solid',
          borderColor,
          backgroundColor,
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: pressed && !disabled ? press.compact : 1 }],
        },
      ]}
      {...rest}
    >
      <Text
        style={{
          fontSize: metric(dims.fontSize, 'font-size-sm') as never,
          lineHeight: metric(dims.fontSize, 'font-size-sm') as never,
          opacity: pending ? PENDING_GLYPH_OPACITY : 1,
        }}
      >
        {emoji}
      </Text>
      {/* The count lives in its own Text: colour does not inherit through a
          View, and the glyph must not take the label's tint. */}
      <View>
        <Text
          style={{
            color,
            fontSize: metric(dims.fontSize, 'font-size-sm') as never,
            lineHeight: metric(dims.fontSize, 'font-size-sm') as never,
            fontFamily: t('font-sans'),
            fontWeight: t('font-weight-medium') as never,
            fontVariant: ['tabular-nums'],
          }}
        >
          {count}
        </Text>
      </View>
    </Pressable>
  );
}
