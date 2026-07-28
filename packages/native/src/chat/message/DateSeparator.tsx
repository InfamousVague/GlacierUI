/**
 * @glacier/native — DateSeparator.
 *
 * The React Native binding of @glacier/react's DateSeparator: a quiet label
 * naming a day, either centred on a hairline rule or floating as a chip. Paint
 * (the muted label, the `border` rule, the chip's `surface-raised` fill and
 * `border-subtle` hairline) and geometry (the `space-3` gap, the chip's
 * `space-3`/`space-1` padding and `radius-full`) are read from the
 * date-separator spec through the shared resolvers, and the label is spelled by
 * @glacier/logic' `transcriptDayLabel` — the same decision function the DOM
 * kit calls — so neither the pixels nor the words can drift.
 *
 * Web-parity notes:
 * - **`sticky` is accepted and does nothing here, and this is the one real
 *   divergence in the transcript suite.** `position: sticky` has no React Native
 *   equivalent at the element level: a view cannot pin itself to an ancestor
 *   scrollport's edge. The closest primitive is `ScrollView`'s
 *   `stickyHeaderIndices`, which is a property of the SCROLL VIEW naming which
 *   of its direct children stick — so the decision cannot live on this
 *   component, and MessageList makes it instead by collecting the indices of the
 *   day rows. The consequences, spelled out rather than papered over:
 *     · the rows must be direct children of the ScrollView, so the native
 *       transcript has no wrapper element between the scroller and its rows,
 *       where the DOM has two;
 *     · `stickyHeaderIndices` pins from the top edge only. CSS sticky's
 *       `bottom`/`inset-inline` axes, and its scoping to the parent's box (a
 *       sticky row stops at the end of its own section), have no counterpart;
 *     · a `FlatList` without `stickyHeaderIndices` support in a given RN version
 *       loses pinning entirely, which is why the chip variant is the default for
 *       a pinned row — a floating pill still reads correctly when it is not
 *       actually floating, whereas a rule that fails to pin leaves a line drawn
 *       through somebody's message.
 *   `sticky` therefore stays in the props for API parity and sets `data-sticky`
 *   for the react-native-web docs pane; on a device it is inert.
 * - The `stuck` state's `shadow-1` is a web box-shadow; RN elevation/shadow
 *   props are a device follow-up, so the chip renders with its fill and hairline
 *   and no shadow.
 * - `role="separator"` + `aria-label` map to `accessibilityRole="none"` plus an
 *   explicit label: RN has no separator role, so the row is exposed as a labelled
 *   element rather than as a semantic divider.
 */

import { View, Text } from 'react-native';
import {
  defaultTranscriptLabels,
  transcriptDayLabel,
  type TranscriptDayLabel,
  type TranscriptLabels,
} from '@glacier/logic';
import {
  dateSeparatorSpec,
  dateSeparatorVariants,
  // TODO(integration): switch to '@glacier/spec' once date-separator.ts is
  // registered in packages/spec/src/index.ts.
} from '../../../../spec/src/components/date-separator.ts';
import { t } from '../../tokens.ts';
import { paintFor, dimensionsFor } from '../../resolve.ts';

// Derived from the spec so the variant union cannot drift from the web kit.
export type DateSeparatorVariant = (typeof dateSeparatorVariants)[number];

// Read once: these are per-component constants, not per-render decisions.
const DIMS = dimensionsFor(dateSeparatorSpec);

export interface DateSeparatorProps {
  /** The spelled day. Supply this, or supply `at` and let the row spell it. */
  label?: string;
  /** The day, epoch millis. Ignored when `label` is given. */
  at?: number;
  /** Instant `at` is read against; injectable so the row renders deterministically. */
  now?: number;
  /** BCP-47 tag for the date formatter. */
  locale?: string;
  /** Translated strings, merged over the shared English defaults. */
  labels?: Partial<TranscriptLabels>;
  /** Rule sits the label on a hairline; chip floats it as a pill. */
  variant?: DateSeparatorVariant;
  /** Accepted for API parity; pinning is decided by MessageList here. See the header. */
  sticky?: boolean;
}

/** Spells a day label; identical rules to the DOM binding, see its comment. */
function spell(day: TranscriptDayLabel, locale: string | undefined, labels: TranscriptLabels): string {
  if (day.kind === 'today') return labels.today;
  if (day.kind === 'yesterday') return labels.yesterday;
  return new Intl.DateTimeFormat(locale, day.format).format(new Date(day.at));
}

/** The day divider in a transcript, rendered with React Native primitives. */
export function DateSeparator({
  label,
  at,
  now,
  locale,
  labels,
  variant = 'rule',
  // Accepted, never read: pinning is the ScrollView's decision here. See header.
  sticky: _sticky = false,
}: DateSeparatorProps) {
  const text = { ...defaultTranscriptLabels, ...labels };
  const spelled = label ?? (at === undefined ? '' : spell(transcriptDayLabel(at, now ?? Date.now()), locale, text));
  const paint = paintFor(dateSeparatorSpec, 'variants', variant);
  const chip = variant === 'chip';

  const rule = (
    <View
      style={{
        flex: 1,
        height: t(DIMS.thickness ?? 'hairline'),
        backgroundColor: t(paint.border ?? 'border'),
      }}
    />
  );

  return (
    <View
      aria-label={spelled}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: chip ? 'center' : 'flex-start',
        gap: t(DIMS.gap ?? 'space-3'),
        paddingVertical: t(DIMS.paddingBlock ?? 'space-2'),
      }}
    >
      {!chip && rule}
      <Text
        style={{
          fontSize: t('font-size-xs'),
          fontWeight: t('font-weight-medium'),
          color: t(paint.text ?? 'text-muted'),
          ...(chip
            ? {
                paddingHorizontal: t(DIMS.chipPaddingInline ?? 'space-3'),
                paddingVertical: t(DIMS.chipPaddingBlock ?? 'space-1'),
                borderRadius: t(DIMS.radius ?? 'radius-full'),
                backgroundColor: t(paint.background ?? 'surface-raised'),
                borderWidth: t(DIMS.thickness ?? 'hairline'),
                borderColor: t(paint.border ?? 'border-subtle'),
                borderStyle: 'solid' as const,
              }
            : null),
        }}
      >
        {spelled}
      </Text>
      {!chip && rule}
    </View>
  );
}
