/**
 * @glacier/native — Modal.
 *
 * The React Native binding of @glacier/react's Modal: a centered glass dialog
 * rendered over a full-screen scrim. Paint (the glass-thick panel, its
 * glass-border hairline, and the overlay scrim) and geometry (radius-2xl, the
 * space-6 overlay/panel padding, the per-size max-width, and the header/footer
 * gaps and margins) are read from the modal spec through the shared resolvers,
 * so it stays pixel-identical to the web kit and cannot drift from it.
 *
 * It leans on the react-native <Modal> host for the overlay layer: an
 * absolute-fill Pressable paints the scrim and closes on press (the web overlay
 * onClick), and the panel View sits centered on top — a plain sibling above the
 * backdrop, so pressing the panel does not fall through to it (mirrors the web
 * stopPropagation). Fully controlled through `open` + `onClose`, exactly like
 * the web: there is no uncontrolled/defaultOpen path, so nothing is wrapped with
 * useControlled, and it renders nothing when closed.
 *
 * Web-parity notes (resting visuals only):
 * - The overlay's backdrop blur (blur-sm) and the panel's glass blur + saturate
 *   and layered box-shadow have no React Native equivalent and are dropped; the
 *   scrim and glass fill colors carry the look.
 * - The panel's spring-up entrance and the 150ms overlay fade are a device
 *   follow-up; the host's animationType="fade" is the closest built-in and the
 *   resting OPEN state is what this renders. Escape and the Android back button
 *   both route to onClose via onRequestClose.
 * - Focus trap, body-scroll lock, the portal into document.body, the
 *   aria-modal / aria-labelledby / aria-describedby wiring, and overflow scroll
 *   past the max-height are web/device a11y follow-ups; the panel takes its
 *   accessible name from a string title.
 */
import { type ReactNode } from 'react';
import { View, Pressable, Modal as RNModal, StyleSheet } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { modalSizes, modalSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { paintFor, sizeFor, dimensionsFor } from './resolve.ts';
import { IconButton } from './IconButton.tsx';
import { Heading } from './Heading.tsx';
import { Text } from './Text.tsx';

// Derived from the spec so the size union cannot drift from the web kit.
export type ModalSize = (typeof modalSizes)[number];

export interface ModalProps {
  /** Whether the modal is mounted and shown; renders nothing when false. */
  open: boolean;
  /** Called when the user dismisses via the close button, the scrim, or back. */
  onClose: () => void;
  /** Heading text shown in the header and used as the dialog label. */
  title?: ReactNode;
  /** Supporting text shown under the title. */
  description?: ReactNode;
  /** Panel max-width step. */
  size?: ModalSize;
  /** Action row content pinned to the panel bottom, end-aligned. */
  footer?: ReactNode;
  /** The dialog body content. */
  children?: ReactNode;
}

// Size-independent geometry (radius, hairline border, the overlay/panel padding,
// and the header/footer gaps and margins) read once from the spec.
const BOX = dimensionsFor(modalSpec);

/**
 * A resolved measurement value. The spec mixes tokenized dimensions (`space-6`,
 * `radius-2xl`) with raw CSS lengths (each size's `28rem`-style max-width). A
 * token name is wrapped in its custom property; a raw length — anything starting
 * with a digit or dot — passes straight through so it never becomes
 * `var(--glacier-28rem)`.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

// Strip a leading `$` from a base-paint ref exactly as the shared resolvers do
// so it cannot drift from the web kit.
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);

// Panel paint (glass-thick fill + glass-border hairline) from the top-level
// paint, and the scrim color from the `open` state's `overlay` role. Read
// straight from the spec so they stay pixel-identical to Modal.module.css.
const PANEL = (modalSpec.paint ?? {}) as { background?: string; text?: string; border?: string };
const PANEL_BG = t(bare(PANEL.background) ?? 'glass-thick');
const PANEL_BORDER = t(bare(PANEL.border) ?? 'glass-border');
const SCRIM = t(paintFor(modalSpec, 'states', 'open').overlay ?? 'overlay');

// The corner close glyph. `currentColor` picks up the IconButton's variant text
// color on react-native-web, matching the web CloseIcon.
const CloseIcon = (
  <Svg width={14} height={14} viewBox="0 0 14 14" fill="none" aria-hidden={true}>
    <Path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
  </Svg>
);

/**
 * The Glacier Modal, rendered with React Native primitives. See the file header
 * for the parity contract; visually identical to @glacier/react's Modal in its
 * resting open state and unable to drift from it.
 */
export function Modal({ open, onClose, title, description, size = 'md', footer, children }: ModalProps) {
  if (!open) return null;

  const maxWidth = metric(sizeFor(modalSpec, size).diameter, '28rem');

  return (
    <RNModal visible transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: metric(BOX.overlayPadding, 'space-6'),
        }}
      >
        {/* Scrim: the full-screen backdrop; pressing it closes the modal. */}
        <Pressable onPress={onClose} style={[StyleSheet.absoluteFill, { backgroundColor: SCRIM }]} />
        {/* Panel: the centered glass dialog, a sibling above the scrim. */}
        <View
          accessibilityLabel={typeof title === 'string' ? title : undefined}
          aria-label={typeof title === 'string' ? title : undefined}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth,
            // The web caps at calc(100vh - space-16); on device the padded host
            // height is the practical cap, so the panel fills at most the space
            // the overlay padding leaves it.
            maxHeight: '100%',
            padding: metric(BOX.panelPadding, 'space-6'),
            borderWidth: metric(BOX.border, 'hairline'),
            borderStyle: 'solid',
            borderColor: PANEL_BORDER,
            borderRadius: metric(BOX.radius, 'radius-2xl'),
            backgroundColor: PANEL_BG,
          }}
        >
          {/* Close: pinned to the top-right corner, raised above the header. */}
          <View style={{ position: 'absolute', top: t('space-4'), right: t('space-4'), zIndex: 1 }}>
            <IconButton aria-label="Close" size="sm" onPress={onClose}>
              {CloseIcon}
            </IconButton>
          </View>
          {(title != null || description != null) && (
            <View
              style={{
                flexDirection: 'column',
                rowGap: metric(BOX.headerGap, 'space-2'),
                marginBottom: metric(BOX.headerMargin, 'space-6'),
                // padding-inline-end -> right: keep the title clear of the close button.
                paddingRight: t('space-10'),
              }}
            >
              {title != null && (
                <Heading level={2} visualLevel={3}>
                  {title}
                </Heading>
              )}
              {description != null && (
                <Text tone="muted" size="sm">
                  {description}
                </Text>
              )}
            </View>
          )}
          {children}
          {footer != null && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                columnGap: metric(BOX.footerGap, 'space-3'),
                marginTop: metric(BOX.footerMargin, 'space-6'),
              }}
            >
              {footer}
            </View>
          )}
        </View>
      </View>
    </RNModal>
  );
}
