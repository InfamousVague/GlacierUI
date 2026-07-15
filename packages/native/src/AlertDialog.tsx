// AlertDialog — the @glacier/native binding of @glacier/react's AlertDialog
// organism. A deliberate confirmation dialog: a full-screen scrim (the spec's
// `overlay`) centers a glass panel whose title/description/body sit above a
// Cancel + confirmation footer. Paint (scrim, glass-thick surface, per-tone
// border, and the per-tone action-background/action-text) and geometry (radius,
// paddings, footer gap) are read from the alert-dialog spec through the shared
// resolvers, so this cannot drift from the web kit. Devices use RN's <Modal>;
// react-native-web portals the same Native content to document.body.
import { type ReactNode } from 'react';
import { View, Text, Pressable, type StyleProp } from 'react-native';
import { alertDialogSpec, alertDialogTones, buttonSpec } from '@glacier/spec';
import { press } from '@glacier/commons';
import { t } from './tokens.ts';
import { paintFor, sizeFor, dimensionsFor } from './resolve.ts';
import { Heading } from './Heading.tsx';
import { Text as DisplayText } from './Text.tsx';
import { Button } from './Button.tsx';
import { Spinner } from './Spinner.tsx';
import { AlertDialogHost } from './AlertDialogHost';

// Derived from the spec so the tone union cannot drift from the web kit.
export type AlertDialogTone = (typeof alertDialogTones)[number];

export interface AlertDialogProps {
  /** Whether the alert dialog is mounted and shown. Fully controlled (there is
   *  no uncontrolled/defaultOpen mode), matching @glacier/react. */
  open: boolean;
  /** Called by Cancel and, when `dismissible`, by the backdrop / hardware back. */
  onClose: () => void;
  /** Required heading content that names the alert dialog. */
  title: ReactNode;
  /** Supporting consequence text below the title. */
  description?: ReactNode;
  /** Visible label for the explicit confirmation action. */
  actionLabel: ReactNode;
  /** Called when the confirmation action is activated. */
  onAction: () => void;
  /** Optional visible label for the cancel action. */
  cancelLabel?: ReactNode;
  /** Semantic confirmation tone: neutral (accent action) or danger. */
  tone?: AlertDialogTone;
  /** Disables the confirmation action. */
  actionDisabled?: boolean;
  /** Shows a leading spinner and blocks the confirmation action. */
  actionLoading?: boolean;
  /** Enables backdrop / hardware-back dismissal. Defaults to false for
   *  deliberate confirmation flows. */
  dismissible?: boolean;
  /** Optional content between the description and the actions. */
  children?: ReactNode;
  /** Augments the panel surface style; merged after the component's own style so
   *  it can extend but never clobber the paint/geometry. */
  style?: StyleProp;
}

// Size-independent dimensions read once from the spec: radius / border / the
// overlay + panel paddings / footer gap. All are token names, wrapped by t().
const DIMS = dimensionsFor(alertDialogSpec);
// The open-state paint carries the scrim (`overlay`) and the panel surface
// (`glass-thick`); the tone paint carries the panel border + the action-* roles.
const OPEN = paintFor(alertDialogSpec, 'states', 'open');

// The confirmation action reuses the Button's md geometry so it lines up exactly
// with the Cancel Button beside it; its paint comes from the alert-dialog tone
// tokens (neutral: accent-solid/accent-contrast, danger: danger-solid/
// danger-contrast) — the same values the web Button variant resolves to.
const BTN = dimensionsFor(buttonSpec); // radius, gap
const BTN_MD = sizeFor(buttonSpec, 'md'); // height, paddingInline, fontSize

/**
 * The Glacier AlertDialog, rendered with React Native primitives.
 *
 * Resting OPEN state only: the panel fades/scales in on the web via motion; here
 * the device <Modal> uses the platform `fade`, and the panel renders at its
 * resting open geometry (the spring scale-in is a device follow-up). Cancel is focused
 * first on the web; RN has no imperative focus-trap runtime, so focus order is
 * left to the platform.
 *
 * Web-only bits, accepted as documented approximations: `className` (no RN
 * className); the `aria-labelledby`/`aria-describedby`/`aria-modal` wiring and
 * the Tab focus-trap + body-scroll-lock (the panel exposes `accessibilityRole`
 * and, when the title is a string, an `accessibilityLabel`); the panel's
 * backdrop-filter blur, layered inset glass highlight and drop shadow (no RN
 * backdrop-filter / inset shadow); and the overflow-y auto scroll on tall
 * content (a device ScrollView follow-up — short content renders faithfully).
 */
export function AlertDialog({
  open,
  onClose,
  title,
  description,
  actionLabel,
  onAction,
  cancelLabel,
  tone = 'neutral',
  actionDisabled = false,
  actionLoading = false,
  dismissible = false,
  children,
  style,
}: AlertDialogProps) {
  // Fully controlled, mirroring the web `if (!open) return null`. When closed
  // the dialog renders nothing (there is no trigger — `open` is owned outside).
  if (!open) return null;

  const tonePaint = paintFor(alertDialogSpec, 'tones', tone);
  const actionBg = t(tonePaint['action-background'] ?? 'accent-solid');
  const actionText = t(tonePaint['action-text'] ?? 'accent-contrast');
  const actionInert = actionDisabled || actionLoading;

  // Escape / hardware-back only dismisses when explicitly enabled; otherwise a
  // no-op keeps the request handled (Android requires it) without closing,
  // matching the web's blocked-by-default Escape.
  const requestClose = dismissible ? onClose : () => {};

  const panelStyle = {
    width: '100%',
    // The CSS `min(100%, 28rem)` cap. 28rem is a raw length the spec declares no
    // token for, so it passes through verbatim like other kit raw metrics.
    maxWidth: '28rem',
    // calc(100vh - space-16): resolved by react-native-web; a device build caps
    // via a measured height. Short dialogs never reach it.
    maxHeight: 'calc(100vh - var(--glacier-space-16))',
    padding: t(DIMS.panelPadding ?? 'space-5'),
    borderWidth: t(DIMS.border ?? 'hairline'),
    borderStyle: 'solid' as const,
    borderColor: t(tonePaint.border ?? 'glass-border'),
    borderRadius: t(DIMS.radius ?? 'radius-2xl'),
    backgroundColor: t(OPEN.background ?? 'glass-thick'),
  };

  const content = (
      <Pressable
        // The fixed, blurred backdrop. A press closes only when dismissible.
        onPress={dismissible ? onClose : undefined}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: t(DIMS.overlayPadding ?? 'space-6'),
          backgroundColor: t(OPEN.overlay ?? 'overlay'),
        }}
      >
        <Pressable
          accessibilityRole="alertdialog"
          accessibilityLabel={typeof title === 'string' ? title : undefined}
          // Swallow presses so tapping the panel never reaches the backdrop
          // (the web `stopPropagation`), independent of the press-scale controls.
          onPress={() => {}}
          // `style` last so a caller can extend the surface without clobbering it.
          style={[panelStyle, style as never]}
        >
          <Heading level={2} visualLevel={3}>
            {title}
          </Heading>
          {description != null && (
            <View style={{ marginTop: t('space-3') }}>
              <DisplayText tone="muted">{description}</DisplayText>
            </View>
          )}
          {children != null && <View style={{ marginTop: t('space-5') }}>{children}</View>}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
              columnGap: t(DIMS.footerGap ?? 'space-3'),
              rowGap: t(DIMS.footerGap ?? 'space-3'),
              marginTop: t('space-6'),
            }}
          >
            <Button variant="ghost" onPress={onClose}>
              {cancelLabel ?? 'Cancel'}
            </Button>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: actionInert, busy: actionLoading }}
              disabled={actionInert}
              onPress={onAction}
              style={({ pressed }) => [
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  columnGap: t(BTN.gap ?? 'space-2'),
                  height: t(BTN_MD.height ?? 'control-height-md'),
                  paddingHorizontal: t(BTN_MD.paddingInline ?? 'space-5'),
                  borderRadius: t(BTN.radius ?? 'control-radius'),
                  borderWidth: t('hairline'),
                  borderStyle: 'solid',
                  borderColor: 'transparent',
                  backgroundColor: actionBg,
                  // Carries currentColor for the inherit-tone Spinner ring below.
                  color: actionText,
                  // The web action-disabled/loading Button dims to half opacity.
                  opacity: actionInert ? 0.5 : 1,
                  transform: [{ scale: pressed && !actionInert ? press.control : 1 }],
                },
              ]}
            >
              {actionLoading && <Spinner size="sm" tone="inherit" aria-label="" />}
              <Text
                style={{
                  color: actionText,
                  fontSize: t(BTN_MD.fontSize ?? 'font-size-sm'),
                  fontFamily: t('font-sans'),
                  fontWeight: t('font-weight-medium') as never,
                }}
              >
                {actionLabel}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
  );

  return (
    <AlertDialogHost onRequestClose={requestClose}>
      {content}
    </AlertDialogHost>
  );
}
