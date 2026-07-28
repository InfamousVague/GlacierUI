/**
 * @glacier/native — SendButton.
 *
 * The React Native binding of @glacier/react's SendButton: the send affordance
 * in four states. Paint (the sunken empty surface, the solid accent ready and
 * sending fills, the danger failed fill) and geometry (the per-size diameter,
 * the full radius) are read from the send-button spec through the shared
 * resolvers, so it stays identical to the web kit and cannot drift.
 *
 * The empty state is the design decision and it carries over unchanged: the
 * control is REFUSED, never hidden. On a device it matters more than on the
 * web, not less — the return key writes a newline here by policy, so this button
 * is the only way to send anything at all.
 *
 * Divergences, all resting-visual:
 * - `accessibilityState.disabled` stands in for the web's `aria-disabled`: it
 *   announces the refusal while leaving the control reachable, which is the same
 *   contract, expressed in the platform's vocabulary.
 * - The spinner does not spin (no animation runtime in this binding); the
 *   in-flight state renders the Spinner at rest, and `accessibilityState.busy`
 *   carries the meaning that the motion would have.
 * - Press feedback and the hover paint are the web's; here the Pressable's own
 *   pressed dip (`press.compact`, via IconButton) is what remains.
 */

import { View } from 'react-native';
import { AlertTriangle, SendHorizontal } from '@glacier/icons';
// TODO(integration): switch to '@glacier/spec' once the compose specs are registered.
import { sendButtonStates, sendButtonSpec } from '../../../../spec/src/components/send-button.ts';
import type { composeBlockReasons } from '../../../../spec/src/components/compose-bar.ts';
import { t } from '../../tokens.ts';
import { paintFor, dimensionsFor } from '../../resolve.ts';
import { IconButton } from '../../atoms/inputs/IconButton.tsx';
import { Spinner } from '../../atoms/feedback/Spinner.tsx';

// Derived from the spec so the unions cannot drift from the web kit.
export type SendButtonState = (typeof sendButtonStates)[number];
export type ComposeBlockReason = (typeof composeBlockReasons)[number];

export interface SendButtonLabels {
  send: string;
  empty: string;
  sending: string;
  failed: string;
}

export interface SendButtonProps {
  state?: SendButtonState;
  /** Why send is refused; it changes the label, never the paint. */
  blockReason?: ComposeBlockReason;
  onSend?: () => void;
  onRetry?: () => void;
  size?: 'sm' | 'md' | 'lg';
  skeleton?: boolean;
  labels?: Partial<SendButtonLabels>;
}

// There is no LocaleProvider natively, so the English kit strings are the
// literals; callers override through `labels`.
const DEFAULT_LABELS: SendButtonLabels & Record<'uploading' | 'overLimit', string> = {
  send: 'Send message',
  empty: 'Send message. Nothing to send yet',
  sending: 'Sending',
  failed: 'Send failed. Try again',
  uploading: 'Send message. Waiting for attachments to finish uploading',
  overLimit: 'Send message. The message is over the character limit',
};

const GLYPH = { sm: 16, md: 18, lg: 20 } as const;
const VARIANT = { empty: 'ghost', ready: 'solid', sending: 'solid', failed: 'danger' } as const;

// Size-independent box metrics (the full radius) read once from the spec.
const BOX = dimensionsFor(sendButtonSpec);

export function SendButton({
  state = 'empty',
  blockReason,
  onSend,
  onRetry,
  size = 'md',
  skeleton = false,
  labels,
}: SendButtonProps) {
  const blocked = state === 'empty' || state === 'sending';
  const label = (() => {
    if (state === 'failed') return labels?.failed ?? DEFAULT_LABELS.failed;
    if (state === 'sending') return labels?.sending ?? DEFAULT_LABELS.sending;
    if (state === 'ready') return labels?.send ?? DEFAULT_LABELS.send;
    if (labels?.empty) return labels.empty;
    if (blockReason === 'uploading') return DEFAULT_LABELS.uploading;
    if (blockReason === 'over-limit') return DEFAULT_LABELS.overLimit;
    return DEFAULT_LABELS.empty;
  })();

  // The empty state's own paint, read from the spec rather than transcribed.
  const emptyPaint = paintFor(sendButtonSpec, 'states', 'empty');

  return (
    // The native IconButton exposes no style prop, so the full radius and the
    // empty state's sunken fill sit on a wrapper; overflow clips the solid
    // variants to the same circle the web kit draws.
    <View
      style={{
        borderRadius: t(BOX.radius ?? 'radius-full'),
        overflow: 'hidden',
        backgroundColor: state === 'empty' ? t(emptyPaint.background ?? 'surface-sunken') : undefined,
      }}
    >
      <IconButton
        variant={VARIANT[state]}
        size={size}
        skeleton={skeleton}
        aria-label={label}
        accessibilityState={{ disabled: blocked, busy: state === 'sending' }}
        onPress={() => {
          // aria-disabled's native twin announces the refusal but does not enforce
          // it, so the press is refused here.
          if (blocked) return;
          if (state === 'failed') (onRetry ?? onSend)?.();
          else onSend?.();
        }}
      >
        {state === 'sending' ? (
          <Spinner size={size} aria-label="" />
        ) : state === 'failed' ? (
          <AlertTriangle size={GLYPH[size]} color={t('danger-contrast')} />
        ) : (
          <SendHorizontal
            size={GLYPH[size]}
            color={state === 'ready' ? t('accent-contrast') : t(emptyPaint.text ?? 'text-subtle')}
          />
        )}
      </IconButton>
    </View>
  );
}
