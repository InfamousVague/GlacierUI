// The Glacier TypingIndicator, rendered with React Native primitives: three
// dots and a line naming who is typing. Which sentence applies comes from
// `typingText` in @glacier/logic — the same function the DOM kit calls — and
// every colour and measurement is read from the typing-indicator spec through
// the shared resolvers, so neither the wording nor the geometry can drift.

import { View, type ViewProps } from 'react-native';
import { formatTyping, type TypingState, type TypingTemplates } from '@glacier/logic';
import { typingText } from '@glacier/logic';
import {
  TYPING_DOTS,
  typingDotDelays,
  useTypingAnnouncement,
  type TypingAnnounce,
} from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once typing-indicator.ts is registered.
import { typingIndicatorSpec } from '../../../../spec/src/components/typing-indicator.ts';
import { t } from '../../tokens.ts';
import { paintFor, sizeFor, dimensionsFor } from '../../resolve.ts';
import { Text } from '../../atoms/display/Text.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton.tsx';

export type { TypingAnnounce };

export type TypingIndicatorSize = 'sm' | 'md';

/**
 * The English fallbacks. There is no LocaleProvider on the native side, so a
 * caller translates by passing `templates` — the same four shapes the DOM kit's
 * catalog fills.
 */
const DEFAULT_TEMPLATES: TypingTemplates = {
  one: '{first} is typing',
  two: '{first} and {last} are typing',
  several: '{names} are typing',
  many: '{first} and {count} others are typing',
};

export interface TypingIndicatorProps extends Omit<ViewProps, 'children' | 'style'> {
  /** Who is typing, in the order they should be listed. Blank names are dropped. */
  names?: string[];
  /** How many names the row has room for; on overflow one slot goes to "and N others". */
  max?: number;
  /** Overrides the sentence entirely. */
  label?: string;
  /** When the row speaks to assistive tech. */
  announce?: TypingAnnounce;
  size?: TypingIndicatorSize;
  /** Drops the label and shows only the dots. */
  dotsOnly?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Overrides the sentence templates; merged over the English fallbacks. */
  templates?: Partial<TypingTemplates>;
}

// Size-independent metrics (dot gap, radius) read once from the spec.
const BOX = dimensionsFor(typingIndicatorSpec);
const DELAYS = typingDotDelays(TYPING_DOTS);

/**
 * The typing row, native side.
 *
 * Two things carry over from the DOM binding unchanged, because both are
 * decisions rather than pixels. The live region announces on the RISING EDGE
 * only — typing flips on and off every few seconds, and a region wired straight
 * to it narrates the same name for the length of a conversation — and the dots
 * are hidden from assistive tech, since the sentence says everything they do.
 *
 * The dots are drawn at rest here. There is no animation runtime in this package
 * (the same position Skeleton and PresenceDot take), so the wave is a device
 * follow-up; the row is already legible without it, which is exactly why the
 * web binding is free to drop it under reduced motion.
 */
export function TypingIndicator({
  names = [],
  max = 2,
  label,
  announce = 'start',
  size = 'md',
  dotsOnly = false,
  skeleton = false,
  templates,
  ...rest
}: TypingIndicatorProps) {
  const dims = sizeFor(typingIndicatorSpec, size);
  const paint = paintFor(typingIndicatorSpec, 'states', 'typing');

  const state: TypingState = typingText(names, max);
  const sentence = label ?? formatTyping(state, { ...DEFAULT_TEMPLATES, ...templates });
  const active = state.key !== 'none';
  const announcement = useTypingAnnouncement(sentence, active, announce);

  if (skeleton) {
    return <Skeleton variant="text" width="9ch" aria-hidden={true} {...rest} />;
  }

  const diameter = t(dims.diameter ?? 'size-xs');

  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', gap: t(dims.gap ?? 'space-2'), minWidth: 0 }}
      {...rest}
    >
      {/* Decoration: the sentence beside them says everything they do. */}
      <View
        aria-hidden={true}
        style={{ flexDirection: 'row', alignItems: 'center', gap: t(BOX.dotGap ?? 'space-1') }}
      >
        {DELAYS.map((step) => (
          <View
            key={step}
            style={{
              width: diameter,
              height: diameter,
              borderRadius: t(BOX.radius ?? 'radius-full'),
              backgroundColor: t(paint.dot ?? 'text-subtle'),
            }}
          />
        ))}
      </View>
      {!dotsOnly && active && (
        <Text size={size === 'sm' ? 'xs' : 'sm'} tone="muted" numberOfLines={1}>
          {sentence}
        </Text>
      )}
      {/*
        The one live region, held apart from the visible text so what is
        ANNOUNCED and what is SHOWN can differ: the label follows every change,
        the region speaks once. It carries no visible glyphs, so it costs no
        layout.
      */}
      <View accessibilityRole="text" aria-live="polite" style={{ width: 0, height: 0, overflow: 'hidden' }}>
        {announcement !== '' && <Text size="xs">{announcement}</Text>}
      </View>
    </View>
  );
}
