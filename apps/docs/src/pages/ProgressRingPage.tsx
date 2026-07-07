import { Button, ProgressRing, Text } from '@perfect/react';
import { useEffect, useState } from 'react';
import { Example, PropsTable } from '../docs-ui.tsx';

export function ProgressRingPage() {
  return (
    <>
      <h1>Progress Ring</h1>
      <p className="lede">
        A compact radial progress indicator. Reach for it in tight spots like cards, avatars, or
        toolbars where a linear bar would not fit. For linear progress use ProgressBar, and for a
        static level use Meter.
      </p>

      <h2>Examples</h2>

      <Example
        title="Determinate"
        description="Pass value from 0 to max. The arc animates between values on the motion tokens."
        code={`import { ProgressRing } from '@perfect/react';

<ProgressRing aria-label="Sync progress" value={value} showValue />`}
      >
        <LiveRing />
      </Example>

      <Example
        title="With a value in the center"
        description="Set showValue to render the rounded percentage in the center using tabular figures, so the number does not jitter as it counts."
        code={`<ProgressRing aria-label="Storage used" value={72} showValue />`}
      >
        <ProgressRing aria-label="Storage used" value={72} showValue />
      </Example>

      <Example
        title="Sizes and tones"
        description="size sets the diameter and thickness sets the stroke. Four tones follow the status ramps."
        code={`<ProgressRing aria-label="Accent" value={70} />
<ProgressRing aria-label="Success" value={100} tone="success" size={64} />
<ProgressRing aria-label="Warning" value={45} tone="warning" size={80} thickness={8} />
<ProgressRing aria-label="Danger" value={20} tone="danger" size={32} thickness={3} />`}
      >
        <div className="row" style={{ alignItems: 'center', gap: '1rem' }}>
          <ProgressRing aria-label="Accent" value={70} />
          <ProgressRing aria-label="Success" value={100} tone="success" size={64} />
          <ProgressRing aria-label="Warning" value={45} tone="warning" size={80} thickness={8} />
          <ProgressRing aria-label="Danger" value={20} tone="danger" size={32} thickness={3} />
        </div>
      </Example>

      <Example
        title="Custom center content"
        description="label centers any node over the ring, which suits an icon or a compact fraction. It takes priority over showValue."
        code={`<ProgressRing aria-label="Lesson 3 of 4" value={3} max={4} size={64} label={<Text size="sm" tone="muted">3/4</Text>} />`}
      >
        <ProgressRing
          aria-label="Lesson 3 of 4"
          value={3}
          max={4}
          size={64}
          label={
            <Text as="span" size="sm" tone="muted">
              3/4
            </Text>
          }
        />
      </Example>

      <Example
        title="Skeleton"
        description="Set skeleton while the value is still loading. The placeholder keeps the ring diameter, so nothing shifts when the real ring arrives."
        code={`<ProgressRing skeleton value={0} />
<ProgressRing aria-label="Sync progress" value={64} showValue />`}
      >
        <div className="row" style={{ alignItems: 'center', gap: '1rem' }}>
          <ProgressRing skeleton value={0} />
          <ProgressRing aria-label="Sync progress" value={64} showValue />
        </div>
      </Example>

      <h2>Props</h2>
      <PropsTable
        props={[
          { name: 'value', type: 'number', description: 'Progress from 0 to max. Clamped into range.' },
          { name: 'max', type: 'number', default: '100', description: 'Upper bound of the range.' },
          { name: 'size', type: 'number', default: '48', description: 'Pixel diameter of the ring.' },
          { name: 'thickness', type: 'number', default: '4', description: 'Stroke width of the track and arc in pixels.' },
          { name: 'tone', type: "'accent' | 'success' | 'warning' | 'danger'", default: "'accent'", description: 'Arc color from the status ramps.' },
          { name: 'label', type: 'ReactNode', description: 'Centered content. Takes priority over showValue.' },
          { name: 'showValue', type: 'boolean', default: 'false', description: 'With no label, render the rounded percentage in the center.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: "Renders a placeholder with the component's exact geometry." },
          { name: 'aria-label', type: 'string', description: 'Accessible name for the ring.' },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>
          Renders <code>role="progressbar"</code> with <code>aria-valuemin</code>,{' '}
          <code>aria-valuemax</code>, and a clamped <code>aria-valuenow</code>. Give it an{' '}
          <code>aria-label</code> so the progress has a name.
        </li>
        <li>
          The centered percentage is marked <code>aria-hidden</code> because the ring already carries
          the value, so it is never announced twice.
        </li>
        <li>
          Under prefers-reduced-motion the arc jumps to its new value instead of sweeping, so state
          is still visible without movement.
        </li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>Use ProgressRing for compact radial progress in tight or decorative spots.</li>
        <li>Use ProgressBar for linear progress with room for a full-width track.</li>
        <li>Use Meter for a static level such as a rating or capacity gauge.</li>
        <li>Values clamp to the range, so feed raw numbers without guarding.</li>
      </ul>
    </>
  );
}

function LiveRing() {
  const [value, setValue] = useState(64);

  useEffect(() => {
    if (value < 100) return;
    const timer = setTimeout(() => setValue(0), 1200);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="row" style={{ alignItems: 'center', gap: '1rem' }}>
      <ProgressRing aria-label="Sync progress" value={value} showValue />
      <div className="row">
        <Button size="sm" variant="soft" onClick={() => setValue((v) => Math.min(v + 15, 100))}>
          Advance
        </Button>
      </div>
    </div>
  );
}
