// TabbedModal — the React Native binding of @glacier/react's TabbedModal.
// A settings-style dialog: a fixed left nav rail (vertical tablist) beside a
// scrollable right pane (tabpanel). The web composes the kit's Modal; native has
// no Modal binding yet, so this synthesizes the same chrome from the RN Modal
// primitive — a scrim backdrop that closes on press plus a centered glass panel —
// and reads every paint/geometry token from the tabbed-modal and modal specs
// through the shared resolvers, so it cannot drift from the DOM kit.

import { useId, type ReactNode } from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { modalSpec, tabbedModalSpec } from '@glacier/spec';
import { useControlled, paintFor } from '@glacier/commons';
import { t } from './tokens.ts';
import { dimensionsFor, sizeFor } from './resolve.ts';
import { Heading } from './Heading.tsx';
import { IconButton } from './IconButton.tsx';

export interface TabbedModalSection {
  /** Stable identifier for the section, matched against `value`. */
  id: string;
  /** Nav-rail label. */
  label: ReactNode;
  /** Optional leading glyph in the nav rail. */
  icon?: ReactNode;
  /** Body shown in the scrollable pane when this section is active. */
  content: ReactNode;
  /** Dims the rail entry and skips it in navigation. */
  disabled?: boolean;
}

export interface TabbedModalProps {
  open: boolean;
  /** Called when the user dismisses via Escape, the close button, or the overlay. */
  onClose: () => void;
  /** The sections listed in the left nav rail; the active one fills the right pane. */
  sections: TabbedModalSection[];
  /** Controlled active section id. */
  value?: string;
  /** Initial active section id when uncontrolled. */
  defaultValue?: string;
  /** Called with the next active section id. */
  onValueChange?: (value: string) => void;
  /** Heading shown above the two panes. */
  title?: ReactNode;
  /** Action row passed through to the underlying Modal, below both panes. */
  footer?: ReactNode;
  /** Web-only escape hatch; accepted for parity and ignored on native. */
  className?: string;
}

/**
 * A resolved measurement value: `dimensionsFor`/`sizeFor` hand back bare token
 * names (e.g. `space-6`) for tokenized values and raw CSS lengths (the panel's
 * `48rem` max-width, declared inline) for the rest. A token name gets wrapped in
 * its custom property; a raw length — anything starting with a digit or dot —
 * passes straight through so it never becomes `var(--glacier-48rem)`.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

// Strip the leading `$` from a base-paint ref exactly as the shared resolvers do.
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);

// Modal chrome geometry (padding, radius, border, header/footer margins) and the
// xl panel width, read once from the modal spec the web composes.
const MODAL_DIMS = dimensionsFor(modalSpec);
const PANEL_MAX_WIDTH = metric(sizeFor(modalSpec, 'xl').diameter, '48rem');
const MODAL_PAINT = (modalSpec.paint ?? {}) as { background?: string; text?: string; border?: string };
const PANEL_BG = t(bare(MODAL_PAINT.background) ?? 'glass-thick');
const PANEL_TEXT = t(bare(MODAL_PAINT.text) ?? 'text');
const PANEL_BORDER = t(bare(MODAL_PAINT.border) ?? 'glass-border');
// The scrim: the modal's `open` state carries the overlay token behind the panel.
const SCRIM = t(paintFor(modalSpec, 'states', 'open').overlay ?? 'overlay');

// Rail-to-content geometry from the tabbed-modal spec: `rail` (space-4) is both
// the layout column gap and the rail's padding-inline-end in the web CSS.
const LAYOUT = dimensionsFor(tabbedModalSpec);
// The selected rail item recolors to accent-text and carries the accent-soft pill.
const SELECTED = paintFor(tabbedModalSpec, 'states', 'selected');
const SELECTED_COLOR = t(SELECTED.text ?? 'accent-text');
const INDICATOR_BG = t(SELECTED.indicator ?? 'accent-soft');
// The resting rail item color (the web `.railItem` default, not a state role).
const MUTED_COLOR = t('text-muted');

// The web Modal's close glyph, a currentColor SVG the IconButton tints via its
// wrapping View (react-native-web resolves currentColor from that color).
const CloseIcon = (
  <Svg width={14} height={14} viewBox="0 0 14 14" fill="none" aria-hidden={true}>
    <Path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
  </Svg>
);

/**
 * The Glacier TabbedModal, rendered with React Native primitives. A settings-style
 * dialog composing the RN Modal primitive (visible/transparent/onRequestClose):
 * a full-screen Pressable backdrop painted with the modal's scrim token closes on
 * press, and a centered glass panel (glass-thick fill, glass-border hairline,
 * radius-2xl, xl max-width) holds an optional title Heading + close IconButton, a
 * fixed vertical nav rail, and a scrollable pane for the active section. Paint and
 * geometry come from the modal and tabbed-modal specs through the shared
 * resolvers, so it stays visually identical to @glacier/react's TabbedModal.
 *
 * Selection is controlled/uncontrolled through the shared `useControlled` hook —
 * the same contract the web kit uses — and taps switch sections. Resting visuals
 * only: the web springs the dialog open, slides the rail pill between sections as
 * a shared framer-motion layout element, and cross-fades the pane on change; this
 * binding has no animation runtime, so it paints the resting OPEN state (the pill
 * sits under the selected item; the `animationType="fade"` on the primitive is the
 * only device transition). Arrow-key roving, focus trap, scroll lock, portal, and
 * the panel's backdrop blur/shadow are web concerns dropped or approximated here;
 * `className` is accepted-but-noop for prop parity. On device, pane text children
 * need their own color — Text does not inherit the pane color as CSS does on web.
 */
export function TabbedModal({
  open,
  onClose,
  sections,
  value,
  defaultValue,
  onValueChange,
  title,
  footer,
  className: _className,
}: TabbedModalProps) {
  const id = useId();
  const fallback = defaultValue ?? sections.find((section) => !section.disabled)?.id ?? '';
  const [selected, setSelected] = useControlled({ value, defaultValue: fallback, onChange: onValueChange });

  const activeIndex = sections.findIndex((section) => section.id === selected);
  const active = activeIndex >= 0 ? sections[activeIndex] : undefined;
  const titleLabel = typeof title === 'string' ? title : undefined;

  // Rail-to-content distance: space-4 column gap between the rail and pane, matched
  // by the rail's own space-4 padding-inline-end (both the spec's `rail` token).
  const railGap = metric(LAYOUT.rail, 'space-4');

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: metric(MODAL_DIMS.overlayPadding, 'space-6') }}>
        {/* Full-screen scrim backdrop: a Pressable that dismisses on press. */}
        <Pressable
          aria-label="Close"
          onPress={onClose}
          style={[StyleSheet.absoluteFill, { backgroundColor: SCRIM }]}
        />
        {/* The glass dialog panel, centered above the backdrop. */}
        <View
          accessibilityRole="dialog"
          aria-label={titleLabel}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: PANEL_MAX_WIDTH,
            maxHeight: '100%',
            padding: metric(MODAL_DIMS.panelPadding, 'space-6'),
            borderWidth: metric(MODAL_DIMS.border, 'hairline'),
            borderStyle: 'solid',
            borderColor: PANEL_BORDER,
            borderRadius: metric(MODAL_DIMS.radius, 'radius-2xl'),
            backgroundColor: PANEL_BG,
          }}
        >
          {/* Close button pinned to the top-right corner (space-4 inset). */}
          <View style={{ position: 'absolute', top: t('space-4'), right: t('space-4'), zIndex: 1 }}>
            <IconButton aria-label="Close" size="sm" onPress={onClose}>
              {CloseIcon}
            </IconButton>
          </View>

          {title != null && (
            <View style={{ marginBottom: metric(MODAL_DIMS.headerMargin, 'space-6'), paddingRight: t('space-10') }}>
              <Heading level={2} visualLevel={3}>
                {title}
              </Heading>
            </View>
          )}

          {/* The two-pane body: fixed nav rail beside the scrollable active pane. */}
          <View style={{ flexDirection: 'row', columnGap: railGap, minHeight: '18rem' }}>
            <View
              accessibilityRole="tablist"
              aria-orientation="vertical"
              aria-label={titleLabel}
              style={{
                width: '12rem',
                flexShrink: 0,
                flexDirection: 'column',
                alignItems: 'stretch',
                rowGap: '0.125rem',
                paddingRight: railGap,
                borderRightWidth: t('hairline'),
                borderRightColor: t('border-subtle'),
                borderStyle: 'solid',
              }}
            >
              {sections.map((section, index) => {
                const isSelected = section.id === selected;
                const color = section.disabled ? MUTED_COLOR : isSelected ? SELECTED_COLOR : MUTED_COLOR;
                return (
                  <Pressable
                    key={section.id}
                    accessibilityRole="tab"
                    nativeID={`${id}-tab-${index}`}
                    aria-label={typeof section.label === 'string' ? section.label : undefined}
                    accessibilityState={{ selected: isSelected, disabled: section.disabled }}
                    disabled={section.disabled}
                    onPress={() => setSelected(section.id)}
                    style={{
                      position: 'relative',
                      flexDirection: 'row',
                      alignItems: 'center',
                      columnGap: t('space-2'),
                      width: '100%',
                      paddingVertical: t('space-2'),
                      paddingHorizontal: t('space-3'),
                      borderRadius: t('radius-md'),
                      opacity: section.disabled ? 0.5 : 1,
                    }}
                  >
                    {/* The active pill sits behind the row content (rendered first). */}
                    {isSelected && (
                      <View
                        aria-hidden={true}
                        style={{
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          left: 0,
                          right: 0,
                          zIndex: 0,
                          backgroundColor: INDICATOR_BG,
                          borderRadius: t('radius-md'),
                        }}
                      />
                    )}
                    {section.icon != null && (
                      <View
                        aria-hidden={true}
                        style={{
                          zIndex: 1,
                          flexGrow: 0,
                          flexShrink: 0,
                          width: '1.125rem',
                          height: '1.125rem',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color,
                        }}
                      >
                        {section.icon}
                      </View>
                    )}
                    <Text
                      numberOfLines={1}
                      style={{
                        zIndex: 1,
                        flex: 1,
                        minWidth: 0,
                        color,
                        fontSize: t('font-size-sm'),
                        lineHeight: t('leading-sm') as never,
                        fontFamily: t('font-sans'),
                        ...(isSelected ? { fontWeight: t('font-weight-medium') as never } : null),
                      }}
                    >
                      {section.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {active && (
              <ScrollView
                accessibilityRole="tabpanel"
                nativeID={`${id}-panel-${activeIndex}`}
                style={{ flex: 1, minWidth: 0, maxHeight: '28rem' }}
                contentContainerStyle={{ padding: t('space-2') }}
              >
                {/* Pane text roles: color/size cascade to string children on web; on
                    device, glacier Text children carry their own color. */}
                <View style={{ color: PANEL_TEXT, fontSize: t('font-size-sm'), lineHeight: t('leading-md') as never }}>
                  {active.content}
                </View>
              </ScrollView>
            )}
          </View>

          {footer != null && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                columnGap: metric(MODAL_DIMS.footerGap, 'space-3'),
                marginTop: metric(MODAL_DIMS.footerMargin, 'space-6'),
              }}
            >
              {footer}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
