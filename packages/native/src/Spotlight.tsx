/**
 * @glacier/native — Spotlight.
 *
 * The React Native binding of @glacier/react's Spotlight: a guided-tour step —
 * a dimmed full-screen backdrop plus a glass callout carrying a title, body,
 * step count, and Back / Next / Close controls. Geometry (the callout's
 * radius-xl and space-2 gap) is read from the spotlight spec through the shared
 * resolvers; the callout's glass paint (glass-thick fill, glass-border hairline)
 * and the backdrop's `overlay` scrim mirror Spotlight.module.css by token name,
 * since the spec leaves `paint` empty for the portaled surface. It stays
 * pixel-identical to the web kit's resting open state and cannot drift from it.
 *
 * It leans on the react-native <Modal> host for the overlay layer, exactly like
 * the native Modal: an absolute-fill Pressable paints the `overlay` scrim and
 * closes on press (the web backdrop onClick), and the callout View sits above it
 * as a sibling so pressing the callout does not fall through. Fully controlled
 * through `open` + `onClose` (the web has no uncontrolled path), so nothing is
 * wrapped with useControlled and it renders nothing when closed. Escape and the
 * Android back button both route to onClose via onRequestClose.
 *
 * Web-parity notes — deliberate approximations of DOM-only machinery:
 * - Anchored placement: the web anchors the callout to `targetRef` with the
 *   shared floating-ui engine (flip + clamp) and re-parents it to document.body.
 *   React Native has no portal or floating-ui and cannot measure an arbitrary
 *   target cheaply, so the callout is CENTERED over the scrim instead. `targetRef`
 *   and `placement` are kept in the contract for 1:1 docs parity but do not drive
 *   position here — collision-aware anchored placement is a device follow-up.
 * - Cutout highlight: the web punches a click-through, rounded "hole" around the
 *   target (a giant spread shadow on a ring, `cutoutPadding` wide) so the
 *   highlighted element stays interactive. RN cannot punch a shadow hole or make
 *   an overlay region click-through, so the cutout and `cutoutPadding` are a
 *   documented follow-up; the resting callout is what this renders.
 * - The callout's backdrop blur + saturate and its layered inset-highlight /
 *   shadow-5 box-shadow have no React Native equivalent and are dropped; the
 *   glass-thick fill and the scrim color carry the look.
 * - The backdrop fade and the callout's scale/fade entrance are a device
 *   follow-up; the host's animationType="fade" is the closest built-in and the
 *   resting OPEN state is what this renders.
 * - Focus trap, body-scroll lock, the portal into document.body, and the
 *   aria-modal / aria-labelledby / aria-describedby wiring are web/device a11y
 *   follow-ups; the callout takes its accessible name from a string title.
 * - `className` is a DOM attribute with no native meaning and is accepted-but-noop;
 *   pass `style` to augment the callout box on native.
 */
import { type ReactNode, type RefObject } from 'react';
import { View, Pressable, Modal as RNModal, StyleSheet, Text as RNText, type StyleProp } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { popoverPlacements, spotlightSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { dimensionsFor } from './resolve.ts';
import { Button } from './Button.tsx';
import { IconButton } from './IconButton.tsx';
import { Heading } from './Heading.tsx';
import { Text } from './Text.tsx';

// Derived from the spec so the union cannot drift from the web kit (the web's
// Placement comes from the same popover placement list).
export type SpotlightPlacement = (typeof popoverPlacements)[number];

export interface SpotlightProps {
  /** Whether the tour step is shown. */
  open: boolean;
  /**
   * Ref to the element to highlight. Kept for prop parity with @glacier/react;
   * native has no portal or floating-ui to anchor against, so the callout is
   * centered and this does not drive its position (a device follow-up).
   */
  targetRef: RefObject<unknown>;
  /** Step heading. */
  title?: ReactNode;
  /** Step body copy. */
  description?: ReactNode;
  /**
   * Where to place the callout relative to the target before flipping and
   * clamping. Accepted for prop parity; the native callout is centered, so this
   * is a noop until anchored placement lands (a device follow-up).
   */
  placement?: SpotlightPlacement;
  /**
   * Padding around the target inside the cutout, in pixels. Accepted for prop
   * parity; native cannot punch a click-through cutout, so this is a noop until
   * the cutout highlight lands (a device follow-up).
   */
  cutoutPadding?: number;
  /** 1-based index of this step. */
  step?: number;
  /** Total number of steps in the tour. */
  total?: number;
  /** Advances to the next step; the Next button is hidden when omitted. */
  onNext?: () => void;
  /** Returns to the previous step; the Back button is hidden when omitted. */
  onBack?: () => void;
  /** Dismisses the tour, via the close button, the Android back button, or a backdrop press. */
  onClose: () => void;
  /** A DOM attribute with no native meaning; accepted-but-noop. Use `style`. */
  className?: string;
  /** Augments the callout box on native; merged after the component's own style. */
  style?: StyleProp;
}

// Size-independent geometry (the callout radius and its content gap) read once
// from the spec so it cannot drift from the web kit.
const BOX = dimensionsFor(spotlightSpec);

// The callout's glass paint and the backdrop's scrim, mirroring
// Spotlight.module.css by token name: the spec leaves `paint` empty because the
// portaled surface paints itself in CSS, so these reference the same tokens the
// `.callout` / `.ring` rules use (glass-thick fill, glass-border hairline, the
// `overlay` dim).
const PANEL_BG = t('glass-thick');
const PANEL_BORDER = t('glass-border');
const SCRIM = t('overlay');

// The corner close glyph. `currentColor` picks up the IconButton's variant text
// color on react-native-web, matching the web CloseIcon.
const CloseIcon = (
  <Svg width={14} height={14} viewBox="0 0 14 14" fill="none" aria-hidden={true}>
    <Path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
  </Svg>
);

/**
 * The Glacier Spotlight, rendered with React Native primitives. See the file
 * header for the parity contract; visually identical to @glacier/react's
 * Spotlight in its resting open state (a centered glass callout over a dimmed
 * scrim) and unable to drift from it.
 */
export function Spotlight({
  open,
  targetRef: _targetRef,
  title,
  description,
  placement: _placement = 'bottom',
  cutoutPadding: _cutoutPadding = 8,
  step,
  total,
  onNext,
  onBack,
  onClose,
  className: _className,
  style,
}: SpotlightProps) {
  if (!open) return null;

  const showCount = step != null && total != null;

  return (
    <RNModal visible transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          // The web clamps the callout to the viewport with a 1rem inset
          // (max-width: min(20rem, calc(100vw - 2rem))); the host padding stands
          // in for that inset on device.
          padding: t('space-4'),
        }}
      >
        {/* Scrim: the dimmed full-screen backdrop; pressing it closes the tour
            (the web backdrop onClick). */}
        <Pressable onPress={onClose} style={[StyleSheet.absoluteFill, { backgroundColor: SCRIM }]} />

        {/* Callout: the glass command panel, a sibling above the scrim. Centered
            because native cannot anchor to the target (see the file header). */}
        <View
          accessibilityLabel={typeof title === 'string' ? title : undefined}
          aria-label={typeof title === 'string' ? title : undefined}
          style={[
            {
              position: 'relative',
              flexDirection: 'column',
              rowGap: t(BOX.gap ?? 'space-2'),
              maxWidth: '20rem',
              padding: t('space-5'),
              // padding-inline-end -> right: reserve the corner for the close button.
              paddingRight: t('space-10'),
              borderWidth: t('hairline'),
              borderStyle: 'solid',
              borderColor: PANEL_BORDER,
              borderRadius: t(BOX.radius ?? 'radius-xl'),
              backgroundColor: PANEL_BG,
            },
            // `style` last so a caller's layout style merges over the box without
            // wiping its paint or geometry.
            style as never,
          ]}
        >
          {/* Close: pinned to the top-right corner, raised above the header. */}
          <View style={{ position: 'absolute', top: t('space-3'), right: t('space-3'), zIndex: 1 }}>
            <IconButton aria-label="Close tour" size="sm" onPress={onClose}>
              {CloseIcon}
            </IconButton>
          </View>

          {title != null && (
            <Heading level={2} visualLevel={4}>
              {title}
            </Heading>
          )}
          {description != null && (
            <Text tone="muted" size="sm">
              {description}
            </Text>
          )}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              columnGap: t('space-4'),
              marginTop: t('space-2'),
            }}
          >
            {showCount && (
              // The count is a plain span on the web (not the Text atom): the
              // sans family with tabular numerals and the text-subtle / xs tokens,
              // read straight from `.count`. `flexShrink: 0` mirrors `flex: none`.
              <RNText
                aria-label={`Step ${step} of ${total}`}
                accessibilityLabel={`Step ${step} of ${total}`}
                style={{
                  flexShrink: 0,
                  color: t('text-subtle'),
                  fontSize: t('font-size-xs'),
                  fontFamily: t('font-sans'),
                  fontVariant: ['tabular-nums'],
                }}
              >
                {step} / {total}
              </RNText>
            )}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                columnGap: t('space-2'),
                // Push the actions to the trailing edge even when the count is
                // absent, matching the web `.actions { margin-inline-start: auto }`.
                marginLeft: 'auto',
              }}
            >
              {/* Back is the ghost variant, Next the solid variant; the Next
                  label flips to "Done" on the last step, matching the web. */}
              {onBack && (
                <Button variant="ghost" size="sm" onPress={onBack}>
                  Back
                </Button>
              )}
              {onNext && (
                <Button variant="solid" size="sm" onPress={onNext}>
                  {total != null && step === total ? 'Done' : 'Next'}
                </Button>
              )}
            </View>
          </View>
        </View>
      </View>
    </RNModal>
  );
}
