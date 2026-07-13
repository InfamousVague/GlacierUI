import { useState, type ReactNode } from 'react';
import { SegmentedControl, Size, useT } from '@glacier/react';
import * as Web from '@glacier/react';
import * as Native from '@glacier/native';
import { m } from './i18n.ts';

/**
 * The bindings Glacier renders a component through. Each doc page compares the
 * same demo across every binding that implements the component, so a component's
 * cross-platform story lives on its own page (not one central gallery). Adding a
 * future binding (Svelte, Vue, ...) is a single entry here: give it a `kit`
 * namespace exporting the same component names and it appears in every toggle
 * automatically.
 *
 * `kit` is a React-family component namespace (the DOM kit, or the RN kit via
 * react-native-web). A non-React binding would instead carry a `mount(el, id)`
 * strategy; the field is left open for that day but unused for now.
 */
export interface Platform {
  /** Stable id used as the toggle value. */
  id: string;
  /** Full label for the segmented toggle, e.g. "Web (DOM)". */
  label: string;
  /** Short label for the pane corner tag, e.g. "WEB". */
  tag: string;
  /** Accent color for the pane tag. */
  tint: string;
  /** React-family component namespace this binding renders through. */
  kit: Record<string, unknown>;
}

/** A kit namespace as seen by a demo's render function. */
export type PlatformKit = Record<string, never> & typeof Web;

export function usePlatforms(): Platform[] {
  const t = useT();
  return [
    { id: 'web', label: t(m.platformWebDom), tag: t(m.platformWeb), tint: 'var(--glacier-blue-9)', kit: Web },
    { id: 'native', label: t(m.platformNativeRn), tag: t(m.platformNative), tint: 'var(--glacier-purple-9)', kit: Native },
  ];
}

/** The platforms whose kit actually exports `component` (so unsupported bindings never appear). */
export function platformsFor(component: string, all: Platform[]): Platform[] {
  return all.filter((p) => component in p.kit);
}

/**
 * A cross-platform demo: one render function run by each binding that supports
 * the component, behind a toggle (All / Web / Native / ...). Because every
 * binding reads the same --glacier-* tokens, the panes should be visually
 * identical; the toggle exists to catch the moment they are not. Falls back to a
 * single pane (no toggle) when only one binding implements the component.
 */
export function PlatformDemo({
  component,
  render,
}: {
  component: string;
  render: (kit: PlatformKit) => ReactNode;
}) {
  const t = useT();
  const all = usePlatforms();
  const supported = platformsFor(component, all);
  const [value, setValue] = useState('all');

  if (supported.length <= 1) {
    // The registry always has at least the web binding, so this is defined.
    const only = (supported[0] ?? all[0]) as Platform;
    return <PlatformPane tag={only.tag} tint={only.tint}>{render(only.kit as PlatformKit)}</PlatformPane>;
  }

  const shown = value === 'all' ? supported : supported.filter((p) => p.id === value);
  const allLabel = supported.length > 2 ? t(m.platformAll) : t(m.platformBoth);

  return (
    <div style={{ display: 'grid', gap: 'var(--glacier-space-4)', width: '100%' }}>
      {/* Wrapped so the inline-flex control sizes to its content instead of
          being stretched to the full grid column width. */}
      <div>
        <SegmentedControl
          size={Size.Small}
          aria-label={t(m.platformRenderer)}
          value={value}
          onValueChange={setValue}
          options={[
            { value: 'all', label: allLabel },
            ...supported.map((p) => ({ value: p.id, label: p.tag })),
          ]}
        />
      </div>
      <div style={{ display: 'flex', gap: 'var(--glacier-space-6)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {shown.map((p) => (
          <PlatformPane key={p.id} tag={p.tag} tint={p.tint}>
            {render(p.kit as PlatformKit)}
          </PlatformPane>
        ))}
      </div>
    </div>
  );
}

function PlatformPane({ tag, tint, children }: { tag: string; tint: string; children: ReactNode }) {
  return (
    <div
      style={{
        position: 'relative',
        flex: '1 1 16rem',
        minWidth: '14rem',
        padding: 'var(--glacier-space-5)',
        // Extra top padding so the demo clears the corner platform tag.
        paddingTop: 'var(--glacier-space-8)',
        borderRadius: 'var(--glacier-radius-lg)',
        border: 'var(--glacier-hairline) solid var(--glacier-border-subtle)',
        background: 'var(--glacier-surface-sunken)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--glacier-space-3)',
        alignItems: 'center',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 'var(--glacier-space-2)',
          left: 'var(--glacier-space-3)',
          fontFamily: 'var(--glacier-font-mono)',
          fontSize: 'var(--glacier-font-size-xs)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: tint,
        }}
      >
        {tag}
      </span>
      {children}
    </div>
  );
}
