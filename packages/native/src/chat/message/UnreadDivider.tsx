/**
 * @glacier/native — UnreadDivider.
 *
 * The React Native binding of @glacier/react's UnreadDivider: the accent-tinted
 * "new messages" rule marking where the reader left off. Paint (the
 * `accent-border` rule, the `accent-text` label, the `accent-soft` tally chip)
 * and geometry (the `space-3` gap, the hairline thickness, `radius-full` on the
 * chip) come from the unread-divider spec through the shared resolvers, and the
 * English fallback strings come from @glacier/logic, so neither the pixels nor
 * the words can drift from the DOM kit.
 *
 * Web-parity notes:
 * - Nothing about this component is sticky on either platform, so there is no
 *   divergence to declare — which is the point. A day row pins because it
 *   answers a question about the viewport; this one answers a question about the
 *   transcript, and both bindings refuse the option for the same reason.
 * - `letter-spacing` maps to `letterSpacing`, but RN takes a number of points
 *   rather than an em-relative token, so the `tracking-xs` token is passed
 *   through `t()` for the react-native-web docs pane and is a device follow-up.
 * - `role="separator"` has no RN counterpart; the row is exposed as a labelled
 *   element, with the count folded into the label exactly as on the web.
 */

import { View, Text } from 'react-native';
import {
  defaultTranscriptLabels,
  formatTranscriptLabel,
  type TranscriptLabels,
} from '@glacier/logic';
import {
  unreadDividerSpec,
  // TODO(integration): switch to '@glacier/spec' once unread-divider.ts is
  // registered in packages/spec/src/index.ts.
} from '../../../../spec/src/components/unread-divider.ts';
import { t } from '../../tokens.ts';
import { paintFor, dimensionsFor } from '../../resolve.ts';

/** Where the label sits on the rule. */
export type UnreadDividerAlign = 'start' | 'center' | 'end';

const DIMS = dimensionsFor(unreadDividerSpec);
// The rest paint is top-level: this row has no variant axis, on purpose.
const RULE = (unreadDividerSpec.paint?.border ?? '$accent-border').replace(/^\$/, '');
const LABEL = (unreadDividerSpec.paint?.text ?? '$accent-text').replace(/^\$/, '');
const COUNTED = paintFor(unreadDividerSpec, 'states', 'counted');

export interface UnreadDividerProps {
  /** The phrase on the rule. Defaults to the shared "New messages" string. */
  label?: string;
  /** How many messages are unread from here down. Shown when greater than zero. */
  count?: number;
  /** Translated strings, merged over the shared English defaults. */
  labels?: Partial<TranscriptLabels>;
  /** Centre reads as a boundary; start reads as a heading for what follows. */
  align?: UnreadDividerAlign;
}

/** The "new messages" rule, rendered with React Native primitives. */
export function UnreadDivider({ label, count = 0, labels, align = 'center' }: UnreadDividerProps) {
  const text = { ...defaultTranscriptLabels, ...labels };
  const phrase = label ?? text.newMessages;
  const showCount = count > 0;
  const name = showCount ? formatTranscriptLabel(text.newMessageCount, { count }) : phrase;

  const rule = (
    <View
      style={{
        flex: 1,
        height: t(DIMS.thickness ?? 'hairline'),
        backgroundColor: t(RULE),
      }}
    />
  );

  return (
    <View
      aria-label={name}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t(DIMS.gap ?? 'space-3'),
        paddingVertical: t(DIMS.paddingBlock ?? 'space-2'),
      }}
    >
      {align !== 'start' && rule}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t('space-2') }}>
        <Text
          style={{
            fontSize: t('font-size-xs'),
            fontWeight: t('font-weight-semibold'),
            letterSpacing: t('tracking-xs'),
            color: t(LABEL),
          }}
        >
          {phrase}
        </Text>
        {showCount && (
          <Text
            style={{
              paddingHorizontal: t('space-2'),
              borderRadius: t('radius-full'),
              backgroundColor: t(COUNTED.badge ?? 'accent-soft'),
              color: t(COUNTED.badgeText ?? 'accent-text'),
              fontSize: t('font-size-xs'),
              fontVariant: ['tabular-nums'],
            }}
          >
            {count}
          </Text>
        )}
      </View>
      {align !== 'end' && rule}
    </View>
  );
}
