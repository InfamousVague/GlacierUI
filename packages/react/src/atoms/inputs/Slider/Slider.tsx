import { useRef, type ComponentProps, type CSSProperties } from 'react';
import { SkeletonVariant } from '@glacier/spec';
import { cx } from '../../../internal/cx.ts';
import { useControlled } from '../../../internal/useControlled.ts';
import { useField } from '../../../internal/FieldContext.ts';
import { useHaptics } from '../../../haptics/HapticsProvider.tsx';
import { Skeleton } from '../../feedback/Skeleton/Skeleton.tsx';
import styles from './Slider.module.css';

export interface SliderProps
  extends Omit<ComponentProps<'input'>, 'type' | 'value' | 'defaultValue' | 'onChange' | 'size'> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  /**
   * Lay the rail vertically, filling from the bottom (min) up - for volume and
   * the like. Set the track length with the `--slider-length` custom property.
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Percent of the min-max range between haptic ticks while dragging or keying:
   * a 'selection' tick fires each time the value crosses a bucket boundary, and
   * a 'medium' bump fires once when the value lands on min or max. Set 0 or a
   * negative number to disable the ticks (the edge bump stays).
   */
  hapticStep?: number;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  'aria-label'?: string;
  /** Set to "none" to opt this slider out of haptic feedback. */
  'data-haptic'?: string;
}

/**
 * A styled native range input with a filled leading track and an iOS-style
 * thumb. Native semantics come free: arrow keys nudge by step, Home and End
 * jump to the ends, and screen readers read the value. Pass
 * orientation="vertical" to stand the rail up for volume-style controls.
 */
export function Slider({
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  orientation = 'horizontal',
  hapticStep = 10,
  skeleton = false,
  disabled,
  className,
  style,
  id,
  ...rest
}: SliderProps) {
  const field = useField();
  const fire = useHaptics();
  const [current, setCurrent] = useControlled(value, defaultValue ?? min);
  const fill = max === min ? 0 : ((current - min) / (max - min)) * 100;
  const vertical = orientation === 'vertical';

  // Haptic bookkeeping, touched only from the user-driven change path below so
  // prop-driven re-renders never buzz. lastBucket holds the last tick bucket
  // (Math.floor(percent / hapticStep)); edgeFired arms the min/max bump.
  const lastBucketRef = useRef<number | null>(null);
  const edgeFiredRef = useRef(false);

  const fireValueHaptics = (next: number) => {
    if (rest['data-haptic'] === 'none') return;
    const range = max - min;
    if (range <= 0) return;
    const bucketOf = (v: number) =>
      hapticStep > 0 ? Math.floor((((v - min) / range) * 100) / hapticStep) : null;
    const atEdge = next === min || next === max;
    if (atEdge) {
      // Landing on an end gets one 'medium' bump (no 'selection' tick on top of
      // it); the bump re-arms once the value leaves the edge.
      lastBucketRef.current = bucketOf(next);
      if (!edgeFiredRef.current) {
        edgeFiredRef.current = true;
        fire('medium');
      }
      return;
    }
    edgeFiredRef.current = false;
    if (hapticStep <= 0) return;
    const bucket = bucketOf(next);
    // First user change: seed from the pre-change value so a move inside the
    // starting bucket stays silent.
    if (lastBucketRef.current === null) lastBucketRef.current = bucketOf(current);
    if (bucket !== lastBucketRef.current) {
      lastBucketRef.current = bucket;
      fire('selection');
    }
  };

  if (skeleton) {
    // The track bone with the thumb bone riding it at the midpoint, sized like
    // the real control (thumb diameter on the cross axis) so loading never
    // shifts layout.
    return (
      <span
        className={cx(styles.skeletonWrap, className)}
        data-vertical={vertical || undefined}
        style={style}
        aria-hidden="true"
      >
        <Skeleton
          width={vertical ? '0.375rem' : '100%'}
          height={vertical ? '100%' : '0.375rem'}
          radius="var(--glacier-radius-full)"
        />
        <Skeleton variant={SkeletonVariant.Circle} width="1.25rem" className={styles.skeletonThumb} />
      </span>
    );
  }

  const input = (
    <input
      type="range"
      id={id ?? field?.id}
      aria-describedby={field?.describedBy}
      aria-orientation={vertical ? 'vertical' : undefined}
      min={min}
      max={max}
      step={step}
      value={current}
      disabled={disabled}
      onChange={(event) => {
        const next = Number(event.target.value);
        fireValueHaptics(next);
        setCurrent(next);
        onValueChange?.(next);
      }}
      className={cx(styles.slider, !vertical && className)}
      style={{ '--slider-fill': `${fill}%`, ...(vertical ? undefined : style) } as CSSProperties}
      {...rest}
    />
  );

  if (!vertical) return input;

  // A wrapper establishes the vertical footprint; the input is rotated inside it
  // (see the CSS) so the rail, fill, and thumb styles carry over untouched.
  return (
    <span className={cx(styles.vertical, className)} style={style}>
      {input}
    </span>
  );
}
