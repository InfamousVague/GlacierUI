import { Kbd, useT } from '@glacier/react';
import { m } from './i18n.ts';

interface DocSearchTriggerProps {
  onOpen: () => void;
}

/**
 * The toolbar's search affordance.
 *
 * It looks like a field but is a button, because that is what it now is: the
 * actual searching happens in the kit's CommandPalette, which owns the ⌘K chord
 * and opens over the page. Keeping the field shape preserves the thing people
 * scan the toolbar for — a search box — while the ⌘K hint says how to reach it
 * without the mouse.
 *
 * A read-only input would have been the other way to keep the shape, but it
 * would take focus, show a caret, and accept typing that goes nowhere. A button
 * announces itself as a button and does exactly one thing.
 */
export function DocSearchTrigger({ onOpen }: DocSearchTriggerProps) {
  const t = useT();

  return (
    <button type="button" className="docSearch docSearchTrigger" onClick={onOpen}>
      <svg
        className="docSearchTriggerIcon"
        aria-hidden="true"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="docSearchTriggerLabel">{t(m.searchPlaceholder)}</span>
      <Kbd glass>⌘K</Kbd>
    </button>
  );
}
