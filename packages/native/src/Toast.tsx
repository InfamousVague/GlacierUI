/**
 * @glacier/native — Toast.
 *
 * The React Native binding of @glacier/react's Toast: a spec-driven notification
 * pill in five tones (plus a frosted glass material) with an optional leading
 * icon and a trailing dismiss control, together with the ToastProvider/useToast
 * imperative layer that shows one latest-wins toast at a time and auto-dismisses
 * it by tone.
 *
 * Paint (per-tone soft surface, hairline tone border, tone text) and geometry
 * (radius-full, the space gap/padding, the dismiss size, the viewport inset and
 * font size) are read from toastSpec through the shared resolvers, so the pill
 * stays pixel-identical to the web kit and cannot drift from it. Text color and
 * font size live on <Text>; a leading icon arrives as a ReactNode and is wrapped
 * in a View carrying the tone color so a currentColor glyph picks it up on
 * react-native-web.
 *
 * The queue/timer logic in ToastProvider is renderer-agnostic React and is
 * ported verbatim from the web (single current toast, latest wins, per-tone
 * auto-dismiss). Instead of createPortal into document.body it draws the current
 * toast in an absolutely-positioned overlay View pinned to the bottom center
 * (pointerEvents box-none so the page stays interactive). Web-parity notes,
 * resting visuals only: the enter/exit spring, swipe-to-dismiss, and a real
 * RN Modal/portal are device follow-ups; the pill's shadow-4 float and the glass
 * backdrop blur/saturate are web-only material effects with no on-device
 * equivalent and are dropped; the dismiss-hover opacity lift is web-only; and
 * `className` is kept for prop parity with the web component but has no effect.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { View, Text, Pressable, type ViewProps } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { toastTones, toastSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { paintStyle, dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

// Derived from the spec so the tone union cannot drift from the web kit.
export type ToastTone = (typeof toastTones)[number];

/** Per-tone auto-dismiss defaults, in milliseconds (matches the web kit). */
const TONE_DURATION: Record<ToastTone, number> = {
  neutral: 4500,
  info: 4500,
  success: 3500,
  warning: 4500,
  danger: 7000,
};

// Size-independent box + type metrics read once from the toast spec (radius,
// gap, border, padding, dismiss size/gap, viewport insets, max width, font
// size), so the pill cannot drift from Toast.module.css.
const DIMS = dimensionsFor(toastSpec);

/**
 * A resolved measurement value. Bare token names (e.g. `space-3`) get wrapped in
 * the custom property; a raw CSS length (the dismiss `1.25rem`, the `28rem` max
 * width, the skeleton sizes) — anything starting with a digit or dot — passes
 * straight through so it never becomes `var(--glacier-1.25rem)`.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

/**
 * The pill paint for one tone. The tone's structured paint gives the soft
 * background, hairline border, and text color; `glass` overrides the surface
 * with the frosted tint and lifts the text to full-strength `text` (matching the
 * web `.glass` rule, which wins over the tone class by source order).
 */
function toastPaint(tone: ToastTone, glass: boolean) {
  if (glass) {
    return {
      backgroundColor: t('glass-regular'),
      borderColor: t('glass-border'),
      color: t('text'),
    };
  }
  const p = paintStyle(toastSpec, 'tones', tone);
  return {
    backgroundColor: p.backgroundColor as string,
    borderColor: p.borderColor as string,
    color: p.color as string,
  };
}

export interface ToastProps {
  tone?: ToastTone;
  /** The notification content. */
  message: ReactNode;
  /** Optional leading glyph. */
  icon?: ReactNode;
  /** Whether a trailing close control is shown. */
  dismissible?: boolean;
  /** Called when the pill or its dismiss control is pressed. */
  onDismiss?: () => void;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Web-only class hook; accepted for prop parity, no effect on native. */
  className?: string;
  /** Native style override, merged after the pill's own style. */
  style?: ViewProps['style'];
}

/**
 * The visual toast pill. Rendered on its own it is a static notification; the
 * ToastProvider wraps it in the overlay layer. A danger toast announces as an
 * alert, every other tone as a status. The whole pill is pressable to dismiss,
 * matching the web where the pill div has onClick={onDismiss}.
 */
export function Toast({
  tone = 'neutral',
  message,
  icon,
  dismissible = true,
  onDismiss,
  glass = false,
  skeleton = false,
  style,
}: ToastProps) {
  if (skeleton) {
    return (
      <Skeleton
        width={metric(DIMS.skeletonWidth, '18rem')}
        height={metric(DIMS.skeletonHeight, '2.75rem')}
        radius={metric(DIMS.radius, 'radius-full')}
      />
    );
  }

  const alert = tone === 'danger';
  const paint = toastPaint(tone, glass);

  return (
    <Pressable
      accessibilityRole={alert ? 'alert' : 'status'}
      onPress={onDismiss}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          columnGap: metric(DIMS.gap, 'space-3'),
          maxWidth: metric(DIMS.maxWidth, '28rem'),
          borderRadius: metric(DIMS.radius, 'radius-full'),
          borderWidth: metric(DIMS.border, 'hairline'),
          borderStyle: 'solid',
          borderColor: paint.borderColor,
          backgroundColor: paint.backgroundColor,
          paddingHorizontal: metric(DIMS.paddingInline, 'space-5'),
          paddingVertical: metric(DIMS.paddingBlock, 'space-3'),
        },
        style as never,
      ]}
    >
      {icon != null && (
        <View
          style={{
            // flex: none — the glyph never shrinks; `color` is the currentColor
            // source for an SVG glyph on react-native-web, matching `.icon`.
            flexShrink: 0,
            flexDirection: 'row',
            alignItems: 'center',
            color: paint.color,
          }}
        >
          {icon}
        </View>
      )}
      <Text
        style={{
          // min-width:0 + shrink lets the message wrap instead of overflowing,
          // matching the web `.message { min-width: 0 }`.
          flexShrink: 1,
          minWidth: 0,
          color: paint.color,
          fontSize: metric(DIMS.fontSize, 'font-size-sm'),
          lineHeight: t('leading-md') as never,
          fontFamily: t('font-sans'),
          fontWeight: t('font-weight-medium') as never,
          textAlign: 'left',
        }}
      >
        {message}
      </Text>
      {dismissible && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          onPress={onDismiss}
          style={{
            flexShrink: 0,
            width: metric(DIMS.dismissSize, '1.25rem'),
            height: metric(DIMS.dismissSize, '1.25rem'),
            marginLeft: metric(DIMS.dismissGap, 'space-2'),
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: metric(DIMS.radius, 'radius-full'),
            // Resting opacity 0.6; the web hover lift to 1 is a web-only
            // affordance with no resting equivalent.
            opacity: 0.6,
          }}
        >
          {/* Matches the web DismissIcon; currentColor resolves to the pill's
              tone text color, so the stroke is pinned to that. */}
          <Svg width={12} height={12} viewBox="0 0 14 14" fill="none">
            <Path
              d="M3 3l8 8M11 3l-8 8"
              stroke={paint.color}
              strokeWidth={1.75}
              strokeLinecap="round"
            />
          </Svg>
        </Pressable>
      )}
    </Pressable>
  );
}

export interface ToastOptions {
  tone?: ToastTone;
  message: ReactNode;
  icon?: ReactNode;
  /** Auto-dismiss delay in milliseconds; defaults by tone, 0 disables auto-dismiss. */
  duration?: number;
  /** Whether a trailing close control is shown. */
  dismissible?: boolean;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
}

interface CurrentToast extends ToastOptions {
  /** Bumped on every call so the overlay swaps the pill on replace. */
  id: number;
}

export interface ToastContextValue {
  /** Show a toast, replacing any current one (latest wins, no queue). */
  toast: (options: ToastOptions) => void;
  /** Dismiss the current toast, if any. */
  dismiss: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Holds the single current toast, draws it in an absolutely-positioned overlay
 * View pinned to the bottom center, and runs the auto-dismiss timer. A new toast
 * replaces the current one immediately: this is a deliberate latest-wins,
 * no-queue design, ported verbatim from the web (the add/dismiss/timeout logic
 * is renderer-agnostic React). The overlay ignores pointer events except on the
 * pill, so the page stays interactive.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<CurrentToast | null>(null);
  const nextId = useRef(0);

  const dismiss = useCallback(() => setCurrent(null), []);

  const toast = useCallback((options: ToastOptions) => {
    nextId.current += 1;
    setCurrent({ ...options, id: nextId.current });
  }, []);

  // Auto-dismiss the current toast; re-arms whenever it is replaced.
  useEffect(() => {
    if (!current) return;
    const tone = current.tone ?? 'neutral';
    const duration = current.duration ?? TONE_DURATION[tone] ?? 0;
    if (duration <= 0) return;
    const shownId = current.id;
    const timer = setTimeout(() => {
      // only clear if this toast is still the one on screen
      setCurrent((c) => (c && c.id === shownId ? null : c));
    }, duration);
    return () => clearTimeout(timer);
  }, [current]);

  const value = useMemo<ToastContextValue>(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {current && (
        <View
          // box-none: the overlay itself never captures touches (they fall
          // through to the page), but the pill inside stays interactive —
          // matching the web `.viewport { pointer-events: none }` +
          // `.pill { pointer-events: auto }`.
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 200,
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingBottom: metric(DIMS.viewportInset, 'space-6'),
            paddingHorizontal: metric(DIMS.viewportPaddingInline, 'space-4'),
          }}
        >
          <View style={{ maxWidth: metric(DIMS.maxWidth, '28rem'), alignSelf: 'center' }}>
            <Toast
              tone={current.tone}
              message={current.message}
              icon={current.icon}
              dismissible={current.dismissible}
              glass={current.glass}
              onDismiss={dismiss}
            />
          </View>
        </View>
      )}
    </ToastContext.Provider>
  );
}

/**
 * Returns the imperative toast controls. Must be called under a ToastProvider.
 * `toast({ tone, message, icon?, duration?, dismissible?, glass? })` replaces the
 * current toast; `dismiss()` clears it.
 */
export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return value;
}
