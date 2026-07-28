// The Glacier SystemMessage, rendered with React Native primitives: the
// transcript narrating itself. The kind-to-glyph table comes from
// @glacier/logic and every measurement from the system-message spec through
// the shared resolvers, so a join notice is the same quiet line on both
// platforms.

import { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import {
  systemMessageGlyph,
  type SystemGlyph,
  type SystemMessageKind,
} from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once system-message.ts is registered.
import { systemMessageSpec } from '../../../../spec/src/components/system-message.ts';
import { Info, Pencil, PhoneOff, UserMinus, UserPlus } from '@glacier/icons';
import { t } from '../../tokens.ts';
import { dimensionsFor } from '../../resolve.ts';
import { Text } from '../../atoms/display/Text.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton.tsx';

export type { SystemMessageKind };

const ICON: Record<SystemGlyph, typeof Info> = {
  info: Info,
  'user-plus': UserPlus,
  'user-minus': UserMinus,
  pencil: Pencil,
  'phone-off': PhoneOff,
};

export interface SystemMessageProps extends Omit<ViewProps, 'children' | 'style'> {
  /** What the line reports; chooses the default glyph. */
  kind?: SystemMessageKind;
  /** Overrides the kind's glyph. Pass null to drop it. */
  icon?: ReactNode;
  /** When it happened, appended after the text. */
  timestamp?: ReactNode;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  children?: ReactNode;
}

// Size-independent metrics (gap, padding, max width) read once from the spec.
const BOX = dimensionsFor(systemMessageSpec);
// The line's colour: the spec's top-level rest paint, as a bare token name.
const TEXT = (systemMessageSpec.paint?.text ?? '$text-subtle').replace(/^\$/, '');

/**
 * Centred, narrow, and quiet — the three things that make a line read as chrome
 * rather than as somebody speaking. The width cap is the load-bearing one: a
 * notice that spans the full transcript has the same footprint as a message, and
 * the eye stops filing it as furniture.
 *
 * No role and no live region, exactly as on the web. The line already sits in
 * the transcript at the point it happened; announcing it out of band would read
 * it twice, and marking it as a separator would make a screen reader say
 * "separator" and skip the sentence that is the whole content.
 */
export function SystemMessage({
  kind = 'info',
  icon,
  timestamp,
  skeleton = false,
  children,
  ...rest
}: SystemMessageProps) {
  const colour = t(TEXT);

  if (skeleton) {
    return (
      <View aria-hidden={true} style={{ alignItems: 'center' }} {...rest}>
        <Skeleton variant="text" width="16ch" />
      </View>
    );
  }

  const Glyph = ICON[systemMessageGlyph(kind)];
  const glyph =
    icon === undefined ? <Glyph size={t('size-sm')} color={colour} strokeWidth={1.75} /> : icon;

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: t(BOX.gap ?? 'space-2'),
        maxWidth: t(BOX.maxWidth ?? 'container-sm'),
        marginHorizontal: 'auto',
        paddingVertical: t(BOX.paddingBlock ?? 'space-2'),
        paddingHorizontal: t(BOX.paddingInline ?? 'space-4'),
      }}
      {...rest}
    >
      {/* The sentence already names the event; a glyph that repeats it turns
          "Ana joined" into "user plus Ana joined". */}
      {glyph != null && <View aria-hidden={true}>{glyph}</View>}
      <Text size="xs" tone="subtle" align="center">
        {children}
      </Text>
      {/* Inline, not pinned to an edge: a time pushed to the trailing edge of a
          centred line looks like a column that has lost its table. */}
      {timestamp != null && (
        <Text size="xs" tone="subtle" mono>
          {timestamp}
        </Text>
      )}
    </View>
  );
}
