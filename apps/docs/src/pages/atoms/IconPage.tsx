import { Button, FilterChip, Heading, IconButton, Pill, Text, Size, TextTone, Variant } from '@glacier/react';
import { Bell, Check, Search, Settings, Star, Trash2 } from '@glacier/icons';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

export function IconPage() {
  return (
    <>
      <Heading level={1}>Icon</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        Every icon in the kit is one component from <code>@glacier/icons</code>: a single-glyph SVG
        drawn on a 24-unit grid that sizes from a pixel prop, strokes at a shared weight, and
        inherits <code>currentColor</code> from the text around it. This page documents that
        contract; the Icons page under Foundations lists every glyph in the set.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the figure.</Text>
      <ComponentBlueprint specId="icon" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Sizes"
        description="The size prop sets the rendered width and height in pixels; the glyph scales from its 24-unit grid. 16, 20, and 24 are the steps the kit's controls use."
        code={`import { Star } from '@glacier/icons';

<Star size={16} />
<Star size={20} />
<Star size={24} />
<Star size={32} />`}
      >
        <div style={{ display: 'flex', gap: 'var(--glacier-space-4)', alignItems: 'center' }}>
          <Star size={16} />
          <Star size={20} />
          <Star size={24} />
          <Star size={32} />
        </div>
      </Example>

      <Example
        title="Color"
        description="Icons stroke with currentColor, so they take the surrounding text color for free: muted next to muted text, accent inside an accent control, tone colors inside a toned pill."
        code={`<Text tone={TextTone.Muted}>
  <Search size={16} /> Search inherits the muted text color.
</Text>
<Star size={20} color="var(--glacier-amber-9)" />`}
      >
        <div style={{ display: 'flex', gap: 'var(--glacier-space-5)', alignItems: 'center', flexWrap: 'wrap' }}>
          <Text as="span" tone={TextTone.Muted} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--glacier-space-2)' }}>
            <Search size={16} /> muted text
          </Text>
          <Text as="span" tone={TextTone.Default} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--glacier-space-2)' }}>
            <Bell size={16} /> body text
          </Text>
          <Star size={20} color="var(--glacier-amber-9)" />
        </div>
      </Example>

      <Example
        title="Stroke weight"
        description="strokeWidth is in grid units and stays consistent across the set. absoluteStrokeWidth pins the stroke to its pixel width, so small renders keep their weight instead of thinning."
        code={`<Settings size={24} strokeWidth={1.5} />
<Settings size={24} strokeWidth={2} />
<Settings size={24} strokeWidth={2.5} />
<Settings size={16} absoluteStrokeWidth />`}
      >
        <div style={{ display: 'flex', gap: 'var(--glacier-space-4)', alignItems: 'center' }}>
          <Settings size={24} strokeWidth={1.5} />
          <Settings size={24} strokeWidth={2} />
          <Settings size={24} strokeWidth={2.5} />
          <Settings size={16} absoluteStrokeWidth />
        </div>
      </Example>

      <Example
        title="Inside components"
        description="Component slots expect exactly this contract: Button takes the glyph inline with its label, IconButton takes it as the sole child, and Pill or FilterChip take an icon prop. Each host sizes, spaces, and hides it from assistive tech."
        code={`<Button><Check size={16} /> Approve</Button>
<IconButton aria-label="Delete"><Trash2 size={16} /></IconButton>
<Pill icon={<Star size={12} />}>Featured</Pill>
<FilterChip icon={<Bell size={14} />} count={3}>Alerts</FilterChip>`}
      >
        <div style={{ display: 'flex', gap: 'var(--glacier-space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button>
            <Check size={16} /> Approve
          </Button>
          <IconButton aria-label="Delete" variant={Variant.Ghost}>
            <Trash2 size={16} />
          </IconButton>
          <Pill icon={<Star size={12} />}>Featured</Pill>
          <FilterChip icon={<Bell size={14} />} count={3}>Alerts</FilterChip>
        </div>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'size', type: 'number', default: '24', description: 'Rendered width and height in pixels.' },
          { name: 'color', type: 'string', default: "'currentColor'", description: 'Stroke color; the default inherits the surrounding text color.' },
          { name: 'strokeWidth', type: 'number', default: '2', description: 'Stroke width in grid units, shared across the set.' },
          { name: 'absoluteStrokeWidth', type: 'boolean', default: 'false', description: 'Keeps the stroke at its pixel width instead of scaling with size.' },
          { name: '...svg', type: 'SVGProps', description: 'Everything else forwards to the svg element (className, aria attributes, event handlers).' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          Icons are decorative by default. Component icon slots render them inside an{' '}
          <code>aria-hidden</code> wrapper so the visible label carries the meaning.
        </li>
        <li>
          A standalone icon that carries meaning needs <code>role="img"</code> and an{' '}
          <code>aria-label</code>; without a label assistive tech skips it entirely.
        </li>
        <li>Never convey state through an icon alone; pair it with text or an accessible name.</li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>
          Import from <code>@glacier/icons</code> only. The package is the kit&rsquo;s single icon
          surface; its internals can swap without any call site changing.
        </li>
        <li>Match the icon size to the type scale around it: 16px next to body text, 20 to 24px in headers and empty states.</li>
        <li>Use the shared default stroke so mixed icons read as one set; reach for absoluteStrokeWidth only at 16px and below.</li>
      </ul>
    </>
  );
}
