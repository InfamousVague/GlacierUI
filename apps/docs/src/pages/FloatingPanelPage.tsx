import { Button, FloatingPanel, Row, Text } from '@perfect/react';
import { useState } from 'react';
import { Example, PropsTable } from '../docs-ui.tsx';

export function FloatingPanelPage() {
  const [basicOpen, setBasicOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  return (
    <>
      <h1>FloatingPanel</h1>
      <p className="lede">
        A draggable, dismissable non-modal panel. Grab its header bar to move it anywhere on
        screen, and it stays clamped inside the viewport. Unlike Modal it renders no overlay,
        locks no scroll, and traps no focus — it floats above the page while you keep working
        underneath.
      </p>

      <h2>Examples</h2>

      <Example
        title="Basic"
        description="A controlled panel. Drag the title bar to move it; the built-in close button and Escape both dismiss it."
        code={`import { Button, FloatingPanel, Text } from '@perfect/react';

const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Open panel</Button>
<FloatingPanel open={open} title="Notes" onClose={() => setOpen(false)}>
  <Text>Drag me by the header bar. I stay inside the viewport.</Text>
</FloatingPanel>`}
      >
        <Row gap={4} wrap>
          <Button onClick={() => setBasicOpen(true)}>Open panel</Button>
          <FloatingPanel open={basicOpen} title="Notes" onClose={() => setBasicOpen(false)}>
            <Text>Drag me by the header bar. I stay inside the viewport.</Text>
          </FloatingPanel>
        </Row>
      </Example>

      <Example
        title="Custom start position"
        description="defaultPosition places the panel's top-left corner in viewport pixels on open. Here it opens toward the right edge as a side inspector."
        code={`<FloatingPanel
  open={open}
  title="Inspector"
  defaultPosition={{ x: 480, y: 120 }}
  onClose={() => setOpen(false)}
>
  <Text>A non-modal inspector you can keep open while editing.</Text>
</FloatingPanel>`}
      >
        <Row gap={4} wrap>
          <Button variant="soft" onClick={() => setInspectorOpen(true)}>
            Open inspector
          </Button>
          <FloatingPanel
            open={inspectorOpen}
            title="Inspector"
            defaultPosition={{ x: 480, y: 120 }}
            onClose={() => setInspectorOpen(false)}
          >
            <Text>A non-modal inspector you can keep open while editing.</Text>
          </FloatingPanel>
        </Row>
      </Example>

      <h2>Props</h2>
      <PropsTable
        props={[
          { name: 'open', type: 'boolean', description: 'Required. Whether the panel is shown; it unmounts when false.' },
          { name: 'title', type: 'ReactNode', description: 'Required. Title rendered in the drag handle bar; it labels the dialog.' },
          { name: 'onClose', type: '() => void', description: 'Required. Called when dismissed via the close button or Escape.' },
          { name: 'defaultPosition', type: '{ x: number; y: number }', default: '{ x: 24, y: 24 }', description: "Initial top-left position in viewport pixels." },
          { name: 'className', type: 'string', description: 'Extra class names merged onto the panel.' },
          { name: 'children', type: 'ReactNode', description: 'The panel body content.' },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>
          The panel portals to <code>document.body</code> and renders as <code>role="dialog"</code>,
          labelled by its title through <code>aria-labelledby</code>.
        </li>
        <li>
          It is <strong>non-modal</strong>: no <code>aria-modal</code>, no scroll lock, no focus
          trap, and no overlay — the page underneath stays fully interactive.
        </li>
        <li>Escape closes the panel. Dragging is pointer-only, and the panel's position is never load-bearing.</li>
        <li>The grab-bar sets <code>touch-action: none</code> so a drag on touch moves the panel instead of scrolling the page.</li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>Reach for a FloatingPanel when the user needs to reference or tweak something while the main view stays usable — an inspector, a tool palette, a detached note.</li>
        <li>When the task demands the user's full attention or a decision before proceeding, use a Modal instead.</li>
        <li>Keep the body compact; the panel scrolls internally but is meant to sit beside the work, not dominate it.</li>
      </ul>
    </>
  );
}
