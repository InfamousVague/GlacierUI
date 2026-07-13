import { useState } from 'react';
import { SPEC_VERSION, cssValue, specs, type ComponentSpec, type Measure, type SizeSpec } from '@glacier/spec';
import { Pill, Row, Stack, Heading, Text, Size, TextTone, Tone, Variant, useT } from '@glacier/react';
import { HighlightedCode, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

// Render a measurement as its token reference plus what it resolves to.
function MeasureCell({ value }: { value?: Measure }) {
  if (!value) return <span style={{ color: 'var(--glacier-text-subtle)' }}>-</span>;
  const isToken = value.startsWith('$');
  return (
    <span>
      <code>{value}</code>
      {isToken && (
        <span style={{ color: 'var(--glacier-text-subtle)', marginLeft: 'var(--glacier-space-2)' }}>
          {cssValue(value)}
        </span>
      )}
    </span>
  );
}

const SIZE_ROWS: { key: keyof SizeSpec; label: string }[] = [
  { key: 'height', label: 'height' },
  { key: 'diameter', label: 'diameter' },
  { key: 'paddingInline', label: 'padding-inline' },
  { key: 'paddingBlock', label: 'padding-block' },
  { key: 'gap', label: 'gap' },
  { key: 'fontSize', label: 'font-size' },
  { key: 'radius', label: 'radius' },
  { key: 'thickness', label: 'thickness' },
  { key: 'border', label: 'border' },
];

function SpecView({ spec }: { spec: ComponentSpec }) {
  const t = useT();
  const sizeCols = spec.sizes ?? [];
  const usedRows = SIZE_ROWS.filter((row) => sizeCols.some((s) => s[row.key]));
  return (
    <Stack gap={6}>
      <Text style={{ margin: 0 }}>
        <strong>{spec.name}</strong> {spec.summary}
      </Text>
      <Row gap={3} wrap>
        <Pill tone={Tone.Accent} variant={Variant.Soft} size={Size.Small}>
          {spec.category}
        </Pill>
        <Pill tone={spec.status === 'stable' ? 'success' : 'warning'} variant={Variant.Soft} size={Size.Small}>
          {spec.status}
        </Pill>
        {spec.element && (
          <Pill tone={Tone.Neutral} variant={Variant.Outline} size={Size.Small}>
            &lt;{spec.element}&gt;
          </Pill>
        )}
      </Row>

      <div>
        <Heading level={3}>{t(m.secProps)}</Heading>
        <div className="propsTableWrap">
          <table className="tokenTable">
            <thead>
              <tr>
                <th>{t(m.tblProp)}</th>
                <th>{t(m.tblType)}</th>
                <th>{t(m.tblDefault)}</th>
                <th>{t(m.tblDescription)}</th>
              </tr>
            </thead>
            <tbody>
              {spec.props.map((prop) => (
                <tr key={prop.name}>
                  <td>
                    <code>{prop.name}</code>
                    {prop.required && <span style={{ color: 'var(--glacier-danger-text)' }}> *</span>}
                  </td>
                  <td>
                    {prop.type === 'enum' ? (
                      <code>{prop.values?.join(' | ')}</code>
                    ) : (
                      <code>{prop.type}</code>
                    )}
                  </td>
                  <td>{prop.default !== undefined ? <code>{String(prop.default)}</code> : '-'}</td>
                  <td>{prop.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(sizeCols.length > 0 || spec.dimensions) && (
        <div>
          <Heading level={3}>{t(m.secAnatomy)}</Heading>
          <Text tone={TextTone.Muted}>{t(m.spAnatomyIntro)}</Text>
          <ComponentBlueprint key={spec.id} specId={spec.id} />
        </div>
      )}

      {usedRows.length > 0 && (
        <div>
          <Heading level={3}>{t(m.spSecMeasurements)}</Heading>
          <Text tone={TextTone.Muted}>{t(m.spMeasurementsDesc)}</Text>
          <div className="propsTableWrap">
            <table className="tokenTable">
              <thead>
                <tr>
                  <th></th>
                  {sizeCols.map((s) => (
                    <th key={s.name}>{s.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usedRows.map((row) => (
                  <tr key={String(row.key)}>
                    <td>
                      <code>{row.label}</code>
                    </td>
                    {sizeCols.map((s) => (
                      <td key={s.name}>
                        <MeasureCell value={s[row.key] as Measure | undefined} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {spec.dimensions && (
        <div>
          <Heading level={3}>{t(m.spSecFixedDims)}</Heading>
          <div className="propsTableWrap">
            <table className="tokenTable">
              <tbody>
                {Object.entries(spec.dimensions).map(([key, value]) => (
                  <tr key={key}>
                    <td>
                      <code>{key}</code>
                    </td>
                    <td>
                      <MeasureCell value={value} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {spec.variants && (
        <div>
          <Heading level={3}>{t(m.secVariants)}</Heading>
          <Stack gap={2}>
            {spec.variants.map((v) => (
              <div key={v.name}>
                <code>{v.name}</code> <span style={{ color: 'var(--glacier-text-muted)' }}>{v.description}</span>
              </div>
            ))}
          </Stack>
        </div>
      )}

      {spec.tones && (
        <div>
          <Heading level={3}>{t(m.secTones)}</Heading>
          <Row gap={3} wrap>
            {spec.tones.map((toneItem) => (
              <Pill key={toneItem.name} tone={toneItem.name as never} variant={Variant.Soft} size={Size.Small}>
                {toneItem.name}
              </Pill>
            ))}
          </Row>
        </div>
      )}

      <div>
        <Heading level={3}>{t(m.spSecTokens)}</Heading>
        <Row gap={2} wrap>
          {(spec.tokens ?? []).map((token) => (
            <code key={token}>{token}</code>
          ))}
        </Row>
      </div>

      <div>
        <Heading level={3}>{t(m.spSecGeneratedJson)}</Heading>
        <Text tone={TextTone.Muted}>
          {t(m.spGeneratedJsonDesc1)}{' '}
          <code>packages/spec/dist/components/{spec.id}.json</code>{t(m.spGeneratedJsonDesc2)}
        </Text>
        <HighlightedCode code={JSON.stringify(spec, null, 2)} />
      </div>
    </Stack>
  );
}

const CATEGORY_ORDER = ['atom', 'molecule', 'organism', 'structure', 'layout'] as const;

// A grouped outline of every spec, so the whole catalog is scannable at a glance
// and one tap jumps to a component.
function SpecNav({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  const t = useT();
  const CATEGORY_LABEL: Record<string, string> = {
    atom: t(m.spCatAtoms),
    molecule: t(m.spCatMolecules),
    organism: t(m.spCatOrganisms),
    structure: t(m.spCatStructures),
    layout: t(m.spCatLayout),
  };
  return (
    <Stack gap={4} aria-label={t(m.spNavLabel)} as="nav">
      {CATEGORY_ORDER.map((category) => {
        const group = specs.filter((s) => s.category === category);
        if (group.length === 0) return null;
        return (
          <div key={category}>
            <div className="specNavHeading">
              {CATEGORY_LABEL[category]} <span>{group.length}</span>
            </div>
            <Row gap={2} wrap>
              {group.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="specChip"
                  data-active={s.id === activeId || undefined}
                  aria-pressed={s.id === activeId}
                  onClick={() => onSelect(s.id)}
                >
                  {s.name}
                </button>
              ))}
            </Row>
          </div>
        );
      })}
    </Stack>
  );
}

export function SpecPage() {
  const t = useT();
  const [id, setId] = useState(specs[0]!.id);
  const spec = specs.find((s) => s.id === id) ?? specs[0]!;

  return (
    <>
      <Heading level={1}>{t(m.spName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.spLede)}
      </Text>

      <Heading level={2}>{t(m.spSecHowItWorks)}</Heading>
      <ul>
        <li>{prose(t(m.spHow1))}</li>
        <li>{prose(t(m.spHow2))}</li>
        <li>{t(m.spHow3)}</li>
        <li>{t(m.spHow4)}</li>
      </ul>
      <Text tone={TextTone.Muted}>
        {t(m.spSchemaVersion)} <code>{SPEC_VERSION}</code>. {prose(t(m.spCatalogPaths))}
      </Text>

      <Heading level={2}>{t(m.spSecBrowse)}</Heading>
      <Stack gap={6}>
        <SpecNav activeId={id} onSelect={setId} />
        <SpecView spec={spec} />
      </Stack>
    </>
  );
}
