import * as Icons from '@glacier/icons';
import { SearchField, Text, Heading, Size, TextTone } from '@glacier/react';
import { useMemo, useState, type ComponentType } from 'react';

type IconCmp = ComponentType<{ size?: number }>;

const NAMES = Icons.ICON_NAMES;
const REG = Icons as unknown as Record<string, IconCmp>;

/** kebab-case icon name -> lucide PascalCase component name. */
function pascal(kebab: string): string {
  return kebab
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/** Resolve an icon name to its component, tolerating the `2x2` -> `2X2` casing. */
function resolve(name: string): IconCmp | null {
  const base = pascal(name);
  return REG[base] ?? REG[base.replace(/(\d)x(\d)/, '$1X$2')] ?? null;
}

const Check = REG.Check;

/**
 * The kit's icon gallery - searchable, click-to-copy. It renders the 212-icon
 * set from @glacier/icons, which currently proxies lucide-react until the
 * generated originals land.
 */
export function IconsPage() {
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out: Array<{ name: string; Cmp: IconCmp }> = [];
    for (const name of NAMES) {
      if (q && !name.includes(q)) continue;
      const Cmp = resolve(name);
      if (Cmp) out.push({ name, Cmp });
    }
    return out;
  }, [query]);

  const copy = (name: string) => {
    void navigator.clipboard?.writeText(`<${pascal(name)} />`);
    setCopied(name);
    window.setTimeout(() => setCopied((current) => (current === name ? null : current)), 1200);
  };

  return (
    <>
      <Heading level={1}>Icons</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        The kit&apos;s {NAMES.length}-icon set. Size with <code>1em</code> or the <code>size</code> prop,
        colour with <code>currentColor</code> click any icon to copy its tag. Imported from{' '}
        <code>@glacier/icons</code>, which proxies lucide-react until the generated originals land.
      </Text>

      <div className="iconSearch">
        <SearchField
          value={query}
          onValueChange={setQuery}
          placeholder="Search icons"
          aria-label="Search icons"
        />
        <Text as="span" size={Size.Small} tone={TextTone.Subtle} mono>
          {items.length}
        </Text>
      </div>

      {items.length === 0 ? (
        <Text tone={TextTone.Muted}>No icons match “{query}”.</Text>
      ) : (
        <div className="iconGrid">
          {items.map(({ name, Cmp }) => (
            <button
              key={name}
              type="button"
              className="iconTile"
              data-copied={copied === name || undefined}
              onClick={() => copy(name)}
              title={`<${pascal(name)} />`}
            >
              <span className="iconTileGlyph" aria-hidden="true">
                {copied === name && Check ? <Check size={22} /> : <Cmp size={22} />}
              </span>
              <span className="iconTileName">{copied === name ? 'Copied' : name}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
