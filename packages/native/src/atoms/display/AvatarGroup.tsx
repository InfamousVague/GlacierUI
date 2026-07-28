import { View, Text, type ViewProps } from 'react-native';
import { avatarSpec, type ComponentSpec } from '@glacier/spec';
// TODO(integration): switch to '@glacier/spec' once avatar-group.ts is registered.
import { avatarGroupSpec } from '../../../../spec/src/components/avatar-group.ts';
import {
  avatarStack,
  avatarStackLabels,
  clampOverlap,
  splitStack,
  stackDepth,
  stackLabel,
  type AvatarStackDirection,
  type AvatarStackLabels,
} from '@glacier/logic';
import { t } from '../../tokens.ts';
import { paintFor, sizeFor, dimensionsFor } from '../../resolve.ts';
import { Avatar, type AvatarShape, type AvatarSize } from './Avatar.tsx';

export type { AvatarStackDirection, AvatarStackLabels };

/** One person in a stack. The same shape a ReadReceiptStack takes. */
export interface AvatarStackItem {
  name?: string;
  src?: string;
  alt?: string;
}

export interface AvatarGroupProps extends Omit<ViewProps, 'children' | 'style'> {
  /** The roster, in the order it should read. */
  avatars: readonly AvatarStackItem[];
  /**
   * How many avatars are drawn. The count chip is extra rather than the last
   * slot, so a roster of exactly `max` shows every face and no chip.
   */
  max?: number;
  size?: AvatarSize;
  shape?: AvatarShape;
  /** How much of a diameter each avatar covers of the one before it. */
  overlap?: number;
  /** Which end of the stack paints on top. */
  direction?: AvatarStackDirection;
  /** Draws a surface-coloured ring around each avatar so overlapping edges separate. */
  ring?: boolean;
  /** Accessible name for the group; defaults to naming everyone it shows. */
  label?: string;
  /** Overrides the English strings the group builds for itself. */
  labels?: Partial<AvatarStackLabels>;
  /** Renders placeholders with the exact stack geometry. */
  skeleton?: boolean;
}

const GROUP_DIMS = dimensionsFor(avatarGroupSpec);
// The count chip's fill and the per-avatar ring, straight from the spec.
const COUNT = paintFor(avatarGroupSpec, 'states', 'overflow');
const RING = paintFor(avatarGroupSpec, 'states', 'ring');

/**
 * Reads a measurement off the avatar spec. The stack's geometry is entirely the
 * Avatar's — its diameter drives the overlap, the ring, and the count chip — so
 * it is resolved from the avatar spec rather than restated here.
 */
function avatarMetric(spec: ComponentSpec, size: string, metric: string, fallback: string): string {
  return t(sizeFor(spec, size)[metric] ?? fallback);
}

/**
 * The Glacier AvatarGroup, rendered with React Native primitives.
 *
 * The cap, the overflow count, and the paint order all come from
 * @glacier/logic — the same `splitStack` and `stackDepth` the DOM kit calls —
 * so the two cannot disagree about when a fifth person becomes "+1" or which
 * face sits on top. The overlap is a fraction of a diameter rather than a
 * length, which is what lets one number hold across all four avatar steps.
 */
export function AvatarGroup({
  avatars,
  max = avatarStack.max,
  size = 'md',
  shape = 'circle',
  overlap = avatarStack.overlap,
  direction = 'first-on-top',
  ring = true,
  label,
  labels,
  skeleton = false,
  ...rest
}: AvatarGroupProps) {
  const { shown, overflow } = splitStack(avatars, max);
  const text = { ...avatarStackLabels, ...labels };

  const diameter = avatarMetric(avatarSpec, size, 'diameter', 'size-2xl');
  const fontSize = avatarMetric(avatarSpec, size, 'fontSize', 'font-size-sm');
  // circle takes the spec's radius-full; a rounded square takes radius-md,
  // matching how Avatar itself resolves its corners.
  const radius = shape === 'circle' ? t(GROUP_DIMS.radius ?? 'radius-full') : t('radius-md');
  const pull = `calc(${diameter} * -${clampOverlap(overlap)})`;
  const ringPad = ring ? `calc(${diameter} * ${avatarStack.ring})` : 0;

  // Slots, not people: the count chip stacks in the same order as the faces.
  const slots = shown.length + (overflow > 0 ? 1 : 0);
  const slotStyle = (index: number) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexShrink: 0,
    zIndex: stackDepth(index, slots, direction),
    marginLeft: index === 0 ? 0 : pull,
    padding: ringPad,
    borderRadius: radius,
    backgroundColor: ring ? t(RING.ring ?? 'surface') : 'transparent',
  });

  const groupLabel =
    label ?? stackLabel(shown.map((person) => person.name ?? ''), overflow, text.more);

  return (
    <View
      accessibilityRole="group"
      accessibilityLabel={skeleton ? undefined : groupLabel}
      aria-hidden={skeleton ? true : undefined}
      style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' }}
      {...rest}
    >
      {shown.map((person, index) => (
        // Each face is decorative: the group's name already carries the roster.
        <View key={index} aria-hidden={true} style={slotStyle(index)}>
          <Avatar src={person.src} alt={person.alt} name={person.name} size={size} shape={shape} skeleton={skeleton} />
        </View>
      ))}
      {overflow > 0 && (
        // The group's own name already ends in "2 more"; labelling the chip as
        // well would announce the count twice.
        <View aria-hidden={true} style={slotStyle(shown.length)}>
          <View
            style={{
              width: diameter,
              height: diameter,
              borderRadius: radius,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: t(skeleton ? 'hover' : (COUNT.background ?? 'hover')),
            }}
          >
            {!skeleton && (
              <Text
                style={{
                  color: t(COUNT.text ?? 'text-muted'),
                  fontSize,
                  fontFamily: t('font-sans'),
                  fontWeight: t('font-weight-semibold') as never,
                }}
              >
                +{overflow}
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
