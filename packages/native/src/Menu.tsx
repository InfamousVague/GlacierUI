/**
 * @glacier/native — Menu (+ ContextMenu, MenuSub, MenuItem, MenuSeparator, MenuLabel).
 *
 * The React Native binding of @glacier/react's Menu: a trigger that toggles a
 * glass panel of action rows. Paint (the glass-thick surface + glass-border
 * hairline + shadow-4 from the open state, the hover wash on rows, the danger
 * tone) and geometry (radius-lg panel, space-1 panel padding, radius-md rows,
 * the item paddings/gaps/fonts) are read from the menu spec through the shared
 * resolvers, so the resting open panel stays visually identical to the web kit
 * and cannot drift from it. Open state is controlled/uncontrolled through the
 * shared useControlled hook, exactly like the web.
 *
 * Anchored-overlay approximation (device follow-ups, documented):
 * - React Native has no floating-ui or portal, so the panel is not portaled to a
 *   document body; it renders as an absolutely-positioned View inside the
 *   relatively-positioned root, pinned below the trigger (top 100% + the web's
 *   8px anchor gap), inline-start aligned. Collision-aware flip/clamp (the
 *   `placement` prop is accepted for parity but only start/end alignment and the
 *   below/above side are approximated), live scroll/resize reflow, and RTL
 *   right-edge anchoring are dropped. The panel scrolls past a fixed 24rem cap.
 * - Outside-press dismissal, Escape, first-item focus, and the WAI-ARIA roving
 *   arrow/Home/End/Enter model have no anchored equivalent without a full-screen
 *   layer or key listeners; tapping the trigger again toggles closed, and
 *   choosing an item closes the menu. The scale/fade entrance (motion) and the
 *   backdrop blur/inset highlight are web/device follow-ups.
 * - ContextMenu is summoned on a touch long-press (the web contextmenu/500ms
 *   long-press path) and anchored below the wrapped target rather than at the
 *   exact pointer coordinates — RN has no pointer position without a gesture
 *   handler, so the zero-size virtual pointer anchor is a device follow-up.
 * - MenuSub opens its flyout on press (the web hover intent-delay + arrow-key
 *   open) and pins it inline-end of the row (right, LTR assumption; RTL flip is a
 *   follow-up).
 * - `className`/`menuClassName` and DOM button/div attributes are web-only and
 *   accepted-but-noop.
 */
import {
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { View, Text, Pressable, ScrollView, type StyleProp } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { menuSpec } from '@glacier/spec';
import { useControlled } from '@glacier/commons';
import { t } from './tokens.ts';
import { dimensionsFor, paintFor } from './resolve.ts';
import type { Placement } from './Popover.tsx';

// ---- spec-derived paint + geometry (read once) --------------------------------

// Size-independent panel metrics: radius-lg + the space-1 panel padding.
const BOX = dimensionsFor(menuSpec); // { radius: 'radius-lg', gap: 'space-1' }

// Open-state surface paint: glass-thick fill, glass-border hairline, shadow-4.
const OPEN = paintFor(menuSpec, 'states', 'open');
const PANEL_BG = t(OPEN.background ?? 'glass-thick');
const PANEL_BORDER = t(OPEN.border ?? 'glass-border');
const PANEL_SHADOW = t(OPEN.shadow ?? 'shadow-4');

// The hover/focus wash that fills an enabled row (native analog: the pressed
// state), and the danger tone's text + soft fill.
const HOVER = paintFor(menuSpec, 'states', 'hover');
const HOVER_BG = t(HOVER.background ?? 'hover');
const DANGER = paintFor(menuSpec, 'states', 'danger');
const DANGER_TEXT = t(DANGER.text ?? 'danger-text');
const DANGER_HOVER = t(DANGER.hover ?? 'danger-soft');

const PANEL_RADIUS = t(BOX.radius ?? 'radius-lg');
const PANEL_PADDING = t(BOX.gap ?? 'space-1');

// The web anchors the menu 8px below the trigger (`offset ?? 8`), untokenized in
// both kits; the raw length mirrors it. The 22rem CSS max-width and the scroll
// cap pass through verbatim so they never become `var(--glacier-…)`.
const MENU_GAP = '0.5rem';
const MENU_MIN_WIDTH = '12rem';
const MENU_MAX_WIDTH = 'min(22rem, calc(100vw - 2rem))';
const MENU_MAX_HEIGHT = '24rem';

// ---- context -----------------------------------------------------------------

interface MenuContextValue {
  /** Closes the owning menu. */
  close: () => void;
  /** Whether the owning panel is open; a flyout closes when it drops. */
  open: boolean;
}
const MenuContext = createContext<MenuContextValue | null>(null);

// ---- shared glass panel ------------------------------------------------------

/** The absolutely-positioned glass panel shared by Menu, ContextMenu, and MenuSub. */
function MenuPanel({
  anchor,
  label,
  style,
  children,
}: {
  /** Where the panel pins relative to its anchor row/trigger. */
  anchor: StyleProp;
  label?: string;
  style?: StyleProp;
  children?: ReactNode;
}) {
  return (
    <View
      accessibilityRole="menu"
      aria-label={label}
      style={[
        anchor,
        {
          minWidth: MENU_MIN_WIDTH,
          maxWidth: MENU_MAX_WIDTH,
          rowGap: 1,
          padding: PANEL_PADDING,
          borderWidth: t('hairline'),
          borderStyle: 'solid',
          borderColor: PANEL_BORDER,
          borderRadius: PANEL_RADIUS,
          backgroundColor: PANEL_BG,
          // The layered drop shadow (box-shadow on react-native-web; the glass
          // blur + inset highlight are dropped on-device).
          boxShadow: PANEL_SHADOW,
          zIndex: 200,
        },
      ]}
    >
      <ScrollView style={{ maxHeight: MENU_MAX_HEIGHT }}>{children}</ScrollView>
    </View>
  );
}

// The panel pinned below its trigger/target (bottom-start approximation).
const BELOW_ANCHOR: StyleProp = { position: 'absolute', top: '100%', left: 0, marginTop: MENU_GAP };
// A MenuSub flyout pinned to the inline-end (right, LTR) of its row.
const FLYOUT_ANCHOR: StyleProp = { position: 'absolute', top: 0, left: '100%', marginLeft: MENU_GAP };

// ---- Menu --------------------------------------------------------------------

export interface MenuProps {
  /** The element that toggles the menu. Its press is wired up. */
  trigger: ReactElement;
  /**
   * Where to place the menu relative to the trigger. Accepted for web parity;
   * native approximates to below/inline-start (no flip/clamp — see the header).
   */
  placement?: Placement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Accessible label for the menu. */
  'aria-label'?: string;
  /** Web-only escape hatch; accepted for parity and ignored on native. */
  className?: string;
  children?: ReactNode;
}

/**
 * A dropdown list of actions anchored to a trigger, rendered with React Native
 * primitives. See the file header for the anchored-overlay parity contract; the
 * resting open panel is visually identical to @glacier/react's Menu.
 */
export function Menu({
  trigger,
  placement: _placement = 'bottom-start',
  open,
  defaultOpen = false,
  onOpenChange,
  className: _className,
  children,
  'aria-label': ariaLabel,
}: MenuProps) {
  const [isOpen, setOpen] = useControlled({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });

  function close() {
    setOpen(false);
  }

  const triggerEl = cloneElement(trigger as ReactElement<Record<string, unknown>>, {
    'aria-haspopup': 'menu',
    'aria-expanded': isOpen,
    onPress: (event: unknown) => {
      (trigger.props as { onPress?: (event: unknown) => void }).onPress?.(event);
      setOpen(!isOpen);
    },
  });

  return (
    <MenuContext.Provider value={{ close, open: isOpen }}>
      <View style={{ position: 'relative', alignSelf: 'flex-start' }}>
        {triggerEl}
        {isOpen && (
          <MenuPanel anchor={BELOW_ANCHOR} label={ariaLabel}>
            {children}
          </MenuPanel>
        )}
      </View>
    </MenuContext.Provider>
  );
}

// ---- ContextMenu -------------------------------------------------------------

export interface ContextMenuProps {
  /** The menu content — MenuItem, MenuSub, MenuSeparator, MenuLabel rows. */
  content: ReactNode;
  onOpenChange?: (open: boolean) => void;
  /** Accessible label for the menu panel. */
  'aria-label'?: string;
  /**
   * Class for the portalled menu panel on the web; native has no owner and
   * accepts it as a noop.
   */
  menuClassName?: string;
  /** Web-only escape hatch on the target wrapper; accepted for parity, ignored. */
  className?: string;
  /** Style for the target wrapper View. */
  style?: StyleProp;
  children?: ReactNode;
}

/**
 * A menu summoned from a wrapped target. The web opens it on right-click or a
 * touch long-press at the pointer coordinates; native opens it on a long-press
 * and anchors it below the target (see the file header). Choosing an item, or a
 * second long-press, closes it.
 */
export function ContextMenu({
  content,
  onOpenChange,
  menuClassName: _menuClassName,
  className: _className,
  style,
  children,
  'aria-label': ariaLabel,
}: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  function setOpen(next: boolean) {
    setIsOpen(next);
    onOpenChange?.(next);
  }

  return (
    <MenuContext.Provider value={{ close: () => setOpen(false), open: isOpen }}>
      <View style={[{ position: 'relative', alignSelf: 'flex-start' }, style as never]}>
        <Pressable onLongPress={() => setOpen(!isOpen)}>{children}</Pressable>
        {isOpen && (
          <MenuPanel anchor={BELOW_ANCHOR} label={ariaLabel}>
            {content}
          </MenuPanel>
        )}
      </View>
    </MenuContext.Provider>
  );
}

// ---- MenuSub -----------------------------------------------------------------

// The trailing flyout chevron, matching the web SubChevron. Painted the spec's
// text-subtle role rather than currentColor so it resolves on-device too.
const SubChevron = (
  <Svg width={10} height={10} viewBox="0 0 10 10" fill="none" aria-hidden={true}>
    <Path
      d="M3.5 1.5 7 5 3.5 8.5"
      stroke={t('text-subtle')}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export interface MenuSubProps {
  /** The row's label. */
  label: ReactNode;
  /** Leading glyph. */
  icon?: ReactNode;
  /** Dims the row and keeps the flyout shut. */
  disabled?: boolean;
  /** Class for the flyout panel on the web; accepted for parity, ignored. */
  menuClassName?: string;
  /** Web-only escape hatch on the row; accepted for parity, ignored. */
  className?: string;
  /** Style for the row Pressable. */
  style?: StyleProp;
  /** The flyout content — MenuItem rows, separators, or deeper MenuSubs. */
  children?: ReactNode;
}

/**
 * A flyout submenu row inside a Menu or ContextMenu. Renders like a MenuItem
 * with a trailing chevron; pressing it toggles a flyout that pins inline-end of
 * the row (the web opens on hover/arrow — a device follow-up). Nests. The flyout
 * closes when its ancestor panel closes.
 */
export function MenuSub({
  label,
  icon,
  disabled = false,
  menuClassName: _menuClassName,
  className: _className,
  style,
  children,
}: MenuSubProps) {
  const ctx = useContext(MenuContext);
  const [isOpen, setIsOpen] = useState(false);
  const parentOpen = ctx?.open ?? true;

  // The flyout closes with its ancestor instead of lingering after the parent
  // panel drops, mirroring the web.
  useEffect(() => {
    if (!parentOpen) setIsOpen(false);
  }, [parentOpen]);

  return (
    <MenuContext.Provider value={{ close: ctx?.close ?? (() => setIsOpen(false)), open: parentOpen && isOpen }}>
      <View style={{ position: 'relative' }}>
        <Pressable
          accessibilityRole="menuitem"
          accessibilityState={{ disabled, expanded: isOpen }}
          disabled={disabled}
          onPress={() => {
            if (disabled) return;
            setIsOpen((o) => !o);
          }}
          style={({ pressed }) => [
            {
              flexDirection: 'row',
              alignItems: 'center',
              columnGap: t('space-3'),
              width: '100%',
              paddingVertical: t('space-2'),
              paddingHorizontal: t('space-3'),
              borderRadius: t('radius-md'),
              // The row keeps the hover fill while its flyout is open (the web
              // `aria-expanded` selector); native adds the pressed fill.
              backgroundColor: (isOpen || pressed) && !disabled ? HOVER_BG : 'transparent',
              opacity: disabled ? 0.5 : 1,
            },
            style as never,
          ]}
        >
          {icon && <View style={ICON_SLOT}>{icon}</View>}
          <Text numberOfLines={1} style={LABEL_TEXT}>
            {label}
          </Text>
          <View style={{ marginLeft: t('space-2') }}>{SubChevron}</View>
        </Pressable>
        {isOpen && parentOpen && (
          <MenuPanel anchor={FLYOUT_ANCHOR} label={typeof label === 'string' ? label : undefined}>
            {children}
          </MenuPanel>
        )}
      </View>
    </MenuContext.Provider>
  );
}

// ---- items -------------------------------------------------------------------

// Shared row geometry (matching Menu.module.css `.item`): a 1em icon slot in
// text-muted, an ellipsizing label at font-size-sm/leading-sm, and a text-subtle
// shortcut at font-size-xs. Glyph color of a caller-provided `icon` node is the
// caller's responsibility on native (a View cannot cascade `color` into an SVG).
const ICON_SLOT: StyleProp = {
  width: '1em',
  height: '1em',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
};
const LABEL_TEXT: StyleProp = {
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: 'auto',
  minWidth: 0,
  color: t('text'),
  fontSize: t('font-size-sm'),
  lineHeight: t('leading-sm') as never,
  fontFamily: t('font-sans'),
  textAlign: 'left',
};

export interface MenuItemProps {
  /** Leading glyph. */
  icon?: ReactNode;
  /** Trailing shortcut hint, e.g. a Kbd or "⌘C". */
  shortcut?: ReactNode;
  /** Paints the row in the danger tone. */
  danger?: boolean;
  /** Dims the row and blocks selection. */
  disabled?: boolean;
  /** Called when the item is chosen; the menu then closes. */
  onSelect?: () => void;
  /** Web-only escape hatch; accepted for parity and ignored on native. */
  className?: string;
  /** Style for the row Pressable. */
  style?: StyleProp;
  children?: ReactNode;
}

/** A single action row inside a Menu. */
export function MenuItem({
  icon,
  shortcut,
  danger = false,
  disabled = false,
  onSelect,
  className: _className,
  style,
  children,
}: MenuItemProps) {
  const ctx = useContext(MenuContext);
  return (
    <Pressable
      accessibilityRole="menuitem"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        if (disabled) return;
        onSelect?.();
        ctx?.close();
      }}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          columnGap: t('space-3'),
          width: '100%',
          paddingVertical: t('space-2'),
          paddingHorizontal: t('space-3'),
          borderRadius: t('radius-md'),
          // The hover/focus wash lands on the pressed state here; danger rows use
          // the danger-soft fill.
          backgroundColor: pressed && !disabled ? (danger ? DANGER_HOVER : HOVER_BG) : 'transparent',
          opacity: disabled ? 0.5 : 1,
        },
        style as never,
      ]}
    >
      {icon && <View style={ICON_SLOT}>{icon}</View>}
      <Text numberOfLines={1} style={[LABEL_TEXT, danger ? { color: DANGER_TEXT } : null]}>
        {children}
      </Text>
      {shortcut != null &&
        (typeof shortcut === 'string' ? (
          <Text
            style={{
              marginLeft: t('space-4'),
              color: t('text-subtle'),
              fontSize: t('font-size-xs'),
              fontFamily: t('font-sans'),
            }}
          >
            {shortcut}
          </Text>
        ) : (
          <View style={{ marginLeft: t('space-4') }}>{shortcut}</View>
        ))}
    </Pressable>
  );
}

/** A divider between groups of items. */
export function MenuSeparator({ className: _className }: { className?: string }) {
  return (
    <View
      accessibilityRole="none"
      style={{
        height: t('hairline'),
        marginVertical: t('space-1'),
        marginHorizontal: t('space-2'),
        backgroundColor: t('border-subtle'),
      }}
    />
  );
}

/** A non-interactive section heading inside a Menu. */
export function MenuLabel({ className: _className, children }: { className?: string; children?: ReactNode }) {
  return (
    <View style={{ paddingVertical: t('space-1'), paddingHorizontal: t('space-3') }}>
      <Text
        style={{
          color: t('text-subtle'),
          fontSize: t('font-size-xs'),
          fontWeight: t('font-weight-semibold') as never,
          fontFamily: t('font-sans'),
          letterSpacing: 0.04 as never,
          textTransform: 'uppercase',
        }}
      >
        {children}
      </Text>
    </View>
  );
}
