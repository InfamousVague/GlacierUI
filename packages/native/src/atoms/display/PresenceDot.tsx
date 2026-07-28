import { View, type ViewProps } from 'react-native';
// TODO(integration): switch to '@glacier/spec' once presence-dot.ts is registered.
import { presenceDotSpec } from '../../../../spec/src/components/presence-dot.ts';
import {
  presenceLabel,
  presenceMark,
  presenceShape,
  type PresenceLabels,
  type PresenceStatus,
} from '@glacier/logic';
import { t } from '../../tokens.ts';
import { paintFor, sizeFor, dimensionsFor } from '../../resolve.ts';

export type { PresenceStatus, PresenceLabels };

export type PresenceDotSize = 'sm' | 'md';

export interface PresenceDotProps extends Omit<ViewProps, 'children' | 'style'> {
  /** Which of the five reachability states the dot reports. */
  status?: PresenceStatus;
  size?: PresenceDotSize;
  /** Draws a surface-coloured halo behind the dot, for pinning it to an avatar. */
  ring?: boolean;
  /** Overrides the text alternative; defaults to the status's own name. */
  label?: string;
  /**
   * Hides the dot from assistive tech. Only for a row whose visible text already
   * states the presence — otherwise the dot becomes colour-only.
   */
  decorative?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Overrides the English status names; merged over the shared defaults. */
  labels?: Partial<PresenceLabels>;
}

// Size-independent box metric (radius) read once from the spec.
const BOX = dimensionsFor(presenceDotSpec);

/**
 * The Glacier PresenceDot, rendered with React Native primitives.
 *
 * Every colour comes from the presence-dot spec through the shared resolvers,
 * and every proportion of the mark inside from @glacier/logic, so a crescent
 * here is the same crescent the DOM kit draws and neither can be nudged without
 * the other following. Only the multiplication is per-platform: the DOM
 * multiplies a diameter with CSS `calc`, and so does this, because a token is a
 * custom property on both until a device build resolves the map.
 *
 * Like the web kit the dot speaks by default (role image + a label naming the
 * status) and `decorative` is the only way to silence it, because presence that
 * is colour-only is presence a third of readers cannot use.
 */
export function PresenceDot({
  status = 'offline',
  size = 'md',
  ring = false,
  label,
  decorative = false,
  skeleton = false,
  labels,
  ...rest
}: PresenceDotProps) {
  const dims = sizeFor(presenceDotSpec, size);
  const diameter = t(dims.diameter ?? 'size-sm');
  const radius = t(BOX.radius ?? 'radius-full');
  const paint = paintFor(presenceDotSpec, 'tones', status);
  const shape = presenceShape(status);

  // The tone's own contrast colour paints the mark, so it never depends on
  // whatever the dot happens to be sitting on.
  const markColor = t(paint.text ?? 'text-subtle');
  const hollow = paint.background === undefined;

  const box = {
    width: diameter,
    height: diameter,
    borderRadius: radius,
    position: 'relative' as const,
    // The crescent is a circle that overhangs the disc; clipping is what turns
    // it into a bite rather than a bump.
    overflow: 'hidden' as const,
    backgroundColor: hollow ? 'transparent' : t(paint.background ?? 'text-subtle'),
    borderStyle: 'solid' as const,
    borderWidth: hollow ? `calc(${diameter} * ${presenceMark.ringStroke})` : 0,
    borderColor: hollow ? t(paint.border ?? 'text-subtle') : 'transparent',
  };

  // Centred by auto margins rather than a transform: the one centring recipe a
  // stylesheet and Yoga express the same way.
  const centred = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0, margin: 'auto' };

  const dot = skeleton ? (
    // Resting placeholder at the exact geometry; the web shimmer is a device
    // follow-up (no animation runtime here).
    <View
      aria-hidden={true}
      style={{ width: diameter, height: diameter, borderRadius: radius, backgroundColor: t('hover') }}
      {...rest}
    />
  ) : (
    <View
      // "image", not "status": a member list holds dozens of these, and dozens
      // of live regions would announce a roster every time anyone signed in.
      accessibilityRole={decorative ? undefined : 'image'}
      accessibilityLabel={decorative ? undefined : (label ?? presenceLabel(status, labels))}
      aria-hidden={decorative ? true : undefined}
      style={box}
      {...rest}
    >
      {shape === 'crescent' && (
        <View
          style={{
            position: 'absolute',
            width: `${presenceMark.crescent * 100}%`,
            height: `${presenceMark.crescent * 100}%`,
            top: `calc(${diameter} * ${presenceMark.crescentInset})`,
            right: `calc(${diameter} * ${presenceMark.crescentInset})`,
            borderRadius: radius,
            backgroundColor: markColor,
          }}
        />
      )}
      {shape === 'bar' && (
        <View
          style={{
            ...centred,
            width: `${presenceMark.barWidth * 100}%`,
            height: `${presenceMark.barHeight * 100}%`,
            borderRadius: radius,
            backgroundColor: markColor,
          }}
        />
      )}
      {shape === 'ring-dot' && (
        <View
          style={{
            ...centred,
            width: `${presenceMark.core * 100}%`,
            height: `${presenceMark.core * 100}%`,
            borderRadius: radius,
            backgroundColor: markColor,
          }}
        />
      )}
    </View>
  );

  if (!ring) return dot;

  // The halo is a pad behind the dot rather than an outline on it: an outline
  // has no device equivalent, and a pad renders identically on both platforms.
  return (
    <View
      aria-hidden={decorative ? true : undefined}
      style={{
        alignSelf: 'flex-start',
        padding: `calc(${diameter} * ${presenceMark.halo})`,
        borderRadius: radius,
        backgroundColor: t(paintFor(presenceDotSpec, 'states', 'ring').halo ?? 'surface'),
      }}
    >
      {dot}
    </View>
  );
}
