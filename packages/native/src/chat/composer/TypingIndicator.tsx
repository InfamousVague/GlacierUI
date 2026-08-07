// The Glacier TypingIndicator, rendered with React Native primitives: the row
// that says who is typing. The count chooses a template in @glacier/logic - the
// same function the DOM kit calls - and the caller supplies the words, because
// "Ana and Bo are typing" is three translation problems at once and a naive join
// survives none of them.

import { View, Text as RNText } from 'react-native';
import {
  defaultTypingTemplates,
  formatTyping,
  typingText,
  type TypingTemplates,
} from '@glacier/logic';
import { textSpec, typingIndicatorSpec } from '@glacier/spec';
import { t } from '../../tokens.ts';
import { dimensionsFor, paintFor, sizeFor } from '../../resolve.ts';
import { Skeleton } from '../../atoms/feedback/Skeleton.tsx';

export type { TypingTemplates };

const DIMS = dimensionsFor(typingIndicatorSpec);
const PAINT = paintFor(typingIndicatorSpec, 'states', 'default');

export interface TypingIndicatorProps {
  /** Who is typing, as display names. Blank names are dropped. */
  names: string[];
  /** How many names the row has room for. */
  max?: number;
  /** Draws the dots beside the sentence. */
  dots?: boolean;
  /** Translated sentences, one per shape, merged over the English defaults. */
  templates?: Partial<TypingTemplates>;
  /**
   * Joins the shown names. Joining a list is locale work, so it is a hook
   * rather than a hardcoded comma; the DOM binding passes `Intl.ListFormat`.
   */
  join?: (names: string[]) => string;
  skeleton?: boolean;
}

/**
 * The typing row.
 *
 * Nobody typing renders nothing at all rather than an empty line, matching the
 * DOM binding: a row that reserved its height would make the composer jump by a
 * line every time somebody paused, which is the most distracting thing a typing
 * indicator can do.
 *
 * The web's staggered dot pulse is CSS keyframes with no React Native
 * equivalent; the dots here are the resting frame, which is also the frame the
 * web lands on under reduced motion. The sentence beside them is the content
 * either way.
 */
export function TypingIndicator({
  names,
  max = 2,
  dots = true,
  templates,
  join,
  skeleton = false,
}: TypingIndicatorProps) {
  const xs = sizeFor(textSpec, 'xs');
  const row = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: t(DIMS.gap ?? 'space-2'),
  };

  if (skeleton) {
    return (
      <View style={row}>
        <Skeleton width="12ch" height={t('font-size-xs')} radius={t('radius-sm')} />
      </View>
    );
  }

  const state = typingText(names, max);
  const text = formatTyping(state, { ...defaultTypingTemplates, ...templates }, join);
  if (state.key === 'none' || text === '') return null;

  return (
    <View
      style={row}
      // Polite, never assertive: somebody starting to type is not an
      // interruption, and a busy thread would otherwise talk over the reader.
      accessibilityLiveRegion="polite"
    >
      {dots && (
        // Decoration; the sentence is the whole content.
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{ flexDirection: 'row', alignItems: 'center', gap: t(DIMS.dotGap ?? 'space-1') }}
        >
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={{
                width: DIMS.dotSize ?? '4px',
                height: DIMS.dotSize ?? '4px',
                borderRadius: t('radius-full'),
                backgroundColor: t(PAINT.text ?? 'text-muted'),
                opacity: 0.35,
              }}
            />
          ))}
        </View>
      )}
      <RNText
        style={{
          color: t(PAINT.text ?? 'text-muted'),
          fontFamily: t('font-sans'),
          fontSize: t(xs.fontSize ?? 'font-size-xs'),
          lineHeight: t('leading-xs'),
        }}
      >
        {text}
      </RNText>
    </View>
  );
}
