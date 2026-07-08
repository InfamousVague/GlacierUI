import { useState } from 'react';
import { ResizableSplitPane } from '@perfect/react';
import { Example, PropsTable } from '../docs-ui.tsx';

const paneStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  padding: '1rem',
  color: 'var(--perfect-text-muted)',
  font: '600 0.875rem var(--perfect-font-sans)',
};

function Pane({ label }: { label: string }) {
  return <div style={paneStyle}>{label}</div>;
}

function Frame({ children, height = 200 }: { children: React.ReactNode; height?: number }) {
  return (
    <div
      style={{
        width: '100%',
        height,
        border: 'var(--perfect-hairline) solid var(--perfect-glass-border)',
        borderRadius: 'var(--perfect-radius-lg)',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}

function PersistedSplit() {
  const [ratio, setRatio] = useState(0.4);
  return (
    <div style={{ width: '100%' }}>
      <Frame>
        <ResizableSplitPane ratio={ratio} onRatioChange={setRatio} aria-label="Resize columns">
          <Pane label="Files" />
          <Pane label="Editor" />
        </ResizableSplitPane>
      </Frame>
      <p style={{ marginTop: '0.5rem', color: 'var(--perfect-text-subtle)', fontSize: '0.8125rem' }}>
        ratio: {ratio.toFixed(2)}
      </p>
    </div>
  );
}

export function ResizableSplitPanePage() {
  return (
    <>
      <h1>ResizableSplitPane</h1>
      <p className="lede">
        A container that splits into two panes with a draggable divider. Drag the handle with a
        pointer, nudge it with the arrow keys, or double-click to reset. The size is a ratio you can
        control and persist.
      </p>

      <h2>Examples</h2>

      <Example
        title="Horizontal"
        description="Two side-by-side panes with a vertical divider. Drag it, or focus it and press the arrow keys."
        code={`import { ResizableSplitPane } from '@perfect/react';

<ResizableSplitPane aria-label="Resize columns">
  <div>Sidebar</div>
  <div>Content</div>
</ResizableSplitPane>`}
      >
        <Frame>
          <ResizableSplitPane aria-label="Resize columns">
            <Pane label="Sidebar" />
            <Pane label="Content" />
          </ResizableSplitPane>
        </Frame>
      </Example>

      <Example
        title="Vertical"
        description="Stacked panes with a horizontal divider. Up and Down arrows move the split."
        code={`<ResizableSplitPane orientation="vertical" defaultRatio={0.35}>
  <div>Preview</div>
  <div>Console</div>
</ResizableSplitPane>`}
      >
        <Frame height={280}>
          <ResizableSplitPane orientation="vertical" defaultRatio={0.35} aria-label="Resize rows">
            <Pane label="Preview" />
            <Pane label="Console" />
          </ResizableSplitPane>
        </Frame>
      </Example>

      <Example
        title="Clamped range"
        description="min and max keep either pane from collapsing. Home and End jump to the clamps."
        code={`<ResizableSplitPane min={0.25} max={0.6} defaultRatio={0.4}>
  <div>Nav</div>
  <div>Main</div>
</ResizableSplitPane>`}
      >
        <Frame>
          <ResizableSplitPane min={0.25} max={0.6} defaultRatio={0.4} aria-label="Resize with clamps">
            <Pane label="Nav" />
            <Pane label="Main" />
          </ResizableSplitPane>
        </Frame>
      </Example>

      <Example
        title="Controlled and persisted"
        description="Pass ratio and onRatioChange to own the value — store it to keep the layout between visits."
        code={`const [ratio, setRatio] = useState(0.4);

<ResizableSplitPane ratio={ratio} onRatioChange={setRatio}>
  <div>Files</div>
  <div>Editor</div>
</ResizableSplitPane>`}
      >
        <PersistedSplit />
      </Example>

      <h2>Props</h2>
      <PropsTable
        props={[
          { name: 'children', type: '[ReactNode, ReactNode]', description: 'Required. Exactly two children: the start pane and the end pane.' },
          { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Split direction; horizontal is side by side, vertical is stacked.' },
          { name: 'ratio', type: 'number', description: 'Controlled start-pane fraction of the container, 0–1.' },
          { name: 'defaultRatio', type: 'number', default: '0.5', description: 'Initial start-pane fraction when uncontrolled.' },
          { name: 'onRatioChange', type: '(ratio: number) => void', description: 'Called with the next ratio on drag, keyboard step, or reset.' },
          { name: 'min', type: 'number', default: '0.1', description: 'Smallest start-pane fraction the divider can reach.' },
          { name: 'max', type: 'number', default: '0.9', description: 'Largest start-pane fraction the divider can reach.' },
          { name: 'resetRatio', type: 'number', description: 'Fraction the divider snaps back to on double-click; defaults to defaultRatio.' },
          { name: 'step', type: 'number', default: '0.02', description: 'Fraction the divider moves per arrow-key press.' },
          { name: 'aria-label', type: 'string', description: 'Accessible name for the divider.' },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>
          The divider is a <code>role="separator"</code> with <code>aria-orientation</code> and{' '}
          <code>aria-valuemin</code>, <code>aria-valuemax</code>, and <code>aria-valuenow</code>{' '}
          reported as percentages.
        </li>
        <li>The divider is focusable; arrow keys move it by one step and Home / End jump to the clamps.</li>
        <li>Pass an <code>aria-label</code> so the separator has an accessible name.</li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>Use a split pane for a resizable two-region layout — a list and a detail, an editor and a preview.</li>
        <li>Give the container an explicit height (or let it fill a flex/grid cell); the panes size to it.</li>
        <li>Set <code>min</code> and <code>max</code> so neither pane can collapse to nothing.</li>
        <li>Control the <code>ratio</code> and store it in <code>onRatioChange</code> to keep the layout between visits.</li>
      </ul>
    </>
  );
}
