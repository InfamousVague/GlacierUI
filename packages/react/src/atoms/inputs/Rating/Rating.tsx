import { useId, useState, type ComponentProps } from 'react';
import { cx } from '../../../internal/cx.ts';
import { useControlled } from '../../../internal/useControlled.ts';
import { Skeleton } from '../../feedback/Skeleton/Skeleton.tsx';
import styles from './Rating.module.css';

// The lucide "star" glyph (lucide-react v1.x). One closed outline path: stroked
// for the empty state, filled for the fill overlay. Inlined rather than pulled
// from @glacier/icons so the kit stays free of the lucide dependency.
const STAR_PATH =
  'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z';

const STAR_STROKE = { strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

// A single star: the empty lucide outline with the filled lucide star clipped
// over it by `fill` (0–1), so a partial rating reads as a partially-filled star.
function StarCell({ fill }: { fill: number }) {
  const pct = Math.max(0, Math.min(1, fill)) * 100;
  return (
    <span className={styles.cell} aria-hidden="true">
      <svg viewBox="0 0 24 24" className={styles.starBase} {...STAR_STROKE}>
        <path d={STAR_PATH} />
      </svg>
      <span className={styles.fillWrap} style={{ width: `${pct}%` }}>
        <svg viewBox="0 0 24 24" className={styles.starFill} {...STAR_STROKE}>
          <path d={STAR_PATH} />
        </svg>
      </span>
    </span>
  );
}

export interface RatingProps extends Omit<ComponentProps<'span'>, 'onChange' | 'defaultValue' | 'role' | 'children'> {
  /** Controlled rating value, 0 to `max`. */
  value?: number;
  /** Initial value when uncontrolled. */
  defaultValue?: number;
  /** Number of stars. */
  max?: number;
  onChange?: (value: number) => void;
  /** Display-only: renders the stars (with fractional fill) but no controls. */
  readOnly?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Accessible name for the rating group. */
  'aria-label'?: string;
}

/**
 * A star rating. Interactive by default - a native radio group, so arrow keys
 * move between stars and the value participates in forms - or `readOnly` for a
 * display badge that supports fractional fill (e.g. a 4.3 average).
 */
export function Rating({
  value,
  defaultValue,
  max = 5,
  onChange,
  readOnly = false,
  disabled = false,
  size = 'md',
  skeleton = false,
  className,
  'aria-label': ariaLabel,
  ...rest
}: RatingProps) {
  const [current, setCurrent] = useControlled(value, defaultValue ?? 0);
  const [hover, setHover] = useState<number | null>(null);
  const name = useId();

  if (skeleton) {
    return <Skeleton width={`calc(${max} * 1.15em)`} height="1.15em" className={className} />;
  }

  const stars = Array.from({ length: max }, (_, i) => i + 1);

  if (readOnly) {
    return (
      <span
        className={cx(styles.rating, styles[size], styles.readonly, className)}
        role="img"
        aria-label={ariaLabel ?? `${current} of ${max}`}
        {...rest}
      >
        {stars.map((v) => (
          <StarCell key={v} fill={current - (v - 1)} />
        ))}
      </span>
    );
  }

  const set = (v: number) => {
    setCurrent(v);
    onChange?.(v);
  };
  const display = hover ?? current;

  return (
    <span
      className={cx(styles.rating, styles[size], disabled && styles.disabled, className)}
      {...rest}
      role="radiogroup"
      aria-label={ariaLabel}
      onMouseLeave={() => setHover(null)}
    >
      {stars.map((v) => (
        <label key={v} className={styles.star} onMouseEnter={() => !disabled && setHover(v)}>
          <input
            type="radio"
            className={styles.input}
            name={name}
            value={v}
            checked={current === v}
            disabled={disabled}
            aria-label={String(v)}
            onChange={() => set(v)}
            onFocus={() => setHover(v)}
            onBlur={() => setHover(null)}
          />
          <StarCell fill={display >= v ? 1 : 0} />
        </label>
      ))}
    </span>
  );
}
