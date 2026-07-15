import { Heading, ScrollArea, ScrollbarAppearance, Text, Size, TextTone, useT } from '@glacier/react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

const tags = [
  'accent', 'success', 'warning', 'danger', 'info', 'neutral',
  'primary', 'secondary', 'ghost', 'outline', 'solid', 'soft',
  'small', 'medium', 'large', 'compact', 'comfortable',
];

const scrollbarAppearances = [
  { value: ScrollbarAppearance.Subtle, label: m.scrollbarSubtle },
  { value: ScrollbarAppearance.Default, label: m.scrollbarDefault },
  { value: ScrollbarAppearance.Accent, label: m.scrollbarAccent },
] as const;

const scrollbarTrackVariants = [
  { visible: true, label: m.saScrollbarTrack },
  { visible: false, label: m.saScrollbarNoTrack },
] as const;

export function ScrollAreaPage() {
  const t = useT();
  const paragraphs = [
    t(m.saPara1),
    t(m.saPara2),
    t(m.saPara3),
    t(m.saPara4),
    t(m.saPara5),
    t(m.saPara6),
  ];
  return (
    <>
      <Heading level={1}>{t(m.saName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.saLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.saAnatomyIntro)}</Text>
      <ComponentBlueprint specId="scroll-area" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.saEx1Title)}
        description={t(m.saEx1Desc)}
        component="ScrollArea"
        render={(K) => (
          <K.ScrollArea maxHeight={200} style={{ maxWidth: 360 }} aria-label={t(m.saAriaReleaseNotes)}>
            {paragraphs.map((text, i) => (
              <Text key={i} style={{ margin: '0 0 12px' }}>
                {text}
              </Text>
            ))}
          </K.ScrollArea>
        )}
        code={`import { ScrollArea } from '@glacier/react';

<ScrollArea maxHeight={200}>
  {paragraphs.map((text, i) => (
    <p key={i}>{text}</p>
  ))}
</ScrollArea>`}
      />

      <Example
        title={t(m.saEx2Title)}
        description={t(m.saEx2Desc)}
        component="ScrollArea"
        render={(K) => (
          <K.ScrollArea orientation="horizontal" maxHeight={360} aria-label={t(m.scrollareaTags)}>
            <div style={{ display: 'flex', gap: 8, padding: '4px 0' }}>
              {tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 999,
                    border: '1px solid var(--glacier-border-subtle)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </K.ScrollArea>
        )}
        code={`<ScrollArea orientation="horizontal" maxHeight={360}>
  <div style={{ display: 'flex', gap: 8 }}>
    {tags.map((t) => (
      <span key={t} className="tag">{t}</span>
    ))}
  </div>
</ScrollArea>`}
      />

      <Example
        title={t(m.saEx3Title)}
        description={t(m.saEx3Desc)}
        component="ScrollArea"
        render={(K) => (
          <K.ScrollArea hideScrollbar maxHeight={160} aria-label={t(m.saAriaReleaseNotes)}>
            <div style={{ display: 'grid', gap: 'var(--glacier-space-3)', maxWidth: '28rem' }}>
              <p>{t(m.saHidden1)}</p>
              <p>{t(m.saHidden2)}</p>
              <p>{t(m.saHidden3)}</p>
              <p>{t(m.saHidden4)}</p>
            </div>
          </K.ScrollArea>
        )}
        code={`<ScrollArea hideScrollbar maxHeight={160}>
  {paragraphs}
</ScrollArea>`}
      />

      <Heading level={2}>{t(m.saScrollbars)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.saScrollbarsDesc)}</Text>
      <div className="scrollbarPreviewGrid">
        {scrollbarAppearances.map(({ value, label }) => (
          <div key={value}>
            <Text size={Size.Small} tone={TextTone.Muted} className="scrollbarPreviewLabel">
              {t(label)}
            </Text>
            <div className="scrollbarPreviewVariants">
              {scrollbarTrackVariants.map(({ visible, label: trackLabel }) => (
                <div key={String(visible)}>
                  <Text size={Size.Small} tone={TextTone.Muted} className="scrollbarPreviewVariantLabel">
                    {t(trackLabel)}
                  </Text>
                  <ScrollArea
                    maxHeight={144}
                    className="scrollbarPreview"
                    scrollbarAppearance={value}
                    showScrollbarTrack={visible}
                    aria-label={`${t(m.saScrollbarsAria)}: ${t(label)}, ${t(trackLabel)}`}
                  >
                    {paragraphs.slice(0, 4).map((text, index) => (
                      <Text key={index} size={Size.Small} style={{ margin: '0 0 var(--glacier-space-3)' }}>
                        {text}
                      </Text>
                    ))}
                  </ScrollArea>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          {
            name: 'maxHeight',
            type: 'number | string',
            description: t(m.saPropMaxHeight),
          },
          { name: 'orientation', type: "'vertical' | 'horizontal'", default: "'vertical'", description: t(m.saPropOrientation) },
          { name: 'scrollbarAppearance', type: "'subtle' | 'default' | 'accent'", default: "'default'", description: t(m.saPropScrollbarAppearance) },
          { name: 'showScrollbarTrack', type: 'boolean', default: 'true', description: t(m.saPropShowScrollbarTrack) },
          { name: 'hideScrollbar', type: 'boolean', default: 'false', description: t(m.saPropHideScrollbar) },
          { name: 'children', type: 'ReactNode', description: t(m.saPropChildren) },
          { name: 'className', type: 'string', description: t(m.saPropClassName) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.saA11y1))}</li>
        <li>{prose(t(m.saA11y2))}</li>
        <li>{prose(t(m.saA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.saUse1))}</li>
        <li>{prose(t(m.saUse2))}</li>
        <li>{prose(t(m.saUse3))}</li>
      </ul>
    </>
  );
}
