import { Heading, Sparkline, StatTile, Text, TextTone, Size, useT } from '@glacier/react';
import { useEffect, useState } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

/** A deterministic wavy series so every reload draws the same docs. */
function wave(count: number, seed: number): number[] {
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    return 50 + 32 * Math.sin(t * Math.PI * 2 + seed) + 12 * Math.sin(t * Math.PI * 7 + seed * 3);
  });
}

const TREND = wave(32, 1.2);
const SPIKY = wave(32, 4.1).map((v, i) => (i % 9 === 4 ? v + 28 : v));
const CLIMB = Array.from({ length: 32 }, (_, i) => 18 + i * 2.2 + 8 * Math.sin(i / 2.5));

function StreamingSparkline() {
  const t = useT();
  const [data, setData] = useState(() => wave(40, 2.5));
  useEffect(() => {
    const id = setInterval(() => {
      setData((prev) => {
        const t = prev.length;
        const next = 50 + 32 * Math.sin(t / 6.4) + 12 * Math.sin(t / 1.9);
        return [...prev.slice(1), next];
      });
    }, 500);
    return () => clearInterval(id);
  }, []);
  return <Sparkline data={data} min={0} max={100} endPoint aria-label={t(m.sparklineLiveSignalLast20Seconds)} />;
}

export function SparklinePage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.sparkName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.sparkLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntro)}</Text>
      <ComponentBlueprint specId="sparkline" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.sparkEx1Title)}
        description={t(m.sparkEx1Desc)}
        component="Sparkline"
        render={(K) => (
          <div style={{ display: 'grid', gap: 'var(--glacier-space-4)', width: '14rem' }}>
            <K.Sparkline data={TREND} aria-label={t(m.sparklineCpuLine)} />
            <K.Sparkline data={TREND} shape="area" aria-label={t(m.sparklineCpuArea)} />
            <K.Sparkline data={TREND} shape="bars" aria-label={t(m.sparklineCpuBars)} />
          </div>
        )}
        code={`<Sparkline data={cpu} aria-label="CPU, last 5 minutes" />
<Sparkline data={cpu} shape="area" aria-label="CPU, last 5 minutes" />
<Sparkline data={cpu} shape="bars" aria-label="CPU, last 5 minutes" />`}
      />

      <Example
        title={t(m.sparkEx2Title)}
        description={t(m.sparkEx2Desc)}
        component="Sparkline"
        render={(K) => (
          <div style={{ width: '14rem' }}>
            <K.Sparkline data={SPIKY} min={0} max={130} baseline={100} tone="warning" size="lg" aria-label={t(m.sparklineMemoryWithLimit)} />
          </div>
        )}
        code={`<Sparkline data={memory} min={0} max={100} baseline={80} tone="warning" aria-label="Memory, last hour" />`}
      />

      <Example
        title={t(m.sparkEx3Title)}
        description={t(m.sparkEx3Desc)}
        code={`<Sparkline data={window} min={0} max={100} endPoint aria-label="Live signal" />`}
      >
        <div style={{ width: '14rem' }}>
          <StreamingSparkline />
        </div>
      </Example>

      <Example
        title={t(m.sparkEx4Title)}
        description={t(m.sparkEx4Desc)}
        code={`<StatTile
  value="42%"
  label="CPU"
  hint={<Sparkline data={cpu} min={0} max={100} aria-label="CPU, last hour" style={{ width: '5rem' }} />}
/>`}
      >
        <div style={{ display: 'flex', gap: 'var(--glacier-space-4)' }}>
          <StatTile value="42%" label={t(m.sparklineCpu)} hint={<Sparkline data={TREND} min={0} max={100} aria-label={t(m.sparklineCpuTrend)} style={{ width: '5rem' }} />} />
          <StatTile value="6.1 GB" label={t(m.sparklineMemory)} hint={<Sparkline data={CLIMB} tone="danger" aria-label={t(m.sparklineMemoryTrend)} style={{ width: '5rem' }} />} />
        </div>
      </Example>

      <Example
        title={t(m.exGlass)}
        description={t(m.sparkEx5Desc)}
        component="Sparkline"
        render={(K) => (
          <div
            style={{
              width: '18rem',
              padding: 'var(--glacier-space-5)',
              borderRadius: 'var(--glacier-radius-lg)',
              background: 'linear-gradient(120deg, var(--glacier-accent-soft), var(--glacier-purple-4), var(--glacier-teal-4))',
              display: 'grid',
              gap: 'var(--glacier-space-3)',
            }}
          >
            <K.Sparkline data={TREND} min={0} max={100} glass aria-label={t(m.sparklineCpuGlass)} />
            <K.Sparkline data={SPIKY} min={0} max={130} shape="area" glass aria-label={t(m.sparklineMemoryGlass)} />
          </div>
        )}
        code={`<Sparkline data={cpu} min={0} max={100} glass aria-label="CPU, last hour" />`}
      />

      <Example
        title={t(m.exSkeleton)}
        description={t(m.sparkEx6Desc)}
        component="Sparkline"
        render={(K) => (
          <div style={{ width: '14rem' }}>
            <K.Sparkline data={[]} skeleton aria-label={t(m.sparklineLoadingTrend)} />
          </div>
        )}
        code={`<Sparkline data={[]} skeleton aria-label="Loading trend" />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'data', type: 'number[]', description: t(m.sparkPropData) },
          { name: 'min', type: 'number', description: t(m.sparkPropMin) },
          { name: 'max', type: 'number', description: t(m.sparkPropMax) },
          { name: 'baseline', type: 'number', description: t(m.sparkPropBaseline) },
          { name: 'shape', type: "'line' | 'area' | 'bars'", default: "'line'", description: t(m.sparkPropShape) },
          { name: 'tone', type: "'accent' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'", default: "'accent'", description: t(m.sparkPropTone) },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t(m.sparkPropSize) },
          { name: 'endPoint', type: 'boolean', default: 'false', description: t(m.sparkPropEndPoint) },
          { name: 'glass', type: 'boolean', default: 'false', description: t(m.sparkPropGlass) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.sparkPropSkeleton) },
          { name: 'aria-label', type: 'string', description: t(m.sparkPropAriaLabel) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.sparkA11y1))}</li>
        <li>{t(m.sparkA11y2)}</li>
        <li>{t(m.sparkA11y3)}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.sparkUse1))}</li>
        <li>{t(m.sparkUse2)}</li>
        <li>{t(m.sparkUse3)}</li>
        <li>{t(m.sparkUse4)}</li>
      </ul>
    </>
  );
}
