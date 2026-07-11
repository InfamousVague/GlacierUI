import { Kbd, Text, Heading, Size, TextTone } from '@glacier/react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

export function KbdPage() {
  return (
    <>
      <Heading level={1}>Kbd</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A monospace key cap that renders a keyboard key or shortcut inline with a raised bottom
        edge. It sizes in <code>em</code> units, so it scales with the surrounding text, and it can
        swap its solid surface for the frosted glass material when it sits on glass.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the figure.</Text>
      <ComponentBlueprint specId="kbd" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Basic"
        description="Single keys and combinations. Render one Kbd per key so each cap reads as its own key."
        code={`import { Kbd } from '@glacier/react';

<Kbd>Esc</Kbd>
<Kbd>Cmd</Kbd> <Kbd>K</Kbd>
<Kbd>Ctrl</Kbd> <Kbd>Shift</Kbd> <Kbd>P</Kbd>`}
      >
        <div style={{ display: 'flex', gap: 'var(--glacier-space-4)', alignItems: 'center', flexWrap: 'wrap' }}>
          <Kbd>Esc</Kbd>
          <span>
            <Kbd>Cmd</Kbd> <Kbd>K</Kbd>
          </span>
          <span>
            <Kbd>Ctrl</Kbd> <Kbd>Shift</Kbd> <Kbd>P</Kbd>
          </span>
        </div>
      </Example>

      <Example
        title="Inline with text"
        description="Kbd inherits the surrounding font size, so a shortcut mentioned mid-sentence stays on the text's rhythm at any size."
        code={`<Text>
  Press <Kbd>Cmd</Kbd> <Kbd>K</Kbd> to open the command palette.
</Text>
<Text size={Size.Small} tone={TextTone.Muted}>
  Press <Kbd>?</Kbd> to see all shortcuts.
</Text>`}
      >
        <div style={{ display: 'grid', gap: 'var(--glacier-space-2)' }}>
          <Text>
            Press <Kbd>Cmd</Kbd> <Kbd>K</Kbd> to open the command palette.
          </Text>
          <Text size={Size.Small} tone={TextTone.Muted}>
            Press <Kbd>?</Kbd> to see all shortcuts.
          </Text>
        </div>
      </Example>

      <Example
        title="Glass"
        description="On a frosted surface, the glass variant keeps the key legible without stacking a solid chip on the material. The docs search field uses this for its shortcut hint."
        code={`<Kbd glass>Cmd</Kbd> <Kbd glass>K</Kbd>`}
      >
        <span>
          <Kbd glass>Cmd</Kbd> <Kbd glass>K</Kbd>
        </span>
      </Example>

      <Example
        title="Skeleton"
        description="The loading placeholder keeps the key cap's exact footprint."
        code={`<Kbd skeleton />`}
      >
        <span>
          <Kbd skeleton />
        </span>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'glass', type: 'boolean', default: 'false', description: 'Renders the frosted glass material instead of a solid surface.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: 'Renders a placeholder with the exact geometry.' },
          { name: 'children', type: 'ReactNode', description: 'Required. Key label or shortcut text, kept to one line.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          Renders the semantic <code>kbd</code> element, so assistive tech announces the content as
          keyboard input.
        </li>
        <li>The key text itself carries the meaning; no extra labelling is needed.</li>
        <li>It is not focusable and adds nothing to the tab order.</li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Use one Kbd per key and write modifier names out (Cmd, Ctrl, Shift) so combos read key by key.</li>
        <li>Pair it with SearchField's <code>shortcut</code> slot to hint the focus shortcut inside the field.</li>
        <li>For documenting code or commands rather than key presses, reach for <code>CodeBlock</code> or inline <code>code</code> instead.</li>
      </ul>
    </>
  );
}
