/**
 * @glacier/native — ScrollToLatest.
 *
 * The React Native binding of @glacier/react's ScrollToLatest: the floating
 * jump-to-latest control on a transcript. Paint (the `surface-raised` fill, the
 * `border` hairline, the `text` glyph) and geometry (the `control-height-md`
 * diameter, `radius-full`, the `size-sm` glyph) are read from the
 * scroll-to-latest spec through the shared resolvers, and the label — including
 * how the unread count is folded into it — comes from @glacier/logic, so the
 * two bindings say the same thing.
 *
 * `visible` is decided by `shouldShowScrollToLatest` in @glacier/logic on both
 * platforms. That is not a detail: when a jump button appears is the difference
 * between a transcript that feels alert and one that feels twitchy, and a phone
 * and a browser that disagreed about it would be two products.
 *
 * Web-parity notes:
 * - Like the web binding it renders nothing while hidden rather than fading out,
 *   so it cannot be reached by a keyboard or an accessibility focus while it is
 *   invisible. There is consequently no exit animation on either platform.
 * - The enter fade/rise and the press dip are framer-motion on the web; here the
 *   resting state is what renders, with Pressable's own press feedback. A
 *   Reanimated entrance is a device follow-up.
 * - `box-shadow` (`shadow-2`, and `shadow-3` on hover) has no RN equivalent as a
 *   layered shadow; the fill and hairline carry the raised look, and hover does
 *   not exist on touch.
 * - The absolute placement over the viewport lives in MessageList on both
 *   platforms, not here.
 */

import { Pressable, View } from 'react-native';
import { ChevronDown } from '@glacier/icons';
import {
  defaultTranscriptLabels,
  formatTranscriptLabel,
  type TranscriptLabels,
} from '@glacier/logic';
import {
  scrollToLatestSpec,
  // TODO(integration): switch to '@glacier/spec' once scroll-to-latest.ts is
  // registered in packages/spec/src/index.ts.
} from '../../../../spec/src/components/scroll-to-latest.ts';
import { t } from '../../tokens.ts';
import { dimensionsFor } from '../../resolve.ts';
import { CounterBadge } from '../../atoms/display/CounterBadge.tsx';

const DIMS = dimensionsFor(scrollToLatestSpec);
const bare = (ref: string | undefined, fallback: string): string => (ref ?? `$${fallback}`).replace(/^\$/, '');
const FILL = bare(scrollToLatestSpec.paint?.background, 'surface-raised');
const GLYPH = bare(scrollToLatestSpec.paint?.text, 'text');
const EDGE = bare(scrollToLatestSpec.paint?.border, 'border');

export interface ScrollToLatestProps {
  /** Called when the control is pressed; the transcript scrolls to the end. */
  onPress?: () => void;
  /** Whether it is on screen. Decided by `shouldShowScrollToLatest`, never here. */
  visible?: boolean;
  /** Unread messages waiting below. Zero renders the button bare. */
  count?: number;
  /** Cap on the badge, past which it reads `${max}+`. */
  max?: number;
  /** Accessible name; the count is folded into it. */
  label?: string;
  /** Translated strings, merged over the shared English defaults. */
  labels?: Partial<TranscriptLabels>;
}

/** The floating jump-to-latest control, rendered with React Native primitives. */
export function ScrollToLatest({
  onPress,
  visible = false,
  count = 0,
  max = 99,
  label,
  labels,
}: ScrollToLatestProps) {
  const text = { ...defaultTranscriptLabels, ...labels };
  if (!visible) return null;

  const name =
    count > 0
      ? `${label ?? text.scrollToLatest}, ${formatTranscriptLabel(text.newMessageCount, { count })}`
      : (label ?? text.scrollToLatest);
  const diameter = t(DIMS.diameter ?? 'control-height-md');

  return (
    <View style={{ position: 'relative' }}>
      <Pressable
        accessibilityRole="button"
        aria-label={name}
        onPress={onPress}
        style={{
          width: diameter,
          height: diameter,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: t(DIMS.radius ?? 'radius-full'),
          backgroundColor: t(FILL),
          borderWidth: t('hairline'),
          borderColor: t(EDGE),
          borderStyle: 'solid',
        }}
      >
        <ChevronDown size={t(DIMS.iconSize ?? 'size-sm')} color={t(GLYPH)} />
      </Pressable>
      {count > 0 && (
        // Decorative: the number is already in the button's name, so announcing
        // it again would say it twice.
        <View
          aria-hidden={true}
          pointerEvents="none"
          style={{ position: 'absolute', top: 0, right: 0, transform: [{ translateX: 6 }, { translateY: -6 }] }}
        >
          <CounterBadge count={count} max={max} size="sm" />
        </View>
      )}
    </View>
  );
}
