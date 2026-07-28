/**
 * @glacier/native — ComposeContextBanner.
 *
 * The React Native binding of @glacier/react's context strip: ONE component
 * with three modes (replying to, editing, forwarding), not three components,
 * for the same reason as on the web — the strip sits directly above the input,
 * and three implementations are three chances for it to be a different height
 * in each. The per-mode paint (accent / warning / info fill and rule) and the
 * geometry (radius, gap, padding, the 3px rule) are read from the
 * compose-context-banner spec through the shared resolvers.
 *
 * Divergences:
 * - The web's `border-inline-start` follows the writing direction on its own;
 *   React Native needs it spelled out, so the rule uses `borderStartWidth`,
 *   which the runtime mirrors under RTL the same way.
 * - There is no `role="status"`. `accessibilityLiveRegion="polite"` is the
 *   Android equivalent and a no-op on iOS, where the strip is announced on
 *   focus instead.
 * - The slide-down entrance is a device follow-up; this is the resting strip.
 */

import { type ComponentType, type ReactNode } from 'react';
import { View, Text as RNText, type ViewProps } from 'react-native';
import { Forward, Pencil, Reply, X } from '@glacier/icons';
// TODO(integration): switch to '@glacier/spec' once the compose specs are registered.
import {
  composeContextBannerSpec,
  composeContextModes,
} from '../../../../spec/src/components/compose-context-banner.ts';
import { t } from '../../tokens.ts';
import { paintFor, dimensionsFor } from '../../resolve.ts';
import { IconButton } from '../../atoms/inputs/IconButton.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton.tsx';

// Derived from the spec so the mode union cannot drift from the web kit.
export type ComposeContextMode = (typeof composeContextModes)[number];

export interface ComposeContextBannerProps extends Omit<ViewProps, 'children' | 'style'> {
  mode: ComposeContextMode;
  author?: string;
  preview?: ReactNode;
  count?: number;
  onDismiss: () => void;
  skeleton?: boolean;
}

const GLYPHS = { reply: Reply, edit: Pencil, forward: Forward } as const;

// The permissive react-native d.ts declares no accessibilityLiveRegion (the
// platform's nearest thing to the web role=status), so the strip is typed
// through a narrow local alias.
const Live = View as unknown as ComponentType<
  ViewProps & { accessibilityLiveRegion?: 'none' | 'polite' | 'assertive' }
>;

// There is no LocaleProvider natively, so these are the English kit strings.
const DISMISS_LABEL = { reply: 'Cancel reply', edit: 'Cancel edit', forward: 'Cancel forward' } as const;

const DIMS = dimensionsFor(composeContextBannerSpec);

function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

export function ComposeContextBanner({
  mode,
  author,
  preview,
  count,
  onDismiss,
  skeleton = false,
  ...rest
}: ComposeContextBannerProps) {
  const Glyph = GLYPHS[mode];
  // The mode's fill and rule, read from the spec's variants.
  const paint = paintFor(composeContextBannerSpec, 'variants', mode);

  const lead = (() => {
    if (mode === 'edit') return 'Editing message';
    if (mode === 'forward')
      return count !== undefined && count > 1 ? `Forwarding ${count} messages` : 'Forwarding a message';
    return author == null ? 'Replying' : `Replying to ${author}`;
  })();

  const box = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: metric(DIMS.gap, 'space-2'),
    paddingVertical: metric(DIMS.paddingBlock, 'space-2'),
    paddingHorizontal: metric(DIMS.paddingInline, 'space-3'),
    borderRadius: metric(DIMS.radius, 'radius-md'),
    // Start, not left: the runtime mirrors it under RTL, matching the web's
    // border-inline-start.
    borderStartWidth: Number.parseFloat(DIMS.rule ?? '3px'),
    borderStartColor: t(paint.border ?? 'accent-solid'),
    backgroundColor: t(paint.background ?? 'accent-soft'),
  };

  if (skeleton) {
    return (
      <View style={box} {...rest}>
        <Skeleton width="60%" height={t('space-8')} radius={metric(DIMS.radius, 'radius-md')} />
      </View>
    );
  }

  return (
    <Live accessibilityLiveRegion="polite" style={box} {...rest}>
      <Glyph size={14} color={t('text-muted')} />
      <View style={{ flex: 1, minWidth: 0, gap: t('space-1') }}>
        <RNText style={{ color: t('text-muted'), fontSize: t('font-size-xs') }}>{lead}</RNText>
        {preview != null && (
          // Quoted context, not a control: one line, clipped, never scrolled.
          <RNText numberOfLines={1} style={{ color: t('text'), fontSize: t('font-size-sm') }}>
            {preview}
          </RNText>
        )}
      </View>
      <IconButton size="sm" variant="ghost" aria-label={DISMISS_LABEL[mode]} onPress={onDismiss}>
        <X size={14} color={t('text-muted')} />
      </IconButton>
    </Live>
  );
}
