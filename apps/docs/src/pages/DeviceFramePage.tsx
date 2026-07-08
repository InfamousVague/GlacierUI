import { DeviceFrame } from '@perfect/react';
import type { CSSProperties } from 'react';
import { Example, PropsTable } from '../docs-ui.tsx';

const previewStyle: CSSProperties = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  padding: '1.5rem',
  textAlign: 'center',
  background: 'linear-gradient(160deg, var(--perfect-accent-soft), var(--perfect-surface))',
  color: 'var(--perfect-text)',
  fontFamily: 'var(--perfect-font-sans)',
};

function DemoScreen({ label }: { label: string }) {
  return (
    <div style={previewStyle}>
      <strong style={{ fontSize: 'var(--perfect-font-size-lg)' }}>{label}</strong>
      <span style={{ color: 'var(--perfect-text-muted)', fontSize: 'var(--perfect-font-size-sm)' }}>
        Your preview lives here
      </span>
    </div>
  );
}

export function DeviceFramePage() {
  return (
    <>
      <h1>DeviceFrame</h1>
      <p className="lede">
        A decorative phone bezel with a fixed-aspect, inset screen that hosts arbitrary children — a
        live preview, a screenshot, or an iframe. The bezel, notch, and side buttons are purely
        presentational; only the screen contents carry meaning.
      </p>

      <h2>Examples</h2>

      <Example
        title="Basic"
        description="A frame wraps any children; a single child stretches to fill the clipped screen."
        code={`import { DeviceFrame } from '@perfect/react';

<DeviceFrame aria-label="App preview">
  <MyPreview />
</DeviceFrame>`}
      >
        <DeviceFrame aria-label="App preview">
          <DemoScreen label="Home" />
        </DeviceFrame>
      </Example>

      <Example
        title="Sizes"
        description="Three preset widths — sm, md, and lg. The screen keeps its aspect ratio at every width."
        code={`<DeviceFrame size="sm">…</DeviceFrame>
<DeviceFrame size="md">…</DeviceFrame>
<DeviceFrame size="lg">…</DeviceFrame>`}
      >
        <DeviceFrame size="sm" aria-label="Small">
          <DemoScreen label="sm" />
        </DeviceFrame>
        <DeviceFrame size="md" aria-label="Medium">
          <DemoScreen label="md" />
        </DeviceFrame>
        <DeviceFrame size="lg" aria-label="Large">
          <DemoScreen label="lg" />
        </DeviceFrame>
      </Example>

      <Example
        title="Explicit width and aspect"
        description="Set width for an exact size, and aspect to reshape the screen — here a wider tablet-like ratio."
        code={`<DeviceFrame width={240} aspect="3 / 4">…</DeviceFrame>`}
      >
        <DeviceFrame width={240} aspect="3 / 4" aria-label="Tablet preview">
          <DemoScreen label="3 / 4" />
        </DeviceFrame>
      </Example>

      <Example
        title="No notch"
        description="Hide the notch for a full-bleed slab, e.g. an older device or a kiosk screen."
        code={`<DeviceFrame hideNotch>…</DeviceFrame>`}
      >
        <DeviceFrame hideNotch aria-label="Full bleed">
          <DemoScreen label="Full bleed" />
        </DeviceFrame>
      </Example>

      <Example
        title="Hosting an iframe"
        description="Point the screen at a URL. Give the iframe its own title so assistive tech can name it."
        code={`<DeviceFrame aria-label="Live site">
  <iframe title="Example site" src="https://example.com" />
</DeviceFrame>`}
      >
        <DeviceFrame aria-label="Live site">
          <DemoScreen label="iframe" />
        </DeviceFrame>
      </Example>

      <h2>Props</h2>
      <PropsTable
        props={[
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Preset screen width; ignored when width is set.' },
          { name: 'width', type: 'string | number', description: 'Explicit screen width overriding size; a number is treated as px.' },
          { name: 'aspect', type: 'string | number', default: "'9 / 19.5'", description: 'Screen aspect ratio as width / height.' },
          { name: 'hideNotch', type: 'boolean', default: 'false', description: 'Hides the decorative notch for a full-bleed slab.' },
          { name: 'aria-label', type: 'string', description: 'Accessible name for the frame region.' },
          { name: 'children', type: 'ReactNode', description: 'The preview or iframe that fills the screen.' },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>
          The frame is a <code>role="group"</code>; pass an <code>aria-label</code> to name what it
          presents.
        </li>
        <li>
          The bezel, notch, and side buttons are decorative and marked <code>aria-hidden</code> — they
          add no noise to the accessibility tree.
        </li>
        <li>An embedded iframe still needs its own <code>title</code> so screen readers can name it.</li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>Use a DeviceFrame to present a mobile preview, screenshot, or embedded page in context.</li>
        <li>Reach for a preset <code>size</code> first; set an explicit <code>width</code> only when you need an exact fit.</li>
        <li>Keep the frame decorative — put the real, labelled content inside the screen.</li>
      </ul>
    </>
  );
}
