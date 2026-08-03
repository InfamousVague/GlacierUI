import { cardFanSpec, Size } from '@glacier/spec';
import {
  fanMagnify,
  fanPlacements,
  fanSlinky,
  focusFromTrack,
  restFocus,
  useControlled,
} from '@glacier/logic';
import { useId, useRef, useState, type ComponentProps, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../i18n/messages.ts';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import styles from './CardFan.module.css';

export type CardFanSize = 'sm' | 'md' | 'lg';

/** The minimum a fan needs to identify and render one card. */
export interface CardFanItem {
  id: string;
}

export interface CardFanProps<T extends CardFanItem = CardFanItem>
  extends Omit<ComponentProps<'ul'>, 'onSelect' | 'children'> {
  /** The cards, in the order they sit along the fan. */
  items: T[];
  /** Renders one card's body. The placement and magnification are the fan's. */
  renderItem: (item: T, index: number) => ReactNode;
  /** The name announced for a card; its id is rarely what a person wants read. */
  getLabel?: (item: T) => string;
  /** Controlled selection, by id. */
  selected?: string;
  defaultSelected?: string;
  onSelect?: (id: string) => void;
  size?: CardFanSize;
  /** Multiplies the lean and the bow. 0 lays the fan flat into a row. */
  spread?: number;
  /** Grows the card under the pointer and its near neighbours. */
  magnify?: boolean;
  disabled?: boolean;
  skeleton?: boolean;
}

const DIMS = cardFanSpec.dimensions ?? {};
const WIDTHS: Record<CardFanSize, string> = {
  sm: (DIMS.widthSm as string) ?? '5rem',
  md: (DIMS.widthMd as string) ?? '8.25rem',
  lg: (DIMS.widthLg as string) ?? '11rem',
};

/**
 * A hand of cards spread along a fixed arc.
 *
 * The spread is a slinky rather than an even step, which is what lets one
 * component hold seven cards or forty in the same strip: the track is a fixed
 * length and the cards are distributed across it by weight, so focusing one
 * opens the fan around it while the rest compress. The ends stay pinned, so the
 * silhouette never moves and the fan cannot overflow. All of that arithmetic is
 * in @glacier/logic, so the native fan lays out identically.
 *
 * Placement is a track position, not a transform — the two are kept apart so the
 * transform stays free for the lean, the lift and any drag the caller adds. It
 * also means a pointer sweeping a forty-card fan reshapes it by writing one
 * custom property per card, without re-rendering forty cards a frame.
 */
export function CardFan<T extends CardFanItem = CardFanItem>({
  items,
  renderItem,
  getLabel,
  selected: selectedProp,
  defaultSelected,
  onSelect,
  size = 'md',
  spread = 1,
  magnify = true,
  disabled = false,
  skeleton = false,
  className,
  ...rest
}: CardFanProps<T>) {
  const t = useT();
  const listId = useId();
  const trackRef = useRef<HTMLUListElement>(null);

  const [selected, setSelected] = useControlled<string | undefined>({
    value: selectedProp,
    defaultValue: defaultSelected,
    onChange: onSelect as ((value: string | undefined) => void) | undefined,
  });

  // Which card the fan is opening around. Null is rest — an evenly weighted
  // spread — and a number is a fractional index, so a pointer sliding across
  // moves the bulge continuously instead of snapping card to card.
  const [focus, setFocus] = useState<number | null>(null);

  // The card the arrows are on, kept apart from the selection: moving through a
  // fan should not choose a card on every keystroke.
  const [cursor, setCursor] = useState(0);

  const count = items.length;
  const width = WIDTHS[size];
  const placements = fanPlacements(count, focus, parseFloat(width) * 16, fanSlinky(count));

  const onPointerMove = (event: { clientX: number }) => {
    const el = trackRef.current;
    if (!el || disabled) return;
    const rect = el.getBoundingClientRect();
    setFocus(focusFromTrack(event.clientX - rect.left, rect.width, count));
  };

  const moveCursor = (next: number) => {
    const clamped = Math.max(0, Math.min(count - 1, next));
    setCursor(clamped);
    // The fan opens around the keyboard too: the spread is what makes a large
    // fan legible, so it cannot be a pointer-only affordance.
    setFocus(clamped);
    requestAnimationFrame(() => {
      trackRef.current?.querySelector<HTMLElement>(`[data-index="${clamped}"]`)?.focus();
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLLIElement>, index: number) => {
    if (disabled) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveCursor(index + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveCursor(index - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      moveCursor(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      moveCursor(count - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setSelected(items[index]?.id);
    }
  };

  if (skeleton) {
    const bones = fanPlacements(Math.max(count, 5), null, parseFloat(width) * 16, fanSlinky(Math.max(count, 5)));
    return (
      <div className={cx(styles.root, styles[size], className)} style={{ ['--fan-width' as string]: width }}>
        {/* The exact placements, so nothing reshapes when the real cards land. */}
        <ul className={styles.fan} aria-hidden="true">
          {bones.map((placement, index) => (
            <li
              key={index}
              className={styles.item}
              style={{
                ['--slink' as string]: placement.offset,
                ['--fan-lift' as string]: `${placement.lift * spread}px`,
                ['--fan-rotate' as string]: `${placement.rotate * spread}deg`,
              }}
            >
              <Skeleton width="100%" height="var(--fan-card-h)" radius="var(--glacier-radius-lg)" />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div
      className={cx(styles.root, styles[size], className)}
      data-disabled={disabled || undefined}
      style={{ ['--fan-width' as string]: width }}
    >
      <ul
        ref={trackRef}
        id={listId}
        role="listbox"
        aria-label={rest['aria-label'] ?? t(kitMessages.cardFan)}
        aria-orientation="horizontal"
        className={styles.fan}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setFocus(null)}
        {...rest}
      >
        {items.map((item, index) => {
          const placement = placements[index];
          if (!placement) return null;
          const isSelected = selected === item.id;
          const scale = magnify ? fanMagnify(index, focus) : 1;

          return (
            <li
              key={item.id}
              role="option"
              data-index={index}
              aria-selected={isSelected}
              aria-label={getLabel?.(item) ?? item.id}
              // Roving focus: one card is tabbable and the arrows move within,
              // so Tab leaves the fan rather than walking forty cards.
              tabIndex={disabled ? -1 : index === cursor ? 0 : -1}
              className={styles.item}
              data-selected={isSelected || undefined}
              style={{
                // Selection outranks the whole fan; otherwise the placement's
                // own order applies, which is index-based so cards overlap
                // consistently instead of leaving paint order to decide.
                zIndex: isSelected ? 100000 : placement.z,
                ['--slink' as string]: placement.offset,
                ['--fan-lift' as string]: `${placement.lift * spread}px`,
                ['--fan-rotate' as string]: `${placement.rotate * spread}deg`,
              }}
              onFocus={() => setCursor(index)}
              onClick={() => !disabled && setSelected(item.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              {/* The magnification raises this inner layer rather than the card
                  itself, so a card grows out of the fan without its footprint
                  moving — which would otherwise drag its neighbours with it. */}
              <div className={styles.lift} style={{ transform: `scale(${scale})` }}>
                {renderItem(item, index)}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** The resting focus, exported so a caller can pre-open a fan where it likes. */
export { restFocus as cardFanRestFocus };
