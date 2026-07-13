import { Button, FilterChip, Heading, IconButton, Pill, Text, Size, TextTone, Variant, useT } from '@glacier/react';
import { Bell, Check, Search, Settings, Star, Trash2 } from '@glacier/icons';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

export function IconPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.icoName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.icoLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntro)}</Text>
      <ComponentBlueprint specId="icon" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.secSizes)}
        description={t(m.icoEx1Desc)}
        component="Icon"
        render={() => (
          <div style={{ display: 'flex', gap: 'var(--glacier-space-4)', alignItems: 'center' }}>
            <Star size={16} />
            <Star size={20} />
            <Star size={24} />
            <Star size={32} />
          </div>
        )}
        code={`import { Star } from '@glacier/icons';

<Star size={16} />
<Star size={20} />
<Star size={24} />
<Star size={32} />`}
      />

      <Example
        title={t(m.icoEx2Title)}
        description={t(m.icoEx2Desc)}
        code={`<Text tone={TextTone.Muted}>
  <Search size={16} /> Search inherits the muted text color.
</Text>
<Star size={20} color="var(--glacier-amber-9)" />`}
      >
        <div style={{ display: 'flex', gap: 'var(--glacier-space-5)', alignItems: 'center', flexWrap: 'wrap' }}>
          <Text as="span" tone={TextTone.Muted} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--glacier-space-2)' }}>
            <Search size={16} /> {t(m.iconMutedText)}
          </Text>
          <Text as="span" tone={TextTone.Default} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--glacier-space-2)' }}>
            <Bell size={16} /> {t(m.iconBodyText)}
          </Text>
          <Star size={20} color="var(--glacier-amber-9)" />
        </div>
      </Example>

      <Example
        title={t(m.icoEx3Title)}
        description={t(m.icoEx3Desc)}
        code={`<Settings size={24} strokeWidth={1.5} />
<Settings size={24} strokeWidth={2} />
<Settings size={24} strokeWidth={2.5} />
<Settings size={16} absoluteStrokeWidth />`}
      >
        <div style={{ display: 'flex', gap: 'var(--glacier-space-4)', alignItems: 'center' }}>
          <Settings size={24} strokeWidth={1.5} />
          <Settings size={24} strokeWidth={2} />
          <Settings size={24} strokeWidth={2.5} />
          <Settings size={16} absoluteStrokeWidth />
        </div>
      </Example>

      <Example
        title={t(m.icoEx4Title)}
        description={t(m.icoEx4Desc)}
        code={`<Button><Check size={16} /> Approve</Button>
<IconButton aria-label="Delete"><Trash2 size={16} /></IconButton>
<Pill icon={<Star size={12} />}>Featured</Pill>
<FilterChip icon={<Bell size={14} />} count={3}>Alerts</FilterChip>`}
      >
        <div style={{ display: 'flex', gap: 'var(--glacier-space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button>
            <Check size={16} /> {t(m.iconApprove)}
          </Button>
          <IconButton aria-label={t(m.icoAriaDelete)} variant={Variant.Ghost}>
            <Trash2 size={16} />
          </IconButton>
          <Pill icon={<Star size={12} />}>{t(m.iconFeatured)}</Pill>
          <FilterChip icon={<Bell size={14} />} count={3}>{t(m.iconAlerts)}</FilterChip>
        </div>
      </Example>

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'size', type: 'number', default: '24', description: t(m.icoPropSize) },
          { name: 'color', type: 'string', default: "'currentColor'", description: t(m.icoPropColor) },
          { name: 'strokeWidth', type: 'number', default: '2', description: t(m.icoPropStrokeWidth) },
          { name: 'absoluteStrokeWidth', type: 'boolean', default: 'false', description: t(m.icoPropAbsoluteStrokeWidth) },
          { name: '...svg', type: 'SVGProps', description: t(m.icoPropSvg) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.icoA11y1))}</li>
        <li>{prose(t(m.icoA11y2))}</li>
        <li>{prose(t(m.icoA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.icoUse1))}</li>
        <li>{prose(t(m.icoUse2))}</li>
        <li>{prose(t(m.icoUse3))}</li>
      </ul>
    </>
  );
}
