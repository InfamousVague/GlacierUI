import { Kbd, SearchField } from '@perfect/react';
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';

export interface DocSearchItem {
  id: string;
  title: string;
  group: string;
}

interface DocSearchProps {
  items: DocSearchItem[];
  onSelect: (id: string) => void;
}

const MAX_RESULTS = 8;

/**
 * A combobox that searches the doc pages. The results list portals to the body
 * so it escapes the toolbar's rounded, clipping card. Arrow keys move the
 * highlight, Enter opens, Escape closes, and Cmd/Ctrl+K focuses the field.
 */
export function DocSearch({ items, onSelect }: DocSearchProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [rect, setRect] = useState<{ left: number; top: number; width: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = q ? items.filter((i) => `${i.title} ${i.group}`.toLowerCase().includes(q)) : items;
    return pool.slice(0, MAX_RESULTS);
  }, [items, query]);

  useEffect(() => setActive(0), [query]);

  // anchor the dropdown under the field, tracking scroll and resize
  useEffect(() => {
    if (!open) return;
    const el = wrapRef.current;
    const place = () => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect({ left: r.left, top: r.bottom + 6, width: r.width });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    const observer = el ? new ResizeObserver(place) : null;
    observer?.observe(el!);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      observer?.disconnect();
    };
  }, [open]);

  // close when a pointer lands outside the field and the list
  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (wrapRef.current?.contains(target)) return;
      if (target.closest('[data-docsearch-list]')) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  // Cmd/Ctrl+K focuses the search from anywhere
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        wrapRef.current?.querySelector('input')?.focus();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const blurInput = () => wrapRef.current?.querySelector('input')?.blur();

  const choose = (id: string) => {
    onSelect(id);
    setQuery('');
    setOpen(false);
    blurInput();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActive((a) => Math.max(a - 1, 0));
    } else if (event.key === 'Enter') {
      const result = results[active];
      if (result) {
        event.preventDefault();
        choose(result.id);
      }
    } else if (event.key === 'Escape') {
      // close the list but keep focus on the input, per the combobox pattern
      setOpen(false);
    }
  };

  return (
    <div className="docSearch" ref={wrapRef}>
      <SearchField
        glass
        value={query}
        onValueChange={(value) => {
          setQuery(value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search docs"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && results[active] ? `${listId}-${active}` : undefined}
        aria-label="Search documentation"
        shortcut={<Kbd>⌘K</Kbd>}
      />
      {open &&
        rect &&
        createPortal(
          <ul
            className="docSearchResults"
            id={listId}
            role="listbox"
            aria-label="Documentation pages"
            data-docsearch-list=""
            style={{ position: 'fixed', top: rect.top, left: rect.left, width: rect.width }}
          >
            {results.map((result, i) => (
              <li key={result.id} role="presentation">
                <button
                  type="button"
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  className="docSearchItem"
                  data-active={i === active || undefined}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    choose(result.id);
                  }}
                >
                  <span className="docSearchTitle">{result.title}</span>
                  <span className="docSearchGroup">{result.group}</span>
                </button>
              </li>
            ))}
            {results.length === 0 && (
              <li className="docSearchEmpty" role="presentation">
                No matches
              </li>
            )}
          </ul>,
          document.body,
        )}
    </div>
  );
}
