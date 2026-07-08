import { ScrollArea, Heading, Text, Size, TextTone } from '@glacier/react';
import { Example, PropsTable } from '../../docs-ui.tsx';

const paragraphs = [
  'Perfect keeps every measurement on a shared token scale, so a scroll area caps its viewport in the same units as everything else.',
  'The edge fades are pure CSS masks driven by a scroll listener, so they cost nothing until the content actually overflows.',
  'A ResizeObserver watches both the viewport and its content, which keeps the fades honest as fonts load or the layout reflows.',
  'The viewport is a focusable group, so a keyboard user can scroll it with the arrow keys without ever reaching for a pointer.',
  'Because the scrollbar is themed and thin, it reads as part of the surface rather than a browser afterthought.',
  'Scroll to the very bottom and the trailing fade clears, telling you there is nothing more to see.',
];

const tags = [
  'accent', 'success', 'warning', 'danger', 'info', 'neutral',
  'primary', 'secondary', 'ghost', 'outline', 'solid', 'soft',
  'small', 'medium', 'large', 'compact', 'comfortable',
];

export function ScrollAreaPage() {
  return (
    <>
      <Heading level={1}>ScrollArea</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A styled overflow container: a thin themed scrollbar plus edge fade masks that appear only
        when there is more content to scroll in that direction. A scroll listener and a
        ResizeObserver keep the fades in sync, and the viewport is focusable so it scrolls from the
        keyboard.
      </Text>

      <Heading level={2}>Examples</Heading>

      <Example
        title="Vertical"
        description="Cap the height with maxHeight. The bottom edge fades while there is more below, and the top edge fades once you scroll down."
        code={`import { ScrollArea } from '@glacier/react';

<ScrollArea maxHeight={200}>
  {paragraphs.map((text, i) => (
    <p key={i}>{text}</p>
  ))}
</ScrollArea>`}
      >
        <ScrollArea maxHeight={200} style={{ maxWidth: 360 }} aria-label="Release notes">
          {paragraphs.map((text, i) => (
            <Text key={i} style={{ margin: '0 0 12px' }}>
              {text}
            </Text>
          ))}
        </ScrollArea>
      </Example>

      <Example
        title="Horizontal"
        description="Set orientation to horizontal to cap and fade along the x-axis instead; maxHeight then means a max-width."
        code={`<ScrollArea orientation="horizontal" maxHeight={360}>
  <div style={{ display: 'flex', gap: 8 }}>
    {tags.map((t) => (
      <span key={t} className="tag">{t}</span>
    ))}
  </div>
</ScrollArea>`}
      >
        <ScrollArea orientation="horizontal" maxHeight={360} aria-label="Tags">
          <div style={{ display: 'flex', gap: 8, padding: '4px 0' }}>
            {tags.map((t) => (
              <span
                key={t}
                style={{
                  padding: '4px 12px',
                  borderRadius: 999,
                  border: '1px solid var(--glacier-border-subtle)',
                  whiteSpace: 'nowrap',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </ScrollArea>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          {
            name: 'maxHeight',
            type: 'number | string',
            description:
              'Caps the viewport along the scroll axis: a max-height when vertical, a max-width when horizontal. A pixel number or any CSS length.',
          },
          { name: 'orientation', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Scroll axis; vertical fades top/bottom, horizontal fades left/right.' },
          { name: 'children', type: 'ReactNode', description: 'The overflowing content.' },
          { name: 'className', type: 'string', description: 'Extra class on the root wrapper.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          The viewport is a focusable <code>role="group"</code>, so keyboard users can scroll it with
          the arrow keys, Page Up/Down, and Home/End without a pointer.
        </li>
        <li>
          A visible focus ring marks the viewport when it holds keyboard focus.
        </li>
        <li>
          The edge fades are decorative CSS masks and expose no content or state to assistive
          technology; give the area an <code>aria-label</code> when its purpose is not clear from
          surrounding text.
        </li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Reach for a ScrollArea when a bounded region - a sidebar, a code block, a chip row - needs to scroll without a raw browser scrollbar.</li>
        <li>Prefer <code>maxHeight</code> over a fixed height so short content collapses and never leaves an empty gutter.</li>
        <li>Use the horizontal orientation for a single row of chips or thumbnails; keep long reading content vertical.</li>
      </ul>
    </>
  );
}
