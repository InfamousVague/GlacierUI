import type { ComponentProps } from 'react';
import { AlertTriangle, SendHorizontal } from '@glacier/icons';
import type { MouseEvent } from 'react';
// TODO(integration): switch to '@glacier/spec' once the compose specs are registered.
import { sendButtonStates } from '../../../../spec/src/components/send-button.ts';
import type { ComposeBlockReason, SendButtonState } from '@glacier/logic';
import { cx } from '../../internal/cx.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { IconButton } from '../../atoms/inputs/Button/IconButton.tsx';
import { Spinner } from '../../atoms/feedback/Progress/Spinner.tsx';
import { composeMessages } from './messages.ts';
import styles from './SendButton.module.css';

// Derived from the spec so the state union cannot drift.
export type { SendButtonState };
export { sendButtonStates };

/** Per-state accessible names, merged over the localized kit strings. */
export interface SendButtonLabels {
  send: string;
  empty: string;
  sending: string;
  failed: string;
}

// aria-label is omitted as well as the usual collisions: IconButton requires
// one, but this component derives its own from the send state, so demanding it
// from callers would be asking for a label it then ignores.
export interface SendButtonProps
  extends Omit<ComponentProps<typeof IconButton>, 'size' | 'onChange' | 'children' | 'aria-label'> {
  /** What the control currently is; derive it with composeSendState. */
  state?: SendButtonState;
  /** Why send is refused. It changes the label, never the paint. */
  blockReason?: ComposeBlockReason;
  /** Called on activation while ready. */
  onSend?: () => void;
  /** Called on activation while failed; falls back to onSend. */
  onRetry?: () => void;
  size?: 'sm' | 'md' | 'lg';
  /** Renders a placeholder with the control geometry. */
  skeleton?: boolean;
  /** Overrides the accessible names. */
  labels?: Partial<SendButtonLabels>;
  className?: string;
}

/** Glyph size per control size, matching the spec's iconSize measurements. */
const GLYPH = { sm: 16, md: 18, lg: 20 } as const;

/** The IconButton variant each state paints through. */
const VARIANT = { empty: 'ghost', ready: 'solid', sending: 'solid', failed: 'danger' } as const;

/**
 * The send affordance, in four states.
 *
 * **The empty state is disabled, never hidden**, and that is the whole design
 * decision. Hiding it would be tidier and is wrong three times over: the
 * trailing controls reflow the moment the first character is typed, so the
 * button slides under a thumb already travelling toward it; a screen-reader user
 * tabbing an empty composer never learns that send exists; and on a touch device
 * — where Enter writes a newline by policy — this button is the ONLY way to
 * send, so an absent one leaves no route at all.
 *
 * It is refused with `aria-disabled` rather than the `disabled` attribute, for
 * the same reason: a `disabled` button leaves the tab order, and a control you
 * cannot reach cannot tell you why it will not act. Here it stays reachable and
 * its name carries the fix — nothing typed, an upload still running, over the
 * limit, or a send already in flight.
 *
 * One button whose glyph and label change, not three that swap, so focus
 * survives every transition — including the one into `failed`, where the control
 * becomes the retry exactly where the user's finger already is.
 */
export function SendButton({
  state = 'empty',
  blockReason,
  onSend,
  onRetry,
  size = 'md',
  skeleton = false,
  labels,
  className,
  ...rest
}: SendButtonProps) {
  const t = useT();

  const blocked = state === 'empty' || state === 'sending';
  const label = (() => {
    if (state === 'failed') return labels?.failed ?? t(composeMessages.sendFailed);
    if (state === 'sending') return labels?.sending ?? t(composeMessages.sending);
    if (state === 'ready') return labels?.send ?? t(composeMessages.send);
    if (labels?.empty) return labels.empty;
    // The reason travels into the name: four refusals that look identical must
    // not sound identical.
    if (blockReason === 'uploading') return t(composeMessages.sendUploading);
    if (blockReason === 'over-limit') return t(composeMessages.sendOverLimit);
    return t(composeMessages.sendEmpty);
  })();

  const activate = (event: MouseEvent) => {
    if (blocked) {
      // aria-disabled keeps the control focusable, so the press has to be
      // refused here rather than by the platform.
      event.preventDefault();
      return;
    }
    if (state === 'failed') (onRetry ?? onSend)?.();
    else onSend?.();
  };

  return (
    <IconButton
      {...rest}
      variant={VARIANT[state]}
      size={size}
      skeleton={skeleton}
      className={cx(styles.send, state === 'empty' && styles.empty, className)}
      data-state={state}
      aria-label={label}
      aria-disabled={blocked || undefined}
      aria-busy={state === 'sending' || undefined}
      onClick={activate}
    >
      {state === 'sending' ? (
        <Spinner size={size} />
      ) : state === 'failed' ? (
        <AlertTriangle size={GLYPH[size]} />
      ) : (
        <SendHorizontal size={GLYPH[size]} />
      )}
    </IconButton>
  );
}
