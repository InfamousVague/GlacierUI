import { Kbd, Text, Heading, Size, TextTone, useT } from '@glacier/react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

export function KbdPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.kbdName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.kbdLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntro)}</Text>
      <ComponentBlueprint specId="kbd" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.kbdEx1Desc)}
        component="Kbd"
        render={(K) => (
          <div style={{ display: 'flex', gap: 'var(--glacier-space-4)', alignItems: 'center', flexWrap: 'wrap' }}>
            <K.Kbd>Esc</K.Kbd>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--glacier-space-1)' }}>
              <K.Kbd>Cmd</K.Kbd> <K.Kbd>K</K.Kbd>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--glacier-space-1)' }}>
              <K.Kbd>Ctrl</K.Kbd> <K.Kbd>Shift</K.Kbd> <K.Kbd>P</K.Kbd>
            </span>
          </div>
        )}
        code={`import { Kbd } from '@glacier/react';

<Kbd>Esc</Kbd>
<Kbd>Cmd</Kbd> <Kbd>K</Kbd>
<Kbd>Ctrl</Kbd> <Kbd>Shift</Kbd> <Kbd>P</Kbd>`}
      />

      <Example
        title={t(m.kbdEx2Title)}
        description={t(m.kbdEx2Desc)}
        code={`<Text>
  Press <Kbd>Cmd</Kbd> <Kbd>K</Kbd> to open the command palette.
</Text>
<Text size={Size.Small} tone={TextTone.Muted}>
  Press <Kbd>?</Kbd> to see all shortcuts.
</Text>`}
      >
        <div style={{ display: 'grid', gap: 'var(--glacier-space-2)' }}>
          <Text>
            {t(m.kbdPress)} <Kbd>Cmd</Kbd> <Kbd>K</Kbd> {t(m.kbdToOpenTheCommandPalette)}
          </Text>
          <Text size={Size.Small} tone={TextTone.Muted}>
            {t(m.kbdPress)} <Kbd>?</Kbd> {t(m.kbdToSeeAllShortcuts)}
          </Text>
        </div>
      </Example>

      <Example
        title={t(m.exGlass)}
        description={t(m.kbdEx3Desc)}
        component="Kbd"
        render={(K) => (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--glacier-space-1)' }}>
            <K.Kbd glass>Cmd</K.Kbd> <K.Kbd glass>K</K.Kbd>
          </span>
        )}
        code={`<Kbd glass>Cmd</Kbd> <Kbd glass>K</Kbd>`}
      />

      <Example
        title={t(m.exSkeleton)}
        description={t(m.kbdEx4Desc)}
        component="Kbd"
        render={(K) => (
          <span>
            <K.Kbd skeleton />
          </span>
        )}
        code={`<Kbd skeleton />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'glass', type: 'boolean', default: 'false', description: t(m.kbdPropGlass) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.kbdPropSkeleton) },
          { name: 'children', type: 'ReactNode', description: t(m.kbdPropChildren) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.kbdA11y1))}</li>
        <li>{prose(t(m.kbdA11y2))}</li>
        <li>{prose(t(m.kbdA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.kbdUse1))}</li>
        <li>{prose(t(m.kbdUse2))}</li>
        <li>{prose(t(m.kbdUse3))}</li>
      </ul>
    </>
  );
}
