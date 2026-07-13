import { useState } from 'react';
import { Heading, Text, Size, TextTone, useT } from '@glacier/react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

const paneStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  padding: '1rem',
  color: 'var(--glacier-text-muted)',
  font: '600 0.875rem var(--glacier-font-sans)',
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
        border: 'var(--glacier-hairline) solid var(--glacier-glass-border)',
        borderRadius: 'var(--glacier-radius-lg)',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}

function PersistedSplit({ K }: { K: PlatformKit }) {
  const t = useT();
  const [ratio, setRatio] = useState(0.4);
  return (
    <div style={{ width: '100%' }}>
      <Frame>
        <K.ResizableSplitPane ratio={ratio} onRatioChange={setRatio} aria-label={t(m.rspAriaColumns)}>
          <Pane label={t(m.resizablesplitpaneFiles)} />
          <Pane label={t(m.resizablesplitpaneEditor)} />
        </K.ResizableSplitPane>
      </Frame>
      <Text style={{ marginTop: '0.5rem', color: 'var(--glacier-text-subtle)', fontSize: '0.8125rem' }}>
        {t(m.resizablesplitpaneRatio)} {ratio.toFixed(2)}
      </Text>
    </div>
  );
}

export function ResizableSplitPanePage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.rspName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.rspLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.rspAnatomyIntro)}</Text>
      <ComponentBlueprint specId="resizable-split-pane" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.rspEx1Title)}
        description={t(m.rspEx1Desc)}
        component="ResizableSplitPane"
        render={(K) => (
          <Frame>
            <K.ResizableSplitPane aria-label={t(m.rspAriaColumns)}>
              <Pane label={t(m.resizablesplitpaneSidebar)} />
              <Pane label={t(m.resizablesplitpaneContent)} />
            </K.ResizableSplitPane>
          </Frame>
        )}
        code={`import { ResizableSplitPane } from '@glacier/react';

<ResizableSplitPane aria-label="Resize columns">
  <div>Sidebar</div>
  <div>Content</div>
</ResizableSplitPane>`}
      />

      <Example
        title={t(m.rspEx2Title)}
        description={t(m.rspEx2Desc)}
        component="ResizableSplitPane"
        render={(K) => (
          <Frame height={280}>
            <K.ResizableSplitPane orientation="vertical" defaultRatio={0.35} aria-label={t(m.rspAriaRows)}>
              <Pane label={t(m.resizablesplitpanePreview)} />
              <Pane label={t(m.resizablesplitpaneConsole)} />
            </K.ResizableSplitPane>
          </Frame>
        )}
        code={`<ResizableSplitPane orientation="vertical" defaultRatio={0.35}>
  <div>Preview</div>
  <div>Console</div>
</ResizableSplitPane>`}
      />

      <Example
        title={t(m.rspEx3Title)}
        description={t(m.rspEx3Desc)}
        component="ResizableSplitPane"
        render={(K) => (
          <Frame>
            <K.ResizableSplitPane min={0.25} max={0.6} defaultRatio={0.4} aria-label={t(m.rspAriaClamps)}>
              <Pane label={t(m.resizablesplitpaneNav)} />
              <Pane label={t(m.resizablesplitpaneMain)} />
            </K.ResizableSplitPane>
          </Frame>
        )}
        code={`<ResizableSplitPane min={0.25} max={0.6} defaultRatio={0.4}>
  <div>Nav</div>
  <div>Main</div>
</ResizableSplitPane>`}
      />

      <Example
        title={t(m.rspEx4Title)}
        description={t(m.rspEx4Desc)}
        component="ResizableSplitPane"
        render={(K) => <PersistedSplit K={K} />}
        code={`const [ratio, setRatio] = useState(0.4);

<ResizableSplitPane ratio={ratio} onRatioChange={setRatio}>
  <div>Files</div>
  <div>Editor</div>
</ResizableSplitPane>`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'children', type: '[ReactNode, ReactNode]', description: t(m.rspPropChildren) },
          { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: t(m.rspPropOrientation) },
          { name: 'ratio', type: 'number', description: t(m.rspPropRatio) },
          { name: 'defaultRatio', type: 'number', default: '0.5', description: t(m.rspPropDefaultRatio) },
          { name: 'onRatioChange', type: '(ratio: number) => void', description: t(m.rspPropOnRatioChange) },
          { name: 'min', type: 'number', default: '0.1', description: t(m.rspPropMin) },
          { name: 'max', type: 'number', default: '0.9', description: t(m.rspPropMax) },
          { name: 'resetRatio', type: 'number', description: t(m.rspPropResetRatio) },
          { name: 'step', type: 'number', default: '0.02', description: t(m.rspPropStep) },
          { name: 'aria-label', type: 'string', description: t(m.rspPropAriaLabel) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.rspA11y1))}</li>
        <li>{prose(t(m.rspA11y2))}</li>
        <li>{prose(t(m.rspA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.rspUse1))}</li>
        <li>{prose(t(m.rspUse2))}</li>
        <li>{prose(t(m.rspUse3))}</li>
        <li>{prose(t(m.rspUse4))}</li>
      </ul>
    </>
  );
}
